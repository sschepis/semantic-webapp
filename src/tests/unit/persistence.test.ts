/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { PersistenceManager } from '../../lib/network/persistence';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = vi.fn();

describe('PersistenceManager', () => {
  let graph: Graph;
  let manager: PersistenceManager;

  beforeEach(() => {
    graph = new Graph();
    manager = new PersistenceManager(graph);
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should save and load from local storage', async () => {
    // Create test data
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    graph.addEdge(node1.id, node2.id, 'relates');

    // Save to localStorage
    await manager.saveToLocalStorage('test-network', 'Test description');

    // Create new graph and manager
    const newGraph = new Graph();
    const newManager = new PersistenceManager(newGraph);

    // Load from localStorage
    await newManager.loadFromLocalStorage();

    // Verify loaded state
    const loadedData = newGraph.toJSON();
    expect(loadedData.nodes).toHaveLength(2);
    expect(loadedData.edges).toHaveLength(1);
  });

  it('should save to server', async () => {
    // Mock successful server response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'test-id' })
    });

    graph.addNode('Test Node', 'concept');
    await manager.saveToServer('test-network');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/network/state',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('should load from server', async () => {
    // Mock server response
    const mockState = {
      nodes: [{ id: 'test-id', label: 'Test Node', type: 'concept', properties: {} }],
      edges: [],
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        name: 'test-network'
      }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockState)
    });

    await manager.loadFromServer('test-id');

    expect(global.fetch).toHaveBeenCalledWith('/api/network/state/test-id');
    const loadedData = graph.toJSON();
    expect(loadedData.nodes).toHaveLength(1);
    expect(loadedData.nodes[0].label).toBe('Test Node');
  });

  it('should handle auto-save functionality', () => {
    vi.useFakeTimers();
    
    const autoSaveManager = new PersistenceManager(graph, {
      autoSave: true,
      saveInterval: 1000
    });

    // Add some data
    graph.addNode('Auto-save Node', 'concept');

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    // Check if data was saved
    const savedState = localStorage.getItem('quantum-network-state');
    expect(savedState).toBeDefined();
    expect(JSON.parse(savedState!).nodes).toHaveLength(1);

    autoSaveManager.stopAutoSave();
    vi.useRealTimers();
  });

  it('should validate network state on load', async () => {
    // Set invalid state in localStorage
    localStorage.setItem('quantum-network-state', JSON.stringify({
      nodes: 'invalid', // Should be an array
      edges: [],
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        name: 'test'
      }
    }));

    await expect(manager.loadFromLocalStorage()).rejects.toThrow('Invalid network state');
  });

  it('should handle file export and import', async () => {
    // Create test data
    graph.addNode('Export Test', 'concept');
    
    // Test export (mock file creation)
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
    
    manager.exportToFile('test.json');
    
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();

    // Test import
    const newGraph = new Graph();
    const newManager = new PersistenceManager(newGraph);
    
    const fileContent = JSON.stringify({
      nodes: [{ id: 'test', label: 'Import Test', type: 'concept', properties: {} }],
      edges: [],
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        name: 'test'
      }
    });
    
    const file = new File([fileContent], 'test.json', { type: 'application/json' });
    await newManager.importFromFile(file);
    
    const importedData = newGraph.toJSON();
    expect(importedData.nodes).toHaveLength(1);
    expect(importedData.nodes[0].label).toBe('Import Test');
  });
});

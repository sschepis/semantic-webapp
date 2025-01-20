import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';
import { SearchEngine } from '../../lib/search/engine';
import { Pattern } from '../../lib/analysis/patterns';

describe('SearchEngine', () => {
  it('should find states matching text query', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine();

    // Create test states
    const matchingNode = graph.addNode('Quantum Physics', 'concept', {
      field: 'physics',
      topic: 'quantum mechanics'
    });
    const partialMatchNode = graph.addNode('Classical Physics', 'concept', {
      field: 'physics'
    });
    const nonMatchingNode = graph.addNode('Biology', 'concept', {
      field: 'life sciences'
    });

    const states = [matchingNode, partialMatchNode, nonMatchingNode]
      .map(node => encoder.encodeNode(node));

    const results = engine.search({ text: 'quantum physics' }, states);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].state.sourceNode.id).toBe(matchingNode.id);
    expect(results[0].score).toBeGreaterThan(0.5);
    expect(results[0].matches[0].context).toContain('Quantum Physics');
  });

  it('should filter states based on properties', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine();

    const states = [
      graph.addNode('Node 1', 'concept', { weight: 0.8, category: 'A' }),
      graph.addNode('Node 2', 'concept', { weight: 0.4, category: 'B' }),
      graph.addNode('Node 3', 'concept', { weight: 0.9, category: 'A' })
    ].map(node => encoder.encodeNode(node));

    const results = engine.search({
      properties: {
        category: 'A',
        weight: 0.8
      }
    }, states);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].state.sourceNode.properties.category).toBe('A');
    expect(results[0].state.sourceNode.properties.weight).toBe(0.8);
  });

  it('should match quantum state patterns', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine();

    // Create states with specific quantum properties
    const states = [
      graph.addNode('High Amplitude', 'concept', { weight: 0.9 }),
      graph.addNode('Low Amplitude', 'concept', { weight: 0.2 }),
      graph.addNode('Medium Amplitude', 'concept', { weight: 0.5 })
    ].map(node => encoder.encodeNode(node));

    // Search for states similar to the high amplitude state
    const results = engine.search({
      statePattern: states[0]
    }, states);

    expect(results[0].state.sourceNode.id).toBe(states[0].sourceNode.id);
    expect(results[0].relevance.quantum).toBeGreaterThan(0.5);
  });

  it('should find states matching patterns', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine();

    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.7 });
    const node3 = graph.addNode('Node 3', 'concept', { weight: 0.6 });

    const states = [node1, node2, node3].map(node => encoder.encodeNode(node));

    const testPattern: Pattern = {
      type: 'cluster',
      states: [node1.id, node2.id],
      score: 0.9,
      properties: {
        coherence: 0.8,
        stability: 0.7
      },
      metadata: {
        timestamp: Date.now(),
        algorithm: 'test',
        parameters: {}
      }
    };

    const results = engine.search({
      patterns: [testPattern]
    }, states);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].state.sourceNode.id).toBe(node1.id);
    expect(results[0].relevance.structural).toBeGreaterThan(0);
  });

  it('should apply filters correctly', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine();

    const states = [
      graph.addNode('Node 1', 'type1', { coherence: 0.9 }),
      graph.addNode('Node 2', 'type2', { coherence: 0.5 }),
      graph.addNode('Node 3', 'type1', { coherence: 0.3 })
    ].map(node => encoder.encodeNode(node));

    const results = engine.search({
      filters: {
        types: ['type1'],
        minCoherence: 0.7
      }
    }, states);

    expect(results.length).toBe(1);
    expect(results[0].state.sourceNode.type).toBe('type1');
  });

  it('should respect maxResults limit', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine({
      maxResults: 2
    });

    const states = Array.from({ length: 5 }, (_, i) => 
      graph.addNode(`Node ${i}`, 'concept', { weight: 0.5 + i * 0.1 })
    ).map(node => encoder.encodeNode(node));

    const results = engine.search({
      text: 'Node'
    }, states);

    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should find similar states when requested', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine({
      includeSimilar: true,
      minScore: 0.3
    });

    // Create a group of similar states
    const states = Array.from({ length: 4 }, (_, i) => 
      graph.addNode(`Similar Node ${i}`, 'concept', { 
        weight: 0.8 + i * 0.05,
        category: 'group1'
      })
    ).map(node => encoder.encodeNode(node));

    // Add a different state
    states.push(encoder.encodeNode(
      graph.addNode('Different Node', 'concept', { 
        weight: 0.2,
        category: 'group2'
      })
    ));

    const results = engine.search({
      properties: { category: 'group1' }
    }, states);

    expect(results.length).toBeGreaterThan(1);
    expect(results.every(r => 
      r.state.sourceNode.properties.category === 'group1' ||
      r.matches.some(m => m.field === 'similarity')
    )).toBe(true);
  });

  it('should calculate meaningful relevance scores', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const engine = new SearchEngine();

    const node = graph.addNode('Test Node', 'concept', {
      weight: 0.8,
      category: 'physics'
    });
    const state = encoder.encodeNode(node);

    const results = engine.search({
      text: 'test physics',
      properties: { weight: 0.8 },
      statePattern: state
    }, [state]);

    expect(results[0].relevance).toMatchObject({
      semantic: expect.any(Number),
      quantum: expect.any(Number),
      structural: expect.any(Number)
    });

    expect(results[0].relevance.semantic).toBeGreaterThan(0);
    expect(results[0].relevance.quantum).toBeGreaterThan(0);
    expect(Object.values(results[0].relevance).every(v => v >= 0 && v <= 1)).toBe(true);
  });
});

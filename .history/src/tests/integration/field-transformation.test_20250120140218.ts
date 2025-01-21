import { describe, it, expect } from 'vitest';
import { QuantumField } from '../../lib/quantum/field';
import { QuantumNetwork, QuantumNode } from '../../types/quantum';

describe('Field Transformation Pipeline', () => {
  const FIELD_DIMENSIONS = 512;

  it('should transform quantum network to quantum field and back', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create test network
    const network: QuantumNetwork = {
      nodes: [
        {
          id: 'physics',
          label: 'Physics',
          connections: ['quantum'],
          group: 1
        },
        {
          id: 'quantum',
          label: 'Quantum',
          connections: ['physics'],
          group: 1
        }
      ],
      links: [{
        source: 'physics',
        target: 'quantum',
        strength: 0.8,
        probability: 0.9
      }],
      timestamp: Date.now()
    };
    
    // Transform to quantum states
    const states = field.encodeNetwork(network);
    expect(states).toHaveLength(2);
    
    // Verify quantum properties
    states.forEach(state => {
      expect(state).toBeInstanceOf(QuantumField);
      expect(state.coherence).toBeGreaterThan(0);
      expect(state.coherence).toBeLessThanOrEqual(1);
      expect(state.values).toHaveLength(FIELD_DIMENSIONS);
    });
    
    // Verify relationship encoding
    const coherence = field.calculateCoherence(states[0], states[1]);
    expect(coherence).toBeGreaterThan(0.5);
  });

  it('should maintain data consistency through transformation', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create test node
    const node: QuantumNode = {
      id: 'test',
      label: 'Test Node',
      connections: [],
      group: 1,
      probability: 0.75
    };
    
    // Transform to quantum state
    const state = field.encodeNode(node);
    
    // Decode back to quantum state
    const decoded = field.decodeState(state);
    
    // Verify property preservation
    expect(decoded.probability).toBeCloseTo(0.75, 2);
    expect(decoded.dimensions).toEqual([FIELD_DIMENSIONS]);
    expect(decoded.connections).toEqual([]);
  });

  it('should handle real-time updates to the network', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create initial network
    const network: QuantumNetwork = {
      nodes: [{
        id: 'node1',
        label: 'Node 1',
        connections: [],
        probability: 0.5
      }],
      links: [],
      timestamp: Date.now()
    };
    
    let states = field.encodeNetwork(network);
    expect(states).toHaveLength(1);
    
    // Add new node
    network.nodes.push({
      id: 'node2',
      label: 'Node 2',
      connections: ['node1'],
      probability: 0.7
    });
    
    network.links.push({
      source: 'node1',
      target: 'node2',
      strength: 0.8,
      probability: 0.7
    });
    
    states = field.encodeNetwork(network);
    expect(states).toHaveLength(2);
    
    // Verify new state properties
    const decoded = field.decodeState(states[1]);
    expect(decoded.probability).toBeCloseTo(0.7, 2);
  });

  it('should preserve network topology in quantum representation', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create network with star topology
    const network: QuantumNetwork = {
      nodes: [
        {
          id: 'center',
          label: 'Center',
          connections: ['node0', 'node1', 'node2'],
          probability: 1
        },
        ...Array.from({ length: 3 }, (_, i) => ({
          id: `node${i}`,
          label: `Node ${i}`,
          connections: ['center'],
          probability: 0.8
        }))
      ],
      links: Array.from({ length: 3 }, (_, i) => ({
        source: 'center',
        target: `node${i}`,
        strength: 0.8,
        probability: 0.8
      })),
      timestamp: Date.now()
    };
    
    // Transform to quantum states
    const states = field.encodeNetwork(network);
    const centerState = states[0];
    const nodeStates = states.slice(1);
    
    // Verify topology preservation
    nodeStates.forEach(nodeState => {
      const coherence = field.calculateCoherence(centerState, nodeState);
      expect(coherence).toBeGreaterThan(0.6);
    });
  });
});

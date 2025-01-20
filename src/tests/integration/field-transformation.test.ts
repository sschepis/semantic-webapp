import { describe, it, expect } from 'vitest';
import { SemanticNetwork } from '../../lib/semantic/network';
import { QuantumField } from '../../lib/quantum/field';
import { WaveFunction } from '../../lib/quantum/wavefunction';

describe('Field Transformation Pipeline', () => {
  it('should transform semantic network to quantum field and back', () => {
    const network = new SemanticNetwork();
    const field = new QuantumField();
    
    // Create test network
    const concept1 = network.createNode('physics', {
      type: 'concept',
      category: 'physics',
      weight: 0.8
    });
    
    const concept2 = network.createNode('quantum', {
      type: 'concept',
      category: 'physics',
      weight: 0.9
    });
    
    network.createEdge(concept1, concept2, 'related');
    
    // Transform to quantum states
    const states = field.encodeNetwork(network);
    expect(states).toHaveLength(2);
    
    // Verify quantum properties
    states.forEach(state => {
      expect(state).toBeInstanceOf(WaveFunction);
      expect(state.getAmplitude()).toBeGreaterThan(0);
      expect(state.getAmplitude()).toBeLessThanOrEqual(1);
      expect(state.getDimensions()).toHaveLength(512);
    });
    
    // Verify relationship encoding
    const coherence = field.calculateCoherence(states[0], states[1]);
    expect(coherence).toBeGreaterThan(0.5);
  });

  it('should maintain data consistency through transformation', () => {
    const network = new SemanticNetwork();
    const field = new QuantumField();
    
    // Create node with specific properties
    const node = network.createNode('test', {
      type: 'concept',
      category: 'physics',
      weight: 0.75,
      metadata: {
        description: 'Test concept',
        tags: ['physics', 'quantum']
      }
    });
    
    // Transform to quantum state
    const state = field.encodeNode(node);
    
    // Decode back to semantic properties
    const decoded = field.decodeState(state);
    
    // Verify property preservation
    expect(decoded.type).toBe('concept');
    expect(decoded.category).toBe('physics');
    expect(decoded.weight).toBeCloseTo(0.75, 2);
  });

  it('should handle real-time updates to the network', () => {
    const network = new SemanticNetwork();
    const field = new QuantumField();
    
    // Initial network
    const node1 = network.createNode('concept1', { weight: 0.5 });
    let states = field.encodeNetwork(network);
    
    // Add new node and verify update
    const node2 = network.createNode('concept2', { weight: 0.7 });
    network.createEdge(node1, node2, 'related');
    
    states = field.encodeNetwork(network);
    expect(states).toHaveLength(2);
    
    // Verify new state properties
    const newState = states[1];
    expect(newState.getAmplitude()).toBeCloseTo(0.7, 2);
  });

  it('should preserve network topology in quantum representation', () => {
    const network = new SemanticNetwork();
    const field = new QuantumField();
    
    // Create network with specific topology
    const center = network.createNode('center', { weight: 1 });
    const nodes = Array.from({ length: 3 }, (_, i) => 
      network.createNode(`node${i}`, { weight: 0.8 })
    );
    
    // Create star topology
    nodes.forEach(node => network.createEdge(center, node, 'connected'));
    
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

import { describe, it, expect } from 'vitest';
import { QuantumField } from '../../lib/quantum/field';
import { QuantumNetwork, QuantumNode } from '../../types/quantum';

describe('Semantic Network Integration', () => {
  const FIELD_DIMENSIONS = 512;

  it('should convert nodes to quantum states', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create test network
    const network: QuantumNetwork = {
      nodes: [
        {
          id: 'concept1',
          label: 'Entity',
          connections: ['concept2'],
          group: 1
        },
        {
          id: 'concept2',
          label: 'Relation',
          connections: ['concept1'],
          group: 2
        }
      ],
      links: [{
        source: 'concept1',
        target: 'concept2',
        strength: 0.8,
        probability: 0.9
      }],
      timestamp: Date.now()
    };
    
    // Convert to quantum states
    const states = field.encodeNetwork(network);
    
    expect(states).toHaveLength(2);
    expect(states[0]).toBeInstanceOf(QuantumField);
    expect(states[1]).toBeInstanceOf(QuantumField);
    
    // Verify quantum properties
    const decoded = field.decodeState(states[0]);
    expect(decoded.amplitude).toBeGreaterThan(0);
    expect(decoded.phase).toBeDefined();
    expect(decoded.dimensions).toEqual([FIELD_DIMENSIONS]);
  });

  it('should maintain relationship coherence in quantum encoding', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create network with varying relationship strengths
    const network: QuantumNetwork = {
      nodes: [
        {
          id: 'concept1',
          label: 'Concept 1',
          connections: ['concept2']
        },
        {
          id: 'concept2',
          label: 'Concept 2',
          connections: ['concept1', 'concept3']
        },
        {
          id: 'concept3',
          label: 'Concept 3',
          connections: ['concept2']
        }
      ],
      links: [
        {
          source: 'concept1',
          target: 'concept2',
          strength: 0.9,  // strong relation
          probability: 0.9
        },
        {
          source: 'concept2',
          target: 'concept3',
          strength: 0.3,  // weak relation
          probability: 0.3
        }
      ],
      timestamp: Date.now()
    };
    
    // Convert to quantum states
    const states = field.encodeNetwork(network);
    
    // Check coherence reflects relationship strength
    const coherence12 = field.calculateCoherence(states[0], states[1]);
    const coherence23 = field.calculateCoherence(states[1], states[2]);
    
    expect(coherence12).toBeGreaterThan(coherence23);
  });

  it('should preserve node properties in quantum transformation', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create test node
    const node: QuantumNode = {
      id: 'test',
      label: 'Test Node',
      connections: [],
      group: 1,
      probability: 0.8
    };
    
    // Convert to quantum state
    const state = field.encodeNode(node);
    
    // Decode back to quantum state
    const decoded = field.decodeState(state);
    
    expect(decoded.probability).toBeCloseTo(0.8, 2);
    expect(decoded.dimensions).toEqual([FIELD_DIMENSIONS]);
    expect(decoded.connections).toEqual([]);
  });

  it('should handle real-time network updates', () => {
    const field = new QuantumField(FIELD_DIMENSIONS);
    
    // Create initial network
    const network: QuantumNetwork = {
      nodes: [{
        id: 'concept1',
        label: 'Concept 1',
        connections: []
      }],
      links: [],
      timestamp: Date.now()
    };
    
    let states = field.encodeNetwork(network);
    expect(states).toHaveLength(1);
    
    // Add new node and connection
    network.nodes.push({
      id: 'concept2',
      label: 'Concept 2',
      connections: ['concept1']
    });
    
    network.links.push({
      source: 'concept1',
      target: 'concept2',
      strength: 0.8,
      probability: 0.8
    });
    
    // Update quantum states
    states = field.encodeNetwork(network);
    expect(states).toHaveLength(2);
    
    // Verify new state properties
    const decoded = field.decodeState(states[1]);
    expect(decoded.connections).toEqual(['concept1']);
  });
});

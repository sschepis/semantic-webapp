import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';
import { QuantumTransformer } from '../../lib/quantum/transformer';

describe('QuantumTransformer', () => {
  it('should apply phase rotation transformation', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const transformer = new QuantumTransformer();
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const state = encoder.encodeNode(node);
    
    const angle = Math.PI / 4; // 45 degrees
    const result = transformer.applyPhaseRotation(state, angle);
    
    expect(result.transformationType).toBe('phase-rotation');
    expect(result.parameters.phaseShift).toBe(angle);
    expect(result.metrics.fidelity).toBeLessThan(1); // Phase rotation should change fidelity
    expect(result.metrics.coherence).toBeGreaterThan(0); // But maintain some coherence
  });

  it('should apply amplitude modulation', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const transformer = new QuantumTransformer();
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.5 });
    const state = encoder.encodeNode(node);
    
    const scale = 1.5;
    const result = transformer.applyAmplitudeModulation(state, scale);
    
    expect(result.transformationType).toBe('amplitude-modulation');
    expect(result.transformedState.waveFunction.getAmplitude())
      .toBeCloseTo(Math.min(1, state.waveFunction.getAmplitude() * scale));
    expect(result.metrics.fidelity).toBeLessThan(1);
  });

  it('should apply dimension projection', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const transformer = new QuantumTransformer();
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const state = encoder.encodeNode(node);
    
    // Create mask that zeros out half the dimensions
    const mask = Array(512).fill(true).map((_, i) => i % 2 === 0);
    const result = transformer.applyDimensionProjection(state, mask);
    
    expect(result.transformationType).toBe('dimension-projection');
    
    // Verify zeroed dimensions
    const dimensions = result.transformedState.waveFunction.getDimensions();
    dimensions.forEach((dim, i) => {
      if (!mask[i]) {
        expect(dim.real).toBe(0);
        expect(dim.imag).toBe(0);
      }
    });
  });

  it('should apply coherence filtering', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const transformer = new QuantumTransformer();
    
    // Create connected nodes
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.7 });
    const node3 = graph.addNode('Node 3', 'concept', { weight: 0.3 });
    
    graph.addEdge(node1.id, node2.id, 'strong-relation', 0.9);
    graph.addEdge(node1.id, node3.id, 'weak-relation', 0.2);
    
    // Encode states
    const states = encoder.encodeGraph(graph);
    
    // Apply filtering with high threshold
    const threshold = 0.7;
    const results = transformer.applyCoherenceFiltering(states, threshold);
    
    expect(results).toHaveLength(states.length);
    
    // The strongly related nodes should maintain their connection
    const filteredState1 = results.find(r => r.originalState.sourceNode.id === node1.id);
    expect(filteredState1?.transformedState.connections).toContain(node2.id);
    expect(filteredState1?.transformedState.connections).not.toContain(node3.id);
  });

  it('should apply harmonic enhancement', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const transformer = new QuantumTransformer();
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const state = encoder.encodeNode(node);
    
    // Enhance certain harmonics
    const weights = [2.0, 1.5, 1.0, 0.5, 0.25, 0.125, 0.0625, 0.03125];
    const result = transformer.applyHarmonicEnhancement(state, weights);
    
    expect(result.transformationType).toBe('harmonic-enhancement');
    expect(result.parameters.harmonicWeights).toEqual(weights);
    expect(result.metrics.fidelity).toBeLessThan(1); // Harmonic enhancement should change fidelity
  });

  it('should maintain quantum state validity after transformations', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const transformer = new QuantumTransformer();
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const state = encoder.encodeNode(node);
    
    // Apply multiple transformations
    const rotated = transformer.applyPhaseRotation(state, Math.PI / 3);
    const modulated = transformer.applyAmplitudeModulation(rotated.transformedState, 0.75);
    
    // Verify quantum properties are maintained
    const finalState = modulated.transformedState;
    expect(finalState.waveFunction.getAmplitude()).toBeGreaterThanOrEqual(0);
    expect(finalState.waveFunction.getAmplitude()).toBeLessThanOrEqual(1);
    expect(finalState.waveFunction.getPhase()).toBeGreaterThanOrEqual(0);
    expect(finalState.waveFunction.getPhase()).toBeLessThanOrEqual(2 * Math.PI);
  });

  it('should calculate meaningful transformation metrics', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const transformer = new QuantumTransformer();
    
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.7 });
    graph.addEdge(node1.id, node2.id, 'relates', 0.9);
    
    const states = encoder.encodeGraph(graph);
    const state = states[0];
    
    const result = transformer.applyPhaseRotation(state, Math.PI / 4);
    
    expect(result.metrics.fidelity).toBeGreaterThan(0);
    expect(result.metrics.fidelity).toBeLessThanOrEqual(1);
    expect(result.metrics.coherence).toBeGreaterThan(0);
    expect(result.metrics.coherence).toBeLessThanOrEqual(1);
    expect(result.metrics.entanglement).toBeGreaterThanOrEqual(0);
    expect(result.metrics.entanglement).toBeLessThanOrEqual(1);
  });
});

import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';

describe('QuantumEncoder', () => {
  it('should encode a single node into quantum state', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    
    const node = graph.addNode('Test Node', 'concept', {
      weight: 0.8,
      category: 'physics',
      importance: 0.9
    });
    
    const encodedState = encoder.encodeNode(node);
    
    expect(encodedState.waveFunction).toBeDefined();
    expect(encodedState.sourceNode).toBe(node);
    expect(encodedState.connections).toHaveLength(0);
    expect(encodedState.metadata.encodingType).toBe('semantic-quantum');
    
    // Verify quantum properties
    expect(encodedState.waveFunction.getAmplitude()).toBeCloseTo(0.8);
    expect(encodedState.waveFunction.getPhase()).toBeGreaterThanOrEqual(0);
    expect(encodedState.waveFunction.getPhase()).toBeLessThanOrEqual(2 * Math.PI);
    expect(encodedState.waveFunction.getDimensions()).toHaveLength(512);
  });

  it('should encode a graph with relationships', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.7 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.6 });
    graph.addEdge(node1.id, node2.id, 'relates', 0.8);
    
    const encodedStates = encoder.encodeGraph(graph);
    
    expect(encodedStates).toHaveLength(2);
    
    // Verify connections were encoded
    const state1 = encodedStates.find(s => s.sourceNode.id === node1.id);
    const state2 = encodedStates.find(s => s.sourceNode.id === node2.id);
    
    expect(state1?.connections).toContain(node2.id);
    expect(state2?.connections).toContain(node1.id);
  });

  it('should encode node properties into quantum dimensions', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    
    const node = graph.addNode('Test Node', 'concept', {
      numericProp: 0.5,
      booleanProp: true,
      stringProp: 'test'
    });
    
    const encodedState = encoder.encodeNode(node);
    const dimensions = encodedState.waveFunction.getDimensions();
    
    // Verify dimensions contain encoded properties
    const nonZeroDimensions = dimensions.filter(d => 
      d.real !== 0 || d.imag !== 0
    );
    
    expect(nonZeroDimensions.length).toBeGreaterThan(0);
  });

  it('should create phase entanglement between related nodes', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    graph.addEdge(node1.id, node2.id, 'strongly-related', 1.0);
    
    const encodedStates = encoder.encodeGraph(graph);
    const state1 = encodedStates.find(s => s.sourceNode.id === node1.id)!;
    const state2 = encodedStates.find(s => s.sourceNode.id === node2.id)!;
    
    // Check for phase correlation in shared dimensions
    const dimensions1 = state1.waveFunction.getDimensions();
    const dimensions2 = state2.waveFunction.getDimensions();
    
    let phaseCorrelation = 0;
    for (let i = 0; i < dimensions1.length; i++) {
      const phase1 = Math.atan2(dimensions1[i].imag, dimensions1[i].real);
      const phase2 = Math.atan2(dimensions2[i].imag, dimensions2[i].real);
      if (!isNaN(phase1) && !isNaN(phase2)) {
        phaseCorrelation += Math.cos(phase1 - phase2);
      }
    }
    phaseCorrelation /= dimensions1.length;
    
    expect(Math.abs(phaseCorrelation)).toBeGreaterThan(0.5);
  });

  it('should handle different encoding options', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder({
      dimensionality: 256,
      phaseResolution: 180,
      amplitudeScale: 0.5
    });
    
    const node = graph.addNode('Test Node', 'concept', { weight: 1.0 });
    const encodedState = encoder.encodeNode(node);
    
    expect(encodedState.waveFunction.getDimensions()).toHaveLength(256);
    expect(encodedState.waveFunction.getAmplitude()).toBeCloseTo(0.5); // Due to amplitudeScale
    expect(encodedState.metadata.parameters.phaseResolution).toBe(180);
  });

  it('should maintain consistent encoding for identical inputs', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    
    const node1 = graph.addNode('Node', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node', 'concept', { weight: 0.8 });
    
    const state1 = encoder.encodeNode(node1);
    const state2 = encoder.encodeNode(node2);
    
    // Compare quantum properties
    expect(state1.waveFunction.getAmplitude()).toBeCloseTo(state2.waveFunction.getAmplitude());
    expect(state1.waveFunction.getPhase()).toBeCloseTo(state2.waveFunction.getPhase());
    
    // Compare some dimensions
    const dims1 = state1.waveFunction.getDimensions();
    const dims2 = state2.waveFunction.getDimensions();
    
    expect(dims1[0].real).toBeCloseTo(dims2[0].real);
    expect(dims1[0].imag).toBeCloseTo(dims2[0].imag);
  });
});

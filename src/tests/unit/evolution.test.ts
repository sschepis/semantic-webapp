import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';
import { QuantumEvolution } from '../../lib/quantum/evolution';

describe('QuantumEvolution', () => {
  it('should evolve a single quantum state', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 1.0
    });
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const initialState = encoder.encodeNode(node);
    
    // Add a harmonic oscillator operator
    const harmonicOperator = QuantumEvolution.createHarmonicOperator(2.0, 0.5);
    evolution.options.operators = [harmonicOperator];
    
    const timeSteps = evolution.evolveState(initialState);
    
    expect(timeSteps.length).toBeGreaterThan(0);
    expect(timeSteps[0].time).toBe(0);
    expect(timeSteps[timeSteps.length - 1].time).toBeCloseTo(1.0);
    
    // Verify state properties are maintained
    timeSteps.forEach(step => {
      const state = step.states[0];
      expect(state.waveFunction.getAmplitude()).toBeGreaterThanOrEqual(0);
      expect(state.waveFunction.getAmplitude()).toBeLessThanOrEqual(1);
      expect(state.waveFunction.getDimensions()).toHaveLength(512);
    });
  });

  it('should evolve multiple interacting states', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 1.0,
      preserveConnections: true
    });
    
    // Create connected nodes
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.7 });
    graph.addEdge(node1.id, node2.id, 'relates', 0.9);
    
    const initialStates = encoder.encodeGraph(graph);
    
    // Add phase evolution operator
    const phaseOperator = QuantumEvolution.createPhaseEvolutionOperator(1.0);
    evolution.options.operators = [phaseOperator];
    
    const timeSteps = evolution.evolveStates(initialStates);
    
    // Verify entanglement effects
    timeSteps.forEach(step => {
      expect(step.metrics.averageCoherence).toBeGreaterThan(0);
      expect(step.metrics.entanglementEntropy).toBeGreaterThan(0);
    });
  });

  it('should apply dissipation operator correctly', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 1.0
    });
    
    const node = graph.addNode('Test Node', 'concept', { weight: 1.0 });
    const initialState = encoder.encodeNode(node);
    
    // Add dissipation operator
    const dissipationOperator = QuantumEvolution.createDissipationOperator(0.5);
    evolution.options.operators = [dissipationOperator];
    
    const timeSteps = evolution.evolveState(initialState);
    
    // Verify energy decreases over time
    const energies = timeSteps.map(step => step.metrics.totalEnergy);
    for (let i = 1; i < energies.length; i++) {
      expect(energies[i]).toBeLessThan(energies[i - 1]);
    }
  });

  it('should track system metrics correctly', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 1.0,
      trackMetrics: true
    });
    
    // Create multiple connected nodes
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.7 });
    const node3 = graph.addNode('Node 3', 'concept', { weight: 0.6 });
    
    graph.addEdge(node1.id, node2.id, 'relates', 0.9);
    graph.addEdge(node2.id, node3.id, 'relates', 0.8);
    
    const initialStates = encoder.encodeGraph(graph);
    
    // Add multiple operators
    evolution.options.operators = [
      QuantumEvolution.createHarmonicOperator(1.0, 0.3),
      QuantumEvolution.createPhaseEvolutionOperator(0.5)
    ];
    
    const timeSteps = evolution.evolveStates(initialStates);
    
    timeSteps.forEach(step => {
      expect(step.metrics).toHaveProperty('totalEnergy');
      expect(step.metrics).toHaveProperty('averageCoherence');
      expect(step.metrics).toHaveProperty('entanglementEntropy');
      
      expect(step.metrics.totalEnergy).toBeGreaterThan(0);
      expect(step.metrics.averageCoherence).toBeGreaterThanOrEqual(0);
      expect(step.metrics.averageCoherence).toBeLessThanOrEqual(1);
      expect(step.metrics.entanglementEntropy).toBeGreaterThanOrEqual(0);
    });
  });

  it('should maintain quantum state validity throughout evolution', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 1.0
    });
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const initialState = encoder.encodeNode(node);
    
    // Add multiple operators
    evolution.options.operators = [
      QuantumEvolution.createHarmonicOperator(2.0, 0.4),
      QuantumEvolution.createPhaseEvolutionOperator(1.5),
      QuantumEvolution.createDissipationOperator(0.1)
    ];
    
    const timeSteps = evolution.evolveState(initialState);
    
    // Verify quantum properties are maintained
    timeSteps.forEach(step => {
      const state = step.states[0];
      const dimensions = state.waveFunction.getDimensions();
      
      // Check normalization
      let totalProbability = 0;
      dimensions.forEach(dim => {
        totalProbability += dim.real * dim.real + dim.imag * dim.imag;
      });
      expect(totalProbability).toBeCloseTo(1, 1);
      
      // Check phase validity
      dimensions.forEach(dim => {
        const phase = Math.atan2(dim.imag, dim.real);
        expect(phase).toBeGreaterThanOrEqual(-Math.PI);
        expect(phase).toBeLessThanOrEqual(Math.PI);
      });
    });
  });
});

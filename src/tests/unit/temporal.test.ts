import { describe, it, expect } from 'vitest';
import { TemporalAnalyzer } from '../../lib/analysis/temporal';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';
import { QuantumEvolution } from '../../lib/quantum/evolution';

describe('TemporalAnalyzer', () => {
  it('should detect oscillation patterns', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 5.0
    });
    
    // Create a node with oscillating properties
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const initialState = encoder.encodeNode(node);
    
    // Add harmonic oscillator
    evolution.setOperators([
      QuantumEvolution.createHarmonicOperator(2.0, 0.5)
    ]);
    
    const timeSteps = evolution.evolveState(initialState);
    
    const analyzer = new TemporalAnalyzer({
      minPatternDuration: 0.5,
      amplitudeThreshold: 0.1
    });
    
    const patterns = analyzer.analyzeTimeSeries(timeSteps);
    
    const oscillations = patterns.filter(p => p.type === 'oscillation');
    expect(oscillations.length).toBeGreaterThan(0);
    expect(oscillations[0].frequency).toBeCloseTo(2.0, 1);
    expect(oscillations[0].confidence).toBeGreaterThan(0.5);
  });

  it('should detect exponential decay patterns', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 3.0
    });
    
    const node = graph.addNode('Test Node', 'concept', { weight: 1.0 });
    const initialState = encoder.encodeNode(node);
    
    // Add dissipation operator
    evolution.setOperators([
      QuantumEvolution.createDissipationOperator(0.5)
    ]);
    
    const timeSteps = evolution.evolveState(initialState);
    
    const analyzer = new TemporalAnalyzer();
    const patterns = analyzer.analyzeTimeSeries(timeSteps);
    
    const decays = patterns.filter(p => p.type === 'decay');
    expect(decays.length).toBeGreaterThan(0);
    expect(decays[0].rate).toBeGreaterThan(0);
    expect(decays[0].confidence).toBeGreaterThan(0.7);
  });

  it('should detect phase shift patterns', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 2.0
    });
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const initialState = encoder.encodeNode(node);
    
    // Add phase evolution operator
    evolution.setOperators([
      QuantumEvolution.createPhaseEvolutionOperator(Math.PI)
    ]);
    
    const timeSteps = evolution.evolveState(initialState);
    
    const analyzer = new TemporalAnalyzer();
    const patterns = analyzer.analyzeTimeSeries(timeSteps);
    
    const phaseShifts = patterns.filter(p => p.type === 'phase-shift');
    expect(phaseShifts.length).toBeGreaterThan(0);
    expect(phaseShifts[0].amplitude).toBeGreaterThan(0);
    expect(phaseShifts[0].metrics.coherence).toBeGreaterThan(0);
  });

  it('should detect entanglement patterns between states', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 2.0,
      preserveConnections: true
    });
    
    // Create connected nodes
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.7 });
    graph.addEdge(node1.id, node2.id, 'entangled', 0.9);
    
    const initialStates = encoder.encodeGraph(graph);
    
    // Add operators that create entanglement
    evolution.setOperators([
      QuantumEvolution.createPhaseEvolutionOperator(1.0),
      QuantumEvolution.createHarmonicOperator(0.5, 0.3)
    ]);
    
    const timeSteps = evolution.evolveStates(initialStates);
    
    const analyzer = new TemporalAnalyzer();
    const patterns = analyzer.analyzeTimeSeries(timeSteps);
    
    const entanglements = patterns.filter(p => p.type === 'entanglement');
    expect(entanglements.length).toBeGreaterThan(0);
    expect(entanglements[0].affectedStates).toHaveLength(2);
    expect(entanglements[0].metrics.coherence).toBeGreaterThan(0);
  });

  it('should track pattern stability over time', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 4.0
    });
    
    const node = graph.addNode('Test Node', 'concept', { weight: 0.8 });
    const initialState = encoder.encodeNode(node);
    
    // Add multiple operators to create complex dynamics
    evolution.setOperators([
      QuantumEvolution.createHarmonicOperator(1.0, 0.3),
      QuantumEvolution.createDissipationOperator(0.1)
    ]);
    
    const timeSteps = evolution.evolveState(initialState);
    
    const analyzer = new TemporalAnalyzer();
    const patterns = analyzer.analyzeTimeSeries(timeSteps);
    
    patterns.forEach(pattern => {
      expect(pattern.metrics.stability).toBeGreaterThanOrEqual(0);
      expect(pattern.metrics.stability).toBeLessThanOrEqual(1);
      expect(pattern.confidence).toBeGreaterThanOrEqual(0);
      expect(pattern.confidence).toBeLessThanOrEqual(1);
    });
  });

  it('should limit number of detected patterns', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const evolution = new QuantumEvolution({
      timeStep: 0.1,
      totalTime: 5.0
    });
    
    // Create multiple nodes with different dynamics
    const nodes = Array.from({ length: 5 }, (_, i) => 
      graph.addNode(`Node ${i}`, 'concept', { weight: 0.5 + i * 0.1 })
    );
    
    const initialStates = nodes.map(node => encoder.encodeNode(node));
    
    // Add multiple operators to create various patterns
    evolution.setOperators([
      QuantumEvolution.createHarmonicOperator(1.0, 0.3),
      QuantumEvolution.createPhaseEvolutionOperator(0.5),
      QuantumEvolution.createDissipationOperator(0.1)
    ]);
    
    const timeSteps = evolution.evolveStates(initialStates);
    
    const analyzer = new TemporalAnalyzer({
      maxPatterns: 3
    });
    
    const patterns = analyzer.analyzeTimeSeries(timeSteps);
    
    expect(patterns.length).toBeLessThanOrEqual(3);
    // Patterns should be sorted by confidence
    for (let i = 1; i < patterns.length; i++) {
      expect(patterns[i].confidence).toBeLessThanOrEqual(patterns[i - 1].confidence);
    }
  });
});

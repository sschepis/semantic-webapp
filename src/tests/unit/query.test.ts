import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';
import { QuantumQueryProcessor, QuantumQuery } from '../../lib/query/processor';

describe('QuantumQueryProcessor', () => {
  it('should create superposition states', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const processor = new QuantumQueryProcessor();

    // Create test states
    const states = [
      graph.addNode('State 1', 'quantum', { weight: 0.8 }),
      graph.addNode('State 2', 'quantum', { weight: 0.6 })
    ].map(node => encoder.encodeNode(node));

    const searchResults = states.map(state => ({
      state,
      score: 1,
      matches: [],
      relevance: { semantic: 1, quantum: 1, structural: 1 }
    }));

    const query: QuantumQuery = {
      type: 'superposition' as const,
      states: states.map(s => s.sourceNode.id),
      parameters: {
        weights: [0.7, 0.3],
        phases: [0, Math.PI / 2]
      }
    };

    const result = processor.processQuery(query, searchResults);

    expect(result.states).toHaveLength(1);
    expect(result.states[0].waveFunction).toBeDefined();
    expect(result.measurements).toBeDefined();
    expect(result.metrics.fidelity).toBeGreaterThan(0);
  });

  it('should create entangled states', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const processor = new QuantumQueryProcessor();

    // Create test states
    const states = [
      graph.addNode('State 1', 'quantum', { weight: 0.8 }),
      graph.addNode('State 2', 'quantum', { weight: 0.8 })
    ].map(node => encoder.encodeNode(node));

    const searchResults = states.map(state => ({
      state,
      score: 1,
      matches: [],
      relevance: { semantic: 1, quantum: 1, structural: 1 }
    }));

    const query: QuantumQuery = {
      type: 'entanglement' as const,
      states: states.map(s => s.sourceNode.id),
      parameters: {}
    };

    const result = processor.processQuery(query, searchResults);

    expect(result.states).toHaveLength(2);
    expect(result.metrics.entanglement).toBeGreaterThan(0);
    expect(result.measurements).toBeDefined();
  });

  it('should apply interference between states', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const processor = new QuantumQueryProcessor();

    // Create test states
    const states = [
      graph.addNode('State 1', 'quantum', { weight: 0.7 }),
      graph.addNode('State 2', 'quantum', { weight: 0.7 })
    ].map(node => encoder.encodeNode(node));

    const searchResults = states.map(state => ({
      state,
      score: 1,
      matches: [],
      relevance: { semantic: 1, quantum: 1, structural: 1 }
    }));

    const query: QuantumQuery = {
      type: 'interference' as const,
      states: states.map(s => s.sourceNode.id),
      parameters: {
        operators: ['hadamard', 'phase']
      }
    };

    const result = processor.processQuery(query, searchResults);

    expect(result.states).toHaveLength(1);
    expect(result.measurements.length).toBeGreaterThan(0);
    expect(result.metrics.coherence).toBeGreaterThan(0);
  });

  it('should perform measurements in different bases', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const processor = new QuantumQueryProcessor();

    // Create test state
    const state = encoder.encodeNode(
      graph.addNode('Test State', 'quantum', { weight: 0.9 })
    );

    const searchResults = [{
      state,
      score: 1,
      matches: [],
      relevance: { semantic: 1, quantum: 1, structural: 1 }
    }];

    const query: QuantumQuery = {
      type: 'measurement' as const,
      states: [state.sourceNode.id],
      parameters: {
        bases: ['computational', 'diagonal', 'circular']
      }
    };

    const result = processor.processQuery(query, searchResults);

    expect(result.measurements).toBeDefined();
    expect(result.measurements.length).toBeGreaterThan(0);
    
    // Check measurements in each basis
    const bases = new Set(result.measurements.map(m => m.basis));
    expect(bases.has('computational')).toBe(true);
    expect(bases.has('diagonal')).toBe(true);
    expect(bases.has('circular')).toBe(true);

    // Verify probabilities sum to approximately 1 for each basis
    ['computational', 'diagonal', 'circular'].forEach(basis => {
      const basisMeasurements = result.measurements.filter(m => m.basis === basis);
      const totalProbability = basisMeasurements.reduce((sum, m) => sum + m.probability, 0);
      expect(totalProbability).toBeCloseTo(1, 1);
    });
  });

  it('should handle quantum operators correctly', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const processor = new QuantumQueryProcessor();

    const state = encoder.encodeNode(
      graph.addNode('Test State', 'quantum', { weight: 1.0 })
    );

    const searchResults = [{
      state,
      score: 1,
      matches: [],
      relevance: { semantic: 1, quantum: 1, structural: 1 }
    }];

    // Test Hadamard operator
    const hadamardQuery: QuantumQuery = {
      type: 'interference' as const,
      states: [state.sourceNode.id],
      parameters: { operators: ['hadamard'] }
    };

    const hadamardResult = processor.processQuery(hadamardQuery, searchResults);
    expect(hadamardResult.states[0].waveFunction).toBeDefined();
    expect(hadamardResult.metrics.fidelity).toBeLessThan(1); // Should change the state

    // Test Phase operator
    const phaseQuery: QuantumQuery = {
      type: 'interference' as const,
      states: [state.sourceNode.id],
      parameters: { operators: ['phase'] }
    };

    const phaseResult = processor.processQuery(phaseQuery, searchResults);
    expect(phaseResult.states[0].waveFunction).toBeDefined();
    expect(phaseResult.metrics.coherence).toBeGreaterThan(0);

    // Test NOT operator
    const notQuery: QuantumQuery = {
      type: 'interference' as const,
      states: [state.sourceNode.id],
      parameters: { operators: ['not'] }
    };

    const notResult = processor.processQuery(notQuery, searchResults);
    expect(notResult.states[0].waveFunction).toBeDefined();
    expect(notResult.metrics.fidelity).toBeLessThan(1); // Should flip the state
  });

  it('should respect processor options', () => {
    const processor = new QuantumQueryProcessor({
      maxStates: 2,
      decoherenceRate: 0.05
    });

    const graph = new Graph();
    const encoder = new QuantumEncoder();

    // Create more states than maxStates
    const states = Array.from({ length: 4 }, (_, i) => 
      encoder.encodeNode(graph.addNode(`State ${i}`, 'quantum', { weight: 0.8 }))
    );

    const searchResults = states.map(state => ({
      state,
      score: 1,
      matches: [],
      relevance: { semantic: 1, quantum: 1, structural: 1 }
    }));

    const query: QuantumQuery = {
      type: 'superposition' as const,
      states: states.map(s => s.sourceNode.id),
      parameters: {}
    };

    const result = processor.processQuery(query, searchResults);

    // Should only use maxStates number of states
    expect(result.states[0].connections.length).toBeLessThanOrEqual(2);
  });

  it('should calculate meaningful metrics', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const processor = new QuantumQueryProcessor();

    // Create entangled states
    const states = [
      graph.addNode('State 1', 'quantum', { weight: 0.8 }),
      graph.addNode('State 2', 'quantum', { weight: 0.8 })
    ].map(node => encoder.encodeNode(node));

    graph.addEdge(states[0].sourceNode.id, states[1].sourceNode.id, 'entangled', 1.0);

    const searchResults = states.map(state => ({
      state,
      score: 1,
      matches: [],
      relevance: { semantic: 1, quantum: 1, structural: 1 }
    }));

    const query: QuantumQuery = {
      type: 'entanglement' as const,
      states: states.map(s => s.sourceNode.id),
      parameters: {}
    };

    const result = processor.processQuery(query, searchResults);

    expect(result.metrics).toMatchObject({
      fidelity: expect.any(Number),
      coherence: expect.any(Number),
      entanglement: expect.any(Number)
    });

    expect(result.metrics.fidelity).toBeGreaterThan(0);
    expect(result.metrics.fidelity).toBeLessThanOrEqual(1);
    expect(result.metrics.coherence).toBeGreaterThan(0);
    expect(result.metrics.coherence).toBeLessThanOrEqual(1);
    expect(result.metrics.entanglement).toBeGreaterThan(0);
    expect(result.metrics.entanglement).toBeLessThanOrEqual(1);
  });
});

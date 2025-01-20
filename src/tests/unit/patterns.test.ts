import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';
import { PatternDetector } from '../../lib/analysis/patterns';

describe('PatternDetector', () => {
  it('should detect clusters in quantum states', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const detector = new PatternDetector({
      minClusterSize: 2,
      similarityThreshold: 0.6
    });

    // Create a cluster of similar states
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.75 });
    const node3 = graph.addNode('Node 3', 'concept', { weight: 0.85 });
    const outlier = graph.addNode('Outlier', 'concept', { weight: 0.2 });

    graph.addEdge(node1.id, node2.id, 'similar', 0.9);
    graph.addEdge(node2.id, node3.id, 'similar', 0.8);
    graph.addEdge(node1.id, node3.id, 'similar', 0.85);

    const states = [node1, node2, node3, outlier].map(node => encoder.encodeNode(node));
    const patterns = detector.detectPatterns(states);

    const clusters = patterns.filter(p => p.type === 'cluster');
    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters[0].states).toHaveLength(3); // Should find the cluster of 3 similar nodes
    expect(clusters[0].score).toBeGreaterThan(0.5);
  });

  it('should detect sequential patterns', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const detector = new PatternDetector();

    // Create a sequence of states with gradual changes
    const states = Array.from({ length: 5 }, (_, i) => {
      const weight = 0.5 + i * 0.1;
      const node = graph.addNode(`Node ${i}`, 'concept', { weight });
      if (i > 0) {
        graph.addEdge(`Node ${i-1}`, node.id, 'next', 0.9);
      }
      return encoder.encodeNode(node);
    });

    const patterns = detector.detectPatterns(states);
    const sequences = patterns.filter(p => p.type === 'sequence');

    expect(sequences.length).toBeGreaterThan(0);
    expect(sequences[0].states.length).toBeGreaterThan(2);
    expect(sequences[0].properties.coherence).toBeGreaterThan(0);
  });

  it('should detect similar state groups', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const detector = new PatternDetector({
      similarityThreshold: 0.8
    });

    // Create groups of similar states
    const group1 = Array.from({ length: 3 }, (_, i) => 
      graph.addNode(`Group1_${i}`, 'concept', { weight: 0.8 + i * 0.02 })
    );
    const group2 = Array.from({ length: 3 }, (_, i) => 
      graph.addNode(`Group2_${i}`, 'concept', { weight: 0.3 + i * 0.02 })
    );

    // Add connections within groups
    group1.forEach((node, i) => {
      if (i > 0) graph.addEdge(group1[i-1].id, node.id, 'similar', 0.9);
    });
    group2.forEach((node, i) => {
      if (i > 0) graph.addEdge(group2[i-1].id, node.id, 'similar', 0.9);
    });

    const states = [...group1, ...group2].map(node => encoder.encodeNode(node));
    const patterns = detector.detectPatterns(states);

    const similarities = patterns.filter(p => p.type === 'similarity');
    expect(similarities.length).toBeGreaterThan(0);
    expect(similarities[0].score).toBeGreaterThan(0.7);
  });

  it('should detect anomalous states', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const detector = new PatternDetector();

    // Create a set of normal states
    const normalStates = Array.from({ length: 5 }, (_, i) => 
      graph.addNode(`Normal_${i}`, 'concept', { weight: 0.7 + i * 0.02 })
    );

    // Create an anomalous state
    const anomaly = graph.addNode('Anomaly', 'concept', { weight: 0.1 });

    // Add typical connections between normal states
    normalStates.forEach((node, i) => {
      if (i > 0) {
        graph.addEdge(normalStates[i-1].id, node.id, 'relates', 0.8);
      }
    });

    const states = [...normalStates, anomaly].map(node => encoder.encodeNode(node));
    const patterns = detector.detectPatterns(states);

    const anomalies = patterns.filter(p => p.type === 'anomaly');
    expect(anomalies.length).toBeGreaterThan(0);
    expect(anomalies[0].states).toContain(anomaly.id);
    expect(anomalies[0].properties.significance).toBeGreaterThan(0.5);
  });

  it('should respect maxPatterns limit', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const detector = new PatternDetector({
      maxPatterns: 3
    });

    // Create multiple distinct groups to generate many patterns
    const groups = Array.from({ length: 4 }, (_, groupIndex) => 
      Array.from({ length: 3 }, (_, i) => 
        graph.addNode(`Group${groupIndex}_${i}`, 'concept', { 
          weight: 0.2 + groupIndex * 0.2 + i * 0.02 
        })
      )
    );

    // Add connections within groups
    groups.forEach(group => {
      group.forEach((node, i) => {
        if (i > 0) graph.addEdge(group[i-1].id, node.id, 'relates', 0.9);
      });
    });

    const states = groups.flat().map(node => encoder.encodeNode(node));
    const patterns = detector.detectPatterns(states);

    expect(patterns.length).toBeLessThanOrEqual(3);
    // Verify patterns are sorted by score in descending order
    for (let i = 1; i < patterns.length; i++) {
      expect(patterns[i].score).toBeLessThanOrEqual(patterns[i - 1].score);
    }
  });

  it('should calculate meaningful pattern properties', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const detector = new PatternDetector();

    // Create a well-defined cluster
    const clusterNodes = Array.from({ length: 4 }, (_, i) => 
      graph.addNode(`Cluster_${i}`, 'concept', { weight: 0.8 + i * 0.05 })
    );

    // Create dense connections
    clusterNodes.forEach((node1, i) => {
      clusterNodes.forEach((node2, j) => {
        if (i < j) {
          graph.addEdge(node1.id, node2.id, 'relates', 0.9);
        }
      });
    });

    const states = clusterNodes.map(node => encoder.encodeNode(node));
    const patterns = detector.detectPatterns(states);

    const cluster = patterns.find(p => p.type === 'cluster');
    expect(cluster).toBeDefined();
    expect(cluster?.properties).toMatchObject({
      size: expect.any(Number),
      density: expect.any(Number),
      coherence: expect.any(Number),
      stability: expect.any(Number)
    });

    expect(cluster?.properties.coherence).toBeGreaterThan(0.7);
    expect(cluster?.properties.stability).toBeGreaterThan(0.7);
    expect(cluster?.properties.density).toBeGreaterThan(0);
  });
});

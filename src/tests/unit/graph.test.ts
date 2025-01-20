import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';

describe('Graph', () => {
  it('should create nodes and edges', () => {
    const graph = new Graph();
    
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.6 });
    
    expect(node1.label).toBe('Node 1');
    expect(node2.label).toBe('Node 2');
    
    const edge = graph.addEdge(node1.id, node2.id, 'relates', 0.7);
    expect(edge.source).toBe(node1.id);
    expect(edge.target).toBe(node2.id);
    expect(edge.weight).toBe(0.7);
  });

  it('should find node neighbors', () => {
    const graph = new Graph();
    
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    const node3 = graph.addNode('Node 3', 'concept');
    
    graph.addEdge(node1.id, node2.id, 'relates');
    graph.addEdge(node1.id, node3.id, 'relates');
    
    const neighbors = graph.getNodeNeighbors(node1.id);
    expect(neighbors).toHaveLength(2);
    expect(neighbors.map(n => n.label)).toContain('Node 2');
    expect(neighbors.map(n => n.label)).toContain('Node 3');
  });

  it('should remove nodes and connected edges', () => {
    const graph = new Graph();
    
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    const edge = graph.addEdge(node1.id, node2.id, 'relates');
    
    graph.removeNode(node1.id);
    
    expect(graph.getNode(node1.id)).toBeUndefined();
    expect(graph.getEdge(edge.id)).toBeUndefined();
    expect(graph.getNode(node2.id)).toBeDefined();
  });

  it('should update node positions', () => {
    const graph = new Graph();
    
    const node = graph.addNode('Node 1', 'concept');
    graph.updateNodePosition(node.id, 100, 200);
    
    const updatedNode = graph.getNode(node.id);
    expect(updatedNode?.position?.x).toBe(100);
    expect(updatedNode?.position?.y).toBe(200);
  });

  it('should calculate shortest path', () => {
    const graph = new Graph();
    
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    const node3 = graph.addNode('Node 3', 'concept');
    const node4 = graph.addNode('Node 4', 'concept');
    
    graph.addEdge(node1.id, node2.id, 'relates');
    graph.addEdge(node2.id, node3.id, 'relates');
    graph.addEdge(node3.id, node4.id, 'relates');
    
    const path = graph.getShortestPath(node1.id, node4.id);
    expect(path).toHaveLength(4);
    expect(path[0].id).toBe(node1.id);
    expect(path[3].id).toBe(node4.id);
  });

  it('should serialize and deserialize graph data', () => {
    const graph = new Graph();
    
    const node1 = graph.addNode('Node 1', 'concept', { weight: 0.8 });
    const node2 = graph.addNode('Node 2', 'concept', { weight: 0.6 });
    graph.addEdge(node1.id, node2.id, 'relates', 0.7);
    
    const data = graph.toJSON();
    
    const newGraph = new Graph();
    newGraph.fromJSON(data);
    
    expect(newGraph.getNode(node1.id)?.label).toBe('Node 1');
    expect(newGraph.getNode(node2.id)?.label).toBe('Node 2');
    expect(newGraph.getNodeNeighbors(node1.id)).toHaveLength(1);
  });
});

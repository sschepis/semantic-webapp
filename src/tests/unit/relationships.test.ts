import { describe, it, expect } from 'vitest';
import { Graph } from '../../lib/network/graph';
import { RelationshipManager } from '../../lib/network/relationships';

describe('RelationshipManager', () => {
  it('should analyze relationships between nodes', () => {
    const graph = new Graph();
    const manager = new RelationshipManager(graph);
    
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    const node3 = graph.addNode('Node 3', 'concept');
    
    graph.addEdge(node1.id, node2.id, 'relates', 0.8);
    graph.addEdge(node2.id, node3.id, 'relates', 0.6);
    graph.addEdge(node1.id, node3.id, 'relates', 0.4);
    
    const metrics = manager.analyzeRelationships(node1.id);
    expect(metrics).toHaveLength(2);
    expect(metrics[0]).toHaveProperty('strength');
    expect(metrics[0]).toHaveProperty('similarity');
    expect(metrics[0]).toHaveProperty('reciprocity');
  });

  it('should find relationship patterns', () => {
    const graph = new Graph();
    const manager = new RelationshipManager(graph);
    
    const concept1 = graph.addNode('Concept 1', 'concept');
    const concept2 = graph.addNode('Concept 2', 'concept');
    const entity1 = graph.addNode('Entity 1', 'entity');
    
    graph.addEdge(concept1.id, concept2.id, 'similar', 0.9);
    graph.addEdge(concept1.id, entity1.id, 'describes', 0.7);
    graph.addEdge(concept2.id, entity1.id, 'describes', 0.6);
    
    const patterns = manager.findRelationshipPatterns();
    expect(patterns).toHaveLength(2); // 'similar' and 'describes' patterns
    
    const describesPattern = patterns.find(p => p.relationType === 'describes');
    expect(describesPattern?.frequency).toBe(2);
    expect(describesPattern?.sourceType).toBe('concept');
    expect(describesPattern?.targetType).toBe('entity');
  });

  it('should suggest relationships based on patterns', () => {
    const graph = new Graph();
    const manager = new RelationshipManager(graph);
    
    // Create a pattern of concepts being related to entities
    const concept1 = graph.addNode('Concept 1', 'concept');
    const concept2 = graph.addNode('Concept 2', 'concept');
    const entity1 = graph.addNode('Entity 1', 'entity');
    const entity2 = graph.addNode('Entity 2', 'entity'); // Potential suggestion
    
    graph.addEdge(concept1.id, entity1.id, 'describes', 0.8);
    
    const suggestions = manager.suggestRelationships(concept2.id);
    expect(suggestions).toContainEqual(expect.objectContaining({
      id: entity2.id,
      type: 'entity'
    }));
  });

  it('should find common neighbors between nodes', () => {
    const graph = new Graph();
    const manager = new RelationshipManager(graph);
    
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    const common = graph.addNode('Common', 'concept');
    
    graph.addEdge(node1.id, common.id, 'relates');
    graph.addEdge(node2.id, common.id, 'relates');
    
    const commonNeighbors = manager.getCommonNeighbors(node1.id, node2.id);
    expect(commonNeighbors).toHaveLength(1);
    expect(commonNeighbors[0].id).toBe(common.id);
  });

  it('should identify strongest relationships', () => {
    const graph = new Graph();
    const manager = new RelationshipManager(graph);
    
    const center = graph.addNode('Center', 'concept');
    const strong = graph.addNode('Strong', 'concept');
    const medium = graph.addNode('Medium', 'concept');
    const weak = graph.addNode('Weak', 'concept');
    
    graph.addEdge(center.id, strong.id, 'relates', 0.9);
    graph.addEdge(center.id, medium.id, 'relates', 0.6);
    graph.addEdge(center.id, weak.id, 'relates', 0.3);
    
    const strongest = manager.getStrongestRelationships(center.id, 2);
    expect(strongest).toHaveLength(2);
    expect(strongest[0].weight).toBe(0.9);
    expect(strongest[1].weight).toBe(0.6);
  });

  it('should get all relationship types', () => {
    const graph = new Graph();
    const manager = new RelationshipManager(graph);
    
    const node1 = graph.addNode('Node 1', 'concept');
    const node2 = graph.addNode('Node 2', 'concept');
    
    graph.addEdge(node1.id, node2.id, 'similar');
    graph.addEdge(node1.id, node2.id, 'relates');
    
    const types = manager.getRelationshipTypes();
    expect(types).toContain('similar');
    expect(types).toContain('relates');
    expect(types).toHaveLength(2);
  });
});

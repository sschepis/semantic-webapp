import { Graph, GraphNode, GraphEdge } from './graph';

export interface RelationshipPattern {
  sourceType: string;
  targetType: string;
  relationType: string;
  frequency: number;
  averageWeight: number;
}

export interface RelationshipMetrics {
  strength: number;
  similarity: number;
  reciprocity: number;
}

export class RelationshipManager {
  constructor(private graph: Graph) {}

  analyzeRelationships(nodeId: string): RelationshipMetrics[] {
    this.graph.getNodeEdges(nodeId);
    const neighbors = this.graph.getNodeNeighbors(nodeId);
    
    return neighbors.map(neighbor => {
      const metrics = this.calculateRelationshipMetrics(nodeId, neighbor.id);
      return metrics;
    });
  }

  findRelationshipPatterns(): RelationshipPattern[] {
    const patterns = new Map<string, RelationshipPattern>();
    
    // Analyze all edges to find patterns
    const data = this.graph.toJSON();
    data.edges.forEach(edge => {
      const sourceNode = this.graph.getNode(edge.source);
      const targetNode = this.graph.getNode(edge.target);
      
      if (!sourceNode || !targetNode) return;
      
      const patternKey = `${sourceNode.type}-${edge.type}-${targetNode.type}`;
      const existing = patterns.get(patternKey);
      
      if (existing) {
        existing.frequency += 1;
        existing.averageWeight = (existing.averageWeight * (existing.frequency - 1) + edge.weight) / existing.frequency;
      } else {
        patterns.set(patternKey, {
          sourceType: sourceNode.type,
          targetType: targetNode.type,
          relationType: edge.type,
          frequency: 1,
          averageWeight: edge.weight
        });
      }
    });
    
    return Array.from(patterns.values());
  }

  suggestRelationships(nodeId: string): GraphNode[] {
    const patterns = this.findRelationshipPatterns();
    const sourceNode = this.graph.getNode(nodeId);
    
    if (!sourceNode) return [];
    
    const suggestions = new Set<GraphNode>();
    const data = this.graph.toJSON();
    
    // Find nodes that match common patterns
    patterns
      .filter(pattern => pattern.sourceType === sourceNode.type)
      .forEach(pattern => {
        data.nodes
          .filter(node => 
            node.type === pattern.targetType && 
            !this.hasDirectConnection(nodeId, node.id)
          )
          .forEach(node => {
            const existingNode = this.graph.getNode(node.id);
            if (existingNode) {
              suggestions.add(existingNode);
            }
          });
      });
    
    return Array.from(suggestions);
  }

  private calculateRelationshipMetrics(sourceId: string, targetId: string): RelationshipMetrics {
    const sourceEdges = this.graph.getNodeEdges(sourceId);
    this.graph.getNodeEdges(targetId);
    
    // Calculate relationship strength based on edge weights
    const directEdges = sourceEdges.filter(edge => 
      (edge.source === sourceId && edge.target === targetId) ||
      (edge.source === targetId && edge.target === sourceId)
    );
    
    const strength = directEdges.reduce((sum, edge) => sum + edge.weight, 0) / directEdges.length;
    
    // Calculate similarity based on common neighbors
    const sourceNeighbors = new Set(this.graph.getNodeNeighbors(sourceId).map(n => n.id));
    const targetNeighbors = new Set(this.graph.getNodeNeighbors(targetId).map(n => n.id));
    
    const commonNeighbors = new Set([...sourceNeighbors].filter(x => targetNeighbors.has(x)));
    const similarity = commonNeighbors.size / Math.sqrt(sourceNeighbors.size * targetNeighbors.size);
    
    // Calculate reciprocity (bi-directional relationships)
    const reciprocalEdges = directEdges.filter(edge => 
      directEdges.some(e => 
        e.source === edge.target && 
        e.target === edge.source
      )
    );
    
    const reciprocity = reciprocalEdges.length / directEdges.length;
    
    return {
      strength,
      similarity,
      reciprocity
    };
  }

  private hasDirectConnection(sourceId: string, targetId: string): boolean {
    const edges = this.graph.getNodeEdges(sourceId);
    return edges.some(edge => 
      (edge.source === sourceId && edge.target === targetId) ||
      (edge.source === targetId && edge.target === sourceId)
    );
  }

  // Additional utility methods
  getCommonNeighbors(node1Id: string, node2Id: string): GraphNode[] {
    const neighbors1 = new Set(this.graph.getNodeNeighbors(node1Id).map(n => n.id));
    const neighbors2 = this.graph.getNodeNeighbors(node2Id);
    
    return neighbors2.filter(n => neighbors1.has(n.id));
  }

  getRelationshipTypes(): string[] {
    const types = new Set<string>();
    const data = this.graph.toJSON();
    
    data.edges.forEach(edge => types.add(edge.type));
    return Array.from(types);
  }

  getStrongestRelationships(nodeId: string, limit = 5): GraphEdge[] {
    return this.graph.getNodeEdges(nodeId)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }
}

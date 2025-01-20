import { v4 as uuidv4 } from 'uuid';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, unknown>;
  position?: {
    x: number;
    y: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  properties: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class Graph {
  private nodes: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(label: string, type: string, properties: Record<string, unknown> = {}): GraphNode {
    const node: GraphNode = {
      id: uuidv4(),
      label,
      type,
      properties,
    };
    this.nodes.set(node.id, node);
    return node;
  }

  addEdge(source: string, target: string, type: string, weight = 1.0, properties: Record<string, unknown> = {}): GraphEdge {
    if (!this.nodes.has(source) || !this.nodes.has(target)) {
      throw new Error('Source or target node does not exist');
    }

    const edge: GraphEdge = {
      id: uuidv4(),
      source,
      target,
      type,
      weight,
      properties,
    };
    this.edges.set(edge.id, edge);
    return edge;
  }

  removeNode(id: string): void {
    // Remove all edges connected to this node
    for (const [edgeId, edge] of this.edges) {
      if (edge.source === id || edge.target === id) {
        this.edges.delete(edgeId);
      }
    }
    this.nodes.delete(id);
  }

  removeEdge(id: string): void {
    this.edges.delete(id);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  getNodeNeighbors(id: string): GraphNode[] {
    const neighbors: GraphNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.source === id) {
        const targetNode = this.nodes.get(edge.target);
        if (targetNode) neighbors.push(targetNode);
      } else if (edge.target === id) {
        const sourceNode = this.nodes.get(edge.source);
        if (sourceNode) neighbors.push(sourceNode);
      }
    }
    return neighbors;
  }

  getNodeEdges(id: string): GraphEdge[] {
    return Array.from(this.edges.values()).filter(
      edge => edge.source === id || edge.target === id
    );
  }

  updateNodePosition(id: string, x: number, y: number): void {
    const node = this.nodes.get(id);
    if (node) {
      node.position = { x, y };
    }
  }

  updateEdgeWeight(id: string, weight: number): void {
    const edge = this.edges.get(id);
    if (edge) {
      edge.weight = Math.max(0, Math.min(1, weight)); // Clamp between 0 and 1
    }
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }

  toJSON(): GraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  fromJSON(data: GraphData): void {
    this.clear();
    data.nodes.forEach(node => {
      this.nodes.set(node.id, node);
    });
    data.edges.forEach(edge => {
      this.edges.set(edge.id, edge);
    });
  }

  // Graph analysis methods
  getNodeDegree(id: string): number {
    return this.getNodeEdges(id).length;
  }

  getAverageNodeDegree(): number {
    const degrees = Array.from(this.nodes.keys()).map(id => this.getNodeDegree(id));
    return degrees.reduce((sum, degree) => sum + degree, 0) / degrees.length;
  }

  getShortestPath(sourceId: string, targetId: string): GraphNode[] {
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set(this.nodes.keys());

    distances.set(sourceId, 0);

    while (unvisited.size > 0) {
      let current: string | null = null;
      let shortestDistance = Infinity;

      // Find unvisited node with shortest distance
      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId) ?? Infinity;
        if (distance < shortestDistance) {
          shortestDistance = distance;
          current = nodeId;
        }
      }

      if (current === null || current === targetId) break;

      unvisited.delete(current);

      // Update distances to neighbors
      const neighbors = this.getNodeNeighbors(current);
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor.id)) continue;

        const distance = (distances.get(current) ?? Infinity) + 1;
        if (distance < (distances.get(neighbor.id) ?? Infinity)) {
          distances.set(neighbor.id, distance);
          previous.set(neighbor.id, current);
        }
      }
    }

    // Reconstruct path
    const path: GraphNode[] = [];
    let current = targetId;
    while (current !== sourceId) {
      const node = this.nodes.get(current);
      if (!node) break;
      path.unshift(node);
      const prev = previous.get(current);
      if (!prev) break;
      current = prev;
    }
    const sourceNode = this.nodes.get(sourceId);
    if (sourceNode) path.unshift(sourceNode);

    return path;
  }
}

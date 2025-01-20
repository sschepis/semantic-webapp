/* eslint-disable @typescript-eslint/no-explicit-any */
interface Node {
  id: string;
  properties: Record<string, any>;
}

interface Edge {
  source: Node;
  target: Node;
  type: string;
}

export class SemanticNetwork {
  private nodes: Map<string, Node>;
  private edges: Edge[];

  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  createNode(id: string, properties: Record<string, any> = {}): Node {
    const node = { id, properties };
    this.nodes.set(id, node);
    return node;
  }

  createEdge(source: Node, target: Node, type: string): Edge {
    const edge = { source, target, type };
    this.edges.push(edge);
    return edge;
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  getEdges(node: Node): Edge[] {
    return this.edges.filter(
      edge => edge.source === node || edge.target === node
    );
  }

  getConnectedNodes(node: Node): Node[] {
    return this.getEdges(node).map(edge => 
      edge.source === node ? edge.target : edge.source
    );
  }

  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): Edge[] {
    return this.edges;
  }
}

import { Graph, GraphData } from './graph';

export interface PersistenceOptions {
  storageKey?: string;
  apiEndpoint?: string;
  autoSave?: boolean;
  saveInterval?: number;
}

export interface NetworkState extends GraphData {
  metadata: {
    version: string;
    timestamp: number;
    name: string;
    description?: string;
    tags?: string[];
  };
}

export class PersistenceManager {
  private graph: Graph;
  private options: Required<PersistenceOptions>;
  private autoSaveInterval?: number;

  constructor(graph: Graph, options: PersistenceOptions = {}) {
    this.graph = graph;
    this.options = {
      storageKey: 'quantum-network-state',
      apiEndpoint: '/api/network/state',
      autoSave: false,
      saveInterval: 60000, // 1 minute
      ...options
    };

    if (this.options.autoSave) {
      this.startAutoSave();
    }
  }

  async saveToLocalStorage(name: string, description?: string, tags?: string[]): Promise<void> {
    const state = this.createNetworkState(name, description, tags);
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
      throw new Error('Failed to save network state to local storage');
    }
  }

  async loadFromLocalStorage(): Promise<void> {
    try {
      const stateJson = localStorage.getItem(this.options.storageKey);
      if (!stateJson) {
        throw new Error('No saved state found in local storage');
      }

      const state = JSON.parse(stateJson) as NetworkState;
      this.validateNetworkState(state);
      this.graph.fromJSON(state);
    } catch (error) {
      console.error('Failed to load from local storage:', error);
      throw new Error('Failed to load network state from local storage');
    }
  }

  async saveToServer(name: string, description?: string, tags?: string[]): Promise<void> {
    const state = this.createNetworkState(name, description, tags);
    try {
      const response = await fetch(this.options.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to save to server:', error);
      throw new Error('Failed to save network state to server');
    }
  }

  async loadFromServer(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/${id}`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const state = await response.json() as NetworkState;
      this.validateNetworkState(state);
      this.graph.fromJSON(state);
    } catch (error) {
      console.error('Failed to load from server:', error);
      throw new Error('Failed to load network state from server');
    }
  }

  async listSavedStates(): Promise<NetworkState[]> {
    try {
      const response = await fetch(this.options.apiEndpoint);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const states = await response.json() as NetworkState[];
      return states;
    } catch (error) {
      console.error('Failed to list saved states:', error);
      throw new Error('Failed to retrieve list of saved network states');
    }
  }

  startAutoSave(): void {
    if (this.autoSaveInterval) {
      return;
    }

    this.autoSaveInterval = window.setInterval(() => {
      this.saveToLocalStorage('autosave', 'Automatically saved network state')
        .catch(error => console.error('Auto-save failed:', error));
    }, this.options.saveInterval);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = undefined;
    }
  }

  exportToFile(filename: string): void {
    const state = this.createNetworkState('export');
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async importFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const state = JSON.parse(text) as NetworkState;
      this.validateNetworkState(state);
      this.graph.fromJSON(state);
    } catch (error) {
      console.error('Failed to import file:', error);
      throw new Error('Failed to import network state from file');
    }
  }

  private createNetworkState(name: string, description?: string, tags?: string[]): NetworkState {
    return {
      ...this.graph.toJSON(),
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        name,
        description,
        tags
      }
    };
  }

  private validateNetworkState(state: NetworkState): void {
    if (!state.metadata || !state.metadata.version || !state.metadata.timestamp) {
      throw new Error('Invalid network state: missing metadata');
    }

    if (!state.nodes || !Array.isArray(state.nodes)) {
      throw new Error('Invalid network state: missing or invalid nodes');
    }

    if (!state.edges || !Array.isArray(state.edges)) {
      throw new Error('Invalid network state: missing or invalid edges');
    }
  }
}

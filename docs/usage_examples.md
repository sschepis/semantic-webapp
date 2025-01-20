# Usage Examples: Quantum Semantic Fields System

This guide provides practical examples of how to use the Quantum Semantic Fields system for common use cases.

## Table of Contents
1. [Basic Setup](#basic-setup)
2. [Working with Quantum States](#working-with-quantum-states)
3. [Network Operations](#network-operations)
4. [Search and Query](#search-and-query)
5. [Pattern Analysis](#pattern-analysis)
6. [Visualization](#visualization)
7. [Advanced Use Cases](#advanced-use-cases)

## Basic Setup

### Initialize Core Components
```typescript
import { Graph } from '../lib/network/graph';
import { QuantumEncoder } from '../lib/quantum/encoder';
import { SearchEngine } from '../lib/search/engine';
import { QuantumQueryProcessor } from '../lib/query/processor';

// Initialize core components
const graph = new Graph();
const encoder = new QuantumEncoder({
  dimensionality: 512,
  phaseResolution: 360,
  amplitudeScale: 1.0,
  coherenceThreshold: 0.5
});
const searchEngine = new SearchEngine();
const queryProcessor = new QuantumQueryProcessor();
```

### Create and Encode Nodes
```typescript
// Create semantic nodes
const node1 = graph.addNode('Quantum Physics', 'concept', {
  field: 'physics',
  importance: 0.9,
  keywords: ['quantum', 'physics', 'mechanics']
});

const node2 = graph.addNode('Wave Function', 'concept', {
  field: 'physics',
  importance: 0.8,
  keywords: ['wave', 'function', 'quantum']
});

// Create relationship
graph.addEdge(node1.id, node2.id, 'related', 0.8);

// Encode nodes to quantum states
const state1 = encoder.encodeNode(node1);
const state2 = encoder.encodeNode(node2);
```

## Working with Quantum States

### Superposition States
```typescript
// Create superposition of states
const query: QuantumQuery = {
  type: 'superposition',
  states: [state1.sourceNode.id, state2.sourceNode.id],
  parameters: {
    weights: [0.7, 0.3],
    phases: [0, Math.PI / 4]
  }
};

const result = queryProcessor.processQuery(query, [
  { state: state1, score: 1, matches: [], relevance: { semantic: 1, quantum: 1, structural: 1 } },
  { state: state2, score: 1, matches: [], relevance: { semantic: 1, quantum: 1, structural: 1 } }
]);

console.log('Superposition metrics:', result.metrics);
```

### Quantum Evolution
```typescript
import { QuantumField } from '../lib/quantum/field';

const field = new QuantumField();

// Apply harmonic operator
const evolvedState = field.applyOperator(state1, {
  type: 'harmonic',
  parameters: {
    frequency: 1.0,
    amplitude: 0.5
  }
});

// Time evolution
const timeEvolvedState = field.evolveState(state1, 0.1); // Evolve for t=0.1
```

## Network Operations

### Building Semantic Networks
```typescript
// Create a semantic network
const network = new Graph();

// Add multiple nodes
const nodes = [
  { label: 'Mathematics', type: 'field', properties: { level: 'advanced' } },
  { label: 'Algebra', type: 'subject', properties: { level: 'intermediate' } },
  { label: 'Calculus', type: 'subject', properties: { level: 'advanced' } }
];

const createdNodes = nodes.map(n => 
  network.addNode(n.label, n.type, n.properties)
);

// Create relationships
createdNodes.forEach((node, i) => {
  if (i > 0) {
    network.addEdge(createdNodes[0].id, node.id, 'includes', 0.9);
  }
});

// Encode entire network
const encodedStates = encoder.encodeGraph(network);
```

### State Persistence
```typescript
import { StatePersistence } from '../lib/network/persistence';

const persistence = new StatePersistence({
  format: 'json',
  compression: true
});

// Save states
await persistence.saveState(state1, 'quantum_physics');
await persistence.saveState(state2, 'wave_function');

// Load states
const loadedState = await persistence.loadState('quantum_physics');

// List all saved states
const savedStates = await persistence.listStates();
```

## Search and Query

### Basic Search
```typescript
// Perform semantic search
const searchResults = searchEngine.search({
  text: 'quantum mechanics',
  filters: {
    types: ['concept'],
    minCoherence: 0.5
  }
}, encodedStates);

console.log('Search results:', 
  searchResults.map(r => ({
    label: r.state.sourceNode.label,
    score: r.score
  }))
);
```

### Complex Queries
```typescript
// Entanglement query
const entanglementQuery: QuantumQuery = {
  type: 'entanglement',
  states: [state1.sourceNode.id, state2.sourceNode.id],
  parameters: {
    operators: ['phase']
  }
};

const entanglementResult = queryProcessor.processQuery(
  entanglementQuery,
  searchResults
);

// Interference query
const interferenceQuery: QuantumQuery = {
  type: 'interference',
  states: [state1.sourceNode.id, state2.sourceNode.id],
  parameters: {
    operators: ['hadamard']
  }
};

const interferenceResult = queryProcessor.processQuery(
  interferenceQuery,
  searchResults
);
```

## Pattern Analysis

### Temporal Pattern Detection
```typescript
import { TemporalAnalyzer } from '../lib/analysis/temporal';

const analyzer = new TemporalAnalyzer();

// Create time series data
const timeSteps = [
  {
    time: 0,
    states: [state1, state2],
    metrics: {
      averageCoherence: 0.8,
      entanglementEntropy: 0.3
    }
  },
  // ... more time steps
];

// Analyze patterns
const patterns = analyzer.analyzeTimeSeries(timeSteps);
const oscillations = analyzer.detectOscillations(timeSteps);
const correlations = analyzer.calculateCorrelations(timeSteps);
```

### Pattern Detection
```typescript
import { PatternDetector } from '../lib/analysis/patterns';

const detector = new PatternDetector();

// Detect patterns in states
const patterns = detector.detectPatterns(encodedStates);

// Find similar states
const similarStates = detector.findSimilarStates(state1, encodedStates);

// Calculate similarity
const similarity = detector.calculateSimilarity(state1, state2);
```

## Visualization

### State Visualization
```typescript
import { StateVisualizer } from '../lib/visualization/state-visualizer';

// Create visualizer
const canvas = document.getElementById('stateCanvas') as HTMLCanvasElement;
const visualizer = new StateVisualizer(canvas, {
  width: 800,
  height: 600,
  colorScheme: 'spectrum',
  showPhases: true,
  showAmplitudes: true,
  animate: true
});

// Visualize state
visualizer.visualizeState(state1);

// Start animation
visualizer.startAnimation();

// Clean up
visualizer.dispose();
```

### Result Visualization
```typescript
import { ResultVisualizer } from '../lib/visualization/results';

// Create visualizer
const canvas = document.getElementById('resultCanvas') as HTMLCanvasElement;
const resultVisualizer = new ResultVisualizer(canvas, {
  width: 800,
  height: 600,
  colorScheme: 'default',
  showProbabilities: true,
  showPhases: true,
  showMetrics: true,
  animate: true,
  layout: 'force'
});

// Visualize query result
resultVisualizer.visualizeResult(queryResult);

// Configure viewport
resultVisualizer.setViewport({
  scale: 1.2,
  translateX: 100,
  translateY: 50,
  rotation: Math.PI / 6
});

// Start animation
resultVisualizer.startAnimation(queryResult);
```

## Advanced Use Cases

### Custom Operator Implementation
```typescript
class CustomOperator implements FieldOperator {
  type = 'custom';
  parameters = {
    strength: 0.5,
    phase: Math.PI / 4
  };

  apply(state: EncodedState): EncodedState {
    const newState = { ...state };
    const waveFunction = state.waveFunction.clone();
    
    // Custom quantum operation logic
    waveFunction.getDimensions().forEach((dim, i) => {
      const phase = this.parameters.phase * i / waveFunction.size;
      const amplitude = dim.magnitude() * this.parameters.strength;
      waveFunction.setDimension(i, 
        Complex.fromPolar(amplitude, phase)
      );
    });
    
    newState.waveFunction = waveFunction;
    return newState;
  }
}

// Use custom operator
const customResult = field.applyOperator(state1, new CustomOperator());
```

### Event Handling
```typescript
// Subscribe to quantum events
const eventHandler = (event: QuantumEvent<EncodedState>) => {
  console.log(`State changed: ${event.type}`, {
    timestamp: event.timestamp,
    stateId: event.data.sourceNode.id
  });
};

// Add event listener
queryProcessor.on('stateChange', eventHandler);

// Remove event listener when done
queryProcessor.off('stateChange', eventHandler);
```

### Error Handling
```typescript
try {
  const result = queryProcessor.processQuery(query, searchResults);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.violations);
  } else if (error instanceof StateError) {
    console.error('State error:', error.state.sourceNode.id);
  } else if (error instanceof QuantumError) {
    console.error('Quantum error:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Performance Optimization
```typescript
// Use memory pool for frequent operations
const pool = new MemoryPool<Complex>();

// Memoize expensive calculations
const memoizedCalculation = memoize((state: EncodedState) => {
  // Complex calculation logic
  return result;
});

// Monitor performance
const monitor = new PerformanceMonitor();
monitor.measure('quantum_operation', performance.now() - startTime);

const averages = monitor.getAverages();
console.log('Performance metrics:', averages);

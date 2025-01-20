# Visualization Toolkit Documentation

This guide provides comprehensive documentation for the visualization components in the Quantum Semantic Fields system.

## Table of Contents
1. [Core Components](#core-components)
2. [State Visualization](#state-visualization)
3. [Network Visualization](#network-visualization)
4. [Interactive Features](#interactive-features)
5. [Custom Visualizations](#custom-visualizations)
6. [Performance Optimization](#performance-optimization)

## Core Components

### Canvas Management
```typescript
interface CanvasConfig {
  width: number;
  height: number;
  dpr: number;          // Device pixel ratio
  antialias: boolean;
  alpha: boolean;
}

class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen: OffscreenCanvas;

  constructor(config: CanvasConfig) {
    this.canvas = this.createCanvas(config);
    this.ctx = this.setupContext(config);
    this.offscreen = this.createOffscreenCanvas(config);
    this.setupResizeHandler();
  }

  private setupContext(config: CanvasConfig): CanvasRenderingContext2D {
    const ctx = this.canvas.getContext('2d', {
      alpha: config.alpha,
      antialias: config.antialias,
      desynchronized: true
    })!;

    // Apply device pixel ratio scaling
    const scale = config.dpr || window.devicePixelRatio;
    ctx.scale(scale, scale);

    return ctx;
  }

  private setupResizeHandler(): void {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.handleResize(entry.contentRect);
      }
    });
    resizeObserver.observe(this.canvas);
  }
}
```

### Rendering Pipeline
```typescript
interface RenderLayer {
  id: string;
  zIndex: number;
  visible: boolean;
  render(ctx: CanvasRenderingContext2D): void;
  update(deltaTime: number): void;
}

class RenderPipeline {
  private layers: Map<string, RenderLayer>;
  private sortedLayers: RenderLayer[];
  private animationFrame: number | null = null;

  addLayer(layer: RenderLayer): void {
    this.layers.set(layer.id, layer);
    this.sortLayers();
  }

  private sortLayers(): void {
    this.sortedLayers = Array.from(this.layers.values())
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  render(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    for (const layer of this.sortedLayers) {
      if (layer.visible) {
        layer.render(this.ctx);
      }
    }
  }

  startAnimation(): void {
    const animate = (timestamp: number) => {
      this.update(timestamp);
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }
}
```

## State Visualization

### Quantum State Renderer
```typescript
interface StateVisualizationConfig {
  colorScheme: 'default' | 'spectrum' | 'monochrome';
  showPhases: boolean;
  showAmplitudes: boolean;
  showProbabilities: boolean;
  animate: boolean;
}

class QuantumStateRenderer implements RenderLayer {
  id = 'quantum-state';
  zIndex = 0;
  visible = true;

  constructor(
    private readonly state: WaveFunction,
    private readonly config: StateVisualizationConfig
  ) {}

  render(ctx: CanvasRenderingContext2D): void {
    // Draw amplitude distribution
    if (this.config.showAmplitudes) {
      this.renderAmplitudes(ctx);
    }

    // Draw phase relationships
    if (this.config.showPhases) {
      this.renderPhases(ctx);
    }

    // Draw probability distribution
    if (this.config.showProbabilities) {
      this.renderProbabilities(ctx);
    }
  }

  private renderAmplitudes(ctx: CanvasRenderingContext2D): void {
    const dimensions = this.state.getDimensions();
    const maxAmplitude = Math.max(...dimensions.map(d => d.magnitude()));

    ctx.beginPath();
    dimensions.forEach((dim, i) => {
      const x = (i / dimensions.length) * ctx.canvas.width;
      const y = (1 - dim.magnitude() / maxAmplitude) * ctx.canvas.height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }
}
```

### Phase Space Visualization
```typescript
class PhaseSpaceVisualizer implements RenderLayer {
  id = 'phase-space';
  zIndex = 1;
  visible = true;

  render(ctx: CanvasRenderingContext2D): void {
    const dimensions = this.state.getDimensions();
    const center = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };
    
    dimensions.forEach(dim => {
      const radius = dim.magnitude() * this.scale;
      const angle = dim.phase();
      
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle)
      );
      ctx.stroke();
      
      // Draw probability density
      ctx.beginPath();
      ctx.arc(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle),
        3,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }
}
```

## Network Visualization

### Quantum Network Graph
```typescript
interface NetworkVisualizationConfig {
  layout: 'force' | 'circular' | 'hierarchical';
  nodeSize: number;
  edgeWidth: number;
  showLabels: boolean;
  physics: {
    gravity: number;
    springLength: number;
    springStrength: number;
    damping: number;
  };
}

class QuantumNetworkVisualizer implements RenderLayer {
  id = 'quantum-network';
  zIndex = 0;
  visible = true;

  private simulation: ForceSimulation;
  private nodePositions: Map<string, Vector2D>;

  constructor(
    private readonly network: QuantumNetwork,
    private readonly config: NetworkVisualizationConfig
  ) {
    this.simulation = this.setupSimulation();
    this.nodePositions = new Map();
  }

  private setupSimulation(): ForceSimulation {
    return new ForceSimulation()
      .force('charge', forceManyBody().strength(-this.config.physics.gravity))
      .force('link', forceLink().distance(this.config.physics.springLength))
      .force('center', forceCenter(width / 2, height / 2))
      .on('tick', () => this.updatePositions());
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render edges
    this.network.edges.forEach(edge => {
      const source = this.nodePositions.get(edge.source)!;
      const target = this.nodePositions.get(edge.target)!;
      
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = this.getEdgeColor(edge);
      ctx.lineWidth = this.getEdgeWidth(edge);
      ctx.stroke();
    });

    // Render nodes
    this.network.nodes.forEach(node => {
      const pos = this.nodePositions.get(node.id)!;
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, this.config.nodeSize, 0, 2 * Math.PI);
      ctx.fillStyle = this.getNodeColor(node);
      ctx.fill();
      
      if (this.config.showLabels) {
        this.renderLabel(ctx, node, pos);
      }
    });
  }
}
```

## Interactive Features

### User Interaction Handler
```typescript
interface InteractionConfig {
  enableZoom: boolean;
  enablePan: boolean;
  enableSelection: boolean;
  zoomRange: [number, number];
}

class InteractionHandler {
  private isDragging = false;
  private lastPosition: Vector2D | null = null;
  private selectedNodes: Set<string> = new Set();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: InteractionConfig
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('wheel', this.handleWheel);
  }

  private handleMouseDown = (event: MouseEvent): void => {
    this.isDragging = true;
    this.lastPosition = this.getMousePosition(event);
    
    if (this.config.enableSelection) {
      const hitNode = this.findNodeAtPosition(this.lastPosition);
      if (hitNode) {
        this.selectedNodes.add(hitNode.id);
        this.emit('nodeSelected', hitNode);
      }
    }
  };

  private handleWheel = (event: WheelEvent): void => {
    if (!this.config.enableZoom) return;
    
    event.preventDefault();
    const delta = event.deltaY * -0.01;
    const newScale = Math.max(
      this.config.zoomRange[0],
      Math.min(this.config.zoomRange[1], this.scale + delta)
    );
    
    this.setScale(newScale);
  };
}
```

### Animation Controller
```typescript
interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeInOut' | 'elastic';
  fps: number;
}

class AnimationController {
  private animations: Map<string, Animation>;
  private lastTimestamp: number = 0;

  addAnimation(
    id: string,
    params: AnimationParams,
    config: AnimationConfig
  ): void {
    const animation = new Animation(params, config);
    this.animations.set(id, animation);
  }

  update(timestamp: number): void {
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.animations.forEach((animation, id) => {
      animation.update(deltaTime);
      if (animation.isComplete) {
        this.animations.delete(id);
      }
    });
  }
}
```

## Custom Visualizations

### Creating Custom Visualizers
```typescript
abstract class BaseVisualizer implements RenderLayer {
  abstract id: string;
  abstract zIndex: number;
  visible = true;

  protected config: VisualizationConfig;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;

  constructor(config: VisualizationConfig) {
    this.config = config;
    this.setupCanvas();
  }

  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract update(deltaTime: number): void;

  protected setupCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.applyConfig();
  }
}

// Example custom visualizer
class WaveFunctionFlowVisualizer extends BaseVisualizer {
  id = 'wavefunction-flow';
  zIndex = 2;

  private particles: Particle[] = [];
  private flowField: FlowField;

  constructor(config: VisualizationConfig) {
    super(config);
    this.flowField = new FlowField(this.state);
    this.initializeParticles();
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render flow field
    this.flowField.render(ctx);

    // Render particles
    this.particles.forEach(particle => {
      particle.render(ctx);
    });
  }

  update(deltaTime: number): void {
    this.flowField.update(this.state);
    this.particles.forEach(particle => {
      const force = this.flowField.getForceAt(particle.position);
      particle.applyForce(force);
      particle.update(deltaTime);
    });
  }
}
```

## Performance Optimization

### Rendering Optimization
```typescript
class OptimizedRenderer {
  private readonly worker: Worker;
  private readonly offscreenCanvas: OffscreenCanvas;
  private readonly layerCache: Map<string, ImageBitmap>;

  constructor() {
    this.worker = new Worker('render-worker.js');
    this.setupWorker();
  }

  private setupWorker(): void {
    const offscreen = this.canvas.transferControlToOffscreen();
    this.worker.postMessage({ canvas: offscreen }, [offscreen]);
  }

  private cacheLayer(layer: RenderLayer): void {
    const bitmap = this.renderToBitmap(layer);
    this.layerCache.set(layer.id, bitmap);
  }

  private renderToBitmap(layer: RenderLayer): Promise<ImageBitmap> {
    const canvas = new OffscreenCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d')!;
    
    layer.render(ctx);
    return createImageBitmap(canvas);
  }
}
```

### Memory Management
```typescript
class VisualizationMemoryManager {
  private readonly resourcePool: Map<string, any[]>;
  private readonly limits: ResourceLimits;

  constructor(limits: ResourceLimits) {
    this.limits = limits;
    this.resourcePool = new Map();
  }

  acquireResource<T>(type: string): T {
    const pool = this.resourcePool.get(type) || [];
    return pool.pop() as T || this.createResource<T>(type);
  }

  releaseResource(type: string, resource: any): void {
    const pool = this.resourcePool.get(type) || [];
    if (pool.length < this.limits[type]) {
      pool.push(resource);
      this.resourcePool.set(type, pool);
    }
  }

  private createResource<T>(type: string): T {
    switch (type) {
      case 'vector':
        return new Float32Array(2) as T;
      case 'matrix':
        return new Float32Array(16) as T;
      default:
        throw new Error(`Unknown resource type: ${type}`);
    }
  }
}
```

## Best Practices

1. **Performance**
   - Use layer caching for static content
   - Implement view frustum culling
   - Batch similar drawing operations
   - Use appropriate data structures for spatial queries

2. **Memory Management**
   - Pool frequently allocated objects
   - Use TypedArrays for numerical data
   - Clear unused resources
   - Monitor memory usage

3. **Interaction**
   - Implement smooth transitions
   - Provide visual feedback
   - Handle all input states
   - Support accessibility features

4. **Error Handling**
   ```typescript
   try {
     const visualizer = new CustomVisualizer(config);
     await visualizer.initialize();
   } catch (error) {
     if (error instanceof WebGLContextError) {
       fallbackToCanvas();
     } else {
       handleVisualizationError(error);
     }
   }
   ```

For more information about specific visualization components, refer to the [API Reference](api_reference.md) document.

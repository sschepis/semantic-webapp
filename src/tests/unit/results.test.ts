import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResultVisualizer } from '../../lib/visualization/results';
import { Graph } from '../../lib/network/graph';
import { QuantumEncoder } from '../../lib/quantum/encoder';

describe('ResultVisualizer', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let visualizer: ResultVisualizer;

  beforeEach(() => {
    // Create a mock canvas and context
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d')!;

    // Mock canvas context methods
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      ellipse: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn()
    };

    Object.assign(ctx, mockCtx);

    visualizer = new ResultVisualizer(canvas);
  });

  it('should initialize with default configuration', () => {
    expect(visualizer).toBeDefined();
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });

  it('should render query results in different layouts', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    // Create test states
    const states = [
      graph.addNode('State 1', 'quantum', { weight: 0.8 }),
      graph.addNode('State 2', 'quantum', { weight: 0.7 })
    ].map(node => encoder.encodeNode(node));

    // Create test query result
    const result = {
      states,
      measurements: [
        { probability: 0.6, basis: 'computational' as const, value: 0 },
        { probability: 0.4, basis: 'computational' as const, value: 1 }
      ],
      metrics: {
        fidelity: 0.9,
        coherence: 0.8,
        entanglement: 0.5
      }
    };

    // Test grid layout
    visualizer.setConfig({ layout: 'grid' });
    visualizer.visualizeResult(result);
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();

    // Test circular layout
    visualizer.setConfig({ layout: 'circular' });
    visualizer.visualizeResult(result);
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();

    // Test force layout
    visualizer.setConfig({ layout: 'force' });
    visualizer.visualizeResult(result);
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
  });

  it('should handle different color schemes', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const state = encoder.encodeNode(
      graph.addNode('Test State', 'quantum', { weight: 0.8 })
    );

    const result = {
      states: [state],
      measurements: [
        { probability: 1, basis: 'computational' as const, value: 0 }
      ],
      metrics: {
        fidelity: 1,
        coherence: 1,
        entanglement: 0
      }
    };

    // Test default color scheme
    visualizer.setConfig({ colorScheme: 'default' });
    visualizer.visualizeResult(result);
    expect(ctx.strokeStyle).toBeDefined();

    // Test spectrum color scheme
    visualizer.setConfig({ colorScheme: 'spectrum' });
    visualizer.visualizeResult(result);
    expect(ctx.strokeStyle).toBeDefined();

    // Test monochrome color scheme
    visualizer.setConfig({ colorScheme: 'monochrome' });
    visualizer.visualizeResult(result);
    expect(ctx.strokeStyle).toBeDefined();
  });

  it('should show/hide optional components', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const state = encoder.encodeNode(
      graph.addNode('Test State', 'quantum', { weight: 0.8 })
    );

    const result = {
      states: [state],
      measurements: [
        { probability: 1, basis: 'computational' as const, value: 0 }
      ],
      metrics: {
        fidelity: 1,
        coherence: 1,
        entanglement: 0
      }
    };

    // Test with all components shown
    visualizer.setConfig({
      showProbabilities: true,
      showPhases: true,
      showMetrics: true
    });
    visualizer.visualizeResult(result);
    expect(ctx.fillText).toHaveBeenCalled();

    // Test with components hidden
    visualizer.setConfig({
      showProbabilities: false,
      showPhases: false,
      showMetrics: false
    });
    visualizer.visualizeResult(result);
    const calls = vi.mocked(ctx.fillText).mock.calls.length;
    expect(calls).toBeLessThan(vi.mocked(ctx.fillText).mock.calls.length);
  });

  it('should handle viewport transformations', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const state = encoder.encodeNode(
      graph.addNode('Test State', 'quantum', { weight: 0.8 })
    );

    const result = {
      states: [state],
      measurements: [
        { probability: 1, basis: 'computational' as const, value: 0 }
      ],
      metrics: {
        fidelity: 1,
        coherence: 1,
        entanglement: 0
      }
    };

    visualizer.setViewport({
      scale: 2,
      translateX: 100,
      translateY: 50,
      rotation: Math.PI / 4
    });

    visualizer.visualizeResult(result);
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);
    expect(ctx.translate).toHaveBeenCalledWith(100, 50);
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 4);
  });

  it('should handle animation frames', () => {
    const graph = new Graph();
    const encoder = new QuantumEncoder();
    const state = encoder.encodeNode(
      graph.addNode('Test State', 'quantum', { weight: 0.8 })
    );

    const result = {
      states: [state],
      measurements: [
        { probability: 1, basis: 'computational' as const, value: 0 }
      ],
      metrics: {
        fidelity: 1,
        coherence: 1,
        entanglement: 0
      }
    };

    // Mock requestAnimationFrame
    const mockRAF = vi.fn();
    global.requestAnimationFrame = mockRAF;
    global.cancelAnimationFrame = vi.fn();

    visualizer.startAnimation(result);
    expect(mockRAF).toHaveBeenCalled();

    visualizer.stopAnimation();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should clean up resources on dispose', () => {
    const mockRAF = vi.fn();
    global.requestAnimationFrame = mockRAF;
    global.cancelAnimationFrame = vi.fn();

    visualizer.dispose();
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });
});

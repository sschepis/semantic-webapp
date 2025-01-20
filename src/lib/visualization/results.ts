import { QueryResult } from '../query/processor';
import { EncodedState } from '../quantum/encoder';

export interface VisualizationConfig {
  width: number;
  height: number;
  colorScheme: 'default' | 'spectrum' | 'monochrome';
  showProbabilities: boolean;
  showPhases: boolean;
  showMetrics: boolean;
  animate: boolean;
  layout: 'grid' | 'circular' | 'force';
}

export interface ViewportState {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

export class ResultVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<VisualizationConfig>;
  private viewport: ViewportState;
  private animationFrame: number | null;

  constructor(canvas: HTMLCanvasElement, config: Partial<VisualizationConfig> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.config = {
      width: canvas.width,
      height: canvas.height,
      colorScheme: 'default',
      showProbabilities: true,
      showPhases: true,
      showMetrics: true,
      animate: true,
      layout: 'circular',
      ...config
    };

    this.viewport = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotation: 0
    };

    this.animationFrame = null;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  visualizeResult(result: QueryResult): void {
    this.clear();
    this.applyViewport();

    switch (this.config.layout) {
      case 'grid':
        this.renderGridLayout(result);
        break;
      case 'circular':
        this.renderCircularLayout(result);
        break;
      case 'force':
        this.renderForceLayout(result);
        break;
    }

    if (this.config.showMetrics) {
      this.renderMetrics(result.metrics);
    }
  }

  private renderGridLayout(result: QueryResult): void {
    const { width, height } = this.config;
    const padding = 20;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    const cols = Math.ceil(Math.sqrt(result.states.length));
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / Math.ceil(result.states.length / cols);

    result.states.forEach((state, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = padding + col * cellWidth;
      const y = padding + row * cellHeight;

      this.renderState(state, {
        x: x + cellWidth / 2,
        y: y + cellHeight / 2,
        width: cellWidth * 0.8,
        height: cellHeight * 0.8
      });

      if (this.config.showProbabilities) {
        const measurements = result.measurements.filter(m => 
          m.basis === 'computational' && m.value === i
        );
        if (measurements.length > 0) {
          this.renderProbability(measurements[0], x + cellWidth / 2, y + cellHeight - 10);
        }
      }
    });
  }

  private renderCircularLayout(result: QueryResult): void {
    const { width, height } = this.config;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    result.states.forEach((state, i) => {
      const angle = (i / result.states.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      this.renderState(state, {
        x,
        y,
        width: radius * 0.4,
        height: radius * 0.4
      });

      if (this.config.showProbabilities) {
        const measurements = result.measurements.filter(m => 
          m.basis === 'computational' && m.value === i
        );
        if (measurements.length > 0) {
          this.renderProbability(measurements[0], x, y + radius * 0.25);
        }
      }

      // Draw connections between entangled states
      state.connections.forEach(connId => {
        const connIndex = result.states.findIndex(s => s.sourceNode.id === connId);
        if (connIndex > i) {
          const connAngle = (connIndex / result.states.length) * Math.PI * 2;
          const connX = centerX + Math.cos(connAngle) * radius;
          const connY = centerY + Math.sin(connAngle) * radius;

          this.renderConnection(
            { x, y },
            { x: connX, y: connY },
            this.calculateConnectionStrength(state, result.states[connIndex])
          );
        }
      });
    });
  }

  private renderForceLayout(result: QueryResult): void {
    // Implement force-directed layout for dynamic visualization
    // This is a simplified version - a full implementation would use
    // proper force simulation with repulsion and attraction forces
    const { width, height } = this.config;
    const padding = 50;
    const positions = new Map<string, { x: number; y: number }>();

    // Initialize random positions
    result.states.forEach(state => {
      positions.set(state.sourceNode.id, {
        x: padding + Math.random() * (width - padding * 2),
        y: padding + Math.random() * (height - padding * 2)
      });
    });

    // Apply forces and update positions
    for (let iteration = 0; iteration < 50; iteration++) {
      result.states.forEach(state => {
        const pos = positions.get(state.sourceNode.id)!;
        let fx = 0, fy = 0;

        // Repulsion from other states
        result.states.forEach(other => {
          if (other === state) return;
          const otherPos = positions.get(other.sourceNode.id)!;
          const dx = pos.x - otherPos.x;
          const dy = pos.y - otherPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) return;

          const force = 1000 / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        // Attraction to connected states
        state.connections.forEach(connId => {
          const connPos = positions.get(connId);
          if (!connPos) return;

          const dx = connPos.x - pos.x;
          const dy = connPos.y - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) return;

          const force = dist * 0.05;
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        // Update position
        pos.x += Math.min(Math.max(fx, -10), 10);
        pos.y += Math.min(Math.max(fy, -10), 10);

        // Keep within bounds
        pos.x = Math.min(Math.max(pos.x, padding), width - padding);
        pos.y = Math.min(Math.max(pos.y, padding), height - padding);
      });
    }

    // Render states and connections
    result.states.forEach(state => {
      const pos = positions.get(state.sourceNode.id)!;

      this.renderState(state, {
        x: pos.x,
        y: pos.y,
        width: 80,
        height: 80
      });

      if (this.config.showProbabilities) {
        const measurements = result.measurements.filter(m => 
          m.basis === 'computational' && 
          m.value === result.states.indexOf(state)
        );
        if (measurements.length > 0) {
          this.renderProbability(measurements[0], pos.x, pos.y + 50);
        }
      }
    });

    // Render connections
    result.states.forEach(state => {
      const pos = positions.get(state.sourceNode.id)!;
      state.connections.forEach(connId => {
        const connPos = positions.get(connId);
        if (connPos && connId > state.sourceNode.id) {
          const connState = result.states.find(s => s.sourceNode.id === connId);
          if (connState) {
            this.renderConnection(
              pos,
              connPos,
              this.calculateConnectionStrength(state, connState)
            );
          }
        }
      });
    });
  }

  private renderState(
    state: EncodedState,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    const { ctx } = this;
    const { x, y, width, height } = bounds;

    // Draw state background
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.getStateColor(state, 0.2);
    ctx.fill();
    ctx.strokeStyle = this.getStateColor(state, 1);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw phase indicator if enabled
    if (this.config.showPhases) {
      const phase = state.waveFunction.getPhase();
      const radius = Math.min(width, height) / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(phase) * radius * 0.8,
        y + Math.sin(phase) * radius * 0.8
      );
      ctx.strokeStyle = this.getPhaseColor(phase);
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw state label
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(state.sourceNode.label, x, y + height / 2 + 20);
  }

  private renderConnection(
    start: { x: number; y: number },
    end: { x: number; y: number },
    strength: number
  ): void {
    const { ctx } = this;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = `rgba(100, 100, 100, ${strength})`;
    ctx.lineWidth = strength * 3;
    ctx.stroke();
  }

  private renderProbability(
    measurement: QueryResult['measurements'][0],
    x: number,
    y: number
  ): void {
    const { ctx } = this;

    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `P = ${measurement.probability.toFixed(3)}`,
      x,
      y
    );
  }

  private renderMetrics(metrics: QueryResult['metrics']): void {
    const { ctx, config } = this;
    const padding = 10;
    const lineHeight = 20;

    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';

    const metricsText = [
      `Fidelity: ${metrics.fidelity.toFixed(3)}`,
      `Coherence: ${metrics.coherence.toFixed(3)}`,
      `Entanglement: ${metrics.entanglement.toFixed(3)}`
    ];

    metricsText.forEach((text, i) => {
      ctx.fillText(text, padding, config.height - padding - (metricsText.length - 1 - i) * lineHeight);
    });
  }

  private getStateColor(state: EncodedState, alpha: number): string {
    const amplitude = state.waveFunction.getAmplitude();
    const phase = state.waveFunction.getPhase();

    let hue = 0;
    switch (this.config.colorScheme) {
      case 'spectrum':
        hue = (phase / (2 * Math.PI)) * 360;
        return `hsla(${hue}, 70%, 50%, ${amplitude * alpha})`;
      case 'monochrome':
        return `rgba(0, 0, 0, ${amplitude * alpha})`;
      default:
        return `rgba(0, 128, 255, ${amplitude * alpha})`;
    }
  }

  private getPhaseColor(phase: number): string {
    let hue = 0;
    switch (this.config.colorScheme) {
      case 'spectrum':
        hue = (phase / (2 * Math.PI)) * 360;
        return `hsl(${hue}, 70%, 50%)`;
      case 'monochrome':
        return '#000';
      default:
        return '#ff8000';
    }
  }

  private calculateConnectionStrength(state1: EncodedState, state2: EncodedState): number {
    // Calculate connection strength based on quantum properties
    const amplitude1 = state1.waveFunction.getAmplitude();
    const amplitude2 = state2.waveFunction.getAmplitude();
    const phase1 = state1.waveFunction.getPhase();
    const phase2 = state2.waveFunction.getPhase();

    const amplitudeProduct = amplitude1 * amplitude2;
    const phaseCoherence = Math.cos(phase1 - phase2);

    return Math.min(1, Math.max(0, (amplitudeProduct + phaseCoherence) / 2));
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private applyViewport(): void {
    const { scale, translateX, translateY, rotation } = this.viewport;
    this.ctx.save();
    this.ctx.translate(translateX, translateY);
    this.ctx.scale(scale, scale);
    this.ctx.rotate(rotation);
  }

  // Public control methods
  setViewport(viewport: Partial<ViewportState>): void {
    this.viewport = { ...this.viewport, ...viewport };
  }

  setConfig(config: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupCanvas();
  }

  startAnimation(result: QueryResult): void {
    if (!this.config.animate) return;

    let frame = 0;
    const animate = () => {
      this.viewport.rotation = (frame * 0.01) % (Math.PI * 2);
      this.visualizeResult(result);
      frame++;
      this.animationFrame = requestAnimationFrame(animate);
    };

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(animate);
  }

  stopAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  dispose(): void {
    this.stopAnimation();
    this.clear();
  }
}

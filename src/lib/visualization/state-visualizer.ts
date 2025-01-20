import { WaveFunction } from '../quantum/wavefunction';
import { EncodedState } from '../quantum/encoder';
import { TimeStep } from '../quantum/evolution';

export interface VisualizationOptions {
  width: number;
  height: number;
  colorScheme: 'default' | 'spectrum' | 'monochrome';
  showPhase: boolean;
  showAmplitude: boolean;
  showCoherence: boolean;
  animate: boolean;
  frameRate: number;
}

export interface ViewportTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  options: Required<VisualizationOptions>;
  transform: ViewportTransform;
  time: number;
}

export class StateVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: Required<VisualizationOptions>;
  private transform: ViewportTransform;
  private animationFrame: number | null;
  private currentTime: number;

  constructor(canvas: HTMLCanvasElement, options: Partial<VisualizationOptions> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.options = {
      width: canvas.width,
      height: canvas.height,
      colorScheme: 'default',
      showPhase: true,
      showAmplitude: true,
      showCoherence: true,
      animate: true,
      frameRate: 60,
      ...options
    };

    this.transform = {
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotation: 0
    };

    this.animationFrame = null;
    this.currentTime = 0;

    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  visualizeState(state: EncodedState): void {
    const context: RenderContext = {
      canvas: this.canvas,
      ctx: this.ctx,
      options: this.options,
      transform: this.transform,
      time: this.currentTime
    };

    this.clear();
    this.applyTransform();

    // Render quantum state components
    this.renderWavefunction(state.waveFunction, context);
    if (this.options.showPhase) {
      this.renderPhaseSpace(state.waveFunction, context);
    }
    if (this.options.showAmplitude) {
      this.renderAmplitudeDistribution(state.waveFunction, context);
    }
    if (this.options.showCoherence && state.connections.length > 0) {
      this.renderCoherenceNetwork(state, context);
    }
  }

  visualizeEvolution(timeSteps: TimeStep[]): void {
    if (!this.options.animate) {
      this.visualizeState(timeSteps[timeSteps.length - 1].states[0]);
      return;
    }

    let frame = 0;
    const animate = () => {
      const timeStep = timeSteps[frame % timeSteps.length];
      this.currentTime = timeStep.time;
      timeStep.states.forEach(state => this.visualizeState(state));

      frame++;
      this.animationFrame = requestAnimationFrame(animate);
    };

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(animate);
  }

  private renderWavefunction(wavefunction: WaveFunction, context: RenderContext): void {
    const { ctx, options } = context;
    const dimensions = wavefunction.getDimensions();
    const centerX = options.width / 2;
    const centerY = options.height / 2;
    const radius = Math.min(options.width, options.height) * 0.4;

    ctx.beginPath();
    dimensions.forEach((dim, i) => {
      const angle = (i / dimensions.length) * Math.PI * 2;
      const magnitude = Math.sqrt(dim.real * dim.real + dim.imag * dim.imag);
      const phase = Math.atan2(dim.imag, dim.real);
      
      const x = centerX + Math.cos(angle) * radius * magnitude;
      const y = centerY + Math.sin(angle) * radius * magnitude;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw phase indicator
      if (options.showPhase) {
        const phaseLength = radius * 0.1;
        const phaseX = x + Math.cos(phase) * phaseLength;
        const phaseY = y + Math.sin(phase) * phaseLength;
        ctx.moveTo(x, y);
        ctx.lineTo(phaseX, phaseY);
      }
    });
    ctx.closePath();
    
    // Apply color based on scheme
    const color = this.getColorForState(wavefunction, context);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = color.replace(')', ', 0.2)');
    ctx.fill();
  }

  private renderPhaseSpace(wavefunction: WaveFunction, context: RenderContext): void {
    const { ctx, options } = context;
    const dimensions = wavefunction.getDimensions();
    const margin = 50;
    const plotWidth = options.width - margin * 2;
    const plotHeight = options.height - margin * 2;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(margin, options.height - margin);
    ctx.lineTo(options.width - margin, options.height - margin);
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, options.height - margin);
    ctx.strokeStyle = '#666';
    ctx.stroke();

    // Plot phase points
    ctx.beginPath();
    dimensions.forEach((dim, i) => {
      const x = margin + (i / dimensions.length) * plotWidth;
      const y = options.height - margin - (Math.atan2(dim.imag, dim.real) + Math.PI) / (2 * Math.PI) * plotHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = this.getColorForPhase(wavefunction.getPhase(), context);
    ctx.stroke();
  }

  private renderAmplitudeDistribution(wavefunction: WaveFunction, context: RenderContext): void {
    const { ctx, options } = context;
    const dimensions = wavefunction.getDimensions();
    const barWidth = options.width / dimensions.length;
    const maxHeight = options.height * 0.3;

    dimensions.forEach((dim, i) => {
      const amplitude = Math.sqrt(dim.real * dim.real + dim.imag * dim.imag);
      const height = amplitude * maxHeight;
      const x = i * barWidth;
      const y = options.height - height;

      ctx.fillStyle = this.getColorForAmplitude(amplitude, context);
      ctx.fillRect(x, y, barWidth - 1, height);
    });
  }

  private renderCoherenceNetwork(state: EncodedState, context: RenderContext): void {
    const { ctx, options } = context;
    const centerX = options.width / 2;
    const centerY = options.height / 2;
    const radius = Math.min(options.width, options.height) * 0.3;

    // Draw connections
    state.connections.forEach((connectionId, i) => {
      const angle = (i / state.connections.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = this.getColorForCoherence(0.5, context); // TODO: Calculate actual coherence
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw connection node
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.getColorForCoherence(0.7, context);
      ctx.fill();
    });
  }

  private getColorForState(wavefunction: WaveFunction, context: RenderContext): string {
    const amplitude = wavefunction.getAmplitude();
    const phase = wavefunction.getPhase();

    let hue = 0;
    switch (context.options.colorScheme) {
      case 'spectrum':
        hue = (phase / (2 * Math.PI)) * 360;
        return `hsla(${hue}, 70%, 50%, ${amplitude})`;
      case 'monochrome':
        return `rgba(0, 0, 0, ${amplitude})`;
      default:
        return `rgba(0, 128, 255, ${amplitude})`;
    }
  }

  private getColorForPhase(phase: number, context: RenderContext): string {
    const hue = (phase / (2 * Math.PI)) * 360;
    return context.options.colorScheme === 'monochrome'
      ? '#000'
      : `hsl(${hue}, 70%, 50%)`;
  }

  private getColorForAmplitude(amplitude: number, context: RenderContext): string {
    let hue = 0;
    switch (context.options.colorScheme) {
      case 'spectrum':
        hue = amplitude * 240;
        return `hsl(${hue}, 70%, 50%)`;
      case 'monochrome':
        return `rgba(0, 0, 0, ${amplitude})`;
      default:
        return `rgba(0, 128, 255, ${amplitude})`;
    }
  }

  private getColorForCoherence(coherence: number, context: RenderContext): string {
    let hue = 0;
    switch (context.options.colorScheme) {
      case 'spectrum':
        hue = coherence * 120;
        return `hsl(${hue}, 70%, 50%)`;
      case 'monochrome':
        return `rgba(0, 0, 0, ${coherence})`;
      default:
        return `rgba(255, 128, 0, ${coherence})`;
    }
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private applyTransform(): void {
    const { scale, translateX, translateY, rotation } = this.transform;
    this.ctx.save();
    this.ctx.translate(translateX, translateY);
    this.ctx.scale(scale, scale);
    this.ctx.rotate(rotation);
  }

  // Public control methods
  setTransform(transform: Partial<ViewportTransform>): void {
    this.transform = { ...this.transform, ...transform };
  }

  setOptions(options: Partial<VisualizationOptions>): void {
    this.options = { ...this.options, ...options };
    this.setupCanvas();
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

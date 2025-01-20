import { Complex } from './complex';
import { QuantumField } from '../../types/quantum';

export interface QuantumFieldMetadata {
  timestamp: number;
}

export class WaveFunction {
  private dimensions: Complex[];
  private amplitude: number;
  private phase: number;
  public id: string;
  public connections: string[];

  constructor(dimension: number) {
    this.dimensions = Array(dimension).fill(new Complex(0, 0));
    this.amplitude = 0;
    this.phase = 0;
    this.id = Math.random().toString(36).substring(7);
    this.connections = [];
  }

  setDimension(index: number, value: Complex): void {
    if (index >= 0 && index < this.dimensions.length) {
      this.dimensions[index] = value;
    }
  }

  getDimensions(): Complex[] {
    return this.dimensions;
  }

  setAmplitude(value: number): void {
    this.amplitude = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
  }

  getAmplitude(): number {
    return this.amplitude;
  }

  setPhase(value: number): void {
    // Normalize phase to [0, 2π]
    this.phase = value % (2 * Math.PI);
    if (this.phase < 0) this.phase += 2 * Math.PI;
  }

  getPhase(): number {
    return this.phase;
  }

  addConnection(nodeId: string): void {
    if (!this.connections.includes(nodeId)) {
      this.connections.push(nodeId);
    }
  }

  removeConnection(nodeId: string): void {
    this.connections = this.connections.filter(id => id !== nodeId);
  }

  // Calculate superposition with another wavefunction
  superpose(other: WaveFunction): WaveFunction {
    const result = new WaveFunction(this.dimensions.length);
    
    // Combine amplitudes
    result.setAmplitude((this.amplitude + other.amplitude) / 2);
    
    // Average phases
    const avgPhase = (this.phase + other.phase) / 2;
    result.setPhase(avgPhase);
    
    // Combine dimensions
    for (let i = 0; i < this.dimensions.length; i++) {
      const combined = this.dimensions[i].add(other.dimensions[i]);
      result.setDimension(i, combined.scale(1 / Math.sqrt(2)));
    }
    
    return result;
  }

  // Calculate inner product with another wavefunction
  innerProduct(other: WaveFunction): Complex {
    if (this.dimensions.length !== other.dimensions.length) {
      throw new Error('Wavefunctions must have same dimension for inner product');
    }

    return this.dimensions.reduce((acc, dim, i) => {
      const conjugate = dim.conjugate();
      return acc.add(conjugate.multiply(other.dimensions[i]));
    }, new Complex(0, 0));
  }

  // Normalize the wavefunction
  normalize(): void {
    const norm = Math.sqrt(this.dimensions.reduce((acc, dim) => {
      return acc + dim.multiply(dim.conjugate()).real;
    }, 0));

    if (norm === 0) return;

    this.dimensions = this.dimensions.map(dim => dim.scale(1 / norm));
  }
}

export class WaveFunctionUtils {
  static createWaveFunction(token: string, dimensions: number): WaveFunction {
    const wave = new WaveFunction(dimensions);
    
    // Generate hash from token
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash = hash & hash;
    }

    // Set initial amplitude based on token length
    const amplitude = Math.min(1, token.length / 10);
    wave.setAmplitude(amplitude);

    // Set phase based on hash
    const phase = (Math.abs(hash) % 360) * Math.PI / 180;
    wave.setPhase(phase);

    // Set dimensions based on token characteristics
    for (let i = 0; i < dimensions; i++) {
      const angle = (hash + i) * Math.PI / dimensions;
      const magnitude = amplitude * Math.cos(angle);
      wave.setDimension(i, new Complex(
        magnitude * Math.cos(phase),
        magnitude * Math.sin(phase)
      ));
    }

    wave.normalize();
    return wave;
  }

  static waveToField(wave: WaveFunction, dimensions: number): QuantumField & QuantumFieldMetadata {
    const values = wave.getDimensions();
    const phase = values.map(dim => Math.atan2(dim.imag, dim.real));
    
    return {
      values,
      phase,
      coherence: this.calculateCoherence(wave),
      dimensions,
      timestamp: Date.now()
    };
  }

  static computeResonance(field1: QuantumField, field2: QuantumField): number {
    if (field1.values.length !== field2.values.length) {
      throw new Error('Fields must have same dimensions for resonance calculation');
    }

    let resonance = 0;
    for (let i = 0; i < field1.values.length; i++) {
      const v1 = field1.values[i];
      const v2 = field2.values[i];
      resonance += v1.multiply(v2.conjugate()).magnitude();
    }

    return resonance / field1.values.length;
  }

  private static calculateCoherence(wave: WaveFunction): number {
    const dimensions = wave.getDimensions();
    let coherence = 0;

    for (let i = 1; i < dimensions.length; i++) {
      const phase1 = Math.atan2(dimensions[i - 1].imag, dimensions[i - 1].real);
      const phase2 = Math.atan2(dimensions[i].imag, dimensions[i].real);
      coherence += Math.cos(phase1 - phase2);
    }

    return (coherence / (dimensions.length - 1) + 1) / 2;
  }
}

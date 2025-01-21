import { Complex } from './complex';

import { QuantumField as IQuantumField } from '../../types/quantum';

export class QuantumField implements IQuantumField {
  public dimensions: number;
  public values: Complex[];
  public phase: number[];
  public coherence: number;
  private primeFactors: number[];
  private spectralForm: Complex[];
  
  constructor(dimensions: number) {
    this.dimensions = dimensions;
    this.values = Array(dimensions).fill(new Complex(0, 0));
    this.phase = Array(dimensions).fill(0);
    this.coherence = 0;
    this.primeFactors = [];
    this.spectralForm = Array(dimensions).fill(new Complex(0, 0));
  }

  private getPrimeFactors(n: number): number[] {
    if (n <= 1) return [1];
    const factors: number[] = [];
    let d = 2;
    let num = n;
    
    while (num > 1) {
      while (num % d === 0) {
        factors.push(d);
        num = Math.floor(num / d);
      }
      d++;
      if (d * d > num) {
        if (num > 1) factors.push(num);
        break;
      }
    }
    return factors;
  }

  private spectralFormFactor(p: number, q: number, tau: number): Complex {
    const phase = (Math.log(p) - Math.log(q)) * tau;
    return new Complex(
      Math.cos(phase) / (p * q),
      Math.sin(phase) / (p * q)
    );
  }

  private berryPhase(primes: number[], x: number): number {
    return primes.reduce((phase, p) => phase + Math.log(p) * x, 0);
  }

  initialize(token: string): void {
    // Reset state
    this.coherence = 0;
    // Get prime factors for phase calculation
    const hash = token.split('').reduce((h, c) => {
      const char = c.charCodeAt(0);
      return ((h << 5) - h) + char;
    }, 0);
    this.primeFactors = this.getPrimeFactors(Math.abs(hash) + 1);

    // Compute normalization factor
    const normalization = Math.sqrt(
      this.primeFactors.reduce((sum, p) => sum + 1/p, 0)
    );

    // Initialize wave function components
    for (let k = 0; k < this.values.length; k++) {
      const x = k / this.values.length;
      
      // Compute Berry phase
      const berryPhase = this.berryPhase(this.primeFactors, x);
      
      // Compute spectral form factor
      let spectralSum = new Complex(0, 0);
      for (let i = 0; i < this.primeFactors.length; i++) {
        for (let j = i; j < this.primeFactors.length; j++) {
          const tau = 2 * Math.PI * x;
          const factor = this.spectralFormFactor(
            this.primeFactors[i],
            this.primeFactors[j],
            tau
          );
          spectralSum = spectralSum.add(factor);
        }
      }
      
      // Combine wave function components
      const phase = berryPhase + spectralSum.phase();
      const magnitude = spectralSum.magnitude() / normalization;
      
      this.values[k] = Complex.fromPolar(magnitude, phase);
      this.phase[k] = phase;
      this.spectralForm[k] = spectralSum;
      
      // Update coherence
      this.coherence += magnitude * magnitude;
      // Normalize coherence
    this.coherence = Math.sqrt(this.coherence / this.dimensions);
  }
  }

  computeResonance(other: QuantumField): number {
    let resonance = 0;
    for (let i = 0; i < this.values.length; i++) {
      const overlap = this.values[i].multiply(other.values[i].conjugate());
      resonance += overlap.magnitude();
    }
    return resonance / this.values.length;
  }

  computePhaseCoherence(other: QuantumField): number {
    let coherence = 0;
    for (let i = 0; i < this.values.length; i++) {
      const phase1 = this.values[i].phase();
      const phase2 = other.values[i].phase();
      coherence += Math.cos(phase1 - phase2);
    }
    return (coherence / this.values.length + 1) / 2;
  }

  getSpectralPattern(): Complex[] {
    return this.spectralForm;
  }

  getValues(): Complex[] {
    return this.values;
  }

  scale(factor: number): QuantumField {
    const scaled = new QuantumField(this.values.length);
    scaled.values = this.values.map(v => v.scale(factor));
    scaled.primeFactors = [...this.primeFactors];
    scaled.spectralForm = [...this.spectralForm];
    return scaled;
  }

  add(other: QuantumField): QuantumField {
    const sum = new QuantumField(this.values.length);
    sum.values = this.values.map((v, i) => v.add(other.values[i]));
    sum.primeFactors = [...new Set([...this.primeFactors, ...other.primeFactors])];
    sum.spectralForm = this.spectralForm.map((v, i) => v.add(other.spectralForm[i]));
    return sum;
  }

  normalize(): void {
    const norm = Math.sqrt(
      this.values.reduce((sum, v) => sum + v.multiply(v.conjugate()).real, 0)
    );
    if (norm > 0) {
      this.values = this.values.map(v => v.scale(1 / norm));
    }
  }
}

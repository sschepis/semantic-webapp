import { Complex } from './complex';
import { WaveFunction } from './wavefunction';
import { EncodedState } from './encoder';

export interface TransformationOptions {
  phaseShift?: number;
  amplitudeScale?: number;
  dimensionMask?: boolean[];
  coherenceThreshold?: number;
  harmonicWeights?: number[];
}

export type TransformationType = 
  | 'phase-rotation'
  | 'amplitude-modulation'
  | 'dimension-projection'
  | 'coherence-filtering'
  | 'harmonic-enhancement';

export interface TransformationResult {
  originalState: EncodedState;
  transformedState: EncodedState;
  transformationType: TransformationType;
  parameters: TransformationOptions;
  metrics: {
    fidelity: number;
    coherence: number;
    entanglement: number;
  };
}

export class QuantumTransformer {
  private defaultOptions: Required<TransformationOptions>;

  constructor(options: Partial<TransformationOptions> = {}) {
    this.defaultOptions = {
      phaseShift: 0,
      amplitudeScale: 1.0,
      dimensionMask: Array(512).fill(true),
      coherenceThreshold: 0.5,
      harmonicWeights: Array(8).fill(1.0),
      ...options
    };
  }

  applyPhaseRotation(state: EncodedState, angle: number): TransformationResult {
    const transformed = this.cloneState(state);
    const dimensions = transformed.waveFunction.getDimensions();

    for (let i = 0; i < dimensions.length; i++) {
      const dim = dimensions[i];
      const phase = Math.atan2(dim.imag, dim.real) + angle;
      const magnitude = Math.sqrt(dim.real * dim.real + dim.imag * dim.imag);
      
      transformed.waveFunction.setDimension(
        i,
        Complex.fromPolar(magnitude, phase)
      );
    }

    return this.createResult(state, transformed, 'phase-rotation', { phaseShift: angle });
  }

  applyAmplitudeModulation(state: EncodedState, scale: number): TransformationResult {
    const transformed = this.cloneState(state);
    const dimensions = transformed.waveFunction.getDimensions();

    for (let i = 0; i < dimensions.length; i++) {
      transformed.waveFunction.setDimension(
        i,
        dimensions[i].scale(scale)
      );
    }

    transformed.waveFunction.setAmplitude(
      Math.min(1, Math.max(0, state.waveFunction.getAmplitude() * scale))
    );

    return this.createResult(state, transformed, 'amplitude-modulation', { amplitudeScale: scale });
  }

  applyDimensionProjection(state: EncodedState, mask: boolean[]): TransformationResult {
    const transformed = this.cloneState(state);
    const dimensions = transformed.waveFunction.getDimensions();

    for (let i = 0; i < dimensions.length; i++) {
      if (!mask[i]) {
        transformed.waveFunction.setDimension(i, new Complex(0, 0));
      }
    }

    return this.createResult(state, transformed, 'dimension-projection', { dimensionMask: mask });
  }

  applyCoherenceFiltering(states: EncodedState[], threshold: number): TransformationResult[] {
    return states.map(state => {
      const transformed = this.cloneState(state);
      const connections = transformed.connections.filter(connectionId => {
        const connectedState = states.find(s => s.sourceNode.id === connectionId);
        if (!connectedState) return false;
        
        return this.calculateCoherence(
          transformed.waveFunction,
          connectedState.waveFunction
        ) >= threshold;
      });

      transformed.connections = connections;

      return this.createResult(state, transformed, 'coherence-filtering', {
        coherenceThreshold: threshold
      });
    });
  }

  applyHarmonicEnhancement(state: EncodedState, weights: number[]): TransformationResult {
    const transformed = this.cloneState(state);
    const dimensions = transformed.waveFunction.getDimensions();
    const harmonicCount = weights.length;
    const dimensionsPerHarmonic = Math.floor(dimensions.length / harmonicCount);

    for (let h = 0; h < harmonicCount; h++) {
      const weight = weights[h];
      const startIndex = h * dimensionsPerHarmonic;
      const endIndex = startIndex + dimensionsPerHarmonic;

      for (let i = startIndex; i < endIndex; i++) {
        transformed.waveFunction.setDimension(
          i,
          dimensions[i].scale(weight)
        );
      }
    }

    return this.createResult(state, transformed, 'harmonic-enhancement', {
      harmonicWeights: weights
    });
  }

  private calculateCoherence(wave1: WaveFunction, wave2: WaveFunction): number {
    const dims1 = wave1.getDimensions();
    const dims2 = wave2.getDimensions();
    let coherence = 0;

    for (let i = 0; i < dims1.length; i++) {
      const phase1 = Math.atan2(dims1[i].imag, dims1[i].real);
      const phase2 = Math.atan2(dims2[i].imag, dims2[i].real);
      coherence += Math.cos(phase1 - phase2);
    }

    return Math.abs(coherence / dims1.length);
  }

  private calculateFidelity(original: WaveFunction, transformed: WaveFunction): number {
    const overlap = original.innerProduct(transformed);
    return Math.abs(overlap.real * overlap.real + overlap.imag * overlap.imag);
  }

  private calculateEntanglement(state: EncodedState, allStates: EncodedState[]): number {
    if (state.connections.length === 0) return 0;

    let totalEntanglement = 0;
    state.connections.forEach(connectionId => {
      const connectedState = allStates.find(s => s.sourceNode.id === connectionId);
      if (connectedState) {
        totalEntanglement += this.calculateCoherence(
          state.waveFunction,
          connectedState.waveFunction
        );
      }
    });

    return totalEntanglement / state.connections.length;
  }

  private cloneState(state: EncodedState): EncodedState {
    return {
      waveFunction: new WaveFunction(state.waveFunction.getDimensions().length),
      sourceNode: state.sourceNode,
      connections: [...state.connections],
      metadata: {
        ...state.metadata,
        timestamp: Date.now()
      }
    };
  }

  private createResult(
    original: EncodedState,
    transformed: EncodedState,
    type: TransformationType,
    parameters: TransformationOptions
  ): TransformationResult {
    return {
      originalState: original,
      transformedState: transformed,
      transformationType: type,
      parameters: {
        ...this.defaultOptions,
        ...parameters
      },
      metrics: {
        fidelity: this.calculateFidelity(
          original.waveFunction,
          transformed.waveFunction
        ),
        coherence: this.calculateCoherence(
          original.waveFunction,
          transformed.waveFunction
        ),
        entanglement: this.calculateEntanglement(transformed, [original, transformed])
      }
    };
  }
}

import { Complex } from './complex';
import { WaveFunction } from './wavefunction';
import { EncodedState } from './encoder';

export interface EvolutionOperator {
  name: string;
  apply: (state: WaveFunction, time: number) => void;
  parameters: Record<string, number>;
}

export interface TimeStep {
  time: number;
  states: EncodedState[];
  metrics: {
    totalEnergy: number;
    averageCoherence: number;
    entanglementEntropy: number;
  };
}

export interface EvolutionOptions {
  timeStep: number;
  totalTime: number;
  operators: EvolutionOperator[];
  preserveConnections: boolean;
  trackMetrics: boolean;
}

export class QuantumEvolution {
  public options: Required<EvolutionOptions>;

  setOperators(operators: EvolutionOperator[]): void {
    this.options.operators = operators;
  }
  private history: TimeStep[];

  constructor(options: Partial<EvolutionOptions> = {}) {
    this.options = {
      timeStep: 0.01,
      totalTime: 1.0,
      operators: [],
      preserveConnections: true,
      trackMetrics: true,
      ...options
    };
    this.history = [];
  }

  evolveState(initialState: EncodedState): TimeStep[] {
    this.history = [];
    let currentTime = 0;
    const currentState = this.cloneState(initialState);

    while (currentTime <= this.options.totalTime) {
      // Apply all operators
      this.options.operators.forEach(operator => {
        operator.apply(currentState.waveFunction, currentTime);
      });

      // Normalize the wavefunction
      currentState.waveFunction.normalize();

      // Record the time step
      this.recordTimeStep([currentState], currentTime);

      currentTime += this.options.timeStep;
    }

    return this.history;
  }

  evolveStates(initialStates: EncodedState[]): TimeStep[] {
    this.history = [];
    let currentTime = 0;
    const currentStates = initialStates.map(state => this.cloneState(state));

    while (currentTime <= this.options.totalTime) {
      // Apply operators to each state
      currentStates.forEach(state => {
        this.options.operators.forEach(operator => {
          operator.apply(state.waveFunction, currentTime);
        });
      });

      // Apply interaction effects between states
      if (this.options.preserveConnections) {
        this.applyInteractions(currentStates, currentTime);
      }

      // Normalize all wavefunctions
      currentStates.forEach(state => state.waveFunction.normalize());

      // Record the time step
      this.recordTimeStep(currentStates, currentTime);

      currentTime += this.options.timeStep;
    }

    return this.history;
  }

  // Built-in evolution operators
  static createHarmonicOperator(frequency: number, amplitude: number): EvolutionOperator {
    return {
      name: 'harmonic',
      parameters: { frequency, amplitude },
      apply: (state: WaveFunction, time: number) => {
        const dimensions = state.getDimensions();
        for (let i = 0; i < dimensions.length; i++) {
          const phase = frequency * time;
          const oscillation = Math.cos(phase) * amplitude;
          state.setDimension(
            i,
            dimensions[i].scale(1 + oscillation)
          );
        }
      }
    };
  }

  static createDissipationOperator(rate: number): EvolutionOperator {
    return {
      name: 'dissipation',
      parameters: { rate },
      apply: (state: WaveFunction, time: number) => {
        const decay = Math.exp(-rate * time);
        const dimensions = state.getDimensions();
        for (let i = 0; i < dimensions.length; i++) {
          state.setDimension(i, dimensions[i].scale(decay));
        }
      }
    };
  }

  static createPhaseEvolutionOperator(frequency: number): EvolutionOperator {
    return {
      name: 'phase-evolution',
      parameters: { frequency },
      apply: (state: WaveFunction, time: number) => {
        const phase = frequency * time;
        const dimensions = state.getDimensions();
        for (let i = 0; i < dimensions.length; i++) {
          const dim = dimensions[i];
          const magnitude = Math.sqrt(dim.real * dim.real + dim.imag * dim.imag);
          const currentPhase = Math.atan2(dim.imag, dim.real);
          const newPhase = currentPhase + phase;
          state.setDimension(
            i,
            Complex.fromPolar(magnitude, newPhase)
          );
        }
      }
    };
  }

  private applyInteractions(states: EncodedState[], time: number): void {
    states.forEach(state => {
      state.connections.forEach(connectionId => {
        const connectedState = states.find(s => s.sourceNode.id === connectionId);
        if (connectedState) {
          this.applyEntanglement(state.waveFunction, connectedState.waveFunction, time);
        }
      });
    });
  }

  private applyEntanglement(wave1: WaveFunction, wave2: WaveFunction, time: number): void {
    const dims1 = wave1.getDimensions();
    const dims2 = wave2.getDimensions();
    const entanglementStrength = Math.sin(time) * 0.1; // Oscillating entanglement

    for (let i = 0; i < dims1.length; i++) {
      const superposition = dims1[i].add(dims2[i]).scale(0.5);
      const entangledState1 = dims1[i].scale(1 - entanglementStrength)
        .add(superposition.scale(entanglementStrength));
      const entangledState2 = dims2[i].scale(1 - entanglementStrength)
        .add(superposition.scale(entanglementStrength));

      wave1.setDimension(i, entangledState1);
      wave2.setDimension(i, entangledState2);
    }
  }

  private recordTimeStep(states: EncodedState[], time: number): void {
    if (!this.options.trackMetrics) {
      this.history.push({ time, states, metrics: this.calculateMetrics(states) });
      return;
    }

    const metrics = this.calculateMetrics(states);
    this.history.push({ time, states: states.map(s => this.cloneState(s)), metrics });
  }

  private calculateMetrics(states: EncodedState[]): TimeStep['metrics'] {
    let totalEnergy = 0;
    let totalCoherence = 0;
    let entanglementEntropy = 0;

    states.forEach(state => {
      // Calculate energy from amplitudes
      const dimensions = state.waveFunction.getDimensions();
      dimensions.forEach(dim => {
        totalEnergy += dim.real * dim.real + dim.imag * dim.imag;
      });

      // Calculate coherence between connected states
      state.connections.forEach(connectionId => {
        const connectedState = states.find(s => s.sourceNode.id === connectionId);
        if (connectedState) {
          totalCoherence += this.calculateCoherence(
            state.waveFunction,
            connectedState.waveFunction
          );
        }
      });

      // Calculate entanglement entropy
      entanglementEntropy += this.calculateEntanglementEntropy(state.waveFunction);
    });

    const connectionCount = states.reduce((sum, state) => sum + state.connections.length, 0);
    const averageCoherence = connectionCount > 0 ? totalCoherence / connectionCount : 0;

    return {
      totalEnergy,
      averageCoherence,
      entanglementEntropy: entanglementEntropy / states.length
    };
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

  private calculateEntanglementEntropy(wave: WaveFunction): number {
    const dimensions = wave.getDimensions();
    let entropy = 0;

    dimensions.forEach(dim => {
      const probability = dim.real * dim.real + dim.imag * dim.imag;
      if (probability > 0) {
        entropy -= probability * Math.log(probability);
      }
    });

    return entropy;
  }

  private cloneState(state: EncodedState): EncodedState {
    return {
      waveFunction: new WaveFunction(state.waveFunction.getDimensions().length),
      sourceNode: state.sourceNode,
      connections: [...state.connections],
      metadata: { ...state.metadata }
    };
  }
}

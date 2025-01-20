import { EncodedState } from '../quantum/encoder';
import { WaveFunction } from '../quantum/wavefunction';

export interface Pattern {
  type: 'cluster' | 'sequence' | 'similarity' | 'anomaly';
  states: string[];
  score: number;
  properties: {
    size?: number;
    density?: number;
    coherence?: number;
    stability?: number;
    significance?: number;
    [key: string]: number | undefined;
  };
  metadata: {
    timestamp: number;
    algorithm: string;
    parameters: Record<string, number>;
  };
}

export interface PatternDetectionOptions {
  minClusterSize: number;
  similarityThreshold: number;
  coherenceWeight: number;
  amplitudeWeight: number;
  phaseWeight: number;
  maxPatterns: number;
}

export class PatternDetector {
  private options: Required<PatternDetectionOptions>;

  constructor(options: Partial<PatternDetectionOptions> = {}) {
    this.options = {
      minClusterSize: 3,
      similarityThreshold: 0.7,
      coherenceWeight: 0.4,
      amplitudeWeight: 0.3,
      phaseWeight: 0.3,
      maxPatterns: 10,
      ...options
    };
  }

  detectPatterns(states: EncodedState[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Detect different types of patterns
    const clusters = this.detectClusters(states);
    const sequences = this.detectSequences(states);
    const similarities = this.detectSimilarities(states);
    const anomalies = this.detectAnomalies(states);

    patterns.push(...clusters, ...sequences, ...similarities, ...anomalies);

    // Sort by score and limit number of patterns
    return patterns
      .sort((a, b) => b.score - a.score)
      .slice(0, this.options.maxPatterns);
  }

  private detectClusters(states: EncodedState[]): Pattern[] {
    const patterns: Pattern[] = [];
    const visited = new Set<string>();

    states.forEach(state => {
      if (visited.has(state.sourceNode.id)) return;

      const cluster = this.expandCluster(state, states, visited);
      if (cluster.length >= this.options.minClusterSize) {
        const coherence = this.calculateClusterCoherence(cluster);
        const density = this.calculateClusterDensity(cluster, states.length);

        patterns.push({
          type: 'cluster',
          states: cluster.map(s => s.sourceNode.id),
          score: (coherence + density) / 2,
          properties: {
            size: cluster.length,
            density,
            coherence,
            stability: this.calculateClusterStability(cluster)
          },
          metadata: {
            timestamp: Date.now(),
            algorithm: 'density-based-clustering',
            parameters: {
              minSize: this.options.minClusterSize,
              similarityThreshold: this.options.similarityThreshold
            }
          }
        });
      }
    });

    return patterns;
  }

  private detectSequences(states: EncodedState[]): Pattern[] {
    const patterns: Pattern[] = [];
    const visited = new Set<string>();

    states.forEach(state => {
      if (visited.has(state.sourceNode.id)) return;

      const sequence = this.findSequence(state, states, visited);
      if (sequence.length >= this.options.minClusterSize) {
        const coherence = this.calculateSequenceCoherence(sequence);
        
        patterns.push({
          type: 'sequence',
          states: sequence.map(s => s.sourceNode.id),
          score: coherence,
          properties: {
            size: sequence.length,
            coherence,
            stability: this.calculateSequenceStability(sequence)
          },
          metadata: {
            timestamp: Date.now(),
            algorithm: 'sequential-pattern-mining',
            parameters: {
              minSize: this.options.minClusterSize,
              coherenceWeight: this.options.coherenceWeight
            }
          }
        });
      }
    });

    return patterns;
  }

  private detectSimilarities(states: EncodedState[]): Pattern[] {
    const patterns: Pattern[] = [];
    const visited = new Set<string>();

    for (let i = 0; i < states.length; i++) {
      if (visited.has(states[i].sourceNode.id)) continue;

      const similarStates = states.filter((state, j) => 
        i !== j && 
        !visited.has(state.sourceNode.id) &&
        this.calculateStateSimilarity(states[i], state) >= this.options.similarityThreshold
      );

      if (similarStates.length > 0) {
        const group = [states[i], ...similarStates];
        group.forEach(state => visited.add(state.sourceNode.id));

        const avgSimilarity = this.calculateAverageSimilarity(group);
        patterns.push({
          type: 'similarity',
          states: group.map(s => s.sourceNode.id),
          score: avgSimilarity,
          properties: {
            size: group.length,
            coherence: this.calculateGroupCoherence(group),
            significance: avgSimilarity
          },
          metadata: {
            timestamp: Date.now(),
            algorithm: 'similarity-grouping',
            parameters: {
              threshold: this.options.similarityThreshold
            }
          }
        });
      }
    }

    return patterns;
  }

  private detectAnomalies(states: EncodedState[]): Pattern[] {
    const patterns: Pattern[] = [];
    
    // Calculate average properties
    const avgAmplitude = this.calculateAverageAmplitude(states);
    const avgCoherence = this.calculateAverageCoherence(states);
    const avgConnections = this.calculateAverageConnections(states);

    states.forEach(state => {
      const amplitudeDeviation = Math.abs(state.waveFunction.getAmplitude() - avgAmplitude);
      const coherenceDeviation = Math.abs(this.calculateStateCoherence(state) - avgCoherence);
      const connectionsDeviation = Math.abs(state.connections.length - avgConnections);

      const anomalyScore = (
        amplitudeDeviation * this.options.amplitudeWeight +
        coherenceDeviation * this.options.coherenceWeight +
        connectionsDeviation / avgConnections * (1 - this.options.amplitudeWeight - this.options.coherenceWeight)
      );

      if (anomalyScore > this.options.similarityThreshold) {
        patterns.push({
          type: 'anomaly',
          states: [state.sourceNode.id],
          score: anomalyScore,
          properties: {
            significance: anomalyScore,
            amplitudeDeviation,
            coherenceDeviation,
            connectionsDeviation
          },
          metadata: {
            timestamp: Date.now(),
            algorithm: 'statistical-anomaly-detection',
            parameters: {
              amplitudeWeight: this.options.amplitudeWeight,
              coherenceWeight: this.options.coherenceWeight
            }
          }
        });
      }
    });

    return patterns;
  }

  private expandCluster(
    state: EncodedState,
    states: EncodedState[],
    visited: Set<string>
  ): EncodedState[] {
    const cluster: EncodedState[] = [state];
    visited.add(state.sourceNode.id);

    const queue = [...state.connections];
    while (queue.length > 0) {
      const connectionId = queue.shift()!;
      if (visited.has(connectionId)) continue;

      const connectedState = states.find(s => s.sourceNode.id === connectionId);
      if (!connectedState) continue;

      if (this.calculateStateSimilarity(state, connectedState) >= this.options.similarityThreshold) {
        cluster.push(connectedState);
        visited.add(connectionId);
        queue.push(...connectedState.connections);
      }
    }

    return cluster;
  }

  private findSequence(
    state: EncodedState,
    states: EncodedState[],
    visited: Set<string>
  ): EncodedState[] {
    const sequence: EncodedState[] = [state];
    visited.add(state.sourceNode.id);

    let currentState = state;
    while (true) {
      const nextState = this.findMostCoherentConnection(currentState, states, visited);
      if (!nextState) break;

      sequence.push(nextState);
      visited.add(nextState.sourceNode.id);
      currentState = nextState;
    }

    return sequence;
  }

  private findMostCoherentConnection(
    state: EncodedState,
    states: EncodedState[],
    visited: Set<string>
  ): EncodedState | undefined {
    let maxCoherence = -1;
    let mostCoherentState: EncodedState | undefined;

    state.connections.forEach(connectionId => {
      if (visited.has(connectionId)) return;

      const connectedState = states.find(s => s.sourceNode.id === connectionId);
      if (!connectedState) return;

      const coherence = this.calculateStateCoherence(connectedState);
      if (coherence > maxCoherence) {
        maxCoherence = coherence;
        mostCoherentState = connectedState;
      }
    });

    return mostCoherentState;
  }

  private calculateStateSimilarity(state1: EncodedState, state2: EncodedState): number {
    const amplitudeSimilarity = 1 - Math.abs(
      state1.waveFunction.getAmplitude() - state2.waveFunction.getAmplitude()
    );

    const phaseSimilarity = 1 - Math.abs(
      state1.waveFunction.getPhase() - state2.waveFunction.getPhase()
    ) / (2 * Math.PI);

    const dimensionSimilarity = this.calculateWavefunctionSimilarity(
      state1.waveFunction,
      state2.waveFunction
    );

    return (
      amplitudeSimilarity * this.options.amplitudeWeight +
      phaseSimilarity * this.options.phaseWeight +
      dimensionSimilarity * (1 - this.options.amplitudeWeight - this.options.phaseWeight)
    );
  }

  private calculateWavefunctionSimilarity(wave1: WaveFunction, wave2: WaveFunction): number {
    const dims1 = wave1.getDimensions();
    const dims2 = wave2.getDimensions();
    let similarity = 0;

    for (let i = 0; i < dims1.length; i++) {
      const mag1 = Math.sqrt(dims1[i].real * dims1[i].real + dims1[i].imag * dims1[i].imag);
      const mag2 = Math.sqrt(dims2[i].real * dims2[i].real + dims2[i].imag * dims2[i].imag);
      similarity += 1 - Math.abs(mag1 - mag2);
    }

    return similarity / dims1.length;
  }

  private calculateClusterCoherence(cluster: EncodedState[]): number {
    let totalCoherence = 0;
    let pairs = 0;

    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        totalCoherence += this.calculateStateSimilarity(cluster[i], cluster[j]);
        pairs++;
      }
    }

    return pairs > 0 ? totalCoherence / pairs : 0;
  }

  private calculateClusterDensity(cluster: EncodedState[], totalStates: number): number {
    const connections = new Set<string>();
    cluster.forEach(state => {
      state.connections.forEach(conn => connections.add(conn));
    });

    const internalConnections = Array.from(connections).filter(conn =>
      cluster.some(state => state.sourceNode.id === conn)
    );

    return internalConnections.length / (cluster.length * (totalStates - 1));
  }

  private calculateClusterStability(cluster: EncodedState[]): number {
    const amplitudes = cluster.map(state => state.waveFunction.getAmplitude());
    const phases = cluster.map(state => state.waveFunction.getPhase());

    const amplitudeVariance = this.calculateVariance(amplitudes);
    const phaseVariance = this.calculateVariance(phases);

    return Math.exp(-(amplitudeVariance + phaseVariance));
  }

  private calculateSequenceCoherence(sequence: EncodedState[]): number {
    let totalCoherence = 0;

    for (let i = 1; i < sequence.length; i++) {
      totalCoherence += this.calculateStateSimilarity(sequence[i - 1], sequence[i]);
    }

    return sequence.length > 1 ? totalCoherence / (sequence.length - 1) : 0;
  }

  private calculateSequenceStability(sequence: EncodedState[]): number {
    const changes: number[] = [];

    for (let i = 1; i < sequence.length; i++) {
      changes.push(this.calculateStateSimilarity(sequence[i - 1], sequence[i]));
    }

    return 1 - this.calculateVariance(changes);
  }

  private calculateAverageSimilarity(states: EncodedState[]): number {
    let totalSimilarity = 0;
    let pairs = 0;

    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        totalSimilarity += this.calculateStateSimilarity(states[i], states[j]);
        pairs++;
      }
    }

    return pairs > 0 ? totalSimilarity / pairs : 0;
  }

  private calculateGroupCoherence(states: EncodedState[]): number {
    const coherences = states.map(state => this.calculateStateCoherence(state));
    return coherences.reduce((sum, c) => sum + c, 0) / coherences.length;
  }

  private calculateStateCoherence(state: EncodedState): number {
    const dimensions = state.waveFunction.getDimensions();
    let coherence = 0;

    for (let i = 1; i < dimensions.length; i++) {
      const phase1 = Math.atan2(dimensions[i - 1].imag, dimensions[i - 1].real);
      const phase2 = Math.atan2(dimensions[i].imag, dimensions[i].real);
      coherence += Math.cos(phase1 - phase2);
    }

    return (coherence / (dimensions.length - 1) + 1) / 2;
  }

  private calculateAverageAmplitude(states: EncodedState[]): number {
    return states.reduce((sum, state) => 
      sum + state.waveFunction.getAmplitude(), 0
    ) / states.length;
  }

  private calculateAverageCoherence(states: EncodedState[]): number {
    return states.reduce((sum, state) => 
      sum + this.calculateStateCoherence(state), 0
    ) / states.length;
  }

  private calculateAverageConnections(states: EncodedState[]): number {
    return states.reduce((sum, state) => 
      sum + state.connections.length, 0
    ) / states.length;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => (v - mean) * (v - mean));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  }
}

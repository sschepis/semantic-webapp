import { TimeStep } from '../quantum/evolution';

export interface TemporalPattern {
  type: 'oscillation' | 'decay' | 'growth' | 'phase-shift' | 'entanglement';
  startTime: number;
  duration: number;
  frequency?: number;
  amplitude?: number;
  rate?: number;
  confidence: number;
  affectedStates: string[];
  metrics: {
    strength: number;
    coherence: number;
    stability: number;
  };
}

export interface AnalysisOptions {
  minPatternDuration: number;
  confidenceThreshold: number;
  frequencyResolution: number;
  amplitudeThreshold: number;
  maxPatterns: number;
}

export class TemporalAnalyzer {
  private options: Required<AnalysisOptions>;

  constructor(options: Partial<AnalysisOptions> = {}) {
    this.options = {
      minPatternDuration: 0.1,
      confidenceThreshold: 0.7,
      frequencyResolution: 0.01,
      amplitudeThreshold: 0.1,
      maxPatterns: 10,
      ...options
    };
  }

  analyzeTimeSeries(timeSteps: TimeStep[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];

    // Analyze each state's evolution
    const stateIds = this.getUniqueStateIds(timeSteps);
    stateIds.forEach(id => {
      const statePatterns = this.analyzeStateEvolution(id, timeSteps);
      patterns.push(...statePatterns);
    });

    // Analyze system-wide patterns
    const systemPatterns = this.analyzeSystemPatterns(timeSteps);
    patterns.push(...systemPatterns);

    // Sort by confidence and limit number of patterns
    return patterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.options.maxPatterns);
  }

  private analyzeStateEvolution(stateId: string, timeSteps: TimeStep[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];
    const timeSeries = this.extractStateTimeSeries(stateId, timeSteps);

    // Detect oscillations
    const oscillations = this.detectOscillations(timeSeries);
    patterns.push(...oscillations);

    // Detect exponential patterns (growth/decay)
    const exponentials = this.detectExponentialPatterns(timeSeries);
    patterns.push(...exponentials);

    // Detect phase shifts
    const phaseShifts = this.detectPhaseShifts(stateId, timeSteps);
    patterns.push(...phaseShifts);

    return patterns;
  }

  private analyzeSystemPatterns(timeSteps: TimeStep[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];

    // Analyze coherence evolution
    const coherencePatterns = this.analyzeCoherencePatterns(timeSteps);
    patterns.push(...coherencePatterns);

    // Analyze entanglement dynamics
    const entanglementPatterns = this.analyzeEntanglementPatterns(timeSteps);
    patterns.push(...entanglementPatterns);

    return patterns;
  }

  private detectOscillations(timeSeries: { time: number; value: number }[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];
    const values = timeSeries.map(point => point.value);
    const times = timeSeries.map(point => point.time);

    // Perform FFT analysis
    const frequencies = this.performFFT(values);
    const significantFreqs = this.findSignificantFrequencies(frequencies);

    significantFreqs.forEach(({ frequency, amplitude }) => {
      if (amplitude > this.options.amplitudeThreshold) {
        const duration = times[times.length - 1] - times[0];
        if (duration >= this.options.minPatternDuration) {
          patterns.push({
            type: 'oscillation',
            startTime: times[0],
            duration,
            frequency,
            amplitude,
            confidence: this.calculateOscillationConfidence(amplitude, frequency),
            affectedStates: [timeSeries[0].toString()],
            metrics: {
              strength: amplitude,
              coherence: this.calculateOscillationCoherence(values, frequency),
              stability: this.calculatePatternStability(values)
            }
          });
        }
      }
    });

    return patterns;
  }

  private detectExponentialPatterns(timeSeries: { time: number; value: number }[]): TemporalPattern[] {
    const values = timeSeries.map(point => point.value);
    const times = timeSeries.map(point => point.time);
    const logValues = values.map(v => Math.log(Math.abs(v) + 1e-10));

    // Linear regression on log values to detect exponential patterns
    const { slope, r2 } = this.linearRegression(times, logValues);
    
    if (Math.abs(slope) > this.options.amplitudeThreshold && r2 > this.options.confidenceThreshold) {
      const duration = times[times.length - 1] - times[0];
      if (duration >= this.options.minPatternDuration) {
        return [{
          type: slope > 0 ? 'growth' : 'decay',
          startTime: times[0],
          duration,
          rate: Math.abs(slope),
          confidence: r2,
          affectedStates: [timeSeries[0].toString()],
          metrics: {
            strength: Math.abs(slope),
            coherence: r2,
            stability: this.calculatePatternStability(values)
          }
        }];
      }
    }

    return [];
  }

  private detectPhaseShifts(stateId: string, timeSteps: TimeStep[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];
    const phases = this.extractPhases(stateId, timeSteps);
    
    let currentShift = 0;
    let shiftStartTime = timeSteps[0].time;
    
    for (let i = 1; i < phases.length; i++) {
      const phaseDiff = this.calculatePhaseDifference(phases[i - 1], phases[i]);
      currentShift += phaseDiff;

      if (Math.abs(currentShift) > Math.PI / 4) { // Significant phase shift threshold
        const duration = timeSteps[i].time - shiftStartTime;
        if (duration >= this.options.minPatternDuration) {
          patterns.push({
            type: 'phase-shift',
            startTime: shiftStartTime,
            duration,
            amplitude: Math.abs(currentShift),
            confidence: this.calculatePhaseShiftConfidence(currentShift, duration),
            affectedStates: [stateId],
            metrics: {
              strength: Math.abs(currentShift) / Math.PI,
              coherence: this.calculatePhaseCoherence(phases.slice(i - 1, i + 1)),
              stability: this.calculatePatternStability(phases)
            }
          });
        }
        currentShift = 0;
        shiftStartTime = timeSteps[i].time;
      }
    }

    return patterns;
  }

  private analyzeCoherencePatterns(timeSteps: TimeStep[]): TemporalPattern[] {
    const coherenceValues = timeSteps.map(step => step.metrics.averageCoherence);
    const times = timeSteps.map(step => step.time);

    const patterns: TemporalPattern[] = [];
    let currentPattern: { start: number; values: number[] } | null = null;

    // Detect sustained coherence changes
    for (let i = 1; i < coherenceValues.length; i++) {
      const change = coherenceValues[i] - coherenceValues[i - 1];
      
      if (Math.abs(change) > this.options.amplitudeThreshold) {
        if (!currentPattern) {
          currentPattern = { start: times[i - 1], values: [coherenceValues[i - 1]] };
        }
        currentPattern.values.push(coherenceValues[i]);
      } else if (currentPattern) {
        const duration = times[i] - currentPattern.start;
        if (duration >= this.options.minPatternDuration) {
          patterns.push({
            type: 'entanglement',
            startTime: currentPattern.start,
            duration,
            amplitude: Math.max(...currentPattern.values) - Math.min(...currentPattern.values),
            confidence: this.calculateCoherenceConfidence(currentPattern.values),
            affectedStates: this.getAffectedStates(timeSteps[i]),
            metrics: {
              strength: this.calculateAverageChange(currentPattern.values),
              coherence: this.calculatePatternCoherence(currentPattern.values),
              stability: this.calculatePatternStability(currentPattern.values)
            }
          });
        }
        currentPattern = null;
      }
    }

    return patterns;
  }

  private analyzeEntanglementPatterns(timeSteps: TimeStep[]): TemporalPattern[] {
    const entropyValues = timeSteps.map(step => step.metrics.entanglementEntropy);
    const times = timeSteps.map(step => step.time);
    const patterns: TemporalPattern[] = [];

    // Detect significant entanglement changes
    for (let i = 1; i < entropyValues.length - 1; i++) {
      const prevDiff = entropyValues[i] - entropyValues[i - 1];
      const nextDiff = entropyValues[i + 1] - entropyValues[i];

      // Detect entanglement events (peaks or valleys in entropy)
      if (Math.sign(prevDiff) !== Math.sign(nextDiff) && 
          Math.abs(prevDiff) > this.options.amplitudeThreshold) {
        const duration = times[i + 1] - times[i - 1];
        if (duration >= this.options.minPatternDuration) {
          patterns.push({
            type: 'entanglement',
            startTime: times[i - 1],
            duration,
            amplitude: Math.abs(prevDiff),
            confidence: this.calculateEntanglementConfidence(
              entropyValues.slice(i - 1, i + 2)
            ),
            affectedStates: this.getAffectedStates(timeSteps[i]),
            metrics: {
              strength: Math.abs(prevDiff),
              coherence: timeSteps[i].metrics.averageCoherence,
              stability: this.calculatePatternStability(
                entropyValues.slice(i - 1, i + 2)
              )
            }
          });
        }
      }
    }

    return patterns;
  }

  // Utility methods
  private getUniqueStateIds(timeSteps: TimeStep[]): string[] {
    const ids = new Set<string>();
    timeSteps.forEach(step => {
      step.states.forEach(state => ids.add(state.sourceNode.id));
    });
    return Array.from(ids);
  }

  private extractStateTimeSeries(stateId: string, timeSteps: TimeStep[]): { time: number; value: number }[] {
    return timeSteps.map(step => ({
      time: step.time,
      value: step.states.find(s => s.sourceNode.id === stateId)?.waveFunction.getAmplitude() || 0
    }));
  }

  private extractPhases(stateId: string, timeSteps: TimeStep[]): number[] {
    return timeSteps.map(step => {
      const state = step.states.find(s => s.sourceNode.id === stateId);
      return state ? state.waveFunction.getPhase() : 0;
    });
  }

  private calculatePhaseDifference(phase1: number, phase2: number): number {
    let diff = phase2 - phase1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
  }

  private getAffectedStates(timeStep: TimeStep): string[] {
    return timeStep.states.map(state => state.sourceNode.id);
  }

  // Statistical methods
  private performFFT(values: number[]): { frequency: number; amplitude: number }[] {
    // Simple FFT implementation for demonstration
    const frequencies: { frequency: number; amplitude: number }[] = [];
    const n = values.length;

    for (let k = 0; k < n / 2; k++) {
      let real = 0;
      let imag = 0;

      for (let t = 0; t < n; t++) {
        const angle = (2 * Math.PI * k * t) / n;
        real += values[t] * Math.cos(angle);
        imag -= values[t] * Math.sin(angle);
      }

      const amplitude = Math.sqrt(real * real + imag * imag) / n;
      const frequency = k * this.options.frequencyResolution;
      
      frequencies.push({ frequency, amplitude });
    }

    return frequencies;
  }

  private findSignificantFrequencies(frequencies: { frequency: number; amplitude: number }[]): { frequency: number; amplitude: number }[] {
    const meanAmplitude = frequencies.reduce((sum, f) => sum + f.amplitude, 0) / frequencies.length;
    const threshold = meanAmplitude * 2; // Adjust threshold as needed

    return frequencies.filter(f => f.amplitude > threshold);
  }

  private linearRegression(x: number[], y: number[]): { slope: number; r2: number } {
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
      sumYY += y[i] * y[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const totalSS = sumYY - (sumY * sumY) / n;
    let residualSS = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      residualSS += (y[i] - predicted) * (y[i] - predicted);
    }
    const r2 = 1 - residualSS / totalSS;

    return { slope, r2 };
  }

  private calculatePatternStability(values: number[]): number {
    const diffs = [];
    for (let i = 1; i < values.length; i++) {
      diffs.push(Math.abs(values[i] - values[i - 1]));
    }
    const meanDiff = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
    return Math.exp(-meanDiff); // Convert to [0,1] scale
  }

  private calculateAverageChange(values: number[]): number {
    let totalChange = 0;
    for (let i = 1; i < values.length; i++) {
      totalChange += Math.abs(values[i] - values[i - 1]);
    }
    return totalChange / (values.length - 1);
  }

  private calculatePatternCoherence(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / values.length;
    return Math.exp(-variance); // Convert to [0,1] scale
  }

  private calculateOscillationConfidence(amplitude: number, frequency: number): number {
    return Math.min(1, amplitude * Math.sqrt(frequency));
  }

  private calculateOscillationCoherence(values: number[], frequency: number): number {
    const period = 1 / frequency;
    const samplesPerPeriod = Math.floor(values.length * period);
    if (samplesPerPeriod < 2) return 0;

    let coherence = 0;
    for (let i = 0; i < values.length - samplesPerPeriod; i++) {
      const correlation = this.correlate(
        values.slice(i, i + samplesPerPeriod),
        values.slice(i + samplesPerPeriod, i + 2 * samplesPerPeriod)
      );
      coherence += correlation;
    }

    return Math.max(0, coherence / (values.length - samplesPerPeriod));
  }

  private calculatePhaseShiftConfidence(shift: number, duration: number): number {
    return Math.min(1, Math.abs(shift) / Math.PI * Math.sqrt(duration));
  }

  private calculatePhaseCoherence(phases: number[]): number {
    let coherence = 0;
    for (let i = 1; i < phases.length; i++) {
      coherence += Math.cos(this.calculatePhaseDifference(phases[i - 1], phases[i]));
    }
    return (coherence / (phases.length - 1) + 1) / 2; // Normalize to [0,1]
  }

  private calculateCoherenceConfidence(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const maxDev = Math.max(...values.map(v => Math.abs(v - mean)));
    return Math.min(1, maxDev / mean);
  }

  private calculateEntanglementConfidence(values: number[]): number {
    const changes = values.map((v, i) => i > 0 ? Math.abs(v - values[i - 1]) : 0);
    const maxChange = Math.max(...changes);
    return Math.min(1, maxChange * 2);
  }

  private correlate(array1: number[], array2: number[]): number {
    const n = Math.min(array1.length, array2.length);
    let sum = 0;
    
    for (let i = 0; i < n; i++) {
      sum += array1[i] * array2[i];
    }
    
    return sum / n;
  }
}

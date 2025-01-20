import { Complex } from './complex';
import { QuantumField } from './field';

interface LearningContext {
  position?: number;
  precedingWords?: string[];
  followingWords?: string[];
  sentencePosition?: number;
}

export class FieldLearner {
  private readonly fieldDimensions: number;
  private readonly learningRate: number;
  private readonly momentum: number;
  private readonly decayFactor: number;
  private fieldMemory: Map<string, QuantumField>;
  private resonanceHistory: Map<string, number[]>;

  constructor(
    fieldDimensions: number = 512,
    learningRate: number = 0.01,
    momentum: number = 0.9,
    decayFactor: number = 0.99
  ) {
    this.fieldDimensions = fieldDimensions;
    this.learningRate = learningRate;
    this.momentum = momentum;
    this.decayFactor = decayFactor;
    this.fieldMemory = new Map();
    this.resonanceHistory = new Map();
  }

  private getFieldKey(field: QuantumField, context?: LearningContext): string {
    const values = field.getValues();
    const spectral = field.getSpectralPattern();
    return JSON.stringify({
      values: values.map(v => [v.real, v.imag]),
      spectral: spectral.map(v => [v.real, v.imag]),
      context
    });
  }

  private updateResonanceHistory(key: string, resonance: number) {
    if (!this.resonanceHistory.has(key)) {
      this.resonanceHistory.set(key, []);
    }
    const history = this.resonanceHistory.get(key)!;
    history.push(resonance);
    
    // Keep only recent history
    if (history.length > 100) {
      history.shift();
    }
    
    // Apply decay to older resonances
    for (let i = 0; i < history.length; i++) {
      history[i] *= Math.pow(this.decayFactor, history.length - i - 1);
    }
  }

  private computeFieldAdjustment(
    sourceField: QuantumField,
    targetField: QuantumField,
    resonance: number
  ): QuantumField {
    const adjustment = new QuantumField(this.fieldDimensions);
    const sourceValues = sourceField.getValues();
    const targetValues = targetField.getValues();
    
    // Compute phase-aware adjustment
    for (let i = 0; i < this.fieldDimensions; i++) {
      const sourcePhase = sourceValues[i].phase();
      const targetPhase = targetValues[i].phase();
      const phaseDiff = targetPhase - sourcePhase;
      
      // Create adjustment based on phase difference and resonance
      const magnitude = resonance * this.learningRate;
      const phase = phaseDiff * this.momentum;
      
      adjustment.getValues()[i] = Complex.fromPolar(magnitude, phase);
    }
    
    adjustment.normalize();
    return adjustment;
  }

  learnFromInteraction(
    sourceField: QuantumField,
    targetField: QuantumField,
    resonance: number,
    context?: LearningContext
  ): void {
    const sourceKey = this.getFieldKey(sourceField, context);
    const targetKey = this.getFieldKey(targetField, context);
    
    // Update resonance history
    this.updateResonanceHistory(sourceKey, resonance);
    
    // Compute field adjustments
    const adjustment = this.computeFieldAdjustment(
      sourceField,
      targetField,
      resonance
    );
    
    // Store adjusted fields in memory
    const adjustedSource = sourceField.add(adjustment);
    adjustedSource.normalize();
    this.fieldMemory.set(sourceKey, adjustedSource);
    
    // Also store target field for future reference
    this.fieldMemory.set(targetKey, targetField);
  }

  getResonancePattern(field: QuantumField, context?: LearningContext): number[] {
    const key = this.getFieldKey(field, context);
    return this.resonanceHistory.get(key) || [];
  }

  findSimilarFields(
    field: QuantumField,
    threshold: number = 0.8,
    context?: LearningContext
  ): QuantumField[] {
    const similar: QuantumField[] = [];
    const fieldKey = this.getFieldKey(field, context);
    
    for (const [storedKey, storedField] of this.fieldMemory.entries()) {
      // Skip self-comparison
      if (storedKey === fieldKey) continue;
      const resonance = field.computeResonance(storedField);
      const phaseCoherence = field.computePhaseCoherence(storedField);
      
      // Consider both resonance and phase coherence
      const similarity = (resonance + phaseCoherence) / 2;
      
      if (similarity >= threshold) {
        similar.push(storedField);
      }
    }
    
    return similar;
  }

  clearMemory(): void {
    this.fieldMemory.clear();
    this.resonanceHistory.clear();
  }
}

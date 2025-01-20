// Base quantum types
export interface QuantumState {
  id: string;
  amplitude: number;
  phase: number;
  probability: number;
  connections: string[];
  dimensions: number[];
  harmonics: number[];
  coherence: number;
}

export interface QuantumNode {
  id: string;
  label: string;
  connections: string[];
  group?: number;
  superposition?: boolean;
  probability?: number;
}

export interface QuantumNetwork {
  nodes: QuantumNode[];
  links: {
    source: string;
    target: string;
    strength: number;
    probability: number;
  }[];
  timestamp: number;
}

// Component Props
export interface QuantumNetworkGeneratorProps {
  onNodeSelect: (nodeId: string) => void;
  onNetworkGenerated: (nodes: QuantumNode[]) => void;
}

export interface QuantumStateVisualizerProps {
  states: QuantumState[];
  selectedNode?: string;
  onStateSelect: (nodeId: string) => void;
}

export interface TemporalNetworkAnalyzerProps {
  networks: QuantumNetwork[];
  selectedTimeframe: number;
  onTimeframeChange: (timeframe: number) => void;
  onNodeSelect: (nodeId: string) => void;
}

// Quantum Field Types
export interface ComplexNumber {
  real: number;
  imag: number;
}

// Import Complex class for QuantumField
import { Complex } from '../lib/quantum/complex';

export interface QuantumField {
  dimensions: number;
  values: Complex[];
  phase: number[];
  coherence: number;
}

export interface WaveFunction {
  amplitude: number[];
  phase: number[];
  probability: number[];
}

// Learning Types
export interface MetadataValue {
  type: 'string' | 'number' | 'boolean';
  value: string | number | boolean;
}

export interface LearningContext {
  position?: number;
  timestamp?: number;
  metadata?: Record<string, MetadataValue>;
}

export interface PatternStrength {
  pattern: number[];
  strength: number;
}

export interface PerformanceMetrics {
  resonance: number;
  error: number;
  confidence: number;
}

// Memory Types
export interface MemoryPattern {
  pattern: number[];
  priority: number;
  timestamp: number;
}

export interface AttentionWeights {
  keys: number[][];
  values: number[][];
  scores: number[][];
}

// Utility Types
export type PrimeFactors = number[];
export type SpectralFormFactor = ComplexNumber;
export type BerryPhase = number;

// Configuration Types
export interface QuantumConfig {
  fieldDimensions: number;
  maxSequenceLength: number;
  numHeads: number;
  numLayers: number;
  learningRate: number;
  momentum: number;
  decayFactor: number;
}

// Processing Pipeline Types
export interface TextProcessingResult {
  tokens: number[];
  fields: QuantumField[];
  networks: QuantumNetwork;
}

export interface ProcessingOptions {
  useEnhancedLearning?: boolean;
  contextualProcessing?: boolean;
  patternRecognition?: boolean;
  config?: Partial<QuantumConfig>;
}

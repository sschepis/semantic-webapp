import { EncodedState } from '../quantum/encoder';
import { WaveFunction } from '../quantum/wavefunction';
import { Pattern } from '../analysis/patterns';

export interface SearchQuery {
  text?: string;
  properties?: Record<string, unknown>;
  statePattern?: Partial<EncodedState>;
  patterns?: Pattern[];
  filters?: {
    types?: string[];
    minCoherence?: number;
    maxEntanglement?: number;
    dateRange?: [Date, Date];
    [key: string]: unknown;
  };
}

export interface SearchResult {
  state: EncodedState;
  score: number;
  matches: {
    field: string;
    score: number;
    context?: string;
  }[];
  relevance: {
    semantic: number;
    quantum: number;
    structural: number;
  };
}

export interface SearchOptions {
  maxResults: number;
  minScore: number;
  includeSimilar: boolean;
  rankingWeights: {
    semantic: number;
    quantum: number;
    structural: number;
  };
}

export class SearchEngine {
  private options: Required<SearchOptions>;

  constructor(options: Partial<SearchOptions> = {}) {
    this.options = {
      maxResults: 10,
      minScore: 0.5,
      includeSimilar: true,
      rankingWeights: {
        semantic: 0.4,
        quantum: 0.4,
        structural: 0.2
      },
      ...options
    };
  }

  search(query: SearchQuery, states: EncodedState[]): SearchResult[] {
    // Calculate scores for each state
    const results = states.map(state => this.scoreState(state, query));

    // Filter by minimum score
    const filteredResults = results.filter(result => 
      result.score >= this.options.minScore &&
      this.matchesFilters(result.state, query.filters)
    );

    // Sort by score and limit results
    const sortedResults = filteredResults.sort((a, b) => b.score - a.score)
      .slice(0, this.options.maxResults);

    // Include similar states if requested
    if (this.options.includeSimilar && sortedResults.length > 0) {
      const similarStates = this.findSimilarStates(
        sortedResults[0].state,
        states.filter(s => !sortedResults.some(r => r.state === s))
      );
      sortedResults.push(...similarStates);
    }

    return sortedResults.slice(0, this.options.maxResults);
  }

  private scoreState(state: EncodedState, query: SearchQuery): SearchResult {
    const matches: SearchResult['matches'] = [];
    
    // Score semantic matches
    if (query.text) {
      const textScore = this.scoreTextMatch(state, query.text);
      if (textScore > 0) {
        matches.push({
          field: 'text',
          score: textScore,
          context: this.extractMatchContext(state, query.text)
        });
      }
    }

    // Score property matches
    if (query.properties) {
      Object.entries(query.properties).forEach(([key, value]) => {
        const propertyScore = this.scorePropertyMatch(state, key, value);
        if (propertyScore > 0) {
          matches.push({
            field: key,
            score: propertyScore
          });
        }
      });
    }

    // Score quantum state pattern matches
    let quantumScore = 0;
    if (query.statePattern) {
      quantumScore = this.scoreQuantumMatch(state, query.statePattern);
    }

    // Score pattern matches
    let patternScore = 0;
    if (query.patterns) {
      patternScore = this.scorePatternMatches(state, query.patterns);
    }

    // Calculate relevance scores
    const relevance = {
      semantic: matches.reduce((sum, m) => sum + m.score, 0) / Math.max(1, matches.length),
      quantum: quantumScore,
      structural: patternScore
    };

    // Calculate final score using weighted average
    const score = 
      relevance.semantic * this.options.rankingWeights.semantic +
      relevance.quantum * this.options.rankingWeights.quantum +
      relevance.structural * this.options.rankingWeights.structural;

    return {
      state,
      score,
      matches,
      relevance
    };
  }

  private scoreTextMatch(state: EncodedState, query: string): number {
    const normalizedQuery = query.toLowerCase();
    const stateText = [
      state.sourceNode.label,
      state.sourceNode.type,
      ...Object.entries(state.sourceNode.properties).map(([k, v]) => `${k}:${v}`)
    ].join(' ').toLowerCase();

    // Simple text matching for now - could be enhanced with NLP/embeddings
    const words = normalizedQuery.split(/\s+/);
    const matches = words.filter(word => stateText.includes(word));
    return matches.length / words.length;
  }

  private scorePropertyMatch(
    state: EncodedState,
    key: string,
    value: unknown
  ): number {
    const stateValue = state.sourceNode.properties[key];
    if (!stateValue) return 0;

    if (typeof value === 'number' && typeof stateValue === 'number') {
      return 1 - Math.min(1, Math.abs(value - stateValue));
    }

    if (typeof value === 'string' && typeof stateValue === 'string') {
      return value.toLowerCase() === stateValue.toLowerCase() ? 1 : 0;
    }

    return value === stateValue ? 1 : 0;
  }

  private scoreQuantumMatch(state: EncodedState, pattern: Partial<EncodedState>): number {
    let score = 0;
    let factors = 0;

    if (pattern.waveFunction) {
      score += this.compareWaveFunctions(state.waveFunction, pattern.waveFunction);
      factors++;
    }

    if (pattern.connections) {
      const connectionOverlap = pattern.connections.filter(
        id => state.connections.includes(id)
      ).length;
      score += connectionOverlap / pattern.connections.length;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  private scorePatternMatches(state: EncodedState, patterns: Pattern[]): number {
    return patterns.reduce((maxScore, pattern) => {
      if (pattern.states.includes(state.sourceNode.id)) {
        return Math.max(maxScore, pattern.score);
      }
      return maxScore;
    }, 0);
  }

  private compareWaveFunctions(wave1: WaveFunction, wave2: WaveFunction): number {
    const dims1 = wave1.getDimensions();
    const dims2 = wave2.getDimensions();
    let similarity = 0;

    // Compare amplitudes and phases
    for (let i = 0; i < Math.min(dims1.length, dims2.length); i++) {
      const mag1 = Math.sqrt(dims1[i].real * dims1[i].real + dims1[i].imag * dims1[i].imag);
      const mag2 = Math.sqrt(dims2[i].real * dims2[i].real + dims2[i].imag * dims2[i].imag);
      const phase1 = Math.atan2(dims1[i].imag, dims1[i].real);
      const phase2 = Math.atan2(dims2[i].imag, dims2[i].real);

      similarity += (
        (1 - Math.abs(mag1 - mag2)) * 0.6 + // 60% weight to amplitude
        (1 - Math.abs(phase1 - phase2) / Math.PI) * 0.4 // 40% weight to phase
      );
    }

    return similarity / Math.min(dims1.length, dims2.length);
  }

  private findSimilarStates(
    reference: EncodedState,
    candidates: EncodedState[]
  ): SearchResult[] {
    return candidates
      .map(state => ({
        state,
        score: this.calculateStateSimilarity(reference, state),
        matches: [{
          field: 'similarity',
          score: this.calculateStateSimilarity(reference, state)
        }],
        relevance: {
          semantic: 0,
          quantum: this.calculateStateSimilarity(reference, state),
          structural: this.calculateStructuralSimilarity(reference, state)
        }
      }))
      .filter(result => result.score >= this.options.minScore)
      .sort((a, b) => b.score - a.score);
  }

  private calculateStateSimilarity(state1: EncodedState, state2: EncodedState): number {
    const waveSimilarity = this.compareWaveFunctions(
      state1.waveFunction,
      state2.waveFunction
    );

    const typeSimilarity = state1.sourceNode.type === state2.sourceNode.type ? 1 : 0;
    
    const propertySimilarity = this.calculatePropertySimilarity(
      state1.sourceNode.properties,
      state2.sourceNode.properties
    );

    return (waveSimilarity * 0.6 + typeSimilarity * 0.2 + propertySimilarity * 0.2);
  }

  private calculatePropertySimilarity(
    props1: Record<string, unknown>,
    props2: Record<string, unknown>
  ): number {
    const keys = new Set([...Object.keys(props1), ...Object.keys(props2)]);
    if (keys.size === 0) return 0;

    let similarity = 0;
    keys.forEach(key => {
      const value1 = props1[key];
      const value2 = props2[key];

      if (value1 === value2) {
        similarity += 1;
      } else if (typeof value1 === 'number' && typeof value2 === 'number') {
        similarity += 1 - Math.min(1, Math.abs(value1 - value2));
      }
    });

    return similarity / keys.size;
  }

  private calculateStructuralSimilarity(state1: EncodedState, state2: EncodedState): number {
    const commonConnections = state1.connections.filter(id => 
      state2.connections.includes(id)
    ).length;

    const totalConnections = new Set([
      ...state1.connections,
      ...state2.connections
    ]).size;

    return totalConnections > 0 ? commonConnections / totalConnections : 0;
  }

  private matchesFilters(state: EncodedState, filters?: SearchQuery['filters']): boolean {
    if (!filters) return true;

    if (filters.types && !filters.types.includes(state.sourceNode.type)) {
      return false;
    }

    if (filters.minCoherence !== undefined) {
      const coherence = this.calculateStateCoherence(state);
      if (coherence < filters.minCoherence) return false;
    }

    if (filters.maxEntanglement !== undefined) {
      const entanglement = this.calculateStateEntanglement(state);
      if (entanglement > filters.maxEntanglement) return false;
    }

    if (filters.dateRange) {
      const timestamp = state.metadata.timestamp;
      const [start, end] = filters.dateRange;
      if (timestamp < start.getTime() || timestamp > end.getTime()) {
        return false;
      }
    }

    return true;
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

  private calculateStateEntanglement(state: EncodedState): number {
    return state.connections.length / 10; // Simple approximation
  }

  private extractMatchContext(state: EncodedState, query: string): string {
    const text = [
      state.sourceNode.label,
      ...Object.entries(state.sourceNode.properties).map(([k, v]) => `${k}: ${v}`)
    ].join(' ');

    const words = text.split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);
    const matchIndices: number[] = [];

    words.forEach((word, index) => {
      if (queryWords.some(q => word.toLowerCase().includes(q))) {
        matchIndices.push(index);
      }
    });

    if (matchIndices.length === 0) return '';

    // Extract context around first match
    const contextStart = Math.max(0, matchIndices[0] - 3);
    const contextEnd = Math.min(words.length, matchIndices[0] + 4);
    return words.slice(contextStart, contextEnd).join(' ');
  }
}

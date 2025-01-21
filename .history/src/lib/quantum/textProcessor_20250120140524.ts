import { TextProcessingResult, ProcessingOptions, QuantumNetwork } from '../../types/quantum';
import { QuantumField } from './field';
import { FieldLearner } from './fieldLearner';

interface ProcessedToken {
  text: string;
  field: QuantumField;
  position: number;
  sentenceIndex: number;
}

export class TextProcessor {
  private readonly fieldDimensions: number;
  private readonly fieldLearner: FieldLearner;
  private readonly minResonance: number = 0.1;
  private readonly highResonance: number = 0.8;

  constructor(fieldDimensions: number = 512) {
    this.fieldDimensions = fieldDimensions;
    this.fieldLearner = new FieldLearner(fieldDimensions);
  }

  processText(content: string, options: ProcessingOptions = {}): TextProcessingResult {
    console.log('Processing text with options:', options);
    
    try {
      // Process text into quantum fields
      const processedTokens = this.processIntoFields(content);
      console.log(`Generated ${processedTokens.length} quantum fields`);

      // Generate semantic network through field interactions
      const network = this.createSemanticNetwork(processedTokens);
      console.log('Network generated:', {
        nodeCount: network.nodes.length,
        linkCount: network.links.length,
      });

      return {
        tokens: processedTokens.map((_, i) => i), // Map to numeric IDs
        fields: processedTokens.map(t => t.field),
        networks: network,
      };

    } catch (error) {
      console.error('Error in text processing:', error);
      throw new Error(`Failed to process text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private processIntoFields(text: string): ProcessedToken[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const processedTokens: ProcessedToken[] = [];
    let globalPosition = 0;

    sentences.forEach((sentence, sentenceIndex) => {
      const words = sentence
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0);

      words.forEach(word => {
        const field = new QuantumField(this.fieldDimensions);
        field.initialize(word);

        processedTokens.push({
          text: word,
          field,
          position: globalPosition,
          sentenceIndex
        });

        globalPosition++;
      });
    });

    // Learn relationships between fields
    this.learnFieldRelationships(processedTokens);

    return processedTokens;
  }

  private learnFieldRelationships(tokens: ProcessedToken[]): void {
    // Learn from sequential relationships
    for (let i = 0; i < tokens.length - 1; i++) {
      const current = tokens[i];
      const next = tokens[i + 1];
      
      // Compute base resonance
      const resonance = current.field.computeResonance(next.field);
      const phaseCoherence = current.field.computePhaseCoherence(next.field);
      
      // Learn from the interaction with context
      this.fieldLearner.learnFromInteraction(
        current.field,
        next.field,
        (resonance + phaseCoherence) / 2,
        {
          position: current.position,
          precedingWords: tokens.slice(Math.max(0, i - 2), i).map(t => t.text),
          followingWords: tokens.slice(i + 1, i + 3).map(t => t.text),
          sentencePosition: current.position / tokens.length
        }
      );
    }

    // Learn from sentence-level relationships
    const sentenceGroups = tokens.reduce((groups, token) => {
      (groups[token.sentenceIndex] = groups[token.sentenceIndex] || []).push(token);
      return groups;
    }, {} as Record<number, ProcessedToken[]>);

    Object.values(sentenceGroups).forEach(sentenceTokens => {
      // Learn relationships between all words in the sentence
      for (let i = 0; i < sentenceTokens.length; i++) {
        for (let j = i + 1; j < sentenceTokens.length; j++) {
          const token1 = sentenceTokens[i];
          const token2 = sentenceTokens[j];
          
          const resonance = token1.field.computeResonance(token2.field);
          const phaseCoherence = token1.field.computePhaseCoherence(token2.field);
          
          if ((resonance + phaseCoherence) / 2 > this.minResonance) {
            this.fieldLearner.learnFromInteraction(
              token1.field,
              token2.field,
              (resonance + phaseCoherence) / 2,
              {
                position: Math.abs(token1.position - token2.position),
                sentencePosition: token1.position / sentenceTokens.length
              }
            );
          }
        }
      }
    });
  }

  private createSemanticNetwork(tokens: ProcessedToken[]): QuantumNetwork {
    const nodes = tokens.map((token, i) => ({
      id: `token_${i}`,
      label: token.text,
      connections: [],
      group: this.getTokenGroup(token),
      superposition: this.isInSuperposition(token.field),
      probability: this.calculateNodeProbability(token.field),
    }));

    const links: Array<{
      source: string;
      target: string;
      strength: number;
      probability: number;
    }> = [];

    const processedPairs = new Set<string>();

    // Add relationships based on quantum field interactions
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const source = nodes[i].id;
        const target = nodes[j].id;
        const pairKey = `${source}-${target}`;

        if (!processedPairs.has(pairKey)) {
          const resonance = tokens[i].field.computeResonance(tokens[j].field);
          const phaseCoherence = tokens[i].field.computePhaseCoherence(tokens[j].field);
          const strength = (resonance + phaseCoherence) / 2;

          if (strength > this.minResonance) {
            links.push({
              source,
              target,
              strength,
              probability: strength * strength
            });
            processedPairs.add(pairKey);
          }
        }
      }
    }

    // Find similar fields through the learner
    tokens.forEach((token, i) => {
      const similarFields = this.fieldLearner.findSimilarFields(
        token.field,
        this.highResonance,
        {
          position: token.position,
          sentencePosition: token.position / tokens.length
        }
      );

      similarFields.forEach(similarField => {
        // Find the token with this field
        const j = tokens.findIndex(t => 
          t.field.computeResonance(similarField) > 0.99
        );

        if (j !== -1 && j !== i) {
          const source = nodes[i].id;
          const target = nodes[j].id;
          const pairKey = `${source}-${target}`;

          if (!processedPairs.has(pairKey)) {
            const resonance = token.field.computeResonance(tokens[j].field);
            const phaseCoherence = token.field.computePhaseCoherence(tokens[j].field);
            const strength = (resonance + phaseCoherence) / 2;

            links.push({
              source,
              target,
              strength,
              probability: strength * strength
            });
            processedPairs.add(pairKey);
          }
        }
      });
    });

    return {
      nodes,
      links,
      timestamp: Date.now(),
    };
  }

  private getTokenGroup(token: ProcessedToken): number {
    const resonancePattern = this.fieldLearner.getResonancePattern(token.field);
    if (resonancePattern.length === 0) return 0;
    
    // Analyze resonance pattern to determine group
    const avgResonance = resonancePattern.reduce((a, b) => a + b, 0) / resonancePattern.length;
    const variance = resonancePattern.reduce((acc, r) => acc + Math.pow(r - avgResonance, 2), 0) / resonancePattern.length;
    
    if (variance < 0.1) return 1; // Stable relationships
    if (avgResonance > 0.7) return 2; // Strong relationships
    return 3; // Dynamic relationships
  }

  private isInSuperposition(field: QuantumField): boolean {
    const similarFields = this.fieldLearner.findSimilarFields(field, 0.7);
    return similarFields.length > 1;
  }

  private calculateNodeProbability(field: QuantumField): number {
    const resonancePattern = this.fieldLearner.getResonancePattern(field);
    if (resonancePattern.length === 0) return 0.5;
    
    // Use recent resonance history to calculate probability
    const recentResonances = resonancePattern.slice(-5);
    return recentResonances.reduce((a, b) => a + b, 0) / recentResonances.length;
  }
}

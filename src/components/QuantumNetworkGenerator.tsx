import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import './QuantumNetworkGenerator.css';
import { ForceGraph2D } from 'react-force-graph';
import { QuantumNode, QuantumNetworkGeneratorProps, ProcessingOptions } from '../types/quantum';
import { TextProcessor } from '../lib/quantum/textProcessor';

interface Link {
  source: string;
  target: string;
  strength: number;
  probability: number;
}

const QuantumNetworkGenerator: React.FC<QuantumNetworkGeneratorProps> = ({
  onNodeSelect,
  onNetworkGenerated
}) => {
  const defaultText = `Tommy is a cat. He likes to chase mice. Jerry is a mouse. He likes to eat cheese. Jerry does not like Tommy. Tommy does not like Jerry. They are enemies. They are not friends. Cats like to eat mice. Mice like to eat cheese.`;

  const [text, setText] = useState(defaultText);
  const [entanglementLevel, setEntanglementLevel] = useState(0.5);
  const [superpositionDensity, setSuperpositionDensity] = useState(0.3);
  const [useEnhancedLearning, setUseEnhancedLearning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
  const processingRef = useRef(false);

  const processor = useMemo(() => {
    console.log('Initializing TextProcessor...');
    const proc = new TextProcessor();
    console.log('TextProcessor initialized');
    return proc;
  }, []);

  const [nodes, setNodes] = useState<(QuantumNode & { x?: number; y?: number })[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const processTextContent = useCallback(async () => {
    if (!text.trim() || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setError(null);
    setIsLoading(true);
    setProcessingStartTime(Date.now());
    console.log('Starting text processing with enhanced learning:', useEnhancedLearning);

    try {
      const options: ProcessingOptions = {
        useEnhancedLearning,
        config: {
          fieldDimensions: 512,
          maxSequenceLength: 1024,
          numHeads: 8,
          numLayers: 6,
          learningRate: entanglementLevel,
          momentum: superpositionDensity,
          decayFactor: 0.99,
        }
      };

      console.log('Processing text with options:', options);
      const result = processor.processText(text, options);
      console.log('Processing complete:', result);

      // Convert quantum network to visualization format
      const processedNodes = result.networks.nodes.map(node => ({
        ...node,
        x: Math.random() * 800 - 400,
        y: Math.random() * 600 - 300,
      }));

      console.log('Generated nodes:', processedNodes.length);
      console.log('Generated links:', result.networks.links.length);

      // Notify parent component about generated network
      onNetworkGenerated?.(processedNodes);
      
      setNodes(processedNodes);
      setLinks(result.networks.links);

      const processingTime = Date.now() - (processingStartTime || Date.now());
      console.log(`Processing completed in ${processingTime}ms`);
    } catch (error) {
      console.error('Error processing text:', error);
      setError(error instanceof Error ? error.message : 'Error processing text');
      setNodes([]);
      setLinks([]);
    } finally {
      setIsLoading(false);
      setProcessingStartTime(null);
      processingRef.current = false;
    }
  }, [text, entanglementLevel, superpositionDensity, useEnhancedLearning, processor, onNetworkGenerated, processingStartTime]);

  // Debounced text processing
  useEffect(() => {
    if (!text.trim()) {
      setNodes([]);
      setLinks([]);
      return;
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    console.log('Text changed, scheduling processing...');
    const timeout = setTimeout(processTextContent, 500);
    setDebounceTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [text, processTextContent, debounceTimeout]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);


  return (
    <div className="quantum-network-generator">
      <div className="controls">
        <div className="text-input">
          <label>
            Input Text
            <span className="tooltip">
              Try the default text to see how quantum concepts and their relationships are visualized, 
              or enter your own text to generate a custom semantic network
            </span>
          </label>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text to generate quantum semantic network..."
            rows={5}
            disabled={isLoading}
          />
        </div>

        <div className="control-group">
          <label>
            Entanglement Level
            <span className="tooltip">
              Controls the strength of connections between quantum states. Higher values create stronger relationships between concepts.
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={entanglementLevel}
            onChange={e => setEntanglementLevel(Number(e.target.value))}
            disabled={isLoading}
          />
          <div className="value-display">{entanglementLevel.toFixed(2)}</div>
        </div>

        <div className="control-group">
          <label>
            Superposition Density
            <span className="tooltip">
              Determines how many concepts can exist in multiple states simultaneously. Higher values create more complex quantum networks.
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={superpositionDensity}
            onChange={e => setSuperpositionDensity(Number(e.target.value))}
            disabled={isLoading}
          />
          <div className="value-display">{superpositionDensity.toFixed(2)}</div>
        </div>

        <button
          className={`enhanced-learning-button ${useEnhancedLearning ? 'active' : ''}`}
          onClick={() => {
            if (!isLoading) {
              const newValue = !useEnhancedLearning;
              console.log('Enhanced learning toggled:', newValue);
              setUseEnhancedLearning(newValue);
              
              // Trigger reprocessing if text exists
              if (text.trim()) {
                console.log('Reprocessing text with enhanced learning:', newValue);
                processTextContent();
              }
            }
          }}
          disabled={isLoading}
        >
          <div className="indicator" />
          <span>
            Enhanced Learning {useEnhancedLearning ? 'Enabled' : 'Disabled'}
            <span className="tooltip">
              Activates advanced quantum learning algorithms to discover deeper semantic relationships and patterns in the text.
            </span>
          </span>
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="visualization">
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <div className="loading-text">
              Generating quantum semantic network...
              {processingStartTime && (
                <div className="processing-time">
                  Processing for {Math.floor((Date.now() - processingStartTime) / 1000)}s
                </div>
              )}
            </div>
          </div>
        ) : nodes.length > 0 ? (
          <ForceGraph2D
            graphData={{ nodes, links }}
            nodeAutoColorBy="group"
            width={800}
            height={600}
            backgroundColor="rgba(0,0,0,0)"
            d3VelocityDecay={0.4}
            warmupTicks={120}
            cooldownTicks={Infinity}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.25}
            nodeRelSize={6}
            nodeVal={node => {
              const probability = (node as QuantumNode).probability ?? 0;
              return 1 + probability * 10;
            }}
            onNodeDragEnd={node => {
              if (typeof node.x === 'number' && typeof node.y === 'number') {
                node.fx = node.x;
                node.fy = node.y;
              }
            }}
            nodeCanvasObject={(node, ctx) => {
              const n = node as QuantumNode;
              const label = n.label;
              const x = typeof node.x === 'number' ? node.x : 0;
              const y = typeof node.y === 'number' ? node.y : 0;
              
              // Draw node
              ctx.beginPath();
              ctx.arc(x, y, 8, 0, 2 * Math.PI, false);
              ctx.fillStyle = n.superposition ? '#ff6b35' : '#0077b6';
              ctx.fill();

              // Draw probability wave
              if (n.superposition && n.probability) {
                ctx.beginPath();
                ctx.arc(x, y, 12 * n.probability, 0, 2 * Math.PI, false);
                ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
              }

              // Draw label
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, x, y + 20);
            }}
            linkColor={(link) => `rgba(255, 255, 255, ${(link as Link).probability})`}
            linkWidth={(link) => 2 * (link as Link).strength}
            onNodeClick={node => {
              if (node.id) {
                onNodeSelect?.(node.id);
              }
            }}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
          />
        ) : (
          <div className="placeholder">
            Enter text above to generate a quantum semantic network
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantumNetworkGenerator;

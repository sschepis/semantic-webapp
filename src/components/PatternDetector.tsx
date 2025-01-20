import { FC } from 'react';
import './PatternDetector.css';

export interface Pattern {
  id: string;
  type: 'resonance' | 'entanglement' | 'coherence';
  strength: number;
  nodes: string[];
  confidence: number;
}

export interface PatternDetectorProps {
  onPatternDetected: (pattern: Pattern) => void;
  onThresholdChange: (threshold: number) => void;
  onPatternTypeChange: (type: string) => void;
}

const PatternDetector: FC<PatternDetectorProps> = ({
  onPatternDetected,
  onThresholdChange,
  onPatternTypeChange,
}) => {
  return (
    <div className="pattern-detector">
      <h2>Pattern Detection</h2>
      
      <div className="controls-section">
        <div className="control-group">
          <h3>Detection Parameters</h3>
          <div className="control">
            <label>Pattern Type</label>
            <select 
              onChange={(e) => onPatternTypeChange(e.target.value)}
              defaultValue="resonance"
            >
              <option value="resonance">Resonance Patterns</option>
              <option value="entanglement">Entanglement Patterns</option>
              <option value="coherence">Coherence Patterns</option>
            </select>
          </div>
          <div className="control">
            <label>Detection Threshold</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="0.7"
              onChange={(e) => onThresholdChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="control-group">
          <h3>Visualization Options</h3>
          <div className="control">
            <label>
              <input type="checkbox" defaultChecked />
              Show Pattern Strength
            </label>
          </div>
          <div className="control">
            <label>
              <input type="checkbox" defaultChecked />
              Highlight Connected Nodes
            </label>
          </div>
          <div className="control">
            <label>
              <input type="checkbox" defaultChecked />
              Display Confidence Level
            </label>
          </div>
        </div>
      </div>

      <div className="pattern-visualization">
        {/* Pattern visualization will be rendered here */}
        <div className="placeholder-viz">
          Pattern Visualization Area
        </div>
      </div>

      <div className="pattern-list">
        <h3>Detected Patterns</h3>
        <div className="list-container">
          {/* Pattern list will be populated here */}
          <div className="empty-state">
            No patterns detected yet. Adjust parameters to begin detection.
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          className="secondary"
          onClick={() => onThresholdChange(0.7)}
        >
          Reset Parameters
        </button>
        <button
          className="primary"
          onClick={() =>
            onPatternDetected({
              id: crypto.randomUUID(),
              type: 'resonance',
              strength: 0.85,
              nodes: ['node1', 'node2', 'node3'],
              confidence: 0.92,
            })
          }
        >
          Detect Patterns
        </button>
      </div>
    </div>
  );
};

export default PatternDetector;

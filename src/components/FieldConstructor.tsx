import { FC } from 'react';
import './FieldConstructor.css';

export interface FieldConstructorProps {
  onFieldCreated: (field: {
    id: string;
    dimensions: number;
    harmonics: number[];
    coherence: number;
  }) => void;
  onParameterChange: (param: string, value: number) => void;
}

const FieldConstructor: FC<FieldConstructorProps> = ({
  onFieldCreated,
  onParameterChange,
}) => {
  return (
    <div className="field-constructor">
      <h2>Quantum Field Construction</h2>
      <div className="field-parameters">
        <div className="parameter-group">
          <h3>Field Parameters</h3>
          <div className="parameter">
            <label>Dimensions</label>
            <input
              type="number"
              min="1"
              max="512"
              defaultValue="512"
              onChange={(e) => onParameterChange('dimensions', Number(e.target.value))}
            />
          </div>
          <div className="parameter">
            <label>Coherence Threshold</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              onChange={(e) => onParameterChange('coherence', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="parameter-group">
          <h3>Harmonic Configuration</h3>
          <div className="parameter">
            <label>Base Frequency</label>
            <input
              type="number"
              min="1"
              max="100"
              defaultValue="10"
              onChange={(e) => onParameterChange('baseFreq', Number(e.target.value))}
            />
          </div>
          <div className="parameter">
            <label>Harmonic Count</label>
            <input
              type="number"
              min="1"
              max="10"
              defaultValue="3"
              onChange={(e) => onParameterChange('harmonicCount', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="visualization-area">
        {/* Field visualization will go here */}
      </div>

      <div className="actions">
        <button
          className="primary"
          onClick={() =>
            onFieldCreated({
              id: crypto.randomUUID(),
              dimensions: 512,
              harmonics: [1, 2, 3],
              coherence: 0.5,
            })
          }
        >
          Generate Field
        </button>
      </div>
    </div>
  );
};

export default FieldConstructor;

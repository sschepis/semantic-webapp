import { useState, useEffect } from 'react'
import './App.css'
import QuantumNetworkGenerator from './components/QuantumNetworkGenerator'
import { QuantumNode } from './types/quantum'

function App() {
  const [networkScale, setNetworkScale] = useState(1.0)
  const [quantumState, setQuantumState] = useState({
    amplitude: 0.5,
    phase: 0.0
  })
  const [resonanceFrequency, setResonanceFrequency] = useState(440)
  const [measurements, setMeasurements] = useState({
    energy: 0.0,
    coherence: 0.0,
    entanglement: 0.0,
    phaseCorrelation: 0.0,
    frequencyResonance: 0.0,
    fieldOverlap: 0.0
  })

  // Simulate quantum field interactions
  useEffect(() => {
    const interval = setInterval(() => {
      const phaseDiff = quantumState.phase - (Math.PI / 4)
      const freqRes = Math.sin(resonanceFrequency / 1000)
      const overlap = quantumState.amplitude * Math.cos(phaseDiff)
      
      setMeasurements(prev => ({
        ...prev,
        phaseCorrelation: Math.abs(Math.sin(phaseDiff)),
        frequencyResonance: freqRes,
        fieldOverlap: overlap,
        energy: overlap * freqRes,
        coherence: Math.abs(Math.cos(phaseDiff)),
        entanglement: Math.sqrt(overlap * freqRes)
      }))
    }, 100)
    
    return () => clearInterval(interval)
  }, [quantumState, resonanceFrequency])

  return (
    <div className="instrument-panel">
      <header className="panel-header">
        <h1>Quantum Semantic Analyzer</h1>
        <div className="status-indicators">
          <div className="status-led green" />
          <div className="status-led yellow" />
          <div className="status-led red" />
        </div>
      </header>

      <div className="control-section">
        <div className="control-group">
          <label>Network Scale</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={networkScale}
            onChange={(e) => setNetworkScale(parseFloat(e.target.value))}
          />
          <div className="value-display">{networkScale.toFixed(1)}x</div>
        </div>
      </div>

        <div className="visualization-area">
          <QuantumNetworkGenerator
            onNodeSelect={(nodeId: string) => {
              console.log('Node selected:', nodeId)
            }}
            onNetworkGenerated={(nodes: QuantumNode[]) => {
              console.log('Network generated with nodes:', nodes.length)
            }}
          />
          <div className="control-panel">
          <div className="quantum-state-controls">
            <h3>Quantum State</h3>
            <div className="quantum-state">
              <label>Amplitude</label>
              <span>{quantumState.amplitude.toFixed(2)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={quantumState.amplitude}
                onChange={(e) => setQuantumState(prev => ({
                  ...prev,
                  amplitude: parseFloat(e.target.value)
                }))}
              />

              <label>Phase</label>
              <span>{(quantumState.phase / Math.PI).toFixed(2)}π</span>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step={0.01}
                value={quantumState.phase}
                onChange={(e) => setQuantumState(prev => ({
                  ...prev,
                  phase: parseFloat(e.target.value)
                }))}
              />
            </div>

            <div className="energy-level-display">
              <div className="energy-level" style={{ bottom: '25%' }} />
              <div className="energy-level" style={{ bottom: '50%' }} />
              <div className="energy-level" style={{ bottom: '75%' }} />
            </div>
          </div>

          <div className="measurement-panel">
            <div className="measurement-indicator">
              <div className="measurement-value">
                {measurements.energy.toFixed(2)} eV
              </div>
              <div className="measurement-label">Energy</div>
            </div>
            <div className="measurement-indicator">
              <div className="measurement-value">
                {measurements.coherence.toFixed(2)}
              </div>
              <div className="measurement-label">Coherence</div>
            </div>
            <div className="measurement-indicator">
              <div className="measurement-value">
                {measurements.entanglement.toFixed(2)}
              </div>
              <div className="measurement-label">Entanglement</div>
            </div>
            <div className="measurement-indicator">
              <div className="measurement-value">
                {measurements.phaseCorrelation.toFixed(2)}
              </div>
              <div className="measurement-label">Phase Corr</div>
            </div>
            <div className="measurement-indicator">
              <div className="measurement-value">
                {measurements.frequencyResonance.toFixed(2)}
              </div>
              <div className="measurement-label">Freq Res</div>
            </div>
            <div className="measurement-indicator">
              <div className="measurement-value">
                {measurements.fieldOverlap.toFixed(2)}
              </div>
              <div className="measurement-label">Field Overlap</div>
            </div>
          </div>

          <div className="resonance-controls">
            <h3>Resonance Frequency</h3>
            <div className="resonance-frequency">
              <input
                type="range"
                min="20"
                max="20000"
                value={resonanceFrequency}
                onChange={(e) => setResonanceFrequency(parseInt(e.target.value))}
              />
              <span>{resonanceFrequency} Hz</span>
            </div>
            <div className="spectrum-analyzer">
              <div className="spectrum-line" style={{ left: '10%', height: '80%' }} />
              <div className="spectrum-line" style={{ left: '30%', height: '60%' }} />
              <div className="spectrum-line" style={{ left: '50%', height: '90%' }} />
              <div className="spectrum-line" style={{ left: '70%', height: '40%' }} />
              <div className="spectrum-line" style={{ left: '90%', height: '70%' }} />
            </div>
          </div>
        </div>

        <div className="quantum-state-visualizer">
          <div className="probability-distribution">
            <div className="probability-bar" style={{ height: `${quantumState.amplitude * 100}%` }} />
            <div className="phase-indicator" style={{ transform: `rotate(${quantumState.phase}rad)` }} />
          </div>
          <div className="phase-space">
            <div className="phase-point" style={{ 
              left: `${50 + 50 * Math.cos(quantumState.phase)}%`,
              bottom: `${50 + 50 * Math.sin(quantumState.phase)}%`
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

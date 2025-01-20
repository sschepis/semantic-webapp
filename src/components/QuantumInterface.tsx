
import React, { useState, useMemo } from 'react';
import QuantumNetworkGenerator from './QuantumNetworkGenerator';
import QuantumStateVisualizer from './QuantumStateVisualizer';
import { QuantumState, QuantumNode } from '../types/quantum';
import './QuantumInterface.css';

const QuantumInterface: React.FC = () => {
  const [states, setStates] = useState<QuantumState[]>([]);
  const [selectedState, setSelectedState] = useState<QuantumState | null>(null);
  const [resonanceThreshold, setResonanceThreshold] = useState(0.5);
  const [phaseCoherence, setPhaseCoherence] = useState(1.0);
  const [harmonicEnhancement, setHarmonicEnhancement] = useState(1.0);

  // Generate initial quantum states based on network nodes
  const generateQuantumStates = (nodes: QuantumNode[]) => {
    return nodes.map(node => ({
      id: node.id,
      amplitude: Math.random(),
      phase: Math.random() * 2 * Math.PI,
      probability: Math.random(),
      connections: nodes
        .filter(n => n.id !== node.id && Math.random() > 0.7)
        .map(n => n.id),
      dimensions: [1, 1, 1], // Default 3D dimensions
      harmonics: [1], // Fundamental harmonic
      coherence: 1.0 // Full coherence
    }));
  };

  const handleNodeSelect = (nodeId: string) => {
    const selected = states.find(state => state.id === nodeId);
    setSelectedState(selected || null);
    
    // Update quantum states when a node is selected
    setStates(prevStates => 
      prevStates.map(state => ({
        ...state,
        amplitude: state.id === nodeId ? 1 : state.amplitude * 0.8
      }))
    );
  };

  // Calculate resonance metrics for selected state
  const resonanceMetrics = useMemo(() => {
    if (!selectedState) return null;
    
    const connections = states.filter(state => 
      selectedState.connections.includes(state.id)
    );
    
    return {
      totalConnections: connections.length,
      strongResonances: connections.filter(c => 
        Math.abs(c.phase - selectedState.phase) < resonanceThreshold
      ).length,
      averageCoherence: connections.reduce((sum, c) => sum + c.coherence, 0) / connections.length
    };
  }, [selectedState, states, resonanceThreshold]);

  // Apply harmonic enhancement to states
  const enhancedStates = useMemo(() => {
    return states.map(state => ({
      ...state,
      harmonics: state.harmonics.map(h => h * harmonicEnhancement)
    }));
  }, [states, harmonicEnhancement]);

  return (
    <div className="quantum-interface">
      <div className="control-panel">
        <div className="control-group">
          <label>Resonance Threshold</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={resonanceThreshold}
            onChange={e => setResonanceThreshold(parseFloat(e.target.value))}
          />
          <span>{resonanceThreshold.toFixed(2)}</span>
        </div>

        <div className="control-group">
          <label>Phase Coherence</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={phaseCoherence}
            onChange={e => setPhaseCoherence(parseFloat(e.target.value))}
          />
          <span>{phaseCoherence.toFixed(2)}</span>
        </div>

        <div className="control-group">
          <label>Harmonic Enhancement</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={harmonicEnhancement}
            onChange={e => setHarmonicEnhancement(parseFloat(e.target.value))}
          />
          <span>{harmonicEnhancement.toFixed(1)}x</span>
        </div>

        {resonanceMetrics && (
          <div className="metrics-panel">
            <h3>Resonance Analysis</h3>
            <p>Total Connections: {resonanceMetrics.totalConnections}</p>
            <p>Strong Resonances: {resonanceMetrics.strongResonances}</p>
            <p>Average Coherence: {resonanceMetrics.averageCoherence.toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="visualization-container">
        <div className="network-panel">
          <QuantumNetworkGenerator 
            onNodeSelect={handleNodeSelect}
            onNetworkGenerated={nodes => setStates(generateQuantumStates(nodes))}
          />
        </div>
        
        <div className="state-panel">
          <QuantumStateVisualizer
            states={enhancedStates}
            onStateSelect={handleNodeSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default QuantumInterface;
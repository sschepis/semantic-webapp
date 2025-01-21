import { FC, useState, useCallback } from 'react';
import QuantumStateVisualizer from '../components/QuantumStateVisualizer';
import { QuantumState } from '../types/quantum';

const QuantumStateVisualizerContainer: FC = () => {
  const [states] = useState<QuantumState[]>([]); // Initialize with actual data when available
  const [selectedNode, setSelectedNode] = useState<string | undefined>(undefined);

  const handleStateSelect = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    console.log('Selected state:', nodeId);
  }, []);

  return (
    <QuantumStateVisualizer
      states={states}
      selectedNode={selectedNode}
      onStateSelect={handleStateSelect}
    />
  );
};

export default QuantumStateVisualizerContainer;

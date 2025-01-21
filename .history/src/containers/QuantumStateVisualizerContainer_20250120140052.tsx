import { FC, useState, useCallback } from 'react';
import QuantumStateVisualizer from '../components/QuantumStateVisualizer';
import { QuantumState } from '../types/quantum';

const QuantumStateVisualizerContainer: FC = () => {
  const [states] = useState<QuantumState[]>([]); // Initialize with actual data when available
  const handleStateSelect = useCallback((nodeId: string) => {
    console.log('Selected state:', nodeId);
  }, []);

  return (
    <QuantumStateVisualizer
      states={states}
      onStateSelect={handleStateSelect}
    />
  );
};

export default QuantumStateVisualizerContainer;

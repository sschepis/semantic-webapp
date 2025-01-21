import { FC, useState, useCallback } from 'react';
import TemporalNetworkAnalyzer from '../components/TemporalNetworkAnalyzer';
import { QuantumNetwork } from '../types/quantum';

const TemporalNetworkAnalyzerContainer: FC = () => {
  const [networks] = useState<QuantumNetwork[]>([]); // Initialize with actual data when available

  const handleNodeSelect = useCallback((nodeId: string) => {
    console.log('Selected node:', nodeId);
  }, []);

  return (
    <TemporalNetworkAnalyzer
      networks={networks}
      onNodeSelect={handleNodeSelect}
    />
  );
};

export default TemporalNetworkAnalyzerContainer;

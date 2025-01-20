import { FC, useCallback } from 'react';
import QuantumNetworkGenerator from '../components/QuantumNetworkGenerator';
import { QuantumNode } from '../types/quantum';

const QuantumNetworkGeneratorContainer: FC = () => {
  const handleNodeSelect = useCallback((nodeId: string) => {
    // Handle node selection
    console.log('Selected node:', nodeId);
  }, []);

  const handleNetworkGenerated = useCallback((nodes: QuantumNode[]) => {
    // Handle network generation
    console.log('Generated network with nodes:', nodes);
  }, []);

  return (
    <QuantumNetworkGenerator
      onNodeSelect={handleNodeSelect}
      onNetworkGenerated={handleNetworkGenerated}
    />
  );
};

export default QuantumNetworkGeneratorContainer;

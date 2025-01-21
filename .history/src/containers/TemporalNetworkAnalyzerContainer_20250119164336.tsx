import { FC, useState, useCallback } from 'react';
import TemporalNetworkAnalyzer from '../components/TemporalNetworkAnalyzer';
import { QuantumNetwork } from '../types/quantum';

const TemporalNetworkAnalyzerContainer: FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(0);
  const [networks] = useState<QuantumNetwork[]>([]); // Initialize with actual data when available

  const handleTimeframeChange = useCallback((timeframe: number) => {
    setSelectedTimeframe(timeframe);
    console.log('Timeframe changed:', timeframe);
  }, []);

  const handleNodeSelect = useCallback((nodeId: string) => {
    console.log('Selected node:', nodeId);
  }, []);

  return (
    <TemporalNetworkAnalyzer
      networks={networks}
      selectedTimeframe={selectedTimeframe}
      onTimeframeChange={handleTimeframeChange}
      onNodeSelect={handleNodeSelect}
    />
  );
};

export default TemporalNetworkAnalyzerContainer;

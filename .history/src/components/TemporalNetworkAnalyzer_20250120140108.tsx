/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { QuantumNode, QuantumNetwork } from '../types/quantum';

interface ForceGraphNode extends QuantumNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface TemporalNetworkAnalyzerProps {
  networks: QuantumNetwork[];
  onNodeSelect: (nodeId: string) => void;
}

const TemporalNetworkAnalyzer: React.FC<TemporalNetworkAnalyzerProps> = ({
  networks,
  onNodeSelect
}) => {
  const [currentNetwork, setCurrentNetwork] = useState<any | null>(null);
  const [timeframeIndex, setTimeframeIndex] = useState(0);
  const [nodeHistory, setNodeHistory] = useState<Map<string, number[]>>(new Map());

  // Update current network when timeframe changes
  useEffect(() => {
    if (networks.length > 0) {
      const network = networks[timeframeIndex];
      setCurrentNetwork(network);
      updateNodeHistory(network);
    }
  }, [timeframeIndex, networks]);

  // Track node activity over time
  const updateNodeHistory = (network: QuantumNetwork) => {
    const newHistory = new Map(nodeHistory);
    
    network.nodes.forEach((node: QuantumNode) => {
      if (!newHistory.has(node.id)) {
        newHistory.set(node.id, new Array(networks.length).fill(0));
      }
      const history = newHistory.get(node.id)!;
      history[timeframeIndex] = node.connections.length;
    });

    setNodeHistory(newHistory);
  };

  // Calculate node activity trends
  const getNodeActivityTrend = (nodeId: string): number => {
    const history = nodeHistory.get(nodeId);
    if (!history || history.length < 2) return 0;
    
    const current = history[timeframeIndex];
    const previous = history[Math.max(0, timeframeIndex - 1)];
    return current - previous;
  };

  return (
    <div className="temporal-network-analyzer">
      <div className="time-controls">
        <button 
          onClick={() => setTimeframeIndex(Math.max(0, timeframeIndex - 1))}
          disabled={timeframeIndex === 0}
        >
          Previous
        </button>
        
        <span>
          Timeframe: {timeframeIndex + 1} / {networks.length}
        </span>

        <button
          onClick={() => setTimeframeIndex(Math.min(networks.length - 1, timeframeIndex + 1))}
          disabled={timeframeIndex === networks.length - 1}
        >
          Next
        </button>
      </div>

      {currentNetwork && (
        <ForceGraph2D
          graphData={currentNetwork}
          nodeAutoColorBy="group"
          nodeCanvasObject={(node: ForceGraphNode, ctx: CanvasRenderingContext2D) => {
            const [x, y] = [node.x || 0, node.y || 0];
            const trend = getNodeActivityTrend(n.id);
            
            // Draw node
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI, false);
            ctx.fillStyle = trend > 0 ? '#4caf50' : trend < 0 ? '#f44336' : '#2196f3';
            ctx.fill();

            // Draw activity indicator
            if (trend !== 0) {
              ctx.beginPath();
              ctx.arc(x, y, 12, 0, 2 * Math.PI, false);
              ctx.strokeStyle = trend > 0 ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            // Draw label
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.label, x, y + 20);
          }}
          linkColor={() => 'rgba(255, 255, 255, 0.3)'}
          linkWidth={1}
          onNodeClick={(node: ForceGraphNode) => onNodeSelect(node.id)}
        />
      )}
    </div>
  );
};

export default TemporalNetworkAnalyzer;

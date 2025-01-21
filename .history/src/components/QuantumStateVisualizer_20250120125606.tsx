/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import * as THREE from 'three';
import { scaleLinear } from 'd3-scale';
import { QuantumState } from '../types/quantum';

interface GraphNode {
  id: string;
  x?: number;
  y?: number;
  amplitude: number;
  phase: number;
  probability: number;
  dimensions: number[];
  harmonics: number[];
  coherence: number;
  intelligence: number;
  entropy: number;
  energy: number;
  complexity: number;
  learning: number;
  development: number;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  energyFlow: number;
  informationFlow: number;
}

interface QuantumStateVisualizerProps {
  states: QuantumState[];
  onStateSelect: (stateId: string) => void;
  onHarmonicAnalysis?: (harmonics: number[]) => void;
  onParameterChange?: (params: {
    intelligence: number;
    entropy: number;
    energy: number;
    complexity: number;
  }) => void;
}

const QuantumStateVisualizer: React.FC<QuantumStateVisualizerProps> = ({
  states,
  onStateSelect,
  onHarmonicAnalysis,
  onParameterChange
}) => {
  const graphRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const colorScale = useMemo(() => scaleLinear<string>()
    .domain([0, 1])
    .range(['#1a1a1a', '#00ffcc']), []);

  const graphData = useMemo(() => {
    const nodes = states.map(state => ({
      id: state.id,
      amplitude: state.amplitude,
      phase: state.phase,
      probability: state.probability,
      dimensions: state.dimensions,
      harmonics: state.harmonics,
      coherence: state.coherence,
      intelligence: state.intelligence || 0,
      entropy: state.entropy || 0,
      energy: state.energy || 0,
      complexity: state.complexity || 0,
      learning: state.learning || 0,
      development: state.development || 0
    }));

    const links = states.flatMap(state =>
      state.connections.map(target => ({
        source: state.id,
        target,
        strength: state.coherence,
        energyFlow: Math.random(), // TODO: Replace with actual energy flow calculation
        informationFlow: Math.random() // TODO: Replace with actual information flow calculation
      }))
    );

    return { nodes, links };
  }, [states]);

  useEffect(() => {
    if (!graphRef.current) return;
    const scene = (graphRef.current as any).scene;

    // Add 3D sphere for 512D representation
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Add harmonic analysis visualization
    const harmonicMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });
    const harmonicGeometry = new THREE.BufferGeometry();
    const harmonicLines = new THREE.Line(harmonicGeometry, harmonicMaterial);
    scene.add(harmonicLines);

    // Add energy flow visualization
    const energyMaterial = new THREE.LineBasicMaterial({ color: 0xffcc00 });
    const energyGeometry = new THREE.BufferGeometry();
    const energyLines = new THREE.Line(energyGeometry, energyMaterial);
    scene.add(energyLines);

    return () => {
      scene.remove(sphere);
      scene.remove(harmonicLines);
      scene.remove(energyLines);
    };
  }, []);

  const renderNode = (node: GraphNode, ctx: CanvasRenderingContext2D) => {
    const [x, y] = [node.x || 0, node.y || 0];
    
    // Draw intelligence core
    ctx.beginPath();
    ctx.arc(x, y, 8 * node.intelligence, 0, 2 * Math.PI, false);
    ctx.fillStyle = `rgba(0, 255, 204, ${node.intelligence})`;
    ctx.fill();

    // Draw entropy gradient
    ctx.beginPath();
    ctx.arc(x, y, 12 * node.probability, 0, 2 * Math.PI, false);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12 * node.probability);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${1 - node.entropy})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${node.entropy})`);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw energy flow indicators
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + 20 * Math.cos(node.phase),
      y + 20 * Math.sin(node.phase)
    );
    ctx.strokeStyle = `rgba(255, ${255 * node.energy}, 0, 0.8)`;
    ctx.lineWidth = 2 + (1 - node.coherence) * 4;
    ctx.stroke();

    // Draw complexity patterns
    const complexityPatterns = Math.ceil(node.complexity * 4);
    for (let i = 0; i < complexityPatterns; i++) {
      const angle = (i / complexityPatterns) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(
        x + 15 * Math.cos(angle),
        y + 15 * Math.sin(angle),
        3 * node.complexity,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = `rgba(255, ${255 * node.complexity}, 0, 0.8)`;
      ctx.fill();
    }
  };

  return (
    <div className="quantum-visualizer-container">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeAutoColorBy="coherence"
        nodeCanvasObject={renderNode}
        onNodeClick={(node: GraphNode) => {
          setSelectedNode(node);
          onStateSelect(node.id);
          if (onHarmonicAnalysis) {
            onHarmonicAnalysis(node.harmonics);
          }
        }}
        linkColor={(link: GraphLink) => 
          `rgba(255, 255, 255, ${0.5 * (link.energyFlow + link.informationFlow)})`
        }
        linkWidth={(link: GraphLink) => 1 + 2 * link.strength}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={(link: GraphLink) => 2 * link.strength}
      />

      {selectedNode && (
        <div className="quantum-state-details">
          <h3>Quantum State Details</h3>
          <div className="parameter-grid">
            <div>Intelligence: {selectedNode.intelligence.toFixed(2)}</div>
            <div>Entropy: {selectedNode.entropy.toFixed(2)}</div>
            <div>Energy: {selectedNode.energy.toFixed(2)}</div>
            <div>Complexity: {selectedNode.complexity.toFixed(2)}</div>
            <div>Learning: {selectedNode.learning.toFixed(2)}</div>
            <div>Development: {selectedNode.development.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumStateVisualizer;

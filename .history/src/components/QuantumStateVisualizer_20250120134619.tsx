/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useEffect } from 'react';
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
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

interface QuantumStateVisualizerProps {
  states: QuantumState[];
  onStateSelect: (stateId: string) => void;
  onHarmonicAnalysis?: (harmonics: number[]) => void;
}

const QuantumStateVisualizer: React.FC<QuantumStateVisualizerProps> = ({
  states,
  onStateSelect,
  onHarmonicAnalysis
}) => {
  const graphRef = useRef<any>(null);
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
      coherence: state.coherence
    }));

    const links = states.flatMap(state =>
      state.connections.map(target => ({
        source: state.id,
        target,
        strength: state.coherence
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

    return () => {
      scene.remove(sphere);
      scene.remove(harmonicLines);
    };
  }, []);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={graphData}
      nodeAutoColorBy="coherence"
      nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D) => {
        const [x, y] = [node.x || 0, node.y || 0];
        // Draw probability sphere
        ctx.beginPath();
        ctx.arc(x, y, 12 * node.probability, 0, 2 * Math.PI, false);
        ctx.fillStyle = colorScale(node.coherence);
        ctx.fill();

        // Draw phase coherence indicator
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x + 20 * Math.cos(node.phase),
          y + 20 * Math.sin(node.phase)
        );
        ctx.strokeStyle = `rgba(255, 255, 255, ${node.coherence})`;
        ctx.lineWidth = 2 + (1 - node.coherence) * 4;
        ctx.stroke();

        // Draw harmonic spectrum
        const harmonics = node.harmonics || [];
        harmonics.forEach((h: number, i: number) => {
          ctx.beginPath();
          ctx.arc(
            x + 30 * Math.cos((i / harmonics.length) * 2 * Math.PI),
            y + 30 * Math.sin((i / harmonics.length) * 2 * Math.PI),
            3 * h,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = `rgba(255, ${255 * h}, 0, 0.8)`;
          ctx.fill();
        });
      }}
      onNodeClick={(node: GraphNode) => {
        onStateSelect(node.id);
        if (onHarmonicAnalysis) {
          onHarmonicAnalysis(node.harmonics);
        }
      }}
      linkColor={(link: GraphLink) => `rgba(255, 255, 255, ${link.strength})`}
      linkWidth={(link: GraphLink) => 1 + 2 * link.strength}
      linkDirectionalParticles={1}
      linkDirectionalParticleWidth={(link: GraphLink) => 2 * link.strength}
    />
  );
};

export default QuantumStateVisualizer;

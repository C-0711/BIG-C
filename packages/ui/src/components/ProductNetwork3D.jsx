import { useEffect, useRef, useState } from 'react';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';

export default function ProductNetwork3D({ data, onNodeClick, height = 800 }) {
  const containerRef = useRef();
  const graphRef = useRef();

  useEffect(() => {
    if (!data || !containerRef.current) return;

    // Initialize 3D force graph
    const graph = ForceGraph3D()
      (containerRef.current)
      .backgroundColor('#0a0a0a')
      .graphData(data)
      .nodeLabel(node => `
        <div style="
          background: #1a1f2e;
          border: 1px solid #2A3140;
          border-radius: 4px;
          padding: 12px;
          max-width: 300px;
          color: #E4E7EB;
          font-family: Inter, sans-serif;
        ">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #E4E7EB;">
            ${node.name}
          </div>
          <div style="display: flex; justify-between; font-size: 11px; color: #9BA3AF; margin-top: 4px;">
            <span>Connections:</span>
            <span style="color: #9CA3AF; font-weight: 600;">${node.connections || 0}</span>
          </div>
          <div style="display: flex; justify-between; font-size: 11px; color: #9BA3AF; margin-top: 2px;">
            <span>Type:</span>
            <span style="color: #9BA3AF;">${node.type || 'product'}</span>
          </div>
        </div>
      `)
      .nodeColor(node => {
        const colors = {
          heat_pump: '#EF4444',
          boiler: '#F59E0B',
          water_heater: '#4B5563',
          accessory: '#10B981',
          default: '#9CA3AF'
        };
        return colors[node.type] || colors.default;
      })
      .nodeVal(node => Math.sqrt(node.connections || 1) * 3)
      .nodeOpacity(0.9)
      .nodeResolution(16)
      .linkColor(() => 'rgba(55, 65, 81, 0.2)')  // Dezentes Grau statt Blau
      .linkWidth(link => (link.weight || 0.5) * 0.5)
      .linkOpacity(0.3)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(1.5)
      .linkDirectionalParticleSpeed(0.003)
      .linkDirectionalParticleColor(() => '#9CA3AF')
      .onNodeClick(node => {
        // Camera focus animation
        const distance = 200;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        graph.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          1000
        );
        onNodeClick?.(node);
      })
      .onNodeHover(node => {
        containerRef.current.style.cursor = node ? 'pointer' : null;
      })
      .d3Force('charge').strength(-120)
      .d3Force('link').distance(60)
      .d3Force('center').strength(0.05);

    graphRef.current = graph;

    // Add Palantir-style ambient particles
    const particleSystem = createParticleSystem();
    graph.scene().add(particleSystem);

    // Add ambient lighting for better depth perception
    const ambientLight = new THREE.AmbientLight(0x4A9EFF, 0.3);
    graph.scene().add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8, 1000);
    pointLight.position.set(200, 200, 200);
    graph.scene().add(pointLight);

    // Camera animation on load
    graph.cameraPosition({ z: 800 }, { x: 0, y: 0, z: 0 }, 2000);

    return () => {
      graph._destructor();
    };
  }, [data, onNodeClick]);

  const createParticleSystem = () => {
    const particles = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);

    for (let i = 0; i < particles * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x4A9EFF,
      size: 2,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    const particles3D = new THREE.Points(geometry, material);

    // Animate particles slowly
    const animate = () => {
      const positions = particles3D.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      }
      particles3D.geometry.attributes.position.needsUpdate = true;
      requestAnimationFrame(animate);
    };
    animate();

    return particles3D;
  };

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: `${height}px` }}
      className="palantir-graph-canvas"
    />
  );
}

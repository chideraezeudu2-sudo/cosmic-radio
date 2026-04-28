import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { RadioStation } from '@/types';

interface GlobeProps {
  stations: RadioStation[];
  onStationClick: (station: RadioStation) => void;
  selectedStation?: RadioStation;
}

export default function Globe({ stations, onStationClick, selectedStation }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const markersRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [hoveredStation, setHoveredStation] = useState<RadioStation | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 2.5;

    // Globe group (contains globe + markers - they rotate together)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeRef.current = globeGroup;

    // Create globe geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create canvas texture for globe
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Simple blue ocean
    ctx.fillStyle = '#1a3a52';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some landmass (simplified)
    ctx.fillStyle = '#2d5016';
    for (let i = 0; i < canvas.width; i += 50) {
      for (let j = 0; j < canvas.height; j += 50) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 40, 40);
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 5 });
    const globe = new THREE.Mesh(geometry, material);
    globeGroup.add(globe);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Create markers group (rotates with globe)
    const markers = new THREE.Group();
    globeGroup.add(markers);
    markersRef.current = markers;

    // Create markers for each station
    const stationMarkers = new Map<THREE.Object3D, RadioStation>();
    
    stations.forEach((station) => {
      if (!station.latitude || !station.longitude) return;

      const lat = (station.latitude * Math.PI) / 180;
      const lon = (station.longitude * Math.PI) / 180;

      // Position on sphere surface
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon);

      // Create marker group
      const markerGroup = new THREE.Group();
      markerGroup.position.set(x, y, z);
      markerGroup.lookAt(0, 0, 0);

      // Create dot
      const dotGeometry = new THREE.SphereGeometry(0.03, 8, 8);
      const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      markerGroup.add(dot);

      // Create label
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(255, 107, 53, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(station.name.substring(0, 20), 128, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.3, 0.1, 1);
      sprite.position.set(0, 0.08, 0);
      markerGroup.add(sprite);

      markers.add(markerGroup);
      stationMarkers.set(markerGroup, station);
    });

    // Mouse interaction
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(markers.children, true);

      setHoveredStation(null);
      
      if (intersects.length > 0) {
        let markerGroup = intersects[0].object as THREE.Object3D;
        while (markerGroup.parent !== markers && markerGroup.parent) {
          markerGroup = markerGroup.parent;
        }
        
        const station = stationMarkers.get(markerGroup);
        if (station) {
          setHoveredStation(station);
          // Highlight marker
          const dot = markerGroup.children.find(c => c instanceof THREE.Mesh);
          if (dot instanceof THREE.Mesh) {
            (dot.material as THREE.MeshBasicMaterial).color.set(0xffff00);
            (dot.material as THREE.MeshBasicMaterial).emissive.set(0x666600);
          }
        }
      }

      // Reset all markers
      markers.children.forEach((markerGroup: THREE.Object3D) => {
        const dot = (markerGroup as any).children.find((c: THREE.Object3D) => c instanceof THREE.Mesh);
        if (dot instanceof THREE.Mesh) {
          const station = stationMarkers.get(markerGroup);
          const isSelected = selectedStation && station?.uuid === selectedStation.uuid;
          (dot.material as THREE.MeshBasicMaterial).color.set(isSelected ? 0x00ff00 : 0xff6b35);
          (dot.material as THREE.MeshBasicMaterial).emissive.set(isSelected ? 0x00aa00 : 0x000000);
        }
      });

      if (intersects.length > 0) {
        let markerGroup = intersects[0].object as THREE.Object3D;
        while (markerGroup.parent !== markers && markerGroup.parent) {
          markerGroup = markerGroup.parent;
        }
        const dot = (markerGroup as any).children.find((c: any) => c instanceof THREE.Mesh);
        if (dot instanceof THREE.Mesh) {
          (dot.material as THREE.MeshBasicMaterial).color.set(0xffff00);
          (dot.material as THREE.MeshBasicMaterial).emissive.set(0x666600);
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(markers.children, true);

      if (intersects.length > 0) {
        let markerGroup = intersects[0].object as THREE.Object3D;
        while (markerGroup.parent !== markers && markerGroup.parent) {
          markerGroup = markerGroup.parent;
        }
        
        const station = stationMarkers.get(markerGroup);
        if (station) {
          onStationClick(station);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate globe
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.0002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [stations, onStationClick, selectedStation]);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-b from-black via-blue-900/20 to-black">
      {hoveredStation && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/20 rounded-lg p-3 max-w-xs z-10">
          <p className="text-white font-semibold text-sm">{hoveredStation.name}</p>
          <p className="text-white/60 text-xs mt-1">{hoveredStation.country}</p>
        </div>
      )}
    </div>
  );
}

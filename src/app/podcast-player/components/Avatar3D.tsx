'use client';

import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, Html, ContactShadows, OrbitControls, useFBX } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
    isPlaying: boolean;
    currentTime: number;
    audioData?: number[];
    avatarType?: string;
}

// ─── Studio Background ────────────────────────────────────────────────────
const SceneBackground = () => {
    const texture = useLoader(THREE.TextureLoader, '/backgrounds/single_host_studio.png');
    useFrame((state) => {
        state.scene.background = texture;
    });
    return null;
};

// ─── Single Sitting Host Avatar ───────────────────────────────────────────
const SittingHost = ({ isPlaying, audioData = [] }: { isPlaying: boolean; audioData: number[] }) => {
    const fbx = useFBX('/avatar/Sitting Talking.fbx');
    const groupRef = useRef<THREE.Group>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);

    const mouthOpenness = useMemo(() => {
        if (!isPlaying || audioData.length === 0) return 0;
        return Math.min(audioData.reduce((a, b) => a + b, 0) / audioData.length * 2, 1);
    }, [isPlaying, audioData]);

    useEffect(() => {
        if (!fbx) return;
        if (fbx.animations && fbx.animations.length > 0) {
            mixerRef.current = new THREE.AnimationMixer(fbx);
            const action = mixerRef.current.clipAction(fbx.animations[0]);
            action.play();
        }
        return () => { mixerRef.current?.stopAllAction(); };
    }, [fbx]);

    useFrame((state, delta) => {
        mixerRef.current?.update(delta);
        if (groupRef.current) {
            const t = state.clock.getElapsedTime();
            // Very subtle idle sway — facing camera, grounded
            groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.03;
        }
        // Apply mouth morph targets if available
        if (fbx) {
            fbx.traverse((child) => {
                const mesh = child as THREE.Mesh;
                if (mesh.isMesh && mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
                    Object.keys(mesh.morphTargetDictionary)
                        .filter(k => k.toLowerCase().includes('mouth') || k.toLowerCase().includes('jaw'))
                        .forEach(k => {
                            const idx = mesh.morphTargetDictionary![k];
                            mesh.morphTargetInfluences![idx] = THREE.MathUtils.lerp(
                                mesh.morphTargetInfluences![idx],
                                mouthOpenness,
                                0.25
                            );
                        });
                }
            });
        }
    });

    return (
        <group ref={groupRef} position={[0, -1.6, -1.5]}>
            <primitive object={fbx} scale={0.012} />
        </group>
    );
};

// ─── Main Avatar3D Component ──────────────────────────────────────────────
const Avatar3D = ({ isPlaying, currentTime, audioData = [], avatarType = 'avatar-1' }: Avatar3DProps) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => { setIsHydrated(true); }, []);

    if (!isHydrated) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/70 text-xs">Loading Studio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            <Canvas
                ref={canvasRef}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
                camera={{ position: [0, 0.5, 6.0], fov: 35 }}
                shadows
                className="w-full h-full"
            >
                {/* Studio-quality lighting */}
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 6, 5]} intensity={1.5} color="#fff5e6" castShadow />
                {/* Key light — warm from left */}
                <spotLight position={[-3, 4, 4]} angle={0.5} penumbra={0.6} intensity={1.0} color="#ffecd2" />
                {/* Fill — cool from right */}
                <spotLight position={[3, 3, 4]} angle={0.5} penumbra={0.6} intensity={0.7} color="#dbeafe" />
                {/* Rim lights from behind for edge separation */}
                <pointLight position={[-2, 3, -3]} intensity={0.4} color="#7c3aed" />
                <pointLight position={[2, 3, -3]} intensity={0.4} color="#3b82f6" />

                <Suspense
                    fallback={
                        <Html center>
                            <div className="flex flex-col items-center gap-3 bg-black/85 px-10 py-7 rounded-2xl border border-white/10">
                                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-white text-sm font-semibold">Loading Podcast Studio...</p>
                            </div>
                        </Html>
                    }
                >
                    <SceneBackground />
                    <SittingHost isPlaying={isPlaying} audioData={audioData} />
                    <ContactShadows
                        position={[0, -1.6, -1.5]}
                        resolution={512}
                        scale={8}
                        blur={2}
                        opacity={0.4}
                        far={5}
                    />
                    <Environment preset="studio" />
                </Suspense>

                <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>

            {/* ON AIR badge */}
            {isPlaying && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-red-400/50 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-xs font-bold tracking-widest uppercase">On Air</span>
                </div>
            )}

            {/* Active glow border */}
            {isPlaying && (
                <div className="absolute inset-0 pointer-events-none border border-violet-500/30 shadow-[inset_0_0_30px_rgba(139,92,246,0.12)]" />
            )}
        </div>
    );
};

export default Avatar3D;

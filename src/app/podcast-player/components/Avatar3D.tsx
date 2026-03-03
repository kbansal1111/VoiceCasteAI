'use client';

import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
    isPlaying: boolean;
    currentTime: number;
    audioData?: number[];
    avatarType?: string;
}

const GLTFAvatar = ({ modelPath, scale, position, isPlaying, audioData }: any) => {
    const { scene, animations } = useGLTF(modelPath) as any;
    const group = useRef<THREE.Group>(null);
    const mixer = useRef<THREE.AnimationMixer | null>(null);

    const mouthOpenness = useMemo(() => {
        if (!isPlaying || audioData.length === 0) return 0;
        return audioData.reduce((a: number, b: number) => a + b, 0) / audioData.length;
    }, [isPlaying, audioData]);

    useEffect(() => {
        if (scene && animations && animations.length > 0) {
            mixer.current = new THREE.AnimationMixer(scene);
            const action = mixer.current.clipAction(animations[0]);
            action.play();
        }
        return () => {
            mixer.current?.stopAllAction();
        };
    }, [scene, animations]);

    useFrame((state, delta) => {
        mixer.current?.update(delta);
        if (group.current) {
            const time = state.clock.getElapsedTime();
            group.current.rotation.y = Math.sin(time * 0.5) * 0.1;
            group.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
        }
        if (scene) {
            scene.traverse((child) => {
                if ((child as any).isMesh && (child as any).morphTargetInfluences) {
                    const mesh = child as THREE.Mesh;
                    const mouthIndices = mesh.morphTargetDictionary ?
                        Object.keys(mesh.morphTargetDictionary)
                            .filter(key => key.toLowerCase().includes('mouth') || key.toLowerCase().includes('jaw'))
                            .map(key => mesh.morphTargetDictionary![key]) : [];

                    mouthIndices.forEach(index => {
                        mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(
                            mesh.morphTargetInfluences![index],
                            mouthOpenness * 1.5,
                            0.2
                        );
                    });
                }
            });
        }
    });

    return <primitive ref={group} object={scene} scale={scale} position={position} />;
};

import { useFBX } from '@react-three/drei';

const FBXAvatar = ({ modelPath, scale, position, isPlaying, audioData }: any) => {
    const fbx = useFBX(modelPath);
    const group = useRef<THREE.Group>(null);
    const mixer = useRef<THREE.AnimationMixer | null>(null);

    const mouthOpenness = useMemo(() => {
        if (!isPlaying || audioData.length === 0) return 0;
        return audioData.reduce((a: number, b: number) => a + b, 0) / audioData.length;
    }, [isPlaying, audioData]);

    useEffect(() => {
        if (fbx && fbx.animations && fbx.animations.length > 0) {
            mixer.current = new THREE.AnimationMixer(fbx);
            const action = mixer.current.clipAction(fbx.animations[0]);
            action.play();
        }
        return () => {
            mixer.current?.stopAllAction();
        };
    }, [fbx]);

    useFrame((state, delta) => {
        mixer.current?.update(delta);
        if (group.current) {
            const time = state.clock.getElapsedTime();
            group.current.rotation.y = Math.sin(time * 0.5) * 0.1;
            group.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
        }
        if (fbx) {
            fbx.traverse((child) => {
                if ((child as any).isMesh && (child as any).morphTargetInfluences) {
                    const mesh = child as THREE.Mesh;
                    const mouthIndices = mesh.morphTargetDictionary ?
                        Object.keys(mesh.morphTargetDictionary)
                            .filter(key => key.toLowerCase().includes('mouth') || key.toLowerCase().includes('jaw'))
                            .map(key => mesh.morphTargetDictionary![key]) : [];

                    mouthIndices.forEach(index => {
                        mesh.morphTargetInfluences![index] = THREE.MathUtils.lerp(
                            mesh.morphTargetInfluences![index],
                            mouthOpenness * 1.5,
                            0.2
                        );
                    });
                }
            });
        }
    });

    return <primitive ref={group} object={fbx} scale={scale} position={position} />;
};

const AvatarModel = ({ avatarType = 'avatar-1', isPlaying, audioData = [] }: { avatarType?: string; isPlaying: boolean; audioData: number[] }) => {
    const { modelPath, scale, position, isFbx } = useMemo(() => {
        // User requested to use "Sitting Talking" avatar only
        return { modelPath: '/avatar/Sitting Talking.fbx', scale: 0.02, position: [0, -2.5, 0] as [number, number, number], isFbx: true };
    }, []);

    return <FBXAvatar modelPath={modelPath} scale={scale} position={position} isPlaying={isPlaying} audioData={audioData} />;
};

const SceneBackground = () => {
    // Note: The path must be relative to the public folder for the browser to find it
    // I will copy the generated image to public/backgrounds/studio.png later
    const texture = useLoader(THREE.TextureLoader, '/backgrounds/studio.png');

    useFrame((state) => {
        state.scene.background = texture;
    });

    return null;
};

const Avatar3D = ({ isPlaying, currentTime, audioData = [], avatarType = 'avatar-1' }: Avatar3DProps) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return (
            <div className="w-full h-full min-h-[500px] bg-black rounded-xl animate-pulse flex items-center justify-center">
                <div className="w-32 h-32 bg-muted-foreground/20 rounded-full" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[500px] bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center border border-border/50">
            <div className="absolute inset-0 z-0">
                <Canvas
                    ref={canvasRef}
                    gl={{ preserveDrawingBuffer: true }} // Required for captureStream
                    camera={{ position: [0, 1, 10], fov: 45 }}
                    className="w-full h-full"
                >
                    <ambientLight intensity={1.2} />
                    <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={1.5} color="#ffffff" />
                    <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a78bfa" />

                    <Suspense fallback={<Html center><div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p className="text-sm font-medium text-white shadow-black drop-shadow-md">Loading Full 3D Hub...</p></div></Html>}>
                        <SceneBackground />
                        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
                            <AvatarModel avatarType={avatarType} isPlaying={isPlaying} audioData={audioData} />
                        </Float>
                        <Environment preset="city" />
                        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.35} far={10} color="#000000" />
                    </Suspense>

                    <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.8} />
                </Canvas>
            </div>

            {/* Glowing active indicator */}
            {isPlaying && (
                <div className="absolute inset-0 pointer-events-none rounded-xl border border-primary/30 shadow-[inset_0_0_20px_rgba(var(--primary),0.2)]" />
            )}
        </div>
    );
};

export default Avatar3D;

"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * A full-screen WebGL light field: domain-warped noise that drifts slowly,
 * lit in the current accent colour and pulled toward the pointer. Sits behind
 * hero content as an atmospheric layer; renders only while visible.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec2 uPointer;
  uniform vec2 uFocus;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float t = uTime * 0.05;

    vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 3.1));
    vec2 r = vec2(fbm(p * 1.3 + q * 1.9 + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.3 + q * 1.9 + vec2(8.3, 2.8) - t));
    float f = fbm(p * 1.1 + r * 2.1);

    vec2 focus = uFocus + uPointer * 0.07;
    float glow = smoothstep(1.25, 0.0, length((p - focus) * vec2(0.9, 1.15)));

    vec3 base = vec3(0.04, 0.04, 0.043);
    vec3 col = base + uColor * pow(f, 2.2) * 1.35 * glow;

    // Fine contour lines that read like light caught on brushed metal.
    float contour = pow(1.0 - abs(sin((f * 9.0 + t * 2.0) * 3.14159)), 40.0);
    col += mix(uColor, vec3(1.0), 0.4) * contour * 0.035 * glow;

    // Vignette and dither.
    col *= smoothstep(1.35, 0.2, length(p * vec2(0.85, 1.0)));
    col += (hash(vUv * 1000.0 + uTime) - 0.5) * 0.012;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Field({ color, focus }: { color: string; focus: [number, number] }) {
  const size = useThree((s) => s.size);
  const pointer = useRef(new THREE.Vector2());
  const material = useRef<THREE.ShaderMaterial>(null);
  const target = useMemo(() => new THREE.Color(color), [color]);
  // Created once; values are animated through the material ref every frame.
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uPointer: { value: new THREE.Vector2() },
    uFocus: { value: new THREE.Vector2(...focus) },
    uAspect: { value: 1 },
  }));

  useEffect(() => {
    const onMove = (e: PointerEvent) => pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uAspect.value = size.width / size.height;
    (u.uColor.value as THREE.Color).lerp(target, 1 - Math.exp(-delta * 2.5));
    (u.uPointer.value as THREE.Vector2).lerp(pointer.current, 1 - Math.exp(-delta * 3));
    (u.uFocus.value as THREE.Vector2).set(...focus);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} depthWrite={false} />
    </mesh>
  );
}

export default function AmbientField({ color, focus = [0.3, 0], className }: { color: string; focus?: [number, number]; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <Canvas frameloop={visible ? "always" : "never"} dpr={1} gl={{ antialias: false, alpha: false, powerPreference: "low-power" }} camera={{ position: [0, 0, 1] }}>
        <Field color={color} focus={focus} />
      </Canvas>
    </div>
  );
}

"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"

/*
 * Textured planets (real meshes, not points).
 * Textures: Solar System Scope (CC BY 4.0) — https://www.solarsystemscope.com/textures/
 */

const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const ATMOSPHERE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying vec3 vNormal;
void main() {
  float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
  gl_FragColor = vec4(uColor, 1.0) * intensity;
}
`

function Atmosphere({ radius, color }: { radius: number; color: string }) {
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        vertexShader={ATMOSPHERE_VERTEX}
        fragmentShader={ATMOSPHERE_FRAGMENT}
        uniforms={{ uColor: { value: new THREE.Color(color) } }}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export function Planet({
  textureUrl,
  radius,
  position,
  spinSpeed = 0.03,
  tilt = 0.2,
  glow = "#3b82f6",
  ring = false,
}: {
  textureUrl: string
  radius: number
  position: [number, number, number]
  spinSpeed?: number
  tilt?: number
  glow?: string
  ring?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture(textureUrl)
  texture.colorSpace = THREE.SRGBColorSpace

  useFrame((state) => {
    const { reducedMotion } = useScrollStore.getState()
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y = t * (reducedMotion ? spinSpeed * 0.2 : spinSpeed)
    }
    if (groupRef.current && !reducedMotion) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.15 + position[0]) * 0.6
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, tilt]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
      </mesh>
      <Atmosphere radius={radius} color={glow} />
      {ring && (
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[radius * 1.45, radius * 2.1, 96]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.28}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

export function Planets() {
  return (
    <>
      {/* Gas giant — CREATE/INNOVATE passage */}
      <Planet
        textureUrl="/textures/2k_jupiter.jpg"
        radius={9}
        position={[30, 4, -52]}
        spinSpeed={0.04}
        tilt={0.15}
        glow="#60a5fa"
      />
      {/* Cratered moon — near the opening */}
      <Planet
        textureUrl="/textures/2k_moon.jpg"
        radius={2.6}
        position={[-13, 7, -18]}
        spinSpeed={0.02}
        tilt={-0.1}
        glow="#93c5fd"
      />
      {/* Ringed ice giant — TRANSFORM chapter */}
      <Planet
        textureUrl="/textures/2k_neptune.jpg"
        radius={7}
        position={[-32, -4, -112]}
        spinSpeed={0.05}
        tilt={0.35}
        glow="#3b82f6"
        ring
      />
    </>
  )
}

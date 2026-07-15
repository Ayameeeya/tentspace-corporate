"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"
import { getPinpointSprite } from "./star-sprite"

/**
 * Distant background star field — two shells for depth.
 * No flares, no twinkle; magnitude-biased realism.
 */
export function Starfield() {
  const farRef = useRef<THREE.Points>(null)
  const nearRef = useRef<THREE.Points>(null)
  const quality = useScrollStore((s) => s.quality)
  const dense = quality === "high"

  const farCount = dense ? 7500 : 3600
  const nearCount = dense ? 1400 : 650

  const farLayer = useMemo(() => buildShell(farCount, 140, 420, 2.6, 0.1, 0.5), [farCount])
  const nearLayer = useMemo(() => buildShell(nearCount, 70, 160, 1.6, 0.22, 0.72), [nearCount])

  useFrame((state) => {
    const { progress, reducedMotion } = useScrollStore.getState()
    const t = state.clock.elapsedTime
    const rotY = reducedMotion ? t * 0.002 : t * 0.006 + progress * 0.5
    const rotX = reducedMotion ? 0 : Math.sin(t * 0.01) * 0.08

    for (const ref of [farRef, nearRef]) {
      if (!ref.current) continue
      ref.current.rotation.y = rotY
      ref.current.rotation.x = rotX
    }
  })

  return (
    <group>
      <points ref={farRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farLayer.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[farLayer.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          map={getPinpointSprite()}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>

      {/* Closer shell — fills the void without looking sparkly */}
      <points ref={nearRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nearLayer.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[nearLayer.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.65}
          vertexColors
          transparent
          opacity={0.55}
          sizeAttenuation
          map={getPinpointSprite()}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

function buildShell(
  count: number,
  rMin: number,
  rMax: number,
  magPower: number,
  brightMin: number,
  brightMax: number,
) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = rMin + Math.random() * (rMax - rMin)

    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    pos[i * 3 + 2] = r * Math.cos(phi) - 150

    const mag = Math.pow(Math.random(), magPower)
    const brightness = brightMin + mag * (brightMax - brightMin)

    const roll = Math.random()
    let rC: number, gC: number, bC: number
    if (roll < 0.18) {
      rC = 0.72; gC = 0.82; bC = 1.0
    } else if (roll < 0.82) {
      rC = 0.92; gC = 0.94; bC = 1.0
    } else if (roll < 0.94) {
      rC = 1.0; gC = 0.9; bC = 0.78
    } else {
      rC = 1.0; gC = 0.78; bC = 0.58
    }

    col[i * 3] = rC * brightness
    col[i * 3 + 1] = gC * brightness
    col[i * 3 + 2] = bC * brightness
  }
  return { pos, col }
}

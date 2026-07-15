"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"

/**
 * Overdrive ramps in during the 5th chapter (0.68 -> 0.86), then settles
 * as space fades to light for the finale (0.92 -> 0.99).
 */
export function overdriveIntensity(progress: number): number {
  const rampIn = THREE.MathUtils.smoothstep(progress, 0.68, 0.86)
  const settle = 1 - THREE.MathUtils.smoothstep(progress, 0.92, 0.99)
  return rampIn * settle
}

/**
 * Warp streaks for the overdrive finale. A single LineSegments geometry
 * (one draw call) whose segments stretch with intensity, plus a light-speed
 * tunnel cone that fades in at full throttle.
 */
export function Overdrive() {
  const linesRef = useRef<THREE.LineSegments>(null)
  const tunnelGroupRef = useRef<THREE.Group>(null)
  const tunnelRef = useRef<THREE.Mesh>(null)
  const quality = useScrollStore((s) => s.quality)
  const count = quality === "high" ? 420 : 200

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 6)
    const sd = new Float32Array(count * 4) // x, y, z-offset, speed
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 3 + Math.pow(Math.random(), 0.7) * 30
      sd[i * 4] = Math.cos(angle) * radius
      sd[i * 4 + 1] = Math.sin(angle) * radius
      sd[i * 4 + 2] = Math.random() * 200
      sd[i * 4 + 3] = 60 + Math.random() * 120
    }
    return { positions: pos, seeds: sd }
  }, [count])

  useFrame((state) => {
    const { progress, velocity, reducedMotion } = useScrollStore.getState()
    const t = state.clock.elapsedTime

    // Adaptive pacing: fast scrolling adds a touch of streaking even mid-journey
    const scrollBoost = reducedMotion ? 0 : Math.min(Math.abs(velocity) * 0.004, 0.25)
    const intensity = Math.min(overdriveIntensity(progress) + scrollBoost, 1)

    if (linesRef.current) {
      const material = linesRef.current.material as THREE.LineBasicMaterial
      material.opacity = intensity * 0.85

      if (intensity > 0.01) {
        const arr = linesRef.current.geometry.attributes.position.array as Float32Array
        const camZ = state.camera.position.z
        for (let i = 0; i < count; i++) {
          const x = seeds[i * 4]
          const y = seeds[i * 4 + 1]
          const speed = seeds[i * 4 + 3]
          const z = camZ - 20 - ((seeds[i * 4 + 2] + t * speed * intensity) % 200)
          const len = 2 + intensity * 26

          arr[i * 6] = x
          arr[i * 6 + 1] = y
          arr[i * 6 + 2] = z
          arr[i * 6 + 3] = x
          arr[i * 6 + 4] = y
          arr[i * 6 + 5] = z + len
        }
        linesRef.current.geometry.attributes.position.needsUpdate = true
      }
    }

    if (tunnelRef.current && tunnelGroupRef.current) {
      const material = tunnelRef.current.material as THREE.MeshBasicMaterial
      material.opacity = Math.max(0, intensity - 0.6) * 0.5
      tunnelGroupRef.current.position.z = state.camera.position.z - 60
      tunnelRef.current.rotation.y = t * 1.5 // spin around the tunnel axis
    }
  })

  return (
    <group>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color="#bfdbfe"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Cylinder axis is Y; the group tilts it onto the Z axis (travel direction) */}
      <group ref={tunnelGroupRef} rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={tunnelRef} frustumCulled={false}>
          <cylinderGeometry args={[4, 34, 120, 32, 1, true]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  )
}

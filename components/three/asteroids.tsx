"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"

/**
 * Noise-displaced sphere -> irregular potato-shaped rock.
 */
export function makeAsteroidGeometry(seed: number): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 28, 20)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  const s1 = seed * 12.9898
  const s2 = seed * 78.233
  const s3 = seed * 37.719

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const { x, y, z } = v
    const bump =
      0.24 * Math.sin(2.6 * x + s1) * Math.cos(2.1 * y + s2) +
      0.14 * Math.sin(4.7 * y + s2) * Math.cos(3.9 * z + s3) +
      0.07 * Math.sin(8.3 * z + s3) * Math.cos(7.1 * x + s1)
    const r = Math.max(0.62, 1 + bump)
    pos.setXYZ(i, x * r, y * r, z * r)
  }
  geo.computeVertexNormals()
  return geo
}

function useAsteroidAssets() {
  const moonMap = useTexture("/textures/2k_moon.jpg")
  const geometries = useMemo(() => [1, 2, 3].map(makeAsteroidGeometry), [])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: moonMap,
        color: "#8f887c",
        roughness: 0.95,
        metalness: 0.05,
      }),
    [moonMap],
  )
  return { geometries, material }
}

/**
 * Instanced asteroid belt — slow orbit around the galaxy (top page).
 */
export function AsteroidBelt() {
  const quality = useScrollStore((s) => s.quality)
  const count = quality === "high" ? 90 : 40
  const { geometries, material } = useAsteroidAssets()

  const variants = useMemo(() => {
    const tint = new THREE.Color()
    return geometries.map((_, gi) => {
      const n = Math.ceil(count / geometries.length)
      const items = Array.from({ length: n }, (_, i) => {
        const k = gi * n + i
        return {
          angle: (k / count) * Math.PI * 2 + Math.random() * 0.4,
          radius: 26 + Math.random() * 26,
          y: (Math.random() - 0.5) * 14,
          scale: [
            0.3 + Math.random() * 1.0,
            (0.3 + Math.random() * 1.0) * (0.65 + Math.random() * 0.5),
            (0.3 + Math.random() * 1.0) * (0.65 + Math.random() * 0.5),
          ] as [number, number, number],
          spin: (Math.random() - 0.5) * 0.9,
          offset: Math.random() * Math.PI * 2,
        }
      })
      const colors = items.map(() => {
        const warm = Math.random()
        return tint
          .setRGB(0.5 + warm * 0.22, 0.47 + warm * 0.15, 0.43 + warm * 0.07)
          .multiplyScalar(0.75 + Math.random() * 0.45)
          .clone()
      })
      return { items, colors }
    })
  }, [count, geometries])

  const refs = useRef<(THREE.InstancedMesh | null)[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const { reducedMotion } = useScrollStore.getState()
    const t = reducedMotion ? 0 : state.clock.elapsedTime

    variants.forEach((variant, gi) => {
      const mesh = refs.current[gi]
      if (!mesh) return
      variant.items.forEach((item, i) => {
        const angle = item.angle + t * 0.02
        dummy.position.set(
          Math.cos(angle) * item.radius,
          item.y + Math.sin(t * 0.3 + item.offset) * 0.8,
          Math.sin(angle) * item.radius - 52,
        )
        dummy.rotation.set(t * item.spin, t * item.spin * 0.7 + item.offset, item.offset)
        dummy.scale.set(...item.scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <group>
      {variants.map((variant, gi) => (
        <instancedMesh
          key={gi}
          ref={(el) => {
            refs.current[gi] = el
            if (el) {
              variant.colors.forEach((c, i) => el.setColorAt(i, c))
              if (el.instanceColor) el.instanceColor.needsUpdate = true
            }
          }}
          args={[geometries[gi], material, variant.items.length]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}

type DriftItem = {
  base: [number, number, number]
  amp: [number, number, number]
  freq: [number, number, number]
  phase: [number, number, number]
  spin: [number, number, number]
  scale: [number, number, number]
}

/**
 * Zero-G drift — rocks tumble slowly through open space (about page).
 * No orbital path; each body follows a gentle incommensurate 3D lissajous curve.
 */
export function FloatingAsteroids({
  count: countProp,
}: {
  count?: number
} = {}) {
  const quality = useScrollStore((s) => s.quality)
  const count = countProp ?? (quality === "high" ? 48 : 24)
  const { geometries, material } = useAsteroidAssets()

  const variants = useMemo(() => {
    const tint = new THREE.Color()
    return geometries.map((_, gi) => {
      const n = Math.ceil(count / geometries.length)
      const items: DriftItem[] = Array.from({ length: n }, () => ({
        base: [
          (Math.random() - 0.5) * 52,
          (Math.random() - 0.5) * 28,
          -8 - Math.random() * 48,
        ],
        amp: [
          1.2 + Math.random() * 3.5,
          0.8 + Math.random() * 2.8,
          1.5 + Math.random() * 4,
        ],
        freq: [
          0.04 + Math.random() * 0.07,
          0.035 + Math.random() * 0.06,
          0.03 + Math.random() * 0.055,
        ],
        phase: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ],
        spin: [
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.28,
          (Math.random() - 0.5) * 0.22,
        ],
        scale: [
          0.25 + Math.random() * 0.85,
          (0.25 + Math.random() * 0.85) * (0.6 + Math.random() * 0.45),
          (0.25 + Math.random() * 0.85) * (0.6 + Math.random() * 0.45),
        ],
      }))
      const colors = items.map(() => {
        const warm = Math.random()
        return tint
          .setRGB(0.5 + warm * 0.22, 0.47 + warm * 0.15, 0.43 + warm * 0.07)
          .multiplyScalar(0.75 + Math.random() * 0.45)
          .clone()
      })
      return { items, colors }
    })
  }, [count, geometries])

  const refs = useRef<(THREE.InstancedMesh | null)[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    const { reducedMotion } = useScrollStore.getState()
    const t = reducedMotion ? 0 : state.clock.elapsedTime

    variants.forEach((variant, gi) => {
      const mesh = refs.current[gi]
      if (!mesh) return
      variant.items.forEach((item, i) => {
        dummy.position.set(
          item.base[0] + Math.sin(t * item.freq[0] + item.phase[0]) * item.amp[0],
          item.base[1] + Math.cos(t * item.freq[1] + item.phase[1]) * item.amp[1],
          item.base[2] + Math.sin(t * item.freq[2] + item.phase[2]) * item.amp[2],
        )
        dummy.rotation.set(
          t * item.spin[0] + item.phase[0],
          t * item.spin[1] + item.phase[1],
          t * item.spin[2] + item.phase[2],
        )
        dummy.scale.set(...item.scale)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <group>
      {variants.map((variant, gi) => (
        <instancedMesh
          key={gi}
          ref={(el) => {
            refs.current[gi] = el
            if (el) {
              variant.colors.forEach((c, i) => el.setColorAt(i, c))
              if (el.instanceColor) el.instanceColor.needsUpdate = true
            }
          }}
          args={[geometries[gi], material, variant.items.length]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}

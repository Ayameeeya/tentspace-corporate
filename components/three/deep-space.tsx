"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"
import { getCloudSprite, getDistantGalaxySprite, getStarSprite } from "./star-sprite"

/**
 * Volumetric-looking nebulae: clusters of large soft cloud sprites in
 * blue/indigo hues, placed along the camera's flight path so the journey
 * always has something drifting past.
 */
export function Nebulae() {
  const groupRef = useRef<THREE.Group>(null)
  const quality = useScrollStore((s) => s.quality)

  const clouds = useMemo(() => {
    const palette = ["#1e3a8a", "#312e81", "#4338ca", "#1e40af", "#3730a3", "#4c1d95"]
    // Cluster centers along the journey (camera travels z 30 -> -320)
    // Journey clusters + ambient deep-sky patches always visible
    const clusters: { center: [number, number, number]; spread: number; n: number; scale: number }[] = [
      { center: [0, 8, -60], spread: 35, n: 4, scale: 90 },
      { center: [-55, -5, -120], spread: 28, n: 3, scale: 75 },
      { center: [50, 12, -200], spread: 32, n: 3, scale: 85 },
      { center: [14, -2, -34], spread: 10, n: 5, scale: 26 },
      { center: [-30, 10, -70], spread: 14, n: 5, scale: 34 },
      { center: [45, -12, -95], spread: 16, n: 4, scale: 40 },
      { center: [-12, -18, -150], spread: 18, n: 5, scale: 46 },
      { center: [10, 8, -210], spread: 22, n: 4, scale: 55 },
      { center: [-40, 0, -270], spread: 24, n: 4, scale: 60 },
    ]
    const items: {
      position: [number, number, number]
      scale: number
      color: string
      seed: number
      rotation: number
      speed: number
    }[] = []

    clusters.forEach((cl, ci) => {
      const n = quality === "high" ? cl.n : Math.ceil(cl.n / 2)
      for (let i = 0; i < n; i++) {
        items.push({
          position: [
            cl.center[0] + (Math.random() - 0.5) * cl.spread * 2,
            cl.center[1] + (Math.random() - 0.5) * cl.spread,
            cl.center[2] + (Math.random() - 0.5) * cl.spread * 2,
          ],
          scale: cl.scale * (0.6 + Math.random() * 0.8),
          color: palette[(ci + i) % palette.length],
          seed: ci * 7 + i,
          rotation: Math.random() * Math.PI * 2,
          speed: (Math.random() - 0.5) * 0.02,
        })
      }
    })
    return items
  }, [quality])

  useFrame((state) => {
    if (!groupRef.current) return
    const { reducedMotion } = useScrollStore.getState()
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const material = (child as THREE.Sprite).material as THREE.SpriteMaterial
      material.rotation = clouds[i].rotation + t * clouds[i].speed
      // Static opacity — no breathing pulse
      material.opacity = 0.14
    })
  })

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <sprite key={i} position={cloud.position} scale={[cloud.scale, cloud.scale * 0.72, 1]}>
          <spriteMaterial
            map={getCloudSprite(cloud.seed % 4)}
            color={cloud.color}
            transparent
            opacity={0.14}
            rotation={cloud.rotation}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}

/** Tiny tilted galaxy impostors scattered in the far distance. */
export function DistantGalaxies() {
  const galaxies = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 520,
          (Math.random() - 0.5) * 240,
          -160 - Math.random() * 280,
        ] as [number, number, number],
        scale: 5 + Math.random() * 16,
        rotation: Math.random() * Math.PI,
        tint: i % 3 === 0 ? "#f3ecdd" : i % 3 === 1 ? "#e6dcc6" : "#dde3ec",
        opacity: 0.22 + Math.random() * 0.18,
      })),
    [],
  )

  return (
    <group>
      {galaxies.map((g, i) => (
        <sprite key={i} position={g.position} scale={[g.scale, g.scale, 1]}>
          <spriteMaterial
            map={getDistantGalaxySprite()}
            color={g.tint}
            transparent
            opacity={g.opacity}
            rotation={g.rotation}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}

/**
 * A few slightly brighter foreground stars — soft round glow, no flares or twinkle.
 */
export function ForegroundStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        position: [
          (Math.random() - 0.5) * 380,
          (Math.random() - 0.5) * 180,
          10 - Math.random() * 320,
        ] as [number, number, number],
        scale: 0.9 + Math.random() * 1.4,
        tint: Math.random() > 0.65 ? "#c8d8f0" : "#eee8dc",
        opacity: 0.28 + Math.random() * 0.22,
      })),
    [],
  )

  return (
    <group>
      {stars.map((s, i) => (
        <sprite key={i} position={s.position} scale={[s.scale, s.scale, 1]}>
          <spriteMaterial
            map={getStarSprite()}
            color={s.tint}
            transparent
            opacity={s.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}

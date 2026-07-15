"use client"

import { Suspense, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"
import { Starfield } from "./starfield"
import { Galaxy } from "./galaxy"
import { Planets } from "./planets"
import { AsteroidBelt } from "./asteroids"
import { Nebulae, DistantGalaxies, ForegroundStars } from "./deep-space"
import { Overdrive } from "./overdrive"
import { CameraRig } from "./camera-rig"

const DARK = new THREE.Color("#020212")
const LIGHT = new THREE.Color("#f5f5f7")

/** Mutates scene background + fog directly each frame (no React re-render). */
function Background() {
  const { scene } = useThree()
  const color = useRef(new THREE.Color("#020212"))
  const fog = useRef(new THREE.Fog("#020212", 60, 320))

  useFrame(() => {
    const { progress } = useScrollStore.getState()
    // Burst out of overdrive into light for the finale chapter
    const fade = THREE.MathUtils.smoothstep(progress, 0.9, 1)
    color.current.lerpColors(DARK, LIGHT, fade)

    scene.background = color.current
    fog.current.color = color.current
    scene.fog = fog.current
  })

  return null
}

export function SpaceScene() {
  return (
    <>
      <Background />
      <CameraRig />

      <ambientLight intensity={0.25} />
      {/* Key light from the (warm) galaxy core */}
      <pointLight position={[0, -10, -85]} intensity={2.5} color="#ffd9a6" distance={160} />
      {/* Cool rim light */}
      <directionalLight position={[40, 30, 20]} intensity={1.2} color="#ffffff" />

      <Starfield />
      <Nebulae />
      <DistantGalaxies />
      <ForegroundStars />
      <Overdrive />

      <Suspense fallback={null}>
        <Galaxy />
        <Planets />
        <AsteroidBelt />
      </Suspense>
    </>
  )
}

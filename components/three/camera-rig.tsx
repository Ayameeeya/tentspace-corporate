"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"
import { overdriveIntensity } from "./overdrive"

/**
 * Camera spline (Catmull-Rom) — the "one-cut journey" pattern from the
 * scrollytelling research. Scroll progress moves the camera along a path
 * that flies past the moon, a nebula field, the gas giant, dives across
 * the galaxy, grazes the ringed planet, then punches into overdrive.
 */
export function CameraRig() {
  const { camera } = useThree()

  const positionCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 3, 30), // hero — overlooking the scene
          new THREE.Vector3(-9, 6, 0), // drift past the moon
          new THREE.Vector3(6, 0, -22), // swim through the nebula field
          new THREE.Vector3(18, 3, -40), // approach the gas giant
          new THREE.Vector3(4, -7, -68), // dive toward the galaxy plane
          new THREE.Vector3(-20, -8, -98), // graze the ringed planet
          new THREE.Vector3(-12, -6, -150), // line up for overdrive
          new THREE.Vector3(-12, -5, -320), // full overdrive
        ],
        false,
        "catmullrom",
        0.4,
      ),
    [],
  )

  const lookCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, -4, -60), // toward the galaxy
          new THREE.Vector3(-13, 7, -18), // the moon
          new THREE.Vector3(14, -2, -34), // the nebula cluster
          new THREE.Vector3(30, 4, -52), // the gas giant
          new THREE.Vector3(0, -14, -85), // galaxy core
          new THREE.Vector3(-32, -4, -112), // the ringed planet
          new THREE.Vector3(-12, -5, -240), // straight ahead
          new THREE.Vector3(-12, -5, -420), // vanishing point
        ],
        false,
        "catmullrom",
        0.4,
      ),
    [],
  )

  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())
  const smoothedLook = useRef(new THREE.Vector3(0, -4, -60))

  useFrame((state) => {
    const { progress, reducedMotion } = useScrollStore.getState()
    const t = state.clock.elapsedTime
    const persp = camera as THREE.PerspectiveCamera

    if (reducedMotion) {
      persp.position.set(0, 3, 30)
      persp.lookAt(0, -4, -60)
      if (persp.fov !== 60) {
        persp.fov = 60
        persp.updateProjectionMatrix()
      }
      return
    }

    positionCurve.getPoint(progress, targetPos.current)
    lookCurve.getPoint(progress, targetLook.current)

    // Gentle breathing so the camera never feels frozen between scrolls
    targetPos.current.x += Math.sin(t * 0.4) * 0.8
    targetPos.current.y += Math.cos(t * 0.3) * 0.5

    // Lenis smooths scroll; light damping here removes the last jitter
    persp.position.lerp(targetPos.current, 0.08)
    smoothedLook.current.lerp(targetLook.current, 0.06)
    persp.lookAt(smoothedLook.current)

    // FOV surge on overdrive (light-speed feel)
    const fov = 60 + overdriveIntensity(progress) * 24
    if (Math.abs(persp.fov - fov) > 0.05) {
      persp.fov = fov
      persp.updateProjectionMatrix()
    }
  })

  return null
}

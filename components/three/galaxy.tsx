"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import { useScrollStore } from "@/lib/stores/scroll-store"
import { getStarSprite, getGlowSprite, getCloudSprite } from "./star-sprite"

/**
 * Spiral galaxy matched to the user's M81 reference photo:
 *  - warm cream / yellow core with soft bloom
 *  - photographic disk with soft edge falloff
 *  - particles shaped to the photo ellipse, steep inclination, purple/pink palette
 */
export function Galaxy({
  position = [0, -14, -85] as [number, number, number],
}: {
  position?: [number, number, number]
}) {
  const groupRef = useRef<THREE.Group>(null)
  const quality = useScrollStore((s) => s.quality)
  const dense = quality === "high"
  const rawPhoto = useTexture("/textures/galaxy-m81.png")

  /**
   * Bake a long soft feather into the photo RGB.
   * With AdditiveBlending, black = invisible. Also lifts darkest dust patches.
   */
  const photo = useMemo(() => {
    const src = rawPhoto.image as CanvasImageSource & { width: number; height: number }
    if (!src?.width) return rawPhoto

    const w = src.width
    const h = src.height
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!
    ctx.drawImage(src, 0, 0)

    const data = ctx.getImageData(0, 0, w, h)
    const px = data.data
    const cx = w * 0.5
    const cy = h * 0.5
    const rx = w * 0.42
    const ry = h * 0.42

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const nx = (x - cx) / rx
        const ny = (y - cy) / ry
        const d = Math.sqrt(nx * nx + ny * ny)

        let edge = 1
        if (d > 0.2) {
          const t = Math.min(1, (d - 0.2) / 0.8)
          edge = 1 - t * t * t * (t * (t * 6 - 15) + 10)
        }

        let r = px[i]
        let g = px[i + 1]
        let b = px[i + 2]
        const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255

        if (lum < 0.32) {
          const amt = (0.32 - lum) / 0.32
          r = r + (110 - r) * amt * 0.7
          g = g + (80 - g) * amt * 0.55
          b = b + (150 - b) * amt * 0.75
        }

        px[i] = Math.max(0, Math.min(255, r * edge))
        px[i + 1] = Math.max(0, Math.min(255, g * edge))
        px[i + 2] = Math.max(0, Math.min(255, b * edge))
        px[i + 3] = 255
      }
    }
    ctx.putImageData(data, 0, 0)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [rawPhoto])

  const layers = useMemo(() => {
    // Even density across the photo ellipse — avoid bright local ridges
    const RADIUS = 32
    const ASPECT = 1024 / 790
    const ARMS = 2
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
    const twistOf = (t: number) => Math.log(1 + t * 5.5) * 2.1
    const PHASE = -0.4

    const tmp = new THREE.Color()
    const cCore = new THREE.Color("#ffe8c8")
    const cPink = new THREE.Color("#c888b8")
    const cLavender = new THREE.Color("#9880c8")
    const cPurple = new THREE.Color("#6a58a0")
    const cDeep = new THREE.Color("#4a4080")
    const cHii = new THREE.Color("#d070a8")
    const cHiiHot = new THREE.Color("#e898c0")

    const rampColor = (t: number, out: THREE.Color) => {
      if (t < 0.12) out.lerpColors(cCore, cPink, t / 0.12)
      else if (t < 0.35) out.lerpColors(cPink, cLavender, (t - 0.12) / 0.23)
      else if (t < 0.65) out.lerpColors(cLavender, cPurple, (t - 0.35) / 0.3)
      else out.lerpColors(cPurple, cDeep, (t - 0.65) / 0.35)
    }

    // Fade outer arms so texture dominates at the rim
    const outerFade = (t: number) => {
      if (t < 0.4) return 1
      const f = 1 - Math.pow((t - 0.4) / 0.55, 1.8)
      return Math.max(0.06, f)
    }

    const placeOnArm = (t: number, arm: number, spread: number) => {
      const r = t * RADIUS
      const angle = PHASE + (arm / ARMS) * Math.PI * 2 + twistOf(t) + spread
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r * ASPECT
      return { x: -z, z: x }
    }

    // Half the previous count; spread wide so density stays flat
    const armCount = dense ? 9000 : 4000
    const armPos = new Float32Array(armCount * 3)
    const armCol = new Float32Array(armCount * 3)

    for (let i = 0; i < armCount; i++) {
      const diskMix = Math.random()
      // Bias placement inward so outer arms stay sparse
      const t = Math.pow(Math.random(), diskMix < 0.45 ? 0.85 : 0.68)
      const spread =
        diskMix < 0.45
          ? (Math.random() - 0.5) * Math.PI
          : gauss() * (0.2 + t * 0.55)
      const p = placeOnArm(t, i % ARMS, spread)
      const thickness = (1 - t * 0.75) * 0.7

      armPos[i * 3] = p.x + gauss() * t * 1.8
      armPos[i * 3 + 1] = gauss() * thickness
      armPos[i * 3 + 2] = p.z + gauss() * t * 1.8

      rampColor(t, tmp)
      const dim = (0.55 + Math.random() * 0.25) * outerFade(t)
      armCol[i * 3] = tmp.r * dim
      armCol[i * 3 + 1] = tmp.g * dim
      armCol[i * 3 + 2] = tmp.b * dim
    }

    const hiiCount = dense ? 280 : 120
    const hiiPos = new Float32Array(hiiCount * 3)
    const hiiCol = new Float32Array(hiiCount * 3)
    for (let i = 0; i < hiiCount; i++) {
      const t = 0.28 + Math.pow(Math.random(), 0.85) * 0.45
      const p = placeOnArm(t, i % ARMS, gauss() * 0.25)
      hiiPos[i * 3] = p.x + gauss() * 1.6
      hiiPos[i * 3 + 1] = gauss() * 0.3
      hiiPos[i * 3 + 2] = p.z + gauss() * 1.6

      tmp.lerpColors(cHii, cHiiHot, Math.random())
      const dim = (0.6 + Math.random() * 0.25) * outerFade(t)
      hiiCol[i * 3] = tmp.r * dim
      hiiCol[i * 3 + 1] = tmp.g * dim
      hiiCol[i * 3 + 2] = tmp.b * dim
    }

    const mistCount = dense ? 28 : 14
    const mist: { pos: [number, number, number]; scale: number; color: string; seed: number; opacity: number }[] = []
    for (let i = 0; i < mistCount; i++) {
      const t = 0.28 + Math.random() * 0.42
      const p = placeOnArm(t, i % ARMS, gauss() * 0.35)
      mist.push({
        pos: [p.x + gauss() * 2.5, gauss() * 0.4, p.z + gauss() * 2.5],
        scale: 6 + Math.random() * 8,
        color: Math.random() > 0.4 ? "#7a60a8" : "#986090",
        seed: i % 4,
        opacity: 0.1 * outerFade(t),
      })
    }

    const coreCount = dense ? 1800 : 800
    const corePos = new Float32Array(coreCount * 3)
    const coreCol = new Float32Array(coreCount * 3)
    const cBulge = new THREE.Color("#f0d0a8")
    const cBulgeEdge = new THREE.Color("#d0a890")
    for (let i = 0; i < coreCount; i++) {
      const r = Math.abs(gauss()) * 5.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      corePos[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.1
      corePos[i * 3 + 1] = r * Math.cos(phi) * 0.35
      corePos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 1.1 * ASPECT

      tmp.lerpColors(cBulge, cBulgeEdge, Math.min(r / 5.5, 1))
      const dim = 0.55 + Math.random() * 0.2
      coreCol[i * 3] = tmp.r * dim
      coreCol[i * 3 + 1] = tmp.g * dim
      coreCol[i * 3 + 2] = tmp.b * dim
    }

    const haloCount = dense ? 700 : 320
    const haloPos = new Float32Array(haloCount * 3)
    const haloCol = new Float32Array(haloCount * 3)
    for (let i = 0; i < haloCount; i++) {
      const t = 0.45 + Math.random() * 0.35
      const r = t * RADIUS
      const theta = Math.random() * Math.PI * 2
      const x = Math.cos(theta) * r + gauss() * 2.5
      const z = (Math.sin(theta) * r + gauss() * 2.5) * ASPECT
      haloPos[i * 3] = -z
      haloPos[i * 3 + 1] = gauss() * 1.8
      haloPos[i * 3 + 2] = x

      const fade = outerFade(t)
      haloCol[i * 3] = 0.65 * fade
      haloCol[i * 3 + 1] = 0.52 * fade
      haloCol[i * 3 + 2] = 0.78 * fade
    }

    return { armPos, armCol, hiiPos, hiiCol, mist, corePos, coreCol, haloPos, haloCol }
  }, [dense])

  useFrame((state) => {
    if (!groupRef.current) return
    const { reducedMotion } = useScrollStore.getState()
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = t * (reducedMotion ? 0.002 : 0.008)
  })

  const photoW = 70
  const photoH = photoW * (1024 / 790)

  return (
    // Steeper inclination (~78°) — closer to the reference photo
    <group position={position} rotation={[1.36, 0.28, 0.22]}>
      <group ref={groupRef}>
        <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} renderOrder={0}>
          <planeGeometry args={[photoW, photoH]} />
          <meshBasicMaterial
            map={photo}
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[layers.corePos, 3]} />
            <bufferAttribute attach="attributes-color" args={[layers.coreCol, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.45}
            vertexColors
            transparent
            opacity={0.45}
            sizeAttenuation
            map={getStarSprite()}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[layers.armPos, 3]} />
            <bufferAttribute attach="attributes-color" args={[layers.armCol, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.4}
            vertexColors
            transparent
            opacity={0.5}
            sizeAttenuation
            map={getStarSprite()}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[layers.hiiPos, 3]} />
            <bufferAttribute attach="attributes-color" args={[layers.hiiCol, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.9}
            vertexColors
            transparent
            opacity={0.4}
            sizeAttenuation
            map={getStarSprite()}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        {layers.mist.map((m, i) => (
          <sprite key={i} position={m.pos} scale={[m.scale, m.scale * 0.7, 1]}>
            <spriteMaterial
              map={getCloudSprite(m.seed)}
              color={m.color}
              transparent
              opacity={m.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        ))}

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[layers.haloPos, 3]} />
            <bufferAttribute attach="attributes-color" args={[layers.haloCol, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.4}
            vertexColors
            transparent
            opacity={0.35}
            sizeAttenuation
            map={getStarSprite()}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      <sprite scale={[70, 90, 1]} position={[0, 0.2, 0]}>
        <spriteMaterial
          map={getGlowSprite()}
          color="#6a4a90"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <sprite scale={[12, 14, 1]} position={[0, 0.4, 0]}>
        <spriteMaterial
          map={getGlowSprite()}
          color="#ffe0a8"
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite scale={[24, 30, 1]} position={[0, 0.4, 0]}>
        <spriteMaterial
          map={getGlowSprite()}
          color="#e8b080"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite scale={[42, 52, 1]} position={[0, 0.4, 0]}>
        <spriteMaterial
          map={getGlowSprite()}
          color="#a070b0"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  )
}

"use client"

import type React from "react"

import { useEffect, useRef, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Header } from "@/components/header"
// import { BlogFloatingCTA } from "@/components/blog-floating-cta"
import Link from "next/link"
import Image from "next/image"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Massive Star Field with dynamic movement
function StarField({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 15000

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 50 + Math.random() * 200

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      const isBlue = Math.random() > 0.7
      col[i * 3] = isBlue ? 0.4 : 1
      col[i * 3 + 1] = isBlue ? 0.6 : 1
      col[i * 3 + 2] = 1

      siz[i] = Math.random() * 2 + 0.5
    }
    return [pos, col, siz]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime

    pointsRef.current.rotation.y = t * 0.02 + scrollProgress * Math.PI * 2
    pointsRef.current.rotation.x = Math.sin(t * 0.01) * 0.2 + scrollProgress * 0.5
    pointsRef.current.rotation.z = scrollProgress * Math.PI

    const scale = 1 + scrollProgress * 0.5
    pointsRef.current.scale.setScalar(scale)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Morphing Particle Sphere/Galaxy
function MorphingParticles({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 8000

  const [initialPositions, targetPositions] = useMemo(() => {
    const init = new Float32Array(count * 3)
    const target = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Sphere formation
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 8 + Math.random() * 2

      init[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      init[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      init[i * 3 + 2] = r * Math.cos(phi)

      // Galaxy spiral formation
      const arm = Math.floor(Math.random() * 4)
      const armAngle = (arm / 4) * Math.PI * 2
      const dist = Math.random() * 25
      const spiralAngle = dist * 0.5 + armAngle

      target[i * 3] = Math.cos(spiralAngle) * dist
      target[i * 3 + 1] = (Math.random() - 0.5) * 3
      target[i * 3 + 2] = Math.sin(spiralAngle) * dist
    }
    return [init, target]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    const geometry = pointsRef.current.geometry
    const positions = geometry.attributes.position.array as Float32Array

    const morphFactor = Math.min(scrollProgress * 2, 1)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      positions[i3] = THREE.MathUtils.lerp(initialPositions[i3], targetPositions[i3], morphFactor)
      positions[i3 + 1] = THREE.MathUtils.lerp(initialPositions[i3 + 1], targetPositions[i3 + 1], morphFactor)
      positions[i3 + 2] = THREE.MathUtils.lerp(initialPositions[i3 + 2], targetPositions[i3 + 2], morphFactor)

      // Add wave motion
      positions[i3 + 1] += Math.sin(t * 2 + positions[i3] * 0.5) * 0.3 * morphFactor
    }

    geometry.attributes.position.needsUpdate = true

    pointsRef.current.rotation.y = t * 0.1 + scrollProgress * Math.PI * 4
    pointsRef.current.rotation.x = scrollProgress * 0.5
  })

  return (
    <points ref={pointsRef} position={[0, 0, -30]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={initialPositions.slice()} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#4da6ff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Particle Streams flowing through space
function ParticleStreams({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const streams = useMemo(() => {
    return Array.from({ length: 6 }, (_, streamIndex) => {
      const count = 1000
      const positions = new Float32Array(count * 3)
      const velocities = new Float32Array(count * 3)

      const baseAngle = (streamIndex / 6) * Math.PI * 2

      for (let i = 0; i < count; i++) {
        const t = i / count
        const spiral = t * Math.PI * 8
        const radius = 5 + t * 30

        positions[i * 3] = Math.cos(spiral + baseAngle) * radius
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20 + Math.sin(t * Math.PI * 4) * 10
        positions[i * 3 + 2] = Math.sin(spiral + baseAngle) * radius - 50

        velocities[i * 3] = (Math.random() - 0.5) * 0.02
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02
        velocities[i * 3 + 2] = Math.random() * 0.1 + 0.05
      }
      return { positions, velocities, count }
    })
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.children.forEach((child, idx) => {
      if (child instanceof THREE.Points) {
        const positions = child.geometry.attributes.position.array as Float32Array
        const stream = streams[idx]

        for (let i = 0; i < stream.count; i++) {
          const i3 = i * 3
          positions[i3 + 2] += stream.velocities[i3 + 2] * (1 + scrollProgress * 3)

          if (positions[i3 + 2] > 50) {
            positions[i3 + 2] = -100
          }
        }
        child.geometry.attributes.position.needsUpdate = true
        child.rotation.z = t * 0.1 * (idx % 2 === 0 ? 1 : -1)
      }
    })

    groupRef.current.rotation.y = scrollProgress * Math.PI
    groupRef.current.rotation.x = Math.sin(scrollProgress * Math.PI) * 0.3
  })

  return (
    <group ref={groupRef}>
      {streams.map((stream, idx) => (
        <points key={idx}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={stream.count} array={stream.positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={0.08}
            color={idx % 2 === 0 ? "#60a5fa" : "#ffffff"}
            transparent
            opacity={0.6}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  )
}

// Orbiting Rings with particles
function OrbitingRings({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const rings = useMemo(() => {
    return [
      { radius: 15, particles: 500, color: "#3b82f6", tilt: 0.3, speed: 1 },
      { radius: 22, particles: 600, color: "#ffffff", tilt: -0.5, speed: -0.7 },
      { radius: 30, particles: 700, color: "#60a5fa", tilt: 0.8, speed: 0.5 },
    ].map((ring) => {
      const positions = new Float32Array(ring.particles * 3)
      for (let i = 0; i < ring.particles; i++) {
        const angle = (i / ring.particles) * Math.PI * 2
        positions[i * 3] = Math.cos(angle) * ring.radius + (Math.random() - 0.5) * 2
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1
        positions[i * 3 + 2] = Math.sin(angle) * ring.radius + (Math.random() - 0.5) * 2
      }
      return { ...ring, positions }
    })
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.children.forEach((child, idx) => {
      if (child instanceof THREE.Points) {
        const ring = rings[idx]
        child.rotation.y = t * ring.speed * 0.2 + scrollProgress * Math.PI * 2 * ring.speed
        child.rotation.x = ring.tilt + scrollProgress * 0.5
        child.rotation.z = Math.sin(t * 0.5 + idx) * 0.2

        const scale = 1 + Math.sin(scrollProgress * Math.PI) * 0.3
        child.scale.setScalar(scale)
      }
    })

    groupRef.current.position.z = -40 + scrollProgress * 20
  })

  return (
    <group ref={groupRef}>
      {rings.map((ring, idx) => (
        <points key={idx} rotation={[ring.tilt, 0, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={ring.particles} array={ring.positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color={ring.color}
            transparent
            opacity={0.7}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  )
}

// Nebula Clouds
function NebulaClouds({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const count = 3000

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 30 + Math.random() * 40

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3
      pos[i * 3 + 2] = r * Math.cos(phi) - 80
    }
    return pos
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.rotation.y = t * 0.02 + scrollProgress * Math.PI
    groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.1
    groupRef.current.position.z = -80 + scrollProgress * 60

    const scale = 1 + scrollProgress * 2
    groupRef.current.scale.setScalar(scale)
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.8}
          color="#1e40af"
          transparent
          opacity={0.15}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

// Floating Crystal/Asteroid objects
function FloatingCrystals({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const crystals = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, -20 - Math.random() * 100] as [
        number,
        number,
        number,
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      scale: 0.5 + Math.random() * 1.5,
      speed: 0.5 + Math.random() * 1.5,
    }))
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.children.forEach((child, idx) => {
      const crystal = crystals[idx]
      child.rotation.x = t * 0.3 * crystal.speed + scrollProgress * Math.PI * 2
      child.rotation.y = t * 0.5 * crystal.speed + scrollProgress * Math.PI
      child.rotation.z = Math.sin(t * 0.2 + idx) * 0.5

      child.position.z = crystal.position[2] + scrollProgress * 80
      child.position.x = crystal.position[0] + Math.sin(scrollProgress * Math.PI * 2 + idx) * 10
      child.position.y = crystal.position[1] + Math.cos(scrollProgress * Math.PI * 2 + idx) * 5
    })
  })

  return (
    <group ref={groupRef}>
      {crystals.map((crystal, idx) => (
        <mesh key={idx} position={crystal.position} rotation={crystal.rotation} scale={crystal.scale}>
          <octahedronGeometry args={[1, 0]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.5}
            chromaticAberration={0.2}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            color="#60a5fa"
            transmissionSampler
          />
        </mesh>
      ))}
    </group>
  )
}

// Warp Speed Lines effect
function WarpLines({ scrollProgress }: { scrollProgress: number }) {
  const linesRef = useRef<THREE.Group>(null)
  const count = 200

  const lines = useMemo(() => {
    return Array.from({ length: count }, () => ({
      start: new THREE.Vector3((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, -100),
      length: 5 + Math.random() * 20,
      speed: 1 + Math.random() * 2,
    }))
  }, [])

  useFrame((state) => {
    if (!linesRef.current) return
    const t = state.clock.elapsedTime
    const warpIntensity = Math.max(0, (scrollProgress - 0.5) * 2)

    linesRef.current.children.forEach((child, idx) => {
      if (child instanceof THREE.Line) {
        const line = lines[idx]
        const positions = child.geometry.attributes.position.array as Float32Array

        const z = ((t * line.speed * 50 * warpIntensity + line.start.z) % 150) - 50

        positions[0] = line.start.x
        positions[1] = line.start.y
        positions[2] = z
        positions[3] = line.start.x
        positions[4] = line.start.y
        positions[5] = z + line.length * (1 + warpIntensity * 3)

        child.geometry.attributes.position.needsUpdate = true

        const material = child.material as THREE.LineBasicMaterial
        material.opacity = warpIntensity * 0.8
      }
    })
  })

  return (
    <group ref={linesRef}>
      {lines.map((line, idx) => {
        const positions = new Float32Array([
          line.start.x,
          line.start.y,
          line.start.z,
          line.start.x,
          line.start.y,
          line.start.z + line.length,
        ])
        return (
          <line key={idx}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={2} array={positions} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} />
          </line>
        )
      })}
    </group>
  )
}

// Dynamic Camera Controller
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 50))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const p = scrollProgress

    // Complex camera path through space
    if (p < 0.2) {
      // Opening: Pull back and tilt
      const localP = p / 0.2
      targetPosition.current.set(Math.sin(localP * Math.PI * 0.5) * 10, 5 + localP * 10, 50 - localP * 20)
      targetLookAt.current.set(0, 0, -30)
    } else if (p < 0.4) {
      // Dive into the galaxy
      const localP = (p - 0.2) / 0.2
      targetPosition.current.set(Math.sin(localP * Math.PI) * 20, 15 - localP * 20, 30 - localP * 40)
      targetLookAt.current.set(0, 0, -30 - localP * 20)
    } else if (p < 0.6) {
      // Orbit around
      const localP = (p - 0.4) / 0.2
      const orbitAngle = localP * Math.PI
      targetPosition.current.set(
        Math.sin(orbitAngle) * 30,
        -5 + Math.sin(localP * Math.PI) * 15,
        Math.cos(orbitAngle) * 30 - 30,
      )
      targetLookAt.current.set(0, 0, -50)
    } else if (p < 0.8) {
      // Pull back for warp
      const localP = (p - 0.6) / 0.2
      targetPosition.current.set(Math.sin(localP * Math.PI * 2) * 5, localP * 5, -30 + localP * 60)
      targetLookAt.current.set(0, 0, -100)
    } else {
      // Final zoom out
      const localP = (p - 0.8) / 0.2
      targetPosition.current.set(0, 5 + localP * 20, 30 + localP * 50)
      targetLookAt.current.set(0, 0, 0)
    }

    // Add subtle floating motion
    targetPosition.current.x += Math.sin(t * 0.5) * 2
    targetPosition.current.y += Math.cos(t * 0.3) * 1

    // Smooth interpolation
    camera.position.lerp(targetPosition.current, 0.02)

    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    currentLookAt.multiplyScalar(100).add(camera.position)
    currentLookAt.lerp(targetLookAt.current, 0.02)
    camera.lookAt(targetLookAt.current)

    // Dynamic FOV
    const baseFOV = 60
    const fovModifier = Math.sin(p * Math.PI * 2) * 15
      ; (camera as THREE.PerspectiveCamera).fov = baseFOV + fovModifier
      ; (camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  })

  return null
}

// HUD Tips Component
function HUDTip({
  children,
  position,
  delay = 0,
  active,
  scrollProgress,
}: {
  children: React.ReactNode
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right"
  delay?: number
  active: boolean
  scrollProgress: number
}) {
  const tipRef = useRef<HTMLDivElement>(null)
  const [displayText, setDisplayText] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const fullText = typeof children === "string" ? children : ""

  const positionClasses: Record<string, string> = {
    "top-left": "top-16 left-4 md:top-8 md:left-8",
    "top-right": "top-16 right-4 md:top-24 md:right-8",
    "bottom-left": "bottom-4 left-4 md:bottom-8 md:left-8",
    "bottom-right": "bottom-4 right-4 md:bottom-8 md:right-8",
    left: "top-1/3 -translate-y-1/2 left-4 md:left-8",
    right: "top-2/3 -translate-y-1/2 right-4 md:right-8",
  }

  useEffect(() => {
    if (active) {
      const showTimeout = setTimeout(() => {
        setIsVisible(true)
        // Typewriter effect
        let index = 0
        const typeInterval = setInterval(() => {
          if (index <= fullText.length) {
            setDisplayText(fullText.slice(0, index))
            index++
          } else {
            clearInterval(typeInterval)
          }
        }, 30)
        return () => clearInterval(typeInterval)
      }, delay)
      return () => clearTimeout(showTimeout)
    } else {
      setIsVisible(false)
      setDisplayText("")
    }
  }, [active, fullText, delay])

  if (!isVisible) return null

  const isDark = scrollProgress < 0.85

  return (
    <div ref={tipRef} className={`fixed ${positionClasses[position]} z-40 max-w-[280px] md:max-w-xs pointer-events-none`}>
      <div className="relative">
        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-b via-transparent to-transparent animate-scan transition-colors duration-500"
            style={{
              backgroundImage: isDark
                ? "linear-gradient(to bottom, rgba(96, 165, 250, 0.2), transparent, transparent)"
                : "linear-gradient(to bottom, rgba(59, 130, 246, 0.3), transparent, transparent)",
            }}
          />
        </div>

        {/* Corner brackets */}
        <div
          className="absolute -top-1 -left-1 w-2 h-2 md:w-3 md:h-3 border-t-2 border-l-2 animate-pulse transition-colors duration-500"
          style={{ borderColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
        />
        <div
          className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 border-t-2 border-r-2 animate-pulse transition-colors duration-500"
          style={{ borderColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
        />
        <div
          className="absolute -bottom-1 -left-1 w-2 h-2 md:w-3 md:h-3 border-b-2 border-l-2 animate-pulse transition-colors duration-500"
          style={{ borderColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 border-b-2 border-r-2 animate-pulse transition-colors duration-500"
          style={{ borderColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
        />

        {/* Main container */}
        <div
          className="border backdrop-blur-sm p-2.5 md:p-4 relative transition-colors duration-500"
          style={{
            borderColor: isDark ? "rgba(96, 165, 250, 0.5)" : "rgba(59, 130, 246, 0.6)",
            backgroundColor: isDark ? "rgba(2, 2, 18, 0.8)" : "rgba(255, 255, 255, 0.9)",
          }}
        >
          {/* Flickering header bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 animate-flicker transition-colors duration-500"
            style={{ backgroundColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
          />

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <div
              className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-ping-slow transition-colors duration-500"
              style={{ backgroundColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
            />
            <span
              className="text-[8px] md:text-[10px] font-mono tracking-widest uppercase transition-colors duration-500"
              style={{ color: isDark ? "rgba(96, 165, 250, 0.8)" : "rgba(59, 130, 246, 0.9)" }}
            >
              SYSTEM
            </span>
          </div>

          {/* Text content with cursor */}
          <p
            className="text-[10px] md:text-xs font-mono leading-relaxed transition-colors duration-500"
            style={{ color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)" }}
          >
            {displayText}
            <span
              className="inline-block w-1.5 h-3 md:w-2 md:h-4 ml-0.5 animate-blink transition-colors duration-500"
              style={{ backgroundColor: isDark ? "rgba(96, 165, 250, 0.8)" : "rgba(59, 130, 246, 0.8)" }}
            />
          </p>
        </div>

        {/* Decorative line - hidden on mobile */}
        <div
          className="absolute top-1/2 h-px transition-colors duration-500 hidden md:block"
          style={{
            left: position.includes("left") ? "auto" : "-32px",
            right: position.includes("left") ? "-32px" : "auto",
            width: "32px",
            backgroundImage: position.includes("left")
              ? isDark
                ? "linear-gradient(to right, rgb(96, 165, 250), transparent)"
                : "linear-gradient(to right, rgb(59, 130, 246), transparent)"
              : isDark
                ? "linear-gradient(to left, rgb(96, 165, 250), transparent)"
                : "linear-gradient(to left, rgb(59, 130, 246), transparent)",
          }}
        />
      </div>
    </div>
  )
}

// HUD Data Display Component
function HUDDataDisplay({
  data,
  position,
  active,
  scrollProgress,
}: {
  data: { label: string; value: string }[]
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  active: boolean
  scrollProgress: number
}) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])

  const positionClasses = {
    "top-left": "top-16 left-4 md:top-24 md:left-8",
    "top-right": "top-16 right-4 md:top-24 md:right-8",
    "bottom-left": "bottom-16 left-4 md:bottom-24 md:left-8",
    "bottom-right": "bottom-16 right-4 md:bottom-24 md:right-8",
  }

  useEffect(() => {
    if (active) {
      data.forEach((_, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => [...prev, index])
        }, index * 150)
      })
    } else {
      setVisibleItems([])
    }
  }, [active, data])

  if (!active) return null

  const isDark = scrollProgress < 0.85

  return (
    <div className={`fixed ${positionClasses[position]} z-40 pointer-events-none`}>
      <div className="space-y-1.5 md:space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 md:gap-3 transition-all duration-300 ${visibleItems.includes(index) ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
          >
            <div
              className="w-0.5 h-3 md:w-1 md:h-4 animate-pulse transition-colors duration-500"
              style={{ backgroundColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
            />
            <div className="font-mono">
              <span
                className="text-[8px] md:text-[10px] uppercase tracking-wider transition-colors duration-500"
                style={{ color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}
              >
                {item.label}
              </span>
              <div
                className="text-xs md:text-sm font-bold transition-colors duration-500"
                style={{ color: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Glitch Text Component
function GlitchText({ text, active }: { text: string; active: boolean }) {
  const [glitchText, setGlitchText] = useState(text)
  const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"

  useEffect(() => {
    if (!active) return

    const glitchInterval = setInterval(() => {
      const shouldGlitch = Math.random() > 0.7
      if (shouldGlitch) {
        const chars = text.split("")
        const glitchIndex = Math.floor(Math.random() * chars.length)
        chars[glitchIndex] = glitchChars[Math.floor(Math.random() * glitchChars.length)]
        setGlitchText(chars.join(""))

        setTimeout(() => setGlitchText(text), 50)
      }
    }, 100)

    return () => clearInterval(glitchInterval)
  }, [active, text])

  return <span className="relative">{glitchText}</span>
}

// Radar/Scanner Component
function RadarScanner({
  active,
  position,
  scrollProgress,
}: {
  active: boolean
  position: "left" | "right"
  scrollProgress: number
}) {
  if (!active) return null

  const positionClass = position === "left" ? "left-8" : "right-8"
  const isDark = scrollProgress < 0.85

  return (
    <div className={`fixed bottom-20 md:bottom-32 ${positionClass} z-40 pointer-events-none`}>
      <div className="relative w-16 h-16 md:w-24 md:h-24">
        {/* Outer ring */}
        <div
          className="absolute inset-0 border rounded-full transition-colors duration-500"
          style={{ borderColor: isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(59, 130, 246, 0.4)" }}
        />
        <div
          className="absolute inset-2 border rounded-full transition-colors duration-500"
          style={{ borderColor: isDark ? "rgba(96, 165, 250, 0.2)" : "rgba(59, 130, 246, 0.3)" }}
        />
        <div
          className="absolute inset-4 border rounded-full transition-colors duration-500"
          style={{ borderColor: isDark ? "rgba(96, 165, 250, 0.1)" : "rgba(59, 130, 246, 0.2)" }}
        />

        {/* Scanning line */}
        <div className="absolute inset-0 origin-center animate-radar">
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left transition-colors duration-500"
            style={{
              backgroundImage: isDark
                ? "linear-gradient(to right, rgb(96, 165, 250), transparent)"
                : "linear-gradient(to right, rgb(59, 130, 246), transparent)",
            }}
          />
        </div>

        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 md:w-2 md:h-2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping-slow transition-colors duration-500"
          style={{ backgroundColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
        />

        {/* Blips */}
        <div
          className="absolute top-1/4 left-1/3 w-0.5 h-0.5 md:w-1 md:h-1 rounded-full animate-pulse transition-colors duration-500"
          style={{ backgroundColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)" }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-0.5 h-0.5 md:w-1 md:h-1 rounded-full animate-pulse transition-colors duration-500"
          style={{
            backgroundColor: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)",
            animationDelay: "0.5s",
          }}
        />
      </div>
    </div>
  )
}

// Status Bar Component
function StatusBar({ currentSection, scrollProgress }: { currentSection: number; scrollProgress: number }) {
  const statusMessages = [
    "INITIALIZING NEURAL NETWORK...",
    "AI ENGINE ONLINE",
    "PROCESSING CREATIVE MATRIX",
    "WARP DRIVE ENGAGED",
    "MISSION COMPLETE",
  ]

  const isDark = scrollProgress < 0.85

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div
        className="flex items-center gap-2 md:gap-4 px-3 md:px-6 py-1.5 md:py-2 border backdrop-blur-sm transition-colors duration-500"
        style={{
          borderColor: isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(59, 130, 246, 0.4)",
          backgroundColor: isDark ? "rgba(2, 2, 18, 0.9)" : "rgba(255, 255, 255, 0.7)",
        }}
      >
        <div className="flex gap-0.5 md:gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 md:w-2 md:h-2 transition-colors duration-300"
              style={{
                backgroundColor:
                  i <= currentSection
                    ? isDark
                      ? "rgb(96, 165, 250)"
                      : "rgb(59, 130, 246)"
                    : isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.2)",
              }}
            />
          ))}
        </div>
        <div
          className="h-3 md:h-4 w-px transition-colors duration-500"
          style={{
            backgroundColor: isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(59, 130, 246, 0.4)",
          }}
        />
        <span
          className="text-[8px] md:text-xs font-mono animate-pulse transition-colors duration-500"
          style={{
            color: isDark ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)",
          }}
        >
          {statusMessages[currentSection] || statusMessages[0]}
        </span>
      </div>
    </div>
  )
}

// 3D Scene
function Scene({ scrollProgress }: { scrollProgress: number }) {
  // Gradually lighten background after "未来へ" section
  const getBackgroundColor = () => {
    if (scrollProgress < 0.8) return "#020212" // Dark space
    const fadeProgress = (scrollProgress - 0.8) / 0.2
    // Interpolate from dark to light gray
    const r = Math.floor(2 + fadeProgress * (200 - 2))
    const g = Math.floor(2 + fadeProgress * (200 - 2))
    const b = Math.floor(18 + fadeProgress * (210 - 18))
    return `rgb(${r}, ${g}, ${b})`
  }

  const backgroundColor = getBackgroundColor()

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={[backgroundColor, 50, 200]} />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, -30]} intensity={2} color="#3b82f6" distance={100} />
      <pointLight position={[30, 20, -50]} intensity={1} color="#ffffff" distance={80} />

      <CameraController scrollProgress={scrollProgress} />
      <StarField scrollProgress={scrollProgress} />
      <MorphingParticles scrollProgress={scrollProgress} />
      <ParticleStreams scrollProgress={scrollProgress} />
      <OrbitingRings scrollProgress={scrollProgress} />
      <NebulaClouds scrollProgress={scrollProgress} />
      <FloatingCrystals scrollProgress={scrollProgress} />
      <WarpLines scrollProgress={scrollProgress} />
    </>
  )
}

// Text Sections with GSAP
function TextOverlay({ scrollProgress }: { scrollProgress: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
  const section3Ref = useRef<HTMLDivElement>(null)
  const section4Ref = useRef<HTMLDivElement>(null)
  const section5Ref = useRef<HTMLDivElement>(null)

  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    // Determine active section based on scroll progress
    if (scrollProgress < 0.15) setActiveSection(0)
    else if (scrollProgress < 0.35) setActiveSection(1)
    else if (scrollProgress < 0.55) setActiveSection(2)
    else if (scrollProgress < 0.75) setActiveSection(3)
    else setActiveSection(4)
  }, [scrollProgress])

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      // Section 1: Opening
      gsap.fromTo(
        section1Ref.current,
        { opacity: 0, y: 100, scale: 0.8, rotateX: 45 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section1Ref.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
        },
      )

      gsap.to(section1Ref.current, {
        opacity: 0,
        y: -200,
        scale: 1.5,
        rotateX: -30,
        scrollTrigger: {
          trigger: section1Ref.current,
          start: "top 20%",
          end: "top -50%",
          scrub: 1,
        },
      })

      // Section 2: Dive
      const chars2 = section2Ref.current?.querySelectorAll(".char")
      if (chars2) {
        gsap.fromTo(
          chars2,
          { opacity: 0, y: 100, rotateY: 90, scale: 0 },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            scale: 1,
            stagger: 0.05,
            duration: 0.8,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: section2Ref.current,
              start: "top 80%",
              end: "top 40%",
              scrub: 1,
            },
          },
        )
      }

      gsap.to(section2Ref.current, {
        opacity: 0,
        x: -500,
        rotateZ: -20,
        scrollTrigger: {
          trigger: section2Ref.current,
          start: "top 30%",
          end: "top -30%",
          scrub: 1,
        },
      })

      // Section 3: Orbit
      gsap.fromTo(
        section3Ref.current,
        { opacity: 0, x: 500, rotateZ: 20 },
        {
          opacity: 1,
          x: 0,
          rotateZ: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section3Ref.current,
            start: "top 80%",
            end: "top 40%",
            scrub: 1,
          },
        },
      )

      gsap.to(section3Ref.current, {
        opacity: 0,
        scale: 3,
        y: -100,
        scrollTrigger: {
          trigger: section3Ref.current,
          start: "top 30%",
          end: "top -20%",
          scrub: 1,
        },
      })

      // Section 4: Warp
      gsap.fromTo(
        section4Ref.current,
        { opacity: 0, scale: 5, letterSpacing: "2em" },
        {
          opacity: 1,
          scale: 1,
          letterSpacing: "0.2em",
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section4Ref.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1,
          },
        },
      )

      gsap.to(section4Ref.current, {
        opacity: 0,
        z: 500,
        scale: 0.5,
        scrollTrigger: {
          trigger: section4Ref.current,
          start: "top 20%",
          end: "top -30%",
          scrub: 1,
        },
      })

      // Section 5: Final
      gsap.fromTo(
        section5Ref.current,
        { opacity: 0, y: 200, rotateX: -45 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: section5Ref.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1,
          },
        },
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative z-10 pointer-events-none">

      <HUDTip position="top-left" delay={500} active={activeSection === 0} scrollProgress={scrollProgress}>
        tent spaceは AI ドリブン開発のパイオニア。
        確かな技術と柔軟な発想で、あなたのビジネスの可能性を無限に広げるパートナーです。
      </HUDTip>
      <HUDDataDisplay
        position="bottom-right"
        active={activeSection === 0}
        scrollProgress={scrollProgress}
        data={[
          { label: "ESTABLISHED", value: "2023" },
          { label: "PROJECTS", value: "120+" },
          { label: "AI MODELS", value: "INTEGRATED" },
        ]}
      />
      <RadarScanner active={activeSection === 0} position="left" scrollProgress={scrollProgress} />

      <HUDTip position="top-right" delay={300} active={activeSection === 1} scrollProgress={scrollProgress}>
        創造力とAIの融合。私たちは最新のAI技術と確かな開発経験を組み合わせ、未来のソリューションを提供します。
      </HUDTip>
      <HUDDataDisplay
        position="bottom-left"
        active={activeSection === 1}
        scrollProgress={scrollProgress}
        data={[
          { label: "EFFICIENCY", value: "+340%" },
          { label: "DEV SPEED", value: "10x FASTER" },
          { label: "ACCURACY", value: "99.7%" },
        ]}
      />

      <HUDTip position="bottom-left" delay={200} active={activeSection === 2} scrollProgress={scrollProgress}>
        革新は恐れずに前進することから始まる。既存の枠を超え、新しい価値を創造します。
      </HUDTip>
      <HUDDataDisplay
        position="top-right"
        active={activeSection === 2}
        scrollProgress={scrollProgress}
        data={[
          { label: "TECH STACK", value: "NEXT-GEN" },
          { label: "SCALABILITY", value: "∞" },
          { label: "UPTIME", value: "99.99%" },
        ]}
      />
      <RadarScanner active={activeSection === 2} position="right" scrollProgress={scrollProgress} />

      <HUDTip position="left" delay={100} active={activeSection === 3} scrollProgress={scrollProgress}>
        トランスフォーメーションの瞬間。AIがあなたのビジネスを次元を超えて変革します。
      </HUDTip>
      <HUDTip position="right" delay={400} active={activeSection === 3} scrollProgress={scrollProgress}>
        ワープスピードで進化する技術。私たちは常に最前線にいます。
      </HUDTip>

      <HUDTip position="top-left" delay={300} active={activeSection === 4} scrollProgress={scrollProgress}>
        未来は待っているだけでは来ない。一緒に創りましょう。
      </HUDTip>
      <HUDDataDisplay
        position="top-right"
        active={activeSection === 4}
        scrollProgress={scrollProgress}
        data={[
          { label: "CLIENTS", value: "GLOBAL" },
          { label: "SATISFACTION", value: "100%" },
          { label: "FUTURE", value: "NOW" },
        ]}
      />
      <RadarScanner active={activeSection === 4} position="left" scrollProgress={scrollProgress} />

      <div className="h-screen flex items-center justify-center">
        <div ref={section1Ref} className="text-center perspective-1000">
          <h1 className="text-5xl md:text-9xl font-bold tracking-tighter text-white glow-text-white mb-4 md:mb-6">
            <GlitchText text="tent␣" active={activeSection === 0} />
          </h1>
          <p className="text-sm md:text-2xl text-white/60 tracking-widest uppercase">AI Driven Development</p>
        </div>
      </div>

      <div className="h-screen flex items-center justify-center">
        <div ref={section2Ref} className="text-center px-4">
          <h2 className="text-4xl md:text-8xl font-bold text-primary glow-text">
            {"CREATE".split("").map((char, i) => (
              <span key={i} className="char inline-block">
                {char}
              </span>
            ))}
          </h2>
          <p className="text-xs md:text-xl text-white/50 mt-4 md:mt-8 max-w-xl mx-auto">小さなテントから、無限の可能性を創造する</p>
        </div>
      </div>

      <div className="h-screen flex items-center justify-center">
        <div ref={section3Ref} className="text-center px-4">
          <h2 className="text-4xl md:text-8xl font-bold text-white glow-text-white">INNOVATE</h2>
          <p className="text-xs md:text-xl text-primary/80 mt-4 md:mt-8 tracking-wider">次世代のソリューションを構築</p>
        </div>
      </div>

      <div className="h-screen flex items-center justify-center">
        <div ref={section4Ref} className="text-center px-4">
          <h2 className="text-3xl md:text-7xl font-bold text-primary tracking-widest glow-text uppercase">Transform</h2>
        </div>
      </div>

      <div className="h-screen flex items-center justify-center">
        <div ref={section5Ref} className="text-center perspective-1000 px-4">
          <h2
            className="text-5xl md:text-9xl font-bold mb-4 md:mb-8 transition-colors duration-500"
            style={{
              color: scrollProgress > 0.85 ? "#1a1a1a" : "#ffffff",
              textShadow:
                scrollProgress > 0.85
                  ? "0 0 40px rgba(26,26,26,0.3)"
                  : "0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4)",
            }}
          >
            未来へ
          </h2>
          <p
            className="text-sm md:text-2xl tracking-widest transition-colors duration-500"
            style={{
              color: scrollProgress > 0.85 ? "#3b82f6" : "rgba(96, 165, 250, 0.8)",
            }}
          >
            ビジネスを、AIと共に加速させる
          </p>
        </div>
      </div>

      <div className="h-[50vh]" />
    </div>
  )
}

// Let's Talk contact section
function LetsTalkSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const arrowRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animate section sliding up
      gsap.fromTo(
        sectionRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            end: "top 50%",
            scrub: 1,
          },
        },
      )

      // Animate text
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: textRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }

      // Animate arrow
      if (arrowRef.current) {
        gsap.to(arrowRef.current, {
          x: 10,
          repeat: -1,
          yoyo: true,
          duration: 0.8,
          ease: "power2.inOut",
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="relative z-20 mx-2 md:mx-8 mb-0">
      <div className="bg-primary rounded-t-2xl md:rounded-t-3xl px-6 md:px-16 py-8 md:py-16 min-h-[350px] md:min-h-[400px] flex flex-col justify-between">
        {/* Top label */}
        <div className="flex items-center gap-2 md:gap-3 text-primary-foreground/80">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <svg width="12" height="2" viewBox="0 0 16 2" fill="currentColor" className="md:w-4">
              <rect width="16" height="2" rx="1" />
            </svg>
          </div>
          <span className="text-xs md:text-sm font-medium tracking-wide">Next step</span>
        </div>

        {/* Main content */}
        <div className="flex items-end justify-between mt-8 md:mt-12">
          <h2
            ref={textRef}
            className="text-5xl md:text-8xl lg:text-9xl font-bold text-primary-foreground tracking-tight"
          >
            Let's talk
          </h2>
          <a
            href="mailto:back-office@tentspace.net"
            ref={arrowRef}
            className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-primary-foreground/30 flex items-center justify-center cursor-pointer hover:bg-primary-foreground/10 transition-colors shrink-0"
            aria-label="Contact us via email"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary-foreground md:w-6 md:h-6"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>

        {/* Bottom info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mt-8 md:mt-12 pt-6 md:pt-8 border-t border-primary-foreground/20">
          <div className="text-primary-foreground/80 space-y-1">
            <a
              href="mailto:back-office@tentspace.net"
              className="text-xs md:text-base font-medium hover:text-primary-foreground transition-colors inline-block"
            >
              back-office@tentspace.net
            </a>
            <p className="text-[10px] md:text-sm">323 Kadoyama, Ogawa, Hiki District, Saitama 355-0316, Japan</p>
          </div>
          <div className="flex items-center gap-3 md:gap-6 mt-4 md:mt-0 text-[10px] md:text-sm text-primary-foreground/60">
            <Link href="/about" className="hover:text-primary-foreground transition-colors">
              About Us
            </Link>
            <Link href="/blog" className="hover:text-primary-foreground transition-colors">
              Blog
            </Link>
            <Link href="/terms" className="hover:text-primary-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/legal" className="hover:text-primary-foreground transition-colors">
              Legal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="relative z-20 px-2 md:px-8 py-1">
      <div className="flex justify-end">
        <p className="text-[8px] md:text-[9px] text-primary-foreground/60">© 2025 tent space Inc. All rights reserved.</p>
      </div>
    </footer>
  )
}

// Home Page Component
export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(window.scrollY / scrollHeight, 1)
      setScrollProgress(progress)

      // Determine active section based on scroll progress
      if (progress < 0.15) setActiveSection(0)
      else if (progress < 0.35) setActiveSection(1)
      else if (progress < 0.55) setActiveSection(2)
      else if (progress < 0.75) setActiveSection(3)
      else setActiveSection(4)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate background brightness based on scroll progress
  // Start fading to light background after "未来へ" section (scrollProgress > 0.8)
  const getBrightnessOverlay = () => {
    if (scrollProgress < 0.8) return 0
    // From 0.8 to 1.0, fade from 0 to 0.95
    const fadeProgress = (scrollProgress - 0.8) / 0.2
    return Math.min(fadeProgress * 0.95, 0.95)
  }

  const brightnessOpacity = getBrightnessOverlay()

  return (
    <div className="relative bg-[#020212]">
      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 50], fov: 60 }} gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Brightness Overlay - Fades in after "未来へ" section */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: "#f5f5f7",
          opacity: brightnessOpacity,
        }}
      />

      {/* Persistent Header Overlay */}
      <Header scrollProgress={scrollProgress} />

      {/* Text Overlay */}
      <TextOverlay scrollProgress={scrollProgress} />

      {/* Status Bar */}
      <StatusBar currentSection={activeSection} scrollProgress={scrollProgress} />

      {/* Floating Blog CTA */}
      {/* <BlogFloatingCTA scrollProgress={scrollProgress} /> */}

      {/* Let's Talk section and Footer */}
      <LetsTalkSection />
      <Footer />
    </div>
  )
}

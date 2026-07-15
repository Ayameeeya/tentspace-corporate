"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { SpaceScene } from "@/components/three/space-scene"
import { useScrollStore } from "@/lib/stores/scroll-store"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// HUD Tips Component
function HUDTip({
  children,
  position,
  delay = 0,
  active,
  isDark,
}: {
  children: React.ReactNode
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right"
  delay?: number
  active: boolean
  isDark: boolean
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
              className="text-[8px] md:text-[10px] font-tech tracking-widest uppercase transition-colors duration-500"
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
  isDark,
}: {
  data: { label: string; value: string }[]
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  active: boolean
  isDark: boolean
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
            <div>
              <span
                className="text-[8px] md:text-[10px] font-tech uppercase tracking-wider transition-colors duration-500"
                style={{ color: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }}
              >
                {item.label}
              </span>
              <div
                className="text-xs md:text-sm font-bold font-mono transition-colors duration-500"
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

// Easter Egg: Floating 3D Crystal
function FloatingCrystal({ active, isDark }: { active: boolean; isDark: boolean }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    window.open('https://tentspace-particle-system.vercel.app/', '_blank')
  }

  return (
    <div
      className="fixed right-12 md:right-20 top-1/3 z-40 cursor-pointer transition-all duration-700 ease-out"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1)' : 'scale(0.8)',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <div className="relative w-12 h-12 md:w-16 md:h-16">
        {/* Glowing ring */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-500"
          style={{
            background: isDark
              ? `radial-gradient(circle, rgba(96, 165, 250, ${isHovered ? '0.3' : '0.1'}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(59, 130, 246, ${isHovered ? '0.3' : '0.1'}) 0%, transparent 70%)`,
            filter: 'blur(8px)',
            transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          }}
        />

        {/* Black Hole Portal shape */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'float 3s ease-in-out infinite',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-10 h-10 md:w-14 md:h-14"
            style={{
              filter: `drop-shadow(0 0 ${isHovered ? '16px' : '8px'} ${isDark ? 'rgba(96, 165, 250, 0.9)' : 'rgba(59, 130, 246, 0.9)'})`,
            }}
          >
            <defs>
              {/* Black hole gradient */}
              <radialGradient id="blackHoleGradient">
                <stop offset="0%" stopColor="rgba(0, 0, 0, 0.9)" />
                <stop offset="40%" stopColor={isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(96, 165, 250, 0.4)'} />
                <stop offset="70%" stopColor={isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)'} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Accretion disk gradient */}
              <radialGradient id="diskGradient">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor={isDark ? 'rgba(147, 197, 253, 0.6)' : 'rgba(96, 165, 250, 0.6)'} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Outer glow rings */}
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke={isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)'}
              strokeWidth="0.5"
              opacity="0.3"
              style={{
                animation: 'rotate-slow 15s linear infinite',
                transformOrigin: '50% 50%',
              }}
            />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke={isDark ? 'rgb(147, 197, 253)' : 'rgb(96, 165, 250)'}
              strokeWidth="0.5"
              opacity="0.4"
              style={{
                animation: 'rotate-slow 10s linear reverse infinite',
                transformOrigin: '50% 50%',
              }}
            />

            {/* Accretion disk (rotating ellipse) */}
            <ellipse
              cx="50"
              cy="50"
              rx="25"
              ry="8"
              fill="url(#diskGradient)"
              opacity={isHovered ? '0.8' : '0.6'}
              style={{
                animation: 'rotate-slow 6s linear infinite',
                transformOrigin: '50% 50%',
              }}
            />

            {/* Black hole center */}
            <circle
              cx="50"
              cy="50"
              r="15"
              fill="url(#blackHoleGradient)"
            />

            {/* Event horizon */}
            <circle
              cx="50"
              cy="50"
              r="12"
              fill="rgba(0, 0, 0, 0.95)"
              stroke={isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)'}
              strokeWidth="1"
              opacity={isHovered ? '1' : '0.8'}
            />

            {/* Spiral particles */}
            <circle cx="65" cy="50" r="1.5" fill={isDark ? 'rgb(147, 197, 253)' : 'rgb(96, 165, 250)'} opacity="0.8">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="35" cy="50" r="1" fill={isDark ? 'rgb(147, 197, 253)' : 'rgb(96, 165, 250)'} opacity="0.6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="180 50 50"
                to="540 50 50"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>

        {/* Hint text on hover */}
        {isHovered && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-pixel tracking-wider pointer-events-none animate-bounce"
            style={{
              color: isDark ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)',
              textShadow: `0 0 8px ${isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
            }}
          >
            Grab the stardust✊
          </div>
        )}
      </div>
    </div>
  )
}

// Status Bar Component
function StatusBar({ currentSection, isDark }: { currentSection: number; isDark: boolean }) {
  const statusMessages = [
    "INITIALIZING NEURAL NETWORK...",
    "AI ENGINE ONLINE",
    "PROCESSING CREATIVE MATRIX",
    "QUANTUM CORE CHARGING",
    "OVERDRIVE ENGAGED",
    "MISSION COMPLETE",
  ]

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
          {[0, 1, 2, 3, 4, 5].map((i) => (
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
          className="text-[8px] md:text-xs font-pixel animate-pulse transition-colors duration-500"
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

// Text chapters with GSAP scroll-scrubbed choreography
function TextOverlay({ activeSection, isDark }: { activeSection: number; isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
  const section3Ref = useRef<HTMLDivElement>(null)
  const section4Ref = useRef<HTMLDivElement>(null)
  const section5Ref = useRef<HTMLDivElement>(null)
  const section6Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const ctx = gsap.context(() => {
      if (reduced) {
        // Reduced motion: content simply appears, no scrubbed transforms
        gsap.set(
          [section1Ref, section2Ref, section3Ref, section4Ref, section5Ref, section6Ref].map((r) => r.current),
          { opacity: 1 },
        )
        return
      }

      // Chapter 1: Opening
      gsap.fromTo(
        section1Ref.current,
        { opacity: 0, y: 100, scale: 0.8, rotateX: 45 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          ease: "power4.out",
          scrollTrigger: { trigger: section1Ref.current, start: "top 80%", end: "top 20%", scrub: 1 },
        },
      )
      gsap.to(section1Ref.current, {
        opacity: 0,
        y: -200,
        scale: 1.5,
        rotateX: -30,
        scrollTrigger: { trigger: section1Ref.current, start: "top 20%", end: "top -50%", scrub: 1 },
      })

      // Chapter 2: CREATE — per-char dive (SplitText pattern)
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
            ease: "back.out(2)",
            scrollTrigger: { trigger: section2Ref.current, start: "top 80%", end: "top 40%", scrub: 1 },
          },
        )
      }
      gsap.to(section2Ref.current, {
        opacity: 0,
        x: -500,
        rotateZ: -20,
        scrollTrigger: { trigger: section2Ref.current, start: "top 30%", end: "top -30%", scrub: 1 },
      })

      // Chapter 3: INNOVATE — slides in with the orbit
      gsap.fromTo(
        section3Ref.current,
        { opacity: 0, x: 500, rotateZ: 20 },
        {
          opacity: 1,
          x: 0,
          rotateZ: 0,
          ease: "power3.out",
          scrollTrigger: { trigger: section3Ref.current, start: "top 80%", end: "top 40%", scrub: 1 },
        },
      )
      gsap.to(section3Ref.current, {
        opacity: 0,
        scale: 3,
        y: -100,
        scrollTrigger: { trigger: section3Ref.current, start: "top 30%", end: "top -20%", scrub: 1 },
      })

      // Chapter 4: TRANSFORM — compresses from letterspace
      gsap.fromTo(
        section4Ref.current,
        { opacity: 0, scale: 5, letterSpacing: "2em" },
        {
          opacity: 1,
          scale: 1,
          letterSpacing: "0.2em",
          ease: "power4.out",
          scrollTrigger: { trigger: section4Ref.current, start: "top 80%", end: "top 30%", scrub: 1 },
        },
      )
      gsap.to(section4Ref.current, {
        opacity: 0,
        z: 500,
        scale: 0.5,
        scrollTrigger: { trigger: section4Ref.current, start: "top 20%", end: "top -30%", scrub: 1 },
      })

      // Chapter 5: OVERDRIVE — skews in with speed, blasts out
      gsap.fromTo(
        section5Ref.current,
        { opacity: 0, x: -300, skewX: -20 },
        {
          opacity: 1,
          x: 0,
          skewX: 0,
          ease: "power4.out",
          scrollTrigger: { trigger: section5Ref.current, start: "top 80%", end: "top 35%", scrub: 1 },
        },
      )
      gsap.to(section5Ref.current, {
        opacity: 0,
        x: 600,
        skewX: 25,
        scale: 1.4,
        scrollTrigger: { trigger: section5Ref.current, start: "top 25%", end: "top -30%", scrub: 1 },
      })

      // Chapter 6: Finale — settles into stillness
      gsap.fromTo(
        section6Ref.current,
        { opacity: 0, y: 200, rotateX: -45 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          ease: "power4.out",
          scrollTrigger: { trigger: section6Ref.current, start: "top 80%", end: "top 30%", scrub: 1 },
        },
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative z-10 pointer-events-none">

      <HUDTip position="top-left" delay={500} active={activeSection === 0} isDark={isDark}>
        tent space(テントスペース)はAIドリブン開発のパイオニア。
        確かな技術と柔軟な発想で、あなたのビジネスの可能性を無限に広げるパートナーです。
      </HUDTip>
      <HUDDataDisplay
        position="bottom-right"
        active={activeSection === 0}
        isDark={isDark}
        data={[
          { label: "ESTABLISHED", value: "2023" },
          { label: "PROJECTS", value: "50+" },
          { label: "AI MODELS", value: "INTEGRATED" },
        ]}
      />

      <HUDTip position="top-right" delay={300} active={activeSection === 1} isDark={isDark}>
        創造力とAIの融合。私たちは最新のAI技術と確かな開発経験を組み合わせ、未来のソリューションを提供します。
      </HUDTip>
      <HUDDataDisplay
        position="bottom-left"
        active={activeSection === 1}
        isDark={isDark}
        data={[
          { label: "EFFICIENCY", value: "+340%" },
          { label: "DEV SPEED", value: "10x FASTER" },
          { label: "ACCURACY", value: "99.7%" },
        ]}
      />
      <FloatingCrystal active={activeSection === 1} isDark={isDark} />

      <HUDTip position="bottom-left" delay={200} active={activeSection === 2} isDark={isDark}>
        革新は恐れずに前進することから始まる。既存の枠を超え、新しい価値を創造します。
      </HUDTip>
      <HUDDataDisplay
        position="top-right"
        active={activeSection === 2}
        isDark={isDark}
        data={[
          { label: "TECH STACK", value: "NEXT-GEN" },
          { label: "SCALABILITY", value: "∞" },
          { label: "UPTIME", value: "99.99%" },
        ]}
      />

      <HUDTip position="left" delay={100} active={activeSection === 3} isDark={isDark}>
        トランスフォーメーションの瞬間。AIがあなたのビジネスを次元を超えて変革します。
      </HUDTip>
      <HUDTip position="right" delay={400} active={activeSection === 3} isDark={isDark}>
        ワープスピードで進化する技術。私たちは常に最前線にいます。
      </HUDTip>

      <HUDTip position="left" delay={200} active={activeSection === 4} isDark={isDark}>
        全システム、最大出力。ここから先は、加速の世界です。
      </HUDTip>
      <HUDDataDisplay
        position="bottom-right"
        active={activeSection === 4}
        isDark={isDark}
        data={[
          { label: "THRUST", value: "MAXIMUM" },
          { label: "VELOCITY", value: "LUDICROUS" },
          { label: "DESTINATION", value: "FUTURE" },
        ]}
      />

      <HUDTip position="top-left" delay={300} active={activeSection === 5} isDark={isDark}>
        未来は待っているだけでは来ない。一緒に創りましょう。
      </HUDTip>

      {/* Chapter 1: Hero */}
      <div className="h-screen flex items-center justify-center">
        <div ref={section1Ref} className="text-center perspective-1000">
          <h1 className="text-5xl md:text-9xl font-bold tracking-tighter text-white glow-text-white mb-4 md:mb-6">
            <GlitchText text="tent␣" active={activeSection === 0} />
          </h1>
          <p className="text-sm md:text-2xl text-white/60 tracking-widest font-tech uppercase">AI-Driven Development</p>
        </div>
      </div>

      {/* Chapter 2: CREATE */}
      <div className="h-screen flex items-center justify-center">
        <div ref={section2Ref} className="text-center px-4">
          <h2 className="text-4xl md:text-8xl font-bold font-tech text-primary glow-text">
            {"CREATE".split("").map((char, i) => (
              <span key={i} className="char inline-block">
                {char}
              </span>
            ))}
          </h2>
          <p className="text-xs md:text-xl text-white/50 mt-4 md:mt-8 max-w-xl mx-auto">小さなテントから、無限の可能性を創造する</p>
        </div>
      </div>

      {/* Chapter 3: INNOVATE */}
      <div className="h-screen flex items-center justify-center">
        <div ref={section3Ref} className="text-center px-4">
          <h2 className="text-4xl md:text-8xl font-bold font-tech text-white glow-text-white">INNOVATE</h2>
          <p className="text-xs md:text-xl text-primary/80 mt-4 md:mt-8 tracking-wider">次世代のソリューションを構築</p>
        </div>
      </div>

      {/* Chapter 4: TRANSFORM */}
      <div className="h-screen flex items-center justify-center">
        <div ref={section4Ref} className="text-center px-4">
          <h2 className="text-3xl md:text-7xl font-bold font-tech text-primary tracking-widest glow-text uppercase">Transform</h2>
        </div>
      </div>

      {/* Chapter 5: OVERDRIVE */}
      <div className="h-screen flex items-center justify-center">
        <div ref={section5Ref} className="text-center px-4">
          <h2 className="text-4xl md:text-8xl font-bold font-tech italic tracking-wider text-white glow-text-white uppercase">
            Overdrive
          </h2>
          <p className="text-xs md:text-xl text-primary/80 mt-4 md:mt-8 tracking-[0.3em] font-tech uppercase">
            Engaging light speed
          </p>
        </div>
      </div>

      {/* Chapter 6: Finale */}
      <div className="h-screen flex items-center justify-center">
        <div ref={section6Ref} className="text-center perspective-1000 px-4">
          <h2
            className="text-5xl md:text-9xl font-bold font-tech mb-4 md:mb-8 transition-colors duration-500"
            style={{
              color: !isDark ? "#1a1a1a" : "#ffffff",
              textShadow: !isDark
                ? "0 0 40px rgba(26,26,26,0.3)"
                : "0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4)",
            }}
          >
            未来へ
          </h2>
          <p
            className="text-sm md:text-2xl tracking-widest transition-colors duration-500"
            style={{ color: !isDark ? "#3b82f6" : "rgba(96, 165, 250, 0.8)" }}
          >
            ビジネスを、AIと共に加速させる
          </p>
        </div>
      </div>

      <div className="h-[50vh]" />
    </div>
  )
}

// Home Page Component
export default function Home() {
  const progress = useScrollStore((s) => s.progress)
  const activeSection = useScrollStore((s) => s.section)
  const isDark = progress < 0.95

  return (
    <div className="relative bg-[#020212]">
      <SmoothScroll />

      {/* Fixed 3D Canvas */}
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 3, 30], fov: 60 }}
          gl={{ antialias: true, alpha: false, stencil: false }}
          dpr={[1, 1.5]}
        >
          <SpaceScene />
        </Canvas>
      </div>

      {/* Persistent Header Overlay */}
      <Header scrollProgress={progress} />

      {/* Text Overlay */}
      <TextOverlay activeSection={activeSection} isDark={isDark} />

      {/* Status Bar */}
      <StatusBar currentSection={activeSection} isDark={isDark} />

      {/* Footer */}
      <Footer />
    </div>
  )
}

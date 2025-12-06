"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import Image from "next/image"

export function Header({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const glitch1Ref = useRef<HTMLDivElement>(null)
  const glitch2Ref = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 },
      )
    }
  }, [])

  useEffect(() => {
    if (!isHovering || !glitch1Ref.current || !glitch2Ref.current) return

    const glitch1 = glitch1Ref.current
    const glitch2 = glitch2Ref.current

    const createGlitch = () => {
      const tl = gsap.timeline({ repeat: -1 })

      // Glitch 1 - Extreme RGB shift with diagonal movement
      tl.to(
        glitch1,
        {
          x: () => gsap.utils.random(-4, 4),
          y: () => gsap.utils.random(-2, 2),
          rotation: () => gsap.utils.random(-2, 2),
          skewX: () => gsap.utils.random(-3, 3),
          opacity: () => gsap.utils.random(0.5, 1),
          duration: 0.04,
          ease: "none",
        },
        0,
      )

      // Glitch 2 - Opposite diagonal shift with more chaos
      tl.to(
        glitch2,
        {
          x: () => gsap.utils.random(-6, 6),
          y: () => gsap.utils.random(-4, 4),
          rotation: () => gsap.utils.random(-2, 2),
          skewX: () => gsap.utils.random(-3, 3),
          opacity: () => gsap.utils.random(0.4, 0.9),
          duration: 0.04,
          ease: "none",
        },
        0,
      )

      // Random pause and repeat with shorter intervals
      tl.to({}, { duration: () => gsap.utils.random(0.05, 0.2) })

      return tl
    }

    const glitchTimeline = createGlitch()

    return () => {
      glitchTimeline.kill()
      gsap.set([glitch1, glitch2], { clearProps: "all" })
    }
  }, [isHovering])

  // Switch logo based on background brightness
  const isDark = scrollProgress < 0.85
  const logoSrc = isDark ? "/logo_white_yoko.png" : "/logo_gradation_yoko.png"

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-center justify-end px-8 py-6">
        <div ref={logoRef} className="pointer-events-auto">
          <Link
            href="/"
            className="flex items-center relative block"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Main logo */}
            <Image
              src={logoSrc}
              alt="tent"
              width={110}
              height={50}
              className="transition-all duration-500 relative z-10"
              priority
            />

            {/* Glitch overlays */}
            <div
              ref={glitch1Ref}
              className="absolute top-0 left-0 pointer-events-none transition-opacity duration-200"
              style={{
                opacity: isHovering ? 1 : 0,
                mixBlendMode: "screen",
                filter: "hue-rotate(90deg) saturate(2)",
              }}
            >
              <Image src={logoSrc} alt="" width={110} height={50} aria-hidden="true" />
            </div>

            <div
              ref={glitch2Ref}
              className="absolute top-0 left-0 pointer-events-none transition-opacity duration-200"
              style={{
                opacity: isHovering ? 1 : 0,
                mixBlendMode: "screen",
                filter: "hue-rotate(-90deg) saturate(2)",
              }}
            >
              <Image src={logoSrc} alt="" width={110} height={50} aria-hidden="true" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}

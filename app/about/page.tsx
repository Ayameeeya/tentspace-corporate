"use client"

import { Suspense, useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LogoLoop } from "@/components/LogoLoop"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Starfield } from "@/components/three/starfield"
import { Galaxy } from "@/components/three/galaxy"
import { Planet } from "@/components/three/planets"
import { FloatingAsteroids } from "@/components/three/asteroids"
import { DistantGalaxies, ForegroundStars } from "@/components/three/deep-space"
import { useScrollStore } from "@/lib/stores/scroll-store"
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiAmazonwebservices,
  SiSupabase,
  SiThreedotjs,
  SiVercel,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiDocker,
  SiGit
} from "react-icons/si"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Camera: gentle drift forward, driven by the shared scroll store
function CameraController() {
  const { camera } = useThree()

  useFrame((state) => {
    const { progress, reducedMotion } = useScrollStore.getState()
    const t = state.clock.elapsedTime

    if (reducedMotion) {
      camera.position.set(0, 0, 30)
      camera.lookAt(0, 0, -20)
      return
    }

    camera.position.x = Math.sin(t * 0.2) * 2 + Math.sin(progress * Math.PI) * 5
    camera.position.y = Math.cos(t * 0.15) * 1.5 + progress * 3
    camera.position.z = 30 - progress * 18

    camera.lookAt(0, 0, -20)
  })

  return null
}

// 3D Scene — shares the galaxy / planet components with the top page
function Scene3D() {
  return (
    <>
      <color attach="background" args={["#020212"]} />
      <fog attach="fog" args={["#020212", 50, 260]} />

      <CameraController />
      <Starfield />
      <DistantGalaxies />
      <ForegroundStars />

      <Suspense fallback={null}>
        <Galaxy position={[15, -18, -70]} />
        <FloatingAsteroids />
        <Planet
          textureUrl="/textures/2k_moon.jpg"
          radius={3}
          position={[-16, 6, -26]}
          spinSpeed={0.02}
          glow="#93c5fd"
        />
        <Planet
          textureUrl="/textures/2k_neptune.jpg"
          radius={6}
          position={[24, -6, -60]}
          spinSpeed={0.04}
          tilt={0.3}
          glow="#3b82f6"
          ring
        />
      </Suspense>

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#60a5fa" />
      <directionalLight position={[30, 20, 10]} intensity={1} color="#ffffff" />
    </>
  )
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Configure ScrollTrigger for better mobile performance
    if (typeof window !== 'undefined') {
      ScrollTrigger.config({
        limitCallbacks: true,
        syncInterval: 150,
      })
    }
  }, [])

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768
    const reduced = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced) return

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } })

      heroTl
        .from(".hero-label", {
          y: 30,
          opacity: 0,
          duration: 1,
          delay: 0.3,
        })
        .from(
          ".hero-title",
          {
            y: 120,
            opacity: 0,
            duration: 1.2,
            skewY: 5,
          },
          "-=0.7",
        )
        .from(
          ".hero-subtitle",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6",
        )
        .from(
          ".hero-statement",
          {
            x: 60,
            opacity: 0,
            duration: 1,
          },
          "-=0.8",
        )
        .from(
          ".hero-text",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
          },
          "-=0.6",
        )
        .from(
          ".hero-line",
          {
            scaleX: 0,
            opacity: 0,
            duration: 0.8,
            transformOrigin: "left center",
          },
          "-=0.4",
        )
        .from(
          ".hero-scroll",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.3",
        )

      // Section animations
      gsap.utils.toArray<HTMLElement>(".section-fade").forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 100,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        })
      })

      // Stagger text animations
      gsap.utils.toArray<HTMLElement>(".text-stagger").forEach((el) => {
        gsap.from(el.children, {
          opacity: 0,
          y: 60,
          rotateX: 20,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
        })
      })

      // Parallax elements - disabled on mobile for better scroll performance
      if (!isMobile) {
        gsap.utils.toArray<HTMLElement>(".parallax-slow").forEach((el) => {
          gsap.to(el, {
            y: -100,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          })
        })

        gsap.utils.toArray<HTMLElement>(".parallax-fast").forEach((el) => {
          gsap.to(el, {
            y: -200,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          })
        })
      }

      // Value cards hover effect
      gsap.utils.toArray<HTMLElement>(".value-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, { scale: 1.02, duration: 0.3, ease: "power2.out" })
        })
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" })
        })
      })

      gsap.utils.toArray<HTMLElement>(".company-info-item").forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          x: -30,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen text-white overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      <SmoothScroll />
      <Header />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }} gl={{ antialias: true, stencil: false }} dpr={[1, 1.5]}>
          <Scene3D />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-24 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-7xl mx-auto w-full">
            {/* Left - Main Title */}
            <div className="hero-content">
              <div className="overflow-hidden mb-4">
                <p className="hero-label font-tech text-blue-400 text-[10px] md:text-xs tracking-[0.3em] uppercase">About Us</p>
              </div>
              <div className="overflow-hidden">
                <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.9]">
                  tent<span className="text-blue-500">␣</span>
                </h1>
              </div>
              <div className="overflow-hidden mt-4">
                <p className="hero-subtitle text-sm md:text-lg text-white/50 tracking-wide font-mono">
                  AI-Driven Development
                </p>
              </div>
            </div>

            {/* Right - Statement */}
            <div className="hero-statement lg:pl-12 border-l border-white/10">
              <div className="space-y-2 md:space-y-4 font-bold font-mono">
                <div className="overflow-hidden">
                  <p className="hero-text text-base md:text-2xl lg:text-3xl text-white/90 leading-relaxed">
                    <span className="text-blue-400">ソフトウェア開発</span>と
                  </p>
                </div>
                <div className="overflow-hidden">
                  <p className="hero-text text-base md:text-2xl lg:text-3xl text-white/90 leading-relaxed">
                    <span className="text-blue-400">ITコンサルティング</span>で
                  </p>
                </div>
                <div className="overflow-hidden">
                  <p className="hero-text text-base md:text-2xl lg:text-3xl text-white/90 leading-relaxed">
                    ビジネスの課題を解決。
                  </p>
                </div>
                <div className="overflow-hidden">
                  <p className="hero-text text-base md:text-2xl lg:text-3xl text-white leading-relaxed">
                    AIを<span className="text-blue-400">武器</span>に、共に創る。
                  </p>
                </div>
              </div>

              <div className="hero-line mt-6 md:mt-10 pt-4 md:pt-6 border-t border-white/10">
                <p className="text-white/40 text-[10px] md:text-xs tracking-wider">EST. 2023 — IZU, JAPAN</p>
              </div>
            </div>
          </div>
        </section>
        {/* End hero redesign */}

        {/* Mission */}
        <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-24 section-fade">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="parallax-slow">
              <p className="font-tech text-blue-400 text-[10px] md:text-xs tracking-[0.3em] mb-4 md:mb-6">OUR MISSION</p>
              <h2 className="text-3xl md:text-6xl font-bold font-mono tracking-tight mb-6 md:mb-8 leading-tight">
                AIの力で、
                <br />
                <span className="text-blue-400">可能性を拡張する</span>
              </h2>
              <p className="text-white/50 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
                私たちは、AIを単なるツールではなく、人間の創造性を増幅するパートナーとして捉えています。
                最先端の技術と深い専門知識を組み合わせ、ビジネスの可能性を無限に広げます。
              </p>
              <p className="text-white/50 text-sm md:text-lg leading-relaxed">
                複雑な問題を解決し、これまで不可能だったことを現実にする。 それが私たちの使命です。
              </p>
            </div>
            <div className="relative parallax-fast">
              <div className="aspect-square border border-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[12rem] font-bold text-blue-500/10">AI</span>
              </div>
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500" />
            </div>
          </div>
        </section>

        <section className="py-32 px-6 md:px-12 lg:px-24 section-fade">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 md:mb-16 text-stagger">
              <p className="font-tech text-blue-400 text-[9px] md:text-[10px] tracking-[0.3em] mb-4 md:mb-6 uppercase">COMPANY</p>
              <h2 className="text-2xl md:text-5xl font-bold font-mono tracking-tight">会社概要</h2>
            </div>

            <div className="border border-white/10 backdrop-blur-sm">
              {[
                { label: "社名", value: "株式会社tent space" },
                { label: "設立", value: "2023年8月1日" },
                { label: "資本金", value: "¥1,000,000（資本準備金含む）" },
                { label: "事業内容", value: "ソフトウェア開発、ITコンサルティング" },
                { label: "代表者", value: "代表取締役 石井 絢子\n取締役 根岸 宏繁" },
                { label: "所在地", value: "〒355-0316\n埼玉県比企郡小川町大字角山323" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="company-info-item grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-white/10 last:border-b-0"
                >
                  <div className="px-4 py-3 md:px-6 md:py-5 font-tech text-blue-400 text-[10px] md:text-xs bg-white/[0.02]">{item.label}</div>
                  <div className="px-4 py-3 md:px-6 md:py-5 text-white/80 text-xs md:text-sm whitespace-pre-line">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-32 px-6 md:px-12 section-fade">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-stagger">
              {[
                { value: "50+", label: "Projects" },
                { value: "99%", label: "Satisfaction" },
                { value: "24/7", label: "AI Ops" },
                { value: "10x", label: "Speed" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-7xl font-bold text-blue-500 mb-1 md:mb-2">{stat.value}</div>
                  <div className="text-white/40 font-tech text-[10px] md:text-xs tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="min-h-screen flex items-center py-32 px-6 md:px-12 lg:px-24 section-fade">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-12 md:mb-20 text-stagger">
              <p className="font-tech text-blue-400 text-[10px] md:text-xs tracking-[0.3em] mb-4 md:mb-6">OUR VALUES</p>
              <h2 className="text-3xl md:text-6xl font-bold font-mono tracking-tight">私たちの価値観</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  title: "Innovation",
                  desc: "常に最先端を追求し、新しい技術と手法を積極的に取り入れます。",
                },
                {
                  num: "02",
                  title: "Excellence",
                  desc: "コードからコミュニケーションまで、あらゆる面で最高品質を追求します。",
                },
                {
                  num: "03",
                  title: "Partnership",
                  desc: "クライアントの成功を自分たちの成功と捉え、真のパートナーとして伴走します。",
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="value-card p-6 md:p-10 border border-white/10 backdrop-blur-sm hover:border-blue-500/50 transition-colors cursor-default"
                >
                  <span className="font-tech text-blue-500 text-xs md:text-sm">{value.num}</span>
                  <h3 className="text-xl md:text-3xl font-bold mt-3 md:mt-4 mb-3 md:mb-4">{value.title}</h3>
                  <p className="text-white/50 text-sm md:text-base leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-32 px-6 md:px-12 lg:px-24 section-fade">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 md:mb-20 text-stagger">
              <p className="font-tech text-blue-400 text-[10px] md:text-xs tracking-[0.3em] mb-4 md:mb-6">SERVICES</p>
              <h2 className="text-3xl md:text-6xl font-bold font-mono tracking-tight">提供サービス</h2>
            </div>

            <div className="space-y-4">
              {[
                { title: "AI Development", desc: "カスタムAIソリューションの設計・開発" },
                { title: "Web Application", desc: "最新技術を活用したWebアプリケーション開発" },
                { title: "Consulting", desc: "AI導入戦略の立案・コンサルティング" },
                { title: "Automation", desc: "業務プロセスの自動化・効率化" },
              ].map((service, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-4 md:p-6 border-b border-white/10 hover:border-blue-500/50 transition-all cursor-default"
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="font-tech text-blue-500/50 text-xs md:text-sm">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-lg md:text-3xl font-bold group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h3>
                  </div>
                  <p className="hidden md:block text-white/40 max-w-md text-right">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-32 px-6 md:px-12 lg:px-24 section-fade">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 md:mb-20 text-stagger">
              <p className="font-tech text-blue-400 text-[10px] md:text-xs tracking-[0.3em] mb-4 md:mb-6">TECH STACK</p>
              <h2 className="text-3xl md:text-6xl font-bold font-mono tracking-tight">技術スタック</h2>
            </div>

            <LogoLoop
              logos={[
                { node: <SiNextdotjs className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Next.js" },
                { node: <SiReact className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "React" },
                { node: <SiTypescript className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "TypeScript" },
                { node: <SiAmazonwebservices className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "AWS" },
                { node: <SiSupabase className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Supabase" },
                { node: <SiTailwindcss className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Tailwind CSS" },
                { node: <SiThreedotjs className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Three.js" },
                { node: <SiVercel className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Vercel" },
                { node: <SiNodedotjs className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Node.js" },
                { node: <SiPostgresql className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "PostgreSQL" },
                { node: <SiPython className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Python" },
                { node: <SiDocker className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Docker" },
                { node: <SiGit className="w-12 h-12 md:w-16 md:h-16" />, ariaLabel: "Git" },
              ]}
              speed={30}
              fadeOut
              fadeOutColor="rgb(2,2,18)"
              className="text-white/80 hover:text-white transition-colors"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="min-h-screen flex items-center justify-center px-6 md:px-12 section-fade">
          <div className="text-center max-w-3xl">
            <div className="text-stagger">
              <p className="font-tech text-blue-400 text-[10px] md:text-xs tracking-[0.5em] uppercase mb-6 md:mb-8">NEXT STEP</p>
              <h2 className="text-3xl md:text-7xl font-bold font-tech tracking-tight mb-6 md:mb-8">
                Let's build
                <br />
                the future
              </h2>
              <p className="text-white/50 text-sm md:text-lg">AIがビジネスをどう変革できるか、一緒に考えましょう。</p>
            </div>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-32" />

        {/* Footer */}
        <Footer copyrightClassName="text-background/60" />
      </div>
    </div>
  )
}

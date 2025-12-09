"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { getPosts, getFeaturedImageUrl, stripHtml, formatDate, getReadingTime, type WPPost } from "@/lib/wordpress"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Infinite Star Field
function StarField({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 10000

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 30 + Math.random() * 150

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      const isBlue = Math.random() > 0.75
      col[i * 3] = isBlue ? 0.4 : 1
      col[i * 3 + 1] = isBlue ? 0.6 : 1
      col[i * 3 + 2] = 1

      siz[i] = Math.random() * 1.5 + 0.3
    }
    return [pos, col, siz]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime

    pointsRef.current.rotation.y = t * 0.015 + scrollProgress * Math.PI
    pointsRef.current.rotation.x = Math.sin(t * 0.008) * 0.15 + scrollProgress * 0.3
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* @ts-expect-error - React Three Fiber type mismatch */}
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        {/* @ts-expect-error - React Three Fiber type mismatch */}
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        {/* @ts-expect-error - React Three Fiber type mismatch */}
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Flowing Particle Streams
function ParticleStreams({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const streams = useMemo(() => {
    return Array.from({ length: 4 }, (_, streamIndex) => {
      const count = 600
      const positions = new Float32Array(count * 3)
      const baseAngle = (streamIndex / 4) * Math.PI * 2

      for (let i = 0; i < count; i++) {
        const t = i / count
        const spiral = t * Math.PI * 6
        const radius = 8 + t * 25

        positions[i * 3] = Math.cos(spiral + baseAngle) * radius
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15 + Math.sin(t * Math.PI * 3) * 8
        positions[i * 3 + 2] = Math.sin(spiral + baseAngle) * radius - 40
      }
      return { positions, count }
    })
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.rotation.y = t * 0.05 + scrollProgress * Math.PI * 0.5
    groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.1
  })

  return (
    <group ref={groupRef}>
      {streams.map((stream, idx) => (
        <points key={idx}>
          <bufferGeometry>
            {/* @ts-expect-error - React Three Fiber type mismatch */}
            <bufferAttribute attach="attributes-position" count={stream.count} array={stream.positions} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial
            size={0.06}
            color={idx % 2 === 0 ? "#60a5fa" : "#ffffff"}
            transparent
            opacity={0.5}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </group>
  )
}

// Camera Controller
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    camera.position.x = Math.sin(t * 0.2) * 2 + Math.sin(scrollProgress * Math.PI) * 5
    camera.position.y = Math.cos(t * 0.15) * 1.5 + scrollProgress * 3
    camera.position.z = 30 - scrollProgress * 10

    camera.lookAt(0, 0, -20)
  })

  return null
}

// 3D Scene
function Scene3D({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <color attach="background" args={["#020212"]} />
      <fog attach="fog" args={["#020212", 50, 200]} />

      <CameraController scrollProgress={scrollProgress} />
      <StarField scrollProgress={scrollProgress} />
      <ParticleStreams scrollProgress={scrollProgress} />

      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#60a5fa" />
    </>
  )
}

// Blog Card Component
function BlogCard({ post, index }: { post: WPPost; index: number }) {
  const imageUrl = getFeaturedImageUrl(post, 'medium')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []

  return (
    <article
      className="group relative border border-white/10 backdrop-blur-md bg-black/20 hover:border-blue-500/50 transition-all duration-300 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title.rendered}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-blue-500/20">Blog</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-3">
            <time className="font-mono text-blue-400 text-[10px] md:text-xs">
              {formatDate(post.date)}
            </time>
            <span className="text-white/30 text-xs">•</span>
            <span className="font-mono text-white/50 text-[10px] md:text-xs">
              {readingTime} min read
            </span>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="px-2 py-0.5 text-[9px] md:text-[10px] font-mono bg-blue-500/20 text-blue-400 uppercase tracking-wider"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2
            className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {/* Excerpt */}
          <p className="text-white/50 text-sm line-clamp-2">
            {excerpt}
          </p>

          {/* Read more indicator */}
          <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="font-mono text-xs">READ MORE</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transform group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Main Blog Page Component
export default function BlogPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [posts, setPosts] = useState<WPPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const { posts: fetchedPosts, totalPages: total } = await getPosts({
          page: currentPage,
          perPage: 12,
        })
        setPosts(fetchedPosts)
        setTotalPages(total)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch posts:', err)
        setError('ブログ記事の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage])

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(scrollY / docHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // GSAP animations
  useEffect(() => {
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
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen text-white overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      <Header />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <Scene3D scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="min-h-[50vh] flex items-center px-6 md:px-12 lg:px-24 pt-24">
          <div className="max-w-7xl mx-auto w-full">
            <div className="overflow-hidden mb-4">
              <p className="hero-label font-mono text-blue-400 text-[10px] md:text-xs tracking-[0.3em] uppercase">BLOG</p>
            </div>
            <div className="overflow-hidden">
              <h1 className="hero-title font-[family-name:var(--font-display)] text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.9]">
                Tech<span className="text-blue-500">␣</span>Insights
              </h1>
            </div>
            <div className="overflow-hidden mt-4">
              <p className="hero-subtitle text-sm md:text-lg text-white/50 tracking-wide font-mono">
                AI開発・テクノロジー・最新の取り組みについて
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-white/10 backdrop-blur-sm animate-pulse">
                    <div className="aspect-[16/9] bg-white/5" />
                    <div className="p-6 space-y-3">
                      <div className="h-3 bg-white/10 rounded w-1/4" />
                      <div className="h-6 bg-white/10 rounded w-3/4" />
                      <div className="h-4 bg-white/10 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-white/50 text-lg mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors font-mono text-sm"
                >
                  再読み込み
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white/50 text-lg">まだ記事がありません</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-white/10 text-white/50 hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono text-sm"
                    >
                      ← Prev
                    </button>
                    <span className="font-mono text-white/50 text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-white/10 text-white/50 hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono text-sm"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Spacer */}
        <div className="h-32" />

        {/* Let's Talk Section */}
        <LetsTalkSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

// Footer Component
function Footer() {
  return (
    <footer className="relative z-20 px-2 md:px-8 py-1">
      <div className="flex justify-end">
        <p className="text-[8px] md:text-[9px] text-white/40">© 2025 tent space Inc. All rights reserved.</p>
      </div>
    </footer>
  )
}

// Let's Talk Section Component
function LetsTalkSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const arrowRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
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
        <div className="flex items-center gap-2 md:gap-3 text-primary-foreground/80">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <svg width="12" height="2" viewBox="0 0 16 2" fill="currentColor" className="md:w-4">
              <rect width="16" height="2" rx="1" />
            </svg>
          </div>
          <span className="text-xs md:text-sm font-medium tracking-wide">Next step</span>
        </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}


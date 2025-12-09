"use client"

import { useEffect, useRef, useState, useMemo, use } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { getPostBySlug, getFeaturedImageUrl, formatDate, getReadingTime, type WPPost } from "@/lib/wordpress"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Infinite Star Field
function StarField({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 8000

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

    pointsRef.current.rotation.y = t * 0.01 + scrollProgress * Math.PI * 0.5
    pointsRef.current.rotation.x = Math.sin(t * 0.005) * 0.1 + scrollProgress * 0.2
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Camera Controller
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    camera.position.x = Math.sin(t * 0.15) * 1.5
    camera.position.y = Math.cos(t * 0.1) * 1 + scrollProgress * 2
    camera.position.z = 25 - scrollProgress * 8

    camera.lookAt(0, 0, -15)
  })

  return null
}

// 3D Scene
function Scene3D({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <color attach="background" args={["#020212"]} />
      <fog attach="fog" args={["#020212", 40, 180]} />

      <CameraController scrollProgress={scrollProgress} />
      <StarField scrollProgress={scrollProgress} />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#60a5fa" />
    </>
  )
}

// Main Blog Post Page Component
export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [post, setPost] = useState<WPPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch post
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        const fetchedPost = await getPostBySlug(resolvedParams.slug)
        if (!fetchedPost) {
          setError('記事が見つかりませんでした')
        } else {
          setPost(fetchedPost)
          setError(null)
        }
      } catch (err) {
        console.error('Failed to fetch post:', err)
        setError('記事の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [resolvedParams.slug])

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
    if (!post) return

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } })

      heroTl
        .from(".post-back", {
          x: -30,
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
        })
        .from(
          ".post-meta",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        )
        .from(
          ".post-title",
          {
            y: 60,
            opacity: 0,
            duration: 1,
          },
          "-=0.5",
        )
        .from(
          ".post-image",
          {
            y: 40,
            opacity: 0,
            duration: 1,
          },
          "-=0.6",
        )
        .from(
          ".post-content",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        )
    }, containerRef)

    return () => ctx.revert()
  }, [post])

  const imageUrl = post ? getFeaturedImageUrl(post, 'large') : null
  const categories = post?._embedded?.['wp:term']?.[0] || []
  const readingTime = post ? getReadingTime(post.content.rendered) : 0

  return (
    <div ref={containerRef} className="relative min-h-screen text-white overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      <Header />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
          <Scene3D scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-4 bg-white/10 rounded w-24 mx-auto mb-4" />
              <div className="h-10 bg-white/10 rounded w-64 mx-auto mb-4" />
              <div className="h-3 bg-white/10 rounded w-32 mx-auto" />
            </div>
          </div>
        ) : error ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/50 text-lg mb-6">{error}</p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors font-mono text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                ブログ一覧に戻る
              </Link>
            </div>
          </div>
        ) : post ? (
          <>
            {/* Article Header */}
            <article className="pt-24 pb-16 px-6 md:px-12 lg:px-24">
              <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link
                  href="/blog"
                  className="post-back inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 group"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="group-hover:-translate-x-1 transition-transform"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span className="font-mono text-xs">BACK TO BLOG</span>
                </Link>

                {/* Meta */}
                <div className="post-meta flex flex-wrap items-center gap-3 mb-4">
                  <time className="font-mono text-blue-400 text-xs md:text-sm">
                    {formatDate(post.date)}
                  </time>
                  <span className="text-white/30 text-xs">•</span>
                  <span className="font-mono text-white/50 text-xs md:text-sm">
                    {readingTime} min read
                  </span>
                  {categories.length > 0 && (
                    <>
                      <span className="text-white/30 text-xs">•</span>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="px-2 py-0.5 text-[10px] md:text-xs font-mono bg-blue-500/20 text-blue-400 uppercase tracking-wider"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="post-title text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                {/* Featured Image */}
                {imageUrl && (
                  <div className="post-image relative aspect-[16/9] mb-12 border border-white/10 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={post.title.rendered}
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Corner decorations */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
                  </div>
                )}

                {/* Content */}
                <div
                  className="post-content wp-content"
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                />

                {/* Author / Share section */}
                <div className="mt-16 pt-8 border-t border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {post._embedded?.author?.[0] && (
                        <>
                          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                            {post._embedded.author[0].name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{post._embedded.author[0].name}</p>
                            <p className="text-white/50 text-sm font-mono">tent space</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/50 text-sm font-mono">SHARE:</span>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}&text=${encodeURIComponent(post.title.rendered)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-white/10 hover:border-blue-500 hover:text-blue-400 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Back to blog */}
                <div className="mt-12 text-center">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-3 text-lg font-medium text-blue-400 hover:text-blue-300 transition-colors group"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="group-hover:-translate-x-2 transition-transform"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    <span>他の記事を読む</span>
                  </Link>
                </div>
              </div>
            </article>

            {/* Spacer */}
            <div className="h-32" />

            {/* Let's Talk Section */}
            <LetsTalkSection />

            {/* Footer */}
            <Footer />
          </>
        ) : null}
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


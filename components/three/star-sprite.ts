import * as THREE from "three"

const cache = new Map<string, THREE.Texture>()

function makeTexture(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void): THREE.Texture {
  const cached = cache.get(key)
  if (cached) return cached

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  draw(ctx, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  cache.set(key, texture)
  return texture
}

/** Soft round sprite — used for nebulae / galaxy particles. */
export function getStarSprite(): THREE.Texture {
  return makeTexture("star", 64, (ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(0.3, "rgba(255,255,255,0.8)")
    g.addColorStop(0.6, "rgba(255,255,255,0.25)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })
}

/** Tight pinpoint — distant background stars, no bloom halo. */
export function getPinpointSprite(): THREE.Texture {
  return makeTexture("pinpoint", 32, (ctx, size) => {
    const c = size / 2
    const g = ctx.createRadialGradient(c, c, 0, c, c, c * 0.35)
    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(0.5, "rgba(255,255,255,0.7)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })
}

/** Irregular soft cloud blob for nebulae (several offset radial gradients). */
export function getCloudSprite(seed = 0): THREE.Texture {
  return makeTexture(`cloud${seed}`, 256, (ctx, size) => {
    let s = seed * 127.1 + 43758.5453
    const rand = () => {
      s = Math.sin(s) * 43758.5453
      return s - Math.floor(s)
    }
    const c = size / 2
    for (let i = 0; i < 9; i++) {
      const x = c + (rand() - 0.5) * size * 0.45
      const y = c + (rand() - 0.5) * size * 0.45
      const r = size * (0.12 + rand() * 0.24)
      const alpha = 0.10 + rand() * 0.14
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(255,255,255,${alpha})`)
      g.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, size, size)
    }
  })
}

/**
 * Large soft glow used for the galaxy core.
 * Neutral white gradient — tint it via the material's color so the same
 * texture works for warm cores and cool haze.
 */
export function getGlowSprite(): THREE.Texture {
  return makeTexture("glow", 128, (ctx, size) => {
    const c = size / 2
    const g = ctx.createRadialGradient(c, c, 0, c, c, c)
    g.addColorStop(0, "rgba(255,255,255,1)")
    g.addColorStop(0.25, "rgba(255,255,255,0.5)")
    g.addColorStop(0.55, "rgba(255,255,255,0.16)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })
}

/** Tilted elliptical smudge that reads as a distant galaxy (neutral; tint via material). */
export function getDistantGalaxySprite(): THREE.Texture {
  return makeTexture("distant-galaxy", 128, (ctx, size) => {
    const c = size / 2
    ctx.translate(c, c)
    ctx.scale(1, 0.38)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, c * 0.9)
    g.addColorStop(0, "rgba(255,255,255,0.95)")
    g.addColorStop(0.2, "rgba(255,255,255,0.45)")
    g.addColorStop(0.6, "rgba(255,255,255,0.14)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(-c, -c, size, size)
  })
}

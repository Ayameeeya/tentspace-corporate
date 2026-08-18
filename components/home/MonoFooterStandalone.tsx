"use client"

import "@/app/home.css"

import { setupGsap } from "./gsap-setup"
import { MonoFooter } from "./MonoFooter"

setupGsap()

/**
 * Mono footer for pages that live outside MonoShell (blog etc.).
 * The .mono-page wrapper scopes the design system to the footer only,
 * so the host page's own design is untouched.
 */
export function MonoFooterStandalone() {
  return (
    <div className="mono-page">
      <MonoFooter />
    </div>
  )
}

"use client"

import "@/app/home.css"

import { setupGsap } from "./gsap-setup"
import { TentFooter } from "./TentFooter"

setupGsap()

/**
 * Tent footer for pages that live outside TentShell (blog etc.).
 * The .tent-page wrapper scopes the design system to the footer only,
 * so the host page's own design is untouched.
 */
export function TentFooterStandalone() {
  return (
    <div className="tent-page">
      <TentFooter />
    </div>
  )
}

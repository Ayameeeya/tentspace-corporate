"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { PageFooter } from "@/components/page-footer"
import { EyeLoader } from "@/components/eye-loader"

export default function NotFound() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header scrollProgress={1} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-2xl w-full text-center py-12">
          {/* Eye Animation */}
          <div className="mb-6 flex justify-center">
            <div className="scale-75 md:scale-100">
              <EyeLoader variant="end" />
            </div>
          </div>

          {/* 404 */}
          <div className="mb-8">
            <h1 className="text-[120px] md:text-[180px] font-black font-tech text-foreground/60 leading-none select-none">
              404
            </h1>
          </div>

          {/* Message */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-4xl font-bold font-tech text-foreground mb-4">
              ページが見つかりません
            </h2>
            <p className="text-muted-foreground">
              お探しのページは存在しないか、移動した可能性があります
            </p>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  )
}

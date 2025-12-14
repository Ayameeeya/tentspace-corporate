'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-white px-6 py-20 text-slate-800 lg:min-h-[700px]">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-blue-50/50 blur-[80px]" />
        <div className="absolute -bottom-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-orange-50/30 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="mb-6 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold text-blue-700">
              AIネイティブな受託開発
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              AIで、開発を<br />
              <span className="text-blue-600">「超」加速</span>する。
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-slate-600 sm:text-xl">
              高品質なシステムを、従来の半分の期間で。<br />
              ビジネスの成長を止めない、新しい開発のカタチ。
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="#contact"
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 sm:w-auto"
              >
                無料相談を申し込む
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-14 w-full items-center justify-center rounded-lg border-2 border-slate-200 bg-white px-8 text-base font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                サービス詳細
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Abstract representation of "Clean & Speed" */}
            <div className="relative aspect-square w-full max-w-md mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-100 to-white shadow-2xl" />
              <div className="absolute inset-4 rounded-2xl bg-white p-6 shadow-inner">
                <div className="flex h-full flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                    <div className="h-32 rounded-xl bg-blue-50 p-4">
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-xs font-bold">AI Generating Code...</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="text-sm font-bold text-slate-500">Development Time</div>
                    <div className="text-xl font-bold text-blue-600">-50%</div>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -right-8 top-12 rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Quality Check</div>
                    <div className="font-bold text-slate-800">Passed</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

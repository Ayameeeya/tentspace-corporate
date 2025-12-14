'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'AI開発の品質は大丈夫ですか？',
    answer: 'はい、ご安心ください。AIが生成したコードは、必ず経験豊富な熟練エンジニアがレビューを行います。また、静的解析ツールや自動テストを組み合わせることで、人間だけの開発よりも高い品質を担保しています。',
  },
  {
    question: '既存システムの改修も可能ですか？',
    answer: '可能です。既存のコードベースをAIに解析させることで、仕様書がない場合でもスムーズに理解し、改修や機能追加を行うことができます。',
  },
  {
    question: '開発期間はどのくらい短縮できますか？',
    answer: 'プロジェクトの規模や内容にもよりますが、平均して従来の開発期間の30%〜50%を短縮できています。特に初期プロトタイピングや定型的な実装において大きな効果を発揮します。',
  },
  {
    question: '費用感について教えてください。',
    answer: '開発工数が削減される分、従来よりもリーズナブルな価格で提供可能です。具体的な費用は要件によって異なりますので、まずはお気軽にお見積もりをご依頼ください。',
  },
  {
    question: 'どのような技術スタックに対応していますか？',
    answer: 'Web開発（React, Next.js, Vue.js）、バックエンド（Python, Go, Node.js）、モバイルアプリ（Flutter, React Native）など、幅広く対応しています。最適な技術選定からサポートいたします。',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-slate-50 py-24 text-slate-800">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-2 block text-sm font-bold tracking-wider text-blue-600 uppercase">
            FAQ
          </span>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            よくあるご質問
          </h2>
          <div className="mx-auto h-1 w-20 rounded bg-blue-600" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-bold text-slate-900 transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">Q</span>
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-slate-400 transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 text-slate-600">
                  <div className="flex gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs text-white">A</span>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

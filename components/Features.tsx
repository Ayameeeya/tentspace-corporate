'use client'

import { motion } from 'framer-motion'
import { Zap, ShieldCheck, TrendingUp, Code2, Cpu, Users } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: '圧倒的な開発スピード',
    description: 'AIによるコード生成と自動化で、従来の開発期間を最大50%短縮。市場投入までの時間を劇的に削減します。',
  },
  {
    icon: ShieldCheck,
    title: '高品質・バグレス',
    description: 'AIによる静的解析と網羅的な自動テストにより、人間が見落としがちなバグを未然に防ぎます。',
  },
  {
    icon: TrendingUp,
    title: 'コストパフォーマンス',
    description: '開発工数の削減により、コストを抑えつつ高品質な成果物を提供。投資対効果を最大化します。',
  },
  {
    icon: Code2,
    title: 'モダンな技術選定',
    description: 'Next.js, React, Pythonなど、将来性と拡張性のある最新の技術スタックを採用します。',
  },
  {
    icon: Cpu,
    title: 'AIネイティブ開発',
    description: '要件定義から実装、テストまで、全工程でAIを活用し、効率と品質を底上げします。',
  },
  {
    icon: Users,
    title: '熟練エンジニアの監修',
    description: 'AIの出力は必ず経験豊富なエンジニアがレビュー。AIと人間のハイブリッド体制で安心を提供します。',
  },
]

export function Features() {
  return (
    <section id="features" className="bg-slate-50 py-24 text-slate-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-2 block text-sm font-bold tracking-wider text-blue-600 uppercase">
            Features
          </span>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            なぜ、AI開発なのか？
          </h2>
          <div className="mx-auto h-1 w-20 rounded bg-blue-600" />
          <p className="mt-6 text-slate-600">
            スピード、品質、コスト。すべての課題をテクノロジーで解決します。
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-xl bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

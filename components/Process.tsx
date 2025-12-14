'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Hearing & Analysis',
    jpTitle: 'ヒアリング・要件整理',
    description: 'お客様の課題をヒアリングし、AIを用いて瞬時に要件を整理・構造化します。',
  },
  {
    number: '02',
    title: 'Prototyping',
    jpTitle: 'プロトタイプ作成',
    description: '要件に基づき、AIを活用して即座にプロトタイプを作成。イメージのすり合わせを早期に行います。',
  },
  {
    number: '03',
    title: 'Development',
    jpTitle: 'AIペアプログラミング',
    description: '熟練エンジニアとAIがペアプログラミングを行い、爆速で高品質なコードを実装します。',
  },
  {
    number: '04',
    title: 'QA & Testing',
    jpTitle: '品質保証・テスト',
    description: 'AIによる自動テストとセキュリティチェックを実施し、堅牢なシステムを保証します。',
  },
  {
    number: '05',
    title: 'Delivery',
    jpTitle: '納品・運用サポート',
    description: 'スピーディーに納品し、運用開始後もAIを活用したモニタリングでサポートします。',
  },
]

export function Process() {
  return (
    <section className="bg-white py-24 text-slate-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span className="mb-2 block text-sm font-bold tracking-wider text-blue-600 uppercase">
            Process
          </span>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            開発プロセス
          </h2>
          <div className="mx-auto h-1 w-20 rounded bg-blue-600" />
          <p className="mt-6 text-slate-600">
            AIを組み込んだ最適化されたワークフロー
          </p>
        </div>

        <div className="relative">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step Number */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600 shadow-sm">
                  {step.number}
                </div>
                
                {/* Connector Line (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 -z-10 hidden h-0.5 w-full translate-x-1/2 bg-slate-200 lg:block" />
                )}

                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  {step.jpTitle}
                </h3>
                <div className="mb-3 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {step.title}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

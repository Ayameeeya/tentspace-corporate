'use client'

import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

export function Contact() {
  return (
    <section id="contact" className="bg-blue-600 py-24 text-white">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            お問い合わせ
          </h2>
          <p className="text-blue-100">
            開発のご相談、お見積もりなど、お気軽にお問い合わせください。<br />
            AI活用の可能性について、まずは無料でお話ししましょう。
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-white p-8 text-slate-800 shadow-2xl md:p-12"
        >
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-700">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="taro@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-bold text-slate-700">
                会社名
              </label>
              <input
                type="text"
                id="company"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="株式会社Example"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-bold text-slate-700">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                rows={4}
                required
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="新規サービスの開発について相談したい..."
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-12 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 md:w-auto"
              >
                <Send className="h-5 w-5" />
                送信する
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

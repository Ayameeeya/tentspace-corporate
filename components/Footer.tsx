export function Footer() {
  return (
    <footer className="bg-slate-900 py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">AI Native Dev</h3>
            <p className="mt-2 text-sm text-slate-400">
              AIで、開発の未来を創る。
            </p>
          </div>
          <div className="flex gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <a href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
            <a href="#" className="hover:text-white transition-colors">運営会社</a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} AI Native Dev. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function AIDevelopmentLP() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo_black_yoko.png"
              alt="tent space"
              width={100}
              height={44}
              className="h-7 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#problem" className="hover:text-blue-600 transition-colors">課題</a>
            <a href="#why" className="hover:text-blue-600 transition-colors">選ばれる理由</a>
            <a href="#case" className="hover:text-blue-600 transition-colors">事例</a>
            <a href="#service" className="hover:text-blue-600 transition-colors">サービス</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>
          <a
            href="#contact"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            お問い合わせ
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-blue-400 font-medium mb-4">20年の経験 × AIの網羅性</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            AIと並走する開発で、<br className="hidden md:block" />
            <span className="text-blue-400">従来の限界を超える品質</span>を
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            速さではなく、質で選ばれる開発を。<br />
            AIを「作業員」ではなく「もう一人の専門家」として扱い、<br className="hidden md:block" />
            複数専門家レベルの品質を実現します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              無料相談する
            </a>
            <a
              href="#case"
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-lg border border-white/30"
            >
              導入事例を見る
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium mb-2">PROBLEM</p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              「AIで安く速く」が<span className="text-red-500">危険</span>な理由
            </h2>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 md:p-10 mb-8">
            <p className="text-xl md:text-2xl font-bold text-center mb-6">
              「AIで開発が速くなりました！だから安くできます！」
            </p>
            <p className="text-2xl md:text-3xl font-bold text-center text-red-500 mb-8">
              それは、間違った使い方です。
            </p>
            <p className="text-center text-slate-600 max-w-2xl mx-auto">
              AIの本質は「速さ」ではありません。<br />
              <strong className="text-slate-900">人間の限界を超えた品質チェック、多角的な検証、網羅的なテスト</strong>です。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Bad Pattern 1 */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg">✕</span>
                <h3 className="font-bold text-lg">よくある落とし穴①</h3>
              </div>
              <p className="font-bold text-slate-800 mb-3">パターン1: コード生成だけ</p>
              <div className="bg-white rounded-lg p-4 text-sm font-mono text-slate-600 mb-3">
                「AIでコード書かせたら3日で終わった！安くできますよ！」<br />
                ↓<br />
                でも、誰も理解できないコード<br />
                セキュリティホールだらけ<br />
                運用が始まったら破綻
              </div>
            </div>

            {/* Bad Pattern 2 */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg">✕</span>
                <h3 className="font-bold text-lg">よくある落とし穴②</h3>
              </div>
              <p className="font-bold text-slate-800 mb-3">パターン2: 工数削減だけ</p>
              <div className="bg-white rounded-lg p-4 text-sm font-mono text-slate-600 mb-3">
                「従来3ヶ月→1ヶ月に短縮！費用半額！」<br />
                ↓<br />
                でも、技術選定は相変わらず人間の勘<br />
                長期運用コストは考慮されず<br />
                結局高くつく
              </div>
            </div>
          </div>

          {/* Our Approach */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg">✓</span>
              <h3 className="font-bold text-lg text-blue-800">私たちのAI活用</h3>
            </div>
            <p className="font-bold text-blue-900 mb-4 text-lg">AIは「レビュアー」「検証者」「相談相手」</p>
            <div className="bg-white rounded-lg p-4 md:p-6 mb-4">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm md:text-base">
                <span className="px-3 py-1 bg-slate-100 rounded">人間が設計</span>
                <span className="text-slate-400">→</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">AIが多角的に検証</span>
                <span className="text-slate-400">→</span>
                <span className="px-3 py-1 bg-slate-100 rounded">人間が判断・改善</span>
                <span className="text-slate-400">→</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">AIが再検証</span>
              </div>
            </div>
            <p className="text-center font-bold text-blue-900">
              ↓ このサイクルで品質が従来の限界を超える
            </p>
            <p className="text-center text-blue-700 mt-3 font-medium">
              結果：開発費は下がらないが、<span className="underline">トータルコストは大幅に下がる</span>
            </p>
          </div>
        </div>
      </section>

      {/* Why Section - 5 Reasons */}
      <section id="why" className="py-16 md:py-24 bg-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium mb-2">5 REASONS</p>
            <h2 className="text-2xl md:text-4xl font-bold">
              品質が上がる、<span className="text-blue-600">5つの理由</span>
            </h2>
          </div>

          <div className="space-y-6">
            {/* Reason 1 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-6 border-b border-slate-100">
                <span className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">01</span>
                <h3 className="text-xl font-bold">多角的な検証が可能になる</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">
                  20年の経験で「当たり前」になっていることほど、見落としやすい。<br />
                  AIは毎回ゼロベースで全パターンをチェックします。
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="font-bold text-red-700 text-sm mb-2">従来（人間だけ）</p>
                    <p className="text-sm text-slate-600">「まあ、大丈夫でしょ」→ 見落とし発生</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-bold text-blue-700 text-sm mb-2">AI並走</p>
                    <p className="text-sm text-slate-600">認証・SQLインジェクション・機密情報・レートリミット・監査ログ...全パターンチェック</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason 2 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-6 border-b border-slate-100">
                <span className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">02</span>
                <h3 className="text-xl font-bold">代替案を網羅的に検討できる</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">
                  初期コスト・運用コスト・将来性の全てを考慮した設計が可能に。
                </p>
                <div className="bg-slate-50 rounded-lg p-4 text-sm">
                  <p className="font-bold mb-2">例：インフラ構成の検討</p>
                  <p className="text-slate-600">
                    人間の案「App Runner でいいでしょ」→ AIが Lambda / ECS Fargate / Amplify の比較を提示<br />
                    → アクセスパターン分析で最適解を導出 → <strong>年間運用コスト60%削減</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 3 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-6 border-b border-slate-100">
                <span className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">03</span>
                <h3 className="text-xl font-bold">知らないことに気づける</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">
                  2020年から使っている方法が、2024年にはもっと良い選択肢があるかもしれない。
                </p>
                <div className="bg-green-50 rounded-lg p-4 text-sm">
                  <p className="font-bold text-green-700 mb-2">実例</p>
                  <p className="text-slate-600">
                    「CloudWatch Logs でログ管理すればいいや」→ AI「2024年にリリースされた Application Signals の方が30%安いです」<br />
                    → <strong>年間24万円の節約</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 4 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-6 border-b border-slate-100">
                <span className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">04</span>
                <h3 className="text-xl font-bold">ドキュメントと実装の乖離を防げる</h3>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">
                  コードを書いたらAIが即座にドキュメント生成。整合性もチェック。
                </p>
                <p className="text-blue-600 font-bold">効果: 属人化ゼロ、引き継ぎ工数90%削減</p>
              </div>
            </div>

            {/* Reason 5 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-6 border-b border-slate-100">
                <span className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">05</span>
                <h3 className="text-xl font-bold">テストの網羅性が桁違い</h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="font-bold text-red-700 text-sm mb-2">従来のテスト</p>
                    <p className="text-sm text-slate-600">
                      思いつくケース: 20個<br />
                      カバレッジ: 60%<br />
                      「まあ、これくらいで...」
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-bold text-blue-700 text-sm mb-2">AI並走のテスト</p>
                    <p className="text-sm text-slate-600">
                      人間20個 + AI追加80個<br />
                      カバレッジ: <strong>95%</strong><br />
                      エッジ・異常・負荷・セキュリティ
                    </p>
                  </div>
                </div>
                <p className="text-blue-600 font-bold mt-4">効果: 本番障害80%減少</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium mb-2">COST</p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              だから、費用は下がりません<br />
              <span className="text-blue-600">でも、価値は圧倒的に高い</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-3 md:p-4 text-left font-bold">項目</th>
                  <th className="p-3 md:p-4 text-center font-bold">従来の開発</th>
                  <th className="p-3 md:p-4 text-center font-bold bg-blue-50 text-blue-800">AI並走開発</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 md:p-4 font-medium">開発期間</td>
                  <td className="p-3 md:p-4 text-center">3ヶ月</td>
                  <td className="p-3 md:p-4 text-center bg-blue-50">2ヶ月</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-medium">開発費用</td>
                  <td className="p-3 md:p-4 text-center">300万円</td>
                  <td className="p-3 md:p-4 text-center bg-blue-50 font-bold text-red-500">350万円（高い）</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-medium">品質</td>
                  <td className="p-3 md:p-4 text-center">経験範囲内</td>
                  <td className="p-3 md:p-4 text-center bg-blue-50 font-bold text-blue-600">複数専門家レベル</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-medium">テストカバレッジ</td>
                  <td className="p-3 md:p-4 text-center">60%</td>
                  <td className="p-3 md:p-4 text-center bg-blue-50 font-bold text-blue-600">95%</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-medium">運用コスト（年間）</td>
                  <td className="p-3 md:p-4 text-center">200万円</td>
                  <td className="p-3 md:p-4 text-center bg-blue-50 font-bold text-blue-600">80万円</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-medium">障害対応（年間）</td>
                  <td className="p-3 md:p-4 text-center">100万円</td>
                  <td className="p-3 md:p-4 text-center bg-blue-50 font-bold text-blue-600">20万円</td>
                </tr>
                <tr>
                  <td className="p-3 md:p-4 font-medium">引き継ぎコスト</td>
                  <td className="p-3 md:p-4 text-center">80万円</td>
                  <td className="p-3 md:p-4 text-center bg-blue-50 font-bold text-blue-600">10万円</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 md:p-8 text-center">
            <p className="text-lg mb-2">初期費用: +50万円（高い）</p>
            <p className="text-3xl md:text-4xl font-bold">3年間トータル: <span className="text-yellow-300">-960万円</span></p>
            <p className="text-blue-200 mt-2">圧倒的に安い</p>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case" className="py-16 md:py-24 bg-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium mb-2">CASE STUDY</p>
            <h2 className="text-2xl md:text-4xl font-bold">実際の事例</h2>
          </div>

          <div className="space-y-8">
            {/* Case 1 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-blue-600 text-white p-4 md:p-6">
                <p className="text-blue-200 text-sm mb-1">CASE 01</p>
                <h3 className="text-xl md:text-2xl font-bold">「安い開発会社」からの作り直し</h3>
              </div>
              <div className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="font-bold text-red-700 mb-2">Before（他社）</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>・AI開発会社に180万円で発注</li>
                      <li>・2ヶ月で完成、安くて満足</li>
                      <li>・運用3ヶ月後...月2回の障害</li>
                      <li>・セキュリティホール発見</li>
                      <li>・ドキュメントなく誰も触れない</li>
                      <li className="text-red-600 font-bold">・改修見積もり: 300万円</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="font-bold text-blue-700 mb-2">After（私たち）</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>・AI並走で全面再設計</li>
                      <li>・期間: 2.5ヶ月 / 費用: <strong>400万円</strong></li>
                      <li>・1年後: 障害発生ゼロ</li>
                      <li>・運用コスト: 18万→<strong>4万円/月</strong></li>
                      <li>・ドキュメント完備で新メンバー即戦力</li>
                      <li className="text-blue-600 font-bold">・機能追加が従来の1/3の工数</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-xl p-4">
                  <p className="font-bold mb-2">💬 クライアントの声</p>
                  <p className="text-slate-600 italic">
                    「最初の180万円は、ドブに捨てた。400万円は高いと思ったが、1年で元が取れた。何より、夜安心して眠れるのが大きい」
                  </p>
                </div>
              </div>
            </div>

            {/* Case 2 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-blue-600 text-white p-4 md:p-6">
                <p className="text-blue-200 text-sm mb-1">CASE 02</p>
                <h3 className="text-xl md:text-2xl font-bold">技術選定の重要性</h3>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-slate-600 mb-4">要件: ECサイトのバックエンド刷新</p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="font-bold text-slate-700 mb-2">他社見積もり</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>・ECS Fargate 構成</li>
                      <li>・開発: 1.5ヶ月 / <strong>220万円</strong></li>
                      <li>・運用: 月額12万円</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="font-bold text-blue-700 mb-2">私たちの提案</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>・AI並走で複数案を検証</li>
                      <li>・Lambda + API Gateway が最適と判断</li>
                      <li>・開発: 2ヶ月 / <strong>280万円</strong></li>
                      <li>・運用: <strong>月額2.5万円</strong></li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-4 text-center">
                  <p className="text-blue-200 mb-1">3年間の比較</p>
                  <p className="text-sm mb-2">他社: 220万 + 12万×36 = 652万円</p>
                  <p className="text-sm mb-2">私たち: 280万 + 2.5万×36 = 370万円</p>
                  <p className="text-2xl font-bold">差額: <span className="text-yellow-300">282万円の削減</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="service" className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium mb-2">SERVICE</p>
            <h2 className="text-2xl md:text-4xl font-bold">提供サービス</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">技術選定コンサルティング</h3>
              <p className="text-slate-600 text-sm mb-4">
                AIと並走で複数案を検証。3-5年のトータルコストシミュレーション。
              </p>
              <p className="text-blue-600 font-bold">3週間 / 50万円</p>
            </div>

            <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">アーキテクチャ設計</h3>
              <p className="text-slate-600 text-sm mb-4">
                現状システムの網羅的診断、改善案の多角的検証、AWS CDK による IaC設計。
              </p>
              <p className="text-blue-600 font-bold">1.5ヶ月 / 120万円〜</p>
            </div>

            <div className="border-2 border-blue-300 bg-blue-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">フルスタック開発</h3>
              <p className="text-slate-600 text-sm mb-4">
                要件定義〜テスト〜ドキュメントまで。テストカバレッジ90%以上保証。
              </p>
              <p className="text-blue-600 font-bold">2-3ヶ月 / 300万円〜</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full">人気</span>
            </div>

            <div className="border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">4</div>
              <h3 className="text-xl font-bold mb-2">品質診断</h3>
              <p className="text-slate-600 text-sm mb-4">
                AIによるコード網羅解析、セキュリティ脆弱性スキャン、改善提案レポート。
              </p>
              <p className="text-blue-600 font-bold">2週間 / 30万円</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target */}
      <section className="py-16 md:py-24 bg-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">こんな方に向いています</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">✓</span>
                <h3 className="font-bold text-lg text-green-700">おすすめの方</h3>
              </div>
              <ul className="space-y-2 text-slate-600">
                <li>• 「安かろう悪かろう」で失敗した経験がある</li>
                <li>• 長期的に運用するシステムを作りたい</li>
                <li>• 技術的負債を作りたくない</li>
                <li>• 本番障害で夜中に起こされたくない</li>
                <li>• エンジニアの引き継ぎリスクを減らしたい</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center">✕</span>
                <h3 className="font-bold text-lg text-red-700">向いていない方</h3>
              </div>
              <ul className="space-y-2 text-slate-600">
                <li>• とにかく安く・速く作りたい</li>
                <li>• 品質より初期費用を優先したい</li>
                <li>• 短期的に使い捨てるシステム</li>
                <li>• ドキュメントは不要と考えている</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-medium mb-2">FAQ</p>
            <h2 className="text-2xl md:text-4xl font-bold">よくある質問</h2>
          </div>

          <FAQAccordion />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            「速さより、質。」<br />
            AI並走で、従来の限界を超える。
          </h2>
          <p className="text-slate-300 mb-8">
            あなたのビジネスを、10年先も支えるシステムを作りませんか？
          </p>
          
          <div className="space-y-4">
            <a
              href="mailto:back-office@tentspace.net"
              className="block w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-lg"
            >
              まずは無料相談から
            </a>
            <p className="text-slate-400 text-sm">
              Email: back-office@tentspace.net<br />
              営業時間: 平日 10:00-18:00
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center text-sm">
        <p>© {new Date().getFullYear()} tent space Inc. All rights reserved.</p>
      </footer>
    </main>
  )
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: "なぜ、他のAI開発会社より高いのですか？",
      a: "私たちはAIを「作業員」ではなく「検証者」として使うからです。コード生成で時間短縮するのではなく、品質検証に時間をかけます。結果、初期費用は高くなりますが、障害対応・運用コスト・引き継ぎコストで圧倒的に元が取れます。"
    },
    {
      q: "本当に品質が高いと言えるのですか？",
      a: "まずは無料相談でお話をお聞かせください。具体的なプロジェクトがあれば、AIと並走でどのような品質向上が見込めるか、事例を交えてご説明します。"
    },
    {
      q: "開発期間は短縮されないのですか？",
      a: "実装自体は速くなります。でも、その分を品質検証に充てます。結果、従来と同程度の期間になりますが、品質は桁違いに高くなります。"
    },
    {
      q: "費用対効果を教えてください",
      a: "一般的に、初期費用は従来の1.2-1.5倍ですが、3年間のトータルコストは0.6-0.7倍になります。特に、障害対応コスト・運用最適化・引き継ぎコストの削減が大きいです。"
    },
    {
      q: "どんなプロジェクトに向いていますか？",
      a: "長期運用するシステム、ビジネスクリティカルなシステム、セキュリティが重要なシステムに最適です。短期的な使い捨てプロトタイプには向きません。"
    }
  ]

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">Q</span>
              <span className="font-medium text-slate-800">{faq.q}</span>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === index && (
            <div className="px-4 md:px-5 pb-4 md:pb-5">
              <div className="flex gap-3">
                <span className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">A</span>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

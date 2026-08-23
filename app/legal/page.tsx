"use client"

import { TentDoc } from "@/components/home/TentDoc"

export default function LegalPage() {
  return (
    <TentDoc
      label="legal"
      title="特定商取引法に基づく表記"
      meta={["最終更新: 2025年12月1日", "株式会社tent space"]}
      sections={[
        {
          id: "01",
          title: "事業者情報",
          rows: [
            ["販売事業者", "株式会社tent space"],
            ["運営責任者", "石井 絢子"],
            ["所在地", "〒355-0316 埼玉県比企郡小川町大字角山323"],
            ["電話番号", "070-8522-9335"],
            [
              "メールアドレス",
              <a key="mail" href="mailto:back-office@tentspace.net" className="tent-ul">
                back-office@tentspace.net
              </a>,
            ],
            [
              "ウェブサイト",
              <a key="site" href="https://tentspace.net" className="tent-ul">
                https://tentspace.net
              </a>,
            ],
          ],
        },
        {
          id: "02",
          title: "販売商品・サービス",
          list: [
            "ソフトウェア開発サービス",
            "ITコンサルティングサービス",
            "AI開発サービス",
            "Webアプリケーション開発",
          ],
        },
        {
          id: "03",
          title: "販売価格",
          content:
            "各サービスの価格については、お見積り時に提示させていただきます。契約書にて最終金額をご確認の上、お手続きください。",
        },
        {
          id: "04",
          title: "商品代金以外の必要料金",
          list: ["インターネット接続料金", "通信料金（お客様のご契約内容により異なります）"],
        },
        { id: "05", title: "支払方法", content: "銀行振込、クレジットカード決済" },
        { id: "06", title: "支払時期", content: "契約締結後、請求書発行日から30日以内" },
        {
          id: "07",
          title: "サービス提供時期",
          content: "契約締結後、個別に定めるスケジュールに従って提供いたします。",
        },
        {
          id: "08",
          title: "キャンセル・返金について",
          content:
            "サービスの性質上、着手後のキャンセル・返金は原則として承っておりません。ただし、当社の責に帰すべき事由によりサービス提供が不可能となった場合は、協議の上、適切に対応させていただきます。",
        },
        {
          id: "09",
          title: "免責事項",
          list: [
            "本サービスは現状有姿で提供され、特定目的への適合性を保証するものではありません",
            "サービス利用により生じた損害について、当社は一切の責任を負いません",
            "サービス内容は予告なく変更する場合があります",
          ],
        },
      ]}
    />
  )
}

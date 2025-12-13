"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GeneralSettingsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">一般設定</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            プロジェクト情報
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name" className="text-gray-700">
                プロジェクト名
              </Label>
              <Input
                id="project-name"
                type="text"
                value="tentspace-corporate"
                disabled
                className="bg-gray-50 text-gray-600 border-gray-200 mt-2"
              />
            </div>
            <div>
              <Label htmlFor="project-id" className="text-gray-700">
                プロジェクトID
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="project-id"
                  type="text"
                  value="zbgzvbcgjvnsgildrmta"
                  disabled
                  className="bg-gray-50 text-gray-600 border-gray-200"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText("zbgzvbcgjvnsgildrmta")}
                >
                  コピー
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, User } from "lucide-react"

interface UserRoleSelectProps {
  userId: string
  currentRole: string
  disabled?: boolean
}

export function UserRoleSelect({
  userId,
  currentRole,
  disabled = false,
}: UserRoleSelectProps) {
  const [role, setRole] = useState(currentRole)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleRoleChange = async (newRole: string) => {
    if (newRole === role) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role")
      }

      setRole(newRole)
      toast({
        title: "権限を更新しました",
        description: `ユーザーの権限を${newRole === "admin" ? "管理者" : "一般ユーザー"}に変更しました。`,
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "権限の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select
      value={role}
      onValueChange={handleRoleChange}
      disabled={disabled || isUpdating}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          {role === "admin" ? (
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-blue-600" />
              <span>管理者</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-gray-600" />
              <span>一般</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span>一般ユーザー</span>
          </div>
        </SelectItem>
        <SelectItem value="admin">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>管理者</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}


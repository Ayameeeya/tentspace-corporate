"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, MoreHorizontal, Eye, Edit, Ban } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserRoleSelect } from "@/components/user-role-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface User {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  role: string | null
  stripe_customer_id: string | null
  bio: string | null
  created_at: string | null
}

interface UserListTableProps {
  users: User[]
  currentUserId: string | undefined
}

function getInitials(name: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserListTable({ users, currentUserId }: UserListTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSuspendOpen, setIsSuspendOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    display_name: "",
    bio: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleViewDetail = (user: User) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      display_name: user.display_name || "",
      bio: user.bio || "",
    })
    setIsEditOpen(true)
  }

  const handleSuspend = (user: User) => {
    setSelectedUser(user)
    setIsSuspendOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedUser) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      toast({
        title: "更新完了",
        description: "ユーザー情報を更新しました。",
      })

      setIsEditOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "ユーザー情報の更新に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSuspendConfirm = async () => {
    if (!selectedUser) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/suspend`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to suspend user")
      }

      toast({
        title: "アカウントを停止しました",
        description: `${selectedUser.display_name}のアカウントを停止しました。`,
      })

      setIsSuspendOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error suspending user:", error)
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "アカウントの停止に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ユーザー</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>権限</TableHead>
              <TableHead>Stripe ID</TableHead>
              <TableHead>登録日</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  ユーザーが見つかりませんでした
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(user.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.display_name || "未設定"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {user.email || "未設定"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role || "user"}
                      disabled={user.id === currentUserId}
                    />
                  </TableCell>
                  <TableCell>
                    {user.stripe_customer_id ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {user.stripe_customer_id.slice(0, 12)}...
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">未連携</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("ja-JP")
                      : "不明"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetail(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          詳細を表示
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleSuspend(user)}
                          disabled={user.id === currentUserId}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          アカウントを停止
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 詳細表示ダイアログ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ユーザー詳細</DialogTitle>
            <DialogDescription>
              ユーザーの詳細情報を確認できます
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(selectedUser.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedUser.display_name || "未設定"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                  <div className="mt-2">
                    <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                      {selectedUser.role === "admin" ? "管理者" : "一般ユーザー"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">ユーザーID</Label>
                  <p className="font-mono text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">自己紹介</Label>
                  <p className="text-sm">{selectedUser.bio || "未設定"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stripe顧客ID</Label>
                  <p className="font-mono text-sm">
                    {selectedUser.stripe_customer_id || "未連携"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">登録日</Label>
                  <p className="text-sm">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleString("ja-JP")
                      : "不明"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
            <DialogDescription>
              ユーザー情報を編集します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">表示名</Label>
              <Input
                id="display_name"
                value={editForm.display_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, display_name: e.target.value })
                }
                placeholder="表示名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                placeholder="自己紹介を入力"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isUpdating}
            >
              キャンセル
            </Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* アカウント停止確認ダイアログ */}
      <AlertDialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アカウントを停止しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.display_name} のアカウントを停止します。
              このユーザーはログインできなくなります。
              この操作は取り消すことができます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendConfirm}
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? "停止中..." : "停止する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


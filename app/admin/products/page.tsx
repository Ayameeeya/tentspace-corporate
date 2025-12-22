import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// TODO: 実際のデータソースに置き換える
const products = [
  {
    id: "1",
    name: "ベーシックプラン",
    description: "個人向けの基本プラン",
    price: "¥1,000",
    status: "active",
    stock: "∞",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "プロプラン",
    description: "プロフェッショナル向けプラン",
    price: "¥5,000",
    status: "active",
    stock: "∞",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "エンタープライズプラン",
    description: "企業向けプラン",
    price: "¥20,000",
    status: "active",
    stock: "∞",
    createdAt: "2024-01-15",
  },
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">商品一覧</h2>
          <p className="text-muted-foreground">
            商品・プランの管理と編集ができます
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規商品を追加
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品リスト</CardTitle>
          <CardDescription>
            全ての商品とプランを確認・管理できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="商品名で検索..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">フィルター</Button>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>価格</TableHead>
                  <TableHead>在庫</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.description}
                    </TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {product.status === "active" ? "有効" : "無効"}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.createdAt}</TableCell>
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
                          <DropdownMenuItem>編集</DropdownMenuItem>
                          <DropdownMenuItem>複製</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              全 {products.length} 件中 1-{products.length} 件を表示
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                前へ
              </Button>
              <Button variant="outline" size="sm" disabled>
                次へ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


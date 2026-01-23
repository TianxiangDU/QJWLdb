import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { toast } from "@/hooks/use-toast"
import { authApi, setToken, setUser } from "@/services/api-client"
import { Database, Eye, EyeOff } from "lucide-react"

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(username, password),
    onSuccess: (data) => {
      const { accessToken, user } = data.data
      setToken(accessToken)
      setUser(user)
      toast({ title: "登录成功", variant: "success" })
      navigate("/")
    },
    onError: (error: any) => {
      toast({
        title: "登录失败",
        description: error.message || "用户名或密码错误",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast({ title: "请输入用户名和密码", variant: "destructive" })
      return
    }
    loginMutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">工程咨询数据中台</CardTitle>
          <CardDescription>请登录您的账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  disabled={loginMutation.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Loading size="sm" /> : "登录"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            默认账号：<code className="rounded bg-muted px-1">admin</code> / 
            <code className="rounded bg-muted px-1">admin123</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

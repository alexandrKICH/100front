"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, UserPlus, LogIn, Wifi, WifiOff } from "lucide-react"
import { authService } from "@/lib/database"
import { testConnection } from "@/lib/supabase"

interface User {
  id: string
  login: string
  name: string
  avatar: string
  status: string
  isOnline: boolean
}

interface AuthModalProps {
  isOpen: boolean
  onLogin: (user: User) => void
}

export function AuthModal({ isOpen, onLogin }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ login: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ login: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "online" | "offline">("checking")

  const checkConnection = async () => {
    setConnectionStatus("checking")
    const isConnected = await testConnection()
    setConnectionStatus(isConnected ? "online" : "offline")
  }

  useEffect(() => {
    if (isOpen) {
      checkConnection()
    }
  }, [isOpen])

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    if (!loginForm.login || !loginForm.password) {
      setError("Заполните все поля")
      setIsLoading(false)
      return
    }

    try {
      const user = await authService.login(loginForm.login, loginForm.password)
      const userData: User = {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar || `/placeholder.svg?height=40&width=40&query=${user.login}`,
        status: "online",
        isOnline: true,
      }
      onLogin(userData)
    } catch (error: any) {
      setError(error.message || "Ошибка входа")
    }

    setIsLoading(false)
  }

  const handleRegister = async () => {
    setIsLoading(true)
    setError("")

    if (!registerForm.login || !registerForm.password || !registerForm.confirmPassword) {
      setError("Заполните все поля")
      setIsLoading(false)
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Пароли не совпадают")
      setIsLoading(false)
      return
    }

    if (registerForm.login.length < 3) {
      setError("Логин должен содержать минимум 3 символа")
      setIsLoading(false)
      return
    }

    if (registerForm.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      setIsLoading(false)
      return
    }

    try {
      const user = await authService.register(registerForm.login, registerForm.password, `User_${registerForm.login}`)
      const userData: User = {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar || `/placeholder.svg?height=40&width=40&query=${user.login}`,
        status: "online",
        isOnline: true,
      }
      onLogin(userData)
    } catch (error: any) {
      setError(error.message || "Ошибка регистрации")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-white text-gray-900 w-[calc(100%-2rem)] sm:w-full max-w-md mx-auto h-auto rounded-2xl sm:rounded-lg border border-gray-200 p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center mb-2">
            <div className="flex flex-col items-center gap-2">
              <img src="/images/100gram-icon.png" alt="100GRAM" className="w-16 h-16 object-contain" />
              <span className="text-xl font-bold text-gray-900">100GRAM</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-center text-sm">Анонимный мессенджер</DialogDescription>

          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex items-center gap-2 text-xs">
              {connectionStatus === "checking" && (
                <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              )}
              {connectionStatus === "online" && <Wifi className="h-3 w-3 text-green-500" />}
              {connectionStatus === "offline" && <WifiOff className="h-3 w-3 text-red-500" />}
              <span
                className={
                  connectionStatus === "online"
                    ? "text-green-500"
                    : connectionStatus === "offline"
                      ? "text-red-500"
                      : "text-gray-500"
                }
              >
                {connectionStatus === "checking"
                  ? "Подключение..."
                  : connectionStatus === "online"
                    ? "База данных подключена"
                    : "Ошибка подключения к БД"}
              </span>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="login" className="data-[state=active]:bg-white">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white">
              Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="login" className="text-gray-700">
                Логин
              </Label>
              <Input
                id="login"
                value={loginForm.login}
                onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                placeholder="Введите логин"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="pr-10"
                  placeholder="Введите пароль"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-900"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <Button
              onClick={handleLogin}
              disabled={isLoading || connectionStatus === "offline"}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Вход...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Войти
                </div>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-6">
            <div>
              <Label htmlFor="reg-login" className="text-gray-700">
                Логин
              </Label>
              <Input
                id="reg-login"
                value={registerForm.login}
                onChange={(e) => setRegisterForm({ ...registerForm, login: e.target.value })}
                placeholder="Придумайте логин"
              />
            </div>

            <div>
              <Label htmlFor="reg-password" className="text-gray-700">
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="pr-10"
                  placeholder="Придумайте пароль"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-900"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-gray-700">
                Подтвердите пароль
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                placeholder="Повторите пароль"
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <Button
              onClick={handleRegister}
              disabled={isLoading || connectionStatus === "offline"}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Регистрация...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Зарегистрироваться
                </div>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {connectionStatus === "offline" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <WifiOff className="h-4 w-4" />
              <span>Нет подключения к базе данных</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Проверьте настройки Supabase в .env.local</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

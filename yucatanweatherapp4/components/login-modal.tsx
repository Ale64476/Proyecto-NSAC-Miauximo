"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: Language
}

export function LoginModal({ open, onOpenChange, language }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Login attempt:", { email, password, name })
    onOpenChange(false)
  }

  const t = translations[language]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? t.loginTitle : t.registerTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLogin ? t.loginDescription : t.registerDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t.fullName}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={language === "es" ? "Juan Pérez" : "John Doe"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t.email}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={language === "es" ? "correo@ejemplo.com" : "email@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              {t.password}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
            {isLogin ? t.loginSubmit : t.registerSubmit}
          </Button>
          <div className="text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
              {isLogin ? t.noAccount : t.hasAccount}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

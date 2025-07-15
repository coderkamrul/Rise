"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import UnifiedHeader from "@/components/UnifiedHeader"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage for immediate access
        localStorage.setItem("user", JSON.stringify(data.user))

        toast({
          title: "Success",
          description: "Logged in successfully!",
        })

        // Small delay to ensure cookie is set, then redirect
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 100)
      } else {
        toast({
          title: "Error",
          description: data.message || "Login failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-gradient-to-br from-white via-gray-100 to-white">
    <UnifiedHeader />
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <Image src="/logo.jpeg" alt="Discipline Pri" width={32} height={32} className="contain w-fit h-8 rounded self-center mb-4" />
          <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400">Sign in to continue your discipline journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full bg-red-500 hover:bg-red-600" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-red-400 hover:text-red-300">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

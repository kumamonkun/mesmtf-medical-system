"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
        toast.error("Login timed out. Please check your connection and try again.")
      }
    }, 10000) // 10 second timeout

    try {
      console.log('🚀 Starting login process...')
      console.log('📧 Email:', formData.email)
      console.log('🔒 Password length:', formData.password.length)
      
      const { error } = await signIn(formData.email, formData.password)
      
      console.log('🔄 SignIn function returned:', { hasError: !!error, errorMessage: error?.message })
      
      clearTimeout(timeout)
      
      if (error) {
        console.error('❌ Login failed:', error)
        toast.error("Login failed: " + (error.message || "Invalid email or password"))
      } else {
        console.log('✅ Login successful, redirecting to dashboard...')
        toast.success("Login successful!")
        console.log('🔄 Calling router.push("/dashboard")...')
        router.push("/dashboard")
        console.log('✅ Router.push called')
      }
    } catch (error) {
      clearTimeout(timeout)
      console.error('💥 Login exception:', error)
      toast.error("An unexpected error occurred: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      console.log('🏁 Setting isLoading to false')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            autoComplete="current-password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>


      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !formData.email || !formData.password}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            <span>Signing in...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </div>
        )}
      </Button>

      {/* Demo credentials */}
      <Card className="mt-4">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground mb-2">Demo Credentials:</p>
          <div className="text-xs space-y-1">
            <p>
              <strong>Email:</strong> demo@mesmtf.com
            </p>
            <p>
              <strong>Password:</strong> demo123
            </p>
            <p className="text-muted-foreground">
              Role will be determined by your profile
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New user message */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          New to MESMTF?{" "}
          <span className="text-primary font-medium">
            Switch to the Sign Up tab to create your account
          </span>
        </p>
      </div>
    </form>
  )
}

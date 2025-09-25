"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Shield, Users, LogIn, UserPlus, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { testSupabaseConnection } from "@/lib/test-supabase"
import { useEffect } from "react"
import { PWAInstallPrompt } from "@/components/pwa/install-prompt"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("login")
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false)
  const { signInAnonymously } = useAuth()
  const router = useRouter()

  // Test Supabase connection on component mount
  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const handleAnonymousLogin = async () => {
    setIsAnonymousLoading(true)
    try {
      const { error } = await signInAnonymously()
      if (error) {
        toast.error("Anonymous login failed: " + error.message)
      } else {
        toast.success("Welcome! You're now browsing as a guest.")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsAnonymousLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MESMTF</h1>
                <p className="text-sm text-muted-foreground">Medical Expert System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Ministry of Health</p>
              <p className="text-xs text-muted-foreground">& Social Services</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 lg:py-6 min-h-[calc(100vh-120px)]">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left side - Hero content */}
          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-2 lg:space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
                Advanced Medical Expert System for <span className="text-primary">Malaria & Typhoid Fever</span>
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground text-pretty leading-relaxed">
                Empowering healthcare professionals with AI-driven diagnosis, treatment planning, and comprehensive
                patient care management.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-2 lg:gap-3">
              <div className="flex items-start space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-card border">
                <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">AI Diagnosis</h3>
                  <p className="text-xs text-muted-foreground">Expert system for accurate diagnosis</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-card border">
                <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Patient Management</h3>
                  <p className="text-xs text-muted-foreground">Comprehensive medical records</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-card border">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Secure Access</h3>
                  <p className="text-xs text-muted-foreground">Role-based authentication</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-card border">
                <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Real-time Reports</h3>
                  <p className="text-xs text-muted-foreground">Comprehensive analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md max-h-[calc(100vh-140px)] overflow-y-auto sticky top-4">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">
                  {activeTab === "login" ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-sm">
                  {activeTab === "login" 
                    ? "Sign in to access the medical expert system" 
                    : "Join the medical expert system platform"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="flex items-center space-x-2 text-sm">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </TabsTrigger>
                    <TabsTrigger value="register" className="flex items-center space-x-2 text-sm">
                      <UserPlus className="h-4 w-4" />
                      <span>Sign Up</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-4">
                    <LoginForm />
                  </TabsContent>
                  
                  <TabsContent value="register" className="mt-4">
                    <RegisterForm onSuccess={() => setActiveTab("login")} />
                  </TabsContent>
                </Tabs>

                {/* Anonymous Login Section */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-center space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Want to explore first?</h3>
                      <p className="text-xs text-muted-foreground">
                        Browse the system as a guest to see what MESMTF offers
                      </p>
                    </div>
                    <Button
                      onClick={handleAnonymousLogin}
                      disabled={isAnonymousLoading}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      {isAnonymousLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>Browse as Guest</span>
                        </div>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Limited access • No personal data required
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  Heart, 
  Users, 
  Shield, 
  Eye, 
  LogIn, 
  UserPlus,
  Info,
  Lock,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface GuestDashboardProps {
  user: {
    username: string
    role: string
    loginTime: string
    isAnonymous: boolean
  }
}

export function GuestDashboard({ user }: GuestDashboardProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const features = [
    {
      icon: Heart,
      title: "AI Diagnosis System",
      description: "Expert system for Malaria and Typhoid diagnosis",
      available: true,
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive medical records system",
      available: false,
    },
    {
      icon: Activity,
      title: "Real-time Reports",
      description: "Medical analytics and reporting",
      available: false,
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Role-based authentication system",
      available: false,
    },
  ]

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
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>Guest Mode</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to MESMTF, <span className="text-primary">Guest User</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're currently browsing in guest mode. This gives you limited access to explore 
              the Medical Expert System for Malaria and Typhoid Fever.
            </p>
          </div>
        </div>

        {/* Guest Notice */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Guest Mode:</strong> You have limited access to the system. 
            To access all features, please create an account or sign in.
          </AlertDescription>
        </Alert>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className={feature.available ? "" : "opacity-60"}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${feature.available ? 'bg-primary/10' : 'bg-muted'}`}>
                    <feature.icon className={`h-5 w-5 ${feature.available ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">{feature.title}</CardTitle>
                    {!feature.available && (
                      <Lock className="h-3 w-3 text-muted-foreground mt-1" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  {feature.description}
                </CardDescription>
                {!feature.available && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Requires Account
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* AI Diagnosis Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>AI Diagnosis Demo</span>
              </CardTitle>
              <CardDescription>
                Try the expert system for Malaria and Typhoid diagnosis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => router.push("/diagnosis")}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Try Diagnosis System
              </Button>
            </CardContent>
          </Card>

          {/* Create Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Get Full Access</span>
              </CardTitle>
              <CardDescription>
                Create an account to access all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => router.push("/")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push("/")}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>About MESMTF</CardTitle>
            <CardDescription>
              Medical Expert System for Malaria and Typhoid Fever
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">System Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI-powered diagnosis for Malaria and Typhoid</li>
                  <li>• Comprehensive patient management</li>
                  <li>• Drug administration tracking</li>
                  <li>• Medical reporting and analytics</li>
                  <li>• Role-based access control</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">User Roles</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Patients:</strong> Book appointments, view records</li>
                  <li>• <strong>Doctors:</strong> Diagnose, prescribe treatments</li>
                  <li>• <strong>Nurses:</strong> Assist in patient care</li>
                  <li>• <strong>Pharmacists:</strong> Manage medications</li>
                  <li>• <strong>Receptionists:</strong> Manage appointments</li>
                  <li>• <strong>Admins:</strong> System administration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

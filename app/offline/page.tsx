"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OfflinePage() {
  const router = useRouter()

  const handleRetry = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted rounded-full">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">You're Offline</h1>
          <p className="text-muted-foreground">
            MESMTF is working offline, but some features may be limited
          </p>
        </div>

        {/* Offline Status Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              Offline Mode Active
            </CardTitle>
            <CardDescription>
              You can still access previously loaded data
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ View patient records</p>
              <p>✅ Access medical history</p>
              <p>✅ Review appointments</p>
              <p>❌ New data sync (requires connection)</p>
              <p>❌ Real-time updates</p>
            </div>
          </CardContent>
        </Card>

        {/* Available Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Connection
          </Button>
          
          <Button 
            onClick={handleGoHome}
            className="w-full"
            variant="outline"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </div>

        {/* Offline Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Offline Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Data will sync automatically when connection is restored</p>
            <p>• You can continue working with cached data</p>
            <p>• Check your internet connection and try again</p>
            <p>• Some features require an active connection</p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>MESMTF - Medical Expert System</p>
          <p>Ministry of Health and Social Services</p>
        </div>
      </div>
    </div>
  )
}

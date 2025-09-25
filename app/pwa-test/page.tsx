"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Download, Wifi, WifiOff } from "lucide-react"

export default function PWATestPage() {
  const [pwaStatus, setPwaStatus] = useState({
    manifest: false,
    serviceWorker: false,
    installable: false,
    online: true
  })

  useEffect(() => {
    // Check if manifest is accessible
    fetch('/manifest.json')
      .then(res => res.json())
      .then(() => setPwaStatus(prev => ({ ...prev, manifest: true })))
      .catch(() => setPwaStatus(prev => ({ ...prev, manifest: false })))

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        setPwaStatus(prev => ({ ...prev, serviceWorker: registrations.length > 0 }))
      })
    }

    // Check online status
    setPwaStatus(prev => ({ ...prev, online: navigator.onLine }))

    // Check if PWA can be installed
    const checkInstallability = () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setPwaStatus(prev => ({ ...prev, installable: true }))
      }
    }

    checkInstallability()

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setPwaStatus(prev => ({ ...prev, installable: true }))
    })

    // Listen for online/offline events
    const updateOnlineStatus = () => {
      setPwaStatus(prev => ({ ...prev, online: navigator.onLine }))
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  const handleInstall = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)
        setPwaStatus(prev => ({ ...prev, serviceWorker: true }))
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">PWA Test Page</h1>
          <p className="text-muted-foreground">
            Test your Progressive Web App functionality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PWA Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                PWA Status
              </CardTitle>
              <CardDescription>
                Current PWA functionality status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Manifest</span>
                {pwaStatus.manifest ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Service Worker</span>
                {pwaStatus.serviceWorker ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Installable</span>
                {pwaStatus.installable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span>Connection</span>
                {pwaStatus.online ? (
                  <div className="flex items-center text-green-500">
                    <Wifi className="h-4 w-4 mr-1" />
                    Online
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <WifiOff className="h-4 w-4 mr-1" />
                    Offline
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Test PWA functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleInstall} className="w-full">
                Register Service Worker
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full"
              >
                Reload Page
              </Button>
              <Button 
                onClick={() => window.open('/manifest.json', '_blank')} 
                variant="outline" 
                className="w-full"
              >
                Open Manifest
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Debug Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Platform:</strong> {navigator.platform}</p>
              <p><strong>Service Worker Support:</strong> {'serviceWorker' in navigator ? 'Yes' : 'No'}</p>
              <p><strong>Push Manager Support:</strong> {'PushManager' in window ? 'Yes' : 'No'}</p>
              <p><strong>Display Mode:</strong> {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

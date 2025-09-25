"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, WifiOff, Download, CheckCircle, XCircle } from "lucide-react"

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Check if app is installed/standalone
    const checkInstallStatus = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
      setIsStandalone(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches)
    }

    // Check if PWA can be installed
    const checkInstallability = () => {
      // Check if beforeinstallprompt event is supported
      setCanInstall('serviceWorker' in navigator && 'PushManager' in window)
    }

    // Initial checks
    updateOnlineStatus()
    checkInstallStatus()
    checkInstallability()

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Listen for app installation
    window.addEventListener('appinstalled', checkInstallStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      window.removeEventListener('appinstalled', checkInstallStatus)
    }
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <Download className="h-4 w-4 mr-2" />
          PWA Status
        </CardTitle>
        <CardDescription className="text-xs">
          Current app and connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Connection</span>
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Installation Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">App Mode</span>
          <Badge variant={isInstalled || isStandalone ? "default" : "secondary"} className="text-xs">
            {isInstalled || isStandalone ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Installed
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Browser
              </>
            )}
          </Badge>
        </div>

        {/* Installability Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Installable</span>
          <Badge variant={canInstall ? "default" : "secondary"} className="text-xs">
            {canInstall ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Yes
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                No
              </>
            )}
          </Badge>
        </div>

        {/* Service Worker Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Service Worker</span>
          <Badge variant={canInstall ? "default" : "secondary"} className="text-xs">
            {canInstall ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>

        {/* Status Summary */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {isInstalled || isStandalone 
              ? "Running as installed app with offline capabilities"
              : isOnline 
                ? "Running in browser with online features"
                : "Running offline with limited functionality"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function PWAFeatures() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">PWA Features</CardTitle>
        <CardDescription className="text-xs">
          Available when installed as an app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2 text-xs">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Offline access to patient data</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Faster loading times</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Home screen access</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Push notifications</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>App-like experience</span>
        </div>
      </CardContent>
    </Card>
  )
}

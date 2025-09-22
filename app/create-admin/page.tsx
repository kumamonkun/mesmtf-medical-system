"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function CreateAdminPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [adminCreated, setAdminCreated] = useState(false)
  const { signUp } = useAuth()

  const handleCreateAdmin = async () => {
    setIsCreating(true)
    try {
      const { error } = await signUp({
        email: 'admin@mesmtf.com',
        password: 'admin123456',
        username: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        phone: '+1234567890',
        address: 'Ministry of Health and Social Services'
      })

      if (error) {
        toast.error(`Failed to create admin: ${error.message}`)
      } else {
        setAdminCreated(true)
        toast.success('Admin account created successfully!')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Admin Account</CardTitle>
          <p className="text-muted-foreground">
            Create the system administrator account for MESMTF
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {adminCreated ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Admin account created successfully!</strong>
                <br />
                <br />
                <strong>Login Credentials:</strong>
                <br />
                Email: admin@mesmtf.com
                <br />
                Password: admin123456
                <br />
                <br />
                <a 
                  href="/" 
                  className="text-green-600 hover:text-green-800 underline"
                >
                  Click here to login
                </a>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This will create a new admin account with full system access.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Email</Label>
                    <div className="p-2 bg-muted rounded">admin@mesmtf.com</div>
                  </div>
                  <div>
                    <Label className="font-medium">Password</Label>
                    <div className="p-2 bg-muted rounded">admin123456</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Username</Label>
                    <div className="p-2 bg-muted rounded">admin</div>
                  </div>
                  <div>
                    <Label className="font-medium">Role</Label>
                    <div className="p-2 bg-muted rounded">Administrator</div>
                  </div>
                </div>
                <div className="text-sm">
                  <Label className="font-medium">Full Name</Label>
                  <div className="p-2 bg-muted rounded">System Administrator</div>
                </div>
              </div>

              <Button 
                onClick={handleCreateAdmin} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating Admin Account...' : 'Create Admin Account'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

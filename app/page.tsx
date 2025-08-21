"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login, signup, requestPasswordReset, getCurrentUser } from "@/lib/pocketbase"
import { useRouter } from "next/navigation"
import { Building2, Shield, TrendingUp, Users, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

export default function BankingLandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser as any)
      // Redirect based on user type
      if (currentUser.user_type === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [router])

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await login(email, password)

    if (result.success) {
      setUser(result.user)
      showAlert("success", "Welcome back! Redirecting to your dashboard...")

      // Redirect based on user type
      setTimeout(() => {
        if (result.user && result.user.user_type === "admin") {
          router.push("/admin")
        } else if (result.user) {
          router.push("/dashboard")
        }
      }, 1500)
    } else {
      showAlert("error", result.error || "Login failed. Please check your credentials.")
    }

    setIsLoading(false)
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const passwordConfirm = formData.get("passwordConfirm") as string

    if (password !== passwordConfirm) {
      showAlert("error", "Passwords do not match")
      setIsLoading(false)
      return
    }

    const userData = {
      email: formData.get("email") as string,
      password,
      passwordConfirm,
      username: formData.get("username") as string,
      name: formData.get("name") as string,
      birthday: formData.get("birthday") as string,
      place_of_residence: formData.get("place_of_residence") as string,
      user_type: formData.get("user_type") as "client" | "admin",
    }

    const result = await signup(userData)

    if (result.success) {
      showAlert("success", "Account created successfully! Please login to continue.")
      setActiveTab("login")
    } else {
      showAlert("error", result.error || "Account creation failed. Please try again.")
    }

    setIsLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("reset-email") as string

    const result = await requestPasswordReset(email)

    if (result.success) {
      showAlert("success", "Password reset email sent! Check your inbox for instructions.")
    } else {
      showAlert("error", result.error || "Failed to send password reset email.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SecureBank Pro</h1>
                <p className="text-sm text-muted-foreground">Professional Banking Solutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Bank-Grade Security</span>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Secure Banking
                <span className="text-primary block">Made Simple</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience professional-grade financial management with bank-level security, comprehensive account
                oversight, and intuitive transaction management.
              </p>

              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Bank-Grade Security</h3>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Real-Time Analytics</h3>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Multi-User Access</h3>
                </div>
              </div>
            </div>

            <div className="max-w-md mx-auto w-full">
              {alert && (
                <Alert className={`mb-6 ${alert.type === "error" ? "border-destructive" : "border-primary"}`}>
                  {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Open Account</TabsTrigger>
                  <TabsTrigger value="reset">Reset Password</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Welcome Back</CardTitle>
                      <CardDescription>Sign in to access your secure banking dashboard</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email address"
                            required
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              required
                              className="h-12 pr-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 h-8 w-8 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                          {isLoading ? "Signing In..." : "Sign In Securely"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="signup">
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Open New Account</CardTitle>
                      <CardDescription>Join thousands of satisfied customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" placeholder="johndoe" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create password"
                                required
                                className="pr-12"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-2 h-6 w-6 p-0"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="passwordConfirm">Confirm Password</Label>
                            <div className="relative">
                              <Input
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                required
                                className="pr-12"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-2 h-6 w-6 p-0"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthday">Date of Birth</Label>
                          <Input id="birthday" name="birthday" type="date" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="place_of_residence">Address</Label>
                          <Input
                            id="place_of_residence"
                            name="place_of_residence"
                            placeholder="City, State, Country"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user_type">Account Type</Label>
                          <Select name="user_type" defaultValue="client">
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">Personal Account</SelectItem>
                              <SelectItem value="admin">Business Account</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                          {isLoading ? "Creating Account..." : "Open Account"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reset">
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Reset Password</CardTitle>
                      <CardDescription>Enter your email to receive reset instructions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email Address</Label>
                          <Input
                            id="reset-email"
                            name="reset-email"
                            type="email"
                            placeholder="Enter your email address"
                            required
                            className="h-12"
                          />
                        </div>
                        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                          {isLoading ? "Sending..." : "Send Reset Instructions"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

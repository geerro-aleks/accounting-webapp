"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calculator, LogOut, Save, Key, Trash2, ArrowLeft, UserIcon } from "lucide-react"
import { getCurrentUser, logout, updateProfile, changePassword, deleteAccount } from "@/lib/pocketbase"

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    setIsLoading(false)
  }, [router])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const profileData = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      birthday: formData.get("birthday") as string,
      place_of_residence: formData.get("place_of_residence") as string,
    }

    const result = await updateProfile(user.id, profileData)

    if (result.success) {
      setUser(result.user)
      alert("Profile updated successfully!")
    } else {
      alert("Error updating profile: " + result.error)
    }

    setIsSaving(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setIsChangingPassword(true)

    const formData = new FormData(e.currentTarget)
    const oldPassword = formData.get("oldPassword") as string
    const newPassword = formData.get("newPassword") as string
    const newPasswordConfirm = formData.get("newPasswordConfirm") as string

    if (newPassword !== newPasswordConfirm) {
      alert("New passwords don't match!")
      setIsChangingPassword(false)
      return
    }

    const result = await changePassword(user.id, oldPassword, newPassword, newPasswordConfirm)

    if (result.success) {
      alert("Password changed successfully!")
      e.currentTarget.reset()
    } else {
      alert("Error changing password: " + result.error)
    }

    setIsChangingPassword(false)
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)

    const result = await deleteAccount(user.id)

    if (result.success) {
      alert("Account deleted successfully!")
      router.push("/")
    } else {
      alert("Error deleting account: " + result.error)
      setIsDeletingAccount(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleBackToDashboard = () => {
    if (user?.user_type === "admin") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">Account Settings</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account preferences</p>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <AvatarInitials name={user?.name || ""} />
                    </AvatarFallback>
                  </Avatar>
                  <span>{user?.name}</span>
                  <Badge variant="secondary">{user?.user_type}</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBackToDashboard}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and account details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl">
                        <AvatarInitials name={user?.name || ""} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{user?.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">@{user?.username}</p>
                      <Badge variant="outline" className="mt-1">
                        {user?.user_type === "admin" ? "Administrator" : "Client Account"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" defaultValue={user?.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" defaultValue={user?.username} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" defaultValue={user?.email} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday">Birthday</Label>
                      <Input id="birthday" name="birthday" type="date" defaultValue={user?.birthday} required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="place_of_residence">Place of Residence</Label>
                      <Input
                        id="place_of_residence"
                        name="place_of_residence"
                        defaultValue={user?.place_of_residence}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Account Created</p>
                        <p className="font-medium">{user?.created ? formatDate(user.created) : "Unknown"}</p>
                      </div>
                      <Button type="submit" disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and account security</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Current Password</Label>
                      <Input id="oldPassword" name="oldPassword" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" name="newPassword" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
                      <Input id="newPasswordConfirm" name="newPasswordConfirm" type="password" required />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button type="submit" disabled={isChangingPassword}>
                      <Key className="h-4 w-4 mr-2" />
                      {isChangingPassword ? "Changing Password..." : "Change Password"}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-lg font-medium mb-2">Account Security</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Your account is secured with email and password authentication.
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✓ Account is secure and properly configured
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Once you delete your account, there is no going back. This will permanently delete your account
                      and remove all associated data including:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1 mb-4">
                      <li>All personal information and profile data</li>
                      <li>Transaction history and financial records</li>
                      <li>Bills and invoices</li>
                      <li>Account settings and preferences</li>
                    </ul>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeletingAccount}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeletingAccount ? "Deleting Account..." : "Delete Account"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove all your
                            data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                            Yes, delete my account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

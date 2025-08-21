import PocketBase from "pocketbase"

// Initialize PocketBase client
export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090")

// Types for our collections
export interface User {
  id: string
  username: string
  email: string
  name: string
  birthday: string
  place_of_residence: string
  user_type: "client" | "admin"
  created: string
  updated: string
  status?: string
  deactivated_at?: string
}

export interface Transaction {
  id: string
  user_id: string
  type: "deposit" | "withdrawal"
  amount: number
  description: string
  created: string
  updated: string
}

export interface Bill {
  id: string
  user_id: string
  title: string
  amount: number
  due_date: string
  status: "pending" | "paid" | "overdue"
  created: string
  updated: string
}

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  amount: number
  issue_date: string
  due_date: string
  status: "draft" | "sent" | "paid"
  created: string
  updated: string
}

// Auth helpers
export const getCurrentUser = () => {
  return pb.authStore.model as User | null
}

export const isAdmin = () => {
  const user = getCurrentUser()
  return user?.user_type === "admin"
}

export const isClient = () => {
  const user = getCurrentUser()
  return user?.user_type === "client"
}

// Auth functions
export const login = async (email: string, password: string) => {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password)

    // Log successful login for audit trail
    await logAuditEvent("login", authData.record.id, "User logged in successfully")

    return { success: true, user: authData.record }
  } catch (error: any) {
    // Log failed login attempt
    await logAuditEvent("login_failed", null, `Failed login attempt for email: ${email}`)
    return { success: false, error: error.message }
  }
}

export const signup = async (userData: {
  email: string
  password: string
  passwordConfirm: string
  username: string
  name: string
  birthday: string
  place_of_residence: string
  user_type: "client" | "admin"
}) => {
  try {
    const record = await pb.collection("users").create(userData)

    // Log account creation
    await logAuditEvent("account_created", record.id, "New account created")

    return { success: true, user: record }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const logout = () => {
  pb.authStore.clear()
}

// Account management functions
export const updateProfile = async (
  userId: string,
  profileData: {
    name: string
    username: string
    email: string
    birthday: string
    place_of_residence: string
  },
) => {
  try {
    const record = await pb.collection("users").update(userId, profileData)

    // Log profile update
    await logAuditEvent("profile_updated", userId, "User profile updated")

    return { success: true, user: record }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
) => {
  try {
    await pb.collection("users").update(userId, {
      oldPassword,
      password: newPassword,
      passwordConfirm: newPasswordConfirm,
    })

    // Log password change
    await logAuditEvent("password_changed", userId, "User password changed")

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteAccount = async (userId: string) => {
  try {
    await pb.collection("users").delete(userId)
    pb.authStore.clear()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const requestPasswordReset = async (email: string) => {
  try {
    await pb.collection("users").requestPasswordReset(email)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const confirmPasswordReset = async (passwordResetToken: string, password: string, passwordConfirm: string) => {
  try {
    await pb.collection("users").confirmPasswordReset(passwordResetToken, password, passwordConfirm)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const refreshAuth = async () => {
  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh()
      return { success: true, user: pb.authStore.model }
    }
    return { success: false, error: "No valid session" }
  } catch (error: any) {
    pb.authStore.clear()
    return { success: false, error: error.message }
  }
}

export const hasPermission = (requiredRole: "client" | "admin") => {
  const user = getCurrentUser()
  if (!user) return false

  if (requiredRole === "admin") {
    return user.user_type === "admin"
  }

  return user.user_type === "client" || user.user_type === "admin"
}

export const requireAuth = () => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export const requireRole = (role: "client" | "admin") => {
  const user = requireAuth()
  if (!hasPermission(role)) {
    throw new Error(`${role} role required`)
  }
  return user
}

export const logAuditEvent = async (action: string, userId: string | null, details: string) => {
  try {
    await pb.collection("audit_logs").create({
      action,
      user_id: userId,
      details,
      ip_address: "unknown", // Would be populated by server
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to log audit event:", error)
  }
}

export const deactivateAccount = async (userId: string) => {
  try {
    await pb.collection("users").update(userId, {
      status: "deactivated",
      deactivated_at: new Date().toISOString(),
    })

    // Log account deactivation
    await logAuditEvent("account_deactivated", userId, "User account deactivated")

    pb.authStore.clear()
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

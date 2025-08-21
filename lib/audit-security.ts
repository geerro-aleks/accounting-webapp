export interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  userType: "client" | "admin" | "system"
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  severity: "info" | "warning" | "critical"
  status: "success" | "failure"
  sessionId: string
}

export interface SecurityEvent {
  id: string
  timestamp: Date
  type: "login_attempt" | "failed_login" | "suspicious_activity" | "account_locked" | "password_change"
  userId?: string
  ipAddress: string
  details: Record<string, any>
  riskScore: number
  resolved: boolean
}

export interface SoftDeleteRecord {
  id: string
  tableName: string
  recordId: string
  deletedAt: Date
  deletedBy: string
  reason: string
  originalData: Record<string, any>
  canRestore: boolean
}

export class AuditSystem {
  private static logs: AuditLog[] = []
  private static securityEvents: SecurityEvent[] = []

  // Audit Logging
  static async logAction(
    userId: string,
    userType: "client" | "admin" | "system",
    action: string,
    resource: string,
    details: Record<string, any> = {},
    resourceId?: string,
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userType,
      action,
      resource,
      resourceId,
      details,
      ipAddress: this.getCurrentIP(),
      userAgent: this.getCurrentUserAgent(),
      severity: this.determineSeverity(action, resource),
      status: "success",
      sessionId: this.getCurrentSessionId(),
    }

    this.logs.push(auditLog)
    console.log("[Audit] Action logged:", auditLog)

    // Check for suspicious patterns
    await this.analyzeSuspiciousActivity(auditLog)
  }

  static async logFailure(
    userId: string,
    userType: "client" | "admin" | "system",
    action: string,
    resource: string,
    error: string,
    details: Record<string, any> = {},
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userType,
      action,
      resource,
      details: { ...details, error },
      ipAddress: this.getCurrentIP(),
      userAgent: this.getCurrentUserAgent(),
      severity: "warning",
      status: "failure",
      sessionId: this.getCurrentSessionId(),
    }

    this.logs.push(auditLog)
    console.log("[Audit] Failure logged:", auditLog)
  }

  static async getAuditLogs(
    filters: {
      userId?: string
      action?: string
      resource?: string
      severity?: string
      startDate?: Date
      endDate?: Date
    } = {},
    limit = 100,
  ): Promise<AuditLog[]> {
    let filteredLogs = [...this.logs]

    if (filters.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId)
    }
    if (filters.action) {
      filteredLogs = filteredLogs.filter((log) => log.action.includes(filters.action))
    }
    if (filters.resource) {
      filteredLogs = filteredLogs.filter((log) => log.resource === filters.resource)
    }
    if (filters.severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === filters.severity)
    }
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= filters.startDate!)
    }
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= filters.endDate!)
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
  }

  // Security Monitoring
  static async logSecurityEvent(
    type: SecurityEvent["type"],
    details: Record<string, any>,
    userId?: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      userId,
      ipAddress: this.getCurrentIP(),
      details,
      riskScore: this.calculateRiskScore(type, details),
      resolved: false,
    }

    this.securityEvents.push(event)
    console.log("[Security] Event logged:", event)

    // Auto-respond to high-risk events
    if (event.riskScore > 80) {
      await this.handleHighRiskEvent(event)
    }
  }

  static async getSecurityEvents(filters: { resolved?: boolean; type?: string } = {}): Promise<SecurityEvent[]> {
    let events = [...this.securityEvents]

    if (filters.resolved !== undefined) {
      events = events.filter((event) => event.resolved === filters.resolved)
    }
    if (filters.type) {
      events = events.filter((event) => event.type === filters.type)
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  static async resolveSecurityEvent(eventId: string, resolvedBy: string): Promise<void> {
    const event = this.securityEvents.find((e) => e.id === eventId)
    if (event) {
      event.resolved = true
      await this.logAction(resolvedBy, "admin", "Security Event Resolved", "security_event", {
        eventId,
        eventType: event.type,
      })
    }
  }

  // Fraud Detection
  private static async analyzeSuspiciousActivity(auditLog: AuditLog): Promise<void> {
    const recentLogs = this.logs.filter(
      (log) =>
        log.userId === auditLog.userId &&
        log.timestamp.getTime() > Date.now() - 60 * 60 * 1000 && // Last hour
        log.timestamp.getTime() < auditLog.timestamp.getTime(),
    )

    // Multiple failed login attempts
    if (auditLog.action === "login_attempt" && auditLog.status === "failure") {
      const failedLogins = recentLogs.filter((log) => log.action === "login_attempt" && log.status === "failure").length

      if (failedLogins >= 3) {
        await this.logSecurityEvent("failed_login", {
          userId: auditLog.userId,
          attemptCount: failedLogins + 1,
          ipAddress: auditLog.ipAddress,
        })
      }
    }

    // Large transaction patterns
    if (auditLog.action === "transaction_created" && auditLog.details.amount > 10000) {
      await this.logSecurityEvent("suspicious_activity", {
        userId: auditLog.userId,
        reason: "Large transaction",
        amount: auditLog.details.amount,
        transactionId: auditLog.resourceId,
      })
    }

    // Unusual access patterns
    const uniqueIPs = new Set(recentLogs.map((log) => log.ipAddress))
    if (uniqueIPs.size > 3) {
      await this.logSecurityEvent("suspicious_activity", {
        userId: auditLog.userId,
        reason: "Multiple IP addresses",
        ipCount: uniqueIPs.size,
      })
    }
  }

  private static async handleHighRiskEvent(event: SecurityEvent): Promise<void> {
    console.log("[Security] High-risk event detected:", event)

    // Auto-lock account for repeated failed logins
    if (event.type === "failed_login" && event.details.attemptCount >= 5) {
      await this.logSecurityEvent("account_locked", {
        userId: event.userId,
        reason: "Too many failed login attempts",
        lockedAt: new Date(),
      })
    }

    // Alert administrators
    await this.sendSecurityAlert(event)
  }

  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Mock alert system
    console.log("[Security Alert] High-risk security event:", {
      type: event.type,
      riskScore: event.riskScore,
      timestamp: event.timestamp,
      details: event.details,
    })
  }

  // Utility Functions
  private static determineSeverity(action: string, resource: string): "info" | "warning" | "critical" {
    const criticalActions = ["account_deleted", "admin_created", "security_settings_changed"]
    const warningActions = ["login_failed", "transaction_failed", "account_suspended"]

    if (criticalActions.some((a) => action.includes(a))) return "critical"
    if (warningActions.some((a) => action.includes(a))) return "warning"
    return "info"
  }

  private static calculateRiskScore(type: SecurityEvent["type"], details: Record<string, any>): number {
    let score = 0

    switch (type) {
      case "failed_login":
        score = Math.min(details.attemptCount * 20, 100)
        break
      case "suspicious_activity":
        score = 60
        break
      case "account_locked":
        score = 90
        break
      default:
        score = 30
    }

    return score
  }

  private static getCurrentIP(): string {
    // Mock IP detection
    return "192.168.1.100"
  }

  private static getCurrentUserAgent(): string {
    // Mock user agent
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }

  private static getCurrentSessionId(): string {
    // Mock session ID
    return "sess_" + Math.random().toString(36).substr(2, 9)
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

export class SoftDeleteSystem {
  private static deletedRecords: SoftDeleteRecord[] = []

  static async softDelete(
    tableName: string,
    recordId: string,
    deletedBy: string,
    reason: string,
    originalData: Record<string, any>,
  ): Promise<void> {
    const deleteRecord: SoftDeleteRecord = {
      id: this.generateId(),
      tableName,
      recordId,
      deletedAt: new Date(),
      deletedBy,
      reason,
      originalData,
      canRestore: true,
    }

    this.deletedRecords.push(deleteRecord)

    // Log the soft delete
    await AuditSystem.logAction(deletedBy, "admin", "Soft Delete", tableName, {
      recordId,
      reason,
      deleteId: deleteRecord.id,
    })

    console.log("[SoftDelete] Record soft deleted:", deleteRecord)
  }

  static async restore(deleteId: string, restoredBy: string): Promise<boolean> {
    const deleteRecord = this.deletedRecords.find((r) => r.id === deleteId)
    if (!deleteRecord || !deleteRecord.canRestore) {
      return false
    }

    // Mark as restored (in real implementation, would restore to database)
    deleteRecord.canRestore = false

    await AuditSystem.logAction(restoredBy, "admin", "Restore Record", deleteRecord.tableName, {
      recordId: deleteRecord.recordId,
      deleteId,
      originalDeletedBy: deleteRecord.deletedBy,
    })

    console.log("[SoftDelete] Record restored:", deleteRecord)
    return true
  }

  static async getDeletedRecords(tableName?: string): Promise<SoftDeleteRecord[]> {
    let records = [...this.deletedRecords]

    if (tableName) {
      records = records.filter((r) => r.tableName === tableName)
    }

    return records.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime())
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

export class ExportSystem {
  static async exportToCSV(data: any[], filename: string): Promise<string> {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            // Escape commas and quotes
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Mock file generation
    console.log(`[Export] CSV generated: ${filename}`)
    console.log("CSV Content:", csvContent)

    return csvContent
  }

  static async exportToPDF(data: any[], title: string, filename: string): Promise<void> {
    // Mock PDF generation
    console.log(`[Export] PDF generated: ${filename}`)
    console.log("PDF Data:", { title, recordCount: data.length, filename })

    // In real implementation, would use a PDF library like jsPDF or Puppeteer
    alert(`PDF export "${filename}" has been generated and will be emailed to you shortly.`)
  }

  static async exportAuditLogs(
    filters: Parameters<typeof AuditSystem.getAuditLogs>[0] = {},
    format: "csv" | "pdf" = "csv",
  ): Promise<void> {
    const logs = await AuditSystem.getAuditLogs(filters, 1000)

    const exportData = logs.map((log) => ({
      Timestamp: log.timestamp.toISOString(),
      User: log.userId,
      "User Type": log.userType,
      Action: log.action,
      Resource: log.resource,
      "Resource ID": log.resourceId || "",
      Severity: log.severity,
      Status: log.status,
      "IP Address": log.ipAddress,
      Details: JSON.stringify(log.details),
    }))

    const filename = `audit_logs_${new Date().toISOString().split("T")[0]}`

    if (format === "csv") {
      await this.exportToCSV(exportData, `${filename}.csv`)
    } else {
      await this.exportToPDF(exportData, "Audit Logs Report", `${filename}.pdf`)
    }
  }

  static async exportTransactionReport(transactions: any[], format: "csv" | "pdf" = "csv"): Promise<void> {
    const exportData = transactions.map((txn) => ({
      Date: new Date(txn.createdAt).toLocaleDateString(),
      "Transaction ID": txn.id,
      "Client ID": txn.clientId,
      Type: txn.type,
      Amount: txn.amount,
      Description: txn.description,
      Category: txn.category,
      Status: txn.status,
      "Account ID": txn.accountId,
    }))

    const filename = `transaction_report_${new Date().toISOString().split("T")[0]}`

    if (format === "csv") {
      await this.exportToCSV(exportData, `${filename}.csv`)
    } else {
      await this.exportToPDF(exportData, "Transaction Report", `${filename}.pdf`)
    }
  }
}

// Security Utilities
export class SecurityUtils {
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    return { valid: errors.length === 0, errors }
  }

  static generateSecureToken(length = 32): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static hashSensitiveData(data: string): string {
    // Mock hashing - in real implementation, use bcrypt or similar
    return `hash_${btoa(data).slice(0, 16)}`
  }

  static maskSensitiveData(data: string, visibleChars = 4): string {
    if (data.length <= visibleChars) return data
    return "*".repeat(data.length - visibleChars) + data.slice(-visibleChars)
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/['"]/g, "") // Remove quotes
      .trim()
  }
}

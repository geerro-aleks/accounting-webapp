"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuditSystem, ExportSystem, type AuditLog, type SecurityEvent } from "@/lib/audit-security"
import { Shield, AlertTriangle, Download, Search, Filter, Eye, Clock, User, Activity, FileText } from "lucide-react"

export function AuditDashboard() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAuditData()
  }, [])

  const loadAuditData = async () => {
    setIsLoading(true)
    try {
      // Generate some mock audit data
      await generateMockAuditData()

      const logs = await AuditSystem.getAuditLogs({}, 50)
      const events = await AuditSystem.getSecurityEvents()

      setAuditLogs(logs)
      setSecurityEvents(events)
    } catch (error) {
      console.error("Error loading audit data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockAuditData = async () => {
    // Generate mock audit logs
    await AuditSystem.logAction("user1", "client", "Login Successful", "authentication", {
      method: "password",
      ipAddress: "192.168.1.100",
    })

    await AuditSystem.logAction("admin1", "admin", "Client Account Created", "user_management", {
      newClientId: "client123",
      clientName: "John Doe",
    })

    await AuditSystem.logAction("user2", "client", "Transaction Created", "transaction", {
      amount: 1500,
      type: "withdrawal",
      accountId: "acc123",
    })

    await AuditSystem.logFailure("user3", "client", "Login Attempt", "authentication", "Invalid password", {
      attemptCount: 3,
    })

    // Generate mock security events
    await AuditSystem.logSecurityEvent("failed_login", {
      userId: "user3",
      attemptCount: 3,
      ipAddress: "192.168.1.200",
    })

    await AuditSystem.logSecurityEvent("suspicious_activity", {
      userId: "user2",
      reason: "Large transaction",
      amount: 15000,
    })
  }

  const handleExportAuditLogs = async (format: "csv" | "pdf") => {
    const filters = {
      ...(searchTerm && { action: searchTerm }),
      ...(severityFilter !== "all" && { severity: severityFilter }),
      ...(dateRange.start && { startDate: new Date(dateRange.start) }),
      ...(dateRange.end && { endDate: new Date(dateRange.end) }),
    }

    await ExportSystem.exportAuditLogs(filters, format)
  }

  const handleResolveSecurityEvent = async (eventId: string) => {
    await AuditSystem.resolveSecurityEvent(eventId, "admin1")
    await loadAuditData()
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return "bg-red-100 text-red-800"
    if (riskScore >= 50) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = searchTerm
      ? log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter

    const matchesDateRange =
      (!dateRange.start || log.timestamp >= new Date(dateRange.start)) &&
      (!dateRange.end || log.timestamp <= new Date(dateRange.end))

    return matchesSearch && matchesSeverity && matchesDateRange
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse mx-auto mb-4 text-emerald-600" />
          <p className="text-emerald-700">Loading audit dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Audit Logs</CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{auditLogs.length}</div>
            <p className="text-xs text-emerald-600">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{securityEvents.length}</div>
            <p className="text-xs text-emerald-600">{securityEvents.filter((e) => !e.resolved).length} unresolved</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Failed Actions</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {auditLogs.filter((log) => log.status === "failure").length}
            </div>
            <p className="text-xs text-emerald-600">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Active Users</CardTitle>
            <User className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {new Set(auditLogs.map((log) => log.userId)).size}
            </div>
            <p className="text-xs text-emerald-600">Unique users today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit-logs" className="space-y-6">
        <TabsList className="bg-white border border-emerald-100">
          <TabsTrigger
            value="audit-logs"
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
          >
            Audit Logs
          </TabsTrigger>
          <TabsTrigger
            value="security-events"
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
          >
            Security Events
          </TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs">
          <Card className="bg-white border-emerald-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-emerald-900">System Audit Logs</CardTitle>
                  <CardDescription>Complete record of all system activities</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportAuditLogs("csv")}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportAuditLogs("pdf")}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                  <Input
                    placeholder="Search logs by action, resource, or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-emerald-200 focus:border-emerald-500"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40 border-emerald-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="w-40 border-emerald-200"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="w-40 border-emerald-200"
                  />
                </div>
              </div>

              {/* Audit Logs Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-emerald-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2 text-emerald-500" />
                          {formatDateTime(log.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-emerald-900">{log.userId}</p>
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                            {log.userType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-emerald-700">{log.action}</TableCell>
                      <TableCell className="text-emerald-600">{log.resource}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-emerald-600">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="security-events">
          <Card className="bg-white border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-900">Security Events</CardTitle>
              <CardDescription>Monitor and respond to security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 border rounded-lg ${
                      event.resolved ? "border-emerald-100 bg-emerald-50" : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle
                            className={`h-5 w-5 ${event.resolved ? "text-emerald-600" : "text-yellow-600"}`}
                          />
                          <h3 className="font-semibold text-emerald-900">
                            {event.type.replace(/_/g, " ").toUpperCase()}
                          </h3>
                          <Badge className={getRiskColor(event.riskScore)}>Risk: {event.riskScore}/100</Badge>
                          {event.resolved && <Badge className="bg-emerald-100 text-emerald-800">Resolved</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-emerald-600">Timestamp</Label>
                            <p className="text-emerald-900">{formatDateTime(event.timestamp)}</p>
                          </div>
                          <div>
                            <Label className="text-emerald-600">IP Address</Label>
                            <p className="text-emerald-900">{event.ipAddress}</p>
                          </div>
                          {event.userId && (
                            <div>
                              <Label className="text-emerald-600">User ID</Label>
                              <p className="text-emerald-900">{event.userId}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-emerald-600">Details</Label>
                            <p className="text-emerald-900">{JSON.stringify(event.details)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!event.resolved && (
                          <Button
                            size="sm"
                            onClick={() => handleResolveSecurityEvent(event.id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Resolve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {securityEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-emerald-600">No security events detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Landmark,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Edit,
  Search,
  UserPlus,
  Download,
  Filter,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Bell,
  Eye,
  UserX,
  DollarSign,
  Plus,
} from "lucide-react"
import { getCurrentUser, logout } from "@/lib/pocketbase"

const mockClients = [
  {
    id: "1",
    name: "John Smith",
    username: "jsmith",
    email: "john.smith@email.com",
    status: "active",
    totalBalance: 15750.25,
    accountsCount: 3,
    lastLogin: "2024-01-15T10:30:00Z",
    created: "2023-06-15T09:00:00Z",
    birthday: "1985-03-20",
    place_of_residence: "New York, NY",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    username: "sjohnson",
    email: "sarah.johnson@email.com",
    status: "active",
    totalBalance: 42300.75,
    accountsCount: 2,
    lastLogin: "2024-01-14T16:45:00Z",
    created: "2023-08-22T14:20:00Z",
    birthday: "1990-07-12",
    place_of_residence: "Los Angeles, CA",
  },
  {
    id: "3",
    name: "Michael Brown",
    username: "mbrown",
    email: "michael.brown@email.com",
    status: "suspended",
    totalBalance: 8920.0,
    accountsCount: 1,
    lastLogin: "2024-01-10T08:15:00Z",
    created: "2023-11-05T11:30:00Z",
    birthday: "1988-12-03",
    place_of_residence: "Chicago, IL",
  },
]

const mockTransactions = [
  {
    id: "1",
    clientId: "1",
    clientName: "John Smith",
    date: "2024-01-15",
    description: "Wire Transfer - Salary",
    amount: 5500.0,
    type: "deposit",
    status: "completed",
    account: "Primary Checking",
    category: "Income",
    flagged: false,
  },
  {
    id: "2",
    clientId: "2",
    clientName: "Sarah Johnson",
    date: "2024-01-14",
    description: "Large Cash Withdrawal",
    amount: -9500.0,
    type: "withdrawal",
    status: "completed",
    account: "Business Savings",
    category: "Cash",
    flagged: true,
  },
  {
    id: "3",
    clientId: "1",
    clientName: "John Smith",
    date: "2024-01-13",
    description: "International Transfer",
    amount: -2500.0,
    type: "transfer",
    status: "pending",
    account: "Investment Account",
    category: "Transfer",
    flagged: false,
  },
]

const mockAuditLogs = [
  {
    id: "1",
    timestamp: "2024-01-15T14:30:00Z",
    user: "Admin User",
    action: "Client Account Created",
    details: "Created new client account for John Doe",
    severity: "info",
  },
  {
    id: "2",
    timestamp: "2024-01-15T13:15:00Z",
    user: "System",
    action: "Transaction Flagged",
    details: "Large withdrawal flagged for review - $9,500",
    severity: "warning",
  },
  {
    id: "3",
    timestamp: "2024-01-15T12:00:00Z",
    user: "Admin User",
    action: "Account Suspended",
    details: "Suspended client account: Michael Brown",
    severity: "critical",
  },
]

export default function AdminBankingConsole() {
  const [user, setUser] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [transactionFilter, setTransactionFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false)
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isAdjustTransactionOpen, setIsAdjustTransactionOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const router = useRouter()

  const stats = {
    totalClients: mockClients.length,
    activeClients: mockClients.filter((c) => c.status === "active").length,
    totalBalance: mockClients.reduce((sum, client) => sum + client.totalBalance, 0),
    totalTransactions: mockTransactions.length,
    flaggedTransactions: mockTransactions.filter((t) => t.flagged).length,
    pendingTransactions: mockTransactions.filter((t) => t.status === "pending").length,
  }

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    if (currentUser.user_type !== "admin") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = clientFilter === "all" || client.status === clientFilter

    return matchesSearch && matchesFilter
  })

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.clientName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      transactionFilter === "all" ||
      (transactionFilter === "flagged" && transaction.flagged) ||
      (transactionFilter === "pending" && transaction.status === "pending") ||
      transaction.type === transactionFilter

    return matchesSearch && matchesFilter
  })

  const handleCreateClient = (e) => {
    e.preventDefault()
    alert("Client created successfully!")
    setIsCreateClientOpen(false)
  }

  const handleCreateInvoice = (e) => {
    e.preventDefault()
    alert("Invoice created successfully!")
    setIsCreateInvoiceOpen(false)
  }

  const handleAdjustTransaction = (e) => {
    e.preventDefault()
    alert("Transaction adjustment recorded!")
    setIsAdjustTransactionOpen(false)
    setSelectedTransaction(null)
  }

  const handleSuspendClient = (clientId) => {
    alert(`Client account suspended successfully!`)
  }

  const handleExportReport = (reportType) => {
    alert(`${reportType} report export initiated. You'll receive an email with the file shortly.`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Landmark className="h-12 w-12 animate-pulse mx-auto mb-4 text-emerald-600" />
          <p className="text-emerald-700">Loading admin console...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <Landmark className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-emerald-900">SecureBank Pro</h1>
                  <p className="text-sm text-emerald-600">Administrative Console</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({stats.flaggedTransactions})
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-emerald-50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        <AvatarInitials name={user?.name || ""} />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-emerald-900">{user?.name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800">Admin</Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">System Overview</h2>
              <p className="text-emerald-600">Monitor and manage your banking operations</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-white border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{stats.totalClients}</div>
                <p className="text-xs text-emerald-600">{stats.activeClients} active accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">System Balance</CardTitle>
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalBalance)}</div>
                <p className="text-xs text-emerald-600">Across all accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Flagged Transactions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{stats.flaggedTransactions}</div>
                <p className="text-xs text-emerald-600">Require review</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Pending Actions</CardTitle>
                <Clock className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{stats.pendingTransactions}</div>
                <p className="text-xs text-emerald-600">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="bg-white border border-emerald-100">
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Client Directory
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Transaction Oversight
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Bills & Invoices
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              System
            </TabsTrigger>
          </TabsList>

          {/* Client Directory Tab */}
          <TabsContent value="clients">
            <Card className="bg-white border-emerald-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-900">Client Directory</CardTitle>
                    <CardDescription>Search, filter, and manage client accounts</CardDescription>
                  </div>
                  <Dialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Client
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Client</DialogTitle>
                        <DialogDescription>Add a new client account to the system</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateClient} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input required />
                          </div>
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <Input type="password" required />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsCreateClientOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                            Create Client
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                    <Input
                      placeholder="Search clients by name, email, or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-40 border-emerald-200">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Accounts</TableHead>
                      <TableHead>Total Balance</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="hover:bg-emerald-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                <AvatarInitials name={client.name} />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-emerald-900">{client.name}</p>
                              <p className="text-sm text-emerald-600">{client.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                        </TableCell>
                        <TableCell className="text-emerald-700">{client.accountsCount}</TableCell>
                        <TableCell className="font-semibold text-emerald-900">
                          {formatCurrency(client.totalBalance)}
                        </TableCell>
                        <TableCell className="text-emerald-600">{formatDateTime(client.lastLogin)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedClient(client)}
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {client.status === "active" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                                  >
                                    <UserX className="h-3 w-3 mr-1" />
                                    Suspend
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Suspend Client Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to suspend {client.name}'s account? They will not be able to
                                      access their banking services until reactivated.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleSuspendClient(client.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Suspend Account
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction Oversight Tab */}
          <TabsContent value="transactions">
            <Card className="bg-white border-emerald-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-900">Transaction Oversight</CardTitle>
                    <CardDescription>Monitor and manage all system transactions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                    <SelectTrigger className="w-48 border-emerald-200">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="flagged">Flagged Only</SelectItem>
                      <SelectItem value="pending">Pending Only</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="withdrawal">Withdrawals</SelectItem>
                      <SelectItem value="transfer">Transfers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className={`hover:bg-emerald-50 ${transaction.flagged ? "bg-yellow-50" : ""}`}
                      >
                        <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                        <TableCell className="text-emerald-700">{transaction.clientName}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {transaction.flagged && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                            <span>{transaction.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            transaction.amount > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setIsAdjustTransactionOpen(true)
                            }}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills & Invoices Tab */}
          <TabsContent value="billing">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-emerald-900">Invoice Management</CardTitle>
                    <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Invoice
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Invoice</DialogTitle>
                          <DialogDescription>Generate an invoice for a client</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Client</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockClients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Amount</Label>
                              <Input type="number" step="0.01" placeholder="0.00" required />
                            </div>
                            <div className="space-y-2">
                              <Label>Due Date</Label>
                              <Input type="date" required />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea placeholder="Invoice description..." />
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                              Create Invoice
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-emerald-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-900">Service Fee - January</p>
                          <p className="text-sm text-emerald-600">John Smith</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-900">$150.00</p>
                          <Badge className="bg-emerald-100 text-emerald-800">Paid</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border border-emerald-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-900">Account Maintenance</p>
                          <p className="text-sm text-emerald-600">Sarah Johnson</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-900">$75.00</p>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900">Bill Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-emerald-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-900">Utility Payment</p>
                          <p className="text-sm text-emerald-600">Due: Jan 25, 2024</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 bg-transparent"
                          >
                            Mark Paid
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border border-emerald-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-900">Credit Card Payment</p>
                          <p className="text-sm text-emerald-600">Due: Feb 1, 2024</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="border-red-200 text-red-700 bg-transparent">
                            Reverse
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Financial Reports
                  </CardTitle>
                  <CardDescription>Generate comprehensive financial reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    onClick={() => handleExportReport("Ledger Summary")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Ledger Summary Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    onClick={() => handleExportReport("Cash Flow")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Cash Flow Analysis
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    onClick={() => handleExportReport("Client Balances")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Client Balance Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                    onClick={() => handleExportReport("Transaction Summary")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Transaction Summary
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription>Key performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-700">Monthly Growth</span>
                        <span className="text-lg font-bold text-emerald-900">+12.5%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-700">Active Accounts</span>
                        <span className="text-lg font-bold text-emerald-900">98.2%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-700">Transaction Volume</span>
                        <span className="text-lg font-bold text-emerald-900">$2.4M</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription>System activity and security logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {mockAuditLogs.map((log) => (
                      <div key={log.id} className="p-3 border border-emerald-100 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                              <span className="text-sm text-emerald-600">{formatDateTime(log.timestamp)}</span>
                            </div>
                            <p className="font-medium text-emerald-900">{log.action}</p>
                            <p className="text-sm text-emerald-600">{log.details}</p>
                            <p className="text-xs text-emerald-500">by {log.user}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    System Management
                  </CardTitle>
                  <CardDescription>Administrative tools and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    User Role Management
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    System Announcements
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    System Configuration
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Backup & Export
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Adjustment Dialog */}
      <Dialog open={isAdjustTransactionOpen} onOpenChange={setIsAdjustTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Adjustment</DialogTitle>
            <DialogDescription>
              {selectedTransaction && `Adjust transaction: ${selectedTransaction.description}`}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <form onSubmit={handleAdjustTransaction} className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium text-emerald-700">Original Amount</Label>
                    <p className="text-lg font-bold text-emerald-900">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-emerald-700">Client</Label>
                    <p className="text-emerald-900">{selectedTransaction.clientName}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adjustment Amount</Label>
                <Input type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Reason for Adjustment</Label>
                <Textarea placeholder="Explain the reason for this adjustment..." required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAdjustTransactionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Apply Adjustment
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

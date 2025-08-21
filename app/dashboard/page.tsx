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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Landmark,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Receipt,
  FileText,
  Download,
  Filter,
  Search,
  MessageCircle,
  HelpCircle,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Plus,
  DollarSign,
} from "lucide-react"
import { getCurrentUser, logout } from "@/lib/pocketbase"

const mockAccounts = [
  { id: "1", name: "Primary Checking", type: "checking", balance: 12450.75, accountNumber: "****1234" },
  { id: "2", name: "Business Savings", type: "savings", balance: 45230.2, accountNumber: "****5678" },
  { id: "3", name: "Investment Account", type: "investment", balance: 89750.0, accountNumber: "****9012" },
]

const mockTransactions = [
  {
    id: "1",
    date: "2024-01-15",
    description: "Direct Deposit - Salary",
    amount: 5500.0,
    type: "deposit",
    account: "Primary Checking",
    category: "Income",
  },
  {
    id: "2",
    date: "2024-01-14",
    description: "Transfer to Savings",
    amount: -1000.0,
    type: "transfer",
    account: "Primary Checking",
    category: "Transfer",
  },
  {
    id: "3",
    date: "2024-01-13",
    description: "Grocery Store",
    amount: -125.5,
    type: "withdrawal",
    account: "Primary Checking",
    category: "Food",
  },
  {
    id: "4",
    date: "2024-01-12",
    description: "Investment Dividend",
    amount: 250.0,
    type: "deposit",
    account: "Investment Account",
    category: "Investment",
  },
  {
    id: "5",
    date: "2024-01-11",
    description: "Utility Bill Payment",
    amount: -180.75,
    type: "withdrawal",
    account: "Primary Checking",
    category: "Utilities",
  },
]

const mockBills = [
  {
    id: "1",
    title: "Electric Bill",
    amount: 125.5,
    dueDate: "2024-01-25",
    status: "pending",
    company: "City Electric",
  },
  { id: "2", title: "Internet Service", amount: 89.99, dueDate: "2024-01-28", status: "paid", company: "FastNet ISP" },
  {
    id: "3",
    title: "Credit Card Payment",
    amount: 450.0,
    dueDate: "2024-02-01",
    status: "pending",
    company: "Chase Bank",
  },
]

export default function BankingDashboard() {
  const [user, setUser] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(mockAccounts[0])
  const [showBalance, setShowBalance] = useState(true)
  const [transactionFilter, setTransactionFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isPayBillDialogOpen, setIsPayBillDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    if (currentUser.user_type !== "client") {
      router.push("/admin")
      return
    }
    setUser(currentUser)
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

  const getTotalBalance = () => {
    return mockAccounts.reduce((sum, account) => sum + account.balance, 0)
  }

  const getFilteredTransactions = () => {
    let filtered = mockTransactions

    if (transactionFilter !== "all") {
      filtered = filtered.filter((t) => t.type === transactionFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  const handleTransfer = (e) => {
    e.preventDefault()
    // Mock transfer functionality
    alert("Transfer initiated successfully!")
    setIsTransferDialogOpen(false)
  }

  const handlePayBill = (e) => {
    e.preventDefault()
    // Mock bill payment functionality
    alert(`Payment of ${formatCurrency(selectedBill.amount)} to ${selectedBill.company} initiated!`)
    setIsPayBillDialogOpen(false)
    setSelectedBill(null)
  }

  const exportStatement = () => {
    // Mock export functionality
    alert("Statement export initiated. You'll receive an email with your PDF statement shortly.")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Landmark className="h-12 w-12 animate-pulse mx-auto mb-4 text-emerald-600" />
          <p className="text-emerald-700">Loading your banking dashboard...</p>
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
                  <p className="text-sm text-emerald-600">Personal Banking</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Support
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
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
              <h2 className="text-2xl font-bold text-emerald-900">Account Overview</h2>
              <p className="text-emerald-600">Manage your accounts and transactions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                {showBalance ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showBalance ? "Hide" : "Show"} Balances
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {mockAccounts.map((account) => (
              <Card
                key={account.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedAccount.id === account.id ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:bg-white"
                }`}
                onClick={() => setSelectedAccount(account)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      <CardTitle className="text-lg text-emerald-900">{account.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                      {account.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-emerald-900">
                      {showBalance ? formatCurrency(account.balance) : "••••••"}
                    </div>
                    <p className="text-sm text-emerald-600">{account.accountNumber}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="h-4 w-4 mr-2" />
                  Transfer Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Internal Transfer</DialogTitle>
                  <DialogDescription>Transfer money between your accounts</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Account</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} - {formatCurrency(account.balance)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Account</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" step="0.01" placeholder="0.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input placeholder="Transfer description" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Transfer
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Pay Bills
            </Button>

            <Button
              variant="outline"
              onClick={exportStatement}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Statement
            </Button>
          </div>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-white border border-emerald-100">
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="bills"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Bills & Payments
            </TabsTrigger>
            <TabsTrigger
              value="accounts"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Account Details
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900"
            >
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card className="bg-white border-emerald-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-900">Transaction History</CardTitle>
                    <CardDescription>View and filter your recent transactions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 border-emerald-200 focus:border-emerald-500"
                      />
                    </div>
                    <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                      <SelectTrigger className="w-40 border-emerald-200">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposits</SelectItem>
                        <SelectItem value="withdrawal">Withdrawals</SelectItem>
                        <SelectItem value="transfer">Transfers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredTransactions().map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-emerald-50">
                        <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {transaction.amount > 0 ? (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-500" />
                            )}
                            <span>{transaction.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-emerald-600">{transaction.account}</TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            transaction.amount > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bills">
            <Card className="bg-white border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-900">Bills & Payments</CardTitle>
                <CardDescription>Manage your upcoming bills and payment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg hover:bg-emerald-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-emerald-900">{bill.title}</h4>
                          <p className="text-sm text-emerald-600">{bill.company}</p>
                          <p className="text-sm text-gray-500">Due: {formatDate(bill.dueDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-emerald-900">{formatCurrency(bill.amount)}</p>
                          <Badge
                            variant={bill.status === "paid" ? "default" : "destructive"}
                            className={bill.status === "paid" ? "bg-emerald-100 text-emerald-800" : ""}
                          >
                            {bill.status}
                          </Badge>
                        </div>
                        {bill.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBill(bill)
                              setIsPayBillDialogOpen(true)
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card className="bg-white border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-900">Account Details</CardTitle>
                <CardDescription>Detailed information about your accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockAccounts.map((account) => (
                    <div key={account.id} className="p-4 border border-emerald-100 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-6 w-6 text-emerald-600" />
                          <div>
                            <h3 className="font-semibold text-emerald-900">{account.name}</h3>
                            <p className="text-sm text-emerald-600">{account.accountNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-900">{formatCurrency(account.balance)}</p>
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                            {account.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Statement
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Secure Messaging
                  </CardTitle>
                  <CardDescription>Send secure messages to our support team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-emerald-800">No active conversations</p>
                    </div>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-emerald-900 flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>Quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border border-emerald-100 rounded-lg hover:bg-emerald-50 cursor-pointer">
                      <p className="font-medium text-emerald-900">How do I transfer money between accounts?</p>
                    </div>
                    <div className="p-3 border border-emerald-100 rounded-lg hover:bg-emerald-50 cursor-pointer">
                      <p className="font-medium text-emerald-900">How do I set up automatic bill payments?</p>
                    </div>
                    <div className="p-3 border border-emerald-100 rounded-lg hover:bg-emerald-50 cursor-pointer">
                      <p className="font-medium text-emerald-900">How do I export my account statements?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isPayBillDialogOpen} onOpenChange={setIsPayBillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Bill</DialogTitle>
            <DialogDescription>
              {selectedBill && `Pay ${formatCurrency(selectedBill.amount)} to ${selectedBill.company}`}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <form onSubmit={handlePayBill} className="space-y-4">
              <div className="space-y-2">
                <Label>Pay From Account</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-emerald-900">Amount to Pay:</span>
                  <span className="text-xl font-bold text-emerald-900">{formatCurrency(selectedBill.amount)}</span>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPayBillDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay Bill
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

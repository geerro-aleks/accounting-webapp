"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BankingOperations, type Bill, BankingUtils } from "@/lib/banking-operations"
import { Receipt, Calendar, DollarSign, CheckCircle, Clock } from "lucide-react"

interface BillPaymentSystemProps {
  clientId: string
  accounts: Array<{ id: string; name: string; balance: number }>
}

export function BillPaymentSystem({ clientId, accounts }: BillPaymentSystemProps) {
  const [bills, setBills] = useState<Bill[]>([
    {
      id: "1",
      clientId,
      title: "Electric Bill",
      company: "City Electric",
      amount: 125.5,
      dueDate: new Date("2024-02-01"),
      status: "pending",
      category: "Utilities",
      autopay: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      clientId,
      title: "Internet Service",
      company: "FastNet ISP",
      amount: 89.99,
      dueDate: new Date("2024-01-28"),
      status: "pending",
      category: "Utilities",
      autopay: true,
      createdAt: new Date(),
    },
  ])

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [selectedAccount, setSelectedAccount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string } | null>(null)

  // New Bill Form
  const [newBill, setNewBill] = useState({
    title: "",
    company: "",
    amount: "",
    dueDate: "",
    category: "",
    autopay: false,
  })

  const handlePayBill = async (bill: Bill) => {
    if (!selectedAccount) {
      setPaymentResult({ success: false, message: "Please select an account for payment" })
      return
    }

    setIsProcessing(true)
    setPaymentResult(null)

    try {
      await BankingOperations.payBill(bill.id, selectedAccount)

      // Update bill status in local state
      setBills((prev) =>
        prev.map((b) =>
          b.id === bill.id ? { ...b, status: "paid" as const, paidAt: new Date(), accountId: selectedAccount } : b,
        ),
      )

      setPaymentResult({
        success: true,
        message: `Payment of ${BankingUtils.formatCurrency(bill.amount)} to ${bill.company} processed successfully`,
      })
      setSelectedBill(null)
    } catch (error) {
      setPaymentResult({
        success: false,
        message: error instanceof Error ? error.message : "Payment failed",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const bill = await BankingOperations.createBill({
        clientId,
        title: newBill.title,
        company: newBill.company,
        amount: Number.parseFloat(newBill.amount),
        dueDate: new Date(newBill.dueDate),
        category: newBill.category,
        autopay: newBill.autopay,
      })

      setBills((prev) => [...prev, bill])
      setNewBill({
        title: "",
        company: "",
        amount: "",
        dueDate: "",
        category: "",
        autopay: false,
      })

      setPaymentResult({
        success: true,
        message: "Bill created successfully",
      })
    } catch (error) {
      setPaymentResult({
        success: false,
        message: "Failed to create bill",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Bill Payment Interface */}
      <Card className="bg-white border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Bill Payment Center
          </CardTitle>
          <CardDescription>Manage and pay your bills</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentResult && (
            <Alert
              className={`mb-4 ${paymentResult.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
            >
              <AlertDescription className={paymentResult.success ? "text-emerald-800" : "text-red-800"}>
                {paymentResult.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg hover:bg-emerald-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900">{bill.title}</h4>
                    <p className="text-sm text-emerald-600">{bill.company}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-3 w-3 text-emerald-500" />
                      <span className="text-sm text-emerald-600">Due: {formatDate(bill.dueDate)}</span>
                      {bill.autopay && (
                        <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                          AutoPay
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-emerald-900">{BankingUtils.formatCurrency(bill.amount)}</p>
                    <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                  </div>
                  {bill.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedBill(bill)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Pay Now
                    </Button>
                  )}
                  {bill.status === "paid" && (
                    <div className="flex items-center text-emerald-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Paid</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Modal */}
          {selectedBill && (
            <div className="mt-6 p-4 border-2 border-emerald-200 rounded-lg bg-emerald-50">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Pay {selectedBill.title}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-emerald-700">Amount to Pay</Label>
                  <p className="text-2xl font-bold text-emerald-900">
                    {BankingUtils.formatCurrency(selectedBill.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-emerald-700">Pay From Account</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="border-emerald-200">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {BankingUtils.formatCurrency(account.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handlePayBill(selectedBill)}
                  disabled={isProcessing || !selectedAccount}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pay Bill
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBill(null)}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Bill */}
      <Card className="bg-white border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900">Add New Bill</CardTitle>
          <CardDescription>Set up a new bill for tracking and payment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBill} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bill Title</Label>
                <Input
                  placeholder="e.g., Electric Bill"
                  value={newBill.title}
                  onChange={(e) => setNewBill((prev) => ({ ...prev, title: e.target.value }))}
                  className="border-emerald-200 focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="e.g., City Electric"
                  value={newBill.company}
                  onChange={(e) => setNewBill((prev) => ({ ...prev, company: e.target.value }))}
                  className="border-emerald-200 focus:border-emerald-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newBill.amount}
                  onChange={(e) => setNewBill((prev) => ({ ...prev, amount: e.target.value }))}
                  className="border-emerald-200 focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="border-emerald-200 focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newBill.category}
                  onValueChange={(value) => setNewBill((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="border-emerald-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Loan">Loan Payment</SelectItem>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newBill.autopay}
                onCheckedChange={(checked) => setNewBill((prev) => ({ ...prev, autopay: checked }))}
              />
              <Label>Enable AutoPay</Label>
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Add Bill
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

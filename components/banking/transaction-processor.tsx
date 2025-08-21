"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BankingOperations, type Transaction, BankingUtils } from "@/lib/banking-operations"
import { AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react"

interface TransactionProcessorProps {
  accountId: string
  clientId: string
  onTransactionComplete?: (transaction: Transaction) => void
}

export function TransactionProcessor({ accountId, clientId, onTransactionComplete }: TransactionProcessorProps) {
  const [transactionType, setTransactionType] = useState<"deposit" | "withdrawal" | "transfer" | "payment">("deposit")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; transaction?: Transaction } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setResult(null)

    try {
      const transactionData = {
        accountId,
        clientId,
        type: transactionType,
        amount: Number.parseFloat(amount),
        description: description || `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} transaction`,
        category: category || "General",
        ...(transactionType === "transfer" && { toAccount }),
      }

      const transaction = await BankingOperations.processTransaction(transactionData)

      setResult({
        success: true,
        message: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} of ${BankingUtils.formatCurrency(transaction.amount)} processed successfully`,
        transaction,
      })

      // Reset form
      setAmount("")
      setDescription("")
      setCategory("")
      setToAccount("")

      onTransactionComplete?.(transaction)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Transaction failed",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-white border-emerald-100">
      <CardHeader>
        <CardTitle className="text-emerald-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Process Transaction
        </CardTitle>
        <CardDescription>Create and process banking transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {transactionType === "transfer" && (
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select value={toAccount} onValueChange={setToAccount}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acc1">Primary Checking (****1234)</SelectItem>
                  <SelectItem value="acc2">Business Savings (****5678)</SelectItem>
                  <SelectItem value="acc3">Investment Account (****9012)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Food">Food & Dining</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Transaction description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {result && (
            <Alert className={result.success ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={`ml-2 ${result.success ? "text-emerald-800" : "text-red-800"}`}>
                  {result.message}
                </AlertDescription>
              </div>
              {result.transaction && (
                <div className="mt-2 text-sm text-emerald-700">
                  <p>Transaction ID: {result.transaction.id}</p>
                  <p>Reference: {BankingUtils.generateTransactionReference()}</p>
                </div>
              )}
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isProcessing || !amount}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isProcessing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Process ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

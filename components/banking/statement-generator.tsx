"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BankingOperations, type AccountStatement, BankingUtils } from "@/lib/banking-operations"
import { FileText, Download } from "lucide-react"

interface StatementGeneratorProps {
  accountId: string
  accountName: string
}

export function StatementGenerator({ accountId, accountName }: StatementGeneratorProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statement, setStatement] = useState<AccountStatement | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateStatement = async () => {
    if (!startDate || !endDate) return

    setIsGenerating(true)
    try {
      const generatedStatement = await BankingOperations.generateStatement(
        accountId,
        new Date(startDate),
        new Date(endDate),
      )
      setStatement(generatedStatement)
    } catch (error) {
      console.error("Error generating statement:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadStatement = () => {
    if (!statement) return

    // Mock PDF generation
    alert("Statement PDF download initiated. You will receive an email with the statement shortly.")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-emerald-100">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Account Statement Generator
          </CardTitle>
          <CardDescription>Generate detailed account statements for any date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={handleGenerateStatement}
                disabled={!startDate || !endDate || isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isGenerating ? "Generating..." : "Generate Statement"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {statement && (
        <Card className="bg-white border-emerald-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-emerald-900">Account Statement</CardTitle>
                <CardDescription>
                  {accountName} • {statement.accountNumber} • {formatDate(statement.statementPeriod.start)} to{" "}
                  {formatDate(statement.statementPeriod.end)}
                </CardDescription>
              </div>
              <Button
                onClick={handleDownloadStatement}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Statement Summary */}
            <div className="grid md:grid-cols-4 gap-4 mb-6 p-4 bg-emerald-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-emerald-600">Opening Balance</p>
                <p className="text-lg font-bold text-emerald-900">
                  {BankingUtils.formatCurrency(statement.openingBalance)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-emerald-600">Total Deposits</p>
                <p className="text-lg font-bold text-emerald-700">
                  +{BankingUtils.formatCurrency(statement.summary.totalDeposits)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-emerald-600">Total Withdrawals</p>
                <p className="text-lg font-bold text-red-600">
                  -{BankingUtils.formatCurrency(statement.summary.totalWithdrawals)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-emerald-600">Closing Balance</p>
                <p className="text-lg font-bold text-emerald-900">
                  {BankingUtils.formatCurrency(statement.closingBalance)}
                </p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emerald-900">Transaction Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statement.transactions.map((transaction, index) => {
                    const runningBalance =
                      statement.openingBalance +
                      statement.transactions
                        .slice(0, index + 1)
                        .reduce((sum, t) => sum + (t.type === "deposit" ? t.amount : -t.amount), 0)

                    return (
                      <TableRow key={transaction.id} className="hover:bg-emerald-50">
                        <TableCell className="font-medium">{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.type === "deposit"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            transaction.type === "deposit" ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "deposit" ? "+" : "-"}
                          {BankingUtils.formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-900">
                          {BankingUtils.formatCurrency(runningBalance)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Statement Footer */}
            <div className="mt-6 pt-4 border-t border-emerald-100 text-sm text-emerald-600">
              <p>Statement generated on {formatDate(statement.generatedAt)}</p>
              <p>Total transactions: {statement.summary.transactionCount}</p>
              {statement.summary.totalFees > 0 && (
                <p>Total fees: {BankingUtils.formatCurrency(statement.summary.totalFees)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { SoftDeleteSystem, type SoftDeleteRecord } from "@/lib/audit-security"
import { RotateCcw, Eye, Archive } from "lucide-react"

export function SoftDeleteManager() {
  const [deletedRecords, setDeletedRecords] = useState<SoftDeleteRecord[]>([])
  const [tableFilter, setTableFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDeletedRecords()
  }, [])

  const loadDeletedRecords = async () => {
    setIsLoading(true)
    try {
      // Generate some mock deleted records
      await generateMockDeletedRecords()

      const records = await SoftDeleteSystem.getDeletedRecords()
      setDeletedRecords(records)
    } catch (error) {
      console.error("Error loading deleted records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockDeletedRecords = async () => {
    await SoftDeleteSystem.softDelete("users", "user123", "admin1", "Account closure requested by user", {
      name: "John Doe",
      email: "john.doe@email.com",
      accountType: "client",
    })

    await SoftDeleteSystem.softDelete("transactions", "txn456", "admin1", "Fraudulent transaction detected", {
      amount: 5000,
      type: "withdrawal",
      description: "Suspicious large withdrawal",
    })

    await SoftDeleteSystem.softDelete("bills", "bill789", "user123", "Bill cancelled by user", {
      title: "Internet Service",
      amount: 89.99,
      company: "FastNet ISP",
    })
  }

  const handleRestore = async (deleteId: string) => {
    const success = await SoftDeleteSystem.restore(deleteId, "admin1")
    if (success) {
      await loadDeletedRecords()
      alert("Record restored successfully!")
    } else {
      alert("Failed to restore record. It may no longer be restorable.")
    }
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTableColor = (tableName: string) => {
    switch (tableName) {
      case "users":
        return "bg-blue-100 text-blue-800"
      case "transactions":
        return "bg-green-100 text-green-800"
      case "bills":
        return "bg-purple-100 text-purple-800"
      case "invoices":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRecords = deletedRecords.filter((record) => {
    return tableFilter === "all" || record.tableName === tableFilter
  })

  const uniqueTables = Array.from(new Set(deletedRecords.map((r) => r.tableName)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Archive className="h-12 w-12 animate-pulse mx-auto mb-4 text-emerald-600" />
          <p className="text-emerald-700">Loading deleted records...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-white border-emerald-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-emerald-900 flex items-center">
              <Archive className="h-5 w-5 mr-2" />
              Soft Delete Manager
            </CardTitle>
            <CardDescription>Manage and restore soft-deleted records</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-48 border-emerald-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {uniqueTables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table.charAt(0).toUpperCase() + table.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-600">No deleted records found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>Deleted By</TableHead>
                <TableHead>Deleted At</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-emerald-50">
                  <TableCell>
                    <Badge className={getTableColor(record.tableName)}>{record.tableName}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-emerald-900">{record.recordId}</TableCell>
                  <TableCell className="text-emerald-700">{record.deletedBy}</TableCell>
                  <TableCell className="text-emerald-600">{formatDateTime(record.deletedAt)}</TableCell>
                  <TableCell className="text-emerald-600 max-w-xs truncate">{record.reason}</TableCell>
                  <TableCell>
                    <Badge
                      className={record.canRestore ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}
                    >
                      {record.canRestore ? "Restorable" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deleted Record Details</AlertDialogTitle>
                            <AlertDialogDescription>
                              Original data for {record.tableName} record {record.recordId}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="p-4 bg-emerald-50 rounded-lg">
                            <pre className="text-sm text-emerald-800 whitespace-pre-wrap">
                              {JSON.stringify(record.originalData, null, 2)}
                            </pre>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {record.canRestore && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Restore
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Restore Record</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to restore this {record.tableName} record? This will make it
                                active again in the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="p-4 bg-emerald-50 rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong className="text-emerald-700">Record ID:</strong>
                                  <p className="text-emerald-900">{record.recordId}</p>
                                </div>
                                <div>
                                  <strong className="text-emerald-700">Deleted By:</strong>
                                  <p className="text-emerald-900">{record.deletedBy}</p>
                                </div>
                                <div className="col-span-2">
                                  <strong className="text-emerald-700">Reason for Deletion:</strong>
                                  <p className="text-emerald-900">{record.reason}</p>
                                </div>
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRestore(record.id)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                Restore Record
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
        )}

        {/* Summary Statistics */}
        <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-900">{deletedRecords.length}</p>
              <p className="text-sm text-emerald-600">Total Deleted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">{deletedRecords.filter((r) => r.canRestore).length}</p>
              <p className="text-sm text-emerald-600">Restorable</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">{uniqueTables.length}</p>
              <p className="text-sm text-emerald-600">Tables Affected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">
                {deletedRecords.filter((r) => r.deletedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-emerald-600">Last 24 Hours</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

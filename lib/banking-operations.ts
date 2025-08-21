export interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "investment" | "credit"
  balance: number
  accountNumber: string
  routingNumber?: string
  interestRate?: number
  minimumBalance?: number
  status: "active" | "suspended" | "closed"
  clientId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  accountId: string
  clientId: string
  type: "deposit" | "withdrawal" | "transfer" | "payment" | "fee"
  amount: number
  description: string
  category: string
  status: "pending" | "completed" | "failed" | "cancelled"
  reference?: string
  fromAccount?: string
  toAccount?: string
  scheduledDate?: Date
  completedDate?: Date
  createdAt: Date
  metadata?: Record<string, any>
}

export interface Bill {
  id: string
  clientId: string
  title: string
  company: string
  amount: number
  dueDate: Date
  status: "pending" | "paid" | "overdue" | "cancelled"
  category: string
  accountId?: string
  autopay: boolean
  recurringType?: "monthly" | "quarterly" | "yearly"
  createdAt: Date
  paidAt?: Date
}

export interface Transfer {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number
  description: string
  status: "pending" | "completed" | "failed"
  scheduledDate: Date
  completedDate?: Date
  fee?: number
  exchangeRate?: number
  createdAt: Date
}

export class BankingOperations {
  // Account Management
  static async createAccount(clientId: string, accountData: Partial<Account>): Promise<Account> {
    const account: Account = {
      id: this.generateId(),
      name: accountData.name || "New Account",
      type: accountData.type || "checking",
      balance: accountData.balance || 0,
      accountNumber: this.generateAccountNumber(),
      routingNumber: "123456789",
      status: "active",
      clientId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...accountData,
    }

    // Mock API call
    console.log("[Banking] Account created:", account)
    return account
  }

  static async getAccountBalance(accountId: string): Promise<number> {
    // Mock balance calculation
    const transactions = await this.getAccountTransactions(accountId)
    return transactions.reduce((balance, transaction) => {
      switch (transaction.type) {
        case "deposit":
          return balance + transaction.amount
        case "withdrawal":
        case "payment":
        case "fee":
          return balance - transaction.amount
        case "transfer":
          return transaction.fromAccount === accountId ? balance - transaction.amount : balance + transaction.amount
        default:
          return balance
      }
    }, 0)
  }

  static async getAccountTransactions(accountId: string, limit = 50): Promise<Transaction[]> {
    // Mock transaction data
    return [
      {
        id: "1",
        accountId,
        clientId: "client1",
        type: "deposit",
        amount: 5000,
        description: "Direct Deposit - Salary",
        category: "Income",
        status: "completed",
        completedDate: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        accountId,
        clientId: "client1",
        type: "withdrawal",
        amount: 150,
        description: "ATM Withdrawal",
        category: "Cash",
        status: "completed",
        completedDate: new Date("2024-01-14"),
        createdAt: new Date("2024-01-14"),
      },
    ]
  }

  // Transaction Processing
  static async processTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.generateId(),
      accountId: transactionData.accountId!,
      clientId: transactionData.clientId!,
      type: transactionData.type!,
      amount: transactionData.amount!,
      description: transactionData.description || "Transaction",
      category: transactionData.category || "General",
      status: "pending",
      createdAt: new Date(),
      ...transactionData,
    }

    // Validate transaction
    const validation = await this.validateTransaction(transaction)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Process based on type
    switch (transaction.type) {
      case "withdrawal":
        await this.processWithdrawal(transaction)
        break
      case "deposit":
        await this.processDeposit(transaction)
        break
      case "transfer":
        await this.processTransfer(transaction)
        break
      case "payment":
        await this.processPayment(transaction)
        break
    }

    transaction.status = "completed"
    transaction.completedDate = new Date()

    console.log("[Banking] Transaction processed:", transaction)
    return transaction
  }

  static async validateTransaction(transaction: Transaction): Promise<{ valid: boolean; error?: string }> {
    // Check account exists and is active
    if (!transaction.accountId) {
      return { valid: false, error: "Account ID is required" }
    }

    // Check sufficient funds for withdrawals
    if (transaction.type === "withdrawal" || transaction.type === "transfer") {
      const balance = await this.getAccountBalance(transaction.accountId)
      if (balance < transaction.amount) {
        return { valid: false, error: "Insufficient funds" }
      }
    }

    // Check daily limits
    const dailyLimit = await this.getDailyTransactionLimit(transaction.accountId)
    const todayTotal = await this.getTodayTransactionTotal(transaction.accountId)
    if (todayTotal + transaction.amount > dailyLimit) {
      return { valid: false, error: "Daily transaction limit exceeded" }
    }

    return { valid: true }
  }

  private static async processWithdrawal(transaction: Transaction): Promise<void> {
    // Apply withdrawal fees if applicable
    const fee = await this.calculateWithdrawalFee(transaction)
    if (fee > 0) {
      await this.processTransaction({
        accountId: transaction.accountId,
        clientId: transaction.clientId,
        type: "fee",
        amount: fee,
        description: "Withdrawal Fee",
        category: "Fee",
      })
    }
  }

  private static async processDeposit(transaction: Transaction): Promise<void> {
    // Handle deposit holds for large amounts
    if (transaction.amount > 10000) {
      transaction.status = "pending"
      transaction.metadata = { holdReason: "Large deposit verification" }
    }
  }

  private static async processTransfer(transaction: Transaction): Promise<void> {
    if (!transaction.toAccount) {
      throw new Error("Transfer destination account required")
    }

    // Create corresponding credit transaction
    await this.processTransaction({
      accountId: transaction.toAccount,
      clientId: transaction.clientId,
      type: "deposit",
      amount: transaction.amount,
      description: `Transfer from ${transaction.fromAccount}`,
      category: "Transfer",
      reference: transaction.id,
    })
  }

  private static async processPayment(transaction: Transaction): Promise<void> {
    // Handle bill payments and external transfers
    const paymentFee = await this.calculatePaymentFee(transaction)
    if (paymentFee > 0) {
      await this.processTransaction({
        accountId: transaction.accountId,
        clientId: transaction.clientId,
        type: "fee",
        amount: paymentFee,
        description: "Payment Processing Fee",
        category: "Fee",
      })
    }
  }

  // Bill Management
  static async createBill(billData: Partial<Bill>): Promise<Bill> {
    const bill: Bill = {
      id: this.generateId(),
      clientId: billData.clientId!,
      title: billData.title!,
      company: billData.company!,
      amount: billData.amount!,
      dueDate: billData.dueDate!,
      status: "pending",
      category: billData.category || "General",
      autopay: billData.autopay || false,
      createdAt: new Date(),
      ...billData,
    }

    console.log("[Banking] Bill created:", bill)
    return bill
  }

  static async payBill(billId: string, accountId: string): Promise<Transaction> {
    // Mock bill lookup
    const bill = await this.getBill(billId)
    if (!bill) {
      throw new Error("Bill not found")
    }

    if (bill.status === "paid") {
      throw new Error("Bill already paid")
    }

    // Process payment transaction
    const transaction = await this.processTransaction({
      accountId,
      clientId: bill.clientId,
      type: "payment",
      amount: bill.amount,
      description: `Bill Payment - ${bill.title}`,
      category: "Bill Payment",
      reference: billId,
    })

    // Update bill status
    bill.status = "paid"
    bill.paidAt = new Date()
    bill.accountId = accountId

    console.log("[Banking] Bill paid:", bill)
    return transaction
  }

  static async getBill(billId: string): Promise<Bill | null> {
    // Mock bill data
    return {
      id: billId,
      clientId: "client1",
      title: "Electric Bill",
      company: "City Electric",
      amount: 125.5,
      dueDate: new Date("2024-02-01"),
      status: "pending",
      category: "Utilities",
      autopay: false,
      createdAt: new Date("2024-01-01"),
    }
  }

  // Transfer Operations
  static async createTransfer(transferData: Partial<Transfer>): Promise<Transfer> {
    const transfer: Transfer = {
      id: this.generateId(),
      fromAccountId: transferData.fromAccountId!,
      toAccountId: transferData.toAccountId!,
      amount: transferData.amount!,
      description: transferData.description || "Internal Transfer",
      status: "pending",
      scheduledDate: transferData.scheduledDate || new Date(),
      createdAt: new Date(),
      ...transferData,
    }

    // Validate transfer
    const fromBalance = await this.getAccountBalance(transfer.fromAccountId)
    if (fromBalance < transfer.amount) {
      throw new Error("Insufficient funds for transfer")
    }

    // Process debit transaction
    await this.processTransaction({
      accountId: transfer.fromAccountId,
      clientId: "client1", // Would get from account
      type: "transfer",
      amount: transfer.amount,
      description: transfer.description,
      category: "Transfer",
      fromAccount: transfer.fromAccountId,
      toAccount: transfer.toAccountId,
      reference: transfer.id,
    })

    transfer.status = "completed"
    transfer.completedDate = new Date()

    console.log("[Banking] Transfer completed:", transfer)
    return transfer
  }

  // Statement Generation
  static async generateStatement(accountId: string, startDate: Date, endDate: Date): Promise<AccountStatement> {
    const transactions = await this.getAccountTransactions(accountId)
    const filteredTransactions = transactions.filter((t) => t.createdAt >= startDate && t.createdAt <= endDate)

    const openingBalance =
      (await this.getAccountBalance(accountId)) -
      filteredTransactions.reduce((sum, t) => sum + (t.type === "deposit" ? t.amount : -t.amount), 0)

    const closingBalance = await this.getAccountBalance(accountId)

    const statement: AccountStatement = {
      accountId,
      accountNumber: await this.getAccountNumber(accountId),
      statementPeriod: { start: startDate, end: endDate },
      openingBalance,
      closingBalance,
      transactions: filteredTransactions,
      summary: {
        totalDeposits: filteredTransactions.filter((t) => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0),
        totalWithdrawals: filteredTransactions
          .filter((t) => t.type === "withdrawal")
          .reduce((sum, t) => sum + t.amount, 0),
        totalFees: filteredTransactions.filter((t) => t.type === "fee").reduce((sum, t) => sum + t.amount, 0),
        transactionCount: filteredTransactions.length,
      },
      generatedAt: new Date(),
    }

    console.log("[Banking] Statement generated:", statement)
    return statement
  }

  // Utility Functions
  static async getDailyTransactionLimit(accountId: string): Promise<number> {
    // Mock daily limit based on account type
    return 10000 // $10,000 daily limit
  }

  static async getTodayTransactionTotal(accountId: string): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactions = await this.getAccountTransactions(accountId)
    return transactions
      .filter((t) => t.createdAt >= today && (t.type === "withdrawal" || t.type === "transfer"))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  static async calculateWithdrawalFee(transaction: Transaction): Promise<number> {
    // Mock fee calculation
    if (transaction.amount > 500) {
      return 2.5 // $2.50 fee for large withdrawals
    }
    return 0
  }

  static async calculatePaymentFee(transaction: Transaction): Promise<number> {
    // Mock payment fee
    return transaction.amount > 1000 ? 5.0 : 0
  }

  static async getAccountNumber(accountId: string): Promise<string> {
    // Mock account number lookup
    return `****${accountId.slice(-4)}`
  }

  static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  static generateAccountNumber(): string {
    return Math.random().toString().slice(2, 12)
  }

  // Interest Calculations
  static calculateInterest(balance: number, rate: number, days: number): number {
    return (balance * rate * days) / (365 * 100)
  }

  static calculateCompoundInterest(principal: number, rate: number, compoundFreq: number, time: number): number {
    return principal * Math.pow(1 + rate / (compoundFreq * 100), compoundFreq * time)
  }

  // Risk Assessment
  static assessTransactionRisk(transaction: Transaction): RiskAssessment {
    let riskScore = 0
    const flags: string[] = []

    // Large amount flag
    if (transaction.amount > 10000) {
      riskScore += 30
      flags.push("Large transaction amount")
    }

    // Unusual time flag
    const hour = new Date().getHours()
    if (hour < 6 || hour > 22) {
      riskScore += 20
      flags.push("Unusual transaction time")
    }

    // Frequent transactions flag
    // Would check recent transaction history

    const riskLevel = riskScore < 25 ? "low" : riskScore < 50 ? "medium" : "high"

    return {
      riskScore,
      riskLevel,
      flags,
      requiresReview: riskLevel === "high",
    }
  }
}

export interface AccountStatement {
  accountId: string
  accountNumber: string
  statementPeriod: { start: Date; end: Date }
  openingBalance: number
  closingBalance: number
  transactions: Transaction[]
  summary: {
    totalDeposits: number
    totalWithdrawals: number
    totalFees: number
    transactionCount: number
  }
  generatedAt: Date
}

export interface RiskAssessment {
  riskScore: number
  riskLevel: "low" | "medium" | "high"
  flags: string[]
  requiresReview: boolean
}

// Banking Utilities
export class BankingUtils {
  static formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  static formatAccountNumber(accountNumber: string, maskLength = 4): string {
    if (accountNumber.length <= maskLength) return accountNumber
    const masked = "*".repeat(accountNumber.length - maskLength)
    return masked + accountNumber.slice(-maskLength)
  }

  static validateRoutingNumber(routingNumber: string): boolean {
    if (!/^\d{9}$/.test(routingNumber)) return false

    // ABA routing number checksum validation
    const digits = routingNumber.split("").map(Number)
    const checksum =
      (3 * (digits[0] + digits[3] + digits[6]) +
        7 * (digits[1] + digits[4] + digits[7]) +
        1 * (digits[2] + digits[5] + digits[8])) %
      10

    return checksum === 0
  }

  static validateAccountNumber(accountNumber: string): boolean {
    return /^\d{8,17}$/.test(accountNumber)
  }

  static generateTransactionReference(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `TXN${timestamp}${random}`.toUpperCase()
  }

  static isBusinessDay(date: Date): boolean {
    const day = date.getDay()
    return day !== 0 && day !== 6 // Not Sunday (0) or Saturday (6)
  }

  static getNextBusinessDay(date: Date): Date {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    while (!this.isBusinessDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1)
    }

    return nextDay
  }

  static calculateBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0
    const current = new Date(startDate)

    while (current <= endDate) {
      if (this.isBusinessDay(current)) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }

    return count
  }
}

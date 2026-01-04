'use server'

import prisma from "../lib/prisma"
import { checkUser } from "@/lib/check-user"

export async function getMonthlyStats(year: number, month: number) {
  const user = await checkUser()
  // On ajoute le champ rollover à l'objet par défaut
  if (!user) return { expense: 0, income: 0, balance: 0, rollover: 0, categories: [] }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  try {
    // --- 1. Transactions du Mois en cours ---
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true,
        subCategory: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    const expenseTotal = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0)

    const incomeTotal = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0)

    const balance = incomeTotal - expenseTotal

    // --- 2. Calcul du Report (Historique avant ce mois) ---
    // On groupe par type (Revenu vs Dépense) pour tout ce qui est AVANT le 1er du mois
    const pastStats = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId: user.id,
        date: {
          lt: startDate // Strictement avant le début du mois
        }
      },
      _sum: {
        amount: true
      }
    })

    const pastIncome = pastStats.find(s => s.type === 'INCOME')?._sum.amount || 0
    const pastExpense = pastStats.find(s => s.type === 'EXPENSE')?._sum.amount || 0
    const rollover = pastIncome - pastExpense

    // --- 3. Groupement des catégories (pour le mois en cours) ---
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
    const categoryMap = new Map<string, any>()

    expenseTransactions.forEach(t => {
      const catId = t.categoryId
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: catId,
          name: t.category.name,
          icon: t.category.icon,
          total: 0,
          transactionCount: 0,
          transactions: []
        })
      }
      const current = categoryMap.get(catId)
      current.total += t.amount
      current.transactionCount += 1
      current.transactions.push(t)
    })

    const categories = Array.from(categoryMap.values()).sort((a: any, b: any) => b.total - a.total)

    return JSON.parse(JSON.stringify({
      expense: expenseTotal,
      income: incomeTotal,
      balance: balance, // Solde du mois pur
      rollover: rollover, // Report des mois précédents
      categories
    }))

  } catch (error) {
    console.error("Erreur calcul stats:", error)
    return { expense: 0, income: 0, balance: 0, rollover: 0, categories: [] }
  }
}
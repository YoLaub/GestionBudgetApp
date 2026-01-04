'use server'

import prisma from "../lib/prisma"
import { checkUser } from "@/lib/check-user"

export async function getMonthlyStats(year: number, month: number) {
  const user = await checkUser()
  if (!user) return { expense: 0, income: 0, balance: 0, categories: [] }

  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  try {
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
        subCategory: true // On récupère aussi le type pour l'affichage détaillé
      },
      orderBy: {
        date: 'desc' // Pour que la liste détaillée soit triée
      }
    })

    const expenseTotal = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0)

    const incomeTotal = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0)

    const balance = incomeTotal - expenseTotal

    // Groupement des Dépenses pour l'affichage
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
    const categoryMap = new Map<string, {
      categoryId: string
      name: string
      icon: string | null
      total: number
      transactionCount: number
      transactions: typeof expenseTransactions // Nouveau champ: la liste des transactions
    }>()

    expenseTransactions.forEach(t => {
      const catId = t.categoryId
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: catId,
          name: t.category.name,
          icon: t.category.icon,
          total: 0,
          transactionCount: 0,
          transactions: [] // Initialisation liste vide
        })
      }
      const current = categoryMap.get(catId)!
      current.total += t.amount
      current.transactionCount += 1
      current.transactions.push(t) // Ajout de la transaction à la liste
    })

    const categories = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total)

    return JSON.parse(JSON.stringify({
      expense: expenseTotal,
      income: incomeTotal,
      balance: balance,
      categories
    }))

  } catch (error) {
    console.error("Erreur calcul stats:", error)
    return { expense: 0, income: 0, balance: 0, categories: [] }
  }
}
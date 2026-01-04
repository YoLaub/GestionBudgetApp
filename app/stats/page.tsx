import Link from "next/link"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, ChevronDown } from "lucide-react"
import { getMonthlyStats } from "@/actions/stats"
import { BudgetCharts } from "@/components/charts/budget-charts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface StatsPageProps {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const params = await searchParams

  const now = new Date()
  const currentMonth = params.month ? parseInt(params.month) : now.getMonth() + 1
  const currentYear = params.year ? parseInt(params.year) : now.getFullYear()

  // Navigation
  const prevDate = new Date(currentYear, currentMonth - 2, 1)
  const nextDate = new Date(currentYear, currentMonth, 1)

  // Appel serveur
  const { expense, income, balance, categories } = await getMonthlyStats(currentYear, currentMonth)

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <main className="container mx-auto p-4 space-y-6 pb-24">
      
      {/* --- Header Mois --- */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/stats?month=${prevDate.getMonth() + 1}&year=${prevDate.getFullYear()}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold capitalize">{monthName}</h1>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/stats?month=${nextDate.getMonth() + 1}&year=${nextDate.getFullYear()}`}>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* --- 3 KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenus */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{income.toFixed(2)} €</div>
          </CardContent>
        </Card>

        {/* Dépenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{expense.toFixed(2)} €</div>
          </CardContent>
        </Card>

        {/* Solde */}
        <Card className={balance < 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Solde du mois</CardTitle>
            <Wallet className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
              {balance > 0 ? '+' : ''}{balance.toFixed(2)} €
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Liste détaillée (Avec Drill-down) --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Détails des dépenses</h3>
        <div className="grid gap-4">
          {categories.map((cat:any) => {
            const percentage = expense > 0 ? (cat.total / expense) * 100 : 0
            
            return (
              <Card key={cat.categoryId} className="overflow-hidden">
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <CardContent className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl bg-muted p-2 rounded-md w-10 h-10 flex items-center justify-center">
                          {cat.icon || "📦"}
                        </div>
                        <div>
                          <p className="font-semibold">{cat.name}</p>
                          <div className="flex items-center gap-2">
                             <p className="text-xs text-muted-foreground">{cat.transactionCount} opérations</p>
                             <ChevronDown className="h-3 w-3 text-muted-foreground group-open:rotate-180 transition-transform duration-200" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold">{cat.total.toFixed(2)} €</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <Progress value={percentage} className="h-2 w-16" />
                          <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </summary>
                  
                  {/* Liste des transactions détaillée (cachée par défaut) */}
                  <div className="bg-muted/30 border-t px-4 py-2 divide-y divide-border/50 text-sm">
                    {cat.transactions.map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-medium">{t.description}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>{format(new Date(t.date), "d MMM", { locale: fr })}</span>
                            {t.subCategory && (
                              <>
                                <span>•</span>
                                <span className="bg-muted px-1.5 rounded">{t.subCategory.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold tabular-nums">
                          -{t.amount.toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              </Card>
            )
          })}

          {categories.length === 0 && (
            <p className="text-center text-muted-foreground py-10">Aucune dépense enregistrée sur cette période.</p>
          )}
        </div>
      </div>

            {/* --- Graphiques (Dépenses uniquement) --- */}
      <BudgetCharts data={categories} totalExpenses={expense} />
    </main>
  )
}
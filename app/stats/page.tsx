import Link from "next/link"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, History, ChevronDown } from "lucide-react"
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

  const prevDate = new Date(currentYear, currentMonth - 2, 1)
  const nextDate = new Date(currentYear, currentMonth, 1)

  const { expense, income, balance, rollover, categories } = await getMonthlyStats(currentYear, currentMonth)
  
  // Solde Total disponible = Report + Solde du mois
  const totalBalance = rollover + balance

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <main className="container mx-auto p-4 space-y-6 pb-24">
      
      {/* Header Mois */}
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

      {/* --- KPI Cards avec Report --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Report N-1 */}
        <Card className="bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Report N-1</CardTitle>
            <History className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-lg font-bold ${rollover < 0 ? 'text-red-500' : 'text-blue-600'}`}>
              {rollover > 0 ? '+' : ''}{rollover.toFixed(2)} €
            </div>
          </CardContent>
        </Card>

        {/* Revenus */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Revenus</CardTitle>
            <TrendingUp className="h-3 w-3 text-green-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold text-green-600">+{income.toFixed(2)} €</div>
          </CardContent>
        </Card>

        {/* Dépenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Dépenses</CardTitle>
            <TrendingDown className="h-3 w-3 text-red-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-lg font-bold text-red-600">-{expense.toFixed(2)} €</div>
          </CardContent>
        </Card>

        {/* Solde CUMULÉ (La vraie richesse) */}
        <Card className={totalBalance < 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs font-medium text-foreground">Solde Cumulé</CardTitle>
            <Wallet className="h-3 w-3 text-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-lg font-bold ${totalBalance < 0 ? 'text-red-700' : 'text-green-700'}`}>
              {totalBalance > 0 ? '+' : ''}{totalBalance.toFixed(2)} €
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              (Mois: {(income - expense) > 0 ? '+' : ''}{(income - expense).toFixed(2)}€)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Graphiques --- */}
      <BudgetCharts data={categories} totalExpenses={expense} />

      {/* --- Liste détaillée --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Détails des dépenses</h3>
        <div className="grid gap-4">
          {categories.map((cat: any) => {
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
    </main>
  )
}
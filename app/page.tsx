import { getCategories } from "@/actions/categories"
import { getRecentTransactions } from "@/actions/transactions"
import { getMonthlyStats } from "@/actions/stats" // Import des stats
import { AddTransactionForm } from "@/components/forms/add-transaction-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react"

export default async function DashboardPage() {
  const now = new Date()
  
  // On charge tout en parallèle
  const [categories, transactions, stats] = await Promise.all([
    getCategories(),
    getRecentTransactions(),
    getMonthlyStats(now.getFullYear(), now.getMonth() + 1)
  ])

  return (
    <main className="container mx-auto p-4 space-y-8 pb-20">
      
      {/* En-tête avec Solde */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Budget</h1>
          <p className="text-muted-foreground">
             {format(now, 'MMMM yyyy', { locale: fr })}
          </p>
        </div>
        
        {/* Carte Résumé Rapide */}
        <Card className="w-full md:w-auto min-w-[300px] bg-primary text-primary-foreground">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Solde disponible</p>
              <p className="text-2xl font-bold">{stats.balance > 0 ? '+' : ''}{stats.balance.toFixed(2)} €</p>
            </div>
            <Wallet className="h-8 w-8 opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Mini Stat Bar */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowUpCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Revenus</p>
              <p className="font-bold text-green-600">+{stats.income.toFixed(2)} €</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowDownCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Dépenses</p>
              <p className="font-bold text-red-600">-{stats.expense.toFixed(2)} €</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLONNE GAUCHE : Ajout */}
        <div className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold mb-4">Nouvelle opération</h2>
            <AddTransactionForm categories={categories} />
          </section>
        </div>

        {/* COLONNE DROITE : Liste récente */}
        <div className="space-y-4">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Récent</h2>
              <a href="/stats" className="text-sm text-primary hover:underline">Voir tout</a>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune transaction.
                  </p>
                ) : (
                  <div className="divide-y">
                    {transactions.map((t:any) => (
                      <div key={t.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-xl bg-muted p-2 rounded-full w-10 h-10 flex items-center justify-center">
                            {t.category.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{t.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.category.name} 
                              {t.subCategory && ` • ${t.subCategory.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} {t.amount.toFixed(2)} €
                          </p>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {format(new Date(t.date), "d MMM", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
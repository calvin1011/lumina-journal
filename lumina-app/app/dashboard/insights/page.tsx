import { createClient } from '@/lib/supabase/server'
import MoodChart from '@/components/journal/MoodChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function InsightsPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: true })

  const chartData = entries?.map(entry => ({
    created_at: entry.created_at,
    mood_score: entry.sentiment?.sentiment?.score
      ? Math.round((entry.sentiment.sentiment.score + 1) * 5)
      : 5,
    sentiment_label: entry.sentiment?.sentiment?.label || 'neutral',
  })) || []

  const themeCount: Record<string, number> = {}
  entries?.forEach(entry => {
    entry.sentiment?.themes?.forEach((theme: string) => {
      themeCount[theme] = (themeCount[theme] || 0) + 1
    })
  })

  const topThemes = Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Your Insights</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MoodChart data={chartData} />

        <Card>
          <CardHeader>
            <CardTitle>Top Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topThemes.length > 0 ? (
                topThemes.map(([theme, count]) => (
                  <div key={theme} className="flex justify-between items-center">
                    <span className="font-medium capitalize">{theme}</span>
                    <span className="text-sm text-muted-foreground">{count} entries</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No themes yet. Start journaling!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type ChartData = {
  created_at: string;
  mood_score: number;
  sentiment_label: string;
};

export default function MoodChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-[350px] flex items-center justify-center bg-slate-50 border-dashed">
        <p className="text-muted-foreground text-sm">No mood data yet. Write your first entry!</p>
      </Card>
    );
  }

  const formattedData = data.map((entry) => ({
    date: format(new Date(entry.created_at), "MMM d"),
    fullDate: format(new Date(entry.created_at), "PPP p"),
    mood_score: entry.mood_score,
    sentiment_label: entry.sentiment_label,
  }));

  return (
    <Card className="col-span-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-800">
          Emotional Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your mood score (1-10) over time
        </p>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />

              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 10]}
                tickCount={6}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-sm">
                              {data.fullDate}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Mood Score
                            </span>
                            <span className="font-bold text-lg text-indigo-600">
                              {data.mood_score}/10
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Sentiment
                            </span>
                            <span className={`font-medium text-sm capitalize ${
                              data.sentiment_label === 'positive' 
                                ? 'text-green-600' 
                                : data.sentiment_label === 'negative'
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}>
                              {data.sentiment_label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="mood_score"
                stroke="#6366f1"
                strokeWidth={2}
                activeDot={{ r: 6, fill: "#4f46e5" }}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
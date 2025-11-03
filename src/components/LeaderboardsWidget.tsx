import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { fetchLeaderboards } from "@/lib/api";
import type { SeasonLeaderboards } from "@/data/leaderboards";

export default function LeaderboardsWidget({ stacked = false }: { stacked?: boolean }) {
  const [data, setData] = useState<SeasonLeaderboards | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const lb = await fetchLeaderboards();
      if (!mounted) return;
      setData(lb as SeasonLeaderboards);
    })();
    return () => { mounted = false; };
  }, []);

  const { batting, bowling } = data || { batting: [], bowling: [] };

  const Row = ({ idx, left, right }: { idx: number; left: React.ReactNode; right: React.ReactNode }) => (
    <div className="grid grid-cols-12 items-center py-2 border-b border-border last:border-0">
      <div className="col-span-1 text-sm text-muted-foreground">{idx}</div>
      <div className="col-span-7 font-medium">{left}</div>
      <div className="col-span-4 text-right font-semibold">{right}</div>
    </div>
  );

  const Orange = (
    <Card>
      <CardHeader>
        <CardTitle>Orange Cap • Most Runs</CardTitle>
        <CardDescription>Top 5 run-scorers</CardDescription>
      </CardHeader>
      <CardContent>
        {batting.map((p, i) => (
          <Row
            key={p.name}
            idx={i + 1}
            left={<div className="flex items-center gap-3"><span className="h-8 w-8 rounded-md bg-gradient-hero text-primary-foreground font-bold grid place-items-center">{p.team.slice(0,2)}</span><span>{p.name} <span className="text-muted-foreground">• {p.team}</span></span></div>}
            right={<span>{p.runs} <span className="text-muted-foreground text-sm">runs</span> <span className="text-xs text-muted-foreground">SR {p.strikeRate.toFixed(1)}</span></span>}
          />
        ))}
      </CardContent>
    </Card>
  );

  const Purple = (
    <Card>
      <CardHeader>
        <CardTitle>Purple Cap • Most Wickets</CardTitle>
        <CardDescription>Top 5 wicket-takers</CardDescription>
      </CardHeader>
      <CardContent>
        {bowling.map((p, i) => (
          <Row
            key={p.name}
            idx={i + 1}
            left={<div className="flex items-center gap-3"><span className="h-8 w-8 rounded-md bg-gradient-hero text-primary-foreground font-bold grid place-items-center">{p.team.slice(0,2)}</span><span>{p.name} <span className="text-muted-foreground">• {p.team}</span></span></div>}
            right={<span>{p.wickets} <span className="text-muted-foreground text-sm">wkts</span> <span className="text-xs text-muted-foreground">Eco {p.economy.toFixed(1)}</span></span>}
          />
        ))}
      </CardContent>
    </Card>
  );

  if (stacked) {
    return (
      <div className="space-y-6">
        {Orange}
        {Purple}
      </div>
    );
  }
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {Orange}
      {Purple}
    </div>
  );
}

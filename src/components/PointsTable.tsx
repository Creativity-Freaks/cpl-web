import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currentStandings } from "@/data/standings";

export default function PointsTable({ compact = false }: { compact?: boolean }) {
  const rows = [...currentStandings.table].sort((a, b) => b.points - a.points || b.nrr - a.nrr);

  return (
    <Card className={compact ? "" : "max-w-4xl mx-auto"}>
      <CardHeader>
        <CardTitle>Points Table</CardTitle>
        <CardDescription>{currentStandings.seasonTitle} • Sorted by Points, then Net Run Rate</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-right">NRR</TableHead>
              <TableHead className="text-right">Pts</TableHead>
              {!compact && <TableHead className="text-right">Last 5</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r.team} className="hover:bg-secondary/50">
                <TableCell className="font-semibold">{idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-md bg-gradient-hero text-primary-foreground font-bold grid place-items-center">
                      {r.team.slice(0,2)}
                    </span>
                    <span className="font-medium">{r.team}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{r.played}</TableCell>
                <TableCell className="text-center">{r.won}</TableCell>
                <TableCell className="text-center">{r.lost}</TableCell>
                <TableCell className="text-right">{r.nrr > 0 ? `+${r.nrr.toFixed(3)}` : r.nrr.toFixed(3)}</TableCell>
                <TableCell className="text-right font-semibold">{r.points}</TableCell>
                {!compact && (
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      {r.last5.map((x, i) => (
                        <span
                          key={i}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${x === "W" ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

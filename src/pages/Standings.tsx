import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currentStandings } from "@/data/standings";

const chip = (r: "W" | "L") => (
  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${r === "W" ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}>
    {r}
  </span>
);

const Standings = () => {
  const rows = [...currentStandings.table]
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Header */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          </div>
          <div className="container mx-auto px-4">
            <div className="pt-8 pb-8 md:pb-12 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Points Table</h1>
              <p className="mt-3 text-lg text-muted-foreground">{currentStandings.seasonTitle} • Live standings with NRR and form</p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Standings</CardTitle>
              <CardDescription>Sorted by Points, then Net Run Rate</CardDescription>
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
                    <TableHead className="text-right">Last 5</TableHead>
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
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">{r.last5.map((x, i) => <span key={i}>{chip(x)}</span>)}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Standings;

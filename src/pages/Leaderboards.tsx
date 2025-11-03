import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { currentLeaderboards } from "@/data/leaderboards";

const Row = ({ idx, left, right }: { idx: number; left: React.ReactNode; right: React.ReactNode }) => (
  <div className="grid grid-cols-12 items-center py-2 border-b border-border last:border-0">
    <div className="col-span-1 text-sm text-muted-foreground">{idx}</div>
    <div className="col-span-7 font-medium">{left}</div>
    <div className="col-span-4 text-right font-semibold">{right}</div>
  </div>
);

const Leaderboards = () => {
  const { batting, bowling, seasonTitle } = currentLeaderboards;
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
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Leaderboards</h1>
              <p className="mt-3 text-lg text-muted-foreground">{seasonTitle} • Orange & Purple Caps</p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8">
          {/* Orange Cap */}
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

          {/* Purple Cap */}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboards;

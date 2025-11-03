import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { departments, DepartmentKey } from "@/data/teams";
import { useEffect, useState } from "react";
import { fetchDepartmentTeam } from "@/lib/api";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Trophy } from "lucide-react";

const TeamDepartmentPage = () => {
  const { dept } = useParams<{ dept: DepartmentKey }>();
  const staticData = dept && departments[dept as DepartmentKey];
  const [data, setData] = useState(staticData || null);

  useEffect(() => {
    if (!dept) return;
    fetchDepartmentTeam(dept as DepartmentKey).then((dyn) => {
      if (dyn) setData(dyn);
    }).catch(() => void 0);
  }, [dept]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {!data ? (
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-3xl font-bold">Department not found</h1>
              <p className="text-muted-foreground">The team category you’re looking for doesn’t exist.</p>
              <Button asChild variant="outline">
                <Link to="/team"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Teams</Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    {data.short} <span className="text-accent">Team</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 max-w-2xl">{data.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="border-border">
                    <Link to="/team"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link>
                  </Button>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                <Card className="border-border animate-fade-in-up">
                  <CardContent className="p-6 flex items-center gap-3">
                    <Users className="h-6 w-6 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Players</p>
                      <p className="text-2xl font-bold">{data.players.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border animate-fade-in-up" style={{animationDelay: '0.05s'}}>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Captain</p>
                    <p className="text-lg font-semibold">{data.captain || 'TBD'}</p>
                  </CardContent>
                </Card>
                <Card className="border-border animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-lg font-semibold flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /> {data.achievements?.length || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Players */}
              <h2 className="text-2xl font-bold mb-4">Player List</h2>
              {data.players.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No players added yet. Player list will be shown here.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.players.map((p) => (
                    <Card key={p.id} className="border-border hover:shadow-glow transition-all">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={p.avatar || ''} alt={p.name} />
                            <AvatarFallback>{p.name.slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.session || 'Session N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="px-2 py-1 rounded bg-accent/10 text-accent">{p.role}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamDepartmentPage;

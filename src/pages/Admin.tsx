import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { Link } from "react-router-dom";
import { Shield, Users, Trophy, Gavel, LogOut, PlusCircle, CalendarPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

const AdminPage = () => {
  const { user, logout } = useAuth();
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [tournaments, setTournaments] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    Promise.all([
      supabase.from("teams").select("id,name,short_name").order("name"),
      supabase.from("tournaments").select("id,name").order("name"),
    ]).then(([t1, t2]) => {
      if (t1.data) setTeams(t1.data.map((t) => ({ id: t.id as string, name: (t.short_name || t.name) as string })));
      if (t2.data) setTournaments(t2.data.map((t) => ({ id: t.id as string, name: t.name as string })));
    }).catch(() => void 0);
  }, []);

  const [newTeam, setNewTeam] = useState({ name: "", short: "" });
  const createTeam = async () => {
    if (!isSupabaseConfigured) return toast.error("Supabase not configured");
    if (!newTeam.name.trim()) return toast.error("Enter team name");
    const { error } = await supabase.from("teams").insert({ name: newTeam.name, short_name: newTeam.short || null });
    if (error) return toast.error(error.message);
    toast.success("Team created");
    setNewTeam({ name: "", short: "" });
  };

  const [newMatch, setNewMatch] = useState<{ tournament_id: string; team_a: string; team_b: string; date: string; venue: string }>({ tournament_id: "", team_a: "", team_b: "", date: "", venue: "" });
  const scheduleMatch = async () => {
    if (!isSupabaseConfigured) return toast.error("Supabase not configured");
    const { tournament_id, team_a, team_b, date, venue } = newMatch;
    if (!tournament_id || !team_a || !team_b || !date) return toast.error("Fill all required fields");
    const { error } = await supabase.from("matches").insert({ tournament_id, team_a, team_b, match_date: new Date(date).toISOString(), venue, status: "upcoming" });
    if (error) return toast.error(error.message);
    toast.success("Match scheduled");
    setNewMatch({ tournament_id: "", team_a: "", team_b: "", date: "", venue: "" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center animate-fade-in-up">
            Admin <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in-up">
            Welcome {user?.name}. Manage tournaments, teams, and auctions.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /> Tournaments</CardTitle>
                <CardDescription>Create and manage tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-gradient-accent">Manage Tournaments</Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5 text-accent" /> Quick Create Team</CardTitle>
                <CardDescription>{isSupabaseConfigured ? "Create a team (name & short)" : "Supabase not configured"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Team Name</Label>
                    <Input value={newTeam.name} onChange={(e) => setNewTeam((s) => ({ ...s, name: e.target.value }))} placeholder="e.g., CSIT" />
                  </div>
                  <div>
                    <Label>Short</Label>
                    <Input value={newTeam.short} onChange={(e) => setNewTeam((s) => ({ ...s, short: e.target.value }))} placeholder="e.g., CSIT" />
                  </div>
                </div>
                <Button disabled={!isSupabaseConfigured} onClick={createTeam} className="bg-gradient-accent">Create Team</Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-accent" /> Registrations</CardTitle>
                <CardDescription>Review player registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">View Registrations</Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-accent" /> Schedule Match</CardTitle>
                <CardDescription>{isSupabaseConfigured ? "Pick tournament & teams" : "Supabase not configured"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Tournament</Label>
                  <select className="w-full border rounded p-2 bg-background" value={newMatch.tournament_id} onChange={(e) => setNewMatch((s) => ({ ...s, tournament_id: e.target.value }))}>
                    <option value="">Select...</option>
                    {tournaments.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Team A</Label>
                    <select className="w-full border rounded p-2 bg-background" value={newMatch.team_a} onChange={(e) => setNewMatch((s) => ({ ...s, team_a: e.target.value }))}>
                      <option value="">Select...</option>
                      {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <Label>Team B</Label>
                    <select className="w-full border rounded p-2 bg-background" value={newMatch.team_b} onChange={(e) => setNewMatch((s) => ({ ...s, team_b: e.target.value }))}>
                      <option value="">Select...</option>
                      {teams.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Date & Time</Label>
                    <Input type="datetime-local" value={newMatch.date} onChange={(e) => setNewMatch((s) => ({ ...s, date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <Input value={newMatch.venue} onChange={(e) => setNewMatch((s) => ({ ...s, venue: e.target.value }))} placeholder="e.g., Main Ground" />
                  </div>
                </div>
                <Button disabled={!isSupabaseConfigured} onClick={scheduleMatch} className="bg-gradient-accent">Schedule</Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-accent" /> Auction</CardTitle>
                <CardDescription>Hidden auction controls</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Link to="/admin/auction">
                  <Button className="bg-gradient-accent">Open Auction</Button>
                </Link>
                <span className="text-xs text-muted-foreground">(Only accessible by Admin)</span>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-accent" /> Account</CardTitle>
                <CardDescription>Admin session controls</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={logout} className="flex items-center gap-2"><LogOut className="h-4 w-4"/> Logout</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;

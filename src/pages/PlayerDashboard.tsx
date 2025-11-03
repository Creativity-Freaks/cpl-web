import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { LogOut, User, Trophy, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PlayerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center animate-fade-in-up">
            Player <span className="text-accent">Dashboard</span>
          </h1>
          <div className="flex flex-col items-center gap-3 mb-12 animate-fade-in-up">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{(user?.name || "P").slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
              Welcome {user?.name}. View your profile and upcoming matches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-accent"/> Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><span className="text-muted-foreground">Name:</span> {user?.name}</p>
                <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
                <p><span className="text-muted-foreground">Role:</span> {user?.role}</p>
                {user?.session && <p><span className="text-muted-foreground">Session:</span> {user.session}</p>}
                {user?.playerType && <p><span className="text-muted-foreground">Player Type:</span> {user.playerType}</p>}
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-accent"/> Upcoming Matches</CardTitle>
                <CardDescription>Your schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No matches scheduled yet.</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-accent"/> Performance</CardTitle>
                <CardDescription>Stats and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Stats coming soon.</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-glow transition-all animate-fade-in-up">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage your session</CardDescription>
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

export default PlayerDashboard;

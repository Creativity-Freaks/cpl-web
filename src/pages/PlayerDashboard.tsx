import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import { User, Trophy, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveProfileImageUrl } from "@/lib/api";

const PlayerDashboard = () => {
  const { user } = useAuth();
  const profileImage = user?.avatar ? resolveProfileImageUrl(user.avatar) : null;

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
                {user?.category && <p><span className="text-muted-foreground">Category:</span> {user.category}</p>}
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
              <CardContent className="grid grid-cols-2 gap-4">
                <p><span className="text-muted-foreground">Runs:</span> {user?.runs ?? 0}</p>
                <p><span className="text-muted-foreground">Batting SR:</span> {user?.battingStrikeRate ?? 0}</p>
                <p><span className="text-muted-foreground">Wickets:</span> {user?.wickets ?? 0}</p>
                <p><span className="text-muted-foreground">Bowling SR:</span> {user?.bowlingStrikeRate ?? 0}</p>
                <p><span className="text-muted-foreground">Overs Bowled:</span> {user?.oversBowled ?? 0}</p>
                <p><span className="text-muted-foreground">Runs Conceded:</span> {user?.totalRunsConceded ?? 0}</p>
              </CardContent>
            </Card>

            {/* Removed Actions card as requested */}
          </div>

          {/* Full profile image preview (from API) */}
          <div className="mt-10 animate-fade-in-up">
            <Card className="border-border overflow-hidden">
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Please upload a high resolution photo. This photo is use in auction  {"{filename}"}</CardDescription>
              </CardHeader>
              <CardContent>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full max-h-[70vh] object-contain rounded-lg shadow-glow"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={async (e) => {
                      const el = e.currentTarget as HTMLImageElement | null;
                      if (!el || !el.isConnected) return;
                      try {
                        const { fetchImageAsObjectUrl } = await import("@/lib/api");
                        const url = await fetchImageAsObjectUrl(el.src);
                        if (url && el.isConnected) { el.src = url; return; }
                      } catch { /* ignore */ }
                      if (el && el.isConnected) {
                        el.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No profile image uploaded yet.</p>
                )}
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

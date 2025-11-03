import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fetchDepartmentTeam } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Trophy } from "lucide-react";

const TeamDepartmentPage = () => {
  const { dept } = useParams<{ dept: string }>();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!dept) return;
    fetchDepartmentTeam(dept).then((dyn) => {
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
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamDepartmentPage;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Player = { id: number; name: string; basePrice: number; soldPrice?: number; team?: string };

const initialPlayers: Player[] = [
  { id: 1, name: "Player One", basePrice: 10000 },
  { id: 2, name: "Player Two", basePrice: 12000 },
  { id: 3, name: "Player Three", basePrice: 9000 },
];

const AuctionPage = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  const sellPlayer = (id: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, soldPrice: p.basePrice + 5000, team: "Code Warriors" } : p))
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center animate-fade-in-up">
            Auction <span className="text-accent">Control Room</span>
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in-up">
            Admin-only page for player auction (demo).
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player, idx) => (
              <Card key={player.id} className="border-border hover:shadow-glow transition-all animate-fade-in-up" style={{ animationDelay: `${idx * 0.08}s` }}>
                <CardHeader>
                  <CardTitle>{player.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Base Price: BDT {player.basePrice.toLocaleString()}</p>
                  {player.soldPrice ? (
                    <div>
                      <p className="text-foreground font-semibold">Sold to {player.team} for BDT {player.soldPrice.toLocaleString()}</p>
                    </div>
                  ) : (
                    <Button className="bg-gradient-accent" onClick={() => sellPlayer(player.id)}>Sell (Demo)</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuctionPage;

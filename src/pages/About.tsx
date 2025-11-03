import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Target, Shield, Sparkles, Handshake } from "lucide-react";
import heroImg from "@/assets/hero-cricket.jpg";
import { Link } from "react-router-dom";
import Stats from "@/components/Stats";

const AboutPage = () => {
  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="w-full h-full overflow-hidden">
            <img src={heroImg} alt="CPL Cricket" className="w-full h-[420px] md:h-[520px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl pt-20 pb-10 md:pb-24">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight animate-fade-in-up">
              The Heartbeat of CSE Sports: <span className="text-accent">CPL</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Where passion meets performance. A stage for cricketing excellence, friendship, and unforgettable moments.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <Button asChild className="bg-gradient-accent shadow-accent">
                <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'register' } })); }}>Register as Player</a>
              </Button>
              <Button asChild variant="outline" className="border-border">
                <Link to="/team">Meet the Teams</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Intro */}
            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground animate-fade-in-up">
              <p className="text-xl">
                The CSE Premier League (CPL) is the flagship sporting event of the Computer Science & Engineering department at Patuakhali Science and Technology University. Since its inception, CPL has become more than just a cricket tournament—it’s a celebration of sportsmanship, teamwork, and the vibrant spirit of our department.
              </p>
            </div>

            {/* Mission & Values */}
            <div className="grid md:grid-cols-2 gap-6 mt-10">
              <Card className="border-border animate-fade-in-up">
                <CardContent className="p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-accent" />
                    <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Foster a competitive yet friendly environment where students can showcase their talents, build lasting friendships, and create memories—while upholding the highest standards of sportsmanship and fair play.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <CardContent className="p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-accent" />
                    <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Build a sustainable culture of athletics within CSE—nurturing leadership, resilience, and unity through sport.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* What makes CPL special */}
            <h2 className="text-3xl font-bold text-foreground mt-14 mb-6 animate-fade-in-up">What Makes CPL Special</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[{
                icon: Trophy,
                title: 'Professional Standards',
                text: 'Official rules, live scoring, and tournament management'
              }, {
                icon: Users,
                title: 'Community Building',
                text: 'Bringing together students from all batches'
              }, {
                icon: Shield,
                title: 'Fair Play',
                text: 'Integrity and respect—on and off the field'
              }].map((item, i) => (
                <Card key={item.title} className="border-border hover:shadow-glow transition-all animate-fade-in-up" style={{animationDelay: `${0.05 * i}s`}}>
                  <CardContent className="pt-6 text-center space-y-3">
                    <item.icon className="h-12 w-12 text-accent mx-auto" />
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Timeline */}
            <h2 className="text-3xl font-bold text-foreground mt-14 mb-6 animate-fade-in-up">Our Journey</h2>
            <div className="relative animate-fade-in-up">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              <ul className="space-y-8">
                {[{
                  year: '2020',
                  title: 'CPL Founded',
                  text: 'A small idea became a department-wide celebration of cricket.'
                }, {
                  year: '2021',
                  title: 'Growing Community',
                  text: 'More teams, more volunteers, and structured tournament operations.'
                }, {
                  year: '2023',
                  title: 'Tech & Media Push',
                  text: 'Live scoring, social media highlights, and better fan engagement.'
                }, {
                  year: '2025',
                  title: 'Bigger & Better',
                  text: 'More players and sponsors—making the CPL experience unforgettable.'
                }].map((t, i) => (
                  <li key={t.year} className="relative pl-12">
                    <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-accent font-semibold">{t.year}</span>
                      <span className="text-foreground font-medium">— {t.title}</span>
                    </div>
                    <p className="text-muted-foreground">{t.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extra values */}
            <div className="grid md:grid-cols-3 gap-6 mt-14">
              <Card className="border-border animate-fade-in-up">
                <CardContent className="p-6 space-y-2 text-center">
                  <Handshake className="h-10 w-10 text-accent mx-auto" />
                  <h4 className="font-semibold">Team Spirit</h4>
                  <p className="text-sm text-muted-foreground">We play for each other and grow together.</p>
                </CardContent>
              </Card>
              <Card className="border-border animate-fade-in-up" style={{animationDelay: '0.05s'}}>
                <CardContent className="p-6 space-y-2 text-center">
                  <Target className="h-10 w-10 text-accent mx-auto" />
                  <h4 className="font-semibold">Discipline</h4>
                  <p className="text-sm text-muted-foreground">Consistency, respect, and dedication to the game.</p>
                </CardContent>
              </Card>
              <Card className="border-border animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <CardContent className="p-6 space-y-2 text-center">
                  <Sparkles className="h-10 w-10 text-accent mx-auto" />
                  <h4 className="font-semibold">Creativity</h4>
                  <p className="text-sm text-muted-foreground">Events, media, and experiences that inspire.</p>
                </CardContent>
              </Card>
            </div>

            {/* Narrative */}
            <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground mt-12 animate-fade-in-up">
              <p>
                Each season of CPL brings together the best cricket talent from our department, with teams competing in an exciting T20 format. From nail-biting finishes to spectacular performances, CPL delivers moments that become part of our department’s legacy.
              </p>
              <p>
                Beyond the matches, CPL is a platform to develop essential life skills—teamwork, leadership, decision-making under pressure, and handling both victory and defeat with grace. The tournament strengthens bonds between batches, creating a unified and spirited CSE community.
              </p>
            </div>

            {/* Stats on About */}
            <div className="mt-14">
              <Stats />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;

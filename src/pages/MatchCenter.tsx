import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, Link } from "react-router-dom";
import { getTournament } from "@/data/tournaments";
import { Button } from "@/components/ui/button";
import PointsTable from "@/components/PointsTable";
import LeaderboardsWidget from "@/components/LeaderboardsWidget";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { fetchMatchById } from "@/lib/api";

const MatchCenter = () => {
  const { tournamentId, matchId } = useParams<{ tournamentId: string; matchId: string }>();
  const staticTournament = tournamentId ? getTournament(tournamentId) : undefined;
  const staticMatch = staticTournament?.matches.find((m) => m.id === matchId);
  const [tournament, setTournament] = useState(staticTournament || null);
  const [tournamentTitle, setTournamentTitle] = useState<string>(staticTournament?.title || "Tournament");
  const [match, setMatch] = useState(staticMatch || null);

  useEffect(() => {
    if (!tournamentId || !matchId) return;
    fetchMatchById(tournamentId, matchId).then((res) => {
      if (res) {
        setTournamentTitle(res.tournamentTitle);
        setMatch(res.match);
      }
    }).catch(() => void 0);
  }, [tournamentId, matchId, staticTournament]);

  if (!tournament || !match) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-xl mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-lg font-semibold">Match not found</p>
                <div className="flex gap-2 justify-center">
                  <Button asChild variant="secondary"><Link to="/matches">Back to Matches</Link></Button>
                  <Button asChild><Link to="/tournament">Tournaments</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-5xl mx-auto mb-6 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${tournament.statusColor}`}>{tournament.status}</span>
              <span className="text-sm text-muted-foreground">{tournamentTitle}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {match.teamA.name} vs {match.teamB.name}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">{tournament.venue} • {new Date(match.startTime).toLocaleString()}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Scoreboard + Tabs */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Score Summary</CardTitle>
                  <CardDescription>{match.status.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">{match.teamA.name}</p>
                      <p className="text-3xl font-bold">{match.teamA.score || "--/--"} <span className="text-base font-normal">({match.teamA.overs || "--"})</span></p>
                    </div>
                    <div className="p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">{match.teamB.name}</p>
                      <p className="text-3xl font-bold">{match.teamB.score || "--/--"} <span className="text-base font-normal">({match.teamB.overs || "--"})</span></p>
                    </div>
                  </div>
                  {match.toss && <p className="text-sm text-muted-foreground">{match.toss}</p>}
                  {match.note && <p className="text-sm">{match.note}</p>}
                  {match.result && <p className="text-sm font-medium">Result: {match.result}</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scorecard</CardTitle>
                  <CardDescription>Batting and Bowling</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={match.battingA ? 'a' : (match.battingB ? 'b' : 'a')}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="a">{match.teamA.name} Innings</TabsTrigger>
                      <TabsTrigger value="b">{match.teamB.name} Innings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="a">
                      {match.battingA ? (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-semibold mb-2">Batting</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Batsman</TableHead>
                                  <TableHead className="text-right">R</TableHead>
                                  <TableHead className="text-right">B</TableHead>
                                  <TableHead className="text-right">4s</TableHead>
                                  <TableHead className="text-right">6s</TableHead>
                                  <TableHead className="text-right">SR</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {match.battingA.map((b) => (
                                  <TableRow key={b.name}>
                                    <TableCell>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{b.name}</span>
                                        {b.howOut && <span className="text-xs text-muted-foreground">{b.howOut}</span>}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">{b.runs}</TableCell>
                                    <TableCell className="text-right">{b.balls}</TableCell>
                                    <TableCell className="text-right">{b.fours}</TableCell>
                                    <TableCell className="text-right">{b.sixes}</TableCell>
                                    <TableCell className="text-right">{b.sr.toFixed(1)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="text-sm">
                            <p className="mb-1"><span className="font-semibold">Extras: </span>
                              {match.extrasA ? (
                                <>
                                  b {match.extrasA.b}, lb {match.extrasA.lb}, w {match.extrasA.w}, nb {match.extrasA.nb}, p {match.extrasA.p} = <span className="font-semibold">{match.extrasA.b + match.extrasA.lb + match.extrasA.w + match.extrasA.nb + match.extrasA.p}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </p>
                            <p><span className="font-semibold">Total: </span>{match.teamA.score} ({match.teamA.overs})</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold mb-2">Fall of Wickets</h3>
                              {match.fowA && match.fowA.length ? (
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {match.fowA.map((w, i) => (
                                    <li key={i}>{w.runs}-{w.wicket} ({w.batter}, {w.over})</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">—</p>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Partnerships</h3>
                              {match.partnershipsA && match.partnershipsA.length ? (
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {match.partnershipsA.map((p, i) => (
                                    <li key={i}>{p.bat1} & {p.bat2}: {p.runs} ({p.balls})</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">—</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Bowling</h3>
                            {match.bowlingB ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Bowler</TableHead>
                                    <TableHead className="text-right">O</TableHead>
                                    <TableHead className="text-right">M</TableHead>
                                    <TableHead className="text-right">R</TableHead>
                                    <TableHead className="text-right">W</TableHead>
                                    <TableHead className="text-right">Econ</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {match.bowlingB.map((bw) => (
                                    <TableRow key={bw.name}>
                                      <TableCell className="font-medium">{bw.name}</TableCell>
                                      <TableCell className="text-right">{bw.overs}</TableCell>
                                      <TableCell className="text-right">{bw.maidens ?? 0}</TableCell>
                                      <TableCell className="text-right">{bw.runs}</TableCell>
                                      <TableCell className="text-right">{bw.wickets}</TableCell>
                                      <TableCell className="text-right">{bw.eco.toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">Bowling data not available.</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Scorecard not available for {match.teamA.name}.</p>
                      )}
                    </TabsContent>

                    <TabsContent value="b">
                      {match.battingB ? (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-semibold mb-2">Batting</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Batsman</TableHead>
                                  <TableHead className="text-right">R</TableHead>
                                  <TableHead className="text-right">B</TableHead>
                                  <TableHead className="text-right">4s</TableHead>
                                  <TableHead className="text-right">6s</TableHead>
                                  <TableHead className="text-right">SR</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {match.battingB.map((b) => (
                                  <TableRow key={b.name}>
                                    <TableCell>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{b.name}</span>
                                        {b.howOut && <span className="text-xs text-muted-foreground">{b.howOut}</span>}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">{b.runs}</TableCell>
                                    <TableCell className="text-right">{b.balls}</TableCell>
                                    <TableCell className="text-right">{b.fours}</TableCell>
                                    <TableCell className="text-right">{b.sixes}</TableCell>
                                    <TableCell className="text-right">{b.sr.toFixed(1)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="text-sm">
                            <p className="mb-1"><span className="font-semibold">Extras: </span>
                              {match.extrasB ? (
                                <>
                                  b {match.extrasB.b}, lb {match.extrasB.lb}, w {match.extrasB.w}, nb {match.extrasB.nb}, p {match.extrasB.p} = <span className="font-semibold">{match.extrasB.b + match.extrasB.lb + match.extrasB.w + match.extrasB.nb + match.extrasB.p}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </p>
                            <p><span className="font-semibold">Total: </span>{match.teamB.score} ({match.teamB.overs})</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold mb-2">Fall of Wickets</h3>
                              {match.fowB && match.fowB.length ? (
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {match.fowB.map((w, i) => (
                                    <li key={i}>{w.runs}-{w.wicket} ({w.batter}, {w.over})</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">—</p>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Partnerships</h3>
                              {match.partnershipsB && match.partnershipsB.length ? (
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {match.partnershipsB.map((p, i) => (
                                    <li key={i}>{p.bat1} & {p.bat2}: {p.runs} ({p.balls})</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">—</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Bowling</h3>
                            {match.bowlingA ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Bowler</TableHead>
                                    <TableHead className="text-right">O</TableHead>
                                    <TableHead className="text-right">M</TableHead>
                                    <TableHead className="text-right">R</TableHead>
                                    <TableHead className="text-right">W</TableHead>
                                    <TableHead className="text-right">Econ</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {match.bowlingA.map((bw) => (
                                    <TableRow key={bw.name}>
                                      <TableCell className="font-medium">{bw.name}</TableCell>
                                      <TableCell className="text-right">{bw.overs}</TableCell>
                                      <TableCell className="text-right">{bw.maidens ?? 0}</TableCell>
                                      <TableCell className="text-right">{bw.runs}</TableCell>
                                      <TableCell className="text-right">{bw.wickets}</TableCell>
                                      <TableCell className="text-right">{bw.eco.toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">Bowling data not available.</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Scorecard not available for {match.teamB.name}.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commentary</CardTitle>
                  <CardDescription>Ball-by-ball (grouped by over)</CardDescription>
                </CardHeader>
                <CardContent>
                  {match.commentary && match.commentary.length ? (
                    <div className="space-y-4">
                      {Array.from(
                        match.commentary.reduce((map, ev) => {
                          const key = ev.over;
                          if (!map.has(key)) map.set(key, [] as typeof match.commentary);
                          map.get(key)!.push(ev);
                          return map;
                        }, new Map<number, typeof match.commentary[number][]>() )
                      ).sort((a,b) => b[0] - a[0]).map(([over, events]) => (
                        <div key={over}>
                          <p className="text-sm font-semibold mb-1">Over {over}</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {events.sort((a,b) => b.ball - a.ball).map((e, idx) => (
                              <li key={idx}>{over}.{e.ball}: {e.text}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Commentary not available.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Match Info</CardTitle>
                  <CardDescription>Venue & Timing</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Venue</p>
                    <p className="font-semibold">{match.venue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-semibold">{new Date(match.startTime).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8 lg:sticky top-28 self-start">
              {match.playerOfTheMatch && (
                <Card>
                  <CardHeader>
                    <CardTitle>Player of the Match</CardTitle>
                    <CardDescription>{match.playerOfTheMatch.team}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="font-semibold">{match.playerOfTheMatch.name}</p>
                    {match.playerOfTheMatch.performance && (
                      <p className="text-muted-foreground">{match.playerOfTheMatch.performance}</p>
                    )}
                  </CardContent>
                </Card>
              )}
              <PointsTable compact />
              <LeaderboardsWidget stacked />
              <Button asChild variant="secondary" className="w-full"><Link to="/matches">Back to Matches</Link></Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MatchCenter;

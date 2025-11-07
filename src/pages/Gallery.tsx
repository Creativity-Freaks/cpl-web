import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Download, Link as LinkIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAllTournaments, fetchTournamentImages, fetchImageAsObjectUrl, type UITournament } from "@/lib/api";

const GalleryPage = () => {
  const [tournaments, setTournaments] = useState<UITournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [videos, setVideos] = useState<string[]>([]); // store YouTube URLs
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load tournaments and default
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchAllTournaments();
        if (!mounted) return;
        setTournaments(list);
        const live = list.find((t) => t.status === "Live");
        const upcoming = list.find((t) => t.status === "Upcoming");
        const chosen = live || upcoming || list[0];
        if (chosen) setSelectedTournamentId(chosen.id);
      } catch {
        /* noop */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load gallery images for selected tournament
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedTournamentId) return;
      try {
        setLoading(true);
        const files = await fetchTournamentImages(selectedTournamentId);
        if (!mounted) return;
        setImages(files.map((f) => f.url));
      } catch {
        if (mounted) setImages([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedTournamentId]);

  // Load videos from localStorage (managed in Admin upload tab)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gallery_videos") || "[]";
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) setVideos(arr.map(String));
    } catch {
      setVideos([]);
    }
  }, []);

  const selectedTournament = useMemo(() => tournaments.find((t) => t.id === selectedTournamentId) || null, [tournaments, selectedTournamentId]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevImage = useCallback(() => setLightboxIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const nextImage = useCallback(() => setLightboxIndex((i) => (i + 1) % images.length), [images.length]);
  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // naive toast — use alert to avoid pulling toast lib here
      window.alert("Link copied to clipboard");
    } catch {
      window.alert("Copy failed");
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-center animate-fade-in-up">
            Gallery <span className="text-accent">Collection</span>
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in-up">
            Relive the best moments from CPL history
          </p>

          {/* Tournament selector */}
          <div className="mt-6 mb-10 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: "0.08s" }}>
            <div className="w-full max-w-md">
              <Select value={selectedTournamentId ?? undefined} onValueChange={(v) => setSelectedTournamentId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((t) => (
                    <SelectItem value={t.id} key={t.id}>
                      {t.title} {t.year ? `(${t.year})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="images" className="animate-fade-in-up">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="images">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl h-48 bg-muted animate-pulse" />
                  ))}
                </div>
              ) : images.length === 0 ? (
                <div className="text-center text-muted-foreground">No images found for this tournament.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {images.map((img, index) => (
                    <div 
                      key={index} 
                      className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-2 aspect-video group animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <img
                        src={img}
                        loading="lazy"
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover cursor-zoom-in"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={async (e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          // Try alternate endpoint spelling once
                          if (el.dataset.altTried !== '1') {
                            el.dataset.altTried = '1';
                            if (el.src.includes('/tounament/')) {
                              el.src = el.src.replace('/tounament/', '/tournament/');
                              return;
                            }
                            if (el.src.includes('/tournament/')) {
                              el.src = el.src.replace('/tournament/', '/tounament/');
                              return;
                            }
                          }
                          // Fetch as blob with auth/accept JSON as a last resort
                          try {
                            const url = await fetchImageAsObjectUrl(el.src);
                            if (url) {
                              el.src = url;
                              return;
                            }
                          } catch (err) {
                            // ignore and hide below
                          }
                          // Hide broken image as last resort
                          el.style.display = 'none';
                        }}
                        onClick={() => openLightbox(index)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                        <p className="text-primary-foreground font-medium p-4">{selectedTournament?.title} {selectedTournament?.year ? `(${selectedTournament?.year})` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="videos">
              {videos.length === 0 ? (
                <div className="text-center text-muted-foreground">No videos added yet. Add YouTube links from Admin → Gallery Upload.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((url, index) => {
                    const ytIdMatch = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
                    const id = ytIdMatch ? ytIdMatch[1] : null;
                    return (
                      <div key={index} className="rounded-xl overflow-hidden shadow-lg animate-scale-in" style={{ animationDelay: `${index * 0.06}s` }}>
                        {id ? (
                          <iframe
                            className="w-full aspect-video"
                            src={`https://www.youtube.com/embed/${id}`}
                            title={`YouTube video ${index + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer" className="block p-6 text-center text-sm text-blue-600 hover:underline">Open video</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-5xl p-0 bg-black/95 border-0">
          {images.length > 0 && (
            <div className="relative w-full">
              <img
                src={images[lightboxIndex]}
                alt="preview"
                className="w-full max-h-[80vh] object-contain select-none"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={async (e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (el.dataset.altTried !== '1') {
                    el.dataset.altTried = '1';
                    if (el.src.includes('/tounament/')) {
                      el.src = el.src.replace('/tounament/', '/tournament/');
                      return;
                    }
                    if (el.src.includes('/tournament/')) {
                      el.src = el.src.replace('/tournament/', '/tounament/');
                      return;
                    }
                  }
                  // Try blob fetch fallback
                  try {
                    const url = await fetchImageAsObjectUrl(el.src);
                    if (url) { el.src = url; return; }
                  } catch (err) {
                    // ignore and hide below
                  }
                  el.style.display = 'none';
                }}
              />
              {/* Controls */}
              <button aria-label="Previous" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <ChevronLeft />
              </button>
              <button aria-label="Next" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <ChevronRight />
              </button>
              <div className="absolute bottom-2 right-2 flex gap-2">
                <a href={images[lightboxIndex]} download className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white" aria-label="Download">
                  <Download />
                </a>
                <button onClick={() => copyLink(images[lightboxIndex])} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white" aria-label="Copy link">
                  <LinkIcon />
                </button>
                <button onClick={closeLightbox} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white" aria-label="Close">✕</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPage;

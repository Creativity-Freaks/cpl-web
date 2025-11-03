import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play } from "lucide-react";
import teamImage from "@/assets/team-celebration.jpg";

const GalleryPage = () => {
  const images = Array(12).fill(teamImage);
  const videos = Array(6).fill({ title: "CPL Highlights", thumbnail: teamImage });

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

          <Tabs defaultValue="images" className="animate-fade-in-up">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="images">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-2 aspect-video group animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <img 
                      src={img} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <p className="text-primary-foreground font-medium p-4">CPL Moment {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <div 
                    key={index} 
                    className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-2 aspect-video group animate-scale-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-accent hover:bg-accent-glow flex items-center justify-center shadow-accent transition-transform group-hover:scale-110">
                        <Play className="h-8 w-8 text-accent-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary to-transparent">
                      <h3 className="text-primary-foreground font-semibold">{video.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GalleryPage;

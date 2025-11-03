import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import teamImage from "@/assets/team-celebration.jpg";

const Gallery = () => {
  const images = [
    { src: teamImage, alt: "Team celebration" },
    { src: teamImage, alt: "Match action" },
    { src: teamImage, alt: "Trophy ceremony" },
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Gallery <span className="text-accent">Highlights</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Relive the most exciting moments from previous tournaments
          </p>
        </div>

        {/* Video Section */}
        <div className="mb-12 max-w-4xl mx-auto animate-scale-in">
          <div className="relative rounded-2xl overflow-hidden shadow-glow aspect-video bg-gradient-hero">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 rounded-full bg-accent hover:bg-accent-glow flex items-center justify-center shadow-accent transition-transform hover:scale-110">
                <Play className="h-10 w-10 text-accent-foreground ml-1" fill="currentColor" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-primary to-transparent">
              <h3 className="text-2xl font-bold text-primary-foreground">CPL 2025 Highlights</h3>
              <p className="text-primary-foreground/90">Watch the best moments from last season</p>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-300 hover:-translate-y-2 animate-fade-in-up aspect-video"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                <p className="text-primary-foreground font-medium p-4">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/gallery">
            <Button size="lg" variant="outline" className="border-2">
              View Full Gallery
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Gallery;

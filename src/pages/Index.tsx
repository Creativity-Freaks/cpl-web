import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Stats from "@/components/Stats";
import Tournament from "@/components/Tournament";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Sponsors from "@/components/Sponsors";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Stats />
      <Tournament />
      <Gallery />
      <Testimonials />
      <Sponsors />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;

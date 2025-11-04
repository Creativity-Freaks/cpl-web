import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Auction = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Auction</h1>
          <p className="text-muted-foreground">Auction page will be available soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auction;

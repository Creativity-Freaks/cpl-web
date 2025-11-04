import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import banner from "@/assets/cpl-banner.jpg";

// Simple site-wide advertisement popup.
// Behavior: shows automatically on first app load or page refresh; user can close.
export default function AdPopup() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    // Only show on homepage (/) when the app opens or when the user refreshes the homepage.
    if (pathname === "/") setOpen(true);
    else setOpen(false);
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-3xl overflow-hidden border-0 bg-transparent shadow-none">
        <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10">
          <img src={banner} alt="CPL Banner" className="block w-full h-auto" />
          <Button
            aria-label="Close advertisement"
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-foreground shadow"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

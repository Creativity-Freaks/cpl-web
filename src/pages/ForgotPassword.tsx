import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const ForgotPassword = () => {
  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (!isSupabaseConfigured) {
      toast.error("Password reset unavailable: Supabase not configured.");
      return;
    }
    const redirectTo = `${window.location.origin}/change-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      toast.error(error.message || "Failed to send reset link");
    } else {
      toast.success("If an account exists, a reset link has been sent to your email.");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md w-full mx-auto animate-fade-in-up">
            <Card className="border-border shadow-glow">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Forgot password</CardTitle>
                <CardDescription>Enter your email to receive a reset link</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="your.email@pstu.ac.bd" required />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-accent shadow-accent">Send reset link</Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Remembered? <button type="button" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } })); }} className="text-accent hover:underline">Back to login</button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;

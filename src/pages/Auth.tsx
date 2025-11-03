import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import heroImg from "@/assets/hero-cricket.jpg";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type AuthProps = {
  initialTab?: "login" | "register";
  compact?: boolean;
  onSuccess?: () => void;
};

const Auth: React.FC<AuthProps> = ({ initialTab, compact = false, onSuccess }) => {
  const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    remember: z.boolean().optional(),
  });
  type LoginFormValues = z.infer<typeof loginSchema>;

  const registerSchema = z
    .object({
      name: z.string().min(2, "Name is too short"),
      email: z.string().email("Enter a valid email"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm your password"),
      avatar: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords don't match",
    });
  type RegisterFormValues = z.infer<typeof registerSchema>;

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: true } });
  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", password: "", confirmPassword: "", avatar: "" } });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultTab = useMemo(() => {
    if (initialTab) return initialTab;
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return tab === "register" ? "register" : "login";
  }, [location.search, initialTab]);

  // controlled active tab so we can switch programmatically (e.g. from the full-page link -> open modal)
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);

  // respond to changes in the incoming initialTab prop
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = loginForm.handleSubmit(async (values) => {
    try {
      const u = await login({ email: values.email, password: values.password });
      toast.success("Logged in successfully");
      onSuccess?.();
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error("Login failed");
    }
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    try {
      await register({ name: values.name, email: values.email, password: values.password, avatar: values.avatar });
      toast.success("Registration successful");
      onSuccess?.();
      navigate("/dashboard");
    } catch (err) {
      toast.error("Registration failed");
    }
  });

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarChosen: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      registerForm.setValue("avatar", result, { shouldDirty: true, shouldValidate: false });
    };
    reader.readAsDataURL(file);
  };

  const AuthCard = (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="border-border shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to CPL</CardTitle>
          <CardDescription>Login or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register") }>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="your.email@pstu.ac.bd" {...loginForm.register("email")} required />
                  {loginForm.formState.errors.email && <p className="text-xs text-red-500">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" {...loginForm.register("password")} required />
                  {loginForm.formState.errors.password && <p className="text-xs text-red-500">{loginForm.formState.errors.password.message}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Switch checked={!!loginForm.watch("remember")} onCheckedChange={(v) => loginForm.setValue("remember", v)} />
                    Remember me
                  </label>
                  <button type="button" className="text-sm text-accent hover:underline">Forgot password?</button>
                </div>
                <Button type="submit" className="w-full bg-gradient-accent shadow-accent">Login</Button>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // if compact (modal) simply switch tab; otherwise open the modal with register tab
                      if (compact) setActiveTab("register");
                      else window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { tab: "register" } }));
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    Create new account
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={registerForm.watch("avatar") || ""} alt={registerForm.watch("name") || "avatar"} />
                      <AvatarFallback>{(registerForm.watch("name") || "P").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <button type="button" onClick={onPickAvatar} className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-accent" aria-label="Change avatar">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <input ref={fileInputRef} onChange={onAvatarChosen} type="file" accept="image/*" className="hidden" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input id="register-name" type="text" placeholder="Your full name" {...registerForm.register("name")} required />
                  {registerForm.formState.errors.name && <p className="text-xs text-red-500">{registerForm.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" type="email" placeholder="your.email@pstu.ac.bd" {...registerForm.register("email")} required />
                  {registerForm.formState.errors.email && <p className="text-xs text-red-500">{registerForm.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input id="register-password" type="password" {...registerForm.register("password")} required />
                  {registerForm.formState.errors.password && <p className="text-xs text-red-500">{registerForm.formState.errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirm Password</Label>
                  <Input id="register-confirm" type="password" {...registerForm.register("confirmPassword")} required />
                  {registerForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-gradient-accent shadow-accent">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  if (compact) return AuthCard;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative hidden lg:block animate-fade-in-up">
              <div className="rounded-2xl overflow-hidden shadow-glow border border-border">
                <img src={heroImg} className="w-full h-[520px] object-cover" alt="CPL Cricket" />
              </div>
              <div className="mt-6">
                <h2 className="text-3xl font-bold">Play. Compete. Rise.</h2>
                <p className="text-muted-foreground max-w-md mt-2">Join CPL at PSTU — where coding minds meet cricketing spirit. Register as a player and get into the action.</p>
              </div>
            </div>

            <div className="max-w-md w-full mx-auto animate-fade-in-up">{AuthCard}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;


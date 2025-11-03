import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

type Props = {
  compact?: boolean;
  onSuccess?: () => void;
};

const schema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
    playerType: z.string().min(1, "Player category is required"),
    semester: z.string().min(1, "Semester is required"),
    paymentMethod: z.string().min(1, "Payment method is required"),
    paymentNumber: z.string().min(1, "Payment number is required"),
    transactionId: z.string().min(1, "Transaction ID is required"),
    session: z.string().min(1, "Session is required"),
    avatar: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

type FormValues = z.infer<typeof schema>;

const RegisterForm: React.FC<Props> = ({ compact = false, onSuccess }) => {
  const { register: authRegister, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema), 
    defaultValues: { 
      name: "", 
      email: "", 
      password: "", 
      confirmPassword: "", 
      playerType: "", 
      semester: "", 
      paymentMethod: "", 
      paymentNumber: "", 
      transactionId: "", 
      session: "", 
      avatar: "" 
    } 
  });

  const onPickAvatar = () => fileRef.current?.click();
  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Accept common image MIME types. If the browser doesn't provide a proper
    // MIME type, still attempt to read the file as a data URL to allow uploads
    // for various image formats.
    if (f.type && !f.type.startsWith("image/")) return toast.error("Select an image file");
    const reader = new FileReader();
    reader.onload = () => form.setValue("avatar", reader.result as string);
    reader.readAsDataURL(f);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        avatar: values.avatar,
        playerType: values.playerType,
        semester: values.semester,
        paymentMethod: values.paymentMethod,
        paymentNumber: values.paymentNumber,
        transactionId: values.transactionId,
        session: values.session,
      });
      toast.success("Registered successfully");
      onSuccess?.();
    } catch (err: unknown) {
      console.error(err);
      let msg = 'Registration failed';
      if (err instanceof Error) msg = err.message;
      toast.error(msg);
    }
  });

  const containerClass = compact
    ? "w-full max-w-md mx-auto p-4"
    : "w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto p-6";

  const FormCard = (
    <div className={containerClass}>
      <Card className="border-border shadow-glow transition-all duration-300 hover:shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Register as a CPL player</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Make CardContent a column: scrollable form area above, fixed footer below */}
          <div className="flex flex-col max-h-[80vh]">
            <div className="overflow-auto p-6">
              <form id="register-form" onSubmit={onSubmit} className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative transition-all duration-200 hover:scale-105">
                    <Avatar className="h-20 w-20 border-2 border-gray-300 transition-all duration-200 hover:border-blue-500">
                      <AvatarImage src={form.watch("avatar") || ""} alt={form.watch("name") || "avatar"} />
                      <AvatarFallback className="bg-gray-300 text-gray-800">{(form.watch("name") || "P").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <button 
                      type="button" 
                      onClick={onPickAvatar} 
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center shadow-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-200" 
                      aria-label="Change avatar"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatar} aria-hidden />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...form.register("name")} required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                  {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...form.register("password")} required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                    {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                    {form.formState.errors.confirmPassword && <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="playerType">Player Category</Label>
                    <Controller
                      name="playerType"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="playerType" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select player category" />
                          </SelectTrigger>
                          <SelectContent className="transition-all duration-200">
                            <SelectItem value="Batsman">Batsman</SelectItem>
                            <SelectItem value="Bowler">Bowler</SelectItem>
                            <SelectItem value="All-rounder">All-rounder</SelectItem>
                            <SelectItem value="Wicket keeper">Wicket keeper</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.playerType && <p className="text-xs text-red-500">{form.formState.errors.playerType.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="semester">Semester</Label>
                    <Input id="semester" {...form.register("semester")} placeholder="e.g., 5" required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                    {form.formState.errors.semester && <p className="text-xs text-red-500">{form.formState.errors.semester.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Controller
                      name="paymentMethod"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id="paymentMethod" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent className="transition-all duration-200">
                            <SelectItem value="Bkash">Bkash</SelectItem>
                            <SelectItem value="Nagad">Nagad</SelectItem>
                            <SelectItem value="Rocket">Rocket</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.paymentMethod && <p className="text-xs text-red-500">{form.formState.errors.paymentMethod.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="paymentNumber">Payment Number</Label>
                    <Input id="paymentNumber" {...form.register("paymentNumber")} placeholder="01XXXXXXXXX" required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                    {form.formState.errors.paymentNumber && <p className="text-xs text-red-500">{form.formState.errors.paymentNumber.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input id="transactionId" {...form.register("transactionId")} required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                  {form.formState.errors.transactionId && <p className="text-xs text-red-500">{form.formState.errors.transactionId.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="session">Session</Label>
                  <Input id="session" {...form.register("session")} placeholder="e.g., 2024-25" required aria-required className="transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                  {form.formState.errors.session && <p className="text-xs text-red-500">{form.formState.errors.session.message}</p>}
                </div>
              </form>
            </div>
            {/* Fixed footer below the scroll area */}
            <div className="bg-card p-4 border-t">
              <div className="max-w-full">
                <button 
                  form="register-form" 
                  type="submit" 
                  className="w-full bg-gradient-accent shadow-accent rounded-md py-2 text-white hover:bg-gradient-primary transition-all duration-200 hover:scale-105 hover:shadow-lg" 
                  disabled={form.formState.isSubmitting}
                >
                  Create Account
                </button>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Already have an account? <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } }))} className="text-accent hover:underline transition-colors duration-200">Login</button>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (compact) return FormCard;

  return <div className="min-h-screen flex items-center justify-center py-12 bg-gradient-to-br from-background to-muted/50">{FormCard}</div>;
};

export default RegisterForm;
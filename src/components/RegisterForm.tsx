import React from "react";
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
// Avatar upload has been removed from registration; users can upload from Settings

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
    category: z.enum(["batter", "bowler", "all_rounder", "wicket_keeper"], {
      required_error: "Player category is required",
      invalid_type_error: "Invalid category",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

type FormValues = z.infer<typeof schema>;

const RegisterForm: React.FC<Props> = ({ compact = false, onSuccess }) => {
  const { register: authRegister } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      category: undefined as unknown as FormValues["category"],
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        category: values.category,
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
                {/* Avatar upload removed from registration. Please upload from Profile Settings after account creation. */}

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

                <div className="space-y-1">
                  <Label htmlFor="category">Player Category</Label>
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="category" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select player category" />
                        </SelectTrigger>
                        <SelectContent className="transition-all duration-200">
                          <SelectItem value="batter">Batter</SelectItem>
                          <SelectItem value="bowler">Bowler</SelectItem>
                          <SelectItem value="all_rounder">All-rounder</SelectItem>
                          <SelectItem value="wicket_keeper">Wicket keeper</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.category && <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>}
                </div>

                {/* Payment and academic fields removed per new registration requirements */}
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
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const LoginForm: React.FC<{ compact?: boolean; onSuccess?: () => void }> = ({ compact = false, onSuccess }) => {
  const { login } = useAuth();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", remember: true } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const u = await login({ email: values.email, password: values.password });
      toast.success("Logged in successfully");
      onSuccess?.();
    } catch (err) {
      toast.error("Login failed");
    }
  });

  const FormCard = (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="border-border shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Login to your CPL account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={!!form.watch("remember")} onCheckedChange={(v: boolean) => form.setValue("remember", v)} />
                Remember me
              </label>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'forgot' } }))} className="text-sm text-accent hover:underline">Forgot password?</button>
            </div>
            <Button type="submit" className="w-full bg-gradient-accent shadow-accent">Login</Button>
            <div className="text-center mt-2">
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'register' } }))} className="text-sm text-accent hover:underline">Create new account</button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  if (compact) return FormCard;
  return <div className="min-h-screen flex items-center justify-center py-12">{FormCard}</div>;
};

export default LoginForm;

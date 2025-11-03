import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = { compact?: boolean; onSuccess?: () => void };

const ForgotPasswordForm: React.FC<Props> = ({ compact = false, onSuccess }) => {
  const form = useForm<{ email: string }>({ defaultValues: { email: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!values.email) return toast.error("Please enter your email");
    // Backend does not expose a password reset endpoint yet.
    toast.info("Password reset via email isn't available yet. Please contact an admin or try again later.");
    onSuccess?.();
  });

  const CardNode = (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="border-border shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <Button type="submit" className="w-full bg-gradient-accent shadow-accent">Send reset link</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  if (compact) return CardNode;
  return <div className="min-h-screen flex items-center justify-center py-12">{CardNode}</div>;
};

export default ForgotPasswordForm;

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import Auth from "@/pages/Auth";
import RegisterForm from "@/components/RegisterForm";
import LoginForm from "@/components/LoginForm";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

const LoginModal: React.FC<{ open: boolean; setOpen: (v: boolean) => void }> = ({ open, setOpen }) => {
  const [startTab, setStartTab] = useState<"login" | "register" | "forgot" | undefined>(undefined);

  useEffect(() => {
    type AuthModalDetail = { tab?: "login" | "register" | "forgot" };
    const handler = (e: Event) => {
      const detail = ((e as CustomEvent).detail || {}) as AuthModalDetail;
      const tab = detail.tab === "register" ? "register" : detail.tab === "forgot" ? "forgot" : "login";
      setStartTab(tab);
      setOpen(true);
    };
    window.addEventListener("open-auth-modal", handler as EventListener);
    return () => window.removeEventListener("open-auth-modal", handler as EventListener);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setStartTab(undefined); setOpen(v); }}>
  <DialogContent className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-4 sm:p-6">
        {/* Render the appropriate compact form based on requested tab */}
        {startTab === "register" ? (
          <RegisterForm compact onSuccess={() => setOpen(false)} />
        ) : startTab === "forgot" ? (
          <ForgotPasswordForm compact onSuccess={() => setOpen(false)} />
        ) : (
          <LoginForm compact onSuccess={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;

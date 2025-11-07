import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, onError, crossOrigin, referrerPolicy, ...props }, ref) => {
  const handleError: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>["onError"] = async (e) => {
    const el = e.currentTarget as HTMLImageElement;
    try {
      const { fetchImageAsObjectUrl } = await import("@/lib/api");
      const url = await fetchImageAsObjectUrl(el.src);
      if (url) {
        el.src = url;
        return;
      }
    } catch {
      // ignore and fall through to user handler
    }
    // Last resort: strip any nested path segments leaving only filename
    if (/\/player\/profile\//.test(el.src)) {
      const file = el.src.split('/').pop() || '';
      if (file && el.dataset.fallbackApplied !== '1') {
        el.dataset.fallbackApplied = '1';
        el.src = el.src.replace(/\/player\/profile\/.*/, `/player/profile/${file}`);
        return;
      }
    }
    if (onError) onError(e);
  };
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      crossOrigin={crossOrigin ?? "anonymous"}
      referrerPolicy={referrerPolicy ?? "no-referrer"}
      onError={handleError}
      {...props}
    />
  );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

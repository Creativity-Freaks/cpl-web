import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/useAuth";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadPlayerProfileImage, playerProfileImageUrl, fetchCurrentPlayerProfile, extractFilename, resolveProfileImageUrl } from "@/lib/api";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [category, setCategory] = useState<string>(user?.category || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [saving, setSaving] = useState(false);

  const onPickAvatar = () => fileInputRef.current?.click();
  const onAvatarChosen: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type && !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    try {
      // Upload to backend
      type UploadResp = { url?: string; filename?: string; file?: string; image?: string } | string | null;
      const result = (await uploadPlayerProfileImage(file)) as UploadResp;

      // After upload, prefer fetching the canonical URL from the profile API
      try {
        const prof = await fetchCurrentPlayerProfile();
        if (prof?.avatarUrl) {
          setAvatarPreview(prof.avatarUrl);
          await updateUser({ avatar: prof.avatarUrl });
          toast.success("Avatar updated");
          return;
        }
      } catch { /* ignore and try response-based resolution */ }

      // Try to resolve a usable URL from various possible upload response shapes
      let url: string | null = null;
      if (typeof result === "string") {
        url = result.startsWith("http") ? result : playerProfileImageUrl(extractFilename(result));
      } else if (result && typeof result === "object") {
        if (typeof result.url === "string") url = result.url;
        else if (typeof result.filename === "string") url = playerProfileImageUrl(extractFilename(result.filename));
        else if (typeof result.file === "string") url = playerProfileImageUrl(extractFilename(result.file));
        else if (typeof result.image === "string") url = playerProfileImageUrl(extractFilename(result.image));
      }

      if (url) {
        setAvatarPreview(url);
        await updateUser({ avatar: url });
        toast.success("Avatar updated");
        return;
      }

      // Final fallback to local preview and update user so profile shows immediately
      const r = new FileReader();
      r.onload = async () => {
        const dataUrl = r.result as string;
        setAvatarPreview(dataUrl);
        await updateUser({ avatar: dataUrl });
        toast.success("Avatar updated");
      };
      r.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Failed to upload avatar");
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await updateUser({ name, category });
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-border shadow-glow">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={(avatarPreview || user.avatar || '')} alt={user.name} />
                    <AvatarFallback>{user.name.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" onClick={onPickAvatar} className="bg-gradient-accent">Change Avatar</Button>
                    <input ref={fileInputRef} onChange={onAvatarChosen} type="file" accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user.email} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Player Category</Label>
                  <Select value={category} onValueChange={(v) => { setCategory(v); }}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select player category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="batter">Batter</SelectItem>
                      <SelectItem value="bowler">Bowler</SelectItem>
                      <SelectItem value="all_rounder">All-rounder</SelectItem>
                      <SelectItem value="wicket_keeper">Wicket keeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button className="bg-gradient-accent" disabled={saving} onClick={onSave}>{saving ? 'Saving…' : 'Save Changes'}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;

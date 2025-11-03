import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogOut, User, Settings, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import LoginModal from "./LoginModal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/cpl2026logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Team", path: "/team" },
    { name: "Tournament", path: "/tournament" },
    { name: "Matches", path: "/matches" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src={logoUrl}
              alt="CPL 2026 Logo"
              className="h-10 w-10 rounded-md object-cover shadow-glow transition-transform group-hover:scale-110"
            />
            <span className="font-bold text-lg text-foreground hidden sm:block">
              CSE Premier League
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <Button variant="default" className="bg-gradient-accent shadow-accent" onClick={() => setLoginOpen(true)}>
                  Login
                </Button>
                <LoginModal open={loginOpen} setOpen={setLoginOpen} />
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
                      <AvatarFallback>{user.name?.slice(0,2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/change-password")} className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" /> Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-secondary"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in-up">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!user ? (
                <>
                  <Button variant="default" className="w-full bg-gradient-accent" onClick={() => { setIsOpen(false); setLoginOpen(true); }}>
                    Login
                  </Button>
                  <LoginModal open={loginOpen} setOpen={setLoginOpen} />
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || ''} alt={user.name} />
                      <AvatarFallback>{user.name?.slice(0,2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {user.role === 'admin' && (
                      <Button variant="secondary" onClick={() => { setIsOpen(false); navigate('/admin'); }}>
                        Admin
                      </Button>
                    )}
                    <Button variant="secondary" onClick={() => { setIsOpen(false); navigate('/dashboard'); }}>
                      Profile
                    </Button>
                    <Button variant="secondary" onClick={() => { setIsOpen(false); navigate('/settings'); }}>
                      Settings
                    </Button>
                    <Button variant="secondary" onClick={() => { setIsOpen(false); navigate('/change-password'); }}>
                      Change Pass
                    </Button>
                    <Button variant="outline" onClick={() => { logout(); setIsOpen(false); }} className="col-span-2">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

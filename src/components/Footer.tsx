import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import logoUrl from "@/assets/cpl2026.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Team", path: "/team" },
    { name: "Tournament", path: "/tournament" },
    { name: "Matches", path: "/matches" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src={logoUrl}
                alt="CPL 2026 Logo"
                className="w-10 h-10 rounded-md ring-2 ring-primary-foreground/20 group-hover:ring-accent transition"
                loading="lazy"
                decoding="async"
              />
              <div className="leading-tight">
                <div className="font-bold text-lg">CSE Premier League 2026</div>
                <div className="text-xs text-primary-foreground/70">PSTU CSE Cricket Tournament</div>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm">
              The ultimate cricket tournament for Computer Science & Engineering students at Patuakhali Science and Technology University.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'login' } })); }}
                  className="hover:text-accent transition-colors"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: 'register' } })); }}
                  className="hover:text-accent transition-colors"
                >
                  Player Registration
                </a>
              </li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/rules" className="hover:text-accent transition-colors">Rules & Regulations</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <span>Patuakhali Science and Technology University, Dumki, Patuakhali</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <span>cpl2026@pstu.ac.bd</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {currentYear} CSE Premier League. All rights reserved. | Powered by <a href="https://cftechlab.hcsarker.me" target="_blank" rel="noopener noreferrer"><strong>CFTechLab</strong></a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

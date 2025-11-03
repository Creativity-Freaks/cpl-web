import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Location",
      info: "PSTU, Dumki, Patuakhali",
    },
    {
      icon: Phone,
      title: "Phone",
      info: "+880 1XXX-XXXXXX",
    },
    {
      icon: Mail,
      title: "Email",
      info: "cpl2026@pstu.ac.bd",
    },
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get In <span className="text-accent">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6 animate-fade-in-up">
            {contactInfo.map((item, index) => (
              <Card 
                key={index}
                className="border-border hover:shadow-glow transition-all duration-300"
              >
                <CardContent className="flex items-start space-x-4 p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0 shadow-glow">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.info}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="border-border shadow-glow animate-scale-in">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="border-border"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-accent shadow-accent">
                  Send Message
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;

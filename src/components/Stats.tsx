import { useEffect, useRef, useState } from "react";
import { fetchHomeStats } from "@/lib/api";

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<{ value: number; suffix: string; label: string; duration: number }[]>([
    { value: 0, suffix: "+", label: "Registered Players", duration: 2000 },
    { value: 5, suffix: "+", label: "Competing Teams", duration: 1500 },
    { value: 0, suffix: "+", label: "Total Matches", duration: 2000 },
     { value: 50, suffix: "k BDT", label: "Prize Pool (BDT)", duration: 2500 },
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await fetchHomeStats();
      if (!mounted) return;
      setStats([
        { value: s.players || 0, suffix: "+", label: "Registered Players", duration: 2000 },
        { value: s.teams || 0, suffix: "+", label: "Competing Teams", duration: 1500 },
        { value: s.matches || 0, suffix: "+", label: "Total Matches", duration: 2000 },
         { value: Math.round((s.prizePool || 0) / 1000), suffix: "k BDT", label: "Prize Pool (BDT)", duration: 2500 },
      ]);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const Counter = ({ end, duration, suffix, visible }: { end: number; duration: number; suffix: string; visible: boolean }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!visible) return;

      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setCount(Math.floor(progress * end));

        if (progress === 1) {
          clearInterval(timer);
        }
      }, 16);

      return () => clearInterval(timer);
    }, [visible, end, duration]);

    return (
      <span className="text-5xl md:text-6xl font-bold text-accent">
        {count}{suffix}
      </span>
    );
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center space-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Counter end={stat.value} duration={stat.duration} suffix={stat.suffix} visible={isVisible} />
              <p className="text-primary-foreground text-lg font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;

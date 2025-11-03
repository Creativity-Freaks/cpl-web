import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Who can participate in CPL 2026?",
      answer: "All students enrolled in the Computer Science & Engineering department at PSTU are eligible to participate. Both undergraduate and graduate students can register.",
    },
    {
      question: "How do I register my team?",
      answer: "Click the 'Register Now' button on the homepage or navigate to the registration page. Fill in your team details, player information, and submit the form. Registration is open until February 28, 2026.",
    },
    {
      question: "What is the team size requirement?",
      answer: "Each team must have a minimum of 11 players and maximum of 16 players, including at least one wicket-keeper and captain. Teams should also nominate a vice-captain.",
    },
    {
      question: "Are there any registration fees?",
      answer: "Yes, there is a nominal registration fee of BDT 2,000 per team to cover tournament expenses including ground maintenance, equipment, and prizes.",
    },
    {
      question: "What are the tournament rules?",
      answer: "CPL follows standard cricket rules with T20 format. Each team plays multiple matches in the league stage, followed by semi-finals and finals. Detailed rules will be provided after registration.",
    },
    {
      question: "What prizes can teams win?",
      answer: "The champion team receives the CPL Trophy, cash prize of BDT 50,000, and individual medals. Runners-up get BDT 30,000 and medals. Additional awards for Player of the Tournament, Best Batsman, Best Bowler, and more.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-accent">Questions</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about CPL 2026
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4 animate-fade-in-up">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

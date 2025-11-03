const Terms = () => {
  const updated = "October 23, 2025";
  return (
    <main className="min-h-[60vh] py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {updated}</p>

        <section className="prose prose-invert max-w-none">
          <p>
            By accessing or using the CSE Premier League (CPL) website, you agree to these Terms. If you do not agree, please do not use the site.
          </p>

          <h2>Eligibility</h2>
          <p>
            The platform is intended for PSTU CSE students, alumni, and authorized organizers. Admin access is restricted to designated emails.
          </p>

          <h2>Accounts</h2>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your account and password.</li>
            <li>Provide accurate information during registration and keep it up to date.</li>
          </ul>

          <h2>Use of the Service</h2>
          <ul>
            <li>No misuse: do not disrupt matches, spam, or attempt unauthorized access.</li>
            <li>Follow tournament rules, schedules, and fair play guidelines.</li>
            <li>Content you submit (e.g., profile images) must not infringe others’ rights.</li>
          </ul>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate access for violations of these Terms or tournament rules.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            CPL and organizers are not liable for indirect or incidental damages arising from use of the site. Use at your own risk.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these Terms periodically. Continued use after changes constitutes acceptance.
          </p>

          <h2>Contact</h2>
          <p>
            Email: <a href="mailto:cpl2026@pstu.ac.bd">cpl2026@pstu.ac.bd</a>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Terms;

const PrivacyPolicy = () => {
  const updated = "October 23, 2025";
  return (
    <main className="min-h-[60vh] py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {updated}</p>

        <section className="prose prose-invert max-w-none">
          <p>
            We value your privacy. This policy explains what information we collect when you use the CSE Premier League (CPL) website, how we use it, and the choices you have.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Account details you provide during registration (name, email, department, semester, payment details such as method, number and transaction ID).</li>
            <li>Profile information such as avatar image you upload.</li>
            <li>Usage data like pages visited and interactions, used to improve the experience.</li>
          </ul>

          <h2>How We Use Information</h2>
          <ul>
            <li>To create and manage player accounts and tournament participation.</li>
            <li>To provide features like dashboards, standings, leaderboards, and match centers.</li>
            <li>To ensure fair play and manage event logistics and security.</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share limited data with authorized organizers and officials for event operations. Public pages (e.g., teams, leaderboards) may display player names and basic stats.
          </p>

          <h2>Data Retention</h2>
          <p>
            Registration and match records are retained for historical tournament purposes. You can request updates or corrections via the contact below.
          </p>

          <h2>Security</h2>
          <p>
            We take reasonable measures to protect your data. However, no internet transmission is 100% secure. Please use strong passwords and keep them confidential.
          </p>

          <h2>Your Choices</h2>
          <ul>
            <li>Update your profile details from Settings.</li>
            <li>Contact us to request corrections or removal where applicable.</li>
          </ul>

          <h2>Contact</h2>
          <p>
            Email: <a href="mailto:cpl2026@pstu.ac.bd">cpl2026@pstu.ac.bd</a>
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;

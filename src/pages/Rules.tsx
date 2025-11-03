const Rules = () => {
  return (
    <main className="min-h-[60vh] py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Rules & Regulations</h1>
        <p className="text-muted-foreground mb-8">Official guidelines for CPL 2026</p>

        <section className="prose prose-invert max-w-none">
          <h2>Eligibility & Registration</h2>
          <ul>
            <li>Players must be PSTU CSE students or approved alumni.</li>
            <li>Valid registration with semester, payment method, transaction ID, and contact number is required.</li>
            <li>Photo ID and university ID may be requested during verification.</li>
          </ul>

          <h2>Match Format</h2>
          <ul>
            <li>Limited overs (e.g., T10/T20) as declared by the organizers per season.</li>
            <li>Standard cricket laws apply with tournament-specific modifications announced before kickoff.</li>
          </ul>

          <h2>Team & Player Conduct</h2>
          <ul>
            <li>Maintain sportsmanship; no abusive language or misconduct.</li>
            <li>Follow umpire decisions; disputes can be raised through captains post-match.</li>
            <li>Anti-cheating, anti-doping, and fair play rules strictly enforced.</li>
          </ul>

          <h2>Points & Standings</h2>
          <ul>
            <li>Win: 2 points, Tie/No Result: 1 point, Loss: 0 points (unless otherwise announced).</li>
            <li>Net Run Rate (NRR) used as tiebreaker.</li>
          </ul>

          <h2>Safety & Equipment</h2>
          <ul>
            <li>Mandatory protective gear for batters and wicket-keepers.</li>
            <li>Only approved balls and equipment allowed.</li>
          </ul>

          <h2>Administration</h2>
          <ul>
            <li>Organizers reserve the right to change schedules or rules due to weather, safety, or logistics.</li>
            <li>Non-compliance may result in penalties, match forfeiture, or suspension.</li>
          </ul>

          <p className="mt-6">Questions? Contact <a href="mailto:cpl2026@pstu.ac.bd">cpl2026@pstu.ac.bd</a>.</p>
        </section>
      </div>
    </main>
  );
};

export default Rules;

function CTA() {
  const appUrl = import.meta.env.VITE_APP_URL || "http://localhost:3000";

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to take control of your time?
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Join teams using AskSync to communicate more effectively.
        </p>
        <a
          href={appUrl}
          className="inline-block px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105"
        >
          Start Free Trial
        </a>
      </div>
    </section>
  );
}

export default CTA;

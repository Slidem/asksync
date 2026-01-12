function Hero() {
  const appUrl = import.meta.env.VITE_APP_URL || "http://localhost:3000";

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Async Communication
          <br />
          Done Right
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Control when and how you engage with questions. Batch notifications
          based on your availability and work modes.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href={appUrl}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105"
          >
            Get Started Free
          </a>
        </div>
        <div className="mt-16">
          <img
            src="/marketing.png"
            alt="AskSync Dashboard"
            className="rounded-2xl shadow-2xl shadow-primary/20 border border-border mx-auto max-w-4xl w-full"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;

function Header() {
  const appUrl = import.meta.env.VITE_APP_URL || "http://localhost:3000";

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <img src="/logo_no_bg.png" alt="AskSync" className="h-10" />
        <a
          href={appUrl}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to App
        </a>
      </div>
    </header>
  );
}

export default Header;

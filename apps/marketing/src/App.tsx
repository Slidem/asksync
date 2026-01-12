import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
    </div>
  );
}

export default App;

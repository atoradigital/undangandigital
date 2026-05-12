import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TemplateCatalog from "@/components/TemplateCatalog";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <TemplateCatalog />
      <Pricing />
      <Footer />
    </main>
  );
}

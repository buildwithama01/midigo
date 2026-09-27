import Navbar from "@/src/components/Navbar";
import Hero from "@/src/components/Hero";
import StatsBar from "@/src/components/StatsBar";
import About from "@/src/components/About";
import LiveRooms from "@/src/components/LiveRooms";
import NewsPreview from "@/src/components/NewsPreview";
import Footer from "@/src/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <About />
        <LiveRooms />
        <NewsPreview />
        
        {/* Join call-to-action */}
        <section
          id="join"
          className="section"
          style={{
            background: "var(--purple-bg)",
            textAlign: "center",
          }}
        >
          <div className="container" style={{ maxWidth: "800px" }}>
            <h2
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
                lineHeight: 1.1,
              }}
            >
              Get closer to Midigo.
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                fontWeight: 300,
                color: "var(--text-secondary)",
                marginBottom: "3rem",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Create your fan account to unlock private galleries, join exclusive live chats, and interact directly with the virtual muse.
            </p>
            <Link
              href="/join"
              className="btn btn-lime"
              style={{
                fontSize: "1.0625rem",
                padding: "1rem 2.5rem",
              }}
            >
              Create Your Account
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

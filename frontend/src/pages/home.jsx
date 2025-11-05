import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* --- Navbar --- */}
      <nav className="flex justify-between items-center px-8 py-5 backdrop-blur-md bg-slate-900/40 border-b border-slate-700">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold text-sky-400 cursor-pointer tracking-tight"
        >
          A/B Testing Agent
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-full font-medium bg-sky-500 hover:bg-sky-400 text-slate-900 transition"
          >
            Login / Signup
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-5 py-2 rounded-full font-medium border border-sky-400 hover:bg-sky-400/20 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="flex flex-col items-center text-center mt-20 px-6 md:px-20">
        <h2 className="text-sky-400 text-sm uppercase tracking-widest mb-2">
          Optimize Faster
        </h2>
        <h1 className="text-4xl md:text-6xl font-extrabold max-w-4xl leading-tight mb-4">
          Run A/B tests with confidence, clarity, and speed.
        </h1>
        <p className="text-slate-300 text-lg md:text-xl max-w-2xl">
          Design experiments, collect data, and see statistically sound results
          in clean, real-time dashboards. Insights you can trust — decisions you
          can defend.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-sky-500 text-slate-900 font-semibold rounded-full hover:bg-sky-400 transition"
          >
            🚀 Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 border border-sky-400 text-sky-300 font-semibold rounded-full hover:bg-sky-400/20 transition"
          >
            View Dashboard →
          </button>
        </div>
      </section>

      {/* --- Features --- */}
      <section className="grid md:grid-cols-3 gap-6 px-6 md:px-20 mt-24 pb-24">
        <div className="bg-slate-800/60 p-6 rounded-2xl shadow-lg hover:bg-slate-800 transition">
          <h3 className="text-xl font-semibold text-sky-400 mb-3">
            ⚙️ No-Code Setup
          </h3>
          <p className="text-slate-300">
            Drop in our script and start testing in minutes. Clean SDKs for JS,
            React, and Node — ready for production.
          </p>
        </div>

        <div className="bg-slate-800/60 p-6 rounded-2xl shadow-lg hover:bg-slate-800 transition">
          <h3 className="text-xl font-semibold text-sky-400 mb-3">
            📊 Statistically Sound
          </h3>
          <p className="text-slate-300">
            Sequential testing, power analysis, and error control — baked in and
            explained clearly.
          </p>
        </div>

        <div className="bg-slate-800/60 p-6 rounded-2xl shadow-lg hover:bg-slate-800 transition">
          <h3 className="text-xl font-semibold text-sky-400 mb-3">
            📈 Decision-Ready Dashboards
          </h3>
          <p className="text-slate-300">
            Exportable charts, annotations, and reports designed for executive
            clarity and developer simplicity.
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-700 py-6 text-center text-slate-400 text-sm">
        © {new Date().getFullYear()} A/B Agent — Built with 💙 by Bhanu Mahesh
      </footer>
    </div>
  );
};

export default Home;

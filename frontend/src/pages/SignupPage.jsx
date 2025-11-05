import './Auth.css';
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { BeakerIcon } from "@heroicons/react/24/solid";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [error, setError] = useState("");
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(agencyName, email, password);
      navigate("/projects");
    } catch (err) {
      setError("Failed to create account. Email may already be in use.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg text-white px-4">
  <div className="auth-card flex flex-col md:flex-row bg-slate-800/40 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-slate-700 w-full max-w-5xl">

        {/* Left Visual */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-tr from-sky-500/40 to-sky-300/20 p-10">
          <div className="flex flex-col h-full justify-center text-center">
            <h2 className="text-3xl font-bold text-sky-300 mb-2">
              Create Your Agency
            </h2>
            <p className="text-slate-300">
              Start managing your experiments with intelligent A/B automation.
            </p>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop"
              alt="A/B testing visualization"
              className="mt-8 rounded-2xl shadow-lg object-cover"
            />
          </div>
        </div>

        {/* Right - Signup Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <BeakerIcon className="h-14 w-14 mx-auto text-sky-400" />
          <h2 className="text-3xl font-extrabold text-center mb-6">
            Create Agency Account
          </h2>

          {error && (
            <p className="text-red-400 bg-red-900/30 py-2 px-3 rounded text-center mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Agency Name
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold rounded-xl transition"
            >
              Sign Up
            </button>

            <p className="text-center text-slate-400 text-sm mt-3">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-sky-400 hover:text-sky-300 font-medium"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;

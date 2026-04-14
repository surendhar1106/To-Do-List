import { useState } from "react";
import { SignInForm } from "./SignInForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-400/30 mb-4">
            <span className="text-3xl">✦</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TaskElite</h1>
          <p className="text-indigo-300 text-lg">Your premium productivity companion</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <SignInForm />
        </div>
        <p className="text-center text-indigo-400/60 text-sm mt-6">
          Secure · Real-time · Beautiful
        </p>
      </div>
    </div>
  );
}

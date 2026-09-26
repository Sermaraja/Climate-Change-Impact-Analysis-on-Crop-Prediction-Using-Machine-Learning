import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-slate-800 shadow-glass">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-crop-500/20 to-climate-500/20 border border-crop-500/30 mb-4">
            <Sprout className="w-8 h-8 text-crop-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Farmer Portal Login</h2>
          <p className="text-xs text-slate-400 mt-2">
            Access climate risk assessments, farm boundaries & recovery predictions
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email or Phone Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="farmer@agriimpact.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-slate-400">
              <input type="checkbox" className="rounded bg-slate-900 border-slate-800 text-crop-500 focus:ring-crop-500 mr-2" />
              Remember me
            </label>
            <a href="#" className="text-crop-400 hover:text-crop-300">Forgot password?</a>
          </div>

          <Link
            to="/dashboard"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-crop-600 to-crop-500 hover:from-crop-500 hover:to-crop-400 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-crop-500/25 transition-all mt-6"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Don't have a farm account yet?{' '}
          <Link to="/register" className="text-crop-400 font-semibold hover:underline">
            Register your Farm
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, User, Mail, Lock, Phone, Globe, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth, type UserProfile } from '../context/AuthContext';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  preferred_language: z.enum(['EN', 'TA']),
});


type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      preferred_language: 'EN',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post<{ access_token: string; user: UserProfile }>('/auth/register', data);
      authRegister(response.data.access_token, response.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your inputs.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full glass-panel rounded-2xl p-8 border border-slate-800 shadow-glass">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-crop-500/20 to-climate-500/20 border border-crop-500/30 mb-4">
            <Sprout className="w-8 h-8 text-crop-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Farmer Account</h2>
          <p className="text-xs text-slate-400 mt-2">
            Join the Climate Impact Assessment system for crop survival & recovery intelligence
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                {...register('full_name')}
                type="text"
                placeholder="Kavitha Raman"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 transition-colors"
              />
            </div>
            {errors.full_name && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  {...register('phone')}
                  type="text"
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Preferred Language</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  {...register('preferred_language')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white focus:outline-none focus:border-crop-500 transition-colors"
                >
                  <option value="EN">English</option>
                  <option value="TA">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                {...register('email')}
                type="email"
                placeholder="farmer@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 transition-colors"
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-crop-600 to-crop-500 hover:from-crop-500 hover:to-crop-400 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-crop-500/25 transition-all mt-6 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register & Initialize Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-crop-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

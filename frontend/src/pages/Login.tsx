import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/common/LanguageToggle';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t, setLanguage } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);

  const loginSchema = z.object({
    email: z.string().email(t('validation.invalid_email', 'Please enter a valid email address')),
    password: z.string().min(6, t('validation.password_min', 'Password must be at least 6 characters')),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post<{ access_token: string; user: UserProfile }>('/auth/login', data);
      const user = response.data.user;
      login(response.data.access_token, user);

      // If user profile has preferred_language, update language state
      if (user.preferred_language) {
        const langCode = user.preferred_language.toLowerCase() === 'ta' ? 'ta' : 'en';
        await setLanguage(langCode);
      }

      const firstName = user.full_name ? user.full_name.split(' ')[0] : 'Farmer';

      if (user.onboarding_completed === false) {
        navigate('/welcome', { replace: true });
      } else {
        showToast({
          type: 'success',
          message: `${t('dashboard.greeting', { name: firstName })}`,
          secondaryMessage: t('login.subtitle', "Here's the latest view of your farms and crop-risk conditions."),
          duration: 6000,
        });
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || t('auth.login.invalid_credentials', 'Invalid email or password credentials.');
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-slate-800 shadow-glass relative">
        {/* Language selector in card header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            ← {t('buttons.back', 'Back')}
          </Link>
          <LanguageToggle variant="pill" />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-crop-500/20 to-climate-500/20 border border-crop-500/30 mb-3">
            <Sprout className="w-8 h-8 text-crop-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{t('auth.login.title', 'Welcome Back')}</h2>
          <p className="text-xs text-slate-400 mt-2">
            {t('auth.login.subtitle', 'Sign in to monitor rainfall impact, waterlogging risk, and crop protection guidance.')}
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {t('auth.login.email_label', 'Email Address')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                {...register('email')}
                type="email"
                placeholder={t('auth.login.email_placeholder', 'farmer@example.com')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 transition-colors"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                {t('auth.login.password_label', 'Password')}
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                {...register('password')}
                type="password"
                placeholder={t('auth.login.password_placeholder', '••••••••')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crop-500 focus:ring-1 focus:ring-crop-500 transition-colors"
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
                <span>{t('auth.login.signing_in', 'Signing In...')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.login.sign_in_btn', 'Sign In')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {t('auth.login.no_account', "Don't have an account?")}{' '}
          <Link to="/register" className="text-crop-400 font-semibold hover:underline">
            {t('auth.login.create_account', 'Create Account')}
          </Link>
        </div>
      </div>
    </div>
  );
};

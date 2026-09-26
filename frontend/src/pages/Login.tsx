import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sprout,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/common/LanguageToggle';

import slide1 from '../assets/farm_slide_1.jpg';
import slide2 from '../assets/farm_slide_2.jpg';
import slide3 from '../assets/farm_slide_3.jpg';
import slide4 from '../assets/farm_slide_4.jpg';

/* ─── Validation ─────────────────────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

/* ─── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    img: slide1,
    caption: 'Cauvery Delta',
    sub: 'Paddy fields at golden hour — Thanjavur, Tamil Nadu',
  },
  {
    img: slide2,
    caption: 'Cotton Harvest',
    sub: 'Traditional hand-picking — Virudhunagar, Tamil Nadu',
  },
  {
    img: slide3,
    caption: 'Smart Farming',
    sub: 'Real-time crop monitoring during the monsoon',
  },
  {
    img: slide4,
    caption: 'Village Sunrise',
    sub: 'Canal-fed paddy fields at dawn — Cauvery Delta',
  },
];

/* ─── Image Slider ───────────────────────────────────────────────────────── */
function FarmSlider() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => {
      setActive(idx);
      setFading(false);
    }, 350);
  }, []);

  // Auto-advance every 5 s
  useEffect(() => {
    const t = setInterval(() => {
      goTo((active + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [active, goTo]);

  const prev = () => goTo((active - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((active + 1) % SLIDES.length);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[24px] lg:rounded-r-[28px] lg:rounded-l-none select-none">
      {/* Image */}
      <img
        key={active}
        src={SLIDES[active].img}
        alt={SLIDES[active].caption}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
        draggable={false}
      />

      {/* Gradient overlay — dark at bottom for caption legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* CropClimate AI badge — top-right */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
        <Sprout className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold text-white tracking-wide">CropClimate AI</span>
      </div>

      {/* Caption — bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-4 transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <p className="text-white font-extrabold text-lg leading-tight drop-shadow-lg">
          {SLIDES[active].caption}
        </p>
        <p className="text-white/75 text-xs font-medium mt-0.5 drop-shadow">
          {SLIDES[active].sub}
        </p>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 mt-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full cursor-pointer"
              style={{
                width: i === active ? '24px' : '7px',
                height: '7px',
                background: i === active ? '#ffffff' : 'rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        aria-label="Next slide"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Reusable light input ───────────────────────────────────────────────── */
function LightInput(props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { hasError, onFocus, onBlur, ...rest } = props;
  return (
    <input
      {...rest}
      className="w-full px-4 py-3 rounded-[13px] text-[13px] text-slate-800 placeholder-slate-400 transition-all outline-none bg-[#f8faf8]"
      style={{
        border: hasError ? '1.5px solid #f87171' : '1.5px solid #e2e8f0',
      }}
      onFocus={(e) => {
        e.currentTarget.style.border = '1.5px solid #10b981';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.10)';
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = hasError ? '1.5px solid #f87171' : '1.5px solid #e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
        onBlur?.(e);
      }}
    />
  );
}

/* ─── Main Login Page ────────────────────────────────────────────────────── */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t, setLanguage } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post<{ access_token: string; user: UserProfile }>(
        '/auth/login',
        data,
      );
      const user = response.data.user;
      login(response.data.access_token, user);
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
          secondaryMessage: t(
            'login.subtitle',
            "Here's the latest view of your farms and crop-risk conditions.",
          ),
          duration: 6000,
        });
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        t('auth.login.invalid_credentials', 'Invalid email or password. Please try again.');
      setServerError(msg);
    }
  };

  return (
    /* Page shell */
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ background: '#eef1f5' }}>

      {/* ── Main card ── */}
      <div
        className="w-full max-w-[1160px] bg-white flex flex-col lg:flex-row overflow-hidden"
        style={{
          borderRadius: '30px',
          minHeight: '640px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.07)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* ══ LEFT — Form ══ */}
        <div className="flex-1 lg:max-w-[46%] flex flex-col justify-between p-8 sm:p-10 lg:p-12">

          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="CropClimate AI home">
              <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                CropClimate <span className="text-emerald-600">AI</span>
              </span>
            </Link>
            <LanguageToggle variant="light" />
          </div>

          {/* Form body */}
          <div className="flex-1 flex flex-col justify-center py-8 sm:py-10 space-y-7">

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-[42px] font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                {t('auth.login.welcome_heading_line1', 'Welcome to')}<br />
                <span className="text-emerald-700">CropClimate AI</span>
              </h1>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-[340px]">
                {t('auth.login.tagline', 'Farm-specific climate and crop intelligence to help you understand rainfall impact, crop risk and recovery.')}
              </p>
            </div>

            {/* Welcome back */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[12px] font-bold text-slate-700">
                  {t('auth.login.welcome_back_label', 'Welcome Back')}
                </span>
              </div>
              <p className="text-[12px] text-slate-400 pl-[22px]">
                {t('auth.login.welcome_back_sub', 'Sign in to monitor your farms and crop impact.')}
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <div
                className="flex items-center gap-2.5 p-3 rounded-xl text-rose-700 text-xs"
                style={{ background: '#fff5f5', border: '1px solid #fecaca' }}
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-[12px] font-semibold text-slate-700">
                  {t('auth.login.email_label', 'Email Address')}
                </label>
                <LightInput
                  id="login-email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.login.email_placeholder', 'Enter your email address')}
                  hasError={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p id="email-error" className="text-[11px] text-rose-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" />{errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-[12px] font-semibold text-slate-700">
                    {t('auth.login.password_label', 'Password')}
                  </label>
                  <Link to="/forgot-password" tabIndex={-1} className="text-[11px] text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors">
                    {t('auth.login.forgot_password', 'Forgot Password?')}
                  </Link>
                </div>
                <div className="relative">
                  <LightInput
                    id="login-password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('auth.login.password_placeholder', 'Enter your password')}
                    hasError={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                    style={{ paddingRight: '2.75rem' } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-[11px] text-rose-500 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3" />{errors.password.message}
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex items-center gap-2 text-[13px] font-bold transition-all cursor-pointer disabled:opacity-50"
                  style={{ color: '#16a34a' }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('auth.login.signing_in', 'Signing In…')}</span></>
                  ) : (
                    <>
                      <span className="border-b border-emerald-600/0 group-hover:border-emerald-600 pb-px transition-all">
                        {t('auth.login.sign_in_btn', 'Sign In')}
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[12px] text-slate-500">
              {t('auth.login.no_account', 'New to CropClimate AI?')}{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                {t('auth.login.create_account', 'Create an account')}
              </Link>
            </p>
          </div>
        </div>

        {/* ══ RIGHT — Farm Image Slider ══ */}
        <div className="hidden lg:block flex-1 relative p-2.5">
          <FarmSlider />
        </div>

        {/* Mobile strip */}
        <div
          className="lg:hidden h-40 relative overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={SLIDES[0].img}
            alt="Tamil Nadu Farm"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end px-5 pb-4">
            <span className="text-white text-xs font-bold drop-shadow">
              Cauvery Delta — CropClimate AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

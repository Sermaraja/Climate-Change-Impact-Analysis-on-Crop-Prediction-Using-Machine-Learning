import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { useLanguage, type SupportedLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/common/LanguageToggle';

import slide1 from '../assets/farm_slide_1.jpg';
import slide2 from '../assets/farm_slide_2.jpg';
import slide3 from '../assets/farm_slide_3.jpg';
import slide4 from '../assets/farm_slide_4.jpg';

/* ─── Validation ─────────────────────────────────────────────────────────── */
const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  preferred_language: z.enum(['EN', 'TA']),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

/* ─── Slides ─────────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    img: slide2,
    captionEn: 'Cotton Harvest',
    captionTa: 'பருத்தி அறுவடை',
    subEn: 'Traditional hand-picking — Virudhunagar, TN',
    subTa: 'பாரம்பரிய கை அறுவடை — விருதுநகர், தமிழ்நாடு',
  },
  {
    img: slide3,
    captionEn: 'Smart Farming',
    captionTa: 'துல்லிய விவசாயம்',
    subEn: 'Real-time crop monitoring during the monsoon',
    subTa: 'பருவமழை காலத்தில் நிகழ்நேர பயிர் கண்காணிப்பு',
  },
  {
    img: slide1,
    captionEn: 'Cauvery Delta',
    captionTa: 'காவிரி டெல்டா',
    subEn: 'Paddy fields at golden hour — Thanjavur, TN',
    subTa: 'பொன்மாலையில் நெல் வயல்கள் — தஞ்சாவூர், தமிழ்நாடு',
  },
  {
    img: slide4,
    captionEn: 'Village Sunrise',
    captionTa: 'கிராம விடியல்',
    subEn: 'Canal-fed paddy fields at dawn',
    subTa: 'விடியற்காலை வாய்க்கால் பாசன நெல் வயல்கள்',
  },
];

/* ─── Slider ─────────────────────────────────────────────────────────────── */
function FarmSlider() {
  const { language } = useLanguage();
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((idx: number) => {
    setFading(true);
    setTimeout(() => { setActive(idx); setFading(false); }, 350);
  }, []);

  useEffect(() => {
    const t = setInterval(() => goTo((active + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [active, goTo]);

  const caption = language === 'ta' ? SLIDES[active].captionTa : SLIDES[active].captionEn;
  const sub = language === 'ta' ? SLIDES[active].subTa : SLIDES[active].subEn;

  const featurePills = [
    { icon: '🌧', label: language === 'ta' ? 'மழை பாதிப்பு பகுப்பாய்வு' : 'Rainfall Impact Analysis' },
    { icon: '🌾', label: language === 'ta' ? 'பயிர் வளர்ச்சி நிலை கணிப்பு' : 'Crop Stage Intelligence' },
    { icon: '💧', label: language === 'ta' ? 'நீர் தேக்க அபாய இயந்திரம்' : 'Waterlogging Risk Engine' },
    { icon: '📊', label: language === 'ta' ? 'ML பயிர் சேத முன்னறிவிப்பு' : 'ML Damage Prediction' },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[24px] lg:rounded-r-[28px] lg:rounded-l-none select-none">
      <img
        key={active}
        src={SLIDES[active].img}
        alt={caption}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.72) 100%)' }} />

      {/* Brand badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
        <Sprout className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-bold text-white tracking-wide">CropClimate AI</span>
      </div>

      {/* Feature pills — mid-panel */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 space-y-2" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s' }}>
        {featurePills.map((f) => (
          <div key={f.label} className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15">
            <span className="text-sm">{f.icon}</span>
            <span className="text-[11px] text-white font-semibold">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-4" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s' }}>
        <p className="text-white font-extrabold text-lg leading-tight drop-shadow-lg">{caption}</p>
        <p className="text-white/75 text-xs font-medium mt-0.5 drop-shadow">{sub}</p>
        <div className="flex items-center gap-2 mt-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full cursor-pointer"
              style={{ width: i === active ? '24px' : '7px', height: '7px', background: i === active ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
            />
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button aria-label="Previous" onClick={() => goTo((active - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors cursor-pointer">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button aria-label="Next" onClick={() => goTo((active + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors cursor-pointer">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}


/* ─── Reusable light input ───────────────────────────────────────────────── */
function LightInput(props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { hasError, onFocus, onBlur, style, ...rest } = props;
  return (
    <input
      {...rest}
      className="w-full px-4 py-2.5 rounded-[13px] text-[13px] text-slate-800 placeholder-slate-400 transition-all outline-none bg-[#f8faf8]"
      style={{ border: hasError ? '1.5px solid #f87171' : '1.5px solid #e2e8f0', ...style }}
      onFocus={(e) => { e.currentTarget.style.border = '1.5px solid #10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.10)'; onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.border = hasError ? '1.5px solid #f87171' : '1.5px solid #e2e8f0'; e.currentTarget.style.boxShadow = 'none'; onBlur?.(e); }}
    />
  );
}

/* ─── Field error ────────────────────────────────────────────────────────── */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1" role="alert">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </p>
  );
}

/* ─── Main Register Page ─────────────────────────────────────────────────── */
export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { preferred_language: language === 'ta' ? 'TA' : 'EN' },
  });

  useEffect(() => {
    setValue('preferred_language', language === 'ta' ? 'TA' : 'EN');
  }, [language, setValue]);

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const response = await apiClient.post<{ access_token: string; user: UserProfile }>('/auth/register', data);
      authRegister(response.data.access_token, response.data.user);
      const selectedLang = data.preferred_language.toLowerCase() as SupportedLanguage;
      await setLanguage(selectedLang);
      navigate('/welcome', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.detail || t('validation.server_error', 'Registration failed. Please check your inputs.');
      setServerError(msg);
    }
  };

  const benefits = [
    language === 'ta' ? 'பண்ணை சார்ந்த மழை & நீர் தேக்க அபாயம்' : 'Farm-specific rainfall & waterlogging risk',
    language === 'ta' ? 'ML அடிப்படையிலான பயிர் சேத கணிப்பு' : 'Crop stage damage prediction using ML',
    language === 'ta' ? 'நிகழ்நேர எச்சரிக்கைகள் & வேளாண் செயல் வழிகாட்டி' : 'Real-time alerts & agronomic action guide',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{ background: '#eef1f5' }}>
      <div
        className="w-full max-w-[1160px] bg-white flex flex-col lg:flex-row overflow-hidden"
        style={{
          borderRadius: '30px',
          minHeight: '700px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.07)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* ══ LEFT — Register Form ══ */}
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
          <div className="flex-1 flex flex-col justify-center py-6 sm:py-8 space-y-5">

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-[36px] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                {t('auth.register.heading_line1', 'Join')}{' '}
                <span className="text-emerald-700">CropClimate AI</span>
              </h1>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-[340px]">
                {t('auth.register.subtitle', 'Create your free farmer account and start monitoring crop risk today.')}
              </p>
              {/* Benefits list */}
              <ul className="space-y-1 pt-1">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-[11px] text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
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
            <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="block text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  {t('auth.register.full_name_label', 'Full Name')}
                </label>
                <LightInput
                  id="reg-name"
                  {...register('full_name')}
                  type="text"
                  autoComplete="name"
                  placeholder={t('auth.register.full_name_placeholder', 'e.g. Mani Selvam')}
                  hasError={!!errors.full_name}
                />
                <FieldError msg={errors.full_name?.message} />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="block text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {t('auth.register.email_label', 'Email Address')}
                </label>
                <LightInput
                  id="reg-email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth.register.email_placeholder', 'farmer@example.com')}
                  hasError={!!errors.email}
                />
                <FieldError msg={errors.email?.message} />
              </div>

              {/* Phone + Language — 2-col */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="reg-phone" className="block text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {t('auth.register.phone_label', 'Phone')}
                    <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <LightInput
                    id="reg-phone"
                    {...register('phone')}
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="reg-lang" className="block text-[12px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-400" />
                    {t('auth.register.preferred_lang_label', 'Language')}
                  </label>
                  <select
                    id="reg-lang"
                    {...register('preferred_language')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setValue('preferred_language', val as 'EN' | 'TA');
                      setLanguage(val.toLowerCase() as SupportedLanguage);
                    }}
                    className="w-full px-4 py-2.5 rounded-[13px] text-[13px] text-slate-800 bg-[#f8faf8] outline-none cursor-pointer transition-all"
                    style={{ border: '1.5px solid #e2e8f0' }}
                    onFocus={(e) => { e.currentTarget.style.border = '1.5px solid #10b981'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.10)'; }}
                    onBlur={(e) => { e.currentTarget.style.border = '1.5px solid #e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="EN">English</option>
                    <option value="TA">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="block text-[12px] font-semibold text-slate-700">
                  {t('auth.register.password_label', 'Create Password')}
                </label>
                <div className="relative">
                  <LightInput
                    id="reg-password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('auth.register.password_placeholder', 'At least 6 characters')}
                    hasError={!!errors.password}
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
                <FieldError msg={errors.password?.message} />
                {/* Password strength hint */}
                <div className="flex gap-1 pt-0.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full bg-slate-200" />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  {language === 'ta'
                    ? 'குறைந்தபட்சம் 6 எழுத்துகள். எழுத்துகள் மற்றும் எண்களைக் கலந்து பயன்படுத்தவும்.'
                    : 'Minimum 6 characters. Use a mix of letters and numbers for a stronger password.'}
                </p>
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex items-center gap-2 text-[13px] font-bold transition-all cursor-pointer disabled:opacity-50"
                  style={{ color: '#16a34a' }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>{t('auth.register.registering', 'Creating Account…')}</span></>
                  ) : (
                    <>
                      <span className="border-b border-emerald-600/0 group-hover:border-emerald-600 pb-px transition-all">
                        {t('auth.register.register_btn', 'Create Account')}
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              {/* Terms note */}
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {language === 'ta' ? (
                  <>
                    கணக்கை உருவாக்குவதன் மூலம் எங்கள்{' '}
                    <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">சேவை விதிமுறைகள்</span>
                    {' '}மற்றும்{' '}
                    <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">தனியுரிமைக் கொள்கையை</span> ஏற்கிறீர்கள்.
                  </>
                ) : (
                  <>
                    By creating an account you agree to our{' '}
                    <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
                  </>
                )}
              </p>
            </form>
          </div>

          {/* Bottom */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[12px] text-slate-500">
              {t('auth.register.already_have_account', 'Already have an account?')}{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                {t('auth.register.sign_in', 'Sign In')}
              </Link>
            </p>
          </div>
        </div>

        {/* ══ RIGHT — Farm Image Slider ══ */}
        <div className="hidden lg:block flex-1 relative p-2.5">
          <FarmSlider />
        </div>

        {/* Mobile strip */}
        <div className="lg:hidden h-40 relative overflow-hidden" aria-hidden="true">
          <img src={SLIDES[1].img} alt="Tamil Nadu Farm" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end px-5 pb-4">
            <span className="text-white text-xs font-bold drop-shadow">
              {language === 'ta' ? 'பருத்தி அறுவடை — CropClimate AI' : 'Cotton Harvest — CropClimate AI'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, ArrowRight, ArrowLeft, X, CheckCircle, HelpCircle } from 'lucide-react';

export interface TourStep {
  targetAttr?: string;
  title: string;
  description: string;
  supportingText?: string;
  route?: string;
}

export const ProductTour: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user, updateOnboardingStatus } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState<boolean>(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = useMemo(() => {
    if (language === 'ta') {
      return [
        {
          title: 'CropClimate AI-க்கு வரவேற்கிறோம்',
          description: 'உங்கள் பண்ணைகளுக்கான மழை மற்றும் பயிர் பாதிப்பு அபாயத்தைப் புரிந்து கொள்ள உதவும் கருவிகளைப் பற்றிய விரைவு வழிகாட்டி.',
        },
        {
          targetAttr: 'my-farms',
          title: 'என் பண்ணைகள்',
          description: 'உங்கள் பண்ணைகளைச் சேர்த்து நிர்வகிக்கவும், அவற்றின் எல்லைகளை வரைபடத்தில் குறிக்கவும், ஒவ்வொரு பண்ணையின் பயிர் தகவலையும் ஒரே இடத்தில் வைக்கவும்.',
          route: '/farms',
        },
        {
          targetAttr: 'farm-map',
          title: 'உங்கள் பண்ணையை வரைபடத்தில் குறிக்கவும்',
          description: 'உங்கள் இருப்பிடத்தைப் பயன்படுத்தவும் அல்லது வரைபடத்தில் தேடவும், பின்னர் பண்ணைக்கான பிரத்யேக பகுப்பாய்விற்கு எல்லைக்கோட்டை வரையவும்.',
          supportingText: 'பண்ணை எல்லைகள் போஸ்ட்கிஸ் (PostGIS) முறையில் பாதுகாப்பாக சேமிக்கப்படுகின்றன.',
          route: '/farms/new',
        },
        {
          targetAttr: 'crop-profile',
          title: 'பயிர் விவரங்களைச் சேர்க்கவும்',
          description: 'பயிரின் வகை மற்றும் விதைத்த தேதியைச் சேர்க்கவும். பயிரின் வயது மற்றும் வளர்ச்சி நிலை ஆகியவை மழையால் ஏற்படும் பாதிப்பை கணிக்க உதவுகின்றன.',
          route: '/farms',
        },
        {
          targetAttr: 'weather',
          title: 'வரவிருக்கும் மழையைக் கண்காணிக்கவும்',
          description: 'உங்கள் பண்ணைக்கான தற்போதைய வானிலை, வரவிருக்கும் மழையளவு மற்றும் சமீபத்திய மழை நிலவரங்களைப் பார்க்கவும்.',
          supportingText: 'அடுத்த 24 மற்றும் 48 மணி நேரம் உட்பட பல கால அளவுகளில் மழை பகுப்பாய்வு செய்யப்படுகிறது.',
          route: '/weather',
        },
        {
          targetAttr: 'analyse-crop',
          title: 'மழை பாதிப்பை பகுப்பாய்வு செய்',
          description: 'இதுவே CropClimate AI-ன் மையப்பகுதி. இது மழை, பயிர் பருவம், மண் நிலை, வடிகால் மற்றும் நீர் தேக்க அபாயத்தை ஒருங்கிணைத்து பயிர் பாதிப்பை கணிக்கிறது.',
          route: '/rain-impact',
        },
        {
          targetAttr: 'prediction-explanation',
          title: 'கணிப்பின் காரணங்களைப் புரிந்து கொள்ளுங்கள்',
          description: 'CropClimate AI ஒரு அபாய அளவை மட்டும் காட்டுவதில்லை. இந்த முடிவிற்குக் காரணமான முக்கிய காரணிகளையும் விளக்குகிறது.',
          supportingText: 'மழை அபாயம், நீர் தேக்கம், பயிர் சேதம், உயிர்வாழ்வு, மீட்பு மற்றும் இழப்பு அபாய காரணிகள் அடங்கும்.',
          route: '/rain-impact',
        },
        {
          targetAttr: 'climate-analysis',
          title: 'காலநிலை & முந்தைய கணிப்புகளை ஆராயுங்கள்',
          description: 'நீண்ட கால மழை மற்றும் வெப்பநிலை போக்குகளை மதிப்பாய்வு செய்யவும், முந்தைய பண்ணை இடர் பகுப்பாய்வுகளை மீண்டும் பார்க்கவும்.',
          route: '/climate-analysis',
        },
      ];
    }

    return [
      {
        title: 'Welcome to CropClimate AI',
        description: "Let's take a quick tour of the tools that help you understand rainfall and crop risk for your farms.",
      },
      {
        targetAttr: 'my-farms',
        title: 'Your Farms',
        description: "Add and manage your farms, map their boundaries and keep each farm's crop information in one place.",
        route: '/farms',
      },
      {
        targetAttr: 'farm-map',
        title: 'Map Your Farm',
        description: 'Use your location or search the map, then draw the actual farm boundary for farm-specific analysis.',
        supportingText: 'Farm boundaries are stored securely using geospatial PostGIS data.',
        route: '/farms/new',
      },
      {
        targetAttr: 'crop-profile',
        title: "Tell Us What's Growing",
        description: 'Add the crop and planting date. Crop age and growth stage help the system understand how rainfall may affect the crop.',
        route: '/farms',
      },
      {
        targetAttr: 'weather',
        title: 'Monitor Upcoming Rain',
        description: 'View current weather, upcoming rainfall and recent rainfall conditions for your farm.',
        supportingText: 'Rainfall is analysed over multiple time windows, including the next 24 and 48 hours.',
        route: '/weather',
      },
      {
        targetAttr: 'analyse-crop',
        title: 'Analyse Rain Impact',
        description: 'This is the heart of CropClimate AI. It combines rainfall, crop stage, soil conditions, drainage and waterlogging risk to assess potential crop impact.',
        route: '/rain-impact',
      },
      {
        targetAttr: 'prediction-explanation',
        title: 'Understand the Prediction',
        description: "CropClimate AI doesn't just show a risk level. It explains the main factors contributing to the result.",
        supportingText: 'Includes Rain Risk, Waterlogging, Damage, Survival, Recovery and Loss Risk factors.',
        route: '/rain-impact',
      },
      {
        targetAttr: 'climate-analysis',
        title: 'Explore Climate & Past Analysis',
        description: 'Review long-term rainfall and temperature trends and revisit previous farm-risk analyses.',
        route: '/climate-analysis',
      },
    ];
  }, [language]);

  // Update target element positioning
  useEffect(() => {
    if (!isOpen) return;

    const activeStep = steps[currentStep];
    if (activeStep?.targetAttr) {
      const el = document.querySelector(`[data-tour="${activeStep.targetAttr}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isOpen, steps]);

  // Keyboard navigation listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSkipConfirm(true);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      if (steps[nextIdx]?.route) {
        navigate(steps[nextIdx].route!);
      }
    } else {
      // Completed last step
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      if (steps[prevIdx]?.route) {
        navigate(steps[prevIdx].route!);
      }
    }
  };

  const handleFinish = async () => {
    await updateOnboardingStatus(user?.onboarding_completed ?? true, 'COMPLETED');
    onClose();
  };

  const handleSkipConfirm = async () => {
    await updateOnboardingStatus(user?.onboarding_completed ?? true, 'DISMISSED');
    setShowSkipConfirm(false);
    onClose();
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-auto">
      {/* Dark Backdrop Overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"></div>

      {/* Target Element Spotlight Ring */}
      {targetRect && (
        <div
          className="absolute rounded-xl border-4 border-emerald-400 bg-emerald-400/10 shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all duration-300 pointer-events-none"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        ></div>
      )}

      {/* Tour Step Card Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {showSkipConfirm ? (
          /* Skip Confirmation Dialog */
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 z-10 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              <h4 className="text-lg font-bold">{t('auth.tour.skip_confirm_title', 'Skip the tour?')}</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('auth.tour.skip_confirm_desc', 'You can start the tour anytime from the Help button in your navigation bar.')}
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {t('auth.tour.continue_tour', 'Continue Tour')}
              </button>
              <button
                onClick={handleSkipConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {t('auth.tour.skip_for_now', 'Skip for Now')}
              </button>
            </div>
          </div>
        ) : isLastStep ? (
          /* Completion Modal */
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 z-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('auth.tour.ready_title', "You're Ready to Go")}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('auth.tour.ready_desc', 'Your farm, crop and weather information can now work together to help you understand rainfall-related crop risk.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleFinish();
                  navigate('/rain-impact');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer"
              >
                {t('cropImpact.run_analysis', 'Analyse My Crop')}
              </button>
              <button
                onClick={() => {
                  handleFinish();
                  navigate('/dashboard');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm cursor-pointer"
              >
                {t('auth.tour.go_dashboard_btn', 'Go to Dashboard')}
              </button>
            </div>
          </div>
        ) : (
          /* Step Card Modal */
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 z-10 space-y-5">
            {/* Step Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-900 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  <Sprout className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('auth.tour.step', { current: currentStep + 1, total: steps.length })}
                </span>
              </div>
              <button
                onClick={() => setShowSkipConfirm(true)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center space-x-1 cursor-pointer"
              >
                <span>{t('auth.tour.skip', 'Skip')}</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center space-x-1.5 py-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-emerald-700'
                      : idx < currentStep
                      ? 'w-2 bg-emerald-300'
                      : 'w-2 bg-slate-200'
                  }`}
                ></div>
              ))}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              {step.supportingText && (
                <p className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-md font-medium border border-emerald-100 mt-2">
                  {step.supportingText}
                </p>
              )}
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                  currentStep === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('buttons.back', 'Back')}</span>
              </button>

              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>{currentStep === 0 ? t('auth.tour.start_tour', 'Start Tour') : t('buttons.next', 'Next')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTour;

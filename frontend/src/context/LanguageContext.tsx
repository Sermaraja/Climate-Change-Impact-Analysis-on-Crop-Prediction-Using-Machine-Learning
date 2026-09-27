import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n, { allNamespaces } from '../i18n';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/api';

export type SupportedLanguage = 'en' | 'ta';

export interface ActionCardItem {
  title: string;
  action: string;
  reason?: string;
  timing?: string;
  priority?: string;
  evidence_reference?: string;
  [key: string]: any;
}

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (keyOrText: string, fallbackOrOptions?: string | Record<string, any>) => string;
  translateCrop: (cropName?: string | null) => string;
  translateStage: (stage?: string | null) => string;
  translateSoilType: (soil?: string | null) => string;
  translateDrainage: (drainage?: string | null) => string;
  translateRisk: (risk?: string | null) => string;
  translateFactor: (factor?: string | null) => string;
  translateWhyStatement: (stmt?: string | null) => string;
  translateFarmerAction: (text?: string | null) => string;
  translateActionCard: (action: any) => ActionCardItem;
  translateTechnicalFeature: (feature?: string | null) => string;
  translateGreeting: (greeting?: string | null) => string;
  translateStatus: (status?: string | null) => string;
  translateWeatherWarning: (warning: any) => any;
  translateText: (text?: string | null) => string;
}

// ─── Comprehensive Professional Farmer Tamil Dictionary ───────────────────────
const TAMIL_MAP: Record<string, string> = {
  // Navigation & Core
  'Dashboard': 'முகப்புப் பலகை',
  'Farm & Crop Impact': 'பண்ணை & பயிர் பாதிப்பு',
  'Crop Impact': 'பயிர் பாதிப்பு',
  'My Farms': 'என் பண்ணைகள்',
  'Add Farm': 'பண்ணை சேர்',
  'Add New Farm': 'புதிய பண்ணை சேர்',
  'Weather': 'வானிலை',
  'Weather Forecast': 'வானிலை முன்னறிவிப்பு',
  'Recovery': 'மீட்பு கணிப்பு',
  'Recovery Prediction': 'மீட்பு கணிப்பு',
  'Climate': 'காலநிலை',
  'Climate Change Trends': 'காலநிலை மாற்றப் போக்குகள்',
  'Climate Trends': 'காலநிலை போக்குகள்',
  'History': 'வரலாறு',
  'Prediction History': 'கணிப்பு வரலாறு',
  'Reports': 'அறிக்கைகள்',
  'Reports & Export': 'அறிக்கைகள் & பதிவிறக்கம்',
  'Settings': 'அமைப்புகள்',
  'Help / Tour': 'உதவி / வழிகாட்டி',
  'Tour': 'வழிகாட்டி',
  'Alerts': 'எச்சரிக்கைகள்',
  'Farm & Crop Alerts': 'பண்ணை & பயிர் எச்சரிக்கைகள்',
  'Sign In': 'உள்நுழைக',
  'Sign In →': 'உள்நுழைக →',
  'Register': 'பதிவு செய்',
  'Logout': 'வெளியேறு',
  'Sign Out': 'வெளியேறு',

  // Buttons & Common Actions
  'Save': 'சேமி',
  'Cancel': 'ரத்து செய்',
  'Delete': 'நீக்கு',
  'Edit': 'திருத்து',
  'Close': 'மூடு',
  'Back': 'பின்செல்',
  'Next': 'அடுத்து',
  'Finish': 'முடி',
  'Skip': 'தவிர்',
  'Continue': 'தொடர்க',
  'Submit': 'சமர்ப்பி',
  'Search': 'தேடு',
  'Filter': 'வடிகட்டு',
  'Reset': 'மீட்டமை',
  'Refresh': 'புதுப்பி',
  'Refresh Alerts': 'எச்சரிக்கைகளைப் புதுப்பி',
  'Print / Download': 'அச்சிடு / பதிவிறக்கு',
  'Print / Download Report': 'அறிக்கையை அச்சிடு / பதிவிறக்கு',
  'Download PDF': 'PDF பதிவிறக்கு',
  'Export CSV': 'CSV பதிவிறக்கு',
  'View Details': 'விவரங்களைப் பார்',
  'View Full Analysis': 'முழு பகுப்பாய்வைப் பார்',
  'Full Analysis': 'முழு பகுப்பாய்வு',
  'Full Explanation': 'முழு விளக்கம்',
  'Full Agronomic Guide': 'முழு வேளாண் வழிகாட்டி',
  'Full Weather Forecast': 'முழு வானிலை முன்னறிவிப்பு',
  'Analyse Now': 'இப்போதே பகுப்பாய்வு செய்',
  'Analyse All My Farms': 'என் அனைத்து பண்ணைகளையும் பகுப்பாய்வு செய்',
  'Analyse All Farms': 'அனைத்து பண்ணைகளையும் பகுப்பாய்வு செய்',
  'Add My First Farm': 'என் முதல் பண்ணையைச் சேர்',
  'Take a quick tour?': 'செயலியைப் பற்றி தெரிந்து கொள்ள வழிகாட்டியைப் பார்க்கலாமா?',
  'Start Tour': 'வழிகாட்டியைத் தொடங்கு',
  'Maybe Later': 'பிறகு பார்க்கலாம்',
  'Explore Dashboard': 'முகப்பைப் பார்',
  'Use My Current Location': 'தற்போதைய இருப்பிடத்தைப் பயன்படுத்து',
  'Locating...': 'இருப்பிடம் கண்டறியப்படுகிறது...',
  'Undo': 'செயல்தவிர்',
  'Clear': 'அழி',
  'Fit Farm': 'பண்ணை முழுவதையும் காட்டு',
  'Acknowledge': 'ஏற்றுக்கொள்',
  'Mark as Resolved': 'தீர்க்கப்பட்டதாகக் குறி',
  'Submit Observation': 'கள ஆய்வை சமர்ப்பி',
  'Submit Post-Rain Field Assessment': 'மழைக்குப் பிந்தைய கள ஆய்வை சமர்ப்பி',

  // Greetings & Status
  'Good Morning': 'இனிய காலை வணக்கம்',
  'Good Afternoon': 'இனிய மதிய வணக்கம்',
  'Good Evening': 'இனிய மாலை வணக்கம்',
  'Farmer': 'விவசாயி',
  'Active': 'செயலில் உள்ளது',
  'Acknowledged': 'ஏற்றுக்கொள்ளப்பட்டது',
  'Resolved': 'தீர்க்கப்பட்டது',
  'All': 'அனைத்தும்',
  'Online': 'இணைப்பில் உள்ளது',
  'Offline': 'இணைப்பு இல்லை',
  'Loading...': 'ஏற்றப்படுகிறது...',
  'Saving...': 'சேமிக்கப்படுகிறது...',
  'Submitting...': 'சமர்ப்பிக்கப்படுகிறது...',
  'Analyzing...': 'பகுப்பாய்வு செய்யப்படுகிறது...',
  'Verified': 'சரிபார்க்கப்பட்டது',
  'Estimated': 'கணிக்கப்பட்டது',
  'Unavailable': 'கிடைக்கவில்லை',
  'Safe': 'பாதுகாப்பானது',
  'Attention': 'கவனம் தேவை',

  // Scan Steps
  'Checking farm locations…': 'பண்ணை அமைவிடங்கள் சரிபார்க்கப்படுகின்றன…',
  'Checking farm locations...': 'பண்ணை அமைவிடங்கள் சரிபார்க்கப்படுகின்றன…',
  'Retrieving weather data…': 'வானிலை தரவுகள் பெறப்படுகின்றன…',
  'Retrieving weather...': 'வானிலை தரவுகள் பெறப்படுகின்றன…',
  'Analysing rainfall…': 'மழையளவு பகுப்பாய்வு செய்யப்படுகிறது…',
  'Analysing rainfall...': 'மழையளவு பகுப்பாய்வு செய்யப்படுகிறது…',
  'Checking soil & drainage…': 'மண் மற்றும் வடிகால் ஆய்வு செய்யப்படுகிறது…',
  'Checking soil and drainage...': 'மண் மற்றும் வடிகால் ஆய்வு செய்யப்படுகிறது…',
  'Evaluating waterlogging…': 'நீர் தேக்க நிலை மதிப்பீடு செய்யப்படுகிறது…',
  'Evaluating waterlogging...': 'நீர் தேக்க நிலை மதிப்பீடு செய்யப்படுகிறது…',
  'Analysing crop growth stage…': 'பயிர் வளர்ச்சி நிலை பகுப்பாய்வு செய்யப்படுகிறது…',
  'Analysing crop and growth stage...': 'பயிர் வளர்ச்சி நிலை பகுப்பாய்வு செய்யப்படுகிறது…',
  'Calculating crop impact…': 'பயிர் பாதிப்பு கணக்கிடப்படுகிறது…',
  'Calculating crop impact...': 'பயிர் பாதிப்பு கணக்கிடப்படுகிறது…',
  'Preparing farmer actions…': 'விவசாயிகளுக்கான வழிகாட்டல்கள் தயாரிக்கப்படுகின்றன…',
  'Preparing farmer actions...': 'விவசாயிகளுக்கான வழிகாட்டல்கள் தயாரிக்கப்படுகின்றன…',

  // Card Headers & Labels
  'FARM': 'பண்ணை',
  'CROP': 'பயிர்',
  'SOIL': 'மண்',
  'TODAY\'S WEATHER': 'இன்றைய வானிலை',
  'Today\'s Weather': 'இன்றைய வானிலை',
  'Area': 'பரப்பளவு',
  'Drainage': 'வடிகால்',
  'Farms': 'பண்ணைகள்',
  'Total': 'மொத்தம்',
  'Acres': 'ஏக்கர்',
  'Hectares': 'ஹெக்டேர்',
  'Stage': 'பருவம்',
  'Variety': 'ரகம்',
  'Source': 'ஆதாரம்',
  'Sensitivity': 'உணர்திறன்',
  'SENSITIVITY': 'உணர்திறன்',
  'days old': 'நாட்கள் வயது',
  'Clay': 'களிமண்',
  'Sand': 'மணல்',
  'Survey': 'மண் ஆய்வு',
  'Temp': 'வெப்பநிலை',
  'Humidity': 'ஈரப்பதம்',
  'Forecast': 'முன்னறிவிப்பு',
  'Wind': 'காற்று',
  'Wind Speed': 'காற்றின் வேகம்',
  '24h Rain:': '24 மணி நேர மழை:',
  '48h Rain:': '48 மணி நேர மழை:',
  'Prev 48h:': 'கடந்த 48 மணி நேரம்:',
  'Rain 24h': 'மழை 24 மணி',
  'Rain 48h': 'மழை 48 மணி',
  'Waterlog Risk': 'நீர் தேக்க அபாயம்',
  'Damage Risk': 'சேத அபாயம்',
  'Survival': 'உயிர்வாழும் திறன்',
  'Recovery Potential': 'மீட்புத் திறன்',
  'Crop Loss': 'பயிர் இழப்பு',
  'Rainfall Outlook': 'மழைப்பொழிவு வாய்ப்பு',
  'Next 48 hours (estimated)': 'அடுத்த 48 மணி நேரம் (கணிக்கப்பட்டது)',
  'Antecedent Wetness Index:': 'முந்தைய மண் ஈரப்பதம் குறியீடு:',
  'Antecedent Wetness Index': 'முந்தைய மண் ஈரப்பதம் குறியீடு',
  'Crop Growth Stage': 'பயிர் வளர்ச்சி நிலை',
  'Planting': 'விதைப்பு',
  'Harvest': 'அறுவடை',
  'season progress': 'பருவ முன்னேற்றம்',
  'Waterlogging Risk Analysis': 'நீர் தேக்க அபாய பகுப்பாய்வு',
  'Risk Level': 'அபாய நிலை',
  'Soil Saturation': 'மண் நீர் செறிவு',
  'Est. Standing Water': 'தேங்கும் நீர் அளவு',
  'Contributing Factors': 'பாதிப்பை ஏற்படுத்தும் காரணிகள்',
  'Why This Result?': 'இந்த கணிப்புக்கான காரணங்கள் என்ன?',
  'Why This Alert': 'இந்த எச்சரிக்கைக்கான காரணங்கள்',
  'Farmer Summary': 'விவசாயிகளுக்கான சுருக்கம்',
  'Recommended Actions': 'பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்',
  'Before Rain': 'மழைக்கு முன்',
  'During Rain': 'மழையின் போது',
  'After Rain': 'மழைக்கு பின்',
  'Climate Overview': 'காலநிலை கண்ணோட்டம்',
  'Current Temp': 'தற்போதைய வெப்பநிலை',
  'Rain Next 24h': 'அடுத்த 24 மணி நேர மழை',
  'Recent Analysis': 'சமீபத்திய பகுப்பாய்வு',
  'View All': 'அனைத்தையும் பார்',
  'Today': 'இன்று',
  'Yesterday': 'நேற்று',
  'All Farms Quick Switch': 'பண்ணைகளை விரைவாக மாற்ற',
  'Farm Impact Map — All Fields': 'பண்ணை பாதிப்பு வரைபடம் — அனைத்து வயல்கள்',
  'Click any farm polygon to inspect crop stage, rainfall & waterlogging risk': 'பயிர் நிலை, மழை மற்றும் நீர் தேக்க அபாயத்தை அறிய வரைபடத்தில் உள்ள வயலை கிளிக் செய்யவும்',
  'farms mapped': 'பண்ணைகள் வரையப்பட்டுள்ளன',
  'analysed': 'பகுப்பாய்வு செய்யப்பட்டது',
  'require attention': 'கவனம் தேவை',
  'in safe zone': 'பாதுகாப்பான நிலையில்',
  'No crop added': 'பயிர் விவரம் சேர்க்கப்படவில்லை',
  'No soil data': 'மண் தரவு இல்லை',
  'Soil Drainage: Verified': 'மண் வடிகால்: சரிபார்க்கப்பட்டது',
  'Hybrid ML Engine: Active': 'ஹைப்ரிட் ஏஐ இயந்திரம்: இயங்குகிறது',
  'Weather: Live (Open-Meteo)': 'வானிலை: நேரலை (Open-Meteo)',
  'CropClimate AI Engine v1.0.0': 'கிராப்கிளைமேட் ஏஐ இன்ஜின் v1.0.0',
  'Official Weather Warning': 'அரசு வானிலை எச்சரிக்கை',
  'Official warning data unavailable': 'அரசு வானிலை எச்சரிக்கை தகவல் கிடைக்கவில்லை',
  'Valid until': 'செல்லுபடியாகும் காலம்',
  'Run "Analyse All My Farms" to see results here.': 'இங்கு முடிவுகளைப் பார்க்க "என் அனைத்து பண்ணைகளையும் பகுப்பாய்வு செய்" என்பதை அழுத்தவும்.',
  'Add your first farm to start crop-impact monitoring.': 'பயிர் பாதிப்பைக் கண்காணிக்க உங்கள் முதல் பண்ணையைச் சேர்க்கவும்.',
  'CropClimate AI analyses rainfall, soil, drainage and crop stage to assess damage, survival and recovery potential.': 'கிராப்கிளைமேட் ஏஐ மழை, மண், வடிகால் மற்றும் பயிர் நிலையை ஆய்வு செய்து சேதம் மற்றும் மீட்பு திறனைக் கணிக்கிறது.',
  'Learn how to map farms, monitor rainfall and analyse crop risk with CropClimate AI.': 'பண்ணை வரைதல், மழைக்கண்காணிப்பு மற்றும் பயிர் பாதிப்பு பகுப்பாய்வு ஆகியவற்றை எளிதாகக் கற்றுக்கொள்ளுங்கள்.',
  'Real-time farm-specific risk notifications, scientific causes, and operational action tracking.': 'நேரலை பண்ணை அபாய எச்சரிக்கைகள், அறிவியல் காரணங்கள் மற்றும் உடனடி நடவடிக்கைகள்.',
  'Multi-Farm Risk Evaluation, Contributing Factors, and Farmer Action Protocol': 'பல்வேறு பண்ணை அபாய மதிப்பீடு, காரணிகள் மற்றும் விவசாயிகளுக்கான வழிகாட்டல்கள்',
  'Analysis & Actions': 'பகுப்பாய்வு & நடவடிக்கைகள்',
  'Side-by-Side Comparison': 'பண்ணைகள் ஒப்பீடு',
  'Post-Rain Field Observation': 'மழைக்குப் பிந்தைய கள ஆய்வு',
  'Did standing water occur?': 'வயலில் தண்ணீர் தேங்கியதா?',
  'Standing Water Duration': 'நீர் தேங்கியிருந்த கால அளவு',
  'Crop Leaf Condition': 'பயிர் இலைகளின் நிலை',
  'Crop Physical Standing': 'பயிர் சாய்ந்த நிலை',
  'Visible Damage': 'வெளிப்படையான பயிர் சேதம்',
  'Farmer Notes': 'விவசாயியின் குறிப்புகள்',
  'Field Observation History': 'முந்தைய கள ஆய்வு வரலாறு',
  'No alerts found': 'எச்சரிக்கைகள் எதுவும் இல்லை',
  'No active alerts requiring immediate action.': 'உடனடி கவனம் தேவைப்படும் தீவிர எச்சரிக்கைகள் எதுவும் இல்லை.',
  'No Farms Registered': 'பண்ணைகள் எதுவும் பதிவு செய்யப்படவில்லை',
  'No Farms Registered Yet': 'இதுவரை எந்த பண்ணையும் பதிவு செய்யப்படவில்லை',
  'Manage farm polygon boundaries, crop growth stages, and verified soil profiles': 'பண்ணை எல்லைகள், பயிர் வளர்ச்சி நிலைகள் மற்றும் மண் விவரங்களை நிர்வகிக்கவும்',
  'Clear drainage ditches and strengthen bunds to prevent ponding.': 'தேங்குநீரைத் தடுக்க வடிகால் வாய்க்கால்களைத் தூர்வாரி வரப்புகளைப் பலப்படுத்தவும்.',
  'Ensure field runoff points stay open; suspend fertilizer spraying.': 'வடிகால் வழிகள் அடைப்பின்றி இருப்பதை உறுதி செய்யவும்; உரமிடுவதைத் தற்காலிகமாக நிறுத்தவும்.',
  'Drain stagnant water within 24h and apply foliar micronutrients.': 'தேங்கிய நீரை 24 மணி நேரத்திற்குள் வடித்துவிட்டு இலைவழி நுண்ணூட்டச்சத்து தெளிக்கவும்.',

  // Risk Levels & Drainage
  'LOW': 'குறைந்த அபாயம்',
  'ELEVATED': 'அதிகரித்த அபாயம்',
  'MODERATE': 'மிதமான அபாயம்',
  'HIGH': 'உயர் அபாயம்',
  'CRITICAL': 'மிக அதிக அபாயம்',
  'SEVERE': 'கடுமையான அபாயம்',
  'EXTREME': 'தீவிர அபாயம்',
  'NONE': 'பாதிப்பு இல்லை',
  'MILD': 'லேசான பாதிப்பு',
  'TOTAL LOSS': 'முழு இழப்பு',
  'TOTAL_LOSS': 'முழு இழப்பு',
  'POOR': 'மோசமான வடிகால்',
  'MODERATE_DRAINAGE': 'மிதமான வடிகால்',
  'GOOD': 'நல்ல வடிகால்',
  'GREEN': 'குறைந்த பாதிப்பு',
  'YELLOW': 'அதிகரித்த பாதிப்பு',
  'ORANGE': 'உயர் பாதிப்பு',
  'RED': 'கடுமையான பாதிப்பு',
  'GREEN IMPACT': 'குறைந்த பாதிப்பு',
  'YELLOW IMPACT': 'அதிகரித்த பாதிப்பு',
  'ORANGE IMPACT': 'உயர் பாதிப்பு',
  'RED IMPACT': 'கடுமையான பாதிப்பு',
  'LOW SENSITIVITY': 'குறைந்த உணர்திறன்',
  'MODERATE SENSITIVITY': 'மிதமான உணர்திறன்',
  'HIGH SENSITIVITY': 'அதிக உணர்திறன்',
  'EXTREME SENSITIVITY': 'தீவிர உணர்திறன்',
  'Standard': 'நிலையான ரகம்',
  'ESTIMATED': 'கணிக்கப்பட்டது',
  'USER_CONFIRMED': 'விவசாயியால் உறுதி செய்யப்பட்டது',
  'HYBRID': 'ஹைப்ரிட் மாதிரி',
  'ML': 'இயந்திர கற்றல்',
  'RULE_BASED': 'விதிமுறை சார்ந்த மாதிரி',

  // Dynamic Factors
  'Poor field drainage restricts natural surface runoff discharge': 'மோசமான வயல் வடிகால் வசதி மழைநீர் விரைவாக வெளியேறுவதைத் தடுக்கிறது',
  'Moderate soil drainage requires active channel maintenance': 'மண் வடிகால் மிதமானது, கனமழையின் போது வடிகால் வாய்க்கால்களை முறையாகப் பராமரிக்க வேண்டும்',
  'Well-drained soil facilitates rapid water evacuation': 'நல்ல வடிகால் வசதியுள்ள மண் நீரை விரைவாக வெளியேற்ற உதவுகிறது',
  'Heavy clay soil texture (40.0% clay) impedes downward water infiltration': 'அதிக களிமண் கலவை (40.0% களிமண்) நீர் நிலத்தடிக்குள் இறங்குவதை தாமதப்படுத்துகிறது',
  'Heavy clay soil texture impedes downward water infiltration': 'அதிக களிமண் கலவை நீர் நிலத்தடிக்குள் இறங்குவதை தாமதப்படுத்துகிறது',
  'Flowering & Boll Development is highly vulnerable to waterlogging': 'பூக்கும் மற்றும் காய் பிடிக்கும் பருவம் நீர் தேங்குதலால் எளிதில் பாதிக்கப்படக்கூடியது',
  'Flowering & Pegging is highly vulnerable to waterlogging': 'பூக்கும் மற்றும் விழுது பிடிக்கும் பருவம் நீர் தேங்குதலால் எளிதில் பாதிக்கப்படக்கூடியது',
  'Tillering & Vegetative is moderately tolerant to moisture': 'தூர்கட்டும் மற்றும் வளர்ச்சி பருவம் ஈரப்பதத்தை மிதமாகத் தாங்கக்கூடியது',
  'Vegetative & Tillering is moderately tolerant to moisture': 'வளர்ச்சி மற்றும் தூர்கட்டும் பருவம் ஈரப்பதத்தை மிதமாகத் தாங்கக்கூடியது',
  'Low antecedent soil moisture buffers upcoming precipitation': 'குறைந்த முந்தைய மண் ஈரப்பதம் வரும் மழையைத் தாங்க உதவுகிறது',
  'High antecedent moisture reduces further infiltration capacity': 'அதிக முந்தைய மண் ஈரப்பதம் நீர் உறிஞ்சும் திறனைக் குறைக்கிறது',
  'Substantial antecedent rainfall (72h) pre-saturates soil profile': 'கடந்த 72 மணி நேர கனமழை மண்ணை ஏற்கனவே முழுமையாக ஈரப்படுத்தியுள்ளது',
  'Critical Waterlogging Risk predicted': 'கடுமையான நீர் தேக்க அபாயம் கணிக்கப்பட்டுள்ளது',
  'High Waterlogging Risk predicted': 'அதிக நீர் தேக்க அபாயம் கணிக்கப்பட்டுள்ளது',
  'Moderate Waterlogging Risk predicted': 'மிதமான நீர் தேக்க அபாயம் கணிக்கப்பட்டுள்ளது',
  'Low Waterlogging Risk predicted': 'குறைந்த நீர் தேக்க அபாயம் கணிக்கப்பட்டுள்ளது',
  'High Crop Damage Risk assessed': 'அதிக பயிர் சேத அபாயம் கணிக்கப்பட்டுள்ளது',
  'Moderate Crop Damage Risk assessed': 'மிதமான பயிர் சேத அபாயம் கணிக்கப்பட்டுள்ளது',
  'Low Crop Damage Risk assessed': 'குறைந்த பயிர் சேத அபாயம் கணிக்கப்பட்டுள்ளது',
  'High Crop Loss Risk assessed': 'அதிக பயிர் இழப்பு அபாயம் கணிக்கப்பட்டுள்ளது',
  'Moderate Crop Loss Risk assessed': 'மிதமான பயிர் இழப்பு அபாயம் கணிக்கப்பட்டுள்ளது',
  'Low Crop Loss Risk assessed': 'குறைந்த பயிர் இழப்பு அபாயம் கணிக்கப்பட்டுள்ளது',

  // Dynamic Farmer Statements
  'Heavy rainfall is expected during the next 24 hours.': 'அடுத்த 24 மணி நேரத்தில் மிகக் கனமழை எதிர்பார்க்கப்படுகிறது.',
  'Moderate to high cumulative rainfall is forecast over the next 48 hours.': 'அடுத்த 48 மணி நேரத்தில் மிதமானது முதல் அதிக அளவிலான ஒட்டுமொத்த மழை எதிர்பார்க்கப்படுகிறது.',
  'Light to moderate rainfall is expected in your farm area.': 'உங்கள் பண்ணைப் பகுதியில் லேசானது முதல் மிதமான மழை பெய்யக்கூடும்.',
  'The farm has received substantial rainfall during the previous 72 hours, pre-saturating the soil.': 'பண்ணை கடந்த 72 மணி நேரத்தில் கணிசமான மழையைப் பெற்றுள்ளது, இது மண்ணை ஏற்கனவே முழுமையாக ஈரப்படுத்தியுள்ளது.',
  'Current soil conditions indicate high moisture and near-saturation levels.': 'தற்போதைய மண் நிலைமைகள் அதிக ஈரப்பதம் மற்றும் முழு செறிவூட்டப்பட்ட நிலையை காட்டுகின்றன.',
  'Farm soil drainage is marked as poor, increasing the risk of standing water stagnation.': 'பண்ணையின் மண் வடிகால் வசதி மோசமாக உள்ளது, இது தண்ணீர் தேங்குவதற்கான அபாயத்தை அதிகரிக்கிறது.',
  'Soil drainage is moderate, requiring active channel maintenance during heavy downpours.': 'மண் வடிகால் மிதமானது, கனமழையின் போது வடிகால் வாய்க்கால்களை முறையாகப் பராமரிக்க வேண்டும்.',
  'Soil drainage is well-drained, aiding faster water evacuation.': 'மண் வடிகால் வசதி சிறப்பாக உள்ளது, இது தண்ணீரை விரைவாக வெளியேற்ற உதவுகிறது.',
  'Your Paddy variety (Sub1 gene) possesses higher genetic tolerance to temporary submergence.': 'உங்கள் நெல் ரகம் (Sub1 மரபணு) தற்காலிக நீரில் மூழ்குதலைத் தாங்கும் கூடுதல் மரபியல் சகிப்புத்தன்மை கொண்டது.',

  // Recommendation Titles & Actions
  'Clean Field Drainage Channels & Furrows': 'வயல் வடிகால் வாய்க்கால்களை தூர்வாரி சுத்தம் செய்யவும்',
  'Clear weeds and desilt boundary drainage ditches to maximize surface runoff velocity.': 'மழைநீர் தடையின்றி வெளியேற வரப்பு மற்றும் எல்லை வடிகால் வாய்க்கால்களில் உள்ள களைகளை அகற்றி தூர்வாரவும்.',
  'Immediate (Before heavy rain begins)': 'உடனடியாக (கனமழை தொடங்குவதற்கு முன்)',
  'Postpone Chemical & Fertilizer Spraying': 'பூச்சிக்கொல்லி மற்றும் உரமிடுதலை ஒத்திவைக்கவும்',
  'Delay scheduled foliar spray, pesticide, and top-dress nitrogen applications.': 'திட்டமிடப்பட்ட இலைவழி தெளிப்பு, பூச்சிக்கொல்லி மற்றும் தழைச்சத்து மேலுரமிடுதலை உடனடியாக ஒத்திவைக்கவும்.',
  'Forecast 24h heavy rainfall will wash away chemicals, causing financial loss and environmental runoff.': 'அடுத்த 24 மணி நேர கனமழை மருந்துகளை அடித்துச் சென்று நிதி இழப்பை ஏற்படுத்தும்.',
  'Next 24-48 Hours': 'அடுத்த 24-48 மணி நேரம்',
  'Erect Stakes and Earthing Up': 'முட்டுக்கொடுத்து மண் அணைக்கவும்',
  'Provide bamboo support stakes for tall vegetable plants and earth up soil around stems.': 'செடிகள் சாய்வதைத் தடுக்க மூங்கில் குச்சிகளால் முட்டுக் கொடுத்து தண்டுகளைச் சுற்றி மண் அணைக்கவும்.',
  'Prevents lodging and stem breakage under heavy monsoonal wind and soil softening.': 'கனமழைக் காற்று மற்றும் மண் இளகுதலால் செடிகள் சாய்ந்து தண்டுகள் முறிவதைத் தடுக்கிறது.',
  'Before heavy rain': 'கனமழைக்கு முன்',
  'Clear Broad Bed Furrows & Open Field Drains': 'பாத்தி வடிகால் வாய்க்கால்களை அகலப்படுத்தி திறக்கவும்',
  'Open lateral drainage furrows across cotton rows to accelerate surface runoff.': 'பருத்தி வரிசைகளுக்கு இடையே பக்கவாட்டு வடிகால்களை அமைத்து தேங்கும் நீரை விரைவாக வெளியேற்றவும்.',
  'Before heavy rain begins': 'கனமழை தொடங்குவதற்கு முன்',
  'Adjust Bund Openings & Sluice Gates': 'வரப்பு மடை மற்றும் வடிகால் வழிகளை சரிசெய்யவும்',
  'Open drainage cuts in bunds to maintain safe water level (2-5 cm) and prevent total panicle submergence.': 'வரப்புகளில் வடிகால் வழிகளை ஏற்படுத்தி பயிர் மூழ்காமல் 2-5 செ.மீ பாதுகாப்பான நீர்மட்டத்தை பராமரிக்கவும்.',
  'Regulates water depth to preserve tillering vigor without drowning leaf canopy.': 'இலைகள் மூழ்காமல் தூர்வெடிக்கும் வீரியத்தைப் பாதுகாக்க நீர்மட்டத்தை ஒழுங்குபடுத்துகிறது.',
  'Deepen Inter-Row Drainage Furrows': 'வரிசை இடைவெளி வடிகால் வாய்க்கால்களை ஆழப்படுத்தவும்',
  'Form drainage channels every 6-8 rows to divert excess runoff away from pegging zones.': 'நிலக்கடலை விழுதுகள் அழுகாமல் இருக்க ஒவ்வொரு 6-8 வரிசைகளுக்கும் வடிகால் சால் அமைக்கவும்.',
  'Monitor Field Outlets & Prevent Silt Blockages': 'வயல் நீர் வெளியேறும் மதகுகளை கண்காணித்து வண்டல் அடைப்புகளை நீக்கவும்',
  'Ensure drainage bunds remain open and unblocked. Avoid walking or machinery in saturated root zones.': 'வடிகால் மதகுகள் அடைப்பின்றி இருப்பதை உறுதி செய்யவும். ஈரமான நிலத்தில் நடப்பது அல்லது டிராக்டர் ஓட்டுவதை தவிர்க்கவும்.',
  'Soil compaction in saturated soils reduces oxygen diffusion and exacerbates root asphyxiation.': 'ஈரமான மண்ணில் இறங்குவது நிலத்தை இறுக்கி வேருக்கு காற்று செல்வதைத் தடுக்கும்.',
  'During Rain Event': 'மழை பெய்யும் நேரத்தில்',
  'De-water Stagnant Outlets Immediately': 'தேங்கிய தண்ணீரை உடனடியாக வெளியேற்றவும்',
  'Pump or manually channel out standing water within 24 to 48 hours.': 'வயலில் தேங்கிய நீரை மோட்டார் அல்லது வாய்க்கால் மூலம் 24 முதல் 48 மணி நேரத்திற்குள் வடித்துவிடவும்.',
  'Within 24 Hours Post-Rain': 'மழை நின்ற 24 மணி நேரத்திற்குள்',
  'Apply Foliar Micronutrients & Fungicide': 'இலைவழி நுண்ணூட்டச்சத்து மற்றும் பூஞ்சாணக்கொல்லி தெளிக்கவும்',
  'Spray 0.5% Zinc Sulphate or 1% Urea + 0.1% Carbendazim once standing water recedes to revitalize roots.': 'தண்ணீர் வடிந்தவுடன் வேர் வளர்ச்சியை தூண்ட 1% யூரியா அல்லது டிஏபி மற்றும் பரிந்துரைக்கப்பட்ட பூஞ்சாணக்கொல்லி தெளிக்கவும்.',
  'Within 3-5 Days Post-Drainage': 'நீர் வடிந்த 3-5 நாட்களுக்குள்',
  'Spray Planofix (NAA 40 ppm) and 2% DAP spray to arrest premature square shedding.': 'பருத்தி பூ மற்றும் காய்கள் கொட்டுவதைத் தடுக்க 2% டிஏபி மற்றும் பிளானோபிக்ஸ் (NAA 40 ppm) தெளிக்கவும்.',
  'Within 48-72h of drainage': 'நீர் வடிந்த 48-72 மணி நேரத்திற்குள்',
  'Apply Pulse Wonder (2 kg/acre) in 200L water during morning hours.': 'காலை வேளையில் ஏக்கருக்கு 2 கிலோ பல்ஸ் வொண்டர் மருந்தை 200 லிட்டர் தண்ணீரில் கலந்து தெளிக்கவும்.',
  'Drain Excess Water Immediately': 'அதிகப்படியான நீரை உடனடியாக வடிக்கவும்',

  // Technical Feature Importances
  'Forecast 48h Rain': 'அடுத்த 48 மணி நேர மழை முன்னறிவிப்பு',
  'Waterlogging Saturation Index': 'நீர் தேக்க செறிவு குறியீடு',
  'Soil Drainage Class': 'மண் வடிகால் வகை',
  'Crop Stage Sensitivity': 'பயிர் பருவ பாதிப்பு உணர்திறன்',
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key, fallback) => (typeof fallback === 'string' ? fallback : key),
  translateCrop: (c) => c || '',
  translateStage: (s) => s || '',
  translateSoilType: (st) => st || '',
  translateDrainage: (d) => d || '',
  translateRisk: (r) => r || '',
  translateFactor: (f) => f || '',
  translateWhyStatement: (s) => s || '',
  translateFarmerAction: (a) => a || '',
  translateActionCard: (a) => a,
  translateTechnicalFeature: (f) => f || '',
  translateGreeting: (g) => g || '',
  translateStatus: (s) => s || '',
  translateWeatherWarning: (w) => w,
  translateText: (t) => t || '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t: i18nT } = useTranslation(allNamespaces as any);
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'ta' || saved === 'en') {
      return saved as SupportedLanguage;
    }
    return (i18n.language === 'ta' ? 'ta' : 'en') as SupportedLanguage;
  });

  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    await i18n.changeLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }

    // Set axios header for all upcoming API requests
    apiClient.defaults.headers.common['Accept-Language'] = lang;

    // Persist to backend user profile if token exists
    const token = localStorage.getItem('agri_token');
    if (token) {
      try {
        await apiClient.put('/auth/me/language', { preferred_language: lang });
        const cachedUserStr = localStorage.getItem('agri_user');
        if (cachedUserStr) {
          try {
            const userObj = JSON.parse(cachedUserStr);
            userObj.preferred_language = lang.toUpperCase();
            localStorage.setItem('agri_user', JSON.stringify(userObj));
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        // quiet fallback
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    apiClient.defaults.headers.common['Accept-Language'] = language;
  }, [language]);

  // Universal Translation Function with Namespace Resolution & Raw-Key Protection
  const KNOWN_NAMESPACES = [
    'common',
    'auth',
    'dashboard',
    'farms',
    'cropImpact',
    'alerts',
    'weather',
    'recommendations',
    'climate',
    'reports',
    'validation',
  ];

  const resolveI18nKey = (k: string): string => {
    if (k.includes(':')) return k;
    const firstDot = k.indexOf('.');
    if (firstDot > 0) {
      const ns = k.slice(0, firstDot);
      if (KNOWN_NAMESPACES.includes(ns)) {
        return `${ns}:${k.slice(firstDot + 1)}`;
      }
    }
    return k;
  };

  const t = (keyOrText: string, fallbackOrOptions?: string | Record<string, any>): string => {
    if (!keyOrText) return '';
    const clean = keyOrText.trim();
    const resolvedKey = resolveI18nKey(clean);
    const options = typeof fallbackOrOptions === 'object' && fallbackOrOptions !== null ? fallbackOrOptions : {};
    const fallbackStr = typeof fallbackOrOptions === 'string' ? fallbackOrOptions : (options.defaultValue as string | undefined);

    if (language === 'ta') {
      // 1. Direct Tamil map check
      if (TAMIL_MAP[clean]) return TAMIL_MAP[clean];
      if (fallbackStr && TAMIL_MAP[fallbackStr.trim()]) {
        return TAMIL_MAP[fallbackStr.trim()];
      }

      // 2. Try i18n with resolved namespace key
      let res = i18nT(resolvedKey, options);
      if (typeof res === 'string' && res !== resolvedKey && res !== clean && !res.includes('.')) {
        return res;
      }

      // Also try original key
      res = i18nT(clean, options);
      if (typeof res === 'string' && res !== clean && !res.includes('.')) {
        return res;
      }

      // 3. Fallback string if provided
      if (fallbackStr && fallbackStr.length > 0) {
        return TAMIL_MAP[fallbackStr.trim()] || fallbackStr;
      }

      // 4. If key contains dot notation and had no translation, never expose raw key!
      if (clean.includes('.')) {
        if (clean === 'auth.welcome.greeting' && options.name) {
          return `வரவேற்கிறோம், ${options.name}!`;
        }
        const lastPart = clean.split('.').pop() || '';
        return TAMIL_MAP[lastPart] || lastPart.replace(/_/g, ' ');
      }

      return clean;
    }

    // English mode
    let res = i18nT(resolvedKey, options);
    if (typeof res === 'string' && res !== resolvedKey && res !== clean && !res.includes('.')) {
      return res;
    }

    res = i18nT(clean, options);
    if (typeof res === 'string' && res !== clean && !res.includes('.')) {
      return res;
    }

    if (fallbackStr && fallbackStr.length > 0) {
      return fallbackStr;
    }

    // If key contains dot notation and had no translation, never expose raw key!
    if (clean.includes('.')) {
      if (clean === 'auth.welcome.greeting' && options.name) {
        return `Welcome, ${options.name}!`;
      }
      const lastPart = clean.split('.').pop() || '';
      return lastPart.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return clean;
  };

  const translateCrop = (cropName?: string | null): string => {
    if (!cropName) return '';
    const cleanKey = cropName.trim();
    if (language !== 'ta') return cleanKey;

    const map: Record<string, string> = {
      paddy: 'நெல்',
      rice: 'நெல்',
      maize: 'மக்காச்சோளம்',
      corn: 'மக்காச்சோளம்',
      groundnut: 'நிலக்கடலை',
      peanut: 'நிலக்கடலை',
      cotton: 'பருத்தி',
      banana: 'வாழை',
      sugarcane: 'கரும்பு',
      tomato: 'தக்காளி',
      chilli: 'மிளகாய்',
      onion: 'வெங்காயம்',
      pulses: 'பருப்பு வகைகள்',
      vegetables: 'காய்கறிகள்',
      millets: 'சிறு தானியங்கள்',
    };
    return map[cleanKey.toLowerCase()] || cleanKey;
  };

  const translateStage = (stage?: string | null): string => {
    if (!stage) return '';
    const cleanKey = stage.trim();
    if (language !== 'ta') return cleanKey;

    const map: Record<string, string> = {
      seedling: 'நாற்று பருவம்',
      vegetative: 'வளர்ச்சி பருவம்',
      tillering: 'தூர்கட்டும் பருவம்',
      'vegetative & tillering': 'வளர்ச்சி & தூர்கட்டும் பருவம்',
      'tillering & vegetative': 'தூர்கட்டும் & வளர்ச்சி பருவம்',
      flowering: 'பூக்கும் பருவம்',
      'flowering & boll development': 'பூக்கும் & காய் பிடிக்கும் பருவம்',
      'flowering & pegging': 'பூக்கும் & விழுது பிடிக்கும் பருவம்',
      fruiting: 'காய் பிடிக்கும் பருவம்',
      pegging: 'விழுது பிடிக்கும் பருவம்',
      pod_development: 'நெற்று வளர்ச்சி பருவம்',
      maturity: 'முதிர்ச்சி பருவம்',
      harvest: 'அறுவடை பருவம்',
    };
    return map[cleanKey.toLowerCase()] || cleanKey;
  };

  const translateSoilType = (soil?: string | null): string => {
    if (!soil) return '';
    const cleanKey = soil.trim();
    if (language !== 'ta') return cleanKey;

    const map: Record<string, string> = {
      clay: 'களிமண்',
      sandy: 'மணற்பாங்கான மண்',
      loam: 'வண்டல் கலந்த மண்',
      clay_loam: 'களிமண் கலந்த வண்டல் மண்',
      'clay loam': 'களிமண் கலந்த வண்டல் மண்',
      'black clay loam': 'கரிசல் களிமண் வண்டல்',
      'alluvial clay loam': 'ஆற்றுப்படுகை வண்டல் களிமண்',
      'red sandy loam': 'செம்மண் கலந்த மணற்பாங்கான வண்டல்',
      sandy_loam: 'மணல் கலந்த வண்டல் மண்',
      'sandy loam': 'மணல் கலந்த வண்டல் மண்',
      silty_clay: 'வண்டல் களிமண்',
      red_soil: 'செம்மண்',
      'red soil': 'செம்மண்',
      black_cotton: 'கரிசல் மண்',
      'black cotton': 'கரிசல் மண்',
      alluvial: 'வண்டல் மண்',
      unknown: 'தெரியவில்லை',
    };
    return map[cleanKey.toLowerCase()] || cleanKey;
  };

  const translateDrainage = (drainage?: string | null): string => {
    if (!drainage) return '';
    const upper = drainage.trim().toUpperCase();
    if (language !== 'ta') {
      return upper === 'POOR' ? 'Poor' : upper === 'GOOD' ? 'Good' : 'Moderate';
    }
    const map: Record<string, string> = {
      GOOD: 'நல்ல வடிகால்',
      MODERATE: 'மிதமான வடிகால்',
      POOR: 'மோசமான வடிகால்',
    };
    return map[upper] || drainage;
  };

  const translateRisk = (risk?: string | null): string => {
    if (!risk) return '';
    const upper = risk.trim().toUpperCase();
    if (language !== 'ta') {
      return upper;
    }
    const map: Record<string, string> = {
      LOW: 'குறைந்த அபாயம்',
      ELEVATED: 'அதிகரித்த அபாயம்',
      MODERATE: 'மிதமான அபாயம்',
      HIGH: 'உயர் அபாயம்',
      CRITICAL: 'மிக அதிக அபாயம்',
      SEVERE: 'கடுமையான அபாயம்',
      EXTREME: 'தீவிர அபாயம்',
      NONE: 'பாதிப்பு இல்லை',
      MILD: 'லேசான பாதிப்பு',
      TOTAL_LOSS: 'முழு இழப்பு',
      'TOTAL LOSS': 'முழு இழப்பு',
      LOW_WASH_RISK: 'குறைந்த கரைசல் அபாயம்',
      MODERATE_WASH_RISK: 'மிதமான கரைசல் அபாயம்',
      HIGH_WASH_RISK: 'உயர் கரைசல் அபாயம்',
    };
    return map[upper] || risk;
  };

  const translateFactor = (factor?: string | null): string => {
    if (!factor) return '';
    const clean = factor.trim();
    if (language !== 'ta') return clean;
    if (TAMIL_MAP[clean]) return TAMIL_MAP[clean];

    // Pattern matches
    if (clean.includes('Heavy clay soil texture')) {
      return 'அதிக களிமண் கலவை நீர் நிலத்தடிக்குள் இறங்குவதை தாமதப்படுத்துகிறது';
    }
    if (clean.includes('Poor field drainage')) {
      return 'மோசமான வயல் வடிகால் வசதி மழைநீர் விரைவாக வெளியேறுவதைத் தடுக்கிறது';
    }
    if (clean.includes('Flowering & Boll Development')) {
      return 'பூக்கும் மற்றும் காய் பிடிக்கும் பருவம் நீர் தேங்குதலால் எளிதில் பாதிக்கப்படக்கூடியது';
    }
    if (clean.includes('Flowering & Pegging')) {
      return 'பூக்கும் மற்றும் விழுது பிடிக்கும் பருவம் நீர் தேங்குதலால் எளிதில் பாதிக்கப்படக்கூடியது';
    }
    if (clean.includes('Tillering & Vegetative') || clean.includes('Vegetative & Tillering')) {
      return 'வளர்ச்சி மற்றும் தூர்கட்டும் பருவம் ஈரப்பதத்தை மிதமாகத் தாங்கக்கூடியது';
    }
    if (clean.includes('Waterlogging Risk predicted')) {
      return clean.replace('Waterlogging Risk predicted', 'நீர் தேக்க அபாயம் கணிக்கப்பட்டுள்ளது');
    }
    if (clean.includes('Crop Damage Risk assessed')) {
      return clean.replace('Crop Damage Risk assessed', 'பயிர் சேத அபாயம் கணிக்கப்பட்டுள்ளது');
    }
    if (clean.includes('Crop Loss Risk assessed')) {
      return clean.replace('Crop Loss Risk assessed', 'பயிர் இழப்பு அபாயம் கணிக்கப்பட்டுள்ளது');
    }
    return clean;
  };

  const translateWhyStatement = (stmt?: string | null): string => {
    if (!stmt) return '';
    const clean = stmt.trim();
    if (language !== 'ta') return clean;
    if (TAMIL_MAP[clean]) return TAMIL_MAP[clean];

    // Regex dynamic statement translation
    if (clean.includes('is currently in the') && clean.includes('sensitive to root submergence')) {
      return clean
        .replace(/([A-Za-z]+)\s+is currently in the\s+([A-Za-z &]+)\s+stage,\s+which is highly sensitive to root submergence and soil anoxia\./,
          (_, c, s) => `${translateCrop(c)} பயிர் தற்போது ${translateStage(s)} பருவத்தில் உள்ளது, இது வேர் மூழ்குதல் மற்றும் காற்றுப் பற்றாக்குறைக்கு அதிக உணர்திறன் கொண்டது.`);
    }
    if (clean.includes('can tolerate short-duration wetness if surface water is drained quickly')) {
      return clean
        .replace(/([A-Za-z]+)\s+in the\s+([A-Za-z &]+)\s+stage can tolerate short-duration wetness if surface water is drained quickly\./,
          (_, c, s) => `${translateStage(s)} பருவத்தில் உள்ள ${translateCrop(c)} பயிர், தேங்கிய நீர் விரைவாக வடிக்கப்பட்டால் குறுகிய கால ஈரப்பதத்தைத் தாங்கும்.`);
    }
    return clean;
  };

  const translateFarmerAction = (text?: string | null): string => {
    if (!text) return '';
    const clean = text.trim();
    if (language !== 'ta') return clean;
    return TAMIL_MAP[clean] || clean;
  };

  const translateActionCard = (act: any): ActionCardItem => {
    if (!act) return { title: '', action: '' };
    if (language !== 'ta') return act;

    const cleanTitle = (act.title || '').trim();
    const cleanAction = (act.action || '').trim();
    const cleanReason = (act.reason || '').trim();
    const cleanTiming = (act.timing || '').trim();

    return {
      ...act,
      title: TAMIL_MAP[cleanTitle] || cleanTitle,
      action: TAMIL_MAP[cleanAction] || cleanAction,
      reason: TAMIL_MAP[cleanReason] || cleanReason,
      timing: TAMIL_MAP[cleanTiming] || cleanTiming,
      priority: act.priority === 'HIGH' ? 'முக்கியமானது' : act.priority === 'MEDIUM' ? 'மிதமானது' : 'பொதுவானது',
      evidence_reference: act.evidence_reference ? `வழிகாட்டுதல்: ${act.evidence_reference}` : '',
    };
  };

  const translateTechnicalFeature = (feature?: string | null): string => {
    if (!feature) return '';
    const clean = feature.trim();
    if (language !== 'ta') return clean;
    return TAMIL_MAP[clean] || clean;
  };

  const translateGreeting = (greeting?: string | null): string => {
    if (!greeting) return '';
    const clean = greeting.trim();
    if (language !== 'ta') return clean;
    return TAMIL_MAP[clean] || clean;
  };

  const translateStatus = (status?: string | null): string => {
    if (!status) return '';
    const upper = status.trim().toUpperCase();
    if (language !== 'ta') return upper;
    return TAMIL_MAP[upper] || status;
  };

  const translateWeatherWarning = (warning: any): any => {
    if (!warning) return null;
    if (language !== 'ta') return warning;
    return {
      ...warning,
      title: TAMIL_MAP[warning.title] || warning.title,
      description: TAMIL_MAP[warning.description] || warning.description,
      warning_level: warning.warning_level === 'YELLOW' ? 'மஞ்சள் எச்சரிக்கை' :
                     warning.warning_level === 'ORANGE' ? 'ஆரஞ்சு எச்சரிக்கை' :
                     warning.warning_level === 'RED' ? 'சிவப்பு எச்சரிக்கை' : 'வானிலை எச்சரிக்கை',
    };
  };

  const translateText = (text?: string | null): string => {
    if (!text) return '';
    const clean = text.trim();
    if (language !== 'ta') return clean;
    return TAMIL_MAP[clean] || clean;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCrop,
        translateStage,
        translateSoilType,
        translateDrainage,
        translateRisk,
        translateFactor,
        translateWhyStatement,
        translateFarmerAction,
        translateActionCard,
        translateTechnicalFeature,
        translateGreeting,
        translateStatus,
        translateWeatherWarning,
        translateText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

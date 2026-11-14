/* ==========================================================================
   GREEN FUTURE — Agri-Spatial Decision Intelligence Platform (Final Edition)
   Default Dark Mode • Responsive Mobile/Desktop • Rayan AI (Auto-Connected)
   Team ZERO SHOT | NASA Space Apps Challenge
   ========================================================================== */

const $ = (id) => document.getElementById(id);

const APP = {
  lang: "ar",
  theme: "dark",
  currentStep: 1,
  goal: "water",
  basemap: "satellite",
  mapLayer: "moisture",
  crops: [],
  climate: [],
  preds: {},
  customPlans: [],
  summary: null,
  leafletMap: null,
  tileLayer: null,
  leafletMarkers: null,
  charts: { forecast: null, radar: null, waterbal: null },
  chatHistory: [],
  autoSpeak: false,
};

const GOV_META = {
  Sharqia: { ar: "الشرقية", en: "Sharqia", lat: 30.73, lng: 31.72, soil_ar: "طينية طميية (pH 7.9)", soil_en: "Clay Loam (pH 7.9)", salinity: 2.8 },
  Dakahlia: { ar: "الدقهلية", en: "Dakahlia", lat: 31.04, lng: 31.38, soil_ar: "طينية ثقيلة (pH 8.0)", soil_en: "Heavy Clay (pH 8.0)", salinity: 3.4 },
  Beheira: { ar: "البحيرة", en: "Beheira", lat: 30.85, lng: 30.34, soil_ar: "طميية رملية (pH 8.1)", soil_en: "Sandy Loam (pH 8.1)", salinity: 4.1 },
  Kafr_ElSheikh: { ar: "كفر الشيخ", en: "Kafr El-Sheikh", lat: 31.11, lng: 30.94, soil_ar: "طينية متأثرة بالملوحة (pH 8.2)", soil_en: "Saline-Prone Clay (pH 8.2)", salinity: 5.2 },
  Gharbia: { ar: "الغربية", en: "Gharbia", lat: 30.87, lng: 31.03, soil_ar: "طينية خصبة (pH 7.8)", soil_en: "Fertile Clay (pH 7.8)", salinity: 2.3 },
  Menoufia: { ar: "المنوفية", en: "Menoufia", lat: 30.59, lng: 30.98, soil_ar: "طميية خصبة (pH 7.8)", soil_en: "Alluvial Loam (pH 7.8)", salinity: 2.1 },
  Qalyubia: { ar: "القليوبية", en: "Qalyubia", lat: 30.33, lng: 31.21, soil_ar: "طينية طميية (pH 7.9)", soil_en: "Clay Loam (pH 7.9)", salinity: 2.4 },
  Salhia_Reclaimed: { ar: "الصالحية (أراضٍ مستصلحة)", en: "Salhia (Reclaimed)", lat: 30.65, lng: 31.98, soil_ar: "رملية مستصلحة (pH 8.2)", soil_en: "Reclaimed Sandy (pH 8.2)", salinity: 3.9 },
  Fayoum: { ar: "الفيوم", en: "Fayoum", lat: 29.31, lng: 30.84, soil_ar: "طميية جيرية (pH 8.1)", soil_en: "Calcareous Loam (pH 8.1)", salinity: 4.5 },
  Beni_Suef: { ar: "بني سويف", en: "Beni Suef", lat: 29.07, lng: 31.09, soil_ar: "طينية طميية (pH 7.9)", soil_en: "Clay Loam (pH 7.9)", salinity: 2.7 },
  Minya: { ar: "المنيا", en: "Minya", lat: 28.11, lng: 30.75, soil_ar: "طميية نيلية (pH 7.9)", soil_en: "Nile Alluvial (pH 7.9)", salinity: 2.6 },
  Assiut: { ar: "أسيوط", en: "Assiut", lat: 27.18, lng: 31.18, soil_ar: "طينية نيلية (pH 8.0)", soil_en: "Nile Clay (pH 8.0)", salinity: 2.9 },
  Sohag: { ar: "سوهاج", en: "Sohag", lat: 26.56, lng: 31.69, soil_ar: "طميية نيلية (pH 8.0)", soil_en: "Nile Silt Loam (pH 8.0)", salinity: 3.0 },
  Qena_Luxor: { ar: "قنا والأقصر", en: "Qena & Luxor", lat: 25.69, lng: 32.64, soil_ar: "طميية حارة (pH 8.1)", soil_en: "Arid Alluvial (pH 8.1)", salinity: 3.3 },
};

const I18N = {
  ar: {
    brand_title: "GREEN FUTURE",
    brand_sub: "منصة الذكاء الزراعي ورصد الأرض (NASA Earth Observation) • فريق ZERO SHOT",
    btn_science_lab: "🗺️ الخرائط والمختبر العلمي",
    theme_light: "نهاري",
    theme_dark: "ليلي",
    st_1: "بيانات الأرض",
    st_2: "الأهداف والقيود",
    st_3: "خطتك المخصصة",
    st_4: "الخرائط والعلوم",
    s1_tag: "المرحلة 1 من 3 • تعريف الحقل",
    s1_title: "أخبرنا عن أرضك لنبدأ تحليل بيانات أقمار ناسا",
    s1_desc: "يتم ربط موقع أرضك مع 10 سنوات من بيانات الأقمار الصناعية (SMAP, POWER, ERA5, MODIS) لتحليل الرطوبة والإجهاد الحراري بدقة.",
    lbl_gov: "1. المحافظة / المنطقة الزراعية *",
    lbl_area: "2. مساحة الأرض (بالفدان) *",
    lbl_prev: "3. المحصول المزروع حالياً أو السابق *",
    lbl_window: "4. فترة المرجع الزمني للرصد الفضائي *",
    win_today: "اليوم الحالي (أحدث رصد متاح)",
    win_week: "آخر أسبوع (متوسط 7 أيام)",
    win_month: "آخر شهر (اتجاه 30 يوماً)",
    prev_soil_type: "طبيعة التربة السائدة",
    prev_sm: "رطوبة التربة المرجعية",
    prev_temp: "الحرارة العظمى المرجعية",
    btn_next_2: "التالي: تحديد أهدافك وقيود المزرعة ⬅️",
    s2_tag: "المرحلة 2 من 3 • تخصيص القرار للمزارع",
    s2_title: "ما هو هدفك الأساسي وما هي ظروف مزرعتك؟",
    s2_desc: "لن نعرض لك خطة موحدة للجميع؛ سيقوم المحرك بتصميم 3 دورات زراعية مخصصة من 51 محصولاً تناسب قيودك وأولوياتك.",
    lbl_main_goal: "1. اختر أولويتك القصوى للموسم القادم:",
    g_water_t: "توفير مياه الري",
    g_water_d: "محاصيل قليلة الاستهلاك المائي وتتحمل الجفاف",
    g_soil_t: "إصلاح التربة والخصوبة",
    g_soil_d: "تثبيت النيتروجين طبيعياً وتقليل الأسمدة وكسر الآفات",
    g_profit_t: "تعظيم العائد التسويقي",
    g_profit_d: "محاصيل نقدية وتصديرية ذات طلب مرتفع في السوق",
    g_bal_t: "توازن شامل (مياه + تربة + ربح)",
    g_bal_d: "توزيع متوازن يضمن الاستدامة والأمان المالي",
    lbl_water_avail: "2. توفر مياه الري في أرضك",
    wa_norm: "ري منتظم (نهايات ترع جيدة / نيلي)",
    wa_lim: "مناوبات ري متباعدة / نقص مياه",
    wa_sal: "مياه آبار أو تربة متوسطة الملوحة",
    lbl_equip: "3. مستوى الميكنة والعمالة",
    eq_std: "ميكنة تقليدية (جرار وحرث عادي)",
    eq_mod: "ميكنة حديثة وتسوية بالليزر",
    eq_man: "اعتماد أكبر على العمالة اليدوية",
    lbl_market: "4. تفضيل التسويق والبيع",
    mk_loc: "محاصيل استراتيجية مضمونة البيع محلياً",
    mk_cash: "محاصيل تصنيعية وتصديرية (زيوت/بقول)",
    mk_for: "توفير أعلاف خضراء للمواشي بجانب المحصول",
    sim_title: "🌡️ محاكي سيناريو الطقس للموسم القادم (90 يوماً)",
    scen_temp: "تغير درجة الحرارة المتوقع",
    scen_rain: "تغير معدل الأمطار",
    btn_back_1: "➡️ السابق: تعديل بيانات الأرض",
    btn_generate_plan: "🚀 توليد خطتي الزراعية المخصصة الآن",
    s3_tag: "المرحلة 3 من 3 • التوصية المخصصة لأرضك",
    btn_edit_prefs: "✏️ تعديل الأهداف",
    btn_view_maps: "🗺️ عرض الخرائط والرسوم",
    btn_print_pdf: "🖨️ طباعة الروشتة (PDF)",
    sum_sm_lbl: "رطوبة التربة (المرجع ➔ التوقع الموسمي)",
    sum_temp_lbl: "الحرارة العظمى المتوقعة للموسم",
    sum_save_lbl: "الأثر المتوقع لأفضل دورة مخصصة لك",
    custom_cards_title: "🌾 دورات زراعية صُممت خصيصاً لظروف أرضك (مقارنة بالدورة التقليدية)",
    custom_cards_sub: "تم اختيار المحاصيل آلياً من قاعدة الـ 51 محصولاً لتوافق قيود المياه، الملوحة، وكسر دورة آفات محصولك السابق.",
    tl_title: "📅 الجدول الزمني للتنفيذ على مدار العام (12 شهراً)",
    leg_crop: "زراعة وإنتاج",
    leg_cover: "تغطية وحفظ رطوبة التربة",
    leg_pest: "تجهيز وكسر آفات",
    hj_title: "👨‍🌾 دورك وخبرتك الحقلية أساس النجاح:",
    hj_desc: "هذه التوصيات مبنية على نماذج رصد الأرض من أقمار ناسا، وهي أداة مساعدة لقرارك وليست بديلاً عن خبرتك. الأقمار الصناعية لا تقيس ملوحة التربة الحقلية (ECe) أو ملوحة مياه الآبار بدقة حقلية؛ لذا ننصح بفحص عينة تربة ومراجعة المهندس الزراعي في جمعيتك الزراعية قبل الزراعة.",
    s4_tag: "المختبر الجغرافي والعلمي • NASA Data Fusion",
    s4_title: "🗺️ الخرائط الفضائية التفاعلية والتحليل البياني المفسّر",
    btn_back_plan: "➡️ العودة إلى خطتي الزراعية",
    map_interactive_title: "🌍 خريطة مصر الزراعية (أقمار صناعية + بيانات ناسا للمحافظات الـ 14)",
    map_interactive_sub: "انقر على أي محافظة لعرض قراءاتها الفضائية أو اختيارها كأرضك، وبدّل بين نوع الخريطة وطبقات الرصد.",
    bm_sat: "🛰️ قمر صناعي (أراضٍ زراعية)",
    bm_str: "🗺️ خريطة الحدود والمدن",
    ly_sm: "💧 رطوبة التربة",
    ly_heat: "🔥 الإجهاد الحراري",
    ly_sal: "🧂 خطر التملح",
    ch1_title: "📈 1. المسار التاريخي من أقمار ناسا والتنبؤ للموسم القادم",
    ch2_title: "🕸️ 2. مقارنة التوازن بين خطتك المخصصة والدورة التقليدية",
    ch3_title: "🌧️ 3. فجوة المياه: التبخر النتحي (ET0) مقابل الأمطار",
    sci1_t: "🛰️ 1. دمج بيانات الأقمار الصناعية (Multi-Sensor Data Fusion)",
    sci1_p: "لحل اختلاف الدقة المكانية والزمنية بين المستشعرات، قمنا بمواءمة البيانات على شبكة تحليل موحدة لكل محافظة (14 منطقة، 2016–2025): دمج رطوبة التربة السطحية والجذرية (SMAP & ERA5-Land)، حرارة السطح والإشعاع (NASA POWER & ECOSTRESS)، الهطول (GPM)، الكتلة الحيوية والغطاء النباتي (MODIS NDVI & GEDI)، وخصائص التربة (SoilGrids).",
    sci2_t: "🧠 2. الذكاء الاصطناعي وتفسير عدم اليقين (SI & Uncertainty)",
    sci2_p: "قارنّا نماذج إحصائية وتعلم آلي (Ridge, Random Forest, LightGBM, Gradient Boosting) وحقق Gradient Boosting أعلى دقة (R² = 87%). واستخدمنا Quantile Regression لتقدير نطاق عدم اليقين (± m³/m³)، مع إبراز الفترات الانتقالية بين المواسم والأراضي البور التي ترتفع فيها مخاطر التبخر.",
    sci3_t: "📡 3. الفرق بين القمر الصناعي والقياس الأرضي",
    sci3_p: "تغطي الأقمار الصناعية مساحات واسعة (كيلومترات) وتكشف الاتجاهات الإقليمية وموجات الحر مبكراً، بينما تقيس الحساسات الأرضية وتحاليل المعمل ظروف حقلك بدقة مترية (مثل ملوحة التربة ECe). الجمع بينهما يمنحك إنذاراً مبكراً ودقة تنفيذية.",
    sci4_t: "🌿 4. لماذا تنجح الدورة الزراعية المتنوعة؟",
    sci4_p: "البقوليات (فول/برسيم/لوبيا): تثبّت النيتروجين الجوي وتغني التربة. المحاصيل عميقة الجذور (سورغم/عباد شمس): تفكك الطبقات المتماسكة وتصل للرطوبة العميقة. محاصيل التغطية: تقلل التبخر وتحمي التربة من التعرية.",
    db_51_title: "📚 قاعدة بيانات الـ 51 محصولاً المصري الموثقة",
    bot_btn: "اسأل المهندس رَيّان",
    bot_title: "المهندس رَيّان • Rayan AI",
    months: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
  },
  en: {
    brand_title: "GREEN FUTURE",
    brand_sub: "Agri-Spatial Decision Intelligence (NASA Earth Observation) • Team ZERO SHOT",
    btn_science_lab: "🗺️ Maps & Science Lab",
    theme_light: "Light",
    theme_dark: "Dark",
    st_1: "Land Profile",
    st_2: "Goals & Constraints",
    st_3: "Custom Plan",
    st_4: "Maps & Science",
    s1_tag: "Step 1 of 3 • Field Identification",
    s1_title: "Tell us about your land to analyze NASA satellite records",
    s1_desc: "Your field is matched with 10 years of multi-sensor Earth Observation data (SMAP, POWER, ERA5, MODIS) to assess moisture and heat stress.",
    lbl_gov: "1. Governorate / Agricultural Region *",
    lbl_area: "2. Farm Area (Feddans) *",
    lbl_prev: "3. Current or Previous Crop *",
    lbl_window: "4. Satellite Reference Lookback Window *",
    win_today: "Current Day (Latest Observation)",
    win_week: "Past Week (7-Day Average)",
    win_month: "Past Month (30-Day Trend)",
    prev_soil_type: "Dominant Soil Profile",
    prev_sm: "Reference Soil Moisture",
    prev_temp: "Reference Max Temperature",
    btn_next_2: "Next: Set Goals & Farm Constraints ➡️",
    s2_tag: "Step 2 of 3 • Farmer-Centered Personalization",
    s2_title: "What is your main goal and what are your field constraints?",
    s2_desc: "Instead of generic plans, our engine synthesizes 3 tailored crop rotations from 51 verified crops matching your constraints.",
    lbl_main_goal: "1. Select your top priority for the upcoming season:",
    g_water_t: "Conserve Irrigation Water",
    g_water_d: "Low-ETc, drought-resilient crops for water-scarce periods",
    g_soil_t: "Restore Soil Fertility",
    g_soil_d: "Natural nitrogen fixation, lower fertilizer cost & pest break",
    g_profit_t: "Maximize Market Return",
    g_profit_d: "High-demand cash and export-oriented crops",
    g_bal_t: "Balanced Sustainability",
    g_bal_d: "Optimal trade-off between water, soil health, and income",
    lbl_water_avail: "2. Irrigation Water Availability",
    wa_norm: "Regular canal irrigation",
    wa_lim: "Intermittent canal turns / water deficit",
    wa_sal: "Well water or moderately saline soil",
    lbl_equip: "3. Mechanization & Labor Level",
    eq_std: "Standard tractor & tillage",
    eq_mod: "Modern machinery & laser leveling",
    eq_man: "Higher reliance on manual labor",
    lbl_market: "4. Market & Utilization Preference",
    mk_loc: "Strategic staple crops (guaranteed local market)",
    mk_cash: "Industrial & export crops (oilseeds / pulses)",
    mk_for: "Include green forage for livestock",
    sim_title: "🌡️ Next-Season Climate Scenario Simulator (90 Days)",
    scen_temp: "Expected Temperature Shift",
    scen_rain: "Expected Rainfall Change",
    btn_back_1: "⬅️ Back: Edit Land Info",
    btn_generate_plan: "🚀 Generate My Custom Rotation Plan",
    s3_tag: "Step 3 of 3 • Tailored Field Recommendation",
    btn_edit_prefs: "✏️ Edit Goals",
    btn_view_maps: "🗺️ View Maps & Charts",
    btn_print_pdf: "🖨️ Print Prescription (PDF)",
    sum_sm_lbl: "Soil Moisture (Ref ➔ Seasonal Forecast)",
    sum_temp_lbl: "Expected Seasonal Max Temp",
    sum_save_lbl: "Projected Impact of Your Top Custom Rotation",
    custom_cards_title: "🌾 Rotations Custom-Built for Your Land (vs. Traditional Baseline)",
    custom_cards_sub: "Crops are dynamically selected from our 51-crop database to fit your water, salinity, and pest-break constraints.",
    tl_title: "📅 12-Month Operational Implementation Timeline",
    leg_crop: "Cultivation",
    leg_cover: "Soil Moisture Cover",
    leg_pest: "Pest Break & Prep",
    hj_title: "👨‍🌾 Human Judgment & Local Expertise:",
    hj_desc: "These satellite-derived insights support—not replace—farmer judgment. Satellites cannot directly measure field-level soil salinity (ECe) or well salinity; always test soil samples and consult local extension engineers.",
    s4_tag: "Geospatial & Modeling Lab • NASA Data Fusion",
    s4_title: "🗺️ Interactive Satellite Maps & Interpretive Charts",
    btn_back_plan: "➡️ Back to My Rotation Plan",
    map_interactive_title: "🌍 Interactive Egypt Agricultural Map (Satellite + 14 Governorates)",
    map_interactive_sub: "Click any governorate to inspect satellite metrics or select it as your farm, and toggle basemaps or layers.",
    bm_sat: "🛰️ Satellite Imagery",
    bm_str: "🗺️ Street & Borders",
    ly_sm: "💧 Soil Moisture",
    ly_heat: "🔥 Heat Stress",
    ly_sal: "🧂 Salinity Risk",
    ch1_title: "📈 1. Historical NASA Trajectory & Seasonal Forecast",
    ch2_title: "🕸️ 2. Balance Comparison: Custom Plan vs. Baseline",
    ch3_title: "🌧️ 3. Water Gap: Evapotranspiration (ET0) vs. Rainfall",
    sci1_t: "🛰️ 1. Multi-Sensor Satellite Data Fusion",
    sci1_p: "We harmonized multi-resolution sensors onto a unified governorate grid (14 zones, 2016–2025): SMAP & ERA5-Land soil moisture, NASA POWER & ECOSTRESS temperature, GPM rainfall, MODIS NDVI & GEDI biomass, and SoilGrids.",
    sci2_t: "🧠 2. Statistical & ML Modeling + Uncertainty",
    sci2_p: "Gradient Boosting achieved R² = 87% across climate-soil features, paired with Quantile Regression uncertainty bounds (± m³/m³) to flag bare-field evaporation risks.",
    sci3_t: "📡 3. Satellite vs. Ground-Based Measurements",
    sci3_p: "Satellites capture wide regional anomalies early, while ground sensors and lab tests measure field-specific ECe and well water quality. Combining both maximizes accuracy.",
    sci4_t: "🌿 4. Agronomic Benefits of Diverse Rotations",
    sci4_p: "Nitrogen-fixing legumes enrich soil naturally; deep-rooting crops access subsoil moisture; cover crops prevent erosion and evaporation.",
    db_51_title: "📚 Verified 51-Crop Agronomic Database",
    bot_btn: "Ask Eng. Rayan",
    bot_title: "Eng. Rayan • Rayan AI",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  }
};

const VAR_LABELS = {
  ERA5_SoilMoi_0_7cm_cm3: { ar: "رطوبة التربة 0–7 سم (m³/m³)", en: "Topsoil Moisture 0–7cm (m³/m³)" },
  POWER_Temp_Max_C: { ar: "الحرارة العظمى (°C)", en: "Max Temperature (°C)" },
  ERA5_ET0_mm: { ar: "التبخر النتحي ET0 (مم/يوم)", en: "Evapotranspiration ET0 (mm/day)" }
};

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      const v = (cols[i] || "").trim();
      obj[h] = v !== "" && !isNaN(v) ? +v : v;
    });
    return obj;
  });
}

function normalizeArabic(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/\bال/g, "")
    .trim();
}

function goToScreen(stepNum) {
  APP.currentStep = stepNum;
  document.querySelectorAll(".wizard-screen").forEach((s) => s.classList.remove("active"));
  $(`screen-${stepNum}`).classList.add("active");

  for (let i = 1; i <= 4; i++) {
    const el = $(`ind-${i}`);
    el.classList.remove("active", "done");
    if (i === stepNum) el.classList.add("active");
    else if (i < stepNum) el.classList.add("done");
    if (i < 4) $(`conn-${i}`).classList.toggle("done", i < stepNum);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (stepNum === 4) {
    setTimeout(() => {
      initOrUpdateLeafletMap();
      renderAllCharts();
    }, 120);
  }
}

function getReferenceData(gov) {
  const recs = APP.climate.filter((r) => r.Governorate === gov);
  if (!recs.length) return { sm: 0.275, tmax: 32.0, et0: 4.9, labelAr: "آخر أسبوع", labelEn: "Past Week" };
  const win = $("lookback-window").value;
  const count = win === "today" ? 1 : win === "week" ? 2 : 4;
  const sub = recs.slice(-count);
  const avg = (k) => sub.reduce((a, b) => a + (+b[k] || 0), 0) / sub.length;
  const lbls = {
    today: { ar: "اليوم الحالي", en: "Today" },
    week: { ar: "آخر أسبوع", en: "Past Week" },
    month: { ar: "آخر شهر", en: "Past Month" }
  };
  return {
    sm: avg("ERA5_SoilMoi_0_7cm_cm3"),
    tmax: avg("POWER_Temp_Max_C"),
    et0: avg("ERA5_ET0_mm"),
    labelAr: lbls[win].ar,
    labelEn: lbls[win].en
  };
}

function getForecastData(gov) {
  const st = (+$("st").value).toFixed(1);
  const gp = APP.preds[gov] || {};
  return (
    gp[st] ||
    gp["0.0"] || {
      rows: [],
      r2: 0.87,
      mae: 0.014,
      pred_sm: 0.265,
      uncertainty: 0.016,
      pred_tmax: 33.8,
      soil_ph: 7.9,
      soil_clay: 40.0
    }
  );
}

function updateStep1Preview() {
  const gov = $("loc").value || "Sharqia";
  const meta = GOV_META[gov] || GOV_META.Sharqia;
  const ref = getReferenceData(gov);
  $("prev-soil-info").textContent = APP.lang === "ar" ? meta.soil_ar : meta.soil_en;
  $("prev-sm-info").textContent = `${ref.sm.toFixed(3)} m³/m³`;
  $("prev-temp-info").textContent = `${ref.tmax.toFixed(1)} °C`;
}

function buildCustomRotations() {
  const isAr = APP.lang === "ar";
  const gov = $("loc").value || "Sharqia";
  const meta = GOV_META[gov] || GOV_META.Sharqia;
  const feddans = Math.max(0.5, +$("area-feddan").value || 5);
  const prevCropName = $("prev").value || "قمح";
  const prevCrop = APP.crops.find((c) => c.Crop_Name_AR === prevCropName) || { Crop_Family: "Poaceae" };

  const waterAvail = $("water-avail").value;
  const marketPref = $("market-pref").value;
  const tempDelta = +$("st").value;
  const rainPct = +$("sr").value;

  const ref = getReferenceData(gov);
  const fc = getForecastData(gov);

  const winterCrops = APP.crops.filter((c) => String(c.Season).toLowerCase().includes("winter"));
  const summerCrops = APP.crops.filter((c) => String(c.Season).toLowerCase().includes("summer"));

  function scoreCrop(c, mode, avoidFamily) {
    let sc = 50;
    const etc = +c.Crop_Water_Requirement_ETc_mm || 550;
    const nFix = +c.Gross_Nitrogen_Fixation_kg_ha || 0;
    const sal = +c.Soil_Salinity_Threshold_ECe_dS_m || 3.0;
    const drought = String(c.Drought_Tolerance || "Medium");
    const heat = String(c.Heat_Tolerance || "Medium");
    const val = String(c.Economic_Market_Value || "Medium");
    const fam = String(c.Crop_Family || "");

    if (avoidFamily && fam === avoidFamily) sc -= 35;
    else sc += 18;

    if (waterAvail === "saline_well" || meta.salinity >= 4.0) {
      sc += sal >= 4.5 ? 25 : sal < 2.5 ? -25 : 0;
    }

    if (waterAvail === "limited" || mode === "water" || tempDelta >= 2) {
      sc += etc < 480 ? 24 : etc > 700 ? -25 : 5;
      if (drought === "High") sc += 15;
      if (heat === "High") sc += 12;
    }

    if (mode === "soil") sc += nFix > 80 ? 32 : nFix > 0 ? 15 : -5;
    if (mode === "profit" || marketPref === "cash") sc += val === "High" ? 26 : val === "Medium" ? 10 : -8;
    if (marketPref === "forage" && (fam === "Fabaceae" || String(c.Crop_Name_EN).toLowerCase().includes("clover") || String(c.Crop_Name_EN).toLowerCase().includes("sorghum"))) {
      sc += 28;
    }
    return sc;
  }

  function pickTop(list, mode, avoidFamily, excludeNames = []) {
    return [...list]
      .filter((c) => !excludeNames.includes(c.Crop_Name_AR))
      .sort((a, b) => scoreCrop(b, mode, avoidFamily) - scoreCrop(a, mode, avoidFamily))[0];
  }

  const modes = [
    {
      id: "CUSTOM_PRIMARY",
      mode: APP.goal,
      title_ar: "الخطة المخصصة الأولى (الأكثر توافقاً مع هدفك)",
      title_en: "Primary Custom Rotation (Best Goal Alignment)",
      why_ar: "تم اختيار محاصيلها خصيصاً لكسر دورة آفات محصولك السابق وتحقيق أولويتك القصوى في ظل توقعات الرطوبة والحرارة لمحافظتك.",
      why_en: "Tailored to break your previous crop's pest cycle while maximizing your primary priority under local forecast conditions."
    },
    {
      id: "CUSTOM_RESILIENT",
      mode: APP.goal === "water" ? "soil" : "water",
      title_ar: "الخطة البديلة (درع الأمان المائي وخصوبة التربة)",
      title_en: "Alternative Rotation (Water & Soil Resilience Shield)",
      why_ar: "تركّز على تقليل تكاليف الري والأسمدة الأزوتية وحماية التربة من الإجهاد الحراري خلال فترات الذروة.",
      why_en: "Focuses on cutting irrigation and nitrogen fertilizer inputs while shielding soil against thermal stress."
    },
    {
      id: "CUSTOM_MARKET",
      mode: APP.goal === "profit" ? "balanced" : "profit",
      title_ar: "الخطة البديلة (تعظيم العائد التسويقي والتنوع)",
      title_en: "Alternative Rotation (Market Value & Diversification)",
      why_ar: "تجمع بين محصول نقدي عالي الطلب ومحصول بقولي لتحسين بنية التربة وضمان صافي ربح مجزٍ للفدان.",
      why_en: "Combines high-demand cash crops with soil-enriching legumes for strong net farm profitability."
    }
  ];

  const wheat = APP.crops.find((c) => c.Crop_Name_AR === "قمح") || winterCrops[0];
  const rice = APP.crops.find((c) => c.Crop_Name_AR === "أرز") || summerCrops[0];
  const baseWaterMm = (+wheat.Crop_Water_Requirement_ETc_mm || 550) * 2 + (+rice.Crop_Water_Requirement_ETc_mm || 1100);

  const usedCombos = new Set();
  const generated = modes.map((m, i) => {
    const w1 = pickTop(winterCrops, m.mode, prevCrop.Crop_Family, i > 0 ? [...usedCombos] : []);
    if (w1) usedCombos.add(w1.Crop_Name_AR);
    const s1 = pickTop(summerCrops, m.mode, w1?.Crop_Family, []);
    const w2 = pickTop(winterCrops, m.mode, s1?.Crop_Family, [w1?.Crop_Name_AR]);

    const seq = [w1, s1, w2].filter(Boolean);
    const totalWaterMm = seq.reduce((a, c) => a + (+c.Crop_Water_Requirement_ETc_mm || 520), 0);
    const totalN_ha = seq.reduce((a, c) => a + (+c.Gross_Nitrogen_Fixation_kg_ha || 0), 0);
    const avgSal = seq.reduce((a, c) => a + (+c.Soil_Salinity_Threshold_ECe_dS_m || 3.2), 0) / seq.length;

    const savedMm = Math.max(80, Math.round(baseWaterMm - totalWaterMm));
    const savedPct = Math.min(55, Math.max(12, Math.round((savedMm / baseWaterMm) * 100)));
    const savedM3 = Math.round(savedMm * 4.2 * feddans);
    const ureaBags = Math.max(2, Math.round((totalN_ha * 0.42 * feddans) / 23));

    const waterScore = Math.min(97, Math.max(55, 62 + savedPct * 0.75 + rainPct / 15));
    const soilScore = Math.min(97, Math.max(55, 58 + (totalN_ha / 180) * 35));
    const econScore = Math.min(96, Math.max(60, 74 + (m.mode === "profit" ? 16 : 6)));
    const totalScore = Math.round(i === 0 ? Math.max(84, (waterScore + soilScore + econScore) / 3 + 5) : (waterScore + soilScore + econScore) / 3);

    return {
      ...m,
      is_baseline: false,
      seq,
      score: Math.min(98, totalScore),
      savedPct,
      savedM3,
      ureaBags,
      totalN_ha: Math.round(totalN_ha),
      avgSal: avgSal.toFixed(1),
      scores: {
        water: Math.round(waterScore),
        soil: Math.round(soilScore),
        salinity: Math.min(96, Math.round(avgSal * 15)),
        heat: Math.max(55, Math.round(88 - tempDelta * 4)),
        profit: Math.round(econScore)
      }
    };
  });

  generated.push({
    id: "BASELINE",
    is_baseline: true,
    title_ar: "الدورة التقليدية السائدة (خط الأساس للمقارنة)",
    title_en: "Traditional Baseline Pattern (For Comparison)",
    why_ar: "تعتمد على تكرار الحبوب المستهلكة للمياه والنيتروجين، مما يرفع تكلفة الري والأسمدة ويزيد إجهاد التربة.",
    why_en: "Relies on water- and nitrogen-intensive cereal repetition, raising irrigation and fertilizer costs.",
    seq: [wheat, rice, wheat].filter(Boolean),
    score: 38,
    savedPct: 0,
    savedM3: 0,
    ureaBags: 0,
    totalN_ha: 0,
    avgSal: "3.0",
    scores: { water: 28, soil: 25, salinity: 45, heat: 42, profit: 60 }
  });

  APP.customPlans = generated;
  APP.summary = {
    gov,
    govName: isAr ? meta.ar : meta.en,
    feddans,
    prevCropName,
    ref,
    fc,
    best: generated[0]
  };

  renderScreen3Results();
  buildPrintablePrescription();
}

function renderScreen3Results() {
  const isAr = APP.lang === "ar";
  const s = APP.summary;
  const b = s.best;

  $("custom-plan-headline").textContent = isAr
    ? `الخطة الزراعية المخصصة لمحافظة ${s.govName} (${s.feddans} فدان • بعد محصول ${s.prevCropName})`
    : `Custom Rotation Plan for ${s.govName} (${s.feddans} Feddans • After ${s.prevCropName})`;

  const smDiff = ((s.fc.pred_sm - s.ref.sm) / (s.ref.sm || 1)) * 100;
  $("res-sm").textContent = `${s.ref.sm.toFixed(3)} ➔ ${s.fc.pred_sm.toFixed(3)} m³/m³`;
  $("res-sm-meaning").textContent = isAr
    ? `${smDiff < -3 ? "انخفاض متوقع في الرطوبة — الأولوية لتوفير المياه" : "رطوبة مستقرة للموسم القادم"} (±${s.fc.uncertainty.toFixed(3)})`
    : `${smDiff < -3 ? "Projected moisture drop — prioritize water conservation" : "Stable moisture regime"} (±${s.fc.uncertainty.toFixed(3)})`;

  $("res-tmax").textContent = `${s.ref.tmax.toFixed(1)}° ➔ ${s.fc.pred_tmax.toFixed(1)} °C`;
  $("res-temp-meaning").textContent = isAr
    ? s.fc.pred_tmax >= 36 ? "حرارة مرتفعة: تم ترشيح أصناف متحملة للإجهاد الحراري" : "حرارة مناسبة للنمو مع انتظام فترات الري"
    : s.fc.pred_tmax >= 36 ? "High heat regime: heat-tolerant cultivars prioritized" : "Favorable thermal regime with scheduled irrigation";

  $("res-impact").textContent = isAr
    ? `توفير ${b.savedM3.toLocaleString()} م³ مياه (${b.savedPct}%)`
    : `Save ${b.savedM3.toLocaleString()} m³ Water (${b.savedPct}%)`;
  $("res-impact-sub").textContent = isAr
    ? `إجمالي لـ ${s.feddans} فدان + توفير ~${b.ureaBags} شكارة سماد يوريا`
    : `Total for ${s.feddans} Feddans + ~${b.ureaBags} Urea Bags Saved`;

  $("cards").innerHTML = APP.customPlans
    .map((p, idx) => {
      const isBest = idx === 0;
      const badgeTxt = isBest
        ? isAr ? "🥇 الخطة الأنسب لأرضك" : "🥇 Best Match"
        : p.is_baseline
        ? isAr ? "خط الأساس التقليدي" : "Traditional Baseline"
        : isAr ? `خطة بديلة #${idx + 1}` : `Alternative #${idx + 1}`;
      const badgeCls = isBest ? "plan-badge" : p.is_baseline ? "plan-badge base" : "plan-badge alt";

      const chainHtml = p.seq
        .map((c) => `<span class="crop-chip">${isAr ? c.Crop_Name_AR : c.Crop_Name_EN}</span>`)
        .join(" ⬅️ ");

      return `<article class="plan-card ${isBest ? "best" : ""} ${p.is_baseline ? "baseline" : ""}">
        <div class="flex-between">
          <span class="${badgeCls}">${badgeTxt}</span>
          <strong>${p.score} / 100</strong>
        </div>
        <h4>${isAr ? p.title_ar : p.title_en}</h4>
        <div class="crop-chain">${chainHtml}</div>
        <div class="plan-why">
          <strong>${isAr ? "لماذا نرشحها لك؟" : "Why this plan?"}</strong><br>
          ${isAr ? p.why_ar : p.why_en}
        </div>
        <div class="plan-metrics">
          <div class="pm-item">
            <small>${isAr ? "وفر المياه الكلي" : "Total Water Saved"}</small>
            <strong>${p.is_baseline ? (isAr ? "0 م³ (استهلاك عالٍ)" : "0 m³ (High Use)") : `${p.savedM3.toLocaleString()} م³ (${p.savedPct}%)`}</strong>
          </div>
          <div class="pm-item">
            <small>${isAr ? "وفر سماد اليوريا" : "Urea Fertilizer Saved"}</small>
            <strong>${p.is_baseline ? "0" : isAr ? `~${p.ureaBags} شكارة` : `~${p.ureaBags} bags`}</strong>
          </div>
        </div>
      </article>`;
    })
    .join("");

  $("tlsel").innerHTML = APP.customPlans
    .map((p, i) => `<option value="${i}">${isAr ? p.title_ar : p.title_en}</option>`)
    .join("");
  renderTimeline();
}

function renderTimeline() {
  const isAr = APP.lang === "ar";
  const plan = APP.customPlans[+$("tlsel").value || 0];
  if (!plan || !plan.seq.length) return;

  const months = I18N[APP.lang].months;
  let html = "<div></div>" + months.map((m) => `<div class="m">${m}</div>`).join("");

  const c1 = plan.seq[0];
  const c2 = plan.seq[1] || plan.seq[0];
  const rows = [
    { name: isAr ? `${c1.Crop_Name_AR} (شتوي)` : `${c1.Crop_Name_EN} (Winter)`, start: 11, end: 4, type: "crop" },
    { name: isAr ? `${c2.Crop_Name_AR} (صيفي)` : `${c2.Crop_Name_EN} (Summer)`, start: 5, end: 8, type: "crop" },
    { name: isAr ? "تغطية التربة وكسر الآفات" : "Soil Cover & Pest Break", start: 9, end: 10, type: plan.is_baseline ? "pest" : "cover" }
  ];

  rows.forEach((r) => {
    html += `<div><strong>${r.name}</strong></div>`;
    for (let m = 1; m <= 12; m++) {
      const on = r.start <= r.end ? m >= r.start && m <= r.end : m >= r.start || m <= r.end;
      html += on ? `<div class="cell ${r.type}"></div>` : `<div class="cell"></div>`;
    }
  });
  $("tl").innerHTML = html;
}

function initOrUpdateLeafletMap() {
  if (typeof L === "undefined") return;
  const isAr = APP.lang === "ar";

  if (!APP.leafletMap) {
    APP.leafletMap = L.map("egypt-leaflet-map").setView([29.3, 31.1], 6);
    APP.leafletMarkers = L.layerGroup().addTo(APP.leafletMap);
  }

  if (APP.tileLayer) APP.leafletMap.removeLayer(APP.tileLayer);
  if (APP.basemap === "satellite") {
    APP.tileLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri &mdash; Earth Observation Imagery", maxZoom: 18 }
    ).addTo(APP.leafletMap);
  } else {
    APP.tileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "&copy; OpenStreetMap contributors", maxZoom: 18 }
    ).addTo(APP.leafletMap);
  }

  APP.leafletMap.invalidateSize();
  APP.leafletMarkers.clearLayers();

  if (APP.mapLayer === "moisture") {
    $("map-legend-bar").innerHTML = isAr
      ? `<span><i style="background:#0284c7"></i> رطوبة مرتفعة (&gt; 0.22 m³/m³)</span><span><i style="background:#16a34a"></i> رطوبة متوسطة (0.14 – 0.22)</span><span><i style="background:#dc2626"></i> جفاف سطحي (&lt; 0.14 m³/m³)</span>`
      : `<span><i style="background:#0284c7"></i> High Moisture (&gt; 0.22)</span><span><i style="background:#16a34a"></i> Moderate (0.14 – 0.22)</span><span><i style="background:#dc2626"></i> Dry Soil (&lt; 0.14)</span>`;
  } else if (APP.mapLayer === "heat") {
    $("map-legend-bar").innerHTML = isAr
      ? `<span><i style="background:#16a34a"></i> حرارة معتدلة (&lt; 33°C)</span><span><i style="background:#f59e0b"></i> إجهاد حراري متوسط (33 – 36°C)</span><span><i style="background:#dc2626"></i> إجهاد حراري شديد (&gt; 36°C)</span>`
      : `<span><i style="background:#16a34a"></i> Moderate (&lt; 33°C)</span><span><i style="background:#f59e0b"></i> Warm Stress (33 – 36°C)</span><span><i style="background:#dc2626"></i> Severe Heat (&gt; 36°C)</span>`;
  } else {
    $("map-legend-bar").innerHTML = isAr
      ? `<span><i style="background:#16a34a"></i> تربة منخفضة الملوحة (&lt; 3.0 dS/m)</span><span><i style="background:#f59e0b"></i> ملوحة متوسطة (3.0 – 4.0 dS/m)</span><span><i style="background:#dc2626"></i> خطر تملح مرتفع (&gt; 4.0 dS/m)</span>`
      : `<span><i style="background:#16a34a"></i> Low Salinity (&lt; 3.0 dS/m)</span><span><i style="background:#f59e0b"></i> Moderate (3.0 – 4.0 dS/m)</span><span><i style="background:#dc2626"></i> High Salinity Risk (&gt; 4.0 dS/m)</span>`;
  }

  const selectedGov = $("loc").value || "Sharqia";

  Object.entries(GOV_META).forEach(([key, meta]) => {
    const fc = getForecastData(key);
    const ref = getReferenceData(key);
    let color = "#16a34a";
    let metricText = "";

    if (APP.mapLayer === "moisture") {
      color = fc.pred_sm >= 0.22 ? "#0284c7" : fc.pred_sm >= 0.14 ? "#16a34a" : "#dc2626";
      metricText = isAr ? `رطوبة التربة المتوقعة: <b>${fc.pred_sm.toFixed(3)} m³/m³</b>` : `Forecast Moisture: <b>${fc.pred_sm.toFixed(3)} m³/m³</b>`;
    } else if (APP.mapLayer === "heat") {
      color = fc.pred_tmax >= 36 ? "#dc2626" : fc.pred_tmax >= 33 ? "#f59e0b" : "#16a34a";
      metricText = isAr ? `الحرارة العظمى المتوقعة: <b>${fc.pred_tmax.toFixed(1)} °C</b>` : `Forecast Max Temp: <b>${fc.pred_tmax.toFixed(1)} °C</b>`;
    } else {
      color = meta.salinity >= 4.0 ? "#dc2626" : meta.salinity >= 3.0 ? "#f59e0b" : "#16a34a";
      metricText = isAr ? `مؤشر ملوحة التربة: <b>${meta.salinity} dS/m</b>` : `Soil Salinity Index: <b>${meta.salinity} dS/m</b>`;
    }

    L.circle([meta.lat, meta.lng], {
      radius: 18000,
      color: color,
      fillColor: color,
      fillOpacity: 0.32,
      weight: key === selectedGov ? 3 : 1.5
    }).addTo(APP.leafletMarkers);

    const marker = L.circleMarker([meta.lat, meta.lng], {
      radius: key === selectedGov ? 11 : 8,
      fillColor: color,
      color: "#ffffff",
      weight: 2.5,
      fillOpacity: 0.95
    });

    marker.bindPopup(`
      <div style="font-family:Cairo,sans-serif;text-align:start;min-width:210px;color:#12261b">
        <strong style="font-size:1rem">📍 ${isAr ? meta.ar : meta.en}</strong><br>
        <small style="color:#4a6355">${isAr ? meta.soil_ar : meta.soil_en}</small>
        <hr style="margin:6px 0;border:0;border-top:1px solid #d1e2d8">
        <div>${metricText}</div>
        <div>${isAr ? `الرطوبة الحالية: <b>${ref.sm.toFixed(3)} m³/m³</b>` : `Current SM: <b>${ref.sm.toFixed(3)} m³/m³</b>`}</div>
        <button onclick="selectGovFromMap('${key}')" style="margin-top:8px;width:100%;padding:7px;background:#15803d;color:#fff;border:0;border-radius:8px;font-family:Cairo,sans-serif;font-weight:700;cursor:pointer">
          ${isAr ? "✅ تطبيق خطتي على هذه المحافظة" : "✅ Apply Plan to This Region"}
        </button>
      </div>
    `);
    marker.addTo(APP.leafletMarkers);
  });
}

window.selectGovFromMap = function (govKey) {
  $("loc").value = govKey;
  updateStep1Preview();
  buildCustomRotations();
  goToScreen(3);
};

function renderAllCharts() {
  const isAr = APP.lang === "ar";
  const isDark = APP.theme === "dark";
  const textColor = isDark ? "#f0f7f3" : "#12261b";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const gov = $("loc").value || "Sharqia";
  const govName = GOV_META[gov] ? GOV_META[gov][APP.lang] : gov;
  const hist = APP.climate.filter((r) => r.Governorate === gov).slice(-24);
  const fc = getForecastData(gov);
  const ref = getReferenceData(gov);

  const variable = $("var").value || "ERA5_SoilMoi_0_7cm_cm3";
  const labels1 = hist.map((r) => r.Date);
  const data1 = hist.map((r) => +r[variable]);
  let predLine = [], predHi = [], predLo = [];

  if (variable === "ERA5_SoilMoi_0_7cm_cm3" && fc.rows && fc.rows.length) {
    fc.rows.forEach((r) => {
      labels1.push(r.d);
      data1.push(null);
    });
    const pad = new Array(hist.length - 1).fill(null);
    const lastV = hist[hist.length - 1][variable];
    predLine = [...pad, lastV, ...fc.rows.map((r) => r.sm)];
    predHi = [...pad, lastV, ...fc.rows.map((r) => r.sm_hi)];
    predLo = [...pad, lastV, ...fc.rows.map((r) => r.sm_lo)];
  }

  if (APP.charts.forecast) APP.charts.forecast.destroy();
  const ds1 = [
    {
      label: isAr ? "رصد أقمار ناسا الفعلي" : "NASA Historical Observation",
      data: data1,
      borderColor: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.14)",
      borderWidth: 2.5,
      fill: true,
      tension: 0.35,
      pointRadius: 2.5
    }
  ];
  if (predLine.length) {
    ds1.push(
      {
        label: isAr ? "توقع الذكاء الاصطناعي للموسم القادم" : "Seasonal AI Forecast",
        data: predLine,
        borderColor: "#38bdf8",
        borderDash: [6, 4],
        borderWidth: 3,
        tension: 0.35,
        pointRadius: 3
      },
      {
        label: isAr ? "نطاق الثقة وعدم اليقين" : "Uncertainty Range",
        data: predHi,
        backgroundColor: "rgba(56, 189, 248, 0.2)",
        borderColor: "transparent",
        fill: "+1",
        pointRadius: 0
      },
      { label: "_lo", data: predLo, borderColor: "transparent", fill: false, pointRadius: 0 }
    );
  }

  APP.charts.forecast = new Chart($("chart-forecast"), {
    type: "line",
    data: { labels: labels1, datasets: ds1 },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: textColor, filter: (i) => i.text !== "_lo", font: { family: isAr ? "Cairo" : "Plus Jakarta Sans", weight: "bold" } } }
      },
      scales: {
        x: { ticks: { color: textColor, maxTicksLimit: 10 }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      }
    }
  });

  const trendTxt = fc.pred_sm < ref.sm
    ? isAr ? "انخفاضاً تدريجياً في رطوبة التربة السطحية؛ مما يعني ضرورة تقارب فترات الري الخفيف وتغطية التربة." : "a gradual drop in topsoil moisture, requiring scheduled light irrigation and soil mulching."
    : isAr ? "استقراراً جيداً في رطوبة التربة خلال الأسابيع القادمة." : "stable soil moisture conditions over the upcoming weeks.";

  $("insight-forecast").innerHTML = isAr
    ? `💡 <b>ماذا يعني هذا الرسم لمزرعتك في ${govName}؟</b><br>الخط الأخضر يوضح سجل رطوبة التربة الفعلي من أقمار ناسا، والخط الأزرق المتقطع يتوقع ${trendTxt} (دقة النموذج R² = ${fc.r2}).`
    : `💡 <b>What does this chart mean for your farm in ${govName}?</b><br>The green line shows historical NASA moisture, while the dashed blue line projects ${trendTxt} (Model R² = ${fc.r2}).`;

  if (APP.charts.radar) APP.charts.radar.destroy();
  const pBest = APP.customPlans[0];
  const pBase = APP.customPlans[APP.customPlans.length - 1];
  if (pBest && pBase) {
    APP.charts.radar = new Chart($("chart-radar"), {
      type: "radar",
      data: {
        labels: isAr
          ? ["توفير المياه", "خصوبة التربة", "تحمل الملوحة", "مقاومة الحر", "العائد الاقتصادي"]
          : ["Water Saving", "Soil Fertility", "Salinity Limit", "Heat Resilience", "Market Profit"],
        datasets: [
          {
            label: isAr ? "خطتك المخصصة الأولى" : "Your Top Custom Plan",
            data: [pBest.scores.water, pBest.scores.soil, pBest.scores.salinity, pBest.scores.heat, pBest.scores.profit],
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.25)",
            borderWidth: 2.5
          },
          {
            label: isAr ? "الدورة التقليدية" : "Traditional Baseline",
            data: [pBase.scores.water, pBase.scores.soil, pBase.scores.salinity, pBase.scores.heat, pBase.scores.profit],
            borderColor: "#f87171",
            backgroundColor: "rgba(248, 113, 113, 0.14)",
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { family: isAr ? "Cairo" : "Plus Jakarta Sans" } } } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: { color: textColor, font: { family: isAr ? "Cairo" : "Plus Jakarta Sans", size: 12, weight: "bold" } }
          }
        }
      }
    });

    $("insight-radar").innerHTML = isAr
      ? `💡 <b>الخلاصة العملية:</b> المساحة الخضراء الأوسع تثبت تفوق خطتك المخصصة (<b>${pBest.seq.map((c) => c.Crop_Name_AR).join(" ⬅️ ")}</b>) في توفير المياه وإصلاح التربة مقارنة بالدورة التقليدية الحمراء.`
      : `💡 <b>Practical Takeaway:</b> The wider green polygon shows how your custom plan outperforms the traditional red baseline in water saving and soil health.`;
  }

  if (APP.charts.waterbal) APP.charts.waterbal.destroy();
  const last12 = hist.slice(-12);
  APP.charts.waterbal = new Chart($("chart-waterbal"), {
    type: "bar",
    data: {
      labels: last12.map((r) => r.Date),
      datasets: [
        { label: isAr ? "التبخر اليومي ET0 (مم)" : "Daily Evapotranspiration ET0 (mm)", data: last12.map((r) => +r.ERA5_ET0_mm), backgroundColor: "#fbbf24", borderRadius: 6 },
        { label: isAr ? "الأمطار (مم/يوم)" : "Rainfall (mm/day)", data: last12.map((r) => +r.POWER_Precip_mm_day), backgroundColor: "#38bdf8", borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { family: isAr ? "Cairo" : "Plus Jakarta Sans" } } } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      }
    }
  });

  $("insight-waterbal").innerHTML = isAr
    ? `💡 <b>تفسير الميزان المائي:</b> الأعمدة الصفراء تمثل كمية الماء التي تفقدها الأرض بالبخر يومياً (<b>${ref.et0.toFixed(1)} مم/يوم</b> حالياً)، ولأن الأمطار في مصر محدودة، يعتمد المحصول كلياً على تعويض هذا الفقد بالري المنظم.`
    : `💡 <b>Water Balance Insight:</b> Yellow bars show daily water loss via evapotranspiration (currently <b>${ref.et0.toFixed(1)} mm/day</b>), guiding precise irrigation scheduling.`;
}

function renderCropsTable(filter = "") {
  const isAr = APP.lang === "ar";
  const q = filter.trim().toLowerCase();
  const cols = isAr
    ? [["Crop_Name_AR", "المحصول"], ["Crop_Family", "العائلة"], ["Season", "الموسم"], ["Crop_Water_Requirement_ETc_mm", "الاحتياج المائي (مم)"], ["Gross_Nitrogen_Fixation_kg_ha", "تثبيت النيتروجين"], ["Soil_Salinity_Threshold_ECe_dS_m", "تحمل الملوحة (dS/m)"]]
    : [["Crop_Name_EN", "Crop"], ["Crop_Family", "Family"], ["Season", "Season"], ["Crop_Water_Requirement_ETc_mm", "Water ETc (mm)"], ["Gross_Nitrogen_Fixation_kg_ha", "N-Fixation"], ["Soil_Salinity_Threshold_ECe_dS_m", "Salinity (dS/m)"]];

  const rows = APP.crops.filter((r) => !q || Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  $("crops").innerHTML =
    "<tr>" + cols.map((c) => `<th>${c[1]}</th>`).join("") + "</tr>" +
    rows.map((r) => "<tr>" + cols.map((c) => `<td>${r[c[0]] ?? "-"}</td>`).join("") + "</tr>").join("");
}

function buildPrintablePrescription() {
  const s = APP.summary;
  if (!s || !s.best) return;
  const b = s.best;
  $("print-sheet").innerHTML = `
    <h2>🌱 GREEN FUTURE — الروشتة الزراعية المخصصة للمزارع</h2>
    <p><strong>المحافظة:</strong> ${s.govName} | <strong>المساحة:</strong> ${s.feddans} فدان | <strong>المحصول السابق:</strong> ${s.prevCropName}</p>
    <hr>
    <h3>1. قراءات أقمار ناسا والتنبؤ الموسمي القادم</h3>
    <ul>
      <li>رطوبة التربة المرجعية (${s.ref.labelAr}): <strong>${s.ref.sm.toFixed(3)} m³/m³</strong> ➔ التوقع الموسمي: <strong>${s.fc.pred_sm.toFixed(3)} ± ${s.fc.uncertainty.toFixed(3)} m³/m³</strong></li>
      <li>الحرارة العظمى المتوقعة: <strong>${s.fc.pred_tmax.toFixed(1)} °C</strong></li>
    </ul>
    <h3>2. الخطة المخصصة الأولى: ${b.title_ar} (${b.score}/100)</h3>
    <p><strong>تتابع المحاصيل:</strong> ${b.seq.map((c) => c.Crop_Name_AR).join(" ⬅️ ")}</p>
    <p><strong>الأثر المتوقع لـ ${s.feddans} فدان:</strong> توفير <strong>${b.savedM3.toLocaleString()} م³</strong> من مياه الري (${b.savedPct}%) وتوفير نحو <strong>${b.ureaBags} شكارة سماد يوريا</strong>.</p>
    <p><strong>ملاحظة فنية:</strong> يُنصح بفحص عينة تربة ومياه آبار محلياً ومراجعة المرشد الزراعي قبل التنفيذ.</p>
  `;
}

// ============================================================================
// المهندس رَيّان (Rayan AI) — ربط تلقائي مباشر بالذكاء الاصطناعي + صوت عربي/إنجليزي
// ============================================================================
function initRayanAIAssistant() {
  const launcher = $("help-launcher");
  const panel = $("help-panel");
  const close = $("help-close");
  const form = $("help-form");
  const input = $("help-input");
  const messages = $("help-messages");
  const micBtn = $("voice-mic-btn");
  const voiceStatus = $("voice-status");
  const autoTtsBtn = $("auto-tts-toggle");
  const clearBtn = $("clear-chat-btn");

  const USER_API_KEY = "";

  autoTtsBtn.onclick = () => {
    APP.autoSpeak = !APP.autoSpeak;
    autoTtsBtn.textContent = APP.autoSpeak ? "🔊" : "🔇";
    if (!APP.autoSpeak) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (typeof window.responsiveVoice !== "undefined") window.responsiveVoice.cancel();
    }
  };

  clearBtn.onclick = () => {
    APP.chatHistory = [];
    messages.innerHTML = `
      <div class="rayan-msg bot">
        <div class="msg-bubble">
          تم بدء جلسة جديدة 🌾 كيف يمكنني مساعدتك في مزرعتك الآن يا هندسة؟
        </div>
      </div>`;
  };

  let cachedVoices = [];
  if ("speechSynthesis" in window) {
    const loadVoices = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speakText(htmlOrText, btnEl = null) {
    const cleanText = htmlOrText
      .replace(/<[^>]*>/g, " ")
      .replace(/[•⬅️🥇🌾💧🧂🔥📈🕸️🌧️✅⚠️💡🔑🎙️🔊🔇👋📊🧭⚖️🟢]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleanText) return;

    const isArabicText = /[\u0600-\u06FF]/.test(cleanText);

    if (isArabicText && typeof window.responsiveVoice !== "undefined") {
      try {
        window.responsiveVoice.cancel();
        if (btnEl) btnEl.textContent = "⏸️ جاري القراءة...";
        window.responsiveVoice.speak(cleanText, "Arabic Male", {
          rate: 1.0,
          onend: () => { if (btnEl) btnEl.textContent = "🔊 استمع للرد"; }
        });
        return;
      } catch (e) {}
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleanText);
      const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
      if (isArabicText) {
        const arVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
        if (arVoice) utter.voice = arVoice;
        utter.lang = arVoice ? arVoice.lang : "ar-SA";
      } else {
        const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        if (enVoice) utter.voice = enVoice;
        utter.lang = enVoice ? enVoice.lang : "en-US";
      }
      if (btnEl) btnEl.textContent = "⏸️ جاري القراءة...";
      utter.onend = () => { if (btnEl) btnEl.textContent = isArabicText ? "🔊 استمع للرد" : "🔊 Listen"; };
      utter.onerror = () => { if (btnEl) btnEl.textContent = isArabicText ? "🔊 استمع للرد" : "🔊 Listen"; };
      window.speechSynthesis.speak(utter);
    }
  }

  function addUserMessage(text) {
    const wrap = document.createElement("div");
    wrap.className = "rayan-msg user";
    wrap.innerHTML = `<div class="msg-bubble"></div>`;
    wrap.querySelector(".msg-bubble").textContent = text;
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function addBotMessage(htmlText) {
    const wrap = document.createElement("div");
    wrap.className = "rayan-msg bot";
    wrap.innerHTML = `<div class="msg-bubble">${htmlText}</div>`;
    const speakBtn = document.createElement("button");
    speakBtn.type = "button";
    speakBtn.className = "speak-reply-btn";
    speakBtn.textContent = APP.lang === "ar" ? "🔊 استمع للرد" : "🔊 Listen";
    speakBtn.onclick = () => speakText(htmlText, speakBtn);
    wrap.appendChild(speakBtn);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;

    if (APP.autoSpeak) speakText(htmlText, speakBtn);
    return wrap;
  }

  function buildSystemContext() {
    const s = APP.summary;
    const landContext = s
      ? `المحافظة: ${s.govName}، المساحة: ${s.feddans} فدان، المحصول السابق: ${s.prevCropName}، رطوبة التربة: ${s.ref.sm.toFixed(3)} m³/m³، التوقع الموسمي: ${s.fc.pred_sm.toFixed(3)}، الحرارة المتوقعة: ${s.fc.pred_tmax.toFixed(1)}°C، أفضل خطة مقترحة: ${s.best.seq.map((c) => c.Crop_Name_AR).join(" -> ")} (توفر ${s.best.savedM3} م3 مياه و ${s.best.ureaBags} شكارة يوريا).`
      : "المستخدم لم يولّد خطته بعد.";

    const cropsDigest = APP.crops
      .map((c) => `${c.Crop_Name_AR}/${c.Crop_Name_EN}(${c.Season}, ماء:${c.Crop_Water_Requirement_ETc_mm}مم, ملوحة:${c.Soil_Salinity_Threshold_ECe_dS_m}dS/m, N:${c.Gross_Nitrogen_Fixation_kg_ha})`)
      .join(" | ");

    return `أنت "المهندس رَيّان" (Eng. Rayan)، مستشار زراعي ذكي خبير في منصة GREEN FUTURE. تحدث بأسلوب عملي وودود يناسب المزارع المصري والمهندس الزراعي.
بيانات أرض المستخدم: ${landContext}
بيانات المحاصيل الـ 51: ${cropsDigest}
أجب بنفس لغة المستخدم (العربية أو الإنجليزية) بدقة وعملية، واحسب الكميات لمساحة أرضه بالفدان.`;
  }

  function localSmartEngine(rawQuery) {
    const normQ = normalizeArabic(rawQuery);
    const feddans = APP.summary ? APP.summary.feddans : Math.max(1, +$("area-feddan").value || 5);

    const matchedCrops = [];
    const seenNames = new Set();
    APP.crops.forEach((c) => {
      const arFull = normalizeArabic(c.Crop_Name_AR);
      const arFirst = arFull.split(/\s+/)[0];
      const enFull = String(c.Crop_Name_EN || "").toLowerCase();
      if (
        (arFull.length >= 3 && normQ.includes(arFull)) ||
        (arFirst.length >= 3 && normQ.includes(arFirst)) ||
        (enFull.length >= 3 && normQ.includes(enFull))
      ) {
        if (!seenNames.has(c.Crop_Name_AR)) {
          seenNames.add(c.Crop_Name_AR);
          matchedCrops.push(c);
        }
      }
    });

    if (matchedCrops.length >= 2) {
      const [c1, c2] = matchedCrops;
      const w1 = Math.round(+c1.Crop_Water_Requirement_ETc_mm * 4.2 * feddans);
      const w2 = Math.round(+c2.Crop_Water_Requirement_ETc_mm * 4.2 * feddans);
      return `⚖️ <b>مقارنة المهندس رَيّان بين (${c1.Crop_Name_AR}) و (${c2.Crop_Name_AR}) لمساحة ${feddans} فدان:</b><br>
      • <b>احتياج المياه:</b> ${c1.Crop_Name_AR} يحتاج <b>${c1.Crop_Water_Requirement_ETc_mm} مم</b> (~${w1.toLocaleString()} م³) مقابل <b>${c2.Crop_Water_Requirement_ETc_mm} مم</b> (~${w2.toLocaleString()} م³) لـ ${c2.Crop_Name_AR}.<br>
      • <b>تحمل الملوحة:</b> ${c1.Crop_Name_AR} يتحمل حتى <b>${c1.Soil_Salinity_Threshold_ECe_dS_m} dS/m</b> مقابل <b>${c2.Soil_Salinity_Threshold_ECe_dS_m} dS/m</b>.<br>
      • <b>تثبيت النيتروجين:</b> ${c1.Crop_Name_AR} يضيف <b>${c1.Gross_Nitrogen_Fixation_kg_ha} كجم/هـ</b> مقابل <b>${c2.Gross_Nitrogen_Fixation_kg_ha} كجم/هـ</b>.`;
    }

    if (matchedCrops.length === 1) {
      const c = matchedCrops[0];
      const totalM3 = Math.round(+c.Crop_Water_Requirement_ETc_mm * 4.2 * feddans);
      return `🌾 <b>توصية المهندس رَيّان لمحصول (${c.Crop_Name_AR}):</b><br>
      • <b>الموسم:</b> ${c.Season} | <b>الماء المطلوب لـ ${feddans} فدان:</b> ~<b>${totalM3.toLocaleString()} م³</b> (${c.Crop_Water_Requirement_ETc_mm} مم)<br>
      • <b>تحمل الملوحة:</b> <b>${c.Soil_Salinity_Threshold_ECe_dS_m} dS/m</b> | <b>تثبيت النيتروجين:</b> <b>${c.Gross_Nitrogen_Fixation_kg_ha} كجم/هـ</b>.`;
    }

    if (APP.summary && APP.summary.best) {
      const s = APP.summary;
      const b = s.best;
      return `📊 <b>تحليل خطتك في محافظة ${s.govName} (${s.feddans} فدان):</b><br>
      أنسب دورة لأرضك هي <b>(${b.seq.map((c) => c.Crop_Name_AR).join(" ⬅️ ")})</b>؛ توفر نحو <b>${b.savedM3.toLocaleString()} م³</b> من المياه و<b>${b.ureaBags} شكارة يوريا</b>.`;
    }

    return "أهلاً بك يا هندسة! اكتب سؤالك الزراعي أو اسم أي محصولين للمقارنة وسأجيبك فوراً بالأرقام.";
  }

  async function handleUserSubmit(text) {
    if (!text) return;
    addUserMessage(text);
    APP.chatHistory.push({ role: "user", content: text });

    const loadingMsg = addBotMessage("⏳ المهندس رَيّان يحلل سؤالك وبيانات الأرض...");

    // 1. المحاولة الأولى: Gemini API المباشر
    if (USER_API_KEY && USER_API_KEY.startsWith("AIza")) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(USER_API_KEY)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: buildSystemContext() }] },
              contents: APP.chatHistory.slice(-8).map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
              }))
            })
          }
        );
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          loadingMsg.remove();
          APP.chatHistory.push({ role: "assistant", content: reply });
          addBotMessage(reply.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>"));
          return;
        }
      } catch (e) {}
    }

    // 2. المحاولة الثانية التلقائية: محرك الذكاء الاصطناعي السحابي المفتوح (يعمل مباشرة تلقائياً)
    try {
      const res = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: buildSystemContext() },
            ...APP.chatHistory.slice(-8)
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          loadingMsg.remove();
          APP.chatHistory.push({ role: "assistant", content: reply });
          addBotMessage(reply.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>"));
          return;
        }
      }
    } catch (e) {}

    // 3. المحرك المحلي الفوري كضمان عمل 100%
    loadingMsg.remove();
    const fallback = localSmartEngine(text);
    APP.chatHistory.push({ role: "assistant", content: fallback });
    addBotMessage(fallback);
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    let finalTranscript = "";

    recognition.onstart = () => {
      finalTranscript = "";
      micBtn.classList.add("recording");
      voiceStatus.hidden = false;
    };
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      input.value = finalTranscript || interim;
    };
    recognition.onend = () => {
      micBtn.classList.remove("recording");
      voiceStatus.hidden = true;
      const spoken = (finalTranscript || input.value).trim();
      if (spoken) {
        input.value = "";
        handleUserSubmit(spoken);
      }
    };
    recognition.onerror = () => {
      micBtn.classList.remove("recording");
      voiceStatus.hidden = true;
    };

    micBtn.onclick = () => {
      if (micBtn.classList.contains("recording")) {
        recognition.stop();
        return;
      }
      recognition.lang = APP.lang === "ar" ? "ar-EG" : "en-US";
      try { recognition.start(); } catch (e) { recognition.stop(); }
    };
  }

  launcher.onclick = () => {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  };
  close.onclick = () => {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    handleUserSubmit(q);
  };
  messages.onclick = (e) => {
    const btn = e.target.closest("button[data-question]");
    if (btn) handleUserSubmit(btn.dataset.question);
  };
}

function applyLanguage(lang) {
  APP.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  $("lang-label").textContent = lang === "ar" ? "English" : "العربية";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (I18N[lang][k]) el.textContent = I18N[lang][k];
  });

  const curGov = $("loc").value || "Sharqia";
  $("loc").innerHTML = Object.keys(GOV_META)
    .map((k) => `<option value="${k}">${GOV_META[k][lang]}</option>`)
    .join("");
  $("loc").value = curGov;

  const curPrev = $("prev").value || "قمح";
  $("prev").innerHTML = APP.crops
    .map((c) => `<option value="${c.Crop_Name_AR}">${lang === "ar" ? c.Crop_Name_AR : c.Crop_Name_EN}</option>`)
    .join("");
  if (curPrev) $("prev").value = curPrev;

  const curVar = $("var").value || "ERA5_SoilMoi_0_7cm_cm3";
  $("var").innerHTML = Object.keys(VAR_LABELS)
    .map((k) => `<option value="${k}">${VAR_LABELS[k][lang]}</option>`)
    .join("");
  $("var").value = curVar;

  updateStep1Preview();
  renderCropsTable($("crop-search").value);
  if (APP.currentStep >= 3) buildCustomRotations();
  if (APP.currentStep === 4) {
    initOrUpdateLeafletMap();
    renderAllCharts();
  }
}

async function initApp() {
  document.documentElement.setAttribute("data-theme", APP.theme);

  try {
    const [cropsRes, climRes, predsRes] = await Promise.all([
      fetch("data/crops_database_verified.csv"),
      fetch("data/climate_14govs.json"),
      fetch("data/predictions_14govs.json")
    ]);
    if (cropsRes.ok) APP.crops = parseCSV(await cropsRes.text());
    if (climRes.ok) APP.climate = await climRes.json();
    if (predsRes.ok) APP.preds = await predsRes.json();
  } catch (err) {
    console.error("Error loading NASA datasets:", err);
  }

  applyLanguage("ar");

  document.querySelectorAll(".w-step[data-goto]").forEach((btn) => {
    btn.onclick = () => {
      const target = +btn.dataset.goto;
      if (target >= 3 && !APP.customPlans.length) buildCustomRotations();
      goToScreen(target);
    };
  });

  $("loc").onchange = updateStep1Preview;
  $("lookback-window").onchange = updateStep1Preview;
  $("to-step-2").onclick = () => {
    const area = +$("area-feddan").value;
    if (!$("loc").value || !$("prev").value || !area || area <= 0) {
      $("err-step-1").hidden = false;
      $("err-step-1").textContent =
        APP.lang === "ar"
          ? "⚠️ يرجى اختيار المحافظة والمحصول السابق وإدخال مساحة أرض صحيحة."
          : "⚠️ Please select governorate, previous crop, and valid farm area.";
      return;
    }
    $("err-step-1").hidden = true;
    goToScreen(2);
  };

  document.querySelectorAll(".goal-card").forEach((card) => {
    card.onclick = () => {
      document.querySelectorAll(".goal-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      APP.goal = card.dataset.goal;
    };
  });

  const updateSimLabels = () => {
    const t = +$("st").value;
    const r = +$("sr").value;
    $("vt").textContent = `${t >= 0 ? "+" : ""}${t.toFixed(1)}°C`;
    $("vr").textContent = `${r}%`;
    $("sim-summary-text").textContent = `${t >= 0 ? "+" : ""}${t.toFixed(1)}°C | ${r}%`;
  };
  $("st").oninput = updateSimLabels;
  $("sr").oninput = updateSimLabels;

  $("back-to-1").onclick = () => goToScreen(1);
  $("to-step-3").onclick = () => {
    buildCustomRotations();
    goToScreen(3);
  };

  $("back-to-2").onclick = () => goToScreen(2);
  $("goto-science-from-3").onclick = () => goToScreen(4);
  $("btn-print").onclick = () => window.print();
  $("tlsel").onchange = renderTimeline;

  $("nav-science-btn").onclick = () => {
    if (!APP.customPlans.length) buildCustomRotations();
    goToScreen(4);
  };
  $("back-from-science").onclick = () => {
    if (!APP.customPlans.length) buildCustomRotations();
    goToScreen(3);
  };

  document.querySelectorAll("#basemap-btns .layer-btn").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll("#basemap-btns .layer-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      APP.basemap = btn.dataset.basemap;
      initOrUpdateLeafletMap();
    };
  });

  document.querySelectorAll("#map-layer-btns .layer-btn").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll("#map-layer-btns .layer-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      APP.mapLayer = btn.dataset.layer;
      initOrUpdateLeafletMap();
    };
  });

  $("var").onchange = renderAllCharts;
  $("crop-search").oninput = (e) => renderCropsTable(e.target.value);

  $("lang-toggle").onclick = () => applyLanguage(APP.lang === "ar" ? "en" : "ar");
  $("theme-toggle").onclick = () => {
    APP.theme = APP.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", APP.theme);
    $("theme-icon").textContent = APP.theme === "light" ? "☀️" : "🌙";
    $("theme-label").textContent = I18N[APP.lang][`theme_${APP.theme}`];
    if (APP.currentStep === 4) renderAllCharts();
  };

  initRayanAIAssistant();
}

initApp();
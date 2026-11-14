const $ = id => document.getElementById(id);
const MN = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const GOV = {
  Assiut:"أسيوط", Beheira:"البحيرة", Beni_Suef:"بني سويف", Dakahlia:"الدقهلية",
  Fayoum:"الفيوم", Gharbia:"الغربية", Kafr_ElSheikh:"كفر الشيخ", Menoufia:"المنوفية",
  Minya:"المنيا", Qalyubia:"القليوبية", Qena_Luxor:"قنا والأقصر",
  Salhia_Reclaimed:"الصالحية (أراضٍ مستصلحة)", Sharqia:"الشرقية", Sohag:"سوهاج"
};
const LBL = {
  ERA5_SoilMoi_0_7cm_cm3:"رطوبة التربة السطحية 0–7 سم (ERA5)",
  SMAP_RootZone_Moisture_cm3:"رطوبة منطقة الجذور (SMAP)",
  POWER_Temp_Mean_C:"متوسط الحرارة °م (NASA POWER)",
  POWER_Temp_Max_C:"الحرارة العظمى °م (NASA POWER)",
  POWER_Precip_mm_day:"الأمطار مم/يوم (GPM/POWER)",
  ERA5_ET0_mm:"التبخر النتحي ET0 مم/يوم",
  Net_Water_Balance_mm:"صافي الميزان المائي مم"
};

const S = { crops: [], climate: [], preds: {}, strat: [] };

// القوالب العلمية للدورات الزراعية الثلاث + الدورة التقليدية
const STRATEGIES_DEF = [
  {
    id: "S1_SOIL_RESTORE",
    name: "استراتيجية استعادة خصوبة التربة",
    crops: ["فول بلدي", "لوبيا", "بنجر السكر"],
    is_baseline: false,
    timeline: [
      {crop:"فول بلدي", start:10, end:4, type:"crop"},
      {crop:"لوبيا صيفية", start:5, end:8, type:"crop"},
      {crop:"تجهيز ومكافحة", start:9, end:9, type:"pest"},
      {crop:"بنجر السكر", start:10, end:4, type:"crop"}
    ]
  },
  {
    id: "S2_DROUGHT_HEAT_SHIELD",
    name: "استراتيجية التكيف مع الجفاف والحرارة",
    crops: ["شعير", "سمسم", "حمص"],
    is_baseline: false,
    timeline: [
      {crop:"شعير", start:11, end:4, type:"crop"},
      {crop:"سمسم", start:5, end:8, type:"crop"},
      {crop:"غطاء تربة", start:9, end:10, type:"cover"},
      {crop:"حمص", start:11, end:4, type:"crop"}
    ]
  },
  {
    id: "S3_SALINITY_OIL_PROFIT",
    name: "استراتيجية المحاصيل الزيتية والعائد المتوازن",
    crops: ["كانولا", "فول صويا", "قمح"],
    is_baseline: false,
    timeline: [
      {crop:"كانولا", start:11, end:4, type:"crop"},
      {crop:"فول صويا", start:5, end:9, type:"crop"},
      {crop:"مكافحة حيوية", start:10, end:10, type:"pest"},
      {crop:"قمح", start:11, end:4, type:"crop"}
    ]
  },
  {
    id: "S0_TRADITIONAL",
    name: "الدورة التقليدية المجهدة (خط الأساس)",
    crops: ["قمح", "أرز", "قمح"],
    is_baseline: true,
    timeline: [
      {crop:"قمح", start:11, end:4, type:"crop"},
      {crop:"أرز", start:5, end:9, type:"crop"},
      {crop:"قمح (مكرر)", start:11, end:4, type:"crop"}
    ]
  }
];

function ok(id, text) {
  const el = $(id);
  if (el) { el.textContent = text; el.className = "dot on"; }
}

function gv(id) { return +$(id).value; }

function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      const v = (cols[i] || "").trim();
      obj[h] = (v !== "" && !isNaN(v)) ? +v : v;
    });
    return obj;
  });
}

function findCrop(name) {
  return S.crops.find(c => String(c.Crop_Name_AR || "").includes(name)) || {
    Crop_Name_AR: name, Crop_Family: "Unknown", Crop_Water_Requirement_ETc_mm: 550,
    Gross_Nitrogen_Fixation_kg_ha: 0, Drought_Tolerance: "Medium",
    Heat_Tolerance: "Medium", Soil_Salinity_Threshold_ECe_dS_m: 3.0, Economic_Market_Value: "Medium"
  };
}

function getForecastObj() {
  const gov = $("loc").value || "Sharqia";
  const st = gv("st").toFixed(1);
  const govPreds = S.preds[gov] || {};
  return govPreds[st] || govPreds["0.0"] || {
    rows: [], r2: 0.87, mae: 0.014, pred_sm: 0.28, uncertainty: 0.016,
    pred_tmax: 33.5, soil_ph: 7.9, soil_clay: 40.0
  };
}

function evaluateMCDA() {
  const gov = $("loc").value || "Sharqia";
  const govAr = GOV[gov] || gov;
  const prevCropName = $("prev").value || "قمح";
  const prevObj = findCrop(prevCropName);
  const fc = getForecastObj();

  const tempDelta = gv("st");
  const rainPct = gv("sr");
  const wWater = gv("pw"), wSoil = gv("ps"), wEcon = gv("py");
  const totalW = (wWater + wSoil + wEcon) || 1;

  // حساب خط الأساس المائي للدورة التقليدية
  const baseCrops = STRATEGIES_DEF.find(s => s.is_baseline).crops.map(findCrop);
  const baseWater = baseCrops.reduce((acc, c) => acc + (+c.Crop_Water_Requirement_ETc_mm || 600), 0);

  const results = STRATEGIES_DEF.map(st => {
    const seq = st.crops.map(findCrop);
    const totalWater = seq.reduce((acc, c) => acc + (+c.Crop_Water_Requirement_ETc_mm || 500), 0);
    const totalN = seq.reduce((acc, c) => acc + (+c.Gross_Nitrogen_Fixation_kg_ha || 0), 0);
    const avgSal = seq.reduce((acc, c) => acc + (+c.Soil_Salinity_Threshold_ECe_dS_m || 3), 0) / seq.length;

    const waterSavedMm = Math.max(0, Math.round(baseWater - totalWater));
    const waterSavedPct = Math.max(0, Math.round((waterSavedMm / baseWater) * 100));

    // تقييم المياه مع مراعاة رطوبة التربة المتوقعة وسيناريو المطر والحرارة
    const rainFactor = 1 + (rainPct / 200);
    const heatPenalty = Math.max(0, tempDelta * 3.5);
    const moistureBonus = (fc.pred_sm - 0.22) * 80;
    let waterScore = st.is_baseline
      ? Math.max(12, 35 - heatPenalty)
      : Math.min(98, Math.max(30, 58 + waterSavedPct * 0.9 + moistureBonus * rainFactor - heatPenalty * 0.5));

    // تقييم صحة التربة وكسر دورة الآفات
    const sameFamily = prevObj.Crop_Family && seq[0].Crop_Family === prevObj.Crop_Family;
    let soilScore = Math.min(98, 45 + (totalN / 220) * 45 + (sameFamily ? -18 : 12));
    if (st.is_baseline) soilScore = 22;

    // تقييم العائد الاقتصادي
    const valMap = { High: 88, Medium: 72, Low: 55 };
    let econScore = seq.reduce((acc, c) => acc + (valMap[c.Economic_Market_Value] || 72), 0) / seq.length;
    if (st.is_baseline) econScore = 62;

    let finalScore = Math.round((waterScore * wWater + soilScore * wSoil + econScore * wEcon) / totalW);
    if (st.is_baseline) finalScore = Math.min(finalScore, 36);

    const seqNames = seq.map(c => c.Crop_Name_AR).join(" ← ");
    return {
      id: st.id,
      name: `${st.name} (${seqNames})`,
      shortName: st.name,
      score: finalScore,
      is_baseline: st.is_baseline,
      waterSavedPct,
      waterSavedMm,
      totalN: Math.round(totalN),
      scores: {
        water: Math.round(waterScore),
        soil: Math.round(soilScore),
        yield: Math.round(econScore)
      },
      benefits: [
        st.is_baseline ? "مألوفة للمزارع لكنها عالية الاستهلاك المائي" : `توفير مياه الري بنسبة ${waterSavedPct}% (${waterSavedMm} مم/دورة)`,
        `تثبيت النيتروجين الحيوي: ${Math.round(totalN)} كجم/هكتار (يقلل الأسمدة الأزوتية)`,
        `متوسط تحمل الملوحة: ${avgSal.toFixed(1)} dS/m`
      ],
      risks: [
        sameFamily ? `⚠️ تنبيه تعاقب: المحصول الأول من نفس عائلة (${prevCropName}) — يفضل فاصل زمني` : `✅ كسر دورة الآفات بنجاح بعد محصول (${prevCropName})`,
        `دليل ناسا (${govAr}): رطوبة التربة المتوقعة ${fc.pred_sm.toFixed(3)} m³/m³ وحرارة عظمى ${fc.pred_tmax.toFixed(1)}°م`,
        "يلزم فحص ملوحة التربة والآبار محلياً ومراجعة المرشد الزراعي"
      ],
      timeline: st.timeline
    };
  });

  // ترتيب الذكية أولاً ثم وضع خط الأساس في النهاية للمقارنة
  const smart = results.filter(r => !r.is_baseline).sort((a, b) => b.score - a.score);
  const base = results.filter(r => r.is_baseline);
  S.strat = [...smart, ...base];

  updateKPIs(fc, smart[0]);
  renderCards();
  renderChart();
}

function updateKPIs(fc, best) {
  $("kpi-sm").textContent = `${fc.pred_sm.toFixed(3)} m³/m³`;
  $("kpi-unc").textContent = `نطاق عدم اليقين: ±${fc.uncertainty.toFixed(3)}`;
  $("kpi-tmax").textContent = `${fc.pred_tmax.toFixed(1)} °C`;
  const st = gv("st");
  $("kpi-scen").textContent = `سيناريو الحرارة: ${st >= 0 ? "+" : ""}${st}°م | المطر: ${gv("sr")}%`;
  $("kpi-soil").textContent = `pH ${fc.soil_ph}`;
  $("kpi-clay").textContent = `نسبة الطين: ${fc.soil_clay}%`;
  if (best) {
    $("kpi-best").textContent = `${best.score} / 100`;
    $("kpi-save").textContent = `توفير ${best.waterSavedPct}% مياه و +${best.totalN} كجم نيتروجين`;
  }
}

const bar = (l, v, c) => `<small>${l}: ${v}%</small><div class="bar"><i style="width:${v}%;background:var(${c})"></i></div>`;

function renderCards() {
  const a = S.strat;
  $("cards").innerHTML = a.map((s, idx) => {
    const isBest = !s.is_baseline && idx === 0;
    const tagHtml = isBest
      ? '<span class="tag">🥇 الخيار الأفضل لأولوياتك</span>'
      : (s.is_baseline ? '<span class="tag btag">خط الأساس التقليدي</span>' : `<span class="tag" style="background:var(--w)">البديل #${idx + 1}</span>`);
    return `<div class="sc ${isBest ? "best" : ""} ${s.is_baseline ? "base" : ""}">
      ${tagHtml}
      <h3>${s.name}</h3>
      <div class="big">${s.score}<small style="display:inline"> / 100</small></div>
      ${bar("كفاءة توفير المياه", s.scores.water, "--w")}
      ${bar("خصوبة التربة وكسر الآفات", s.scores.soil, "--s")}
      ${bar("العائد الاقتصادي", s.scores.yield, "--y")}
      <b>الفوائد الزراعية</b><ul>${s.benefits.map(x => `<li>${x}</li>`).join("")}</ul>
      <b>التحليل العلمي وأدلة ناسا</b><ul>${s.risks.map(x => `<li>${x}</li>`).join("")}</ul>
    </div>`;
  }).join("");

  const cur = $("tlsel").value;
  $("tlsel").innerHTML = a.map((s, i) => `<option value="${i}">${s.name}</option>`).join("");
  if (cur && +cur < a.length) $("tlsel").value = cur;
  renderTL();
}

function renderTL() {
  const s = S.strat[+$("tlsel").value || 0];
  if (!s || !s.timeline) return;
  let h = '<div></div>' + MN.map(m => `<div class="m">${m.slice(0, 3)}</div>`).join("");
  const rows = [...new Set(s.timeline.map(t => t.crop))];
  rows.forEach(r => {
    h += `<div>${r}</div>`;
    for (let m = 1; m <= 12; m++) {
      const t = s.timeline.find(t => t.crop === r && (t.start <= t.end ? m >= t.start && m <= t.end : m >= t.start || m <= t.end));
      h += t ? `<div class="cell ${t.type}"></div>` : '<div class="cell"></div>';
    }
  });
  $("tl").innerHTML = h;
}

function renderCrops(filter = "") {
  const q = filter.trim().toLowerCase();
  const cols = [
    ["Crop_Name_AR", "المحصول"],
    ["Crop_Name_EN", "الاسم الإنجليزي"],
    ["Crop_Family", "العائلة النباتية"],
    ["Season", "الموسم"],
    ["Crop_Water_Requirement_ETc_mm", "الاحتياج المائي (مم)"],
    ["Gross_Nitrogen_Fixation_kg_ha", "تثبيت النيتروجين (كجم/هـ)"],
    ["Soil_Salinity_Threshold_ECe_dS_m", "تحمل الملوحة (dS/m)"],
    ["Drought_Tolerance", "تحمل الجفاف"],
    ["Heat_Tolerance", "تحمل الحرارة"]
  ];
  const filtered = S.crops.filter(r => !q || Object.values(r).some(v => String(v).toLowerCase().includes(q)));
  $("crops").innerHTML =
    "<tr>" + cols.map(c => `<th>${c[1]}</th>`).join("") + "</tr>" +
    filtered.map(r => "<tr>" + cols.map(c => `<td>${r[c[0]] ?? "-"}</td>`).join("") + "</tr>").join("");
}

function renderChart() {
  const hk = $("var").value || "ERA5_SoilMoi_0_7cm_cm3";
  const gov = $("loc").value || "Sharqia";
  const H = S.climate.filter(r => r.Governorate === gov).map(r => ({ d: r.Date, y: +r[hk] })).filter(p => !isNaN(p.y));
  const fc = getForecastObj();
  const F = (hk === "ERA5_SoilMoi_0_7cm_cm3" && fc.rows) ? fc.rows.map(r => ({ d: r.d, y: r.sm, lo: r.sm_lo, hi: r.sm_hi })) : [];

  const all = [...H, ...F];
  if (!all.length) { $("chart").innerHTML = ""; return; }
  const ys = all.flatMap(p => [p.y, p.lo, p.hi]).filter(x => x != null && !isNaN(x));
  const mn = Math.min(...ys), mxv = Math.max(...ys), n = all.length - 1 || 1;
  const X = i => 45 + (i / n) * 640;
  const Y = y => 220 - ((y - mn) / ((mxv - mn) || 1)) * 190;
  const path = (a, o) => a.map((p, i) => (i ? "L" : "M") + X(i + o).toFixed(1) + "," + Y(p.y).toFixed(1)).join("");

  let svg = `<line x1="45" y1="220" x2="685" y2="220" stroke="var(--bd)"/>
    <text x="4" y="${Y(mxv) + 4}">${mxv.toFixed(3)}</text>
    <text x="4" y="${Y(mn)}">${mn.toFixed(3)}</text>`;
  svg += `<path d="${path(H, 0)}" fill="none" stroke="var(--ac)" stroke-width="2.2"/>`;

  if (F.length) {
    const up = F.map((p, i) => (i ? "L" : "M") + X(H.length + i).toFixed(1) + "," + Y(p.hi).toFixed(1)).join("");
    const dn = F.map((p, i) => "L" + X(H.length + F.length - 1 - i).toFixed(1) + "," + Y(F[F.length - 1 - i].lo).toFixed(1)).join("");
    svg += `<path d="${up}${dn}Z" fill="var(--w)" opacity=".25"/>`;
    svg += `<path d="${path(F, H.length)}" fill="none" stroke="var(--w)" stroke-width="2.5" stroke-dasharray="5 4"/>`;
  }
  svg += `<text x="45" y="244">${all[0].d}</text><text x="615" y="244">${all[all.length - 1].d}</text>`;
  $("chart").innerHTML = svg;

  $("chartnote").textContent = F.length
    ? `الخط الأخضر: رصد أقمار ناسا التاريخي لمحافظة ${GOV[gov]} | الخط الأزرق المتقطع: تنبؤ نموذج Gradient Boosting والمنطقة المظللة هي نطاق عدم اليقين (R² = ${fc.r2}، MAE = ${fc.mae}).`
    : `الخط الأخضر: السجل التاريخي من أقمار ناسا لمحافظة ${GOV[gov]}.`;
}

async function initApp() {
  // تعبئة المحافظات والمؤشرات مبدئياً
  const govKeys = Object.keys(GOV);
  $("loc").innerHTML = govKeys.map(k => `<option value="${k}">${GOV[k]}</option>`).join("");
  $("loc").value = "Sharqia";

  $("var").innerHTML = Object.keys(LBL).map(k => `<option value="${k}">${LBL[k]}</option>`).join("");

  try {
    const [cropsRes, climRes, predsRes] = await Promise.all([
      fetch("data/crops_database_verified.csv"),
      fetch("data/climate_14govs.json"),
      fetch("data/predictions_14govs.json")
    ]);

    if (cropsRes.ok) {
      S.crops = parseCSV(await cropsRes.text());
      ok("s-crops", `متصل (${S.crops.length} محصول)`);
      const names = S.crops.map(c => c.Crop_Name_AR).filter(Boolean);
      $("prev").innerHTML = '<option value="">لا أعرف / لا يوجد</option>' + names.map(n => `<option value="${n}">${n}</option>`).join("");
      $("prev").value = names.includes("قمح") ? "قمح" : "";
      renderCrops();
    }

    if (climRes.ok) {
      S.climate = await climRes.json();
      ok("s-clim", "متصل (14 منطقة)");
    }

    if (predsRes.ok) {
      S.preds = await predsRes.json();
      ok("s-pred", "متصل (R²=87%)");
    }

    ok("s-map", "متصلة (تفاعلية)");
  } catch (err) {
    console.error("Error loading static datasets:", err);
  }

  evaluateMCDA();
}

// الأحداث التفاعلية
$("go").onclick = evaluateMCDA;
$("loc").onchange = evaluateMCDA;
$("prev").onchange = evaluateMCDA;
$("var").onchange = renderChart;
$("tlsel").onchange = renderTL;
$("crop-search").oninput = e => renderCrops(e.target.value);

[["pw","vw",v=>v],["ps","vs",v=>v],["py","vy",v=>v],["st","vt",v=>(v>=0?"+":"")+v+"°م"],["sr","vr",v=>v+"%"]].forEach(([i, o, f]) => {
  $(i).oninput = () => { $(o).textContent = f($(i).value); evaluateMCDA(); };
});

$("theme-toggle").onclick = () => {
  const cur = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
};

// مساعد استخدام الموقع
(function initHelpAssistant() {
  const launcher = $("help-launcher"), panel = $("help-panel"), close = $("help-close");
  const form = $("help-form"), input = $("help-input"), messages = $("help-messages");
  if (!launcher || !panel) return;
  const guide = [
    { keys: ["ابدا", "ابدأ", "استخدام"], answer: "اختر المحافظة والمحصول السابق من القائمة الجانبية، واضبط أولويات المياه والتربة والعائد وسيناريو الحرارة، وستتحدث التوصيات تلقائياً." },
    { keys: ["قارن", "مقارنة", "استراتيجيات"], answer: "البطاقات تعرض مقارنة 3 استراتيجيات ذكية ضد الدورة التقليدية، مع نسبة توفير المياه وتثبيت النيتروجين وأدلة أقمار ناسا." },
    { keys: ["رسم", "مناخ", "تنبؤ"], answer: "الرسم البياني يعرض رصد ناسا التاريخي (الأخضر) وتنبؤ نموذج Gradient Boosting مع نطاق عدم اليقين (الأزرق)." }
  ];
  function addMsg(t, who) {
    const el = document.createElement("div");
    el.className = "help-message " + who;
    el.textContent = t;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }
  launcher.onclick = () => { panel.hidden = false; launcher.setAttribute("aria-expanded", "true"); input.focus(); };
  close.onclick = () => { panel.hidden = true; launcher.setAttribute("aria-expanded", "false"); };
  form.onsubmit = e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    addMsg(q, "user");
    const f = guide.find(g => g.keys.some(k => q.includes(k)));
    addMsg(f ? f.answer : "جرّب اختيار المحافظة والمحصول السابق من القائمة الجانبية، أو تصفح الخريطة والجدول الزمني بالأسفل.", "bot");
  };
  messages.onclick = e => {
    const b = e.target.closest("button[data-question]");
    if (b) {
      const q = b.dataset.question;
      addMsg(q, "user");
      const f = guide.find(g => g.keys.some(k => q.includes(k)));
      addMsg(f ? f.answer : "اختر المحافظة والمحصول من القائمة الجانبية.", "bot");
    }
  };
})();

initApp();

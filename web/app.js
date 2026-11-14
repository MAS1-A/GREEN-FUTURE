const $=id=>document.getElementById(id);
const MN=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const defaultApi = window.location.protocol.startsWith("http") ? window.location.origin : "http://localhost:8000";
const S={crops:[],climate:[],pred:null,strat:null,api:defaultApi};
$("api").value=S.api;

function gv(id){return +$(id).value}
function inputs(){return{location:$("loc").value,prev_crop:$("prev").value,w_water:gv("pw"),w_soil:gv("ps"),w_yield:gv("py"),temp_delta:gv("st"),rain_pct:gv("sr")}}

async function evaluate(){
 const inp=inputs();
 try{
  const [p, e] = await Promise.all([
   fetch(S.api+"/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(inp)}),
   fetch(S.api+"/evaluate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(inp)})
  ]);
  if(p.ok){S.pred=await p.json();ok("s-pred","متصل (R²=87%)")}
  if(e.ok){S.strat=await e.json();ok("s-eval","متصل (MCDA)")}
 }catch(err){console.warn("API غير متاح",err)}
 renderAll();
}

function ok(id,t){const e=$(id);e.textContent=t;e.className="dot on"}
const bar=(l,v,c)=>`<small>${l}: ${v}</small><div class="bar"><i style="width:${v}%;background:var(${c})"></i></div>`;
function renderCards(){
 const a=S.strat||[];if(!a.length)return;
 const smartScores=a.filter(s=>!s.is_baseline).map(s=>s.score);
 const top=Math.max(...(smartScores.length?smartScores:a.map(s=>s.score)));
 $("cards").innerHTML=a.map(s=>{
  const isBest=!s.is_baseline && s.score===top;
  const tagHtml=isBest?'<span class="tag">🥇 الأنسب لأولوياتك</span>':(s.is_baseline?'<span class="tag btag">خط الأساس التقليدي</span>':'');
  return `<div class="sc ${isBest?"best":""} ${s.is_baseline?"base":""}">${tagHtml}
  <h3>${s.name}</h3><div class="big">${s.score}<small style="display:inline"> / 100</small></div>
  ${bar("كفاءة المياه",s.scores.water,"--w")}${bar("خصوبة التربة",s.scores.soil,"--s")}${bar("العائد الاقتصادي",s.scores.yield,"--y")}
  <b>الفوائد والأثر</b><ul>${(s.benefits||[]).map(x=>`<li>${x}</li>`).join("")}</ul>
  <b>المخاطر وأدلة ناسا</b><ul>${(s.risks||[]).map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
 }).join("");
 const cur=$("tlsel").value;
 $("tlsel").innerHTML=a.map((s,i)=>`<option value="${i}">${s.name}</option>`).join("");
 if(cur && +cur < a.length)$("tlsel").value=cur;
 renderTL();
}
function renderTL(){
 const s=(S.strat||[])[+$("tlsel").value||0];if(!s || !s.timeline)return;
 let h='<div></div>'+MN.map(m=>`<div class="m">${m.slice(0,3)}</div>`).join("");
 const rows=[...new Set(s.timeline.map(t=>t.crop))];
 rows.forEach(r=>{h+=`<div>${r}</div>`;
  for(let m=1;m<=12;m++){const t=s.timeline.find(t=>t.crop===r&&(t.start<=t.end?m>=t.start&&m<=t.end:m>=t.start||m<=t.end));
   h+=t?`<div class="cell ${t.type}"></div>`:'<div class="cell"></div>'}});
 $("tl").innerHTML=h;
}
function renderCrops(){
 const k=Object.keys(S.crops[0]||{});
 $("crops").innerHTML="<tr>"+k.map(x=>`<th>${x}</th>`).join("")+"</tr>"+S.crops.map(r=>"<tr>"+k.map(x=>`<td>${r[x]}</td>`).join("")+"</tr>").join("");
}
const LBL={POWER_Temp_Mean_C:"متوسط الحرارة °م",POWER_Temp_Max_C:"الحرارة العظمى °م",POWER_Humidity_Pct:"الرطوبة النسبية %",POWER_Solar_Rad_MJ_m2:"الإشعاع الشمسي",POWER_Precip_mm_day:"الأمطار مم/يوم",ERA5_ET0_mm:"التبخر النتحي ET0 مم/يوم",ERA5_SoilMoi_0_7cm_cm3:"رطوبة التربة السطحية 0–7 سم",ERA5_SoilMoi_28_100cm_cm3:"رطوبة التربة العميقة 28–100 سم",SMAP_RootZone_Moisture_cm3:"رطوبة منطقة الجذور (SMAP)",SMAP_Moisture_Anomaly:"شذوذ رطوبة التربة (SMAP)",GEDI_Biomass_Mg_ha:"الكتلة الحيوية GEDI",Net_Water_Balance_mm:"صافي الميزان المائي مم"};
const PK={ERA5_SoilMoi_0_7cm_cm3:"sm"};
const GOV={Assiut:"أسيوط",Beheira:"البحيرة",Beni_Suef:"بني سويف",Dakahlia:"الدقهلية",Fayoum:"الفيوم",Gharbia:"الغربية",Kafr_ElSheikh:"كفر الشيخ",Menoufia:"المنوفية",Minya:"المنيا",Qalyubia:"القليوبية",Qena_Luxor:"قنا والأقصر",Salhia_Reclaimed:"الصالحية (أراضٍ مستصلحة)",Sharqia:"الشرقية",Sohag:"سوهاج"};
function fillLoc(){
 const cur=$("loc").value||"Sharqia";
 const ks=S.climate.length?[...new Set(S.climate.map(r=>r.Governorate))]:Object.keys(GOV);
 $("loc").innerHTML=ks.map(k=>`<option value="${k}">${GOV[k]||k}</option>`).join("");
 $("loc").value=ks.includes(cur)?cur:ks[0];
}
function fillPrev(){
 const cur=$("prev").value||"قمح";
 const names=S.crops.map(c=>String(c.Crop_Name_AR||c.crop||Object.values(c)[0]));
 $("prev").innerHTML='<option value="">لا أعرف / لا يوجد</option>'+names.map(n=>`<option value="${n}">${n}</option>`).join("");
 $("prev").value=names.includes(cur)?cur:"";
}
function fillVars(){
 const cur=$("var").value;
 const cols=Object.keys(S.climate[0]||{}).filter(k=>k!=="Date"&&k!=="Governorate"&&k!=="Year"&&k!=="Month"&&k!=="DayOfYear"&&S.climate.some(r=>typeof r[k]==="number"));
 $("var").innerHTML=cols.map(k=>`<option value="${k}">${LBL[k]||k}</option>`).join("");
 $("var").value=cols.includes(cur)?cur:(cols.includes("ERA5_SoilMoi_0_7cm_cm3")?"ERA5_SoilMoi_0_7cm_cm3":cols[0]);
}
function renderChart(){
 const hk=$("var").value,v=PK[hk];
 const H=S.climate.filter(r=>r.Governorate===$("loc").value).map(r=>({d:r.Date,y:+r[hk]})).filter(p=>p.y!==""&&!isNaN(p.y));
 const F=v&&S.pred&&S.pred.rows?S.pred.rows.map(r=>({d:r.d,y:r[v],lo:r[v+"_lo"],hi:r[v+"_hi"]})):[];
 const all=[...H,...F];if(!all.length){$("chart").innerHTML="";return}
 const ys=all.flatMap(p=>[p.y,p.lo,p.hi]).filter(x=>x!=null&&!isNaN(x));
 const mn=Math.min(...ys),mxv=Math.max(...ys),n=all.length-1||1;
 const X=i=>40+i/n*650,Y=y=>220-(y-mn)/((mxv-mn)||1)*190;
 const path=(a,o)=>a.map((p,i)=>(i?"L":"M")+X(i+o).toFixed(1)+","+Y(p.y).toFixed(1)).join("");
 let s=`<line x1="40" y1="220" x2="690" y2="220" stroke="var(--bd)"/><text x="4" y="${Y(mxv)+4}">${mxv.toFixed(3)}</text><text x="4" y="${Y(mn)}">${mn.toFixed(3)}</text>`;
 s+=`<path d="${path(H,0)}" fill="none" stroke="var(--ac)" stroke-width="2"/>`;
 if(F.length){
  if(F[0].lo!=null){const up=F.map((p,i)=>(i?"L":"M")+X(H.length+i).toFixed(1)+","+Y(p.hi).toFixed(1)).join("");
   const dn=F.map((p,i)=>"L"+X(H.length+F.length-1-i).toFixed(1)+","+Y(F[F.length-1-i].lo).toFixed(1)).join("");
   s+=`<path d="${up}${dn}Z" fill="var(--w)" opacity=".25"/>`}
  s+=`<path d="${path(F,H.length)}" fill="none" stroke="var(--w)" stroke-width="2.5" stroke-dasharray="5 4"/>`}
 s+=`<text x="40" y="244">${all[0].d}</text><text x="620" y="244">${all[all.length-1].d}</text>`;
 $("chart").innerHTML=s;
 $("chartnote").textContent=F.length?`الخط الأخضر: رصد أقمار ناسا التاريخي | الخط الأزرق المتقطع: تنبؤ نموذج Gradient Boosting والمنطقة المظللة هي نطاق عدم اليقين (R² = ${S.pred.r2}، MAE = ${S.pred.mae}).`:"الخط الأخضر بيانات تاريخية من أقمار ناسا.";
}
function renderAll(){renderCards();renderCrops();renderChart()}

window.FarmApp={
 setCrops(rows){S.crops=rows;ok("s-crops","متصل (51 محصول)");fillPrev()},
 setClimate(rows){S.climate=rows;ok("s-clim","متصل (14 منطقة)");fillLoc();fillVars();renderChart()},
 setPrediction(o){S.pred=o;ok("s-pred","متصل");renderChart()},
 setStrategies(a){S.strat=a;ok("s-eval","متصل");renderAll()},
 setMap(h){$("map").srcdoc=h;ok("s-map","متصلة")}};

$("saveapi").onclick=()=>{S.api=$("api").value.trim().replace(/\/$/,"");evaluate()};
$("go").onclick=evaluate;
$("var").onchange=renderChart;
$("loc").onchange=()=>{renderChart();evaluate()};
$("tlsel").onchange=renderTL;
[["pw","vw",v=>v],["ps","vs",v=>v],["py","vy",v=>v],["st","vt",v=>(v>=0?"+":"")+v+"°م"],["sr","vr",v=>v+"%"]].forEach(([i,o,f])=>{
 $(i).oninput=()=>{$(o).textContent=f($(i).value)}
});

async function autoLoad(){
 try{
  const r=await fetch(S.api+"/api/bootstrap");
  if(r.ok){
   const d=await r.json();
   FarmApp.setCrops(d.crops);
   FarmApp.setClimate(d.climate);
   FarmApp.setMap(d.map_html);
  }
 }catch(e){console.warn("Bootstrap error:",e)}
}

fillLoc();fillPrev();fillVars();
autoLoad().then(evaluate);

(function initHelpAssistant(){
 const launcher=$("help-launcher"),panel=$("help-panel"),close=$("help-close");
 const form=$("help-form"),input=$("help-input"),messages=$("help-messages");
 if(!launcher||!panel||!form||!input||!messages)return;
 const guide=[
  {keys:["ابدا","ابدأ","استخدام"],answer:"ابدأ من مربع «مدخلات المزارع» في جانب الصفحة. اختر المحافظة والمحصول السابق، وحدد أولوياتك، ثم اضغط «قارن الاستراتيجيات».",target:".wrap aside .card",label:"اذهب إلى مدخلات المزارع"},
  {keys:["قارن","مقارنة","استراتيجيات"],answer:"بطاقات الاستراتيجيات تعرض درجة كل دورة من 100 مع كفاءة المياه وخصوبة التربة والعائد وأدلة أقمار ناسا.",target:"#cards",label:"اذهب إلى الاستراتيجيات"},
  {keys:["رسم","مناخ","تنبؤ"],answer:"الرسم البياني يعرض رصد أقمار ناسا التاريخي (الأخضر) والتنبؤ المستقبلي ونطاق عدم اليقين (الأزرق).",target:"#var",label:"اذهب إلى الرسم البياني"}
 ];
 function addMessage(text,who){const el=document.createElement("div");el.className="help-message "+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;return el}
 launcher.addEventListener("click",()=>{panel.hidden=false;launcher.setAttribute("aria-expanded","true");input.focus()});
 close.addEventListener("click",()=>{panel.hidden=true;launcher.setAttribute("aria-expanded","false")});
 form.addEventListener("submit",e=>{e.preventDefault();const q=input.value.trim();if(!q)return;input.value="";addMessage(q,"user");const f=guide.find(g=>g.keys.some(k=>q.includes(k)));addMessage(f?f.answer:"استخدم القائمة الجانبية لاختيار المحافظة والمحصول السابق ثم اضغط «قارن الاستراتيجيات».", "bot")});
 messages.addEventListener("click",e=>{const b=e.target.closest("button[data-question]");if(b){const q=b.dataset.question;addMessage(q,"user");const f=guide.find(g=>g.keys.some(k=>q.includes(k)));addMessage(f?f.answer:"اختر المحافظة والمحصول ثم اضغط مقارنة.", "bot")}});
})();

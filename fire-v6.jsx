import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  ReferenceLine, ReferenceArea, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#06080e", surface: "#0c1120", card: "#101825", border: "#1a2840",
  gold: "#f0a500", green: "#16a34a", greenLight: "#22c55e", red: "#dc2626",
  blue: "#1d6fff", blueLight: "#60a5fa", purple: "#7c3aed", purpleLight: "#a78bfa",
  cyan: "#0891b2", cyanLight: "#22d3ee", pink: "#be185d", pinkLight: "#f472b6",
  orange: "#ea580c", teal: "#0d9488", tealLight: "#2dd4bf",
  coffeeGreen: "#6B8E4E", coffeeLight: "#9DC368", coffeeDark: "#4A6B30",
  text: "#f0f4fc", textSec: "#8fa4c0", textMuted: "#3d5470",
  font: "'Playfair Display', 'Georgia', serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    appTitle: "FIRE Freedom Planner",
    appSub: "Your personal path to Financial Independence",
    welcome: "Welcome! Let's set up your plan.",
    welcomeSub: "Answer a few questions to personalise your FIRE journey. You can change everything later.",
    startBtn: "Start My Journey →",
    tabs: { learn:"FIRE 101", overview:"Overview", projection:"Projection", fireCalc:"FIRE Calc", withdrawal:"Withdrawal", austria:"🇦🇹 Austria", life:"Life", travel:"✈️ Travel", budget:"Budget", tracker:"Tracker", compare:"Compare", realestate:"🏠 Real Estate", taxoptimizer:"💰 Tax & Guardrails", roadmap:"🗺️ Roadmap" },
    onboarding: {
      q1: "How old are you?",
      q2: "How much do you currently have invested? (€)",
      q3: "How much do you save per month? (€)",
      q4: "What is your monthly income after tax? (€)",
      q5: "Which country are you in?",
      q6: "What is your FIRE goal?",
    },
    share: "Share My Plan",
    copied: "Link copied!",
    langToggle: "DE",
    fireTypes: {
      lean: { name: "Lean FIRE", icon: "🥗", desc: "Minimalist lifestyle, budget under €1,000/month. Small portfolio needed, maximum simplicity.", color: "#22d3ee" },
      regular: { name: "Regular FIRE", icon: "⚖️", desc: "Comfortable, balanced lifestyle around €1,300/month. The classic FIRE target.", color: "#f0a500" },
      chubby: { name: "Chubby FIRE", icon: "🍖", desc: "Comfortably well-off, €2,000–3,000/month. Nice extras, travel, no luxury stress.", color: "#ea580c" },
      fat: { name: "Fat FIRE", icon: "🥩", desc: "Luxury lifestyle, €3,000+/month. High-end comfort with full financial freedom.", color: "#f472b6" },
      barista: { name: "Barista FIRE", icon: "☕", desc: "Semi-retired. Part-time income covers basics, portfolio covers the rest. Lower target needed.", color: "#16a34a" },
      coast: { name: "Coast FIRE", icon: "🏖️", desc: "Already invested enough — just let compound growth do the work. Stop saving, coast to retirement.", color: "#0891b2" },
      slow: { name: "Slow FIRE", icon: "🌿", desc: "Lifestyle-first. Save less now to enjoy life more during the journey. Slower but more balanced.", color: "#7c3aed" },
      nomad: { name: "Nomad FIRE", icon: "🌍", desc: "Geo-arbitrage: live in low-cost countries to make your money last 3-5x longer.", color: "#0d9488" },
    },
    re: {
      title:"Real Estate Simulator", modeOwn:"🏠 Own Home", modeInvest:"💼 Buy-to-Let Investment",
      propPrice:"Property Price", downPct:"Down Payment", loanTerm:"Loan Term (years)", interestRate:"Interest Rate",
      maintenance:"Monthly Maintenance & Insurance", currentRent:"Your Current Monthly Rent",
      monthlyRent:"Monthly Rental Income (gross)", taxRate:"Rental Income Tax Rate",
      appreciation:"Annual Property Appreciation", netWorthProp:"Net Worth (With Property)",
      netWorthEtf:"Net Worth (ETF Only)", equity:"Home Equity", etfPortfolio:"ETF Portfolio",
      monthlyPayment:"Monthly Mortgage", totalInterest:"Total Interest Paid", payoffYear:"Mortgage Paid Off",
      grossYield:"Gross Rental Yield", netYield:"Net Yield (after tax)", monthlyCashflow:"Monthly Cashflow",
      fireImpact:"FIRE Date Impact", housingBenefit:"Housing Cost after Payoff",
      buyVsRent:"Buy vs. Rent — Net Worth Comparison", equityGrowth:"Equity & Portfolio Growth",
      afaNote:"AfA (depreciation) deductible at 1.5%/yr on 80% of property value",
    },
    legacyMode: { zero: "Die with Zero 🎯", legacy: "Leave a Legacy 🏛️", grow: "Keep Growing 📈" },
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
  de: {
    appTitle: "FIRE Freiheitsplaner",
    appSub: "Dein persönlicher Weg zur finanziellen Unabhängigkeit",
    welcome: "Willkommen! Lass uns deinen Plan aufstellen.",
    welcomeSub: "Beantworte ein paar Fragen um deine FIRE-Reise zu personalisieren. Du kannst alles später ändern.",
    startBtn: "Meine Reise beginnen →",
    tabs: { learn:"FIRE 101", overview:"Überblick", projection:"Projektion", fireCalc:"FIRE Rechner", withdrawal:"Entnahme", austria:"🇦🇹 Österreich", life:"Leben", travel:"✈️ Reisen", budget:"Budget", tracker:"Tracker", compare:"Vergleich", realestate:"🏠 Immobilien", taxoptimizer:"💰 Steuer & Guardrails", roadmap:"🗺️ Fahrplan" },
    onboarding: {
      q1: "Wie alt bist du?",
      q2: "Wie viel hast du aktuell investiert? (€)",
      q3: "Wie viel sparst du pro Monat? (€)",
      q4: "Wie hoch ist dein monatliches Nettoeinkommen? (€)",
      q5: "In welchem Land lebst du?",
      q6: "Was ist dein FIRE-Ziel?",
    },
    share: "Plan teilen",
    copied: "Link kopiert!",
    langToggle: "EN",
    fireTypes: {
      lean: { name: "Lean FIRE", icon: "🥗", desc: "Minimalistischer Lebensstil, unter €1.000/Monat. Kleines Portfolio nötig, maximale Einfachheit.", color: "#22d3ee" },
      regular: { name: "Regular FIRE", icon: "⚖️", desc: "Komfortabler, ausgewogener Lebensstil ca. €1.300/Monat. Das klassische FIRE-Ziel.", color: "#f0a500" },
      chubby: { name: "Chubby FIRE", icon: "🍖", desc: "Wohlhabend und komfortabel, €2.000–3.000/Monat. Extras, Reisen, kein Luxusstress.", color: "#ea580c" },
      fat: { name: "Fat FIRE", icon: "🥩", desc: "Luxuriöser Lebensstil, €3.000+/Monat. Hoher Komfort mit volker finanzieller Freiheit.", color: "#f472b6" },
      barista: { name: "Barista FIRE", icon: "☕", desc: "Halb-Ruhestand. Teilzeitarbeit deckt Grundlagen, Portfolio deckt den Rest. Niedrigeres Ziel.", color: "#16a34a" },
      coast: { name: "Coast FIRE", icon: "🏖️", desc: "Bereits genug investiert — Zinseszins erledigt den Rest. Aufhören zu sparen, bis zur Rente gleiten.", color: "#0891b2" },
      slow: { name: "Slow FIRE", icon: "🌿", desc: "Lifestyle-zuerst. Weniger sparen um das Leben heute mehr zu genießen. Langsamer aber ausgewogener.", color: "#7c3aed" },
      nomad: { name: "Nomad FIRE", icon: "🌍", desc: "Geo-Arbitrage: In Niedrigkostenländern leben damit dein Geld 3-5x länger reicht.", color: "#0d9488" },
    },
    re: {
      title:"Immobilien-Simulator", modeOwn:"🏠 Eigenheim", modeInvest:"💼 Anlageimmobilie",
      propPrice:"Immobilienpreis", downPct:"Eigenkapitalanteil", loanTerm:"Kreditlaufzeit (Jahre)", interestRate:"Zinssatz",
      maintenance:"Monatliche Instandhaltung & Versicherung", currentRent:"Deine aktuelle Monatsmiete",
      monthlyRent:"Monatliche Mieteinnahmen (brutto)", taxRate:"Einkommensteuer auf Mieteinnahmen",
      appreciation:"Jährliche Wertsteigerung", netWorthProp:"Vermögen (Mit Immobilie)",
      netWorthEtf:"Vermögen (Nur ETF)", equity:"Eigenkapital", etfPortfolio:"ETF-Portfolio",
      monthlyPayment:"Monatliche Rate", totalInterest:"Gesamtzinsen", payoffYear:"Abbezahlt im Jahr",
      grossYield:"Bruttorendite", netYield:"Nettorendite (nach Steuer)", monthlyCashflow:"Monatlicher Cashflow",
      fireImpact:"Auswirkung auf FIRE-Datum", housingBenefit:"Wohnkosten nach Abbezahlung",
      buyVsRent:"Kaufen vs. Mieten — Vermögensvergleich", equityGrowth:"Eigenkapital & Portfolio-Wachstum",
      afaNote:"AfA (Abschreibung) absetzbar mit 1,5%/Jahr auf 80% des Immobilienwerts",
    },
    legacyMode: { zero: "Die with Zero 🎯", legacy: "Erbe hinterlassen 🏛️", grow: "Weiter wachsen 📈" },
    months: ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
  }
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const euro = (v) => `€${Math.round(Number(v)).toLocaleString("de-AT")}`;
const kilo = (v) => Math.abs(v) >= 1000000 ? `€${(v/1000000).toFixed(1)}M` : `€${Math.round(v/1000)}k`;
const pct = (v, t) => t > 0 ? Math.min(100, Math.max(0, (v / t) * 100)) : 0;
function randNorm(mean, std) {
  const u = 1 - Math.random(), v2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v2);
}

// ─── FIRE ENGINE — pure financial math, no UI deps ───────────────────────────
function calculateFireEngine({ age, startPort, totalSavings, annualReturn, sideIncome,
  bonusAnnual, spending, legacyMult, baristaIncome, inflation, switchEnabled, switchYear,
  partTimeSavings, lifestyleCreep }) {
  const currentYear = new Date().getFullYear();
  const fireNum      = Math.round(spending * 12 * legacyMult);
  const baristaGap   = Math.max(0, spending - baristaIncome);
  const baristaTarget= Math.round(baristaGap * 12 * legacyMult);
  const coastTarget  = Math.round(fireNum / Math.pow(1 + annualReturn, Math.max(1, 65 - age)));
  const coastDone    = startPort >= coastTarget;
  const dailyPassive = Math.round((startPort * annualReturn) / 365);

  const proj = buildProj({
    start: startPort, monthlySavings: totalSavings, ret: annualReturn,
    sideIncome, bonus: bonusAnnual, years: 40,
    switchYear: switchEnabled ? switchYear : null,
    partTimeSavings, lifestyleCreepPct: lifestyleCreep,
  }).map(r => ({ ...r, age: age + (r.year - currentYear) }));

  const realProj = inflation
    ? proj.map((r, i) => ({ ...r, portfolio: Math.round(r.portfolio / Math.pow(1.025, i)) }))
    : proj;
  const projForDates = inflation ? realProj : proj;

  const fireYear    = projForDates.find(r => r.portfolio >= fireNum)?.year;
  const baristaYear = projForDates.find(r => r.portfolio >= baristaTarget)?.year;
  const coastYear   = !coastDone ? projForDates.find(r => r.portfolio >= coastTarget)?.year : null;

  return {
    fireNum, baristaGap, baristaTarget, coastTarget, coastDone, coastYear,
    fireYear, baristaYear, proj, realProj, projForDates, dailyPassive, currentYear,
  };
}

// ─── METRIC GROUP — compact KPI display helper ────────────────────────────────
const MetricGroup = ({ items }) => (
  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
    {items.map(({ label, value, sub, color=C.gold }) => (
      <Box key={label} small label={label} value={value} sub={sub} color={color} />
    ))}
  </div>
);

function buildProj({ start=0, monthlySavings=500, ret=0.07, sideIncome=0, bonus=0, events=[], years=30, switchYear=null, partTimeIncome=0, partTimeSavings=0, lifestyleCreepPct=0 }) {
  let p = start;
  const currentYear = new Date().getFullYear();
  return Array.from({ length: years }, (_, i) => {
    const year = currentYear + i;
    const isPartTime = switchYear && year >= switchYear;
    const monthly = isPartTime ? partTimeSavings : monthlySavings;
    // Lifestyle creep reduces net savings (spending rises, savings squeeze)
    const creepFactor = lifestyleCreepPct > 0 ? Math.pow(1 - lifestyleCreepPct/100, i) : 1;
    const evtCost = events.filter(e => e.year === year).reduce((a, e) => a + e.cost, 0);
    const yearly = Math.round(monthly * 12 * creepFactor) + sideIncome + bonus - evtCost;
    const growth = p * ret;
    if (i > 0) p = Math.max(0, p + growth + yearly);
    return { year, age: null, portfolio: Math.round(p), growth: Math.round(i > 0 ? growth : 0), contributions: Math.round(i > 0 ? Math.max(0, yearly) : 0), isPartTime };
  });
}

// ─── PERSISTENT STORAGE ───────────────────────────────────────────────────────
function usePersisted(key, defaultVal) {
  const [val, setVal] = useState(defaultVal);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(key); if (r) setVal(JSON.parse(r.value)); } catch (_) {}
      setLoaded(true);
    })();
  }, [key]);
  const setPersisted = useCallback(async (newVal) => {
    const v = typeof newVal === "function" ? newVal(val) : newVal;
    setVal(v);
    try { await window.storage.set(key, JSON.stringify(v)); } catch (_) {}
  }, [key, val]);
  return [val, setPersisted, loaded];
}

// ─── FAIL RATE ────────────────────────────────────────────────────────────────
function failRate(portfolioSize, monthlySpend, horizonYears = 40) {
  if (!portfolioSize) return 99;
  const actualSWR = (monthlySpend * 12) / portfolioSize * 100;
  const base = { 3: 2, 3.5: 5, 4: 10, 4.5: 21, 5: 33 };
  const horizonMult = horizonYears <= 30 ? 0.7 : horizonYears <= 40 ? 1 : 1.4;
  const keys = [3, 3.5, 4, 4.5, 5];
  let lo = 3, hi = 5;
  for (let i = 0; i < keys.length - 1; i++) {
    if (actualSWR >= keys[i] && actualSWR < keys[i+1]) { lo = keys[i]; hi = keys[i+1]; break; }
  }
  const t = actualSWR <= lo ? 0 : actualSWR >= hi ? 1 : (actualSWR - lo) / (hi - lo);
  return Math.min(90, Math.round((base[lo] + t * (base[hi] - base[lo])) * horizonMult));
}

// Reactive failure rate: given a direct SWR % and horizon, return failure probability
function failRateFromSWR(swrPct, horizonYears = 40) {
  const base = { 3: 2, 3.5: 5, 4: 10, 4.5: 21, 5: 33 };
  const horizonMult = horizonYears <= 20 ? 0.5 : horizonYears <= 30 ? 0.7 : horizonYears <= 40 ? 1 : 1.4;
  const keys = [3, 3.5, 4, 4.5, 5];
  const clamped = Math.min(5, Math.max(3, swrPct));
  let lo = 3, hi = 5;
  for (let i = 0; i < keys.length - 1; i++) {
    if (clamped >= keys[i] && clamped < keys[i+1]) { lo = keys[i]; hi = keys[i+1]; break; }
  }
  const t = clamped <= lo ? 0 : clamped >= hi ? 1 : (clamped - lo) / (hi - lo);
  return Math.min(90, Math.round((base[lo] + t * (base[hi] - base[lo])) * horizonMult));
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#040609", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 8px 40px #000c" }}>
      <div style={{ color:C.textMuted, marginBottom:5, fontSize:10, letterSpacing:1 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color:p.color||C.text, marginBottom:2 }}><span style={{ color:C.textMuted }}>{p.name}: </span>{typeof p.value === "number" ? euro(p.value) : p.value}</div>)}
    </div>
  );
};

const Slider = ({ label, value, min, max, step, onChange, format, color=C.gold, hint }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5 }}>
      <span style={{ fontSize:12, color:C.textSec }}>{label}</span>
      <span style={{ fontSize:13, color, fontWeight:700, fontFamily:C.mono }}>{format ? format(value) : value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ width:"100%", accentColor:color, cursor:"pointer" }} />
    {hint && <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>{hint}</div>}
  </div>
);

const Tag = ({ on, onClick, children, color=C.gold }) => (
  <button onClick={onClick} style={{ background:on?color+"1a":C.surface, border:`1px solid ${on?color:C.border}`, borderRadius:20, padding:"5px 13px", cursor:"pointer", color:on?color:C.textSec, fontSize:12, fontWeight:on?700:400, transition:"all 0.15s", fontFamily:C.font }}>
    {children}
  </button>
);

const Box = ({ label, value, sub, color=C.gold, onClick, small }) => (
  <div onClick={onClick} style={{ background:C.surface, border:`1px solid ${color}22`, borderRadius:12, padding:small?"10px 14px":"14px 18px", cursor:onClick?"pointer":"default" }}>
    <div style={{ fontSize:10, color:C.textMuted, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:small?18:22, fontWeight:700, color, fontFamily:C.mono }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>{sub}</div>}
  </div>
);

const Card = ({ title, accent=C.gold, children, titleRight }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", marginBottom:18 }}>
    {title && (
      <div style={{ padding:"15px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:accent, textTransform:"uppercase" }}>{title}</div>
        {titleRight && <div>{titleRight}</div>}
      </div>
    )}
    <div style={{ padding:20 }}>{children}</div>
  </div>
);

const ProgressBar = ({ v, max, color=C.gold, h=7 }) => (
  <div style={{ background:C.border, borderRadius:h, height:h, overflow:"hidden" }}>
    <div style={{ height:"100%", width:`${pct(v,max)}%`, background:`linear-gradient(90deg,${color}88,${color})`, borderRadius:h, transition:"width .5s ease" }} />
  </div>
);

const InfoBox = ({ color=C.gold, children }) => (
  <div style={{ background:color+"10", border:`1px solid ${color}33`, borderRadius:10, padding:"12px 16px", fontSize:13, color:color===C.gold?"#fbbf24":color===C.green?"#4ade80":color===C.red?"#f87171":color===C.blue?C.blueLight:color===C.cyan?C.cyanLight:color===C.orange?"#fb923c":C.purpleLight, lineHeight:1.8 }}>
    {children}
  </div>
);

const Tip = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <span>
      <button onClick={() => setOpen(!open)} style={{ background:C.blue+"22", border:`1px solid ${C.blue}44`, borderRadius:"50%", width:18, height:18, cursor:"pointer", color:C.blueLight, fontSize:10, fontWeight:700, lineHeight:"16px", padding:0, marginLeft:6, verticalAlign:"middle" }}>?</button>
      {open && <div style={{ background:"#050e1d", border:`1px solid ${C.blue}44`, borderRadius:10, padding:"12px 14px", marginTop:8, fontSize:12, color:C.textSec, lineHeight:1.8 }}>{children}<button onClick={() => setOpen(false)} style={{ display:"block", marginTop:8, background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:11 }}>✕ close</button></div>}
    </span>
  );
};

const G2 = ({ children, min=220 }) => <div style={{ display:"grid", gridTemplateColumns:`repeat(auto-fit,minmax(${min}px,1fr))`, gap:12 }}>{children}</div>;
const G3 = ({ children }) => <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>{children}</div>;

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete, lang }) {
  const t = T[lang];
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ age: 28, portfolio: 10000, monthlySavings: 500, monthlyIncome: 2500, country: "austria", fireGoal: "regular" });

  const steps = [
    { key:"age", label:t.onboarding.q1, type:"number", min:18, max:70, step:1, icon:"🎂", hint:"Your current age" },
    { key:"portfolio", label:t.onboarding.q2, type:"number", min:0, max:2000000, step:1000, icon:"💼", hint:"Total invested in ETFs, stocks, etc. Enter 0 if you're just starting." },
    { key:"monthlySavings", label:t.onboarding.q3, type:"number", min:0, max:5000, step:50, icon:"💰", hint:"How much you invest every month" },
    { key:"monthlyIncome", label:t.onboarding.q4, type:"number", min:0, max:15000, step:100, icon:"💳", hint:"Your take-home pay after taxes" },
    { key:"country", label:t.onboarding.q5, type:"select", icon:"🌍", options:[{v:"austria",l:"🇦🇹 Austria"},{v:"germany",l:"🇩🇪 Germany"},{v:"switzerland",l:"🇨🇭 Switzerland"},{v:"other",l:"🌍 Other"}] },
    { key:"fireGoal", label:t.onboarding.q6, type:"fireGoal", icon:"🔥" },
  ];

  const curr = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px" }}>
      <div style={{ maxWidth:480, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔥</div>
          <h1 style={{ margin:"0 0 8px", fontSize:24, fontWeight:400, color:C.text, fontFamily:C.font }}>{t.welcome}</h1>
          <p style={{ color:C.textSec, fontSize:13, margin:0 }}>{t.welcomeSub}</p>
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:32 }}>
          {steps.map((_,i) => (
            <div key={i} style={{ width:i===step?28:8, height:8, borderRadius:4, background:i<step?C.green:i===step?C.gold:C.border, transition:"all 0.3s" }} />
          ))}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:"28px 24px" }}>
          <div style={{ fontSize:28, marginBottom:12, textAlign:"center" }}>{curr.icon}</div>
          <div style={{ fontSize:16, color:C.text, fontWeight:600, marginBottom:20, textAlign:"center", fontFamily:C.font }}>{curr.label}</div>

          {curr.type === "number" && (
            <div>
              <input type="number" value={data[curr.key]} min={curr.min} max={curr.max} step={curr.step}
                onChange={e => setData({...data,[curr.key]:Number(e.target.value)})}
                style={{ width:"100%", background:C.surface, border:`1px solid ${C.gold}44`, borderRadius:10, padding:"14px 18px", color:C.text, fontSize:22, fontFamily:C.mono, textAlign:"center", outline:"none", boxSizing:"border-box" }} />
              {curr.hint && <div style={{ fontSize:12, color:C.textMuted, textAlign:"center", marginTop:8 }}>{curr.hint}</div>}
            </div>
          )}

          {curr.type === "select" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {curr.options.map(opt => (
                <button key={opt.v} onClick={() => setData({...data,[curr.key]:opt.v})}
                  style={{ background:data[curr.key]===opt.v?C.gold+"18":C.surface, border:`1px solid ${data[curr.key]===opt.v?C.gold:C.border}`, borderRadius:10, padding:"12px 18px", cursor:"pointer", color:data[curr.key]===opt.v?C.gold:C.textSec, fontSize:14, fontFamily:C.font, transition:"all 0.15s", textAlign:"left" }}>
                  {opt.l}
                </button>
              ))}
            </div>
          )}

          {curr.type === "fireGoal" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {Object.entries(T[lang].fireTypes).slice(0,6).map(([k,v]) => (
                <button key={k} onClick={() => setData({...data,fireGoal:k})}
                  style={{ background:data.fireGoal===k?v.color+"22":C.surface, border:`1px solid ${data.fireGoal===k?v.color:C.border}`, borderRadius:10, padding:"10px 12px", cursor:"pointer", transition:"all 0.15s", textAlign:"left" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{v.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:data.fireGoal===k?v.color:C.textSec }}>{v.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          {step > 0 && (
            <button onClick={() => setStep(step-1)}
              style={{ flex:1, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px", cursor:"pointer", color:C.textSec, fontSize:13, fontFamily:C.font }}>
              ← Back
            </button>
          )}
          <button onClick={() => isLast ? onComplete(data) : setStep(step+1)}
            style={{ flex:2, background:`linear-gradient(135deg,${C.gold},#f59e0b)`, border:"none", borderRadius:12, padding:"14px", cursor:"pointer", color:"#000", fontSize:14, fontWeight:700, fontFamily:C.font, boxShadow:`0 4px 20px ${C.gold}44` }}>
            {isLast ? t.startBtn : "Continue →"}
          </button>
        </div>

        <button onClick={() => onComplete({ age:28, portfolio:54000, monthlySavings:700, monthlyIncome:2800, country:"austria", fireGoal:"regular" })}
          style={{ width:"100%", marginTop:12, background:"none", border:"none", cursor:"pointer", color:C.textMuted, fontSize:12, fontFamily:C.font }}>
          Skip — use example data
        </button>
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS_LIST = ["roadmap","learn","overview","projection","fireCalc","compare","withdrawal","life","budget","travel","tracker","austria","realestate","taxoptimizer"];

// ─── MORTGAGE HELPERS ─────────────────────────────────────────────────────────
function calcMonthlyPayment(principal, annualRatePct, termYears) {
  if (principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function buildMortgageSchedule(principal, annualRatePct, termYears, propPrice, appreciationPct) {
  const r = annualRatePct / 100 / 12;
  const monthlyPmt = calcMonthlyPayment(principal, annualRatePct, termYears);
  let balance = principal;
  const currentYear = new Date().getFullYear();
  const rows = [];
  for (let yr = 0; yr <= Math.min(termYears, 35); yr++) {
    const propValue = Math.round(propPrice * Math.pow(1 + appreciationPct / 100, yr));
    const equity = Math.max(0, propValue - balance);
    const yearInterest = Math.round(balance * (annualRatePct / 100));
    rows.push({ year: currentYear + yr, propValue, balance: Math.round(balance), equity, yearInterest });
    // Advance one year
    for (let m = 0; m < 12; m++) {
      const interest = balance * r;
      const princ = Math.min(monthlyPmt - interest, balance);
      balance = Math.max(0, balance - princ);
    }
  }
  return rows;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FIREApp() {
  const [lang, setLang] = useState("en");
  const t = T[lang];
  const [onboarded, setOnboarded] = usePersisted("fire-v5-onboarded", false);
  const [userProfile, setUserProfile] = usePersisted("fire-v5-profile", null);
  const [tab, setTab] = useState("learn");
  const [shareMsg, setShareMsg] = useState("");

  // Core params (from onboarding or manual)
  const [age, setAge] = useState(28);
  const [portfolio, setPortfolio] = useState(54000);
  const [monthlySavings, setMonthlySavings] = useState(700);
  const [annualReturn, setAnnualReturn] = useState(0.07);
  const [sideIncome, setSideIncome] = useState(0); // annual (plasma, bonuses etc)
  const [bonus13, setBonus13] = useState(false);
  const [bonus14, setBonus14] = useState(false);
  const [lifestyleCreep, setLifestyleCreep] = useState(0); // % annual spending increase during accumulation
  const [coupleMode, setCoupleMode] = useState(false);
  const [partnerSavings, setPartnerSavings] = useState(500);
  const [partnerPortfolio, setPartnerPortfolio] = useState(0);
  const [inflation, setInflation] = useState(false);
  const [spendMode, setSpendMode] = useState("regular");
  const [fireGoal, setFireGoal] = useState("regular");
  const [legacyMode, setLegacyMode] = useState("zero"); // zero | legacy | grow
  const [swr, setSwr] = useState(4);

  // Part-time switch
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [switchYear, setSwitchYear] = useState(new Date().getFullYear() + 8);
  const [partTimeIncome, setPartTimeIncome] = useState(800);

  // Barista
  const [baristaIncome, setBaristaIncome] = useState(900);
  const [baristaHourlyWage, setBaristaHourlyWage] = useState(15);
  const [showSafetyBuffer, setShowSafetyBuffer] = useState(false);

  // Budget builder state — defined BEFORE spending so totalBudget can drive it
  const [budgetItems, setBudgetItems] = usePersisted("fire-v5-budget", [
    { id:1, cat:"Housing", label:"Rent/Mortgage", amount:700, icon:"🏠" },
    { id:2, cat:"Food", label:"Groceries", amount:200, icon:"🛒" },
    { id:3, cat:"Transport", label:"Public transit / Car", amount:100, icon:"🚌" },
    { id:4, cat:"Utilities", label:"Internet & Phone", amount:50, icon:"📱" },
    { id:5, cat:"Health", label:"Gym / Sport", amount:40, icon:"💪" },
    { id:6, cat:"Travel", label:"Vacation budget", amount:300, icon:"✈️" },
    { id:7, cat:"Other", label:"Entertainment & Social", amount:150, icon:"🎉" },
  ]);
  const [newBudget, setNewBudget] = useState({ label:"", amount:0, cat:"Other", icon:"💶" });
  const totalBudget = budgetItems.reduce((a,b) => a+b.amount, 0);
  const [useBudgetAsSpending, setUseBudgetAsSpending] = useState(false);

  const spendMap = { lean:900, regular:1300, chubby:2200, fat:3500, barista:1300, coast:1300, slow:1300, nomad:700 };
  const spending = (useBudgetAsSpending && totalBudget > 0) ? totalBudget : (spendMap[spendMode] || 1300);

  // partTimeSavings must be after spending — uses the user's actual spending mode
  const partTimeSavings = Math.max(0, partTimeIncome - spending);

  // SWR-linked multiplier: 100/swr. Presets: 5%→×20 (DwZ), 4%→×25 (Classic), 3.33%→×30 (Legacy)
  const legacyMult = parseFloat((100 / swr).toFixed(4));
  const fireNum = Math.round(spending * 12 * legacyMult);
  // Dynamic Barista Target: (Monthly Spending − Barista Income) × 12 × (100/swr)
  const baristaGap = Math.max(0, spending - baristaIncome);
  const baristaTarget = Math.round(baristaGap * 12 * legacyMult);
  // Barista work-life calculations
  const baristaHoursPerWeek = baristaHourlyWage > 0 ? Math.ceil(baristaIncome * 12 / (baristaHourlyWage * 52)) : 0;
  const safetyExtra5hrsIncome = baristaHourlyWage * 5 * 52 / 12; // monthly income from 5 extra hrs/wk
  const baristaGapWith5hrs = Math.max(0, baristaGap - safetyExtra5hrsIncome);

  // Austrian bonus pay
  // 13th pay (Weihnachtsgeld) ≈ 1 extra month saved; 14th pay (Urlaubsgeld) ≈ 1 extra month saved
  // Austrian workers save ~60% of each special payment (net of higher tax via 6% flat rate on first €2,100)
  const bonusAnnual = (bonus13 ? Math.round(monthlySavings * 0.92) : 0) + (bonus14 ? Math.round(monthlySavings * 0.92) : 0);

  // Combined
  const startPort = coupleMode ? portfolio + partnerPortfolio : portfolio;
  const totalSavings = coupleMode ? monthlySavings + partnerSavings : monthlySavings;

  const currentYear = new Date().getFullYear();

  // Main projection
  const proj = useMemo(() => buildProj({
    start: startPort, monthlySavings: totalSavings, ret: annualReturn,
    sideIncome, bonus: bonusAnnual, years: 40,
    switchYear: switchEnabled ? switchYear : null,
    partTimeSavings, lifestyleCreepPct: lifestyleCreep,
  }).map(r => ({ ...r, age: age + (r.year - currentYear) })), [startPort, totalSavings, annualReturn, sideIncome, bonusAnnual, switchEnabled, switchYear, partTimeSavings, lifestyleCreep, age]);

  const realProj = useMemo(() =>
    inflation ? proj.map((r,i) => ({...r, portfolio: Math.round(r.portfolio / Math.pow(1.025,i))})) : proj,
    [proj, inflation]);

  // Bug fix: when inflation mode is on, FIRE years must be calculated in real terms
  // (comparing real purchasing-power portfolio against today's-price FIRE target)
  const projForDates = inflation ? realProj : proj;
  const fireYear = useMemo(() => projForDates.find(r => r.portfolio >= fireNum)?.year, [projForDates, fireNum]);
  const baristaYear = useMemo(() => projForDates.find(r => r.portfolio >= baristaTarget)?.year, [projForDates, baristaTarget]);
  const coastTarget = useMemo(() => {
    // Coast FIRE: need X now so that at 4% growth it reaches fireNum by age 65
    const yearsToGrow = 65 - age;
    return Math.round(fireNum / Math.pow(1 + annualReturn, yearsToGrow));
  }, [fireNum, age, annualReturn]);
  const coastDone = portfolio >= coastTarget;

  // Scenario projections for comparison
  const scenarios = useMemo(() => {
    const makeProj = (spend) => {
      const fn = spend * 12 * legacyMult;
      return buildProj({ start:startPort, monthlySavings:totalSavings, ret:annualReturn, sideIncome, bonus:bonusAnnual, years:40 }).find(r => r.portfolio >= fn)?.year || null;
    };
    return {
      lean: makeProj(900), regular: makeProj(1300), chubby: makeProj(2200), fat: makeProj(3500),
      barista: (() => { const gap = Math.max(0,1300-baristaIncome); const t = gap*12*legacyMult; return buildProj({start:startPort,monthlySavings:totalSavings,ret:annualReturn,sideIncome,bonus:bonusAnnual,years:40}).find(r=>r.portfolio>=t)?.year || null; })(),
    };
  }, [startPort, totalSavings, annualReturn, sideIncome, bonusAnnual, baristaIncome, legacyMult]);

  // Part-time impact chart data
  const partTimeCompare = useMemo(() => {
    const noSwitch = buildProj({ start:startPort, monthlySavings:totalSavings, ret:annualReturn, sideIncome, bonus:bonusAnnual, years:30 });
    const withSwitch = buildProj({ start:startPort, monthlySavings:totalSavings, ret:annualReturn, sideIncome, bonus:bonusAnnual, years:30, switchYear:switchEnabled?switchYear:null, partTimeSavings });
    return noSwitch.map((r,i) => ({
      year: r.year,
      "Full Time": r.portfolio,
      "With Part-Time Switch": withSwitch[i].portfolio,
    }));
  }, [startPort, totalSavings, annualReturn, sideIncome, bonusAnnual, switchEnabled, switchYear, partTimeSavings]);

  // Breakdown
  const breakdown = useMemo(() => {
    let tc = startPort;
    return proj.slice(0,30).map(r => { tc += r.contributions; return { year:r.year, contributions:Math.min(tc,r.portfolio), growth:Math.max(0,r.portfolio-tc) }; });
  }, [proj, startPort]);

  // Monte Carlo
  const mcData = useMemo(() => {
    const SIMS = 300, YEARS = 30;
    const paths = [];
    for (let s = 0; s < SIMS; s++) {
      let p = startPort;
      const path = [p];
      for (let i = 1; i < YEARS; i++) {
        const monthly = switchEnabled && (currentYear+i) >= switchYear ? partTimeSavings : totalSavings;
        const yearly = monthly*12 + sideIncome + bonusAnnual;
        const ret = randNorm(annualReturn, 0.17);
        p = Math.max(0, p*(1+ret) + yearly);
        path.push(Math.round(p));
      }
      paths.push(path);
    }
    return Array.from({ length:YEARS }, (_,i) => {
      const vals = paths.map(p => p[i]).sort((a,b) => a-b);
      const g = (pct) => vals[Math.floor(SIMS*pct)];
      return { year:currentYear+i, p10:g(0.10), p25:g(0.25), p50:g(0.50), p75:g(0.75), p90:g(0.90) };
    });
  }, [startPort, totalSavings, annualReturn, sideIncome, bonusAnnual, switchEnabled, switchYear, partTimeSavings]);

  // Milestones
  const milestones = useMemo(() => [
    { label:"Coast FIRE", target:coastTarget, emoji:"🏖️", color:C.cyan, done:portfolio>=coastTarget },
    { label:"€100k Club", target:100000, emoji:"💯", color:C.blue, done:portfolio>=100000 },
    { label:"€250k", target:250000, emoji:"🌟", color:C.purple, done:portfolio>=250000 },
    { label:"Barista FIRE", target:baristaTarget, emoji:"☕", color:C.green, done:portfolio>=baristaTarget },
    { label:"½ FIRE", target:Math.round(fireNum/2), emoji:"🔥", color:C.orange, done:portfolio>=fireNum/2 },
    { label:`${t.fireTypes[spendMode]?.name || "FIRE"}`, target:fireNum, emoji:"🎯", color:C.gold, done:portfolio>=fireNum },
  ].sort((a,b) => a.target-b.target), [coastTarget, baristaTarget, fireNum, portfolio, spendMode, t]);

  // FI Score
  const fiScore = useMemo(() => {
    const p = Math.min(50, pct(portfolio, fireNum)*0.5);
    const s = Math.min(20, (monthlySavings/spending)*20);
    const tm = fireYear ? Math.max(0, 20 - Math.max(0, fireYear-(currentYear+9))*2) : 0;
    return Math.round(p+s+tm+Math.min(10,(sideIncome>0?5:0)+(bonus13?5:0)));
  }, [portfolio, fireNum, monthlySavings, spending, fireYear, sideIncome, bonus13]);

  const dailyPassive = Math.round((portfolio * annualReturn) / 365);

  // Travel budget
  const [travelBudget, setTravelBudget] = useState(300); // monthly allocation
  const [travelStyle, setTravelStyle] = useState("standard");
  const travelAnnual = travelBudget * 12;
  const destinations = [
    { region:"Southeast Asia 🇹🇭🇻🇳🇮🇩", costPerDay:35, icon:"🌏", desc:"Thailand, Vietnam, Bali — incredible value", tier:"budget" },
    { region:"Eastern Europe 🇷🇴🇵🇱🇨🇿", costPerDay:60, icon:"🏰", desc:"Fascinating history, great food, cheap flights", tier:"budget" },
    { region:"Central America 🇲🇽🇨🇷🇬🇹", costPerDay:55, icon:"🌮", desc:"Mexico, Costa Rica, Guatemala — beaches & jungle", tier:"budget" },
    { region:"Balkans 🇷🇸🇧🇦🇲🇪", costPerDay:50, icon:"⛵", desc:"Albania, Montenegro, Serbia — hidden gems", tier:"budget" },
    { region:"South America 🇦🇷🇧🇴🇵🇪", costPerDay:65, icon:"🏔️", desc:"Argentina, Bolivia, Peru — epic landscapes", tier:"mid" },
    { region:"Japan 🇯🇵", costPerDay:100, icon:"⛩️", desc:"Unique, safe, incredible food culture", tier:"mid" },
    { region:"Western Europe 🇫🇷🇮🇹🇪🇸", costPerDay:130, icon:"🗼", desc:"France, Italy, Spain — near home", tier:"mid" },
    { region:"North America 🇺🇸🇨🇦", costPerDay:180, icon:"🗽", desc:"USA, Canada — big trips", tier:"premium" },
    { region:"Australia/NZ 🇦🇺🇳🇿", costPerDay:170, icon:"🦘", desc:"Far but unforgettable", tier:"premium" },
  ];

  // Tracker
  const [entries, setEntries, entriesLoaded] = usePersisted("fire-v5-entries", []);
  const [monthlyLogs, setMonthlyLogs, logsLoaded] = usePersisted("fire-v5-logs", []);
  const [newDate, setNewDate] = useState(""); const [newVal, setNewVal] = useState("");
  const [newMonth, setNewMonth] = useState(""); const [newSaved, setNewSaved] = useState("");

  // Austria
  const GERING = 551.10;
  const SV_GERING_LIMIT = 518.44; // Geringfügigkeitsgrenze 2025/2026
  const [geringIncome, setGeringIncome] = useState(500);
  const [pensionYears, setPensionYears] = useState(15);
  const [pensionAvgIncome, setPensionAvgIncome] = useState(30000);

  // ─── SV-Status nach FIRE / Barista ─────────────────────────────────────────
  // privatier   = Selbstversicherung §16 ASVG       → ~€495/mo
  // geringfuegig= < SV_GERING_LIMIT, opt. §19a ASVG → €73.20/mo
  // teilzeit    = ≥ SV_GERING_LIMIT, pflichtversich. → €0 extra
  // mitversichert = §123 ASVG über Partner           → €0
  const [svStatus, setSvStatus] = usePersisted("fire-v5-sv", "privatier");
  const [svOptIn19a, setSvOptIn19a] = useState(false);

  const svMonthlyCost = useMemo(() => {
    if (svStatus === "privatier")    return 495;
    if (svStatus === "geringfuegig") return svOptIn19a ? 73.20 : 0;
    return 0;
  }, [svStatus, svOptIn19a]);

  // SV-adjusted post-FIRE spending & new FIRE target
  const spendingWithSV = spending + svMonthlyCost;
  const fireNumWithSV  = Math.round(spendingWithSV * 12 * legacyMult);
  const svFireYearAdj  = projForDates.find(r => r.portfolio >= fireNumWithSV)?.year;
  const svFireDelay    = svFireYearAdj && fireYear ? svFireYearAdj - fireYear : 0;

  // Real Estate
  const [rePropPrice, setRePropPrice] = usePersisted("fire-re-price", 280000);
  const [reDownPct, setReDownPct] = usePersisted("fire-re-down", 20);
  const [reInterestRate, setReInterestRate] = usePersisted("fire-re-rate", 3.5);
  const [reLoanTerm, setReLoanTerm] = usePersisted("fire-re-term", 25);
  const [reMaintenance, setReMaintenance] = usePersisted("fire-re-maint", 250);
  const [rePropMode, setRePropMode] = usePersisted("fire-re-mode", "none"); // none | own | invest | inherit | build
  const [reMonthlyRent, setReMonthlyRent] = usePersisted("fire-re-rent", 1100);
  const [reRentalTaxRate, setReRentalTaxRate] = usePersisted("fire-re-taxrate", 30);
  const [reAppreciation, setReAppreciation] = usePersisted("fire-re-apprec", 2.0);
  const [reCurrentRent, setReCurrentRent] = usePersisted("fire-re-currentrent", 800);
  const [reInheritedValue, setReInheritedValue] = usePersisted("fire-re-inherited", 250000);
  const [reBuildCost, setReBuildCost] = usePersisted("fire-re-buildcost", 350000);
  const [reBuildLandCost, setReBuildLandCost] = usePersisted("fire-re-landcost", 100000);
  const [reBuildYear, setReBuildYear] = usePersisted("fire-re-buildyear", new Date().getFullYear() + 4);

  // Derived — only active when a property mode is selected
  const reHasProperty = rePropMode !== "none";
  const reEffectivePrice = rePropMode === "build" ? reBuildCost + reBuildLandCost : rePropMode === "inherit" ? 0 : rePropPrice;
  const reEffectiveDown = rePropMode === "build" ? reBuildLandCost : rePropMode === "inherit" ? 0 : Math.round(rePropPrice * reDownPct / 100);
  const reEffectiveLoan = rePropMode === "build" ? reBuildCost : rePropMode === "inherit" ? 0 : rePropPrice - reEffectiveDown;

  // Real estate derived values (using effective values that work across all modes)
  const reDownPayment = reEffectiveDown;
  const reLoanAmount = reEffectiveLoan;
  const reMortgagePayment = rePropMode === "inherit" ? 0 : Math.round(calcMonthlyPayment(reLoanAmount, reInterestRate, reLoanTerm));
  const reTotalPaid = reMortgagePayment * reLoanTerm * 12;
  const reTotalInterest = reTotalPaid - reLoanAmount;
  const rePayoffYear = rePropMode === "inherit" ? currentYear : currentYear + reLoanTerm;

  // Rental income (buy-to-let)
  const reGrossYield = rePropPrice > 0 ? (reMonthlyRent * 12 / rePropPrice * 100) : 0;
  // AfA deduction: 1.5% of building value (80% of price) = 1.2% of total price
  const reAfaAnnual = Math.round(rePropPrice * 0.8 * 0.015);
  // First-year mortgage interest (approximate)
  const reYearOneInterest = Math.round(reLoanAmount * reInterestRate / 100);
  // Taxable rental income = gross - interest - maintenance*12 - AfA
  const reTaxableRental = Math.max(0, reMonthlyRent * 12 - reYearOneInterest - reMaintenance * 12 - reAfaAnnual);
  const reRentalTax = Math.round(reTaxableRental * reRentalTaxRate / 100);
  const reNetMonthlyRental = Math.round((reMonthlyRent * 12 - reRentalTax) / 12);
  const reNetYield = rePropPrice > 0 ? (reNetMonthlyRental * 12 / rePropPrice * 100) : 0;
  // Monthly cashflow (rent income - mortgage - maintenance)
  const reCashflow = rePropMode === "invest"
    ? reNetMonthlyRental - reMortgagePayment - reMaintenance
    : reCurrentRent - reMortgagePayment - reMaintenance; // negative = more expensive than renting

  // Mortgage schedule
  const reMortgageSchedule = useMemo(() =>
    buildMortgageSchedule(reLoanAmount, reInterestRate, reLoanTerm, rePropPrice, reAppreciation),
    [reLoanAmount, reInterestRate, reLoanTerm, rePropPrice, reAppreciation]);

  // Buy vs Rent comparison (35-year net worth projection)
  const reBuyVsRentData = useMemo(() => {
    const years = 35;
    // Scenario A: Buy property
    // Start ETF at (portfolio - downPayment), monthly savings adjusted
    const monthlyCostDelta = rePropMode === "own"
      ? (reMortgagePayment + reMaintenance - reCurrentRent) // extra monthly cost vs renting
      : -(Math.max(0, reCashflow)); // invest cashflow back

    let etfBuy = Math.max(0, startPort - reDownPayment);
    let etfRent = startPort;

    const result = [];
    for (let yr = 0; yr <= years; yr++) {
      // After loan term, mortgage stops — cost drops to maintenance only
      const isPostPayoff = yr >= reLoanTerm;
      const buyExtraCost = isPostPayoff ? -reCurrentRent + reMaintenance : monthlyCostDelta;
      const savingsBuy = Math.max(0, totalSavings - buyExtraCost);
      const savingsRent = totalSavings;

      if (yr > 0) {
        etfBuy = etfBuy * (1 + annualReturn) + savingsBuy * 12;
        etfRent = etfRent * (1 + annualReturn) + savingsRent * 12;
      }

      const schedRow = reMortgageSchedule[Math.min(yr, reMortgageSchedule.length - 1)];
      const equity = schedRow ? schedRow.equity : 0;
      const netWorthBuy = Math.round(etfBuy + equity);
      const netWorthRent = Math.round(etfRent);

      result.push({
        year: currentYear + yr,
        [t.re?.netWorthProp || "With Property"]: netWorthBuy,
        [t.re?.netWorthEtf || "ETF Only"]: netWorthRent,
        [t.re?.equity || "Equity"]: equity,
        [t.re?.etfPortfolio || "ETF Portfolio"]: Math.round(etfBuy),
      });
    }
    return result;
  }, [reLoanAmount, reInterestRate, reLoanTerm, rePropPrice, reAppreciation, reDownPayment, reMortgagePayment, reMaintenance, reCurrentRent, reCashflow, rePropMode, startPort, totalSavings, annualReturn, reMortgageSchedule, t.re]);

  // FIRE impact: if own home / inherit / build, post-payoff housing cost is just maintenance
  const reHousingBenefit = (rePropMode === "own" || rePropMode === "inherit" || rePropMode === "build") ? Math.max(0, reCurrentRent - reMaintenance) : 0;
  const reAdjustedSpending = Math.max(0, spending - reHousingBenefit);
  const reAdjustedFireNum = Math.round(reAdjustedSpending * 12 * legacyMult);

  // Bug 2 fix: project WITH mortgage drain during loan years, then use lower target post-payoff.
  // Extra monthly cost during mortgage = mortgage payment + maintenance - current rent (can be negative if cheap rent).
  // After payoff: savings are back to normal but FIRE target is lower.
  const reFireYearAdj = useMemo(() => {
    if (rePropMode === "none" || rePropMode === "invest") return projForDates.find(r => r.portfolio >= reAdjustedFireNum)?.year;
    const mortgageDrain = rePropMode === "inherit" ? 0 : Math.max(0, reMortgagePayment + reMaintenance - reCurrentRent);
    const yearsOfDrain = reLoanTerm;
    let p = startPort;
    const yr0 = currentYear;
    for (let i = 0; i < 40; i++) {
      if (i > 0) {
        const inMortgagePhase = i <= yearsOfDrain;
        const effectiveMonthlySavings = inMortgagePhase
          ? Math.max(0, totalSavings - mortgageDrain)
          : totalSavings;
        p = Math.max(0, p * (1 + annualReturn) + effectiveMonthlySavings * 12);
      }
      // Target switches to lower adjusted number only after mortgage is paid off
      const target = (rePropMode === "inherit" || i >= yearsOfDrain) ? reAdjustedFireNum : fireNum;
      if (p >= target && i > 0) return yr0 + i;
    }
    return null;
  }, [rePropMode, startPort, totalSavings, annualReturn, reMortgagePayment, reMaintenance, reCurrentRent, reLoanTerm, reAdjustedFireNum, fireNum, proj, inflation, realProj]);

  // Sequence of returns
  const seqData = useMemo(() => {
    const lucky = [0.28,0.21,0.15,0.10,0.07,0.05,0.02,-0.05,-0.12,-0.18,0.05,0.10,0.12,0.14,0.16,0.18,0.08,0.07,0.07,0.07];
    const unlucky = [-0.18,-0.12,-0.05,0.02,0.05,0.07,0.10,0.15,0.21,0.28,0.05,0.10,0.12,0.14,0.16,0.18,0.08,0.07,0.07,0.07];
    function simulate(rets) {
      let p = fireNum;
      return rets.map(r => { p = Math.max(0, p*(1+r) - spending*12); return Math.round(p); });
    }
    return lucky.map((_, i) => ({ year:currentYear+i, "Lucky (Good Start)":simulate(lucky)[i], "Unlucky (Bad Start)":simulate(unlucky)[i] }));
  }, [fireNum, spending]);

  // ── Advanced Analysis State ────────────────────────────────────────────────
  const [projSubTab, setProjSubTab] = useState("forecast"); // forecast | crisis
  const [crisisScenario, setCrisisScenario] = useState("2008");
  const [crisisTriggerYear, setCrisisTriggerYear] = useState(currentYear + 2);
  const [gkFloor, setGkFloor] = useState(80);
  const [gkCeil, setGkCeil] = useState(120);
  const [omyExtra, setOmyExtra] = useState(0);
  const [taxKeSt] = useState(27.5); // Austrian KeSt fixed at 27.5%
  const [taxHarvesting, setTaxHarvesting] = useState(false);
  const [taxRegelbest, setTaxRegelbest] = useState(false);

  // ── Crisis Scenarios ───────────────────────────────────────────────────────
  const CRISIS_SCENARIOS = {
    "2008": { name:"2008 Financial Crisis", emoji:"🏦", color:C.red,
      rets:[-0.38,-0.38,0.26,0.15,0.02,0.16,0.32,0.14,0.01,0.12,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],
      desc:"S&P dropped 38% in 2008 alone, another 38% total before recovering." },
    "1929": { name:"1929 Great Depression", emoji:"📉", color:C.pink,
      rets:[-0.37,-0.47,-0.28,-0.15,0.31,-0.35,0.33,0.27,0.26,0.21,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],
      desc:"Markets lost 89% peak-to-trough over 3 years. The worst-case scenario in history." },
    "2000": { name:"2000 Dot-com Crash", emoji:"💻", color:C.orange,
      rets:[-0.10,-0.13,-0.23,0.28,0.10,0.05,0.15,0.05,-0.38,0.26,0.15,0.02,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],
      desc:"Three consecutive down years, then a partial recovery, then 2008 hit again." },
    "1970": { name:"1970s Stagflation", emoji:"🛢️", color:C.teal,
      rets:[-0.15,-0.26,0.37,-0.07,-0.07,0.23,-0.07,0.06,0.32,0.18,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],
      desc:"High inflation + stagnant growth. A grinding decade that destroyed real purchasing power." },
    "covid": { name:"COVID-19 Crash 2020", emoji:"🦠", color:C.purple,
      rets:[-0.34,0.68,0.28,0.18,-0.19,0.26,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07,0.07],
      desc:"Fastest 34% crash in history — but fastest V-shape recovery too. Tests SORR resilience." },
  };

  const crisisData = useMemo(() => {
    const sc = CRISIS_SCENARIOS[crisisScenario];
    const YEARS = 30;
    const trigOff = crisisTriggerYear - currentYear;
    function sim(withC) {
      let p = fireNum;
      return Array.from({ length: YEARS }, (_, i) => {
        const inCrisis = withC && i >= trigOff && i < trigOff + sc.rets.length;
        const ret = inCrisis ? sc.rets[i - trigOff] : annualReturn;
        p = Math.max(0, p * (1 + ret) - spending * 12);
        return Math.round(p);
      });
    }
    const base = sim(false), crisis = sim(true);
    const ruined = crisis.findIndex(v => v <= 0);
    return { rows: Array.from({ length: YEARS }, (_, i) => ({ year: currentYear+i, "Baseline":base[i], [`${sc.name}`]:crisis[i] })), ruined, sc };
  }, [crisisScenario, crisisTriggerYear, fireNum, spending, annualReturn]);

  // ── Guyton-Klinger simulation (deterministic demo with fixed seed-like returns) ──
  const gkData = useMemo(() => {
    // Use a pre-baked sequence of realistic annual returns so chart is stable
    const RETS = [0.12,0.18,-0.08,0.22,0.07,0.14,-0.38,0.26,0.15,0.02,0.16,0.32,0.14,0.01,0.12,0.07,0.19,-0.10,0.25,0.09,0.11,0.07,-0.15,0.30,0.08,0.12,0.21,-0.04,0.15,0.07,0.08,0.10,0.07,0.09,0.12,-0.05,0.14,0.08,0.11,0.06];
    const initial = spending;
    let pGK = fireNum, pFixed = fireNum;
    let spendGK = initial * 12;
    let prevP = fireNum;
    return RETS.map((ret, i) => {
      // GK path
      pGK = pGK * (1 + ret);
      const swrGK = spendGK / pGK;
      if (swrGK > 0.06) spendGK *= 0.90;                           // Capital Preservation Rule
      if (pGK > prevP * 1.20 && swrGK < 0.035) spendGK *= 1.10;  // Prosperity Rule
      spendGK = Math.max(initial*12*(gkFloor/100), Math.min(initial*12*(gkCeil/100), spendGK));
      pGK = Math.max(0, pGK - spendGK);
      prevP = pGK;
      // Fixed-SWR path
      pFixed = Math.max(0, pFixed * (1 + ret) - initial * 12);
      return {
        year: currentYear + i,
        "GK Portfolio": Math.round(pGK),
        "Fixed 4% Portfolio": Math.round(pFixed),
        "GK Monthly Spend": Math.round(spendGK / 12),
        "Fixed Monthly Spend": initial,
      };
    });
  }, [fireNum, spending, gkFloor, gkCeil]);

  // ── OMY (One More Year) data ───────────────────────────────────────────────
  const omyData = useMemo(() => {
    const baseFireYear = fireYear || currentYear + 15;
    return Array.from({ length: 11 }, (_, i) => {
      const yrs = (baseFireYear + i) - currentYear;
      let p = startPort;
      for (let y = 0; y < yrs; y++) p = p * (1 + annualReturn) + totalSavings * 12;
      const fr40 = failRate(p, spending, 40);
      const baseFr = failRate(fireNum, spending, 40);
      return {
        label: i === 0 ? "FIRE Now" : `+${i} yr${i>1?"s":""}`,
        extraYears: i,
        portfolio: Math.round(p),
        failRate40: fr40,
        improvement: Math.max(0, baseFr - fr40),
        marginalGain: i === 0 ? 0 : Math.max(0, failRate(
          (() => { let q=startPort; for(let y=0;y<yrs-1;y++) q=q*(1+annualReturn)+totalSavings*12; return q; })(), spending, 40) - fr40),
      };
    });
  }, [fireYear, startPort, annualReturn, totalSavings, spending, fireNum]);

  // ── Tax Drag calculation ───────────────────────────────────────────────────
  const taxDragData = useMemo(() => {
    const KeSt = taxKeSt / 100;
    // Accumulating ETF: ~20% of annual gain taxed each year via deemed distribution (ausschüttungsgleiche Erträge)
    // Tax harvesting: reduces this to ~5% (periodic resets)
    // Regelbesteuerungsoption: 0% tax if total income < €13,539/yr
    const annualTaxPortion = taxRegelbest ? 0 : (taxHarvesting ? 0.05 : 0.20);
    let gross = startPort, taxed = startPort;
    return Array.from({ length: 30 }, (_, i) => {
      if (i > 0) {
        const grossGain = gross * annualReturn;
        gross = gross + grossGain + totalSavings * 12;
        const taxedGain = taxed * annualReturn;
        const annualTax = taxedGain * annualTaxPortion * KeSt;
        taxed = taxed + taxedGain - annualTax + totalSavings * 12;
      }
      // "Real Spendable" = taxed portfolio minus exit tax on remaining unrealized gain
      const costBasis = startPort + totalSavings * 12 * i;
      const unrealised = Math.max(0, taxed - costBasis);
      const exitTax = taxRegelbest ? 0 : unrealised * KeSt;
      return {
        year: currentYear + i,
        "Gross Portfolio": Math.round(gross),
        "After Tax Drag": Math.round(taxed),
        "Real Spendable": Math.round(Math.max(0, taxed - exitTax)),
      };
    });
  }, [startPort, annualReturn, totalSavings, taxKeSt, taxHarvesting, taxRegelbest]);

  // Life events
  const [events, setEvents] = useState([]);
  const [newEvt, setNewEvt] = useState({ label:"", year:currentYear+3, cost:5000 });

  // ── Share / Export / Import ────────────────────────────────────────────────
  const [showExportModal, setShowExportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  const buildExportPayload = () => JSON.stringify({
    v:5, age, portfolio, monthlySavings, annualReturn, sideIncome, bonus13, bonus14, lifestyleCreep,
    coupleMode, partnerSavings, partnerPortfolio, spendMode, legacyMode,
    switchEnabled, switchYear, partTimeIncome, baristaIncome,
    rePropPrice, reDownPct, reInterestRate, reLoanTerm, reMaintenance,
    rePropMode, reMonthlyRent, reRentalTaxRate, reAppreciation, reCurrentRent,
    reInheritedValue, reBuildCost, reBuildLandCost, reBuildYear,
    travelBudget, travelStyle, taxHarvesting, taxRegelbest, gkFloor, gkCeil,
    svStatus, svOptIn19a,
  }, null, 0);

  const handleExportCopy = () => {
    const payload = buildExportPayload();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).then(() => setShareMsg("Copied! ✓"));
    } else {
      setShareMsg("Select all text above and copy manually");
    }
    setTimeout(() => setShareMsg(""), 3000);
  };

  const handleImport = () => {
    try {
      const d = JSON.parse(importText.trim());
      if (d.age) setAge(d.age);
      if (d.portfolio !== undefined) setPortfolio(d.portfolio);
      if (d.monthlySavings !== undefined) setMonthlySavings(d.monthlySavings);
      if (d.annualReturn !== undefined) setAnnualReturn(d.annualReturn);
      if (d.sideIncome !== undefined) setSideIncome(d.sideIncome);
      if (d.bonus13 !== undefined) setBonus13(d.bonus13);
      if (d.bonus14 !== undefined) setBonus14(d.bonus14);
      if (d.lifestyleCreep !== undefined) setLifestyleCreep(d.lifestyleCreep);
      if (d.coupleMode !== undefined) setCoupleMode(d.coupleMode);
      if (d.partnerSavings !== undefined) setPartnerSavings(d.partnerSavings);
      if (d.partnerPortfolio !== undefined) setPartnerPortfolio(d.partnerPortfolio);
      if (d.spendMode) setSpendMode(d.spendMode);
      if (d.legacyMode) setLegacyMode(d.legacyMode);
      if (d.switchEnabled !== undefined) setSwitchEnabled(d.switchEnabled);
      if (d.switchYear !== undefined) setSwitchYear(d.switchYear);
      if (d.partTimeIncome !== undefined) setPartTimeIncome(d.partTimeIncome);
      if (d.baristaIncome !== undefined) setBaristaIncome(d.baristaIncome);
      if (d.rePropPrice !== undefined) setRePropPrice(d.rePropPrice);
      if (d.reDownPct !== undefined) setReDownPct(d.reDownPct);
      if (d.reInterestRate !== undefined) setReInterestRate(d.reInterestRate);
      if (d.reLoanTerm !== undefined) setReLoanTerm(d.reLoanTerm);
      if (d.reMaintenance !== undefined) setReMaintenance(d.reMaintenance);
      if (d.rePropMode) setRePropMode(d.rePropMode);
      if (d.reMonthlyRent !== undefined) setReMonthlyRent(d.reMonthlyRent);
      if (d.reRentalTaxRate !== undefined) setReRentalTaxRate(d.reRentalTaxRate);
      if (d.reAppreciation !== undefined) setReAppreciation(d.reAppreciation);
      if (d.reCurrentRent !== undefined) setReCurrentRent(d.reCurrentRent);
      if (d.reInheritedValue !== undefined) setReInheritedValue(d.reInheritedValue);
      if (d.reBuildCost !== undefined) setReBuildCost(d.reBuildCost);
      if (d.reBuildLandCost !== undefined) setReBuildLandCost(d.reBuildLandCost);
      if (d.reBuildYear !== undefined) setReBuildYear(d.reBuildYear);
      if (d.travelBudget !== undefined) setTravelBudget(d.travelBudget);
      if (d.travelStyle) setTravelStyle(d.travelStyle);
      if (d.taxHarvesting !== undefined) setTaxHarvesting(d.taxHarvesting);
      if (d.taxRegelbest !== undefined) setTaxRegelbest(d.taxRegelbest);
      if (d.gkFloor !== undefined) setGkFloor(d.gkFloor);
      if (d.gkCeil !== undefined) setGkCeil(d.gkCeil);
      if (d.svStatus) setSvStatus(d.svStatus);
      if (d.svOptIn19a !== undefined) setSvOptIn19a(d.svOptIn19a);
      setImportText(""); setImportError(""); setShowExportModal(false);
      setShareMsg("Plan imported! ✓"); setTimeout(() => setShareMsg(""), 3000);
    } catch(e) { setImportError("Invalid plan data. Please paste the full exported text."); }
  };

  // ── Roadmap / Decision Lab state ───────────────────────────────────────────
  const [savedScenarios, setSavedScenarios] = usePersisted("fire-v5-scenarios", []);
  const [whatIfNoHouse, setWhatIfNoHouse] = useState(false);
  const [whatIfEarlyRetire, setWhatIfEarlyRetire] = useState(false);
  const [whatIfNomad, setWhatIfNomad] = useState(false);
  const [roadmapSubTab, setRoadmapSubTab] = useState("roadmap"); // roadmap | lab

  const captureScenario = () => {
    const label = `Plan ${String.fromCharCode(65 + (savedScenarios.length % 26))}`;
    const ageAtFire = fireYear ? fireYear - currentYear + age : null;
    const yearsTo90 = 90 - age;
    let p90 = startPort;
    for (let i = 0; i < yearsTo90; i++) {
      const savingPhase = i < (fireYear ? fireYear - currentYear : 40);
      p90 = p90 * (1 + annualReturn) + (savingPhase ? totalSavings * 12 : -spending * 12);
    }
    const snap = {
      id: Date.now(), label,
      timestamp: new Date().toLocaleDateString("de-AT"),
      age, portfolio: startPort, monthlySavings: totalSavings, spending,
      fireYear, fireNum, fireAge: ageAtFire,
      annualReturn, spendMode, legacyMode,
      // Record the ACTUAL current RE mode (not the what-if toggle)
      rePropMode, rePropPrice: rePropMode !== "none" ? rePropPrice : 0,
      switchEnabled, switchYear, partTimeIncome,
      taxHarvesting, taxRegelbest, bonus13, bonus14,
      lifestyleCreep,
      svStatus, svMonthlyCost,
      portfolioAt90: Math.max(0, Math.round(p90)),
      totalTaxEst: taxRegelbest ? 0 : Math.round(startPort * Math.pow(1+annualReturn, 40) * 0.04),
    };
    setSavedScenarios(prev => [...prev.slice(-3), snap]);
  };

  // What-if adjusted projections
  const wiSpending = whatIfNomad ? 700 : whatIfEarlyRetire ? Math.round(spending * 0.90) : spending;
  const wiFireNum = Math.round(wiSpending * 12 * legacyMult);
  const wiSavings = whatIfNoHouse ? totalSavings + Math.round((reMortgagePayment || 0) * 0) : totalSavings;
  const wiExtraDownPmt = whatIfNoHouse ? reDownPayment : 0;
  const wiStartPort = startPort + wiExtraDownPmt;
  const wiProj = useMemo(() => buildProj({ start: wiStartPort, monthlySavings: wiSavings, ret: annualReturn, sideIncome, bonus: bonusAnnual, years: 40 }), [wiStartPort, wiSavings, annualReturn, sideIncome, bonusAnnual]);
  const wiFireYear = wiProj.find(r => r.portfolio >= wiFireNum)?.year;
  const wiFireAge = wiFireYear ? wiFireYear - currentYear + age : null;

  // Onboarding complete
  const handleOnboardComplete = (data) => {
    setAge(data.age);
    setPortfolio(data.portfolio);
    setMonthlySavings(data.monthlySavings);
    setSpendMode(data.fireGoal in spendMap ? data.fireGoal : "regular");
    setFireGoal(data.fireGoal);
    setUserProfile(data);
    setOnboarded(true);
  };

  if (!onboarded) return <Onboarding onComplete={handleOnboardComplete} lang={lang} />;

  const tabLabels = t.tabs;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:C.font }}>

      {/* ── EXPORT / IMPORT MODAL ─────────────────────────────────────────── */}
      {showExportModal && (
        <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e => { if(e.target===e.currentTarget) setShowExportModal(false); }}>
          <div style={{ background:C.card, border:`1px solid ${C.gold}44`, borderRadius:18, padding:24, maxWidth:500, width:"100%", boxShadow:"0 20px 80px #000" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.gold }}>📤 Export / Import Your Plan</div>
              <button onClick={() => setShowExportModal(false)} style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:18 }}>✕</button>
            </div>
            <InfoBox color={C.blue}>
              💡 <strong>How to share:</strong> Copy the text below and send it via WhatsApp, email, or any message. Your friend pastes it into the Import box on their device to load your exact plan.
            </InfoBox>
            <div style={{ marginTop:14 }}>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Your Plan Data (copy everything)</div>
              <textarea readOnly value={buildExportPayload()}
                style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", color:C.textSec, fontSize:10, fontFamily:C.mono, height:80, resize:"none", boxSizing:"border-box" }}
                onFocus={e => e.target.select()} />
              <button onClick={handleExportCopy}
                style={{ width:"100%", marginTop:8, background:`linear-gradient(135deg,${C.gold},#f59e0b)`, border:"none", borderRadius:10, padding:"11px", cursor:"pointer", color:"#000", fontWeight:700, fontSize:13, fontFamily:C.font }}>
                {shareMsg || "📋 Copy Plan to Clipboard"}
              </button>
            </div>
            <div style={{ margin:"18px 0", borderTop:`1px solid ${C.border}` }} />
            <div>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Import a Plan (paste here)</div>
              <textarea value={importText} onChange={e => { setImportText(e.target.value); setImportError(""); }}
                placeholder="Paste your friend's plan data here..."
                style={{ width:"100%", background:C.surface, border:`1px solid ${importError?C.red:C.border}`, borderRadius:8, padding:"10px 12px", color:C.text, fontSize:11, fontFamily:C.mono, height:60, resize:"none", boxSizing:"border-box" }} />
              {importError && <div style={{ fontSize:11, color:C.red, marginTop:4 }}>{importError}</div>}
              <button onClick={handleImport} disabled={!importText.trim()}
                style={{ width:"100%", marginTop:8, background:importText.trim()?C.green:C.surface, border:`1px solid ${importText.trim()?C.green:C.border}`, borderRadius:10, padding:"11px", cursor:importText.trim()?"pointer":"default", color:importText.trim()?"#fff":C.textMuted, fontWeight:700, fontSize:13, fontFamily:C.font }}>
                ⬇️ Load This Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:`linear-gradient(180deg,#080d1a 0%,${C.bg} 100%)`, borderBottom:`1px solid ${C.border}`, padding:"24px 16px 18px", textAlign:"center" }}>
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"0 16px", marginBottom:8, gap:8 }}>
          <button onClick={() => setLang(lang==="en"?"de":"en")}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 12px", cursor:"pointer", color:C.textSec, fontSize:12, fontFamily:C.font }}>
            🌐 {t.langToggle}
          </button>
          <button onClick={() => { setShowExportModal(true); setShareMsg(""); }}
            style={{ background:C.gold+"18", border:`1px solid ${C.gold}44`, borderRadius:8, padding:"5px 12px", cursor:"pointer", color:C.gold, fontSize:12, fontFamily:C.font }}>
            {shareMsg || `📤 ${t.share}`}
          </button>
          <button onClick={() => setOnboarded(false)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 12px", cursor:"pointer", color:C.textMuted, fontSize:12, fontFamily:C.font }}>
            ✏️ Edit Profile
          </button>
        </div>

        <div style={{ fontSize:9, letterSpacing:5, color:C.gold, textTransform:"uppercase", marginBottom:6 }}>🔥 FIRE Freedom Planner · v5</div>
        <h1 style={{ margin:"0 0 4px", fontSize:24, fontWeight:400, color:C.text }}>{t.appTitle}</h1>
        <div style={{ fontSize:12, color:C.textSec, marginBottom:16 }}>Age {age} · {euro(portfolio)} invested · {t.appSub}</div>

        {/* Spend mode + options */}
        <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginBottom:14 }}>
          {[["lean","🥗 Lean €900",C.cyan],["regular","⚖️ Regular €1,300",C.gold],["chubby","🍖 Chubby €2,200",C.orange],["fat","🥩 Fat €3,500",C.pink],["nomad","🌍 Nomad €700",C.teal]].map(([m,l,col]) =>
            <Tag key={m} on={spendMode===m} onClick={() => setSpendMode(m)} color={col}>{l}</Tag>
          )}
          <Tag on={inflation} onClick={() => setInflation(!inflation)} color={C.purple}>📉 Real</Tag>
          <Tag on={coupleMode} onClick={() => setCoupleMode(!coupleMode)} color={C.green}>👫 Couple</Tag>
          <Tag on={bonus13} onClick={() => setBonus13(!bonus13)} color={C.orange}>🎁 13th Pay</Tag>
          <Tag on={bonus14} onClick={() => setBonus14(!bonus14)} color={C.orange}>🎁 14th Pay</Tag>
          <Tag on={lifestyleCreep > 0} onClick={() => setLifestyleCreep(lifestyleCreep > 0 ? 0 : 2)} color={C.pink}>📈 Lifestyle Creep</Tag>
        </div>

        {/* Legacy mode */}
        <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginBottom:14 }}>
          {(["zero","legacy","grow"]).map(m => (
            <Tag key={m} on={legacyMode===m} onClick={() => setLegacyMode(m)} color={m==="zero"?C.cyan:m==="legacy"?C.purple:C.green}>
              {t.legacyMode[m]}
            </Tag>
          ))}
          {legacyMode !== "zero" && <span style={{ fontSize:11, color:C.textMuted, alignSelf:"center" }}>Using {legacyMult}× multiplier</span>}
        </div>

        {/* KPI strip */}
        <div style={{ display:"flex", gap:7, justifyContent:"center", flexWrap:"wrap" }}>
          {[
            { l:"FI Score", v:`${fiScore}/100`, c:fiScore>=65?C.green:fiScore>=35?C.gold:C.red },
            { l:"Coast FIRE", v:coastDone?"✅ Done":`${projForDates.find(r=>r.portfolio>=coastTarget)?.year||"2040+"}`, c:C.cyan },
            { l:"Barista FIRE", v:baristaYear?`${baristaYear}`:"Now!", c:C.green },
            { l:`${t.fireTypes[spendMode]?.name||"FIRE"}`, v:fireYear?`${fireYear}`:"2040+", c:C.gold, sub:inflation?"📉 real terms":null },
            { l:"FIRE Target", v:kilo(fireNum), c:C.textSec },
            { l:"Passive/day", v:`€${dailyPassive}`, c:C.green },
          ].map(k => (
            <div key={k.l} style={{ background:C.surface, border:`1px solid ${k.c}22`, borderRadius:10, padding:"8px 13px", textAlign:"center", minWidth:85 }}>
              <div style={{ fontSize:9, color:C.textMuted, letterSpacing:2, textTransform:"uppercase" }}>{k.l}</div>
              <div style={{ fontSize:14, fontWeight:700, color:k.c, marginTop:2 }}>{k.v}</div>
              {k.sub && <div style={{ fontSize:9, color:C.purple, marginTop:1 }}>{k.sub}</div>}
            </div>
          ))}
          {/* SV-Status Badge — zeigt Krankenversicherungskosten direkt im Header */}
          <div onClick={() => setTab("austria")}
            style={{ background:C.surface, border:`1px solid ${svMonthlyCost===0?C.green:C.orange}33`, borderRadius:10, padding:"8px 13px", textAlign:"center", minWidth:85, cursor:"pointer" }}
            title="SV-Status nach FIRE — klicken für Details">
            <div style={{ fontSize:9, color:C.textMuted, letterSpacing:2, textTransform:"uppercase" }}>KV-Status</div>
            <div style={{ fontSize:14, fontWeight:700, color:svMonthlyCost===0?C.green:C.orange, marginTop:2 }}>
              {{privatier:"🏖️ €495",geringfuegig:svOptIn19a?"☕ €73":"☕ €0",teilzeit:"⚡ €0",mitversichert:"👫 €0"}[svStatus]}
            </div>
            <div style={{ fontSize:9, color:C.textMuted, marginTop:1 }}>/mo SV</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ overflowX:"auto", background:C.surface, borderBottom:`1px solid ${C.border}`, display:"flex", padding:"0 4px" }}>
        {TABS_LIST.map(id => (
          <button key={id} onClick={() => setTab(id)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:C.font, color:tab===id?C.gold:C.textSec, borderBottom:`2px solid ${tab===id?C.gold:"transparent"}`, padding:"11px 12px", fontSize:11, fontWeight:tab===id?700:400, whiteSpace:"nowrap", transition:"all 0.15s" }}>
            {tabLabels[id] || id}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:940, margin:"0 auto", padding:"20px 14px 60px" }}>

        {/* ══ FIRE 101 ══════════════════════════════════════════════════ */}
        {tab === "learn" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🎓</div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:400, color:C.text }}>FIRE 101 — Everything You Need to Know</h2>
              <p style={{ color:C.textSec, fontSize:13, margin:"8px 0 0" }}>No jargon. Simple explanations. Start here.</p>
            </div>

            {/* FIRE types grid */}
            <Card title="The 8 Types of FIRE — Pick Your Flavour" accent={C.gold}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
                {Object.entries(t.fireTypes).map(([k,v]) => (
                  <div key={k} onClick={() => { setSpendMode(k in spendMap?k:"regular"); setTab("projection"); }}
                    style={{ background:C.surface, border:`1px solid ${v.color}33`, borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.2s" }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{v.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:v.color, marginBottom:5 }}>{v.name}</div>
                    <div style={{ fontSize:12, color:C.textSec, lineHeight:1.7 }}>{v.desc}</div>
                    {k === "barista" && <div style={{ fontSize:11, color:C.green, marginTop:6 }}>Your current scenario → ☕</div>}
                    {k === spendMode && <div style={{ fontSize:11, color:v.color, marginTop:6, fontWeight:700 }}>◀ Your current mode</div>}
                  </div>
                ))}
              </div>
            </Card>

            {/* Core concepts */}
            {[
              { emoji:"📐", title:"The 4% Rule", accent:C.blue, body:"Research (Trinity Study) shows that if you withdraw 4% of your portfolio per year, it will last 30+ years through almost any historical market. Your FIRE Number = Annual Spending × 25.\n\nExample: €1,300/month = €15,600/year → €15,600 × 25 = €390,000 needed.\n\nWith 'Die with Zero', we use ×20 (5% SWR). With 'Leave Legacy', we use ×30 (3.3% SWR).", highlight:`Current FIRE Number (${legacyMult}× multiplier): ${euro(fireNum)}` },
              { emoji:"📈", title:"Compound Interest — The 8th Wonder", accent:C.green, body:"Your returns earn returns. €10,000 at 7%/year becomes €20,000 in ~10 years — without adding anything. By year 20 it's €40,000. By year 30, €76,000. This is why starting early is the most powerful thing you can do.", highlight:`At ${(annualReturn*100).toFixed(1)}% return, your €${(portfolio/1000).toFixed(0)}k earns €${dailyPassive}/day automatically` },
              { emoji:"⚡", title:"Sequence of Returns Risk", accent:C.red, body:"The order of market returns matters as much as the average. A crash in your first year of retirement is much worse than a crash in year 20. Why? Because you're selling investments at low prices to cover living costs.\n\nAntidote: (1) Keep 2 years of cash, (2) Barista FIRE lets you avoid selling in crashes, (3) flexible spending.", highlight:"Same average return, different order = wildly different outcomes. See the Withdrawal tab." },
              { emoji:"🏖️", title:"Coast FIRE — The Hidden Milestone", accent:C.cyan, body:`Coast FIRE means you've invested enough that compound growth alone will reach your FIRE number by retirement age — even if you never invest another cent.\n\nYour Coast FIRE target at age ${age}: ${euro(coastTarget)} (so it grows to ${euro(fireNum)} by age 65).\n\n${portfolio >= coastTarget ? "🎉 You've already hit Coast FIRE! You could stop saving entirely and still reach retirement security." : `You're ${euro(coastTarget - portfolio)} away from Coast FIRE.`}`, highlight:coastDone?`✅ Coast FIRE achieved! You can stop investing and still retire at 65.`:`Coast FIRE target: ${euro(coastTarget)}` },
            ].map((item, i) => (
              <Card key={i} title={`${item.emoji}  ${item.title}`} accent={item.accent}>
                <p style={{ fontSize:13, color:C.textSec, lineHeight:1.9, margin:"0 0 12px", whiteSpace:"pre-line" }}>{item.body}</p>
                <InfoBox color={item.accent}><strong>{item.highlight}</strong></InfoBox>
              </Card>
            ))}

            <InfoBox color={C.green}>
              🚀 <strong>You're already on the path.</strong> Your FI Score is {fiScore}/100. {portfolio >= coastTarget ? "Coast FIRE is already achieved!" : `You're ${pct(portfolio,coastTarget).toFixed(0)}% of the way to Coast FIRE.`} Head to the Overview tab to see your full picture.
            </InfoBox>
          </div>
        )}

        {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div>
            {/* Controls */}
            <Card title="Your Parameters" accent={C.textSec}>
              <G2>
                <div>
                  <Slider label="Monthly savings" value={monthlySavings} min={0} max={5000} step={50} onChange={setMonthlySavings} format={v=>`€${v}/mo`} />
                  <Slider label="Current portfolio" value={portfolio} min={0} max={2000000} step={1000} onChange={setPortfolio} format={v=>kilo(v)} />
                  <Slider label="Your age" value={age} min={18} max={65} step={1} onChange={setAge} format={v=>`${v} years old`} color={C.purple} />
                </div>
                <div>
                  <Slider label="Expected annual return" value={annualReturn} min={0.03} max={0.12} step={0.005} onChange={setAnnualReturn} format={v=>`${(v*100).toFixed(1)}%`} hint="VWCE/MSCI World historically ~7–9% nominal" />
                  <Slider label="Annual side income (plasma, bonus etc.)" value={sideIncome} min={0} max={10000} step={100} onChange={setSideIncome} format={v=>`€${v}/yr`} color={C.red} />
                  {lifestyleCreep > 0 && (
                    <Slider label="Lifestyle creep — annual spending growth" value={lifestyleCreep} min={0.5} max={5} step={0.5} onChange={setLifestyleCreep} format={v=>`+${v}%/yr`} color={C.pink} hint="Your spending increases by this % every year during accumulation (career progression, family, etc.)" />
                  )}
                  {(bonus13 || bonus14) && (
                    <div style={{ background:C.orange+"10", border:`1px solid ${C.orange}33`, borderRadius:10, padding:"10px 14px", fontSize:11, color:"#fb923c", lineHeight:1.7 }}>
                      🎁 <strong>Austrian special payments:</strong>{" "}
                      {bonus13 && bonus14 ? "Both 13th (Weihnachtsgeld) and 14th (Urlaubsgeld) pay included." : bonus13 ? "13th pay (Weihnachtsgeld) included." : "14th pay (Urlaubsgeld) included."}{" "}
                      Each adds ~{euro(Math.round(monthlySavings * 0.92))} extra savings/year (at 6% flat tax rate on first €2,100).
                      Total bonus savings: <strong>{euro(bonusAnnual)}/yr</strong>.
                    </div>
                  )}
                </div>
              </G2>
            </Card>

            <Card title="FI Score" accent={C.gold} titleRight={<Tip>Combines portfolio progress (50pts), savings rate (20pts), and timeline efficiency (20pts). 100 = you're done!</Tip>}>
              <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
                <div style={{ textAlign:"center", minWidth:100 }}>
                  <div style={{ fontSize:56, fontWeight:700, color:fiScore>=65?C.green:fiScore>=35?C.gold:C.red, fontFamily:C.mono, lineHeight:1 }}>{fiScore}</div>
                  <div style={{ fontSize:12, color:C.textSec, marginTop:4 }}>/ 100</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{fiScore>=65?"🔥 Strong":fiScore>=35?"⚡ On Track":"🌱 Building"}</div>
                </div>
                <div style={{ flex:1, minWidth:180 }}>
                  {[
                    { l:"Portfolio Progress", v:pct(portfolio,fireNum)*0.5, max:50, c:C.gold },
                    { l:"Savings Rate", v:Math.min(20,(monthlySavings/spending)*20), max:20, c:C.blue },
                    { l:"Timeline Efficiency", v:fireYear?Math.max(0,20-Math.max(0,fireYear-(currentYear+9))*2):0, max:20, c:C.green },
                    { l:"Bonus Points", v:Math.min(10,(sideIncome>0?5:0)+(bonus13?5:0)), max:10, c:C.orange },
                  ].map(s => (
                    <div key={s.l} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:11, color:C.textSec }}>{s.l}</span>
                        <span style={{ fontSize:11, color:s.c, fontFamily:C.mono }}>{s.v.toFixed(1)}/{s.max}</span>
                      </div>
                      <ProgressBar v={s.v} max={s.max} color={s.c} h={5} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Your Money Works While You Sleep" accent={C.green}>
              <G3>
                <Box label="Per Year" value={kilo(Math.round(portfolio*annualReturn))} sub="passive income" color={C.green} />
                <Box label="Per Month" value={euro(Math.round(portfolio*annualReturn/12))} sub="from market" color={C.green} />
                <Box label="Per Day" value={`€${dailyPassive}`} sub="non-stop" color={C.cyanLight} />
                <Box label="Per Hour" value={`€${((portfolio*annualReturn)/8760).toFixed(2)}`} sub="even sleeping" color={C.cyanLight} />
                <Box label="Coverage" value={`${Math.round((portfolio*annualReturn/12)/spending*100)}%`} sub="of monthly costs" color={C.gold} />
                <Box label="Full FIRE daily" value={`€${Math.round(fireNum*annualReturn/365)}`} sub="at target" color={C.purple} />
              </G3>
            </Card>

            <Card title="Milestones" accent={C.purple}>
              {milestones.map(m => (
                <div key={m.label} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:m.done?m.color:C.text }}>{m.emoji} {m.label} — {euro(m.target)}</span>
                    <span style={{ fontSize:12, color:m.done?C.green:C.gold, fontFamily:C.mono }}>{m.done?"✅ Done":projForDates.find(r=>r.portfolio>=m.target)?.year||"2040+"}</span>
                  </div>
                  <ProgressBar v={portfolio} max={m.target} color={m.done?C.green:m.color} h={5} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ══ PROJECTION ════════════════════════════════════════════════ */}
        {tab === "projection" && (
          <div>
            {/* Sub-tab bar */}
            <div style={{ display:"flex", gap:4, marginBottom:18, background:C.surface, borderRadius:12, padding:4 }}>
              {[["forecast","📈 Forecast"],["crisis","🧨 Crisis Stress Test"]].map(([id,lbl]) => (
                <button key={id} onClick={() => setProjSubTab(id)}
                  style={{ flex:1, background:projSubTab===id?C.card:"transparent", border:`1px solid ${projSubTab===id?C.border:"transparent"}`, borderRadius:9, padding:"9px 6px", cursor:"pointer", color:projSubTab===id?C.text:C.textSec, fontSize:12, fontWeight:projSubTab===id?700:400, fontFamily:C.font, transition:"all 0.15s" }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* ── FORECAST sub-tab ──────────────────────────────────────── */}
            {projSubTab === "forecast" && (<div>
            {/* Part-time switch controls */}
            <Card title="Part-Time Switch Modeller" accent={C.teal} titleRight={<Tip>Enable this to model switching from full-time to part-time at a specific year. See exactly how it impacts your FIRE timeline.</Tip>}>
              <div style={{ marginBottom:12 }}>
                <Tag on={switchEnabled} onClick={() => setSwitchEnabled(!switchEnabled)} color={C.teal}>⚡ Enable Part-Time Switch</Tag>
              </div>
              {switchEnabled && (
                <G2>
                  <div>
                    <Slider label="Switch to part-time in year" value={switchYear} min={currentYear+1} max={currentYear+25} step={1} onChange={setSwitchYear} format={v=>`${v} (age ${v-currentYear+age})`} color={C.teal} />
                    <Slider label="Part-time income after switch" value={partTimeIncome} min={0} max={3000} step={50} onChange={setPartTimeIncome} format={v=>`€${v}/mo`} color={C.teal} hint="Your take-home income in part-time work" />
                  </div>
                  <div>
                    <Box small label="Part-time savings/mo" value={`€${partTimeSavings}`} sub="after basic expenses" color={C.teal} />
                    <div style={{ marginTop:10 }}>
                      {partTimeSavings <= 0
                        ? <InfoBox color={C.orange}>⚠️ At €{partTimeIncome}/mo income and {spendMode} spending (€{spending}/mo), you'd be drawing from your portfolio instead of adding to it. Consider a higher part-time income.</InfoBox>
                        : <InfoBox color={C.teal}>✅ At €{partTimeIncome}/mo income vs your {spendMode} spending (€{spending}/mo), you'd still save €{partTimeSavings}/mo.</InfoBox>}
                    </div>
                  </div>
                </G2>
              )}
            </Card>

            {switchEnabled && (
              <Card title="Full-Time vs Part-Time Switch — Portfolio Comparison" accent={C.teal}>
                <div style={{ fontSize:12, color:C.textMuted, marginBottom:12 }}>
                  Switch year: <span style={{ color:C.teal }}>{switchYear}</span> · Part-time income: <span style={{ color:C.teal }}>€{partTimeIncome}/mo</span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={partTimeCompare} margin={{ left:0, right:10 }}>
                    <defs>
                      <linearGradient id="gft" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={.2}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
                      <linearGradient id="gpt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.teal} stopOpacity={.2}/><stop offset="95%" stopColor={C.teal} stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={54} />
                    <Tooltip content={<CT/>} />
                    <ReferenceLine x={switchYear} stroke={C.teal} strokeDasharray="5 3" label={{value:"Switch",fill:C.teal,fontSize:10}} />
                    <ReferenceLine y={fireNum} stroke={C.gold+"55"} strokeDasharray="4 3" label={{value:"FIRE",fill:C.gold,fontSize:10,position:"insideTopRight"}} />
                    <Area type="monotone" dataKey="Full Time" stroke={C.blue} strokeWidth={2} fill="url(#gft)" dot={false} />
                    <Area type="monotone" dataKey="With Part-Time Switch" stroke={C.teal} strokeWidth={2} fill="url(#gpt)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <InfoBox color={C.teal} style={{ marginTop:12 }}>
                  💡 The gap between lines shows the trade-off: earlier freedom now vs. more money later. Neither is wrong — it depends on your values.
                </InfoBox>
              </Card>
            )}

            <Card title="Portfolio Growth Projection" accent={C.gold} titleRight={<Tip>Your projected portfolio value assuming {(annualReturn*100).toFixed(1)}% annual return. Dashed lines = your milestone targets. Green shaded zone = Barista Phase (work optional → full freedom).</Tip>}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={realProj.slice(0,30)} margin={{ left:0, right:10 }}>
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gold} stopOpacity={.25}/><stop offset="95%" stopColor={C.gold} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={54} />
                  <Tooltip content={<CT/>} />
                  {/* ☕ Barista Phase: shaded area between Barista target and Full FIRE target */}
                  {baristaTarget > 0 && fireNum > baristaTarget && (
                    <ReferenceArea y1={baristaTarget} y2={fireNum} fill={C.coffeeGreen} fillOpacity={0.10} />
                  )}
                  {baristaTarget>0 && <ReferenceLine y={baristaTarget} stroke={C.coffeeGreen} strokeDasharray="5 3" label={{value:"☕ Barista",fill:C.coffeeGreen,fontSize:10,position:"insideTopRight"}} />}
                  <ReferenceLine y={fireNum} stroke={C.gold} strokeDasharray="5 3" label={{value:"🎯 FIRE",fill:C.gold,fontSize:10,position:"insideTopRight"}} />
                  {!coastDone && <ReferenceLine y={coastTarget} stroke={C.cyan} strokeDasharray="5 3" label={{value:"Coast",fill:C.cyan,fontSize:10,position:"insideTopRight"}} />}
                  {switchEnabled && <ReferenceLine x={switchYear} stroke={C.teal} strokeDasharray="4 2" label={{value:"→ PT",fill:C.teal,fontSize:10}} />}
                  <Area type="monotone" dataKey="portfolio" stroke={C.gold} strokeWidth={2.5} fill="url(#ga)" dot={false} name="Portfolio" />
                </AreaChart>
              </ResponsiveContainer>
              {baristaYear && fireYear && baristaYear < fireYear && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, background:C.coffeeGreen+"15", border:`1px solid ${C.coffeeGreen}33`, borderRadius:8, padding:"8px 14px" }}>
                  <div style={{ width:12, height:12, borderRadius:2, background:C.coffeeGreen, opacity:0.6 }} />
                  <span style={{ fontSize:11, color:C.coffeeLight }}>
                    <strong>☕ Barista Phase</strong> · {baristaYear}–{fireYear} ({fireYear-baristaYear} yrs) · Work optional, portfolio covers {euro(Math.round(baristaGap))}+ /mo gap
                  </span>
                </div>
              )}
            </Card>

            <Card title="Monte Carlo — 300 Random Futures" accent={C.purple} titleRight={<Tip>Runs 300 simulations with random market returns each year. Shows how wide the range of outcomes is. The gold median is your most likely path.</Tip>}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mcData} margin={{ left:0, right:10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={54} />
                  <Tooltip content={<CT/>} />
                  <ReferenceLine y={fireNum} stroke={C.gold+"55"} strokeDasharray="4 3" />
                  <Line dataKey="p90" stroke={C.green} strokeWidth={1} dot={false} name="Top 10%" strokeDasharray="3 2" />
                  <Line dataKey="p75" stroke={C.green} strokeWidth={1.5} dot={false} name="Top 25%" />
                  <Line dataKey="p50" stroke={C.gold} strokeWidth={2.5} dot={false} name="Median" />
                  <Line dataKey="p25" stroke={C.orange} strokeWidth={1.5} dot={false} name="Bottom 25%" />
                  <Line dataKey="p10" stroke={C.red} strokeWidth={1} dot={false} name="Bottom 10%" strokeDasharray="3 2" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Your Savings vs Market Growth" accent={C.green}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={breakdown.slice(0,20)} margin={{ left:0, right:10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={54} />
                  <Tooltip content={<CT/>} />
                  <Bar dataKey="contributions" stackId="a" fill={C.blue} name="Your Savings" />
                  <Bar dataKey="growth" stackId="a" fill={C.green} name="Market Growth" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            </div>)} {/* end forecast sub-tab */}

            {/* ── CRISIS STRESS TEST sub-tab ────────────────────────────── */}
            {projSubTab === "crisis" && (<div>
              <InfoBox color={C.red}>
                🧨 <strong>Stress Test:</strong> This simulation starts your withdrawal at your FIRE number ({kilo(fireNum)}) and applies a real historical market crash at the year you choose. See if your Safe Withdrawal Rate survives the Sequence of Returns Risk.
              </InfoBox>

              <Card title="Choose Your Crisis" accent={C.red} style={{ marginTop:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:8, marginBottom:16 }}>
                  {Object.entries(CRISIS_SCENARIOS).map(([key, sc]) => (
                    <button key={key} onClick={() => setCrisisScenario(key)}
                      style={{ background:crisisScenario===key?sc.color+"1a":C.surface, border:`2px solid ${crisisScenario===key?sc.color:C.border}`, borderRadius:12, padding:"12px 14px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                      <div style={{ fontSize:22, marginBottom:4 }}>{sc.emoji}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:crisisScenario===key?sc.color:C.text, marginBottom:4 }}>{sc.name}</div>
                      <div style={{ fontSize:10, color:C.textMuted, lineHeight:1.5 }}>{sc.desc}</div>
                    </button>
                  ))}
                </div>
                <Slider label="Crisis hits in year" value={crisisTriggerYear} min={currentYear} max={currentYear+10} step={1}
                  onChange={setCrisisTriggerYear} format={v=>`${v} (year ${v-currentYear+1} of retirement)`} color={C.red}
                  hint="Earlier = worse. A crash in Year 1 is much more dangerous than Year 10." />
                <G3>
                  <Box small label="Crisis starts" value={`Year ${crisisTriggerYear-currentYear+1}`} sub="of retirement" color={C.red} />
                  <Box small label="Scenario" value={CRISIS_SCENARIOS[crisisScenario].emoji} sub={CRISIS_SCENARIOS[crisisScenario].name} color={CRISIS_SCENARIOS[crisisScenario].color} />
                  <Box small label="Portfolio survives?" value={crisisData.ruined < 0 ? "✅ Yes" : `❌ Fails yr ${crisisData.ruined+1}`} sub={crisisData.ruined < 0 ? "to 30 years" : "portfolio hits €0"} color={crisisData.ruined < 0 ? C.green : C.red} />
                </G3>
              </Card>

              <Card title={`📉 ${CRISIS_SCENARIOS[crisisScenario].name} — Portfolio Survival`} accent={CRISIS_SCENARIOS[crisisScenario].color}>
                <div style={{ fontSize:12, color:C.textMuted, marginBottom:12 }}>
                  Starting portfolio: <strong style={{ color:C.gold }}>{kilo(fireNum)}</strong> · Monthly withdrawal: <strong style={{ color:C.gold }}>{euro(spending)}/mo</strong> · Crisis trigger: <strong style={{ color:CRISIS_SCENARIOS[crisisScenario].color }}>{crisisTriggerYear}</strong>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={crisisData.rows} margin={{ left:0, right:10 }}>
                    <defs>
                      <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={.2}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                      <linearGradient id="crisisGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CRISIS_SCENARIOS[crisisScenario].color} stopOpacity={.25}/><stop offset="95%" stopColor={CRISIS_SCENARIOS[crisisScenario].color} stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={56} />
                    <Tooltip content={<CT/>} />
                    <ReferenceLine x={crisisTriggerYear} stroke={CRISIS_SCENARIOS[crisisScenario].color} strokeDasharray="5 3" label={{value:"💥 Crisis hits",fill:CRISIS_SCENARIOS[crisisScenario].color,fontSize:10}} />
                    <ReferenceLine y={0} stroke={C.red} strokeWidth={2} />
                    <Area type="monotone" dataKey="Baseline" stroke={C.green} strokeWidth={2} fill="url(#baseGrad)" dot={false} strokeDasharray="5 3" />
                    <Area type="monotone" dataKey={CRISIS_SCENARIOS[crisisScenario].name} stroke={CRISIS_SCENARIOS[crisisScenario].color} strokeWidth={2.5} fill="url(#crisisGrad)" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
                <InfoBox color={crisisData.ruined < 0 ? C.green : C.red} style={{ marginTop:12 }}>
                  {crisisData.ruined < 0
                    ? `✅ Your plan SURVIVES the ${CRISIS_SCENARIOS[crisisScenario].name} scenario even with the crisis hitting in ${crisisTriggerYear}. Your ${(spending/fireNum*100*12).toFixed(1)}% SWR is resilient enough. Try triggering it earlier (Year 1 or 2) to find your breaking point.`
                    : `❌ Your plan FAILS in year ${crisisData.ruined + 1} of retirement (${currentYear + crisisData.ruined}). Your portfolio hits €0. Mitigation strategies: (1) Barista FIRE — work part-time during crash years, (2) Cut spending 15–20% during crisis, (3) Keep 2 years of cash as a buffer, (4) Delay FIRE by 1–2 years to build a bigger cushion.`}
                </InfoBox>
              </Card>

              <Card title="🛡️ How to Survive Any Crisis — Mitigation Checklist" accent={C.gold}>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { icon:"💵", title:"2-Year Cash Buffer", desc:`Keep ${euro(spending*24)} (2 years of expenses) in cash/money market. Never sell ETFs during a crash — let the cash carry you.`, impact:"★★★★★ Most important" },
                    { icon:"☕", title:"Barista FIRE as a Backstop", desc:`If portfolio drops 20%+, earn €${Math.round(spending*0.5)}/mo part-time. This alone halves your withdrawal rate.`, impact:"★★★★☆ Very effective" },
                    { icon:"📉", title:"Dynamic Spending (GK Guardrails)", desc:"Cut discretionary spending 10% when your withdrawal rate breaches 6%. Ratchet back up when markets recover.", impact:"★★★★☆ Proven method" },
                    { icon:"🌍", title:"Geo-Arbitrage Escape Valve", desc:`Temporarily relocate to a lower-cost country. €${spending}€/mo in Vienna → the same lifestyle for €${Math.round(spending*0.55)}/mo in South East Asia.`, impact:"★★★☆☆ Flexible option" },
                    { icon:"🎯", title:"Bigger Portfolio (OMY)", desc:`Working just ${fireYear && currentYear < fireYear ? "1–2 more years" : "a bit longer"} builds a larger cushion and shifts the crisis recovery ratio. See FIRE Calc → OMY Tool.`, impact:"★★★☆☆ Diminishing returns" },
                  ].map(m => (
                    <div key={m.title} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
                      <div style={{ fontSize:22, flexShrink:0 }}>{m.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{m.title}</span>
                          <span style={{ fontSize:10, color:C.gold }}>{m.impact}</span>
                        </div>
                        <div style={{ fontSize:12, color:C.textSec, lineHeight:1.7 }}>{m.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>)} {/* end crisis sub-tab */}
          </div>
        )}

        {/* ══ FIRE CALC ════════════════════════════════════════════════ */}
        {tab === "fireCalc" && (
          <div>
            <Card title="FIRE Number Calculator" accent={C.gold} titleRight={<Tip>Your FIRE Number depends on spending AND the multiplier. 'Die with Zero' = ×20 (5% withdrawal). 'Leave Legacy' = ×30 (3.3%). Classic = ×25 (4%).</Tip>}>
              <G2>
                <div>
                  <Slider label="Monthly spending target" value={spending} min={500} max={8000} step={100} onChange={() => {}} format={v=>`€${v}/mo`} hint="Use the Budget tab to calculate your real number" />
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                    {[["zero","Die with Zero","×20",5,C.cyan],["grow","Classic 4%","×25",4,C.gold],["legacy","Leave Legacy","×30",3.3,C.purple]].map(([m,l,x,swrVal,c]) => (
                      <button key={l} onClick={() => { setLegacyMode(m); setSwr(swrVal); }}
                        style={{ background:legacyMode===m?c+"1a":C.surface, border:`1px solid ${legacyMode===m?c:c+"44"}`, borderRadius:10, padding:"10px 14px", cursor:"pointer", textAlign:"center", color:legacyMode===m?c:C.textSec, fontSize:12 }}>
                        <div style={{ fontSize:16, color:c }}>{x}</div>
                        <div>{l}</div>
                        <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>SWR: {swrVal}%</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <G3>
                    <Box small label="FIRE Number" value={kilo(fireNum)} sub={`×${legacyMult.toFixed(1)} (${swr}% SWR)`} color={C.gold} />
                    <Box small label="Monthly passive" value={euro(Math.round(fireNum*annualReturn/12))} sub="at target" color={C.green} />
                    <Box small label="FIRE Year" value={fireYear||"2040+"} sub={fireYear?`age ${fireYear-currentYear+age}`:""} color={C.gold} />
                    <Box small label="Progress" value={`${pct(portfolio,fireNum).toFixed(1)}%`} sub="of the way there" color={C.purple} />
                  </G3>
                </div>
              </G2>
            </Card>

            <Card title="☕ Barista FIRE" accent={C.coffeeGreen} titleRight={<Tip>Part-time income + portfolio withdrawal = full monthly coverage. Dynamic target: (Spending − Barista Income) × 12 × (100/SWR).</Tip>}>
              {/* Controls */}
              <G2>
                <div>
                  <Slider label="Part-time monthly income" value={baristaIncome} min={0} max={2000} step={50} onChange={setBaristaIncome} format={v=>`€${v}/mo`} color={C.coffeeGreen} />
                  <Slider label="Hourly wage (for work-hours calc)" value={baristaHourlyWage} min={5} max={50} step={1} onChange={setBaristaHourlyWage} format={v=>`€${v}/hr`} color={C.coffeeLight} hint="Used to calculate how many hours/week you need to sustain Barista FIRE" />
                </div>
                <G3>
                  <Box small label="Portfolio gap/mo" value={baristaGap<=0?"€0 🎉":euro(baristaGap)} sub="portfolio must cover" color={baristaGap<=0?C.coffeeGreen:C.gold} />
                  <Box small label="Barista target" value={baristaTarget<=0?"Done!":kilo(baristaTarget)} sub={`×${legacyMult.toFixed(1)} (${swr}% SWR)`} color={C.coffeeGreen} />
                  <Box small label="Barista year" value={baristaTarget<=0?"Now 🎉":baristaYear?`${baristaYear}`:"2040+"} color={C.cyanLight} />
                  <Box small label="vs Full FIRE" value={baristaTarget>0&&fireYear&&baristaYear?`${fireYear-baristaYear} yrs earlier`:"—"} sub="time saved" color={C.coffeeGreen} />
                </G3>
              </G2>

              {/* Work-Life Calculator */}
              <div style={{ background:`linear-gradient(135deg,${C.coffeeGreen}18,${C.coffeeDark}10)`, border:`1px solid ${C.coffeeGreen}44`, borderRadius:14, padding:"16px 18px", marginTop:14 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:C.coffeeLight, textTransform:"uppercase", marginBottom:12 }}>☕ Barista Work-Life Calculator</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:14 }}>
                  <div style={{ background:C.surface, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1, marginBottom:4 }}>HRS/WEEK NEEDED</div>
                    <div style={{ fontSize:30, fontWeight:700, color:C.coffeeGreen, fontFamily:C.mono, lineHeight:1 }}>{baristaHoursPerWeek}</div>
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>hrs/wk at €{baristaHourlyWage}/hr</div>
                    <div style={{ fontSize:10, color:C.coffeeLight, marginTop:3 }}>vs 40 hrs full-time</div>
                  </div>
                  <div style={{ background:C.surface, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1, marginBottom:4 }}>FREE TIME</div>
                    <div style={{ fontSize:30, fontWeight:700, color:C.coffeeLight, fontFamily:C.mono, lineHeight:1 }}>{Math.max(0,40-baristaHoursPerWeek)}</div>
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>hrs/wk recovered</div>
                    <div style={{ fontSize:10, color:C.coffeeGreen, marginTop:3 }}>{((Math.max(0,40-baristaHoursPerWeek)/40)*100).toFixed(0)}% of full-time</div>
                  </div>
                  <div style={{ background:C.surface, borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1, marginBottom:4 }}>MONTHLY INCOME</div>
                    <div style={{ fontSize:30, fontWeight:700, color:C.gold, fontFamily:C.mono, lineHeight:1 }}>€{Math.round(baristaHourlyWage*baristaHoursPerWeek*52/12)}</div>
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>/month gross</div>
                    <div style={{ fontSize:10, color:C.textMuted, marginTop:3 }}>≈ target €{baristaIncome}</div>
                  </div>
                </div>

                {/* ── Monthly Budget Thermometer / Coverage ── */}
                <div style={{ fontSize:11, fontWeight:700, color:C.coffeeLight, marginBottom:8 }}>Monthly Budget Coverage Breakdown</div>
                <div style={{ background:C.card, borderRadius:10, padding:"14px", marginBottom:10 }}>
                  {(() => {
                    const portfolioCovers = baristaGap;
                    const workCovers = baristaIncome;
                    const total = spending;
                    const workPct = total > 0 ? Math.round((workCovers/total)*100) : 0;
                    const portPct = total > 0 ? Math.round((portfolioCovers/total)*100) : 0;
                    return (
                      <>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.textMuted, marginBottom:6 }}>
                          <span>🍵 Work income: <strong style={{ color:C.coffeeLight }}>€{workCovers}/mo ({workPct}%)</strong></span>
                          <span>💼 Portfolio: <strong style={{ color:C.coffeeGreen }}>€{portfolioCovers}/mo ({portPct}%)</strong></span>
                        </div>
                        {/* Thermometer bar */}
                        <div style={{ height:22, borderRadius:11, background:C.border, overflow:"hidden", display:"flex" }}>
                          <div style={{ width:`${workPct}%`, background:`linear-gradient(90deg,${C.coffeeDark},${C.coffeeLight})`, borderRadius:"11px 0 0 11px", transition:"width 0.4s", display:"flex", alignItems:"center", justifyContent:"center", minWidth:workPct>15?40:0 }}>
                            {workPct>15 && <span style={{ fontSize:9, fontWeight:700, color:"#fff" }}>🍵 Work</span>}
                          </div>
                          <div style={{ width:`${portPct}%`, background:`linear-gradient(90deg,${C.coffeeGreen},${C.green})`, transition:"width 0.4s", display:"flex", alignItems:"center", justifyContent:"center", minWidth:portPct>15?40:0 }}>
                            {portPct>15 && <span style={{ fontSize:9, fontWeight:700, color:"#fff" }}>💼 Portfolio</span>}
                          </div>
                        </div>
                        <div style={{ fontSize:11, color:C.textMuted, textAlign:"center", marginTop:6 }}>Total covered: {euro(total)}/mo</div>
                      </>
                    );
                  })()}
                </div>

                <InfoBox color={C.coffeeGreen}>
                  ☕ <strong>The Barista FIRE advantage:</strong> Instead of needing {kilo(fireNum)}, you only need {kilo(baristaTarget)} — a saving of {kilo(fireNum - baristaTarget)}. Working just {baristaHoursPerWeek} hrs/week at €{baristaHourlyWage}/hr gives you {Math.max(0,40-baristaHoursPerWeek)} hours of freedom per week while keeping finances fully sustainable.
                </InfoBox>
              </div>
            </Card>

            <Card title="FIRE Number Sensitivity Table" accent={C.blue}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead><tr style={{ background:C.surface }}>
                    <th style={{ padding:"8px 12px", textAlign:"left", color:C.textMuted, fontSize:10, textTransform:"uppercase" }}>Monthly Spend</th>
                    {[3,3.5,4,4.5,5].map(r => <th key={r} style={{ padding:"8px 12px", textAlign:"right", color:r===swr?C.gold:C.textMuted, fontSize:10, textTransform:"uppercase" }}>{r}%{r===4?" ★":""}</th>)}
                  </tr></thead>
                  <tbody>
                    {[500,700,900,1100,1300,1500,2000,2500,3000,4000].map(sp => {
                      const active = sp === spending;
                      return (
                        <tr key={sp} style={{ background:active?C.gold+"08":"transparent", borderLeft:`3px solid ${active?C.gold:"transparent"}` }}>
                          <td style={{ padding:"8px 12px", color:active?C.gold:C.textSec, fontWeight:active?700:400, fontFamily:C.mono }}>€{sp}/mo{active?" ◀":""}</td>
                          {[3,3.5,4,4.5,5].map(rate => <td key={rate} style={{ padding:"8px 12px", textAlign:"right", color:rate===4?C.text:C.textSec, fontFamily:C.mono }}>{kilo(Math.round(sp*12*(100/rate)))}</td>)}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ── OMY Syndrome Tool ── */}
            <Card title="⏳ One More Year (OMY) Syndrome Tool" accent={C.orange} titleRight={<Tip>OMY Syndrome: the irrational fear of retiring that makes you work "just one more year" forever. This tool shows the diminishing returns of each extra year — helping you see when enough is truly enough.</Tip>}>
              <InfoBox color={C.orange}>
                💭 <strong>One More Year Syndrome</strong> is one of the biggest FIRE traps. Each extra year of work feels like it makes you "safer" — but the marginal benefit drops sharply after the first 1–2 years. This tool quantifies exactly what each extra year buys you.
              </InfoBox>
              <div style={{ marginTop:14, overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead><tr style={{ background:C.surface }}>
                    {["Extra Years","Portfolio at FIRE","40yr Fail Rate","Improvement","Marginal Gain","Verdict"].map(h => (
                      <th key={h} style={{ padding:"8px 10px", textAlign:"right", color:C.textMuted, fontSize:10, textTransform:"uppercase", letterSpacing:1 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {omyData.map((row, i) => {
                      const isBase = i === 0;
                      const dimRet = i >= 3; // diminishing returns kick in
                      return (
                        <tr key={i} style={{ background:isBase?C.gold+"08":dimRet?C.red+"05":"transparent", borderLeft:`3px solid ${isBase?C.gold:dimRet?C.orange:"transparent"}` }}>
                          <td style={{ padding:"8px 10px", color:isBase?C.gold:dimRet?C.orange:C.text, fontWeight:isBase?700:400 }}>{row.label}</td>
                          <td style={{ padding:"8px 10px", textAlign:"right", color:C.text, fontFamily:C.mono }}>{kilo(row.portfolio)}</td>
                          <td style={{ padding:"8px 10px", textAlign:"right", color:row.failRate40<=5?C.green:row.failRate40<=15?C.gold:C.red, fontFamily:C.mono, fontWeight:700 }}>{row.failRate40}%</td>
                          <td style={{ padding:"8px 10px", textAlign:"right", color:row.improvement>0?C.green:C.textMuted, fontFamily:C.mono }}>
                            {row.improvement > 0 ? `-${row.improvement.toFixed(0)}%` : "—"}
                          </td>
                          <td style={{ padding:"8px 10px", textAlign:"right", color:dimRet?C.red:row.marginalGain>3?C.green:C.gold, fontFamily:C.mono, fontSize:11 }}>
                            {i===0?"baseline":row.marginalGain.toFixed(1)+"% less risk"}
                          </td>
                          <td style={{ padding:"8px 10px", textAlign:"right" }}>
                            <span style={{ background:isBase?C.gold+"22":dimRet?C.red+"15":C.green+"15", color:isBase?C.gold:dimRet?C.orange:C.green, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>
                              {isBase?"🎯 FIRE!":(dimRet?"⚠️ Diminishing":"✅ Worth it")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop:14 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={omyData} margin={{ left:0, right:10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="label" tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={30} unit="%" />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<CT/>} />
                    <Bar yAxisId="right" dataKey="portfolio" fill={C.blue+"55"} name="Portfolio" radius={[3,3,0,0]} />
                    <Line yAxisId="left" dataKey="failRate40" stroke={C.red} strokeWidth={2.5} dot={{fill:C.red,r:4}} name="Fail Rate 40yr %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <InfoBox color={C.orange} style={{ marginTop:14 }}>
                📊 <strong>Key insight:</strong> The biggest risk reduction comes from Year 0→1 ({omyData[0]?.failRate40 - (omyData[1]?.failRate40||0)}% improvement). By Year {omyData.findIndex(r=>r.marginalGain < 1) || 4}, each extra year buys less than 1% additional safety. <strong>At some point, working more just trades your life for marginal statistics.</strong>
              </InfoBox>
            </Card>
          </div>
        )}

        {/* ══ COMPARE ═══════════════════════════════════════════════════ */}
        {tab === "compare" && (
          <div>
            <Card title="FIRE Type Timeline Comparison" accent={C.gold} titleRight={<Tip>See exactly when you'd reach each type of FIRE based on your current parameters. Adjust spending mode and savings to see the impact instantly.</Tip>}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead><tr style={{ background:C.surface }}>
                    {["FIRE Type","Monthly Spend","Target","Year","Age","Years Away","Status"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"right", color:C.textMuted, fontSize:10, letterSpacing:1, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {[
                      { key:"lean", spend:900, icon:"🥗", color:C.cyan },
                      { key:"barista", spend:null, icon:"☕", color:C.green, customTarget:baristaTarget },
                      { key:"coast", spend:null, icon:"🏖️", color:C.cyan, customTarget:coastTarget, customYear:projForDates.find(r=>r.portfolio>=coastTarget)?.year },
                      { key:"regular", spend:1300, icon:"⚖️", color:C.gold },
                      { key:"chubby", spend:2200, icon:"🍖", color:C.orange },
                      { key:"fat", spend:3500, icon:"🥩", color:C.pink },
                    ].map(row => {
                      const target = row.customTarget !== undefined ? row.customTarget : row.spend*12*legacyMult;
                      const yr = row.customYear || projForDates.find(r => r.portfolio >= target)?.year;
                      const done = portfolio >= target;
                      const yearsAway = yr ? yr - currentYear : null;
                      const ageAtFire = yr ? age + (yr - currentYear) : null;
                      return (
                        <tr key={row.key} style={{ background:done?row.color+"08":spendMode===row.key?C.gold+"05":"transparent", borderLeft:`3px solid ${done?row.color:spendMode===row.key?C.gold:"transparent"}` }}>
                          <td style={{ padding:"10px 14px", color:done?row.color:C.text, fontWeight:600 }}>{row.icon} {t.fireTypes[row.key]?.name || row.key}</td>
                          <td style={{ padding:"10px 14px", textAlign:"right", color:C.textSec, fontFamily:C.mono }}>{row.spend ? `€${row.spend}/mo` : "—"}</td>
                          <td style={{ padding:"10px 14px", textAlign:"right", color:row.color, fontFamily:C.mono, fontWeight:700 }}>{kilo(target)}</td>
                          <td style={{ padding:"10px 14px", textAlign:"right", color:done?C.green:C.text, fontFamily:C.mono }}>{done?"✅ Now!":yr||"2040+"}</td>
                          <td style={{ padding:"10px 14px", textAlign:"right", color:C.textSec, fontFamily:C.mono }}>{done?age:ageAtFire||"—"}</td>
                          <td style={{ padding:"10px 14px", textAlign:"right", color:done?C.green:C.gold, fontFamily:C.mono }}>{done?"Done":yearsAway?`${yearsAway} yrs`:"—"}</td>
                          <td style={{ padding:"10px 14px", textAlign:"right" }}>
                            <span style={{ background:done?C.green+"22":C.gold+"15", color:done?C.green:C.gold, borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700 }}>
                              {done?"✅ Done":pct(portfolio,target).toFixed(0)+"%"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Timeline Visual — When Do You Hit Each Target?" accent={C.purple}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={realProj.slice(0,30)} margin={{ left:0, right:10 }}>
                  <defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gold} stopOpacity={.2}/><stop offset="95%" stopColor={C.gold} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={54} />
                  <Tooltip content={<CT/>} />
                  <ReferenceLine y={coastTarget} stroke={C.cyan} strokeDasharray="4 2" label={{value:"🏖️ Coast",fill:C.cyan,fontSize:9,position:"insideTopRight"}} />
                  <ReferenceLine y={baristaTarget} stroke={C.green} strokeDasharray="4 2" label={{value:"☕ Barista",fill:C.green,fontSize:9,position:"insideTopRight"}} />
                  <ReferenceLine y={1300*12*legacyMult} stroke={C.gold} strokeDasharray="4 2" label={{value:"⚖️ Regular",fill:C.gold,fontSize:9,position:"insideTopRight"}} />
                  <ReferenceLine y={2200*12*legacyMult} stroke={C.orange} strokeDasharray="4 2" label={{value:"🍖 Chubby",fill:C.orange,fontSize:9,position:"insideTopRight"}} />
                  <Area type="monotone" dataKey="portfolio" stroke={C.gold} strokeWidth={2.5} fill="url(#gv)" dot={false} name="Portfolio" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Spending Mode Impact on FIRE Date" accent={C.blue}>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { key:"nomad", spend:700, icon:"🌍", color:C.teal },
                  { key:"lean", spend:900, icon:"🥗", color:C.cyan },
                  { key:"regular", spend:1300, icon:"⚖️", color:C.gold },
                  { key:"chubby", spend:2200, icon:"🍖", color:C.orange },
                  { key:"fat", spend:3500, icon:"🥩", color:C.pink },
                ].map(row => {
                  const target = row.spend*12*legacyMult;
                  const yr = projForDates.find(r => r.portfolio >= target)?.year;
                  const barW = yr ? Math.max(5, 100 - (yr-currentYear)*4) : 5;
                  return (
                    <div key={row.key} onClick={() => setSpendMode(row.key)} style={{ background:spendMode===row.key?row.color+"15":C.surface, border:`1px solid ${spendMode===row.key?row.color:C.border}`, borderRadius:12, padding:"14px 18px", cursor:"pointer" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:spendMode===row.key?row.color:C.text }}>{row.icon} {t.fireTypes[row.key]?.name} — €{row.spend}/mo</span>
                        <span style={{ fontSize:13, color:row.color, fontFamily:C.mono }}>{yr||"2040+"}{yr?` (age ${yr-currentYear+age})`:"+"}</span>
                      </div>
                      <ProgressBar v={barW} max={100} color={row.color} h={6} />
                      <div style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>Target: {kilo(target)} · {portfolio>=target?"✅ Already done":yr?`${yr-currentYear} years away`:"Beyond 30yr horizon"}</div>
                    </div>
                  );
                })}
              </div>
              <InfoBox color={C.blue} style={{ marginTop:14 }}>
                💡 <strong>Click any row to switch spending mode.</strong> Notice how dramatically Lean vs Fat FIRE changes the timeline — often 10+ years difference. Barista FIRE is often the sweet spot.
              </InfoBox>
            </Card>
          </div>
        )}

        {/* ══ WITHDRAWAL ════════════════════════════════════════════════ */}
        {tab === "withdrawal" && (
          <div>
            <Card title="Die with Zero vs Legacy Mode" accent={C.purple} titleRight={<Tip>Die with Zero: spend everything, maximize experiences. Leave a Legacy: keep growing to pass wealth on. Each changes your FIRE number and timeline.</Tip>}>
              <G2>
                <div>
                  {[
                    { key:"zero", icon:"🎯", title:"Die with Zero", mult:20, swrVal:5, swr:"5%", desc:"Spend it all. Optimise for experiences over wealth accumulation. Use dynamic withdrawal to adjust spending.", color:C.cyan },
                    { key:"grow", icon:"📈", title:"Classic 4% Rule", mult:25, swrVal:4, swr:"4%", desc:"The balanced approach. Portfolio survives indefinitely with very high probability. Standard FIRE recommendation.", color:C.gold },
                    { key:"legacy", icon:"🏛️", title:"Leave a Legacy", mult:30, swrVal:3.3, swr:"3.3%", desc:"Be conservative. Leave significant wealth to children or charity. Portfolio grows over time even in retirement.", color:C.purple },
                  ].map(m => (
                    <div key={m.key} onClick={() => { setLegacyMode(m.key); setSwr(m.swrVal); }}
                      style={{ background:legacyMode===m.key?m.color+"18":C.surface, border:`1px solid ${legacyMode===m.key?m.color:C.border}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", marginBottom:10 }}>
                      <div style={{ fontSize:22, marginBottom:6 }}>{m.icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:legacyMode===m.key?m.color:C.text, marginBottom:4 }}>{m.title}</div>
                      <div style={{ fontSize:11, color:C.textMuted, marginBottom:8 }}>{m.desc}</div>
                      <div style={{ display:"flex", gap:10 }}>
                        <span style={{ background:m.color+"22", color:m.color, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>×{m.mult}</span>
                        <span style={{ background:m.color+"15", color:m.color, borderRadius:6, padding:"2px 8px", fontSize:11 }}>SWR: {m.swr}</span>
                        <span style={{ background:C.surface, color:C.textSec, borderRadius:6, padding:"2px 8px", fontSize:11, fontFamily:C.mono }}>{kilo(spending*12*m.mult)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <G3>
                    <Box small label="Your FIRE number" value={kilo(fireNum)} sub={`${legacyMult}× multiplier`} color={C.gold} />
                    <Box small label="FIRE year" value={fireYear||"2040+"} sub={legacyMode==="zero"?"Spend it all":legacyMode==="legacy"?"Leave wealth":"Balance"} color={C.gold} />
                    <Box small label="Fail rate (40yr)" value={`${failRate(portfolio>0?portfolio:1,spending,40)}%`} sub="current portfolio" color={C.red} />
                    <Box small label="Fail rate at FIRE" value={`${failRate(fireNum,spending,40)}%`} sub="at target" color={C.green} />
                  </G3>
                  <div style={{ marginTop:12 }}>
                    <InfoBox color={legacyMode==="zero"?C.cyan:legacyMode==="legacy"?C.purple:C.gold}>
                      {legacyMode==="zero" && "🎯 Die with Zero: spend all your wealth on experiences. Use dynamic spending (spend more when markets are up, less in crashes). Research shows most retirees underspend — don't let that be you."}
                      {legacyMode==="grow" && "⚖️ Classic 4% rule: highly proven approach. ~90% historical success rate over 40 years. Your portfolio at death will likely still be significant."}
                      {legacyMode==="legacy" && "🏛️ Leave a Legacy: your portfolio grows in real terms during retirement. You'll leave substantial wealth to children, causes, or community."}
                    </InfoBox>
                  </div>
                </div>
              </G2>
            </Card>

            <Card title="Sequence of Returns Risk" accent={C.red}>
              <InfoBox color={C.red}>⚠️ Both scenarios below have the same average return (~7%) but completely different outcomes due to timing of returns.</InfoBox>
              <div style={{ height:12 }} />
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={seqData} margin={{ left:0, right:10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={54} />
                  <Tooltip content={<CT/>} />
                  <ReferenceLine y={0} stroke={C.red} strokeWidth={1.5} />
                  <Line dataKey="Lucky (Good Start)" stroke={C.green} strokeWidth={2.5} dot={false} />
                  <Line dataKey="Unlucky (Bad Start)" stroke={C.red} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Portfolio Failure Rates" accent={C.red}>
              <Slider label="SWR assumption" value={swr} min={3} max={5} step={0.1} onChange={setSwr} format={v=>`${v.toFixed(1)}%`} hint={`Multiplier: ×${(100/swr).toFixed(1)} · FIRE target: ${kilo(fireNum)}`} />
              <G2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[20,30,40,50].map(yrs => {
                    const fr = failRateFromSWR(swr, yrs);
                    const frSafe = showSafetyBuffer ? failRateFromSWR(Math.max(3, swr - (safetyExtra5hrsIncome * 12 / (fireNum||1) * 100)), yrs) : null;
                    return (
                      <div key={yrs} style={{ background:C.surface, border:`1px solid ${fr<=10?C.green:fr<=20?C.gold:C.red}33`, borderRadius:12, padding:"12px", textAlign:"center" }}>
                        <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1 }}>{yrs}-YEAR</div>
                        <div style={{ fontSize:28, fontWeight:700, color:fr<=10?C.green:fr<=20?C.gold:C.red, fontFamily:C.mono }}>{fr}%</div>
                        <div style={{ fontSize:11, color:C.textMuted }}>{fr<=5?"🟢 Safe":fr<=10?"🟡 OK":fr<=20?"🟠 Caution":"🔴 Risky"}</div>
                        {showSafetyBuffer && frSafe!==null && (
                          <div style={{ fontSize:10, color:C.coffeeGreen, marginTop:4, fontWeight:700 }}>+5h/wk → {frSafe}% ↓{fr-frSafe}%</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <InfoBox color={C.blue}>
                    💡 At full FIRE ({kilo(fireNum)}), withdrawing exactly <strong>{swr.toFixed(1)}%/yr</strong> = {euro(Math.round(fireNum*swr/100/12))}/mo. Historical failure rate over 40 years: <strong>{failRateFromSWR(swr,40)}%</strong>. That means ~{100-failRateFromSWR(swr,40)}% of historical scenarios succeed.<br/><br/>Dynamic spending (cut 20% in crash years) reduces this to near-zero.
                  </InfoBox>
                  <div style={{ marginTop:10, background:C.coffeeGreen+"15", border:`1px solid ${C.coffeeGreen}44`, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.coffeeLight }}>☕ Safety Valve Toggle</div>
                        <div style={{ fontSize:10, color:C.textMuted }}>Show effect of working +5 hrs/wk during a crash</div>
                      </div>
                      <div onClick={() => setShowSafetyBuffer(!showSafetyBuffer)}
                        style={{ background:showSafetyBuffer?C.coffeeGreen:C.border, borderRadius:20, padding:"4px 12px", cursor:"pointer", color:showSafetyBuffer?"#fff":C.textMuted, fontSize:12, fontWeight:700, minWidth:46, textAlign:"center", transition:"all 0.2s" }}>
                        {showSafetyBuffer?"ON":"OFF"}
                      </div>
                    </div>
                    {showSafetyBuffer && (
                      <div style={{ fontSize:11, color:C.textSec, lineHeight:1.7 }}>
                        At €{baristaHourlyWage}/hr · 5 extra hrs/wk = +{euro(Math.round(safetyExtra5hrsIncome))}/mo. This reduces your effective withdrawal, dropping failure risk in every horizon above. <strong>This is why Barista FIRE beats traditional FIRE on safety.</strong>
                      </div>
                    )}
                  </div>
                </div>
              </G2>
            </Card>

            {/* ── Guyton-Klinger Guardrails ── */}
            <Card title="🛡️ Guyton-Klinger Guardrails — Dynamic Spending" accent={C.teal}
              titleRight={<Tip>Instead of a rigid 4% withdrawal, Guyton-Klinger lets you spend MORE in good years and LESS in bad years. Two rules: Capital Preservation (if SWR breaches 6%, cut spending 10%) and Prosperity (if portfolio grew 20%+ and SWR is low, raise spending 10%). Floor and ceiling keep you safe.</Tip>}>
              <InfoBox color={C.teal}>
                💡 <strong>How it works:</strong> Your spending is <em>alive</em>. Markets up 20%? Treat yourself — spending rises 10%. Withdrawal rate dangerously high? Cut dining-out by 10%. The result: a far more resilient retirement that survives almost any historical sequence of returns.
              </InfoBox>
              <div style={{ marginTop:14 }}>
                <G2>
                  <div>
                    <Slider label="Spending floor (% of target)" value={gkFloor} min={60} max={95} step={5} onChange={setGkFloor} format={v=>`${v}% = ${euro(spending*v/100)}/mo`} color={C.red} hint="The minimum you're willing to live on — ever" />
                    <Slider label="Spending ceiling (% of target)" value={gkCeil} min={105} max={150} step={5} onChange={setGkCeil} format={v=>`${v}% = ${euro(spending*v/100)}/mo`} color={C.green} hint="The maximum you'll let yourself spend — the luxury cap" />
                  </div>
                  <G3>
                    <Box small label="Spending floor" value={euro(spending*gkFloor/100)} sub="/month minimum" color={C.red} />
                    <Box small label="Base spending" value={euro(spending)} sub="/month target" color={C.gold} />
                    <Box small label="Spending ceiling" value={euro(spending*gkCeil/100)} sub="/month maximum" color={C.green} />
                    <Box small label="vs Fixed SWR" value="Higher survival" sub="historically proven" color={C.teal} />
                  </G3>
                </G2>
              </div>

              {/* GK Chart: Portfolio + Spending Trajectory */}
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:11, color:C.textMuted, marginBottom:8 }}>Portfolio trajectory over 40 years — GK vs Fixed 4% (using a realistic historical return sequence)</div>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={gkData} margin={{ left:0, right:10 }}>
                    <defs>
                      <linearGradient id="gkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.teal} stopOpacity={.25}/><stop offset="95%" stopColor={C.teal} stopOpacity={0}/></linearGradient>
                      <linearGradient id="fixGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={.15}/><stop offset="95%" stopColor={C.red} stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="port" tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={56} />
                    <YAxis yAxisId="spend" orientation="right" tickFormatter={v=>`€${Math.round(v/100)*100}`} tick={{fill:C.textMuted,fontSize:9}} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<CT/>} />
                    <ReferenceLine yAxisId="port" y={0} stroke={C.red} strokeWidth={1.5} />
                    <Area yAxisId="port" type="monotone" dataKey="GK Portfolio" stroke={C.teal} strokeWidth={2.5} fill="url(#gkGrad)" dot={false} />
                    <Area yAxisId="port" type="monotone" dataKey="Fixed 4% Portfolio" stroke={C.red} strokeWidth={2} fill="url(#fixGrad)" dot={false} strokeDasharray="5 3" />
                    <Line yAxisId="spend" type="monotone" dataKey="GK Monthly Spend" stroke={C.gold} strokeWidth={1.5} dot={false} strokeDasharray="3 2" />
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:8, flexWrap:"wrap" }}>
                  {[{c:C.teal,l:"GK Portfolio"},{c:C.red,l:"Fixed 4% Portfolio (dashed)"},{c:C.gold,l:"GK Monthly Spend (right axis)"}].map(l=>(
                    <div key={l.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.textSec }}>
                      <div style={{ width:12, height:4, borderRadius:2, background:l.c }} />{l.l}
                    </div>
                  ))}
                </div>
              </div>
              <InfoBox color={C.teal} style={{ marginTop:14 }}>
                🛡️ <strong>Why Guardrails beat Fixed 4%:</strong> Historical research (Guyton & Klinger, 2006) shows that adding these two rules raises sustainable withdrawal rates to 5–6% while <em>reducing</em> failure rates. The key insight: a small spending adjustment of 10% in bad years prevents portfolio collapse — preserving 90%+ of your planned lifestyle.
              </InfoBox>
            </Card>
          </div>
        )}

        {/* ══ BUDGET ════════════════════════════════════════════════════ */}
        {tab === "budget" && (
          <div>
            <Card title="Monthly Expense Calculator" accent={C.blue} titleRight={<Tip>Enter your actual monthly expenses to calculate your real spending number. This feeds directly into your FIRE calculation.</Tip>}>
              <div style={{ marginBottom:16 }}>
                {budgetItems.map((item, i) => (
                  <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:18, width:28 }}>{item.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:C.text }}>{item.label}</div>
                      <div style={{ fontSize:10, color:C.textMuted }}>{item.cat}</div>
                    </div>
                    <input type="number" value={item.amount} min={0} step={10}
                      onChange={e => setBudgetItems(prev => prev.map((b,j) => j===i?{...b,amount:Number(e.target.value)}:b))}
                      style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 10px", color:C.text, fontSize:13, width:80, textAlign:"right", fontFamily:C.mono, outline:"none" }} />
                    <span style={{ fontSize:12, color:C.textMuted, width:20 }}>/mo</span>
                    <button onClick={() => setBudgetItems(prev => prev.filter((_,j) => j!==i))}
                      style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:14 }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Add item */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                <input placeholder="Category name" value={newBudget.label} onChange={e => setNewBudget({...newBudget,label:e.target.value})}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:12, flex:2, minWidth:130, fontFamily:C.font }} />
                <input type="number" placeholder="€/mo" value={newBudget.amount} onChange={e => setNewBudget({...newBudget,amount:Number(e.target.value)})}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", color:C.text, fontSize:12, width:80, fontFamily:C.mono }} />
                <button onClick={() => { if(newBudget.label){ setBudgetItems(prev=>[...prev,{...newBudget,id:Date.now()}]); setNewBudget({label:"",amount:0,cat:"Other",icon:"💶"}); }}}
                  style={{ background:C.blue, border:"none", borderRadius:8, padding:"8px 14px", color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:C.font, fontSize:12 }}>+ Add</button>
              </div>

              <div style={{ background:C.surface, border:`1px solid ${C.gold}33`, borderRadius:12, padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Total Monthly Expenses</span>
                  <span style={{ fontSize:22, fontWeight:700, color:C.gold, fontFamily:C.mono }}>€{totalBudget}/mo</span>
                </div>
                <ProgressBar v={totalBudget} max={Math.max(totalBudget,3500)} color={C.gold} h={8} />
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:14 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:11, color:C.textMuted }}>Annual</div>
                    <div style={{ fontSize:16, fontWeight:700, color:C.gold, fontFamily:C.mono }}>{euro(totalBudget*12)}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:11, color:C.textMuted }}>FIRE Target (×{legacyMult.toFixed(1)})</div>
                    <div style={{ fontSize:16, fontWeight:700, color:C.gold, fontFamily:C.mono }}>{kilo(totalBudget*12*legacyMult)}</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:11, color:C.textMuted }}>FIRE Year</div>
                    <div style={{ fontSize:16, fontWeight:700, color:C.green, fontFamily:C.mono }}>{projForDates.find(r=>r.portfolio>=totalBudget*12*legacyMult)?.year||"2040+"}</div>
                  </div>
                </div>

                {/* Budget Override Toggle */}
                <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:useBudgetAsSpending?C.green:C.textSec }}>
                        {useBudgetAsSpending ? "✅ Budget is driving all FIRE calculations" : "Use this budget as FIRE spending"}
                      </div>
                      <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>
                        {useBudgetAsSpending
                          ? `All tabs now use €${totalBudget}/mo instead of the "${spendMode}" preset (€${spendMap[spendMode]}/mo)`
                          : `Currently using "${spendMode}" preset: €${spendMap[spendMode]}/mo`}
                      </div>
                    </div>
                    <div onClick={() => setUseBudgetAsSpending(!useBudgetAsSpending)}
                      style={{ background:useBudgetAsSpending?C.green:C.border, borderRadius:20, padding:"5px 14px", cursor:"pointer", color:useBudgetAsSpending?"#fff":C.textMuted, fontSize:12, fontWeight:700, minWidth:54, textAlign:"center", transition:"all 0.2s", flexShrink:0 }}>
                      {useBudgetAsSpending?"ON":"OFF"}
                    </div>
                  </div>
                  {useBudgetAsSpending && totalBudget !== spendMap[spendMode] && (
                    <div style={{ marginTop:8, fontSize:11, color:C.textSec, background:C.green+"10", border:`1px solid ${C.green}22`, borderRadius:8, padding:"8px 12px" }}>
                      💡 Budget override active: €{totalBudget}/mo overrides the "{spendMode}" preset. Your new FIRE target is <strong style={{ color:C.gold }}>{kilo(totalBudget*12*legacyMult)}</strong>. All tabs, projections and withdrawal calculations now use this number.
                    </div>
                  )}
                </div>
              </div>

              {/* Category breakdown */}
              <div style={{ marginTop:16 }}>
                {Object.entries(budgetItems.reduce((acc,item) => { acc[item.cat]=(acc[item.cat]||0)+item.amount; return acc; }, {})).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => (
                  <div key={cat} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, color:C.textSec }}>{cat}</span>
                      <span style={{ fontSize:12, color:C.gold, fontFamily:C.mono }}>€{amt}/mo ({(amt/totalBudget*100).toFixed(0)}%)</span>
                    </div>
                    <ProgressBar v={amt} max={totalBudget} color={C.gold} h={4} />
                  </div>
                ))}
              </div>
            </Card>

            <InfoBox color={useBudgetAsSpending ? C.green : C.blue}>
              {useBudgetAsSpending
                ? `✅ Budget override ACTIVE: All FIRE calculations now use €${totalBudget}/mo as your spending. FIRE target: ${kilo(totalBudget*12*legacyMult)}.`
                : `💡 Your calculated budget is €${totalBudget}/mo (FIRE target: ${kilo(totalBudget*12*legacyMult)}). Toggle "Use This Budget" above to make it drive all FIRE calculations instead of the "${spendMode}" preset.`}
            </InfoBox>
          </div>
        )}

        {/* ══ TRAVEL ════════════════════════════════════════════════════ */}
        {tab === "travel" && (
          <div>
            <Card title="Travel Budget & Style" accent={C.teal} titleRight={<Tip>Set your annual travel budget and comfort preference. Each style multiplies the base cost per destination — backpackers spend 0.5× the base, luxury travellers 3×.</Tip>}>
              <Slider label="Monthly travel allocation" value={travelBudget} min={0} max={2000} step={25} onChange={setTravelBudget} format={v=>`€${v}/mo (€${v*12}/yr)`} color={C.teal} hint="This should be included in your Budget tab total" />
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:C.textSec, marginBottom:10 }}>Travel Style</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:8 }}>
                  {[
                    { key:"backpacker", label:"🎒 Backpacker", mult:0.5, desc:"Hostels, street food, overnight buses", color:C.green },
                    { key:"budget",     label:"🏨 Budget",     mult:0.8, desc:"Guesthouses, local restaurants", color:C.cyanLight },
                    { key:"standard",   label:"⚖️ Standard",   mult:1.0, desc:"3★ hotels, mix of eating out", color:C.gold },
                    { key:"comfort",    label:"🛋️ Comfort",    mult:1.6, desc:"4★ hotels, good restaurants", color:C.orange },
                    { key:"luxury",     label:"✨ Luxury",     mult:3.0, desc:"5★ resorts, private transfers", color:C.pink },
                  ].map(s => (
                    <button key={s.key} onClick={() => setTravelStyle(s.key)}
                      style={{ background:travelStyle===s.key?s.color+"1a":C.surface, border:`1px solid ${travelStyle===s.key?s.color:C.border}`, borderRadius:10, padding:"10px 10px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                      <div style={{ fontSize:14, marginBottom:4 }}>{s.label}</div>
                      <div style={{ fontSize:10, color:C.textMuted, lineHeight:1.5 }}>{s.desc}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:s.color, marginTop:4, fontFamily:C.mono }}>×{s.mult}</div>
                    </button>
                  ))}
                </div>
              </div>
              <G3>
                <Box small label="Annual budget" value={euro(travelAnnual)} sub="for all travel" color={C.teal} />
                <Box small label="Style multiplier" value={`×${[{key:"backpacker",mult:0.5},{key:"budget",mult:0.8},{key:"standard",mult:1.0},{key:"comfort",mult:1.6},{key:"luxury",mult:3.0}].find(s=>s.key===travelStyle)?.mult||1}`} sub="cost multiplier" color={C.cyanLight} />
                <Box small label="Effective days/yr" value={`~${Math.round(travelAnnual/(70*([{key:"backpacker",mult:0.5},{key:"budget",mult:0.8},{key:"standard",mult:1.0},{key:"comfort",mult:1.6},{key:"luxury",mult:3.0}].find(s=>s.key===travelStyle)?.mult||1)))} days`} sub="at your style" color={C.gold} />
                <Box small label="FIRE target impact" value={kilo(travelBudget*12*legacyMult)} sub="this adds to target" color={C.orange} />
              </G3>
            </Card>

            <Card title="Where Can You Go & For How Long?" accent={C.teal}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:12 }}>
                Base costs adjusted for <strong style={{ color:C.teal }}>{travelStyle}</strong> travel style
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {destinations.map(dest => {
                  const styleMult = [{key:"backpacker",mult:0.5},{key:"budget",mult:0.8},{key:"standard",mult:1.0},{key:"comfort",mult:1.6},{key:"luxury",mult:3.0}].find(s=>s.key===travelStyle)?.mult||1;
                  const effectiveCost = Math.round(dest.costPerDay * styleMult);
                  const daysPerYear = Math.floor(travelAnnual / effectiveCost);
                  const weeksPerYear = (daysPerYear / 7).toFixed(1);
                  const barW = Math.min(100, (daysPerYear / 90) * 100);
                  const colorMap = { budget:C.green, mid:C.gold, premium:C.orange };
                  const col = colorMap[dest.tier];
                  return (
                    <div key={dest.region} style={{ background:C.surface, border:`1px solid ${daysPerYear>=14?col+"44":C.border}`, borderRadius:12, padding:"14px 16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:daysPerYear>=7?col:C.textMuted }}>{dest.icon} {dest.region}</div>
                          <div style={{ fontSize:11, color:C.textMuted }}>{dest.desc}</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:11, color:C.textMuted }}>€{effectiveCost}/day ({travelStyle})</div>
                          <div style={{ fontSize:16, fontWeight:700, color:daysPerYear>=7?col:C.textMuted, fontFamily:C.mono }}>{daysPerYear} days</div>
                          <div style={{ fontSize:11, color:C.textMuted }}>{weeksPerYear} weeks/yr</div>
                        </div>
                      </div>
                      <ProgressBar v={barW} max={100} color={daysPerYear>=14?col:C.textMuted} h={5} />
                      {daysPerYear < 7 && <div style={{ fontSize:11, color:C.red, marginTop:4 }}>⚠️ Budget too low for a meaningful trip here at {travelStyle} level</div>}
                      {daysPerYear >= 30 && <div style={{ fontSize:11, color:col, marginTop:4 }}>🎉 Full month+ trip possible!</div>}
                      {daysPerYear >= 90 && <div style={{ fontSize:11, color:col, marginTop:2 }}>🌟 You could basically base yourself here part of the year!</div>}
                    </div>
                  );
                })}
              </div>
            </Card>

            {spendMode === "nomad" && (
              <Card title="🌍 Nomad FIRE Deep Dive" accent={C.teal}>
                <InfoBox color={C.teal}>
                  <strong>Nomad FIRE</strong> is geo-arbitrage: earn or withdraw income in Euros/USD while living in countries where costs are 3-5x lower. €700/month in Vienna covers only basics. The same €700/month in Chiang Mai (Thailand), Tbilisi (Georgia), or Medellín (Colombia) covers a very comfortable lifestyle including nice accommodation, food, transport, and activities.
                </InfoBox>
                <div style={{ marginTop:14 }}>
                  <G3>
                    {[
                      { city:"Chiang Mai 🇹🇭", cost:700, desc:"Digital nomad hub, great food, temples" },
                      { city:"Tbilisi 🇬🇪", cost:750, desc:"Free visas, great wine, EU proximity" },
                      { city:"Medellín 🇨🇴", cost:800, desc:"Spring eternal, vibrant, affordable" },
                      { city:"Lisbon 🇵🇹", cost:1400, desc:"EU, English-friendly, Atlantic coast" },
                      { city:"Budapest 🇭🇺", cost:900, desc:"EU, close to Austria, excellent culture" },
                      { city:"Tbilisi 🇬🇪", cost:750, desc:"1yr visa, EU timezone, low tax" },
                    ].map(c => (
                      <div key={c.city} style={{ background:C.surface, border:`1px solid ${C.teal}33`, borderRadius:10, padding:"12px" }}>
                        <div style={{ fontSize:13, fontWeight:700, color:C.tealLight }}>{c.city}</div>
                        <div style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>{c.desc}</div>
                        <div style={{ fontSize:16, fontWeight:700, color:C.teal, fontFamily:C.mono, marginTop:6 }}>€{c.cost}/mo</div>
                        <div style={{ fontSize:11, color:C.textMuted }}>comfortable lifestyle</div>
                      </div>
                    ))}
                  </G3>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ══ LIFE ══════════════════════════════════════════════════════ */}
        {tab === "life" && (
          <div>
            <Card title="Life Event Modeller" accent={C.pink}>
              <div style={{ marginBottom:14 }}>
                {events.map(e => (
                  <div key={e.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:C.surface, borderRadius:10, padding:"10px 14px", marginBottom:8, border:`1px solid ${C.border}` }}>
                    <div><div style={{ fontSize:13, color:C.text }}>{e.label}</div><div style={{ fontSize:11, color:C.textMuted }}>{e.year} · {euro(e.cost)}</div></div>
                    <button onClick={() => setEvents(events.filter(ev=>ev.id!==e.id))} style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:16 }}>✕</button>
                  </div>
                ))}
                {events.length === 0 && <div style={{ fontSize:13, color:C.textMuted, textAlign:"center", padding:"12px" }}>No life events added yet. Add below.</div>}
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <input placeholder="🏠 Event name" value={newEvt.label} onChange={e => setNewEvt({...newEvt,label:e.target.value})}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", color:C.text, fontSize:12, fontFamily:C.font, flex:2, minWidth:120 }} />
                <input type="number" placeholder="Year" value={newEvt.year} onChange={e => setNewEvt({...newEvt,year:Number(e.target.value)})}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", color:C.text, fontSize:12, fontFamily:C.mono, width:70 }} />
                <input type="number" placeholder="Cost €" value={newEvt.cost} onChange={e => setNewEvt({...newEvt,cost:Number(e.target.value)})}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", color:C.text, fontSize:12, fontFamily:C.mono, width:90 }} />
                <button onClick={() => { if(newEvt.label){setEvents([...events,{...newEvt,id:Date.now()}]);setNewEvt({label:"",year:currentYear+3,cost:5000}); }}}
                  style={{ background:C.pink, border:"none", borderRadius:8, padding:"8px 14px", color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:C.font, fontSize:12 }}>+ Add</button>
              </div>
            </Card>

            <Card title="👫 Couple Mode" accent={C.green}>
              <Tag on={coupleMode} onClick={() => setCoupleMode(!coupleMode)} color={C.green}>Enable Couple Mode</Tag>
              {coupleMode && (
                <div style={{ marginTop:14 }}>
                  <Slider label="Partner's monthly savings" value={partnerSavings} min={0} max={3000} step={50} onChange={setPartnerSavings} format={v=>`€${v}/mo`} color={C.green} />
                  <Slider label="Partner's current portfolio" value={partnerPortfolio} min={0} max={500000} step={1000} onChange={setPartnerPortfolio} format={v=>kilo(v)} color={C.green} />
                  <G3>
                    <Box small label="Combined portfolio" value={kilo(startPort)} color={C.green} />
                    <Box small label="Combined savings/mo" value={`€${totalSavings}`} color={C.green} />
                    <Box small label="Combined FIRE year" value={fireYear||"2040+"} color={C.gold} />
                  </G3>
                  <InfoBox color={C.green} style={{ marginTop:12 }}>
                    💡 With two incomes, you reach FIRE much faster. One partner can retire first while the other continues — keeping health insurance active for both.
                  </InfoBox>
                </div>
              )}
            </Card>

            <Card title="Part-Time Transition Roadmap" accent={C.cyan}>
              <div style={{ position:"relative", marginLeft:18 }}>
                <div style={{ position:"absolute", left:-14, top:0, bottom:0, width:2, background:C.border }} />
                {[
                  { l:"Full-time Work", days:5, yr:currentYear, inc:monthlySavings*2+1000 },
                  { l:"4 days/week", days:4, yr:currentYear+Math.round((fireYear||currentYear+10)-currentYear)*0.4, inc:Math.round((monthlySavings*2+1000)*0.8) },
                  { l:"3 days/week", days:3, yr:currentYear+Math.round((fireYear||currentYear+10)-currentYear)*0.6, inc:Math.round((monthlySavings*2+1000)*0.6) },
                  { l:"Barista (2 days)", days:2, yr:baristaYear||currentYear+8, inc:baristaIncome },
                  { l:"🎯 Full FIRE", days:0, yr:fireYear||currentYear+12, inc:0 },
                ].map((s,i) => {
                  const sp = proj.find(r=>r.year>=s.yr)?.portfolio||0;
                  return (
                    <div key={i} style={{ position:"relative", marginBottom:16, paddingLeft:18 }}>
                      <div style={{ position:"absolute", left:-18, top:10, width:10, height:10, borderRadius:"50%", background:s.days===0?C.gold:C.cyan, border:`2px solid ${C.bg}` }} />
                      <div style={{ background:C.surface, border:`1px solid ${s.days===0?C.gold+"44":C.border}`, borderRadius:12, padding:"12px 16px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div><span style={{ fontSize:13, fontWeight:700, color:s.days===0?C.gold:C.text }}>{s.l}</span><span style={{ fontSize:11, color:C.textMuted, marginLeft:10 }}>~{Math.round(s.yr)}</span></div>
                          <span style={{ fontSize:12, color:s.days===0?C.gold:C.cyan, fontFamily:C.mono }}>{s.inc>0?euro(s.inc)+"/mo":"Portfolio only"}</span>
                        </div>
                        <div style={{ display:"flex", gap:4, marginBottom:6 }}>
                          {[1,2,3,4,5].map(d=><div key={d} style={{ width:14, height:14, borderRadius:3, background:d<=s.days?C.cyan:C.border }} />)}
                          <span style={{ fontSize:11, color:C.textMuted, marginLeft:8, lineHeight:"14px" }}>{s.days===0?"🎉 Free!":s.days+" days/wk"}</span>
                        </div>
                        <div style={{ fontSize:11, color:C.textMuted }}>Portfolio: <span style={{ color:C.textSec, fontFamily:C.mono }}>{euro(sp)}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ══ AUSTRIA ═══════════════════════════════════════════════════ */}
        {tab === "austria" && (
          <div>
            <InfoBox color={C.gold}>
              🇦🇹 <strong>Austrian FIRE Advantages Overview</strong> — Austria has surprisingly powerful FIRE advantages: Regelbesteuerungsoption (0% KeSt at low income), SV refunds, Wohnbauförderung housing subsidies, and a solid public pension.
            </InfoBox>

            {/* ── 🏥 SV-Status nach FIRE — NEUES MODUL ── */}
            <Card title="🏥 Krankenversicherung nach dem Haupterwerb" accent={C.cyan}
              titleRight={<Tip>Was dein KV-Status nach FIRE / Barista FIRE kostet, hängt von deiner Beschäftigungssituation ab. Dieser Unterschied kann deinen FIRE-Bedarf um bis zu €6.000/Jahr erhöhen — oft übersehen!</Tip>}
              style={{ marginTop:14 }}>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, color:C.textMuted, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Wähle deinen Post-FIRE Status:</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))", gap:8 }}>
                  {[
                    { key:"privatier",    icon:"🏖️", title:"Privatier", subtitle:"Kein Job", cost:"~€495/mo", color:C.orange,
                      desc:"ÖGK Selbstversicherung §16 ASVG. Voller KV-Schutz. Pensionsversicherung optional zubuchbar (+€255/mo)." },
                    { key:"geringfuegig", icon:"☕", title:"Barista FIRE", subtitle:`< €${SV_GERING_LIMIT}/mo`, cost:svOptIn19a?"€73.20/mo":"€0/mo", color:C.green,
                      desc:"Unter Geringfügigkeitsgrenze: keine Pflicht-SV. Optional: §19a ASVG Opting-In für KV + PV um €73.20/mo." },
                    { key:"teilzeit",     icon:"⚡", title:"Teilzeit", subtitle:`≥ €${SV_GERING_LIMIT}/mo`, cost:"€0 extra", color:C.teal,
                      desc:"Pflichtversichert — Dienstgeber zahlt SV-Anteil. Kein Zusatzaufwand für dich." },
                    { key:"mitversichert",icon:"👫", title:"Mitversichert", subtitle:"§123 ASVG", cost:"€0", color:C.purple,
                      desc:"Kostenlose Mitversicherung über Ehe-/Lebenspartner. Keine eigenen Beiträge nötig." },
                  ].map(opt => (
                    <div key={opt.key} onClick={() => setSvStatus(opt.key)}
                      style={{ background:svStatus===opt.key?opt.color+"18":C.surface, border:`2px solid ${svStatus===opt.key?opt.color:C.border}`, borderRadius:12, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s" }}>
                      <div style={{ fontSize:22, marginBottom:5 }}>{opt.icon}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:svStatus===opt.key?opt.color:C.text }}>{opt.title}</div>
                      <div style={{ fontSize:10, color:C.textMuted, marginBottom:4 }}>{opt.subtitle}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:opt.color, fontFamily:C.mono, marginBottom:5 }}>{opt.cost}</div>
                      <div style={{ fontSize:10, color:C.textMuted, lineHeight:1.5 }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>

                {/* §19a Opting-In Toggle — nur für geringfügig */}
                {svStatus === "geringfuegig" && (
                  <div style={{ marginTop:14, background:C.green+"12", border:`1px solid ${C.green}33`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>§19a ASVG — Freiwilliges Opting-In</div>
                        <div style={{ fontSize:11, color:C.textMuted }}>KV + PV für Geringfügige · €73.20/Monat</div>
                      </div>
                      <div onClick={() => setSvOptIn19a(!svOptIn19a)}
                        style={{ background:svOptIn19a?C.green:C.border, borderRadius:20, padding:"4px 12px", cursor:"pointer", color:svOptIn19a?"#fff":C.textMuted, fontSize:12, fontWeight:700, minWidth:50, textAlign:"center", transition:"all 0.2s" }}>
                        {svOptIn19a?"AN":"AUS"}
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:C.textSec, lineHeight:1.7 }}>
                      {svOptIn19a
                        ? "✅ Du bist freiwillig KV+PV versichert. Kosten: €73.20/mo → €878.40/yr. Wichtig für Pensionskonto-Aufbau!"
                        : "⚠️ Kein Versicherungsschutz. Für kurzfristige Barista-Phasen ok — bei Erkrankung kein Krankengeld. Empfehlung: Opting-In aktivieren."}
                    </div>
                  </div>
                )}

                {/* Privatier → Pensions-SV Hinweis */}
                {svStatus === "privatier" && (
                  <InfoBox color={C.orange} style={{ marginTop:12 }}>
                    💡 <strong>Privatier-Tipp:</strong> Als Privatier bist du KV-versichert (€495/mo), aber <strong>nicht</strong> pensionsversichert. Jedes Jahr ohne PV-Beitrag reduziert deine spätere Staatspension um ~€155/yr. Freiwillige Weiterversicherung PV: +€255/mo — oft lohnenswert für lange FIRE-Phasen vor 65.
                  </InfoBox>
                )}
              </div>

              {/* KPI-Leiste: Auswirkung auf FIRE */}
              <div style={{ background:C.surface, borderRadius:12, padding:"14px 18px", marginTop:4 }}>
                <div style={{ fontSize:11, color:C.textMuted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Auswirkung auf deinen FIRE-Plan</div>
                <MetricGroup items={[
                  { label:"SV-Kosten/Monat",   value:`€${svMonthlyCost.toFixed(2)}`, sub:"laufende Kosten", color:svMonthlyCost===0?C.green:C.orange },
                  { label:"SV-Kosten/Jahr",     value:euro(svMonthlyCost*12),         sub:"aus Portfolio",   color:svMonthlyCost===0?C.green:C.orange },
                  { label:"Ausgaben inkl. SV",  value:`${euro(spendingWithSV)}/mo`,   sub:"Gesamtbedarf",   color:C.gold },
                  { label:"FIRE-Ziel inkl. SV", value:kilo(fireNumWithSV),             sub:`${legacyMult}× Mult.`, color:C.gold },
                  { label:"FIRE-Jahr inkl. SV", value:svFireYearAdj||"2040+",         sub:svFireDelay>0?`+${svFireDelay} Jahre`:svMonthlyCost===0?"kein Unterschied":"", color:svFireDelay>0?C.orange:C.green },
                  { label:"Portfolio-Diff",     value:kilo(fireNumWithSV-fireNum),     sub:"wegen SV-Kosten", color:svMonthlyCost===0?C.green:C.red },
                ]} />
              </div>

              {svMonthlyCost > 0 && (
                <InfoBox color={C.cyan} style={{ marginTop:12 }}>
                  📊 <strong>SV-Optimierungsstrategie:</strong> {svMonthlyCost===495
                    ? `Als Privatier zahlst du €${(495*12).toLocaleString()}/yr. Lösung: (1) Mitversicherung prüfen falls Partner erwerbstätig, (2) Barista FIRE mit ≥1 Tag/Woche für Pflichtversicherung, (3) Geringfügig + §19a Opting-In für nur €73.20/mo spart €${(495*12-73.20*12).toLocaleString()}/yr.`
                    : `Mit §19a Opting-In (€73.20/mo) bist du KV+PV versichert. Das spart €${((495-73.20)*12).toFixed(0)} vs. Vollselbstversicherung und baut Pensionskonto auf.`}
                </InfoBox>
              )}
            </Card>

            <Card title="Geringfügigkeitsgrenze — The Magic SV Threshold" accent={C.cyanLight} titleRight={<Tip>Under €551.10/month = no social security contributions. Perfect for Barista FIRE.</Tip>} style={{ marginTop:14 }}>
              <Slider label="Planned monthly income" value={geringIncome} min={0} max={1500} step={10} onChange={setGeringIncome} format={v=>`€${v}/mo`} color={C.cyanLight} hint={`Geringfügigkeitsgrenze 2025: €${GERING}/month`} />
              <G3>
                <Box small label="Status" value={geringIncome<=GERING?"✅ Under limit":"⚠️ Over limit"} sub={geringIncome<=GERING?"No SV required!":"SV contributions apply"} color={geringIncome<=GERING?C.green:C.orange} />
                <Box small label="SV saving" value={geringIncome<=GERING?`€${Math.round(GERING*0.1812)}/mo`:"€0"} sub="vs full employment" color={geringIncome<=GERING?C.green:C.textMuted} />
                <Box small label="Annual saving" value={geringIncome<=GERING?euro(Math.round(GERING*0.1812*12)):"€0"} sub="per year" color={geringIncome<=GERING?C.green:C.textMuted} />
              </G3>
            </Card>

            {/* ── ☕ Geringfügige Beschäftigung — Barista FIRE Highlight ── */}
            <Card title="☕ Geringfügige Beschäftigung — Barista FIRE's Secret Weapon" accent={C.coffeeGreen} style={{ marginTop:14 }}
              titleRight={<Tip>Earning just below €518.44/mo gives you health insurance + social security at near-zero cost. This is the most efficient legal working arrangement for Barista FIRE in Austria.</Tip>}>
              <div style={{ background:`linear-gradient(135deg,${C.coffeeGreen}18,${C.coffeeDark}10)`, border:`1px solid ${C.coffeeGreen}44`, borderRadius:12, padding:"16px 18px", marginBottom:14 }}>
                <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
                  <div style={{ fontSize:36 }}>☕</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.coffeeLight, marginBottom:6 }}>Earn ≤ €{SV_GERING_LIMIT}/mo → Health Insurance für €73.20/mo</div>
                    <div style={{ fontSize:12, color:C.textSec, lineHeight:1.8 }}>
                      Working <strong style={{ color:C.coffeeLight }}>geringfügig</strong> (below the threshold of €{SV_GERING_LIMIT}/mo) means:
                    </div>
                    <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:6 }}>
                      {[
                        { icon:"✅", text:`No mandatory SV deductions — keep 100% of your earnings` },
                        { icon:"🏥", text:`Opt in to §19a ASVG for just €73.20/mo → full KV + PV coverage` },
                        { icon:"💰", text:`Save €${(495-73.20).toFixed(0)}/mo vs. Privatier Selbstversicherung (€495/mo)` },
                        { icon:"🏦", text:`Pensionskonto continues accumulating — every year counts` },
                        { icon:"🇦🇹", text:`Completely legal, recognised employment — simple ANV filing` },
                      ].map((item,i) => (
                        <div key={i} style={{ display:"flex", gap:8 }}>
                          <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
                          <span style={{ fontSize:12, color:C.textSec, lineHeight:1.6 }}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:14 }}>
                <div style={{ background:C.surface, border:`1px solid ${C.coffeeGreen}33`, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1, marginBottom:4 }}>BARISTA TARGET</div>
                  <div style={{ fontSize:18, fontWeight:700, color:C.coffeeGreen, fontFamily:C.mono }}>{kilo(baristaTarget)}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>vs Full FIRE {kilo(fireNum)}</div>
                </div>
                <div style={{ background:C.surface, border:`1px solid ${C.coffeeGreen}33`, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1, marginBottom:4 }}>IDEAL BARISTA WAGE</div>
                  <div style={{ fontSize:18, fontWeight:700, color:C.coffeeLight, fontFamily:C.mono }}>€{SV_GERING_LIMIT}/mo</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>Stay under threshold</div>
                </div>
                <div style={{ background:C.surface, border:`1px solid ${C.coffeeGreen}33`, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1, marginBottom:4 }}>KV COST (§19a)</div>
                  <div style={{ fontSize:18, fontWeight:700, color:C.green, fontFamily:C.mono }}>€73.20</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>/month opt-in</div>
                </div>
                <div style={{ background:C.surface, border:`1px solid ${C.coffeeGreen}33`, borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ fontSize:10, color:C.textMuted, letterSpacing:1, marginBottom:4 }}>SAVINGS VS PRIVATIER</div>
                  <div style={{ fontSize:18, fontWeight:700, color:C.green, fontFamily:C.mono }}>€{Math.round((495-73.20)*12)}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>/year saved</div>
                </div>
              </div>

              {/* Regelbesteuerungsoption link for Barista */}
              <div style={{ background:C.cyan+"12", border:`1px solid ${C.cyan}33`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.cyanLight, marginBottom:8 }}>🎯 Regelbesteuerungsoption for Barista FIRE Workers</div>
                <div style={{ fontSize:12, color:C.textSec, lineHeight:1.8 }}>
                  If your total annual income (Barista wages + portfolio withdrawals) stays <strong style={{ color:C.cyanLight }}>below €13,539/yr (~€1,128/mo)</strong>, you qualify for Regelbesteuerungsoption. Result: <strong style={{ color:C.cyanLight }}>0% KeSt</strong> on all capital gains instead of the standard 27.5% KeSt. This is the most powerful tax optimization available to Austrian Barista FIRE workers — legally paying zero tax on your investment income.
                </div>
                <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:6 }}>
                  {[
                    `Barista wages: €${SV_GERING_LIMIT}/mo × 12 = €${Math.round(SV_GERING_LIMIT*12)}/yr`,
                    `Remaining room for withdrawals: €${Math.round(13539 - SV_GERING_LIMIT*12)}/yr (= €${Math.round((13539-SV_GERING_LIMIT*12)/12)}/mo)`,
                    `Total: €13,539/yr → Grenzsteuersatz 0% → Regelbesteuerungsoption kicks in → 0% KeSt`,
                    `File Einkommensteuererklärung on FinanzOnline and tick "Regelbesteuerungsoption"`,
                  ].map((s,i) => (
                    <div key={i} style={{ display:"flex", gap:8 }}>
                      <span style={{ color:C.cyan, fontSize:12, flexShrink:0, marginTop:1 }}>→</span>
                      <span style={{ fontSize:11, color:C.textSec, lineHeight:1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Wohnbauförderung — Housing Subsidies" accent={C.green}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10, marginBottom:16 }}>
                {[
                  { p:"🏙️ Wien", limit:"€57,600/yr (1 person)", url:"wohnbeihilfe.wien.gv.at", note:"Most generous in Austria" },
                  { p:"🌲 Niederösterreich", limit:"€42,000/yr (household)", url:"noe.gv.at/wohnbau", note:"Check NÖ Wohnbauförderung" },
                  { p:"🍷 Steiermark", limit:"€40,000/yr (household)", url:"wohnservice.steiermark.at", note:"Wohnbeihilfe für Mieter" },
                  { p:"🏔️ Oberösterreich", limit:"~€35,000/yr", url:"land-oberoesterreich.gv.at", note:"OÖ Wohnbeihilfe" },
                  { p:"🏔️ Tirol", limit:"~€38,000/yr", url:"tirol.gv.at/wohnbaufoerderung", note:"Wohnbauförderung Tirol" },
                  { p:"🎵 Salzburg", limit:"~€36,000/yr", url:"salzburg.gv.at/wohnbau", note:"Wohnbeihilfe Salzburg" },
                  { p:"🎭 Burgenland", limit:"~€33,000/yr", url:"burgenland.at/wohnbau", note:"Bgld Wohnbauförderung" },
                  { p:"🦁 Kärnten", limit:"~€34,000/yr (household)", url:"ktn.gv.at/wohnbaufoerderung", note:"Wohnbeihilfe Kärnten — check ktn.gv.at for current limits" },
                ].map(p => (
                  <div key={p.p} style={{ background:C.surface, border:`1px solid ${C.green}22`, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{p.p}</div>
                    <div style={{ fontSize:11, color:C.textSec, marginTop:3 }}>{p.limit}</div>
                    <div style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>{p.note}</div>
                    <div style={{ fontSize:10, color:C.blue, marginTop:3 }}>→ {p.url}</div>
                  </div>
                ))}
              </div>
              <InfoBox color={C.green}>
                {geringIncome*12<34000
                  ? `✅ At €${geringIncome*12}/yr, you likely qualify in all provinces. Housing subsidies could reduce rent by €100–400/month — that's €1,200–4,800/year directly reducing your FIRE number!`
                  : `⚠️ At €${geringIncome*12}/yr annual income, check directly with your province's Wohnbauförderung authority for current eligibility.`}
              </InfoBox>
            </Card>

            {[
              { cat:"💰 Priority Tax Actions", color:C.gold, items:[
                { t:"Arbeitnehmerveranlagung (ANV)", v:"Up to €1,000+/yr", u:true, d:"File on FinanzOnline every year — retroactively for 5 years! You almost certainly overpaid Lohnsteuer. Takes ~30 minutes. Go to finanz.at → FinanzOnline → Arbeitnehmerveranlagung. This is the single most impactful 30 minutes you'll spend on taxes." },
                { t:"SV-Rückerstattung (Negativsteuer)", v:"Up to €400/yr", u:true, d:"If your annual income is under the tax-free threshold (~€12,816), the state refunds up to 55% of your SV contributions (AK Beitrag, WK Beitrag etc.) automatically when you file ANV. Completely free money — just file." },
                { t:"Regelbesteuerungsoption", v:"0% KeSt possible! 🎉", u:true, d:"With total income under €13,539/yr (2026 limit, adjusted annually), you can elect to be taxed at your personal income tax rate instead of the standard 27.5% KeSt (Kapitalertragsteuer) on dividends and capital gains. At €13,539 income, your personal rate is 0%. File Einkommensteuererklärung each year and tick the Regelbesteuerungsoption box. This is the most powerful Austrian FIRE tax advantage — potentially saving thousands per year in retirement." },
                { t:"Verlustausgleich (Loss Harvesting)", v:"Reduces KeSt", u:true, d:"At year-end, you can offset capital gains with capital losses within the same broker. If you're with multiple Austrian brokers (e.g. easybank + Flatex), request a Verlustausgleich certificate (Verlustausgleichsbescheinigung) from each broker and combine them in your annual tax return to reduce overall KeSt." },
              ]},
              { cat:"🏠 Living & Remote Work Deductions", color:C.blue, items:[
                { t:"Homeoffice-Pauschale", v:"Up to €300/yr", u:false, d:"Since 2021: if you work from home at least 26 days per year, you get a tax deduction of €3/day (max €300/yr). Claim in ANV under 'Werbungskosten'. Also: ergonomic office chair, desk, monitor, keyboard — all deductible if used for work." },
                { t:"Internetkosten (anteilig)", v:"Up to 50–100% deductible", u:false, d:"Your internet connection is partially deductible if you use it for work. If you work remotely, claim 50% or more of your monthly internet bill as Werbungskosten. Keep provider invoices." },
                { t:"Miete / Wohnungsanteil", v:"Proportional deduction", u:false, d:"If you're self-employed or have a dedicated home office room, the proportional rent for that room is deductible. Requires the space to be exclusively used for work (hard to claim for employees, easier for freelancers)." },
              ]},
              { cat:"🛠️ Employment & Training Deductions", color:C.cyan, items:[
                { t:"Tools & Work Equipment", v:"100% deductible", u:false, d:"Every tool, multimeter, work boot, safety glasses — keep ALL receipts. Deductible as Werbungskosten in the year of purchase. Items over €1,000 must be depreciated over multiple years (Absetzung für Abnutzung)." },
                { t:"Berufskleidung", v:"100% deductible", u:false, d:"Work-specific clothing including hi-vis jackets, safety boots, protective gear. Regular clothes don't qualify. Cleaning costs for work clothing are also deductible." },
                { t:"Fortbildungskosten", v:"100% deductible", u:false, d:"Any course, certification, technical book, or seminar that maintains or improves your professional skills. Even online courses (LinkedIn Learning, Udemy) are deductible if work-relevant. Doubly beneficial: also raises your future income." },
                { t:"Pendlerpauschale", v:"€372–3,672/yr", u:false, d:"Commuting deduction if your workplace is more than 2km away. There are two types: small Pendlerpauschale (2-20km, public transit available) and large Pendlerpauschale (no/inconvenient public transit). Use the official Pendlerrechner at bmf.gv.at. Plus the Pendlereuro (€2/km one-way per year) as additional credit." },
                { t:"Kilometergeld (freelancers)", v:"€0.42/km", u:false, d:"If self-employed or using your own car for client visits/work, claim €0.42 per km driven for work purposes (2025 rate). Keep a Fahrtenbuch (mileage log) with date, destination, reason, km. Can add up to thousands per year for regular drivers." },
              ]},
              { cat:"📈 Investment & Capital Tax Optimisation", color:C.purple, items:[
                { t:"Accumulating ETFs (thesaurierend)", v:"Defer KeSt until sale", u:false, d:"In Austria, accumulating ETFs (like VWCE) are taxed annually on their 'ausschüttungsgleiche Erträge' (deemed distributions) — but only at 27.5% on the income portion (~15–25% of growth). The capital gain portion is deferred until you sell. This is significantly better than distributing ETFs for long-term compounding. Always check the OeKB fund database for your ETF's annual deemed distribution report." },
                { t:"Meldefonds vs Non-Meldefonds", v:"Critical distinction", u:false, d:"Only buy ETFs listed as 'Meldefonds' on the OeKB (Oesterreichische Kontrollbank) database. Non-reporting funds face a punitive 27.5% flat tax on the ENTIRE value at sale (not just gains). VWCE, VWRL, IWDA, EIMI — all are Meldefonds and correct. Check: profitweb.at or oekb.at before buying any new ETF." },
                { t:"Freigrenze €730 (minor income)", v:"€730 tax-free/yr", u:false, d:"Capital gains and other investment income under €730/yr total are completely tax-free. If you're in early accumulation phase with a small portfolio, you may have no KeSt obligation at all. The Freigrenze applies to ALL income subject to special tax rates combined." },
                { t:"Crypto Asset Taxation (since 2022)", v:"27.5% KeSt", u:false, d:"Since March 2022, Austrian crypto assets are taxed like securities: 27.5% KeSt on gains. BUT: coins held before 28 Feb 2021 are permanently tax-free ('Altbestand'). No minimum holding period for new purchases. Staking/lending income = taxable. Use a crypto tax tool (CoinTracking, Blockpit) for exact calculations and an annual report." },
                { t:"Depotübertrag (broker transfer)", v:"No tax event", u:false, d:"Transferring your ETF portfolio between Austrian brokers (e.g. from easybank to Flatex) is NOT a taxable event — no KeSt is triggered. You must notify both brokers it's a transfer (not a sale). Always do this in writing. International transfers: more complex — seek advice from a Steuerberater." },
              ]},
              { cat:"👨‍👩‍👧 Family & Life Stage Benefits", color:C.green, items:[
                { t:"Familienbonus Plus", v:"€2,000+/child/yr", u:false, d:"If you have children, Familienbonus Plus gives a direct tax credit of €2,000/child/year under 18 (€700/yr for 18-24 if in education). This directly reduces your Lohnsteuer — claim in ANV or via Lohnzettel with your employer. Massively underutilised by parents." },
                { t:"Kindermehrbetrag", v:"Up to €700/yr", u:false, d:"Low-income parents who don't benefit fully from Familienbonus Plus receive a refundable Kindermehrbetrag of up to €700/year per child. Automatic with ANV filing." },
                { t:"Alleinverdiener-/Alleinerzieherabsetzbetrag", v:"€572–1,034/yr", u:false, d:"If you're a single-income couple (one partner earns under €6,000/yr) or a single parent, you get a tax credit of €572–1,034/yr per child. Claim in ANV." },
                { t:"Sonderausgaben (Special Expenditures)", v:"Up to 25% deductible", u:false, d:"Certain expenses get a 25% tax deduction: church tax (up to €400/yr), charitable donations to approved organisations, maintenance/modernisation of listed buildings. Smaller impact than Werbungskosten but still worth claiming." },
              ]},
              { cat:"🧾 FIRE-Specific Advanced Strategies", color:C.orange, items:[
                { t:"Kapitalvermögen Freigrenze Optimierung", v:"Time withdrawals", u:false, d:"In Barista FIRE, you can strategically time which year you realise capital gains to stay under the €13,539 Regelbesteuerung threshold. For example, avoid selling in a year when you have unusually high income. Split large rebalancing across two tax years." },
                { t:"Günstigerprüfung (Cheaper Test)", v:"Lower rate if applicable", u:false, d:"FinanzOnline automatically applies the Günstigerprüfung: if your regular income tax rate on capital gains would be lower than 27.5%, it uses the lower rate. At the Regelbesteuerungsoption income level, this results in 0% tax on capital income." },
                { t:"ELBA / Fremdwährungskonten Tax", v:"Be aware of FX gains", u:false, d:"If you hold investments in foreign currencies (e.g. USD-denominated ETFs on a foreign broker), currency gains on the FX conversion itself may create additional taxable events in Austria. Stick to EUR-denominated ETF share classes (like VWCE instead of VWRL in GBP) to avoid this complexity." },
                { t:"Steuerberater für FIRE", v:"~€300–800/yr, deductible", u:false, d:"A good Austrian Steuerberater (tax advisor) specialising in securities taxation can save far more than they cost — especially once your portfolio is significant. The fee itself is fully deductible as Werbungskosten. Look for one with experience in Kapitalvermögen and Regelbesteuerungsoption. Annual consultation cost: ~€300–800 depending on complexity." },
              ]},
            ].map(cat => (
              <div key={cat.cat} style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:cat.color, textTransform:"uppercase", marginBottom:10 }}>{cat.cat}</div>
                {cat.items.map(item => <TaxAccordion key={item.t} title={item.t} val={item.v} urgent={item.u} color={cat.color} desc={item.d} />)}
              </div>
            ))}
            <Card title="🧮 Austrian Pension Estimator" accent={C.purple} titleRight={<Tip>Austria's public pension (gesetzliche Pension) is based on your Versicherungsjahre and average income. It reduces how much your portfolio needs to cover — especially important for Barista FIRE scenarios.</Tip>}>
              <G2>
                <div>
                  <Slider label="Estimated years of contributions by retirement" value={pensionYears} min={5} max={45} step={1} onChange={setPensionYears} format={v=>`${v} years`} color={C.purple} hint="Counts employment + voluntary contributions during FIRE years" />
                  <Slider label="Average annual income during working years" value={pensionAvgIncome} min={10000} max={80000} step={1000} onChange={setPensionAvgIncome} format={v=>kilo(v)+"/yr"} color={C.purple} />
                </div>
                <div>
                  {(() => {
                    const monthlyPension = Math.round(pensionYears * pensionAvgIncome * 0.0178 / 12);
                    const pensionFIREReducer = Math.round(monthlyPension * 12 * legacyMult);
                    return (
                      <div>
                        <G3>
                          <Box small label="Est. monthly pension" value={euro(monthlyPension)} sub="at age 65" color={C.purple} />
                          <Box small label="Reduces FIRE target by" value={kilo(pensionFIREReducer)} sub={`(${legacyMult}× pension)`} color={C.green} />
                          <Box small label="Adjusted FIRE number" value={kilo(Math.max(0,fireNum-pensionFIREReducer))} sub="with pension factored in" color={C.gold} />
                        </G3>
                        <InfoBox color={C.purple} style={{ marginTop:12 }}>
                          💡 Even a modest Austrian pension of {euro(monthlyPension)}/mo at 65 reduces your required portfolio by {kilo(pensionFIREReducer)}. This means your adjusted FIRE target could be as low as <strong>{kilo(Math.max(0,fireNum-pensionFIREReducer))}</strong> instead of {kilo(fireNum)}.
                        </InfoBox>
                      </div>
                    );
                  })()}
                </div>
              </G2>
            </Card>

            <Card title="📋 Key Austrian Finance Resources" accent={C.textSec}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:8 }}>
                {[
                  { n:"FinanzOnline", url:"finanzonline.bmf.gv.at", desc:"File ANV, tax returns, access all documents", icon:"💻", color:C.blue },
                  { n:"OeKB Profitweb", url:"profitweb.at", desc:"Check if your ETF is a Meldefonds & annual reports", icon:"📊", color:C.gold },
                  { n:"Sozialministerium SV", url:"sozialversicherung.at", desc:"Check your Pensionskonto & contribution history", icon:"🏛️", color:C.purple },
                  { n:"Wohnbeihilfe Check", url:"help.gv.at/wohnbeihilfe", desc:"Check housing subsidy eligibility online", icon:"🏠", color:C.green },
                  { n:"BMF Pendlerrechner", url:"bmf.gv.at/pendlerrechner", desc:"Calculate your exact Pendlerpauschale", icon:"🚌", color:C.cyan },
                  { n:"Arbeiterkammer", url:"arbeiterkammer.at", desc:"Free tax advice, work rights, legal help", icon:"⚖️", color:C.orange },
                ].map(r => (
                  <div key={r.n} style={{ background:C.surface, border:`1px solid ${r.color}22`, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:18, marginBottom:5 }}>{r.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:r.color }}>{r.n}</div>
                    <div style={{ fontSize:11, color:C.textMuted, margin:"4px 0" }}>{r.desc}</div>
                    <div style={{ fontSize:10, color:C.blue }}>→ {r.url}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══ TRACKER ═══════════════════════════════════════════════════ */}
        {tab === "tracker" && (
          <div>
            {!entriesLoaded && <div style={{ textAlign:"center", color:C.textMuted, padding:20, fontSize:13 }}>Loading... 💾</div>}

            <Card title="📒 Portfolio Log" accent={C.gold} titleRight={<span style={{ fontSize:11, color:C.green }}>💾 Auto-saved</span>}>
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                <input placeholder="Label (e.g. May 2025)" value={newDate} onChange={e => setNewDate(e.target.value)}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:12, fontFamily:C.font, flex:2, minWidth:130 }} />
                <input type="number" placeholder="Portfolio value €" value={newVal} onChange={e => setNewVal(e.target.value)}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:12, fontFamily:C.mono, flex:2, minWidth:130 }} />
                <button onClick={() => { if(newDate&&newVal){setEntries(prev=>[...prev,{date:newDate,value:Number(newVal)}]);setNewDate("");setNewVal(""); }}}
                  style={{ background:C.gold, border:"none", borderRadius:8, padding:"8px 18px", color:"#000", fontWeight:700, cursor:"pointer", fontSize:12 }}>+ Add</button>
              </div>
              {entries.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={entries} margin={{ left:0, right:8 }}>
                    <defs><linearGradient id="nwg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.purple} stopOpacity={.3}/><stop offset="95%" stopColor={C.purple} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="date" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={52} />
                    <Tooltip content={<CT/>} />
                    <ReferenceLine y={fireNum} stroke={C.gold+"66"} strokeDasharray="4 3" />
                    <Area type="monotone" dataKey="value" stroke={C.purple} strokeWidth={2} fill="url(#nwg)" dot={{fill:C.purple,r:4}} name="Portfolio" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              <div style={{ marginTop:14 }}>
                {entries.map((e,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                    <span style={{ color:C.textSec }}>{e.date}</span>
                    <span style={{ color:C.text, fontWeight:600, fontFamily:C.mono }}>{euro(e.value)}</span>
                    <span style={{ color:i===0?C.textMuted:e.value>entries[i-1]?.value?C.green:C.red, fontSize:11 }}>
                      {i>0?(e.value>entries[i-1].value?"↑ +":"↓ ")+euro(Math.abs(e.value-entries[i-1].value)):"start"}
                    </span>
                    <button onClick={() => setEntries(prev=>prev.filter((_,j)=>j!==i))} style={{ background:"none", border:"none", color:C.textMuted, cursor:"pointer", fontSize:13 }}>✕</button>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="🔥 Monthly Savings Log" accent={C.gold} titleRight={<span style={{ fontSize:11, color:C.green }}>💾 Auto-saved</span>}>
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                <input placeholder="Month (e.g. May 25)" value={newMonth} onChange={e => setNewMonth(e.target.value)}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:12, fontFamily:C.font, flex:1, minWidth:120 }} />
                <input type="number" placeholder="Amount saved €" value={newSaved} onChange={e => setNewSaved(e.target.value)}
                  style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:12, fontFamily:C.mono, flex:1, minWidth:120 }} />
                <button onClick={() => { if(newMonth&&newSaved){setMonthlyLogs(prev=>[...prev,{month:newMonth,saved:Number(newSaved)}]);setNewMonth("");setNewSaved(""); }}}
                  style={{ background:C.gold, border:"none", borderRadius:8, padding:"8px 16px", color:"#000", fontWeight:700, cursor:"pointer", fontSize:12 }}>+ Log</button>
              </div>
              {monthlyLogs.length > 0 && (
                <>
                  <G3>
                    <Box small label="Months logged" value={`${monthlyLogs.length}`} color={C.gold} />
                    <Box small label="Best month" value={euro(Math.max(...monthlyLogs.map(m=>m.saved)))} sub="record" color={C.green} />
                    <Box small label="Monthly avg" value={`€${Math.round(monthlyLogs.reduce((a,m)=>a+m.saved,0)/monthlyLogs.length)}`} color={C.blue} />
                    <Box small label="Total logged" value={euro(monthlyLogs.reduce((a,m)=>a+m.saved,0))} color={C.purple} />
                  </G3>
                  <div style={{ marginTop:14 }}>
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={monthlyLogs} margin={{ left:0, right:8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                        <XAxis dataKey="month" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={40} />
                        <Tooltip content={<CT/>} />
                        <Bar dataKey="saved" fill={C.gold} radius={[4,4,0,0]} name="Saved €" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* ══ TAX OPTIMIZER ═════════════════════════════════════════════ */}
        {tab === "taxoptimizer" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>💰</div>
              <h2 style={{ margin:0, fontSize:18, fontWeight:400, color:C.text }}>Tax Drag Simulator & Capital Gains Optimizer</h2>
              <p style={{ color:C.textSec, fontSize:13, margin:"8px 0 0" }}>Austrian KeSt (27.5%) eats into your real wealth. See exactly how much, and how to fight back.</p>
            </div>

            {/* Controls */}
            <Card title="⚙️ Tax Configuration" accent={C.gold}>
              <G2>
                <div>
                  <div style={{ background:C.surface, border:`1px solid ${C.gold}33`, borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
                    <div style={{ fontSize:11, color:C.textMuted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Austrian KeSt Rate</div>
                    <div style={{ fontSize:28, fontWeight:700, color:C.gold, fontFamily:C.mono }}>27.5%</div>
                    <div style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>Fixed Kapitalertragsteuer on capital gains & dividends. Applies to accumulating ETFs (on annual deemed distribution) and at exit.</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[
                      { key:"taxHarvesting", label:"♻️ Tax Loss Harvesting", on:taxHarvesting, set:setTaxHarvesting, color:C.green, desc:"Periodically crystallise losses to reset cost basis. Reduces annual taxable deemed distribution from ~20% to ~5%." },
                      { key:"taxRegelbest", label:"🎯 Regelbesteuerungsoption", on:taxRegelbest, set:setTaxRegelbest, color:C.cyan, desc:"If your FIRE income is under €13,539/yr, elect the personal rate option — potentially 0% KeSt on all capital gains. The single biggest Austrian FIRE tax weapon." },
                    ].map(opt => (
                      <div key={opt.key} onClick={() => opt.set(!opt.on)}
                        style={{ background:opt.on?opt.color+"15":C.surface, border:`1px solid ${opt.on?opt.color:C.border}`, borderRadius:12, padding:"12px 16px", cursor:"pointer", transition:"all 0.15s" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:opt.on?opt.color:C.text }}>{opt.label}</span>
                          <span style={{ background:opt.on?opt.color:C.border, color:opt.on?"#000":C.textMuted, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{opt.on?"ON":"OFF"}</span>
                        </div>
                        <div style={{ fontSize:11, color:C.textMuted, lineHeight:1.6 }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, color:C.textMuted, marginBottom:8, letterSpacing:1, textTransform:"uppercase" }}>How Austrian ETF Tax Works</div>
                    {[
                      { step:"1", title:"Annual Deemed Distribution", desc:`Accumulating ETFs (e.g. VWCE) report ~20% of annual gain as "ausschüttungsgleiche Erträge." You pay 27.5% KeSt on that portion each year, even without selling.` },
                      { step:"2", title:"Capital Gain at Exit", desc:"When you sell, the remaining unrealised gain (the 80% that wasn't taxed annually) is taxed at 27.5%. So you pay tax twice — annually + at exit." },
                      { step:"3", title:"Regelbesteuerungsoption (the cheat code)", desc:"In Barista/FIRE mode with income under €13,539/yr: elect to use your personal income tax rate instead of 27.5%. At that income level, your personal rate is 0% → zero tax on all capital gains." },
                    ].map(s => (
                      <div key={s.step} style={{ display:"flex", gap:10, marginBottom:10 }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:C.gold+"22", border:`1px solid ${C.gold}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:700, color:C.gold }}>{s.step}</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:2 }}>{s.title}</div>
                          <div style={{ fontSize:11, color:C.textMuted, lineHeight:1.6 }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </G2>
            </Card>

            {/* Tax impact KPIs */}
            {(() => {
              const yr30gross = taxDragData[29]?.["Gross Portfolio"] || 0;
              const yr30taxed = taxDragData[29]?.["After Tax Drag"] || 0;
              const yr30spend = taxDragData[29]?.["Real Spendable"] || 0;
              const taxCost = yr30gross - yr30spend;
              const taxSavedByHarvest = taxRegelbest ? yr30gross - yr30gross : (taxHarvesting ? taxDragData[29]?.["Gross Portfolio"] - taxDragData[29]?.["After Tax Drag"] : 0);
              return (
                <G3>
                  <Box label="Gross Portfolio (yr 30)" value={kilo(yr30gross)} sub="no tax considered" color={C.gold} />
                  <Box label="After Annual Tax Drag" value={kilo(yr30taxed)} sub="accumulating ETF, annual KeSt" color={taxHarvesting||taxRegelbest?C.green:C.orange} />
                  <Box label="Real Spendable" value={kilo(yr30spend)} sub="after exit tax on unrealised gain" color={taxRegelbest?C.cyan:C.blue} />
                  <Box label="Total Tax Cost" value={kilo(taxCost)} sub="over 30 years" color={C.red} />
                  <Box label="Tax as % of Gross" value={`${yr30gross>0?((taxCost/yr30gross)*100).toFixed(1):"0"}%`} sub="of your wealth" color={C.red} />
                  <Box label="Strategy" value={taxRegelbest?"0% KeSt 🎉":taxHarvesting?"Harvesting ♻️":"Standard"} sub="current mode" color={taxRegelbest?C.cyan:taxHarvesting?C.green:C.textSec} />
                </G3>
              );
            })()}

            {/* Main tax drag chart */}
            <Card title="📉 Tax Drag — 30-Year Wealth Erosion Visualised" accent={C.red} style={{ marginTop:14 }}>
              <ResponsiveContainer width="100%" height={270}>
                <ComposedChart data={taxDragData} margin={{ left:0, right:10 }}>
                  <defs>
                    <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.gold} stopOpacity={.2}/><stop offset="95%" stopColor={C.gold} stopOpacity={0}/></linearGradient>
                    <linearGradient id="taxedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.orange} stopOpacity={.2}/><stop offset="95%" stopColor={C.orange} stopOpacity={0}/></linearGradient>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={.2}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={56} />
                  <Tooltip content={<CT/>} />
                  <Area type="monotone" dataKey="Gross Portfolio" stroke={C.gold} strokeWidth={2} fill="url(#grossGrad)" dot={false} strokeDasharray="5 3" />
                  <Area type="monotone" dataKey="After Tax Drag" stroke={C.orange} strokeWidth={2} fill="url(#taxedGrad)" dot={false} />
                  <Area type="monotone" dataKey="Real Spendable" stroke={C.blue} strokeWidth={2.5} fill="url(#spendGrad)" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", gap:14, justifyContent:"center", marginTop:8, flexWrap:"wrap" }}>
                {[{c:C.gold,l:"Gross (no tax)"},{c:C.orange,l:"After Annual Tax Drag"},{c:C.blue,l:"Real Spendable (after exit tax)"}].map(l=>(
                  <div key={l.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.textSec }}>
                    <div style={{ width:12, height:4, borderRadius:2, background:l.c }} />{l.l}
                  </div>
                ))}
              </div>
            </Card>

            {/* Regelbesteuerungsoption deep-dive */}
            <Card title="🎯 Regelbesteuerungsoption — The Austrian 0% Tax Strategy" accent={C.cyan}>
              <G2>
                <div>
                  <div style={{ background:C.cyan+"12", border:`1px solid ${C.cyan}33`, borderRadius:12, padding:"16px", marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.cyanLight, marginBottom:8 }}>How to qualify:</div>
                    {[
                      "Your total annual income (salary + capital gains + dividends) must be under €13,539/yr",
                      "This is the income level of Barista FIRE or early retirement with modest withdrawals",
                      "File your Einkommensteuererklärung and tick 'Regelbesteuerungsoption'",
                      "FinanzOnline auto-applies Günstigerprüfung — uses your personal rate if lower than 27.5%",
                      "At income under the Steuerfreigrenze, your personal rate is literally 0%",
                    ].map((s,i) => (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                        <span style={{ color:C.cyan, fontSize:12, flexShrink:0, marginTop:1 }}>✓</span>
                        <span style={{ fontSize:12, color:C.textSec, lineHeight:1.6 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <InfoBox color={C.cyan}>
                    🎉 <strong>Real impact:</strong> At €{euro(spending)}/mo spending with Regelbesteuerungsoption, you could save <strong>{kilo((taxDragData[29]?.["Gross Portfolio"]||0) - (taxDragData[29]?.["Real Spendable"]||0))}</strong> in taxes over 30 years compared to paying standard KeSt. That's money that keeps working for you.
                  </InfoBox>
                </div>
                <div>
                  <div style={{ fontSize:11, color:C.textMuted, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>2026 Income Thresholds</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {[
                      { label:"Tax-free threshold", value:"€13,539/yr", color:C.green, note:"Regelbesteuerungsoption applies → 0% KeSt" },
                      { label:"25% income tax bracket", value:"€13,539–18,000", color:C.gold, note:"Still much better than 27.5% KeSt" },
                      { label:"35% bracket", value:"€18,000–31,000", color:C.orange, note:"Regelbesteuerungsoption NOT worth it here" },
                      { label:"Standard KeSt applies", value:"Above €31,000", color:C.red, note:"27.5% flat rate is better than personal rate" },
                      { label:"Negativsteuer refund", value:"Under €12,816/yr", color:C.cyan, note:"Up to €400 SV refund even without tax owed" },
                    ].map(row => (
                      <div key={row.label} style={{ background:C.surface, border:`1px solid ${row.color}22`, borderRadius:10, padding:"10px 14px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{row.label}</span>
                          <span style={{ fontSize:12, color:row.color, fontFamily:C.mono, fontWeight:700 }}>{row.value}</span>
                        </div>
                        <div style={{ fontSize:10, color:C.textMuted }}>{row.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </G2>
            </Card>

            {/* Tax Loss Harvesting deep-dive */}
            <Card title="♻️ Tax Loss Harvesting — Reset Your Cost Basis" accent={C.green}>
              <G2>
                <div>
                  <InfoBox color={C.green}>
                    <strong>How it works in Austria:</strong> When your ETF position is temporarily down, sell it and immediately buy an equivalent ETF (e.g. sell VWCE, buy SSAC). You crystallise a loss that offsets gains — resetting your cost basis. The new position has a higher cost basis, reducing future exit tax.
                  </InfoBox>
                  <div style={{ marginTop:12 }}>
                    {[
                      { title:"Step 1: Find a down year", desc:"Your ETF is 10% below entry. You're sitting on a paper loss." },
                      { title:"Step 2: Sell & immediately rebuy", desc:"Sell VWCE → buy SSAC (or FWRG). Same global market exposure, new cost basis." },
                      { title:"Step 3: File Verlustausgleichsbescheinigung", desc:"Request this certificate from your broker. Use it to offset other capital gains in the same tax year." },
                      { title:"Step 4: Watch the compounding", desc:"Each loss harvest reduces future exit tax. Over 30 years, this compounds significantly." },
                    ].map((s,i) => (
                      <div key={i} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:C.green+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, fontWeight:700, color:C.green }}>{i+1}</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:2 }}>{s.title}</div>
                          <div style={{ fontSize:11, color:C.textMuted }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Box label="Annual tax drag (standard)" value={`~${(27.5*0.20).toFixed(1)}% of gains`} sub="KeSt × 20% deemed distribution" color={C.orange} />
                  <div style={{ height:10 }} />
                  <Box label="With tax harvesting" value={`~${(27.5*0.05).toFixed(1)}% of gains`} sub="KeSt × 5% after harvest" color={C.green} />
                  <div style={{ height:10 }} />
                  <Box label="With Regelbesteuerungsoption" value="0% of gains" sub="personal rate at FIRE income levels" color={C.cyan} />
                  <div style={{ height:10 }} />
                  <InfoBox color={C.gold}>
                    💡 <strong>Best combo:</strong> Use tax-loss harvesting during accumulation, then switch to Regelbesteuerungsoption once you reach FIRE income levels below €13,539/yr. This essentially eliminates capital gains tax entirely — legally.
                  </InfoBox>
                </div>
              </G2>
            </Card>
          </div>
        )}

        {/* ══ REAL ESTATE ════════════════════════════════════════════════ */}
        {tab === "realestate" && (
          <div>
            {/* Mode selector — 5 options in a grid */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, color:C.textMuted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Housing Situation</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:8 }}>
                {[
                  { key:"none",    icon:"🏢", title:"Renting / Skip", desc:"No property planned. Pure ETF strategy, no real estate in the numbers.", color:C.textSec },
                  { key:"own",     icon:"🏠", title:"Buy to Live In", desc:"Your primary residence. Mortgage replaces rent; FIRE target drops after payoff.", color:C.gold },
                  { key:"invest",  icon:"💼", title:"Buy-to-Let", desc:"Investment property for rental income. See yield, cashflow and FIRE acceleration.", color:C.green },
                  { key:"inherit", icon:"🎁", title:"Inherit a Home", desc:"You'll receive a property. No purchase cost — model equity, maintenance and FIRE impact.", color:C.purple },
                  { key:"build",   icon:"🏗️", title:"Self-Build", desc:"Buy land and build. Model land + construction cost vs. buying on the open market.", color:C.orange },
                ].map(m => (
                  <div key={m.key} onClick={() => setRePropMode(m.key)}
                    style={{ background:rePropMode===m.key?m.color+"18":C.card, border:`2px solid ${rePropMode===m.key?m.color:C.border}`, borderRadius:12, padding:"14px 12px", cursor:"pointer", transition:"all 0.15s" }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{m.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:rePropMode===m.key?m.color:C.text, marginBottom:4 }}>{m.title}</div>
                    <div style={{ fontSize:10, color:C.textMuted, lineHeight:1.5 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── "None" / Renting mode — no further inputs needed ── */}
            {rePropMode === "none" && (
              <Card title="🏢 Pure Renter / ETF-Only Strategy" accent={C.textSec}>
                <InfoBox color={C.blue}>
                  You have chosen not to factor property into your FIRE plan for now. All your savings go directly into ETFs. This is a perfectly valid strategy — especially in high-cost cities where buying often loses to renting + investing the difference.
                </InfoBox>
                <div style={{ marginTop:14 }}>
                  <Slider label="Current monthly rent" value={reCurrentRent} min={0} max={3000} step={25} onChange={setReCurrentRent} format={v=>`€${v}/mo`} color={C.cyan} hint="Used in the roadmap to show your ongoing housing cost" />
                </div>
                <G3>
                  <Box small label="Annual rent cost" value={euro(reCurrentRent*12)} sub="per year" color={C.textSec} />
                  <Box small label="FIRE target impact" value={kilo(reCurrentRent*12*legacyMult)} sub="rent included in target" color={C.gold} />
                  <Box small label="vs owning" value="No lock-in" sub="full flexibility" color={C.cyan} />
                </G3>
                <div style={{ marginTop:12 }}>
                  <InfoBox color={C.gold}>
                    💡 Switch to "Buy to Live In" to instantly see whether buying would accelerate or delay your FIRE date. The comparison might surprise you — especially if property appreciation exceeds ETF returns or if rents keep rising.
                  </InfoBox>
                </div>
              </Card>
            )}

            {/* ── Inherit mode ── */}
            {rePropMode === "inherit" && (
              <Card title="🎁 Inherited Property" accent={C.purple}>
                <G2>
                  <div>
                    <Slider label="Estimated property value" value={reInheritedValue} min={50000} max={2000000} step={10000} onChange={setReInheritedValue} format={v=>euro(v)} color={C.purple} hint="Current market value of the property you will inherit" />
                    <Slider label={t.re?.maintenance||"Monthly Maintenance & Insurance"} value={reMaintenance} min={0} max={1000} step={25} onChange={setReMaintenance} format={v=>`€${v}/mo`} color={C.orange} />
                    <Slider label={t.re?.appreciation||"Annual Property Appreciation"} value={reAppreciation} min={0} max={6} step={0.25} onChange={setReAppreciation} format={v=>`${v.toFixed(2)}%/yr`} color={C.teal} />
                    <Slider label="Your current monthly rent" value={reCurrentRent} min={0} max={3000} step={25} onChange={setReCurrentRent} format={v=>`€${v}/mo`} color={C.cyan} hint="Rent you pay now (stops when you inherit)" />
                  </div>
                  <div>
                    <G3>
                      <Box small label="Property value today" value={euro(reInheritedValue)} sub="inherited for free" color={C.purple} />
                      <Box small label="Value in 20 years" value={euro(Math.round(reInheritedValue*Math.pow(1+reAppreciation/100,20)))} sub={`at ${reAppreciation}%/yr`} color={C.teal} />
                      <Box small label="Housing benefit" value={`-${euro(reHousingBenefit)}/mo`} sub="vs continuing to rent" color={C.green} />
                      <Box small label="FIRE target reduction" value={kilo(reHousingBenefit*12*legacyMult)} sub="lower FIRE number" color={C.green} />
                      <Box small label="Adjusted FIRE year" value={reFireYearAdj||"2040+"} sub="with inheritance" color={reFireYearAdj&&fireYear&&reFireYearAdj<fireYear?C.green:C.gold} />
                      <Box small label="vs standard FIRE" value={reFireYearAdj&&fireYear?`${Math.abs(fireYear-reFireYearAdj)} yrs earlier`:"—"} color={C.green} />
                    </G3>
                    <InfoBox color={C.purple} style={{ marginTop:12 }}>
                      🎁 <strong>Austrian inheritance tax (Erbschaftsteuer)</strong> was abolished in 2008. However, <strong>Grunderwerbsteuer (3.5%)</strong> may apply when property is transferred. For direct family heirs (spouse, children, grandchildren), GrESt is calculated on a reduced "Grundstückswert" — often significantly less than market value. Consult a Notar for the exact amount.
                    </InfoBox>
                  </div>
                </G2>
              </Card>
            )}

            {/* ── Self-Build mode ── */}
            {rePropMode === "build" && (
              <Card title="🏗️ Self-Build Simulator" accent={C.orange}>
                <G2>
                  <div>
                    <Slider label="Land purchase cost" value={reBuildLandCost} min={20000} max={500000} step={5000} onChange={setReBuildLandCost} format={v=>euro(v)} color={C.orange} hint="Grundstück — buy land now, build later" />
                    <Slider label="Construction cost (Baukosten)" value={reBuildCost} min={100000} max={1000000} step={10000} onChange={setReBuildCost} format={v=>euro(v)} color={C.gold} hint="Austria: ~€1,500–2,500/m² depending on standard" />
                    <Slider label="Build completion year" value={reBuildYear} min={currentYear+1} max={currentYear+15} step={1} onChange={setReBuildYear} format={v=>`${v} (in ${v-currentYear} yrs)`} color={C.teal} />
                    <Slider label={t.re?.interestRate||"Mortgage Interest Rate"} value={reInterestRate} min={0.5} max={8} step={0.1} onChange={setReInterestRate} format={v=>`${v.toFixed(1)}%`} color={C.red} hint="Construction loans are typically variable; lock fixed once built" />
                    <Slider label={t.re?.loanTerm||"Mortgage Term"} value={reLoanTerm} min={5} max={35} step={1} onChange={setReLoanTerm} format={v=>`${v} years`} color={C.blue} />
                  </div>
                  <div>
                    <G3>
                      <Box small label="Total project cost" value={euro(reBuildCost+reBuildLandCost)} sub="land + build" color={C.orange} />
                      <Box small label="vs buying equivalent" value={euro(rePropPrice)} sub="market price benchmark" color={C.textSec} />
                      <Box small label="Potential saving" value={rePropPrice>reBuildCost+reBuildLandCost?euro(rePropPrice-(reBuildCost+reBuildLandCost)):"Set benchmark →"} sub="vs market buy" color={C.green} />
                      <Box small label="Monthly mortgage" value={euro(reMortgagePayment)} sub="/month after build" color={C.red} />
                      <Box small label="Completion year" value={String(reBuildYear)} sub={`age ${reBuildYear-currentYear+age}`} color={C.teal} />
                      <Box small label="Mortgage free" value={String(rePayoffYear)} sub={`age ${rePayoffYear-currentYear+age}`} color={C.gold} />
                    </G3>
                    <div style={{ marginTop:10 }}>
                      <Slider label="Monthly maintenance after build" value={reMaintenance} min={0} max={1000} step={25} onChange={setReMaintenance} format={v=>`€${v}/mo`} color={C.orange} />
                      <Slider label="Your current monthly rent" value={reCurrentRent} min={0} max={3000} step={25} onChange={setReCurrentRent} format={v=>`€${v}/mo`} color={C.cyan} />
                    </div>
                    <InfoBox color={C.orange}>
                      🏗️ <strong>Austrian self-build tips:</strong> Wohnbauförderung subsidies can be very generous for self-builds (up to €30–80k in some provinces). Also consider Fertighäuser (prefab) — up to 30% cheaper than Massivbau and delivered in weeks. Budget 10–15% contingency on construction costs.
                    </InfoBox>
                  </div>
                </G2>
              </Card>
            )}

            {/* Property Inputs — only for buy/invest modes */}
            {(rePropMode === "own" || rePropMode === "invest") && (
            <Card title={`🏗️ ${t.re?.title||"Real Estate Simulator"} — ${rePropMode==="own"?(t.re?.modeOwn||"Own Home"):(t.re?.modeInvest||"Buy-to-Let")}`} accent={rePropMode==="own"?C.gold:C.green}
              titleRight={<Tip>{rePropMode==="own"?"Once your mortgage is paid off, your housing cost drops to maintenance only — reducing your FIRE number automatically.":"Rental income minus mortgage and costs = your monthly cashflow. This can be reinvested or used to reach FIRE sooner."}</Tip>}>
              <G2>
                <div>
                  <Slider label={t.re?.propPrice||"Property Price"} value={rePropPrice} min={50000} max={1500000} step={5000} onChange={setRePropPrice} format={v=>euro(v)} color={rePropMode==="own"?C.gold:C.green} />
                  <Slider label={`${t.re?.downPct||"Down Payment"} (${reDownPct}% = ${euro(reDownPayment)})`} value={reDownPct} min={5} max={60} step={1} onChange={setReDownPct} format={v=>`${v}%`} color={C.purple} hint={`Loan amount: ${euro(reLoanAmount)}`} />
                  <Slider label={t.re?.interestRate||"Interest Rate"} value={reInterestRate} min={0.5} max={8} step={0.1} onChange={setReInterestRate} format={v=>`${v.toFixed(1)}%`} color={C.red} hint="Austrian mortgage rates 2024: ~3.0–4.5% fixed" />
                  <Slider label={t.re?.loanTerm||"Loan Term"} value={reLoanTerm} min={5} max={35} step={1} onChange={setReLoanTerm} format={v=>`${v} years`} color={C.blue} />
                </div>
                <div>
                  <Slider label={t.re?.maintenance||"Monthly Maintenance & Insurance"} value={reMaintenance} min={0} max={1000} step={25} onChange={setReMaintenance} format={v=>`€${v}/mo`} color={C.orange} hint="Typically 0.5–1% of property value per year" />
                  <Slider label={t.re?.appreciation||"Annual Property Appreciation"} value={reAppreciation} min={0} max={6} step={0.25} onChange={setReAppreciation} format={v=>`${v.toFixed(2)}%/yr`} color={C.teal} hint="Austria avg ~2–3%/yr historically" />
                  {rePropMode === "own" && (
                    <Slider label={t.re?.currentRent||"Your Current Monthly Rent"} value={reCurrentRent} min={0} max={3000} step={25} onChange={setReCurrentRent} format={v=>`€${v}/mo`} color={C.cyan} hint="Used to calculate your real monthly cost change" />
                  )}
                  {rePropMode === "invest" && (
                    <>
                      <Slider label={t.re?.monthlyRent||"Monthly Rental Income (gross)"} value={reMonthlyRent} min={0} max={5000} step={50} onChange={setReMonthlyRent} format={v=>`€${v}/mo`} color={C.green} />
                      <Slider label={t.re?.taxRate||"Rental Income Tax Rate"} value={reRentalTaxRate} min={0} max={55} step={1} onChange={setReRentalTaxRate} format={v=>`${v}%`} color={C.orange} hint="AT: 25–50% depending on income bracket. AfA & interest deductible first." />
                    </>
                  )}
                </div>
              </G2>
            </Card>)}

            {/* Mortgage Summary — only when there's a loan */}
            {(rePropMode === "own" || rePropMode === "invest" || rePropMode === "build") && reLoanAmount > 0 && (
            <Card title="📊 Mortgage Summary" accent={C.blue}>
              <G3>
                <Box small label={t.re?.monthlyPayment||"Monthly Mortgage"} value={euro(reMortgagePayment)} sub="/month" color={C.red} />
                <Box small label={t.re?.totalInterest||"Total Interest Paid"} value={euro(Math.round(reTotalInterest))} sub={`over ${reLoanTerm} years`} color={C.orange} />
                <Box small label={t.re?.payoffYear||"Mortgage Paid Off"} value={`${rePayoffYear}`} sub={`age ${rePayoffYear - currentYear + age}`} color={C.gold} />
                <Box small label="Down Payment" value={euro(reDownPayment)} sub="upfront equity" color={C.purple} />
                <Box small label="Loan Amount" value={euro(reLoanAmount)} sub="borrowed" color={C.blue} />
                <Box small label="Total Cost" value={euro(reEffectivePrice + Math.round(reTotalInterest))} sub="price + all interest" color={C.textSec} />
              </G3>

              {/* Monthly cashflow breakdown */}
              <div style={{ marginTop:16, background:C.surface, borderRadius:12, padding:"14px 18px" }}>
                <div style={{ fontSize:11, color:C.textMuted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
                  {rePropMode==="own"||rePropMode==="build" ? "Monthly Cost: Buying vs. Renting" : "Buy-to-Let Monthly Cashflow"}
                </div>
                {rePropMode === "own" ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[
                      { l:"Your current rent", v:reCurrentRent, c:C.textSec },
                      { l:"Mortgage payment", v:reMortgagePayment, c:C.red },
                      { l:"Maintenance & insurance", v:reMaintenance, c:C.orange },
                      { l:"Total owning cost", v:reMortgagePayment+reMaintenance, c:C.gold, bold:true },
                      { l:"Monthly delta vs renting", v:reMortgagePayment+reMaintenance-reCurrentRent, c:reMortgagePayment+reMaintenance>reCurrentRent?C.red:C.green, delta:true },
                    ].map(row => (
                      <div key={row.l} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, paddingBottom:6 }}>
                        <span style={{ fontSize:12, color:row.bold?C.text:C.textSec, fontWeight:row.bold?700:400 }}>{row.l}</span>
                        <span style={{ fontSize:13, fontWeight:row.bold?700:500, color:row.c, fontFamily:C.mono }}>
                          {row.delta?(row.v>0?"+":"")+euro(row.v)+" /mo":euro(row.v)+" /mo"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[
                      { l:"Gross rental income", v:reMonthlyRent, c:C.green },
                      { l:`Income tax (~${reRentalTaxRate}%, after deductions)`, v:-Math.round(reRentalTax/12), c:C.red },
                      { l:"AfA benefit (monthly equiv.)", v:Math.round(reAfaAnnual/12), c:C.cyan, note:"deductible" },
                      { l:"Mortgage payment", v:-reMortgagePayment, c:C.red },
                      { l:"Maintenance & insurance", v:-reMaintenance, c:C.orange },
                      { l:"Net monthly cashflow", v:reCashflow, c:reCashflow>=0?C.green:C.red, bold:true },
                    ].map(row => (
                      <div key={row.l} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, paddingBottom:6 }}>
                        <span style={{ fontSize:12, color:row.bold?C.text:C.textSec, fontWeight:row.bold?700:400 }}>
                          {row.l}{row.note && <span style={{ fontSize:10, color:C.cyan, marginLeft:6 }}>({row.note})</span>}
                        </span>
                        <span style={{ fontSize:13, fontWeight:row.bold?700:500, color:row.c, fontFamily:C.mono }}>
                          {row.v>=0?"+":""}{euro(row.v)} /mo
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>)}

            {/* Buy-to-Let Yield & Austrian Tax */}
            {rePropMode === "invest" && (
              <Card title="📈 Rental Yield & Austrian Tax Analysis" accent={C.green}
                titleRight={<Tip>AfA (Absetzung für Abnutzung) lets you deduct 1.5%/yr on 80% of the property value annually. Mortgage interest is also deductible — this can reduce taxable rental income close to zero in early years.</Tip>}>
                <G3>
                  <Box small label={t.re?.grossYield||"Gross Yield"} value={`${reGrossYield.toFixed(2)}%`} sub="before tax & costs" color={C.gold} />
                  <Box small label={t.re?.netYield||"Net Yield"} value={`${reNetYield.toFixed(2)}%`} sub="after all costs & tax" color={reNetYield>=3?C.green:reNetYield>=2?C.gold:C.red} />
                  <Box small label="Monthly Cashflow" value={`${reCashflow>=0?"+ ":""}${euro(reCashflow)}`} sub="/month net" color={reCashflow>=0?C.green:C.red} />
                  <Box small label="AfA deduction" value={euro(reAfaAnnual)} sub="/year deductible" color={C.cyan} />
                  <Box small label="Yr1 interest deduction" value={euro(reYearOneInterest)} sub="deductible (yr 1)" color={C.cyan} />
                  <Box small label="Taxable rental income" value={euro(reTaxableRental)} sub="/year after deductions" color={reTaxableRental<100?C.green:C.gold} />
                </G3>
                <div style={{ marginTop:14 }}>
                  <InfoBox color={C.green}>
                    🇦🇹 <strong>Austrian rental tax strategy:</strong> Deductible expenses in year 1: AfA {euro(reAfaAnnual)}/yr + mortgage interest {euro(reYearOneInterest)}/yr + maintenance {euro(reMaintenance*12)}/yr = {euro(reAfaAnnual+reYearOneInterest+reMaintenance*12)} total.{" "}
                    {reTaxableRental<=0
                      ? "Your deductions exceed gross rent — zero taxable rental income in early years! Completely legal and common in Austria."
                      : `Taxable income = ${euro(reTaxableRental)}/yr → tax ≈ ${euro(reRentalTax)}/yr at ${reRentalTaxRate}%.`}
                    {" "}Note: capital gains on sale are taxed at 30% ImmoESt (Immobilienertragsteuer).
                  </InfoBox>
                </div>
              </Card>
            )}

            {/* Equity chart and Buy-vs-Rent — only for modes with a loan/property */}
            {(rePropMode === "own" || rePropMode === "invest" || rePropMode === "build") && (<div>
            {/* ComposedChart: Equity + Loan Balance + Property Value */}
            <Card title={`🏗️ ${t.re?.equityGrowth||"Equity & Portfolio Growth"}`} accent={rePropMode==="own"||rePropMode==="build"?C.gold:C.green}
              titleRight={<Tip>Bars = home equity (property value minus remaining loan). Red dashed line = remaining loan balance. Purple line = property value. Watch equity grow as you pay down the loan AND the property appreciates.</Tip>}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:12 }}>
                Property value at payoff ({rePayoffYear}): <strong style={{ color:C.gold }}>{euro(Math.round(rePropPrice * Math.pow(1+reAppreciation/100, reLoanTerm)))}</strong>
                {" "}· Total equity at payoff: <strong style={{ color:C.green }}>{euro(reMortgageSchedule[Math.min(reLoanTerm, reMortgageSchedule.length-1)]?.equity||0)}</strong>
              </div>
              <ResponsiveContainer width="100%" height={270}>
                <ComposedChart data={reMortgageSchedule.slice(0, Math.min(reLoanTerm+1, reMortgageSchedule.length))} margin={{ left:0, right:10 }}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={rePropMode==="own"?C.gold:C.green} stopOpacity={0.45}/>
                      <stop offset="95%" stopColor={rePropMode==="own"?C.gold:C.green} stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={58} />
                  <Tooltip content={<CT/>} />
                  <Bar dataKey="equity" fill="url(#eqGrad)" stroke={rePropMode==="own"?C.gold:C.green} strokeWidth={1} name={t.re?.equity||"Equity"} radius={[3,3,0,0]} />
                  <Line dataKey="balance" stroke={C.red} strokeWidth={2} dot={false} name="Remaining Loan" strokeDasharray="5 3" />
                  <Line dataKey="propValue" stroke={C.purple} strokeWidth={2} dot={false} name="Property Value" />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:10, flexWrap:"wrap" }}>
                {[
                  { color:rePropMode==="own"?C.gold:C.green, label:t.re?.equity||"Equity (bars)" },
                  { color:C.red, label:"Remaining Loan (dashed)" },
                  { color:C.purple, label:"Property Value" },
                ].map(l => (
                  <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.textSec }}>
                    <div style={{ width:12, height:4, borderRadius:2, background:l.color }} />{l.label}
                  </div>
                ))}
              </div>
            </Card>

            {/* Buy vs Rent Net Worth Chart */}
            <Card title={`⚖️ ${t.re?.buyVsRent||"Buy vs. Rent — Net Worth Comparison"}`} accent={C.purple}
              titleRight={<Tip>Solid line = total net worth if you buy (ETF portfolio + home equity). Dashed line = net worth if you rent and keep all money in ETFs. Neither is always better — appreciation rate vs. ETF return is the key variable.</Tip>}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:12 }}>
                Down payment invested today: <strong style={{ color:C.purple }}>{euro(reDownPayment)}</strong> ·
                At {(annualReturn*100).toFixed(1)}%/yr over {reLoanTerm} years = <strong style={{ color:C.cyan }}>{euro(Math.round(reDownPayment * Math.pow(1+annualReturn, reLoanTerm)))}</strong> in ETFs
              </div>
              <ResponsiveContainer width="100%" height={270}>
                <ComposedChart data={reBuyVsRentData} margin={{ left:0, right:10 }}>
                  <defs>
                    <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={rePropMode==="own"?C.gold:C.green} stopOpacity={.25}/><stop offset="95%" stopColor={rePropMode==="own"?C.gold:C.green} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="etfGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.blue} stopOpacity={.2}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={58} />
                  <Tooltip content={<CT/>} />
                  <ReferenceLine x={rePayoffYear} stroke={C.gold+"99"} strokeDasharray="4 2" label={{value:"Paid off",fill:C.gold,fontSize:9}} />
                  <Area type="monotone" dataKey={t.re?.netWorthProp||"With Property"} stroke={rePropMode==="own"?C.gold:C.green} strokeWidth={2.5} fill="url(#propGrad)" dot={false} />
                  <Area type="monotone" dataKey={t.re?.netWorthEtf||"ETF Only"} stroke={C.blue} strokeWidth={2} fill="url(#etfGrad2)" dot={false} strokeDasharray="6 3" />
                </ComposedChart>
              </ResponsiveContainer>
              {(() => {
                const yr30 = reBuyVsRentData[Math.min(30, reBuyVsRentData.length-1)];
                const propKey = t.re?.netWorthProp||"With Property";
                const etfKey = t.re?.netWorthEtf||"ETF Only";
                const propWins = yr30 && yr30[propKey] > yr30[etfKey];
                const diff = yr30 ? Math.abs((yr30[propKey]||0) - (yr30[etfKey]||0)) : 0;
                return (
                  <InfoBox color={propWins?C.gold:C.blue} style={{ marginTop:12 }}>
                    {propWins
                      ? `🏠 At year 30, owning comes out ahead by ${euro(diff)} — mainly thanks to ${reAppreciation}%/yr appreciation and forced savings via equity.`
                      : `📈 At year 30, keeping the down payment in ETFs comes out ahead by ${euro(diff)}. The ${(annualReturn*100).toFixed(1)}% ETF return outpaces ${reAppreciation}% property appreciation.`}
                    {" "}Both build substantial wealth. The real value of homeownership includes security, inflation protection, and no landlord risk — not just pure returns.
                  </InfoBox>
                );
              })()}
            </Card>

            {/* FIRE Date Impact — Own Home */}
            {rePropMode === "own" && (
              <Card title={`🎯 ${t.re?.fireImpact||"FIRE Date Impact"}`} accent={C.cyan}>
                <G2>
                  <div>
                    <G3>
                      <Box small label="Standard FIRE target" value={kilo(fireNum)} sub={`€${spending}/mo`} color={C.textSec} />
                      <Box small label="Housing benefit post-payoff" value={`-${euro(reHousingBenefit)}/mo`} sub="saved vs renting" color={C.green} />
                      <Box small label="Adjusted FIRE target" value={kilo(reAdjustedFireNum)} sub={`€${reAdjustedSpending}/mo`} color={C.cyan} />
                      <Box small label="FIRE year (standard)" value={fireYear||"2040+"} color={C.textSec} />
                      <Box small label="FIRE year (with property)" value={reFireYearAdj||"2040+"} color={reFireYearAdj&&fireYear&&reFireYearAdj<fireYear?C.green:C.cyan} />
                      <Box small label="Difference" value={reFireYearAdj&&fireYear?`${Math.abs(fireYear-(reFireYearAdj||fireYear))} yrs ${(reFireYearAdj||fireYear)<=fireYear?"earlier":"later"}`:"—"} color={(reFireYearAdj||999)<=(fireYear||999)?C.green:C.orange} />
                    </G3>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <InfoBox color={C.cyan}>
                      🏠 <strong>Two-phase calculation:</strong> During the mortgage phase ({reLoanTerm} years), your monthly savings are reduced by {euro(Math.max(0, reMortgagePayment + reMaintenance - reCurrentRent))}/mo (mortgage + maintenance − rent). Once the mortgage is paid off in {rePayoffYear}, your housing cost drops to just {euro(reMaintenance)}/mo maintenance, saving {euro(reHousingBenefit)}/mo permanently — and your required FIRE portfolio drops from <strong>{kilo(fireNum)}</strong> to <strong>{kilo(reAdjustedFireNum)}</strong>.
                    </InfoBox>
                    <InfoBox color={C.orange}>
                      ⚠️ <strong>Austrian purchase costs:</strong> Factor in ~{euro(Math.round(rePropPrice*0.06))} in one-time transaction costs: Grunderwerbsteuer (3.5%), Maklerprovision (~3%), Notarkosten (~1.5%). This is the real break-even hurdle.
                    </InfoBox>
                  </div>
                </G2>
              </Card>
            )}

            {/* Buy-to-let FIRE acceleration */}
            {rePropMode === "invest" && (
              <Card title="🎯 Buy-to-Let FIRE Acceleration" accent={C.green}>
                <G3>
                  <Box small label="Monthly net cashflow" value={`${reCashflow>=0?"+":""}${euro(reCashflow)}`} sub="/month" color={reCashflow>=0?C.green:C.red} />
                  <Box small label="Annual net cashflow" value={`${reCashflow>=0?"+":""}${euro(reCashflow*12)}`} sub="/year" color={reCashflow>=0?C.green:C.red} />
                  <Box small label="FIRE year (standard)" value={fireYear||"2040+"} color={C.textSec} />
                  <Box small label="FIRE year (with cashflow)" value={reCashflow>0?(buildProj({start:startPort,monthlySavings:totalSavings+reCashflow,ret:annualReturn,years:40}).find(r=>r.portfolio>=fireNum)?.year||"2040+"):(fireYear||"2040+")} color={C.green} />
                  <Box small label="Gross yield" value={`${reGrossYield.toFixed(1)}%`} sub="p.a." color={C.gold} />
                  <Box small label="Net yield" value={`${reNetYield.toFixed(1)}%`} sub="after tax & costs" color={reNetYield>=3?C.green:C.gold} />
                </G3>
                <div style={{ marginTop:12 }}>
                  <InfoBox color={C.green}>
                    💡 A positive cashflow of {euro(Math.max(0,reCashflow))}/month is equivalent to increasing your monthly ETF savings by the same amount.
                    Over 20 years at {(annualReturn*100).toFixed(1)}% return, that extra cashflow alone compounds to <strong>{kilo(Math.round(Math.max(0,reCashflow)*12*((Math.pow(1+annualReturn,20)-1)/annualReturn)))}</strong> in additional wealth.
                  </InfoBox>
                </div>
              </Card>
            )}
            </div>)} {/* end equity/buy-vs-rent wrapper */}
          </div>
        )}

        {/* ══ ROADMAP & DECISION LAB ════════════════════════════════════ */}
        {tab === "roadmap" && (() => {
          const coastYear = !coastDone ? (projForDates.find(r => r.portfolio >= coastTarget)?.year) : null;

          const fireTypeName = t.fireTypes[spendMode]?.name || "FIRE";
          const ageAtFire = fireYear ? fireYear - currentYear + age : null;

          // Determine property situation for narrative
          const reActiveMode = whatIfNoHouse ? "none" : rePropMode;
          const rePropLabel = reActiveMode === "own" ? `${euro(rePropPrice)} home` : reActiveMode === "build" ? `self-build project (${euro(reBuildCost+reBuildLandCost)})` : reActiveMode === "inherit" ? "inherited property" : reActiveMode === "invest" ? `${euro(rePropPrice)} buy-to-let` : null;

          const narrative = `You are building a ${fireTypeName} life. Starting at age ${age} with ${euro(startPort)} invested and ${euro(totalSavings)}/month going in`
            + `${bonus13&&bonus14?" (plus 13th & 14th pay)":bonus13?" (plus 13th pay)":bonus14?" (plus 14th pay)":""}. `
            + (lifestyleCreep > 0 ? `Lifestyle creep of ${lifestyleCreep}%/yr is factored in. ` : "")
            + (coastDone ? `You've already hit Coast FIRE — your money can grow on its own. ` : coastYear ? `By ${coastYear} (age ${coastYear-currentYear+age}), your investments will self-sustain. ` : "")
            + (reActiveMode === "none" ? `You are renting (${euro(reCurrentRent)}/mo) and keeping all savings in ETFs. ` : "")
            + (rePropLabel && reActiveMode !== "none" ? `Your ${rePropLabel} ${reActiveMode==="inherit"?"arrives without purchase cost and ":""}is fully paid by ${rePayoffYear}. ` : "")
            + (switchEnabled ? `In ${switchYear} you shift to part-time work — reclaiming time while still growing wealth. ` : "")
            + (ageAtFire ? `Full freedom arrives in ${fireYear} at age ${ageAtFire} — ${euro(spending)}/month, every month, forever.` : "Full FIRE is on the horizon — keep pushing.");

          // What-if summary — NO "What-if:" prefix here since the box already labels it
          const wiNarrative = (whatIfNoHouse||whatIfEarlyRetire||whatIfNomad)
            ? `${[whatIfNoHouse&&"no property (down payment stays in ETFs)",whatIfEarlyRetire&&"retire 2 years earlier with −10% spending",whatIfNomad&&"Nomad FIRE at €700/mo"].filter(Boolean).join(" · ")}. FIRE shifts to ${wiFireYear||"2040+"} (age ${wiFireAge||"?"}).`
            : null;

          // Timeline events — now uses reActiveMode
          const timelineEvents = [
            { year:currentYear, icon:"📍", color:C.gold, title:"Today — Your Journey Starts", sub:`Age ${age} · ${euro(startPort)} invested · saving ${euro(totalSavings)}/mo${lifestyleCreep>0?` · +${lifestyleCreep}%/yr lifestyle creep`:""}`, tier:"now" },
            ...(reActiveMode === "own" ? [{ year:currentYear+1, icon:"🏠", color:C.orange, title:`Home Purchase — ${euro(rePropPrice)}`, sub:`${reDownPct}% down · ${euro(reMortgagePayment)}/mo mortgage`, tier:"major" }] : []),
            ...(reActiveMode === "build" ? [{ year:reBuildYear, icon:"🏗️", color:C.orange, title:`Self-Build Complete — ${euro(reBuildCost+reBuildLandCost)}`, sub:`Land + build · ${euro(reMortgagePayment)}/mo mortgage starts`, tier:"major" }] : []),
            ...(reActiveMode === "invest" ? [{ year:currentYear+1, icon:"💼", color:C.green, title:`Buy-to-Let Purchase — ${euro(rePropPrice)}`, sub:`Gross yield ${reGrossYield.toFixed(1)}% · cashflow ${reCashflow>=0?"+":""}${euro(reCashflow)}/mo`, tier:"major" }] : []),
            ...(reActiveMode === "inherit" ? [{ year:currentYear+3, icon:"🎁", color:C.purple, title:`Property Inheritance — ${euro(reInheritedValue)}`, sub:"No purchase cost. Maintenance only from this point.", tier:"major" }] : []),
            ...(coastYear ? [{ year:coastYear, icon:"🏖️", color:C.cyan, title:"Coast FIRE Achieved", sub:"Portfolio self-sustains to retirement. Could stop saving now.", tier:"fire" }] : []),
            ...(switchEnabled ? [{ year:switchYear, icon:"⚡", color:C.teal, title:`Part-Time Switch — €${partTimeIncome}/mo`, sub:`More life, less work · ${partTimeSavings>0?`still saving €${partTimeSavings}/mo`:"drawing from portfolio"}`, tier:"major" }] : []),
            ...(baristaYear ? [{ year:baristaYear, icon:"☕", color:C.green, title:"Barista FIRE", sub:`Portfolio covers €${baristaGap}/mo gap. Part-time is now optional.`, tier:"fire" }] : []),
            ...((reActiveMode==="own"||reActiveMode==="build") && rePayoffYear < 9999 ? [{ year:rePayoffYear, icon:"🔑", color:C.gold, title:"Mortgage-Free!", sub:`Housing cost drops to ${euro(reMaintenance)}/mo. Saves ${euro(Math.max(0,reCurrentRent-reMaintenance))}/mo forever.`, tier:"major" }] : []),
            { year:(whatIfEarlyRetire?(wiFireYear||9999):(fireYear||9999)), icon:"🎯", color:C.gold, title:`Full ${fireTypeName} — Financial Freedom`, sub:`${euro(whatIfEarlyRetire?wiSpending:spending)}/mo · ${kilo(whatIfEarlyRetire?wiFireNum:fireNum)} portfolio · Age ${whatIfEarlyRetire?wiFireAge:(fireYear?fireYear-currentYear+age:"?")}`, tier:"fire" },
            ...(travelBudget > 100 ? [{ year:(fireYear||currentYear+12)+1, icon:"✈️", color:C.teal, title:"The Travel Chapter Begins", sub:`${euro(travelBudget)}/mo budget · ~${Math.round(travelAnnual/70)} days/year`, tier:"travel" }] : []),
          ].filter(e => e.year < 9998).sort((a,b) => a.year - b.year);

          const nextSteps = [
            !coastDone && { icon:"🚀", step:`Build to Coast FIRE (${kilo(coastTarget)}) — you're ${pct(startPort,coastTarget).toFixed(0)}% there. At ${euro(totalSavings)}/mo, ~${Math.ceil(Math.max(0,coastTarget-startPort)/totalSavings)} months away.`, color:C.cyan },
            (reActiveMode === "own") && { icon:"🏗️", step:`Save the ${euro(reDownPayment)} down payment (${reDownPct}%). Meanwhile your ETFs keep compounding.`, color:C.orange },
            (reActiveMode === "build") && { icon:"🏗️", step:`Secure land (${euro(reBuildLandCost)}) before ${reBuildYear}. Budget 10–15% contingency on the ${euro(reBuildCost)} build cost.`, color:C.orange },
            (reActiveMode === "none") && { icon:"🏠", step:`You're renting — open the Real Estate tab and model a purchase to see whether buying would move your FIRE date.`, color:C.gold },
            switchEnabled && { icon:"⚡", step:`Pre-fund your part-time switch in ${switchYear}: build a 12-month buffer (${euro(spending*12)}) before reducing income.`, color:C.teal },
            !taxRegelbest && { icon:"💰", step:`Activate Regelbesteuerungsoption once FIRE income drops below €13,539/yr — potentially 0% KeSt on all capital gains.`, color:C.gold },
            lifestyleCreep > 0 && { icon:"📈", step:`Lifestyle creep of ${lifestyleCreep}%/yr is active — check the Projection tab to see the timeline cost vs. keeping spending flat.`, color:C.pink },
            !switchEnabled && baristaYear && fireYear && fireYear-baristaYear > 2 && { icon:"☕", step:`Barista FIRE (${kilo(baristaTarget)}) is reachable in ${baristaYear} — ${fireYear-baristaYear} years before full FIRE. Consider it as a bridge.`, color:C.green },
          ].filter(Boolean).slice(0,3);

          return (
            <div>
              <div style={{ display:"flex", gap:4, marginBottom:18, background:C.surface, borderRadius:12, padding:4 }}>
                {[["roadmap","🗺️ Life Roadmap"],["lab","🧪 Decision Lab"]].map(([id,lbl]) => (
                  <button key={id} onClick={() => setRoadmapSubTab(id)}
                    style={{ flex:1, background:roadmapSubTab===id?C.card:"transparent", border:`1px solid ${roadmapSubTab===id?C.border:"transparent"}`, borderRadius:9, padding:"9px 6px", cursor:"pointer", color:roadmapSubTab===id?C.text:C.textSec, fontSize:12, fontWeight:roadmapSubTab===id?700:400, fontFamily:C.font, transition:"all 0.15s" }}>
                    {lbl}
                  </button>
                ))}
              </div>

              {/* ── LIFE ROADMAP ───────────────────────────────────────── */}
              {roadmapSubTab === "roadmap" && <div>
                <Card title="📖 Your Life Story" accent={C.gold}>
                  <div style={{ fontSize:14, color:C.text, lineHeight:2.1, fontFamily:C.font, marginBottom:wiNarrative?14:0 }}>
                    {narrative.split(/(\d{4}|age \d+|Coast FIRE|Barista FIRE|financial freedom)/gi).map((part, i) =>
                      /^(\d{4}|age \d+|coast fire|barista fire|financial freedom)$/i.test(part)
                        ? <strong key={i} style={{ color:C.gold }}>{part}</strong>
                        : <span key={i}>{part}</span>
                    )}
                  </div>
                  {wiNarrative && <div style={{ background:C.purple+"15", border:`1px solid ${C.purple}44`, borderRadius:10, padding:"10px 14px", fontSize:13, color:C.purpleLight, lineHeight:1.7 }}>🔀 <strong>What-If:</strong> {wiNarrative}</div>}
                </Card>

                <Card title="🔀 What-If Scenarios" accent={C.purple} titleRight={<Tip>Toggle any scenario to instantly see how a major life decision changes your entire roadmap.</Tip>}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))", gap:10 }}>
                    {[
                      { key:"noHouse", on:whatIfNoHouse, set:setWhatIfNoHouse, color:C.orange, icon:"🚫🏠", title:"Skip the House", desc:rePropPrice>0?`Keep ${euro(reDownPayment)} in ETFs instead`:"No property planned" },
                      { key:"earlyRetire", on:whatIfEarlyRetire, set:setWhatIfEarlyRetire, color:C.cyan, icon:"⏰", title:"Retire 2 Years Earlier", desc:`Accept 10% less (${euro(Math.round(spending*0.9))}/mo instead of ${euro(spending)}/mo)` },
                      { key:"nomad", on:whatIfNomad, set:setWhatIfNomad, color:C.teal, icon:"🌍", title:"Go Nomad FIRE", desc:`€700/mo in Asia/Balkans — FIRE target becomes ${kilo(Math.round(700*12*legacyMult))}` },
                    ].map(opt => (
                      <div key={opt.key} onClick={() => opt.set(!opt.on)}
                        style={{ background:opt.on?opt.color+"18":C.surface, border:`2px solid ${opt.on?opt.color:C.border}`, borderRadius:12, padding:"14px", cursor:"pointer", transition:"all 0.2s" }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>{opt.icon}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:opt.on?opt.color:C.text, marginBottom:4 }}>{opt.title}</div>
                        <div style={{ fontSize:11, color:C.textMuted, lineHeight:1.6 }}>{opt.desc}</div>
                        {opt.on && <div style={{ marginTop:8, fontSize:12, fontWeight:700, color:opt.color }}>FIRE: {wiFireYear||"2040+"} · age {wiFireAge||"?"}</div>}
                      </div>
                    ))}
                  </div>
                  {(whatIfNoHouse||whatIfEarlyRetire||whatIfNomad) && (
                    <div style={{ marginTop:14 }}>
                      <G3>
                        <Box small label="What-If FIRE Year" value={wiFireYear||"2040+"} sub={`age ${wiFireAge||"?"}`} color={C.purple} />
                        <Box small label="vs Base Plan" value={wiFireYear&&fireYear?`${Math.abs(wiFireYear-fireYear)} yrs ${wiFireYear<fireYear?"earlier":"later"}`:"—"} color={wiFireYear&&fireYear&&wiFireYear<fireYear?C.green:C.orange} />
                        <Box small label="What-If Target" value={kilo(wiFireNum)} sub={`€${wiSpending}/mo`} color={C.purple} />
                      </G3>
                    </div>
                  )}
                </Card>

                <Card title="🗓️ Your Life Timeline" accent={C.gold}>
                  <div style={{ position:"relative", paddingLeft:32 }}>
                    <div style={{ position:"absolute", left:11, top:8, bottom:8, width:2, background:`linear-gradient(180deg,${C.gold}88,${C.border})`, borderRadius:2 }} />
                    {timelineEvents.map((evt, i) => {
                      const projRow = proj.find(r => r.year >= evt.year);
                      const portAtYear = projRow?.portfolio || startPort;
                      const isFire = evt.tier==="fire"; const isNow = evt.tier==="now";
                      const isLast = i===timelineEvents.length-1;
                      return (
                        <div key={`${evt.year}-${i}`} style={{ position:"relative", marginBottom:isLast?0:24 }}>
                          <div style={{ position:"absolute", left:-32, top:14, width:14, height:14, borderRadius:"50%", background:isFire?evt.color:isNow?"#fff":C.surface, border:`2px solid ${evt.color}`, boxShadow:isFire?`0 0 14px ${evt.color}77`:isNow?`0 0 8px ${C.gold}88`:"none", zIndex:1 }} />
                          <div style={{ background:isFire?evt.color+"12":isNow?C.gold+"08":C.surface, border:`1px solid ${isFire?evt.color+"44":isNow?C.gold+"33":C.border}`, borderRadius:14, padding:"14px 16px" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, flexWrap:"wrap" }}>
                              <div style={{ flex:1 }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                                  <span style={{ fontSize:20 }}>{evt.icon}</span>
                                  <div>
                                    <div style={{ fontSize:13, fontWeight:700, color:isFire?evt.color:isNow?C.gold:C.text }}>{evt.title}</div>
                                    <div style={{ fontSize:10, color:C.textMuted }}>{evt.sub}</div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign:"right", flexShrink:0 }}>
                                <div style={{ fontSize:16, fontWeight:700, color:evt.color, fontFamily:C.mono }}>{evt.year}</div>
                                <div style={{ fontSize:10, color:C.textMuted }}>Age {evt.year-currentYear+age}</div>
                                {evt.year>currentYear && <div style={{ fontSize:10, color:C.textMuted }}>in {evt.year-currentYear} yr{evt.year-currentYear!==1?"s":""}</div>}
                              </div>
                            </div>
                            {!isNow && (
                              <div style={{ marginTop:10 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3, fontSize:10, color:C.textMuted }}>
                                  <span>Portfolio at this point</span>
                                  <span style={{ color:evt.color, fontFamily:C.mono, fontWeight:600 }}>{kilo(portAtYear)}</span>
                                </div>
                                <ProgressBar v={portAtYear} max={fireNum} color={evt.color} h={4} />
                                <div style={{ fontSize:9, color:C.textMuted, marginTop:2 }}>{pct(portAtYear,fireNum).toFixed(0)}% of FIRE target ({kilo(fireNum)})</div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card title="✅ Your Next 3 Actions" accent={C.green} titleRight={<Tip>Highest-leverage moves based on your current numbers.</Tip>}>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {nextSteps.map((s, i) => (
                      <div key={i} style={{ background:C.surface, border:`1px solid ${s.color}33`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12, alignItems:"flex-start" }}>
                        <div style={{ width:26, height:26, borderRadius:"50%", background:s.color+"22", border:`1px solid ${s.color}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:14 }}>{s.icon}</div>
                        <div>
                          <div style={{ fontSize:10, color:s.color, fontWeight:700, marginBottom:3, textTransform:"uppercase", letterSpacing:1 }}>Action {i+1}</div>
                          <div style={{ fontSize:13, color:C.text, lineHeight:1.7 }}>{s.step}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>}

              {/* ── DECISION LAB ──────────────────────────────────────── */}
              {roadmapSubTab === "lab" && <div>
                <InfoBox color={C.purple}>
                  🧪 <strong>Decision Lab:</strong> Save a snapshot of your current plan, then change any settings and save another. Compare them side-by-side to find your best life path. Snapshots survive page refreshes.
                </InfoBox>

                <div style={{ marginTop:14, marginBottom:18, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                  <button onClick={captureScenario}
                    style={{ background:`linear-gradient(135deg,${C.purple},#6d28d9)`, border:"none", borderRadius:12, padding:"12px 20px", cursor:"pointer", color:"#fff", fontWeight:700, fontSize:13, fontFamily:C.font, boxShadow:`0 4px 20px ${C.purple}44` }}>
                    📸 Save Current Plan as Snapshot
                  </button>
                  {savedScenarios.length > 0 && (
                    <button onClick={() => setSavedScenarios([])}
                      style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", cursor:"pointer", color:C.textMuted, fontSize:12, fontFamily:C.font }}>
                      🗑️ Clear All
                    </button>
                  )}
                  <span style={{ fontSize:12, color:C.textMuted }}>{savedScenarios.length}/4 snapshots</span>
                </div>

                {savedScenarios.length === 0 && (
                  <div style={{ textAlign:"center", padding:"40px 16px", color:C.textMuted, fontSize:13, background:C.card, borderRadius:16, border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📸</div>
                    Save your current plan, change some settings, save another snapshot — then watch the comparison appear here.
                  </div>
                )}

                {savedScenarios.length > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:10, marginBottom:18 }}>
                    {savedScenarios.map((s, i) => (
                      <div key={s.id} style={{ background:C.card, border:`1px solid ${C.purple}33`, borderRadius:14, padding:"14px 16px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                          <span style={{ fontSize:14, fontWeight:700, color:C.purple }}>{s.label}</span>
                          <span style={{ fontSize:10, color:C.textMuted }}>{s.timestamp}</span>
                        </div>
                        {[["Spending",euro(s.spending)+"/mo"],["Portfolio",kilo(s.portfolio)],["FIRE Year",s.fireYear||"—"],["FIRE Age",s.fireAge||"—"],["Mode",s.spendMode],["Property",s.rePropMode==="none"?"Renting":s.rePropMode==="inherit"?"Inherited":s.rePropPrice>0?`${s.rePropMode} · ${kilo(s.rePropPrice)}`:"None"],["Bonuses",[s.bonus13&&"13th",s.bonus14&&"14th"].filter(Boolean).join("+")||"None"],["Lifestyle creep",s.lifestyleCreep>0?`+${s.lifestyleCreep}%/yr`:"None"],["Tax",s.taxRegelbest?"0% KeSt":s.taxHarvesting?"Harvest":"Standard"],["Part-time",s.switchEnabled?String(s.switchYear):"No"]].map(([k,v]) => (
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:`1px solid ${C.border}`, fontSize:11 }}>
                            <span style={{ color:C.textMuted }}>{k}</span><span style={{ color:C.text, fontFamily:C.mono }}>{v}</span>
                          </div>
                        ))}
                        <button onClick={() => setSavedScenarios(prev => prev.filter((_,j) => j!==i))}
                          style={{ width:"100%", marginTop:10, background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px", cursor:"pointer", color:C.textMuted, fontSize:11 }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                {savedScenarios.length >= 2 && (() => {
                  const A = savedScenarios[savedScenarios.length-2];
                  const B = savedScenarios[savedScenarios.length-1];
                  const fireAgeDiff = A.fireAge && B.fireAge ? B.fireAge - A.fireAge : null;
                  const wealthDiff = B.portfolioAt90 - A.portfolioAt90;
                  const analysis = [
                    fireAgeDiff!==null && (fireAgeDiff<0?`${A.label} retires ${Math.abs(fireAgeDiff)} years earlier than ${B.label}.`:fireAgeDiff>0?`${B.label} retires ${fireAgeDiff} years earlier — a meaningful gain.`:"Both retire at the same age."),
                    wealthDiff!==0 && `${wealthDiff>0?B.label:A.label} ends up ${kilo(Math.abs(wealthDiff))} wealthier at age 90.`,
                    A.rePropPrice>0&&B.rePropPrice===0 && `${A.label} includes a property, reducing long-term spending post-payoff.`,
                    B.rePropPrice>0&&A.rePropPrice===0 && `${B.label} includes a property — housing security at the cost of liquidity.`,
                    A.taxRegelbest&&!B.taxRegelbest && `${A.label} uses Regelbesteuerungsoption (0% KeSt) — a major tax advantage.`,
                    !A.taxRegelbest&&B.taxRegelbest && `${B.label} uses Regelbesteuerungsoption — its key long-term edge.`,
                    A.spending>B.spending && `${A.label} is more ambitious lifestyle-wise (${euro(A.spending)}/mo vs ${euro(B.spending)}/mo).`,
                  ].filter(Boolean).join(" ");

                  const chartData = [
                    { name:"Now", [A.label]:A.portfolio, [B.label]:B.portfolio },
                    { name:"At FIRE", [A.label]:A.fireNum||0, [B.label]:B.fireNum||0 },
                    { name:"Age 90", [A.label]:A.portfolioAt90, [B.label]:B.portfolioAt90 },
                  ];

                  return (
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:C.purple, textTransform:"uppercase", marginBottom:12 }}>Comparing: {A.label} vs {B.label}</div>
                      <G3>
                        <Box small label="FIRE Age Δ" value={fireAgeDiff===null?"—":fireAgeDiff===0?"Same":`${Math.abs(fireAgeDiff)} yrs`} sub={fireAgeDiff&&fireAgeDiff!==0?(fireAgeDiff<0?`${B.label} later`:`${B.label} earlier`):""} color={fireAgeDiff!==null&&fireAgeDiff>0?C.green:fireAgeDiff!==null&&fireAgeDiff<0?C.orange:C.textSec} />
                        <Box small label="Wealth @ 90 Δ" value={wealthDiff===0?"Same":kilo(Math.abs(wealthDiff))} sub={wealthDiff>0?`${B.label} richer`:wealthDiff<0?`${A.label} richer`:""} color={wealthDiff>0?C.green:wealthDiff<0?C.orange:C.textSec} />
                        <Box small label="Est. Tax Δ" value={A.totalTaxEst===B.totalTaxEst?"Same":kilo(Math.abs(B.totalTaxEst-A.totalTaxEst))} sub={B.totalTaxEst<A.totalTaxEst?`${B.label} saves more`:`${A.label} saves more`} color={B.totalTaxEst<A.totalTaxEst?C.green:C.orange} />
                      </G3>

                      <Card title="Side-by-Side Comparison" accent={C.purple} style={{ marginTop:14 }}>
                        <div style={{ overflowX:"auto" }}>
                          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                            <thead><tr style={{ background:C.surface }}>
                              <th style={{ padding:"8px 12px", textAlign:"left", color:C.textMuted, fontSize:10, textTransform:"uppercase" }}>Metric</th>
                              <th style={{ padding:"8px 12px", textAlign:"right", color:C.purple, fontSize:11, fontWeight:700 }}>{A.label}</th>
                              <th style={{ padding:"8px 12px", textAlign:"right", color:C.cyan, fontSize:11, fontWeight:700 }}>{B.label}</th>
                              <th style={{ padding:"8px 12px", textAlign:"right", color:C.textMuted, fontSize:10 }}>Δ</th>
                            </tr></thead>
                            <tbody>
                              {[
                                {l:"Monthly Spending",va:euro(A.spending),vb:euro(B.spending),d:A.spending!==B.spending?(A.spending>B.spending?`${A.label} €${A.spending-B.spending} higher`:`${B.label} €${B.spending-A.spending} higher`):"same"},
                                {l:"FIRE Year",va:A.fireYear||"—",vb:B.fireYear||"—",d:A.fireYear&&B.fireYear?(B.fireYear===A.fireYear?"same":`${Math.abs(B.fireYear-A.fireYear)} yrs ${B.fireYear<A.fireYear?`${B.label} earlier`:`${A.label} earlier`}`):"—"},
                                {l:"FIRE Age",va:A.fireAge||"—",vb:B.fireAge||"—",d:A.fireAge&&B.fireAge?(B.fireAge===A.fireAge?"same":`${B.label} age ${B.fireAge} vs ${A.label} age ${A.fireAge}`):"—"},
                                {l:"FIRE Target",va:kilo(A.fireNum),vb:kilo(B.fireNum),d:A.fireNum===B.fireNum?"same":kilo(Math.abs(A.fireNum-B.fireNum))+" diff"},
                                {l:"Wealth at 90",va:kilo(A.portfolioAt90),vb:kilo(B.portfolioAt90),d:wealthDiff===0?"same":kilo(Math.abs(wealthDiff))+" diff"},
                                {l:"Est. Total Tax",va:A.taxRegelbest?"~€0":kilo(A.totalTaxEst),vb:B.taxRegelbest?"~€0":kilo(B.totalTaxEst),d:""},
                                {l:"Property",va:A.rePropMode==="none"?"Renting":A.rePropMode==="inherit"?"Inherited":A.rePropPrice>0?`${A.rePropMode} · ${kilo(A.rePropPrice)}`:"None",vb:B.rePropMode==="none"?"Renting":B.rePropMode==="inherit"?"Inherited":B.rePropPrice>0?`${B.rePropMode} · ${kilo(B.rePropPrice)}`:"None",d:""},
                                {l:"Lifestyle Creep",va:A.lifestyleCreep>0?`+${A.lifestyleCreep}%/yr`:"None",vb:B.lifestyleCreep>0?`+${B.lifestyleCreep}%/yr`:"None",d:""},
                                {l:"Part-Time",va:A.switchEnabled?String(A.switchYear):"No",vb:B.switchEnabled?String(B.switchYear):"No",d:""},
                                {l:"KV-Status",va:A.svStatus||"—",vb:B.svStatus||"—",d:A.svMonthlyCost!==B.svMonthlyCost?`Δ €${Math.abs((A.svMonthlyCost||0)-(B.svMonthlyCost||0))}/mo`:"gleich"},
                              ].map(row => (
                                <tr key={row.l} style={{ borderBottom:`1px solid ${C.border}` }}>
                                  <td style={{ padding:"8px 12px", color:C.textSec }}>{row.l}</td>
                                  <td style={{ padding:"8px 12px", textAlign:"right", color:C.text, fontFamily:C.mono }}>{row.va}</td>
                                  <td style={{ padding:"8px 12px", textAlign:"right", color:C.text, fontFamily:C.mono }}>{row.vb}</td>
                                  <td style={{ padding:"8px 12px", textAlign:"right", color:C.textMuted, fontSize:10 }}>{row.d}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>

                      <Card title="📊 Net Worth Comparison" accent={C.purple} style={{ marginTop:14 }}>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData} margin={{ left:0, right:10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                            <XAxis dataKey="name" tick={{fill:C.textMuted,fontSize:11}} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={kilo} tick={{fill:C.textMuted,fontSize:10}} axisLine={false} tickLine={false} width={54} />
                            <Tooltip content={<CT/>} />
                            <Bar dataKey={A.label} fill={C.purple} radius={[3,3,0,0]} />
                            <Bar dataKey={B.label} fill={C.cyan} radius={[3,3,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>

                      <div style={{ background:`linear-gradient(135deg,${C.purple}18,${C.cyan}12)`, border:`1px solid ${C.purple}44`, borderRadius:14, padding:"18px 20px", marginTop:14 }}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:C.purple, textTransform:"uppercase", marginBottom:10 }}>🤖 Analysis</div>
                        <p style={{ fontSize:13, color:C.text, lineHeight:1.9, margin:"0 0 10px" }}>{analysis || "Both plans are very similar — tweak spending mode, property, or tax strategy to see a meaningful difference."}</p>
                        <div style={{ fontSize:12, color:C.textMuted, lineHeight:1.7 }}>
                          <strong style={{ color:C.textSec }}>Verdict: </strong>
                          {fireAgeDiff!==null&&fireAgeDiff>0?`${B.label} wins on speed (${fireAgeDiff} fewer years of work). ${wealthDiff<0?`But ${A.label} builds ${kilo(Math.abs(wealthDiff))} more wealth by 90, making it stronger for legacy goals.`:""}`:
                          fireAgeDiff!==null&&fireAgeDiff<0?`${A.label} wins on speed (${Math.abs(fireAgeDiff)} fewer years of work). ${wealthDiff>0?`But ${B.label} builds ${kilo(wealthDiff)} more wealth by 90.`:""}`:
                          "Neither plan is clearly superior — this is a lifestyle choice, not just a math problem. Trust your values."}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>}
            </div>
          );
        })()}

      </div>
    </div>
  );
}

// ─── Tax Accordion ─────────────────────────────────────────────────────────────
function TaxAccordion({ title, val, urgent, color, desc }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:C.card, border:`1px solid ${open?color+"44":C.border}`, borderRadius:10, overflow:"hidden", marginBottom:8, transition:"border-color 0.15s" }}>
      <button onClick={() => setOpen(!open)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", fontFamily:C.font, textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
          {urgent && <span style={{ background:C.gold, color:"#000", fontSize:8, fontWeight:800, padding:"2px 6px", borderRadius:4, letterSpacing:1, whiteSpace:"nowrap" }}>PRIORITY</span>}
          <span style={{ color:C.text, fontWeight:600, fontSize:13 }}>{title}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{val}</span>
          <span style={{ color:C.textMuted, fontSize:12, display:"inline-block", transform:open?"rotate(180deg)":"none", transition:"transform 0.15s" }}>▾</span>
        </div>
      </button>
      {open && <div style={{ padding:"0 16px 14px", fontSize:12, color:C.textSec, lineHeight:1.8, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>{desc}</div>}
    </div>
  );
}

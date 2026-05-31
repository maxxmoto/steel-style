import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

// ─── ГЛОБАЛЬНЫЕ СТИЛИ ────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Unbounded:wght@300;400;600;700;900&family=Manrope:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Manrope', sans-serif;
      background: #F5F3EF;
      color: #161412;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: #ECEAE5; }
    ::-webkit-scrollbar-thumb { background: #161412; border-radius: 2px; }

    .f-display  { font-family: 'Playfair Display', serif; }
    .f-heading  { font-family: 'Unbounded', sans-serif; }
    .f-body     { font-family: 'Manrope', sans-serif; }

    /* Металлический шиммер на заголовке */
    @keyframes metalShimmer {
      0%   { background-position: -300% center; }
      100% { background-position: 300% center; }
    }
    .shimmer {
      background: linear-gradient(90deg, #161412 0%, #8a8278 30%, #C8C3BC 50%, #8a8278 70%, #161412 100%);
      background-size: 300% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: metalShimmer 5s linear infinite;
    }

    /* Бегущая строка */
    @keyframes marqueeRun { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .marquee-inner { animation: marqueeRun 22s linear infinite; display: flex; width: max-content; }

    /* Карточки */
    .card-lift {
      transition: transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94),
                  box-shadow 0.45s ease;
    }
    .card-lift:hover { transform: translateY(-10px); box-shadow: 0 40px 80px rgba(0,0,0,0.11); }

    .img-wrap { overflow: hidden; }
    .img-inner { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
    .img-wrap:hover .img-inner { transform: scale(1.07); }

    /* Карточка с блеском */
    .shine { position: relative; overflow: hidden; }
    .shine::after {
      content: '';
      position: absolute; top: -50%; left: -70%;
      width: 25%; height: 200%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
      transform: skewX(-15deg);
      transition: left 0.7s ease;
      pointer-events: none;
    }
    .shine:hover::after { left: 130%; }

    /* Стеклянная карточка */
    .glass {
      backdrop-filter: blur(24px) saturate(160%);
      background: rgba(255,255,255,0.72);
      border: 1px solid rgba(255,255,255,0.88);
    }

    /* Ховер инвертирование */
    .invert-card { transition: background 0.4s, border-color 0.4s; }
    .invert-card:hover { background: #161412 !important; border-color: transparent !important; }
    .invert-card:hover .ic-title { color: white !important; }
    .invert-card:hover .ic-desc  { color: rgba(255,255,255,0.45) !important; }
    .invert-card:hover .ic-icon  { color: rgba(255,255,255,0.5) !important; }

    /* Плавный пульс для шага */
    @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(22,20,18,0.15)} 50%{box-shadow:0 0 0 12px rgba(22,20,18,0)} }

    input, textarea { outline: none; background: transparent; }
    ::placeholder { color: rgba(255,255,255,0.22); }
    @media(max-width:900px){
      .hide-mob { display: none !important; }
      .mob-col  { flex-direction: column !important; }
      .mob-full { grid-template-columns: 1fr !important; }
      .mob-pad  { padding: 80px 24px !important; }
    }
  `}</style>
);

// ─── МЕТАЛЛИЧЕСКИЙ ПЛЕЙСХОЛДЕР ──────────────────────────────────────────────
const MetalBg = ({ style, variant = 0, label }) => {
  const pals = [
    "linear-gradient(140deg,#C8C3BC 0%,#E8E4DF 30%,#B4B0AB 60%,#D4D0CB 100%)",
    "linear-gradient(160deg,#D0CCC7 0%,#ECEAE5 35%,#BCBAB5 65%,#E0DDD8 100%)",
    "linear-gradient(120deg,#B8B4AF 0%,#D8D4CF 35%,#A8A4A0 65%,#CCCAC5 100%)",
    "linear-gradient(150deg,#DEDAD5 0%,#C4C0BB 30%,#ECEAE5 60%,#B0ACA8 100%)",
    "linear-gradient(110deg,#C0BCB7 0%,#E4E0DB 40%,#B0ACA8 70%,#D8D4CF 100%)",
    "linear-gradient(165deg,#BCBAB5 0%,#D4D0CB 35%,#A4A09C 60%,#CCCAC5 100%)",
  ];
  return (
    <div style={{ position: "relative", overflow: "hidden", ...style, background: pals[variant % pals.length] }}>
      {/* Металлические полосы */}
      <div style={{ position:"absolute",inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.04) 3px,rgba(255,255,255,0.04) 4px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute",inset:0, backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(0,0,0,0.025) 48px,rgba(0,0,0,0.025) 49px)", pointerEvents:"none" }}/>
      {label && (
        <div style={{ position:"absolute",bottom:14,left:14,background:"rgba(255,255,255,0.82)",backdropFilter:"blur(8px)",padding:"5px 14px",borderRadius:3,fontSize:10,fontFamily:"Unbounded,sans-serif",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:"#161412" }}>
          {label}
        </div>
      )}
    </div>
  );
};

// ─── АНИМИРОВАННЫЙ СЧЁТЧИК ──────────────────────────────────────────────────
const Counter = ({ to, suffix = "", dur = 2 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = to / (dur * 60);
    const id = setInterval(() => {
      v += step;
      if (v >= to) { setVal(to); clearInterval(id); }
      else setVal(Math.floor(v));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [inView]);
  return <span ref={ref}>{val}{suffix}</span>;
};

// ─── НАВИГАЦИЯ ───────────────────────────────────────────────────────────────
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [["Услуги","#services"],["Портфолио","#portfolio"],["Процесс","#process"],["О нас","#about"],["Контакты","#contact"]];
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.25,0.46,0.45,0.94] }}
      style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding: scrolled ? "14px 48px" : "26px 48px",
        transition:"all 0.4s ease",
        background: scrolled ? "rgba(245,243,239,0.93)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.07)" : "none",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}
    >
      {/* Логотип */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, background:"#161412", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 15L9 3L15 15" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.5 10.5H12.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="f-heading" style={{ fontSize:16, fontWeight:700, letterSpacing:"0.05em", color:"#161412" }}>STEEL STYLE</span>
      </div>

      {/* Ссылки */}
      <div className="hide-mob" style={{ display:"flex", gap:36, alignItems:"center" }}>
        {links.map(([label, href]) => (
          <a key={label} href={href} style={{ fontFamily:"Manrope,sans-serif", fontSize:12, fontWeight:500, letterSpacing:"0.05em", textDecoration:"none", color:"#161412", textTransform:"uppercase", transition:"opacity 0.2s" }}
            onMouseEnter={e=>e.target.style.opacity="0.4"}
            onMouseLeave={e=>e.target.style.opacity="1"}
          >{label}</a>
        ))}
        <a href="#contact" style={{
          background:"#161412", color:"white", padding:"11px 26px",
          borderRadius:40, fontSize:12, fontWeight:600, letterSpacing:"0.07em",
          textDecoration:"none", textTransform:"uppercase", fontFamily:"Manrope,sans-serif",
          transition:"all 0.3s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background="#333";e.currentTarget.style.transform="scale(1.04)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#161412";e.currentTarget.style.transform="scale(1)";}}
        >Получить смету</a>
      </div>
    </motion.nav>
  );
};

// ─── ГЕРОЙ ───────────────────────────────────────────────────────────────────
const Hero = () => {
  const { scrollY } = useScroll();
  const bgY    = useTransform(scrollY, [0,600], [0,-100]);
  const fgOp   = useTransform(scrollY, [0,500], [1,0]);

  return (
    <section style={{ minHeight:"100vh", position:"relative", display:"flex", flexDirection:"column", justifyContent:"flex-end", overflow:"hidden", background:"#EDE9E3" }}>

      {/* Параллакс-фон */}
      <motion.div style={{ position:"absolute", inset:0, y:bgY }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(155deg,#E8E4DF 0%,#F0EDE8 45%,#DEDAD5 100%)" }}/>
        {/* Сетка */}
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.055 }} preserveAspectRatio="none">
          {Array.from({length:14}).map((_,i)=>(
            <line key={"v"+i} x1={`${(i+1)*6.67}%`} y1="0" x2={`${(i+1)*6.67}%`} y2="100%" stroke="#161412" strokeWidth="0.5"/>
          ))}
          {Array.from({length:10}).map((_,i)=>(
            <line key={"h"+i} x1="0" y1={`${(i+1)*10}%`} x2="100%" y2={`${(i+1)*10}%`} stroke="#161412" strokeWidth="0.5"/>
          ))}
        </svg>

        {/* Большой металлический блок справа */}
        <div style={{ position:"absolute", right:"-3%", top:"6%", width:"50%", height:"88%", borderRadius:6, overflow:"hidden", boxShadow:"0 80px 160px rgba(0,0,0,0.14)" }}>
          <MetalBg style={{ width:"100%", height:"100%" }} variant={0}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to left, transparent 55%, #EDE9E3)" }}/>
        </div>

        {/* Малый блок */}
        <div style={{ position:"absolute", right:"42%", top:"18%", width:"16%", height:"30%", borderRadius:6, overflow:"hidden", boxShadow:"0 28px 56px rgba(0,0,0,0.1)", border:"1px solid rgba(255,255,255,0.75)" }}>
          <MetalBg style={{ width:"100%", height:"100%" }} variant={3}/>
        </div>

        {/* Декоративная вертикальная линия */}
        <div style={{ position:"absolute", left:220, top:"15%", width:1, height:"60%", background:"linear-gradient(to bottom, transparent, rgba(22,20,18,0.12), transparent)" }}/>
      </motion.div>

      {/* Контент */}
      <motion.div style={{ opacity:fgOp, position:"relative", zIndex:2, padding:"0 60px 90px", maxWidth:700 }}>

        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.3 }}
          style={{ display:"flex", alignItems:"center", gap:14, marginBottom:32 }}
        >
          <div style={{ width:28, height:1, background:"rgba(22,20,18,0.5)" }}/>
          <span className="f-heading" style={{ fontSize:10, fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"#7A7470" }}>Осн. 2004 · Москва</span>
        </motion.div>

        <motion.h1
          initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} transition={{ duration:1.1, delay:0.45 }}
          className="f-display"
          style={{ fontSize:"clamp(50px,7.5vw,108px)", fontWeight:500, lineHeight:0.92, letterSpacing:"-0.02em", marginBottom:34, color:"#161412" }}
        >
          Там, где<br/>
          <em style={{ fontStyle:"italic", fontWeight:400 }}>металл</em><br/>
          <span className="shimmer">становится<br/>искусством</span>
        </motion.h1>

        <motion.p
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.75 }}
          style={{ fontSize:16, fontWeight:300, lineHeight:1.8, color:"#5A5450", maxWidth:460, marginBottom:48 }}
        >
          Премиальные металлоконструкции и художественная ковка — лестницы, ограждения, ворота и мебель с архитектурной точностью.
        </motion.p>

        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.95 }}
          style={{ display:"flex", gap:14, flexWrap:"wrap" }}
        >
          {[
            { label:"Смотреть проекты", href:"#portfolio", filled:true },
            { label:"Консультация", href:"#contact", filled:false },
          ].map(btn=>(
            <a key={btn.label} href={btn.href} style={{
              padding:"17px 40px", borderRadius:5, fontSize:12, fontWeight:700,
              letterSpacing:"0.1em", textDecoration:"none", textTransform:"uppercase",
              fontFamily:"Unbounded,sans-serif", display:"flex", alignItems:"center", gap:10,
              background: btn.filled ? "#161412" : "transparent",
              color: btn.filled ? "white" : "#161412",
              border: btn.filled ? "none" : "1.5px solid rgba(22,20,18,0.28)",
              transition:"all 0.3s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)"; if(btn.filled) e.currentTarget.style.background="#333"; else e.currentTarget.style.borderColor="#161412";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"; if(btn.filled) e.currentTarget.style.background="#161412"; else e.currentTarget.style.borderColor="rgba(22,20,18,0.28)";}}
            >
              {btn.label}
              {btn.filled && <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5H11.5M8 2.5L11.5 6.5L8 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* Статистика */}
      <motion.div
        initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:1.2 }}
        style={{ position:"absolute", bottom:88, right:56, zIndex:3, display:"flex", gap:14 }}
      >
        {[
          { val:20, suf:"+", label:"Лет опыта" },
          { val:1400, suf:"+", label:"Проектов" },
          { val:98, suf:"%", label:"Индивидуально" },
        ].map((s,i)=>(
          <motion.div key={i}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.35+i*0.1 }}
            className="glass"
            style={{ padding:"22px 28px", borderRadius:10, minWidth:134 }}
          >
            <div className="f-display" style={{ fontSize:42, fontWeight:400, lineHeight:1, color:"#161412", marginBottom:5 }}>
              <Counter to={s.val} suffix={s.suf}/>
            </div>
            <div className="f-heading" style={{ fontSize:9, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"#8A8278" }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Скролл-индикатор */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.9 }}
        style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}
      >
        <span className="f-heading" style={{ fontSize:9, letterSpacing:"0.25em", textTransform:"uppercase", color:"#A09890" }}>SCROLL</span>
        <motion.div animate={{ y:[0,9,0] }} transition={{ duration:1.6, repeat:Infinity }}
          style={{ width:1, height:36, background:"linear-gradient(to bottom,#161412,transparent)" }}
        />
      </motion.div>
    </section>
  );
};

// ─── БЕГУЩАЯ СТРОКА ──────────────────────────────────────────────────────────
const Marquee = () => {
  const items = ["Художественная ковка","Архитектурный металл","Точная работа","Премиум ограждения","Лестницы на заказ","Стальные ворота","Кованая мебель","Промышленный дизайн"];
  const all = [...items,...items];
  return (
    <div style={{ background:"#161412", padding:"17px 0", overflow:"hidden" }}>
      <div className="marquee-inner">
        {all.map((t,i)=>(
          <span key={i} className="f-heading" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color: i%2===0?"white":"#5A5450", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:56, marginRight:56 }}>
            {t}
            <span style={{ width:4, height:4, borderRadius:"50%", background:"#3A3630", display:"inline-block" }}/>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── УСЛУГИ ──────────────────────────────────────────────────────────────────
const services = [
  { title:"Ограждения",   desc:"Архитектурные ограждения для интерьера и экстерьера из кованого и нержавеющего металла.", tag:"Интерьер / Экстерьер", variant:1 },
  { title:"Ворота",       desc:"Автоматические и ручные ворота — классическая ковка или современный минимализм.", tag:"Безопасность и стиль", variant:2 },
  { title:"Лестницы",     desc:"Лестничные конструкции: косоуры, ступени, балясины. В сыром или финишном виде.", tag:"Конструкции", variant:3 },
  { title:"Кованая мебель",desc:"Уникальные столы, стулья, стеллажи — металл как дизайнерский материал.", tag:"Эксклюзив", variant:4 },
  { title:"Металлоконструкции",desc:"Несущие пергола, навесы, антресоли и архитектурные элементы.", tag:"Инжиниринг", variant:0 },
  { title:"Под заказ",    desc:"От концепции до монтажа — полностью адаптировано под вашу идею.", tag:"Индивидуально", variant:5 },
];

const Services = () => {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  return (
    <section id="services" ref={ref} style={{ padding:"120px 56px", background:"#F5F3EF" }}>
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        <motion.div initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.8}} style={{marginBottom:72}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <div style={{width:28,height:1,background:"#161412"}}/>
            <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"#8A8278"}}>Что мы делаем</span>
          </div>
          <h2 className="f-display" style={{fontSize:"clamp(38px,5vw,72px)",fontWeight:500,lineHeight:1.05,color:"#161412"}}>
            Создано для<br/><em style={{fontStyle:"italic",fontWeight:400}}>каждого пространства</em>
          </h2>
        </motion.div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(350px,1fr))", gap:22 }}>
          {services.map((s,i)=>(
            <motion.div key={i}
              initial={{opacity:0,y:44}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.6,delay:i*0.09}}
              className="card-lift shine"
              style={{ background:"white", borderRadius:10, overflow:"hidden", cursor:"pointer", border:"1px solid rgba(0,0,0,0.055)" }}
            >
              <div className="img-wrap" style={{height:214}}>
                <MetalBg className="img-inner" style={{width:"100%",height:"100%"}} variant={s.variant} label={s.tag}/>
              </div>
              <div style={{padding:"26px 30px 30px"}}>
                <h3 className="f-heading" style={{fontSize:17,fontWeight:700,letterSpacing:"0.02em",marginBottom:10,color:"#161412"}}>{s.title}</h3>
                <p style={{fontSize:14,fontWeight:300,lineHeight:1.75,color:"#7A7470",marginBottom:22}}>{s.desc}</p>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span className="f-heading" style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"#161412"}}>Подробнее</span>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5H11.5M8 2.5L11.5 6.5L8 10.5" stroke="#161412" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── ПОРТФОЛИО ───────────────────────────────────────────────────────────────
const portfolio = [
  {cat:"Лестницы",  title:"Вилла — Подмосковье",         variant:0, ar:"3/4" },
  {cat:"Ограждения",title:"Офисная башня — Москва",       variant:1, ar:"1/1" },
  {cat:"Ворота",    title:"Усадьба — Рублёвка",           variant:2, ar:"1/1" },
  {cat:"Мебель",    title:"Дизайнерский лофт — СПб",      variant:3, ar:"4/5" },
  {cat:"Лестницы",  title:"Пентхаус — Сочи",              variant:4, ar:"4/5" },
  {cat:"Конструкции",title:"Пергола — Краснодар",         variant:5, ar:"3/4" },
  {cat:"Ограждения",title:"Резиденция — Казань",          variant:0, ar:"1/1" },
  {cat:"Ворота",    title:"Корпоративный HQ — Москва",    variant:1, ar:"1/1" },
  {cat:"Мебель",    title:"Лобби отеля — Екатеринбург",   variant:2, ar:"4/5" },
];
const cats = ["Все","Лестницы","Ограждения","Ворота","Мебель","Конструкции"];

const Portfolio = () => {
  const [filter, setFilter] = useState("Все");
  const [modal, setModal]   = useState(null);
  const ref   = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  const items = filter==="Все" ? portfolio : portfolio.filter(p=>p.cat===filter);

  return (
    <section id="portfolio" ref={ref} style={{ padding:"120px 56px", background:"white" }}>
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        <motion.div initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.8}}
          style={{marginBottom:56,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:28}}
        >
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:28,height:1,background:"#161412"}}/>
              <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"#8A8278"}}>Наши работы</span>
            </div>
            <h2 className="f-display" style={{fontSize:"clamp(38px,5vw,72px)",fontWeight:500,lineHeight:1.05,color:"#161412"}}>
              Избранные<br/><em style={{fontStyle:"italic",fontWeight:400}}>проекты</em>
            </h2>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setFilter(c)} style={{
                padding:"10px 20px", borderRadius:40, fontSize:10, fontWeight:700,
                letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer",
                fontFamily:"Unbounded,sans-serif",
                border:"1.5px solid", borderColor: filter===c?"#161412":"rgba(0,0,0,0.14)",
                background: filter===c?"#161412":"transparent",
                color: filter===c?"white":"#8A8278",
                transition:"all 0.3s",
              }}>{c}</button>
            ))}
          </div>
        </motion.div>

        {/* Мейсонри */}
        <motion.div layout style={{columns:"3 300px",gap:18}}>
          <AnimatePresence>
            {items.map((item,i)=>(
              <motion.div key={item.title} layout
                initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
                transition={{duration:0.4,delay:i*0.04}}
                onClick={()=>setModal(item)}
                style={{breakInside:"avoid",marginBottom:18,borderRadius:8,overflow:"hidden",cursor:"pointer",position:"relative",display:"block"}}
                className="img-wrap"
              >
                <MetalBg className="img-inner" style={{width:"100%",aspectRatio:item.ar}} variant={item.variant}/>
                {/* Оверлей */}
                <div style={{
                  position:"absolute",inset:0,
                  background:"linear-gradient(to top,rgba(22,20,18,0.72) 0%,transparent 52%)",
                  opacity:0, transition:"opacity 0.4s",
                  display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:22,
                }}
                  onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="0"}
                >
                  <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(255,255,255,0.55)",marginBottom:6}}>{item.cat}</span>
                  <span style={{fontSize:14,fontWeight:500,color:"white",fontFamily:"Manrope,sans-serif"}}>{item.title}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Модал */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setModal(null)}
            style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}
          >
            <motion.div
              initial={{scale:0.88,y:24,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:0.88,opacity:0}}
              transition={{duration:0.4,ease:[0.25,0.46,0.45,0.94]}}
              onClick={e=>e.stopPropagation()}
              style={{background:"white",borderRadius:14,overflow:"hidden",maxWidth:820,width:"100%",maxHeight:"90vh",display:"flex",flexDirection:"column"}}
            >
              <div style={{overflow:"hidden",minHeight:420}}>
                <MetalBg style={{width:"100%",aspectRatio:"16/9"}} variant={modal.variant} label={modal.cat}/>
              </div>
              <div style={{padding:"28px 34px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:"#8A8278"}}>{modal.cat}</span>
                  <h3 className="f-display" style={{fontSize:28,fontWeight:400,color:"#161412",marginTop:4}}>{modal.title}</h3>
                </div>
                <button onClick={()=>setModal(null)} style={{width:46,height:46,borderRadius:46,border:"1.5px solid rgba(0,0,0,0.14)",background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#161412";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="none";}}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#161412" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ─── ПОЧЕМУ МЫ ───────────────────────────────────────────────────────────────
const whyUs = [
  { icon:"⬡", title:"Производство на заказ", desc:"Каждое изделие проектируется и изготавливается под ваши точные требования. Никаких стандартных решений." },
  { icon:"◎", title:"Точные замеры", desc:"Наши инженеры измеряют объект на месте с точностью до миллиметра перед началом работ." },
  { icon:"▲", title:"Монтаж включён", desc:"Полный монтаж нашей сертифицированной бригадой. Чисто, профессионально, в срок." },
  { icon:"◈", title:"Премиум-материалы", desc:"Закупаем сертифицированный европейский металл. Ни вторсырьё, ни некондиция в нашей мастерской не появится." },
  { icon:"◉", title:"Соблюдение сроков", desc:"Собственное производство исключает задержки. Сдаём в срок. Всегда." },
];

const WhyUs = () => {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  return (
    <section id="about" ref={ref} style={{ padding:"120px 56px", background:"#ECEAE5", position:"relative", overflow:"hidden" }}>
      <div style={{position:"absolute",top:"50%",right:"-8%",transform:"translateY(-50%)",width:"36%",height:"80%",background:"linear-gradient(135deg,rgba(255,255,255,0.5),transparent)",borderRadius:8,pointerEvents:"none"}}/>
      <div style={{ maxWidth:1400, margin:"0 auto", position:"relative", zIndex:1 }}>
        <motion.div initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.8}}
          style={{marginBottom:72,display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"end"}}
          className="mob-full"
        >
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:28,height:1,background:"#161412"}}/>
              <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"#8A8278"}}>Наше обещание</span>
            </div>
            <h2 className="f-display" style={{fontSize:"clamp(38px,5vw,72px)",fontWeight:500,lineHeight:1.05,color:"#161412"}}>
              Почему<br/><em style={{fontStyle:"italic",fontWeight:400}}>Steel Style</em>
            </h2>
          </div>
          <p style={{fontSize:16,fontWeight:300,lineHeight:1.85,color:"#5A5450"}}>
            Два десятилетия мы устанавливаем стандарт металлообработки в России. Наша мастерская — там, где традиционное кузнечное ремесло встречается с современной архитектурной эстетикой.
          </p>
        </motion.div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:18}}>
          {whyUs.map((w,i)=>(
            <motion.div key={i}
              initial={{opacity:0,y:40}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.6,delay:i*0.11}}
              className="invert-card"
              style={{background:"white",borderRadius:10,padding:"36px 30px",border:"1px solid rgba(0,0,0,0.055)",cursor:"default"}}
            >
              <div className="ic-icon" style={{fontSize:26,marginBottom:20,color:"#161412"}}>{w.icon}</div>
              <h3 className="f-heading ic-title" style={{fontSize:14,fontWeight:700,marginBottom:12,color:"#161412",letterSpacing:"0.01em"}}>{w.title}</h3>
              <p className="ic-desc" style={{fontSize:13,fontWeight:300,lineHeight:1.78,color:"#8A8278"}}>{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── ПРОЦЕСС ─────────────────────────────────────────────────────────────────
const steps = [
  { n:"01", title:"Заявка",        desc:"Отправьте бриф, фотографии или референсы. Мы ответим в течение 24 часов." },
  { n:"02", title:"Консультация",  desc:"Персональный менеджер изучает ваш запрос. Обсуждаем дизайн, материалы, сроки." },
  { n:"03", title:"Замер",         desc:"Техник выезжает на объект для точных замеров. Ничего не делается на глазок." },
  { n:"04", title:"Производство",  desc:"Изделие изготавливается в нашей московской мастерской мастерами с опытом 15+ лет." },
  { n:"05", title:"Монтаж",        desc:"Бригада приезжает, выполняет монтаж чисто и профессионально, убирает после себя." },
];

const Process = () => {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  return (
    <section id="process" ref={ref} style={{ padding:"120px 56px", background:"#161412", overflow:"hidden" }}>
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        <motion.div initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.8}} style={{marginBottom:80}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <div style={{width:28,height:1,background:"rgba(255,255,255,0.25)"}}/>
            <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"#5A5450"}}>Как мы работаем</span>
          </div>
          <h2 className="f-display" style={{fontSize:"clamp(38px,5vw,72px)",fontWeight:500,lineHeight:1.05,color:"white"}}>
            От идеи до<br/><em style={{color:"#C4C0BB",fontStyle:"italic",fontWeight:400}}>монтажа</em>
          </h2>
        </motion.div>

        {/* Шаги */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0,position:"relative"}}>
          {/* Линия */}
          <div style={{position:"absolute",top:40,left:"5%",right:"5%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)"}}/>

          {steps.map((s,i)=>(
            <motion.div key={i}
              initial={{opacity:0,y:40}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.6,delay:0.2+i*0.12}}
              style={{padding:"0 20px"}}
            >
              <motion.div
                initial={{scale:0}} animate={inView?{scale:1}:{}} transition={{duration:0.5,delay:0.4+i*0.12}}
                style={{
                  width:80,height:80,borderRadius:80,
                  border:"1px solid rgba(255,255,255,0.13)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  marginBottom:30,background:"rgba(255,255,255,0.04)",
                  backdropFilter:"blur(8px)",
                }}
              >
                <span className="f-display" style={{fontSize:20,fontWeight:400,color:"rgba(255,255,255,0.55)"}}>{s.n}</span>
              </motion.div>
              <h3 className="f-heading" style={{fontSize:14,fontWeight:700,color:"white",marginBottom:12,letterSpacing:"0.02em"}}>{s.title}</h3>
              <p style={{fontSize:13,fontWeight:300,lineHeight:1.78,color:"rgba(255,255,255,0.38)"}}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── ОТЗЫВЫ ──────────────────────────────────────────────────────────────────
const reviews = [
  { name:"Артём Соколов",    role:"Архитектор, Москва",    text:"Лестница, которую Steel Style создали для пентхауса нашего клиента, стала главным акцентом всего интерьера. Точность, скорость и полный профессионализм.", initials:"АС" },
  { name:"Ирина Козлова",    role:"Дизайнер интерьеров, СПб",text:"За 15 лет работы я сотрудничала со многими металлообрабатывающими мастерскими. Steel Style — совершенно другой уровень: и по качеству, и по коммуникации.", initials:"ИК" },
  { name:"Дмитрий Орлов",    role:"Девелопер, Краснодар",  text:"Заказал ворота и ограждения для жилого комплекса. Сдали в срок, смонтировали идеально. Обязательно обращусь снова.", initials:"ДО" },
  { name:"Наталья Чернова",  role:"Частный заказчик, Сочи", text:"Невероятно красивые кованые перила на балконе. Команда была пунктуальной, аккуратной, а результат значительно превзошёл ожидания.", initials:"НЧ" },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  useEffect(()=>{
    const t = setInterval(()=>setActive(a=>(a+1)%reviews.length),5200);
    return ()=>clearInterval(t);
  },[]);
  return (
    <section ref={ref} style={{ padding:"120px 56px", background:"#F5F3EF" }}>
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        <motion.div initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.8}}
          style={{marginBottom:72,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:28}}
        >
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
              <div style={{width:28,height:1,background:"#161412"}}/>
              <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"#8A8278"}}>Отзывы клиентов</span>
            </div>
            <h2 className="f-display" style={{fontSize:"clamp(38px,5vw,72px)",fontWeight:500,lineHeight:1.05,color:"#161412"}}>
              Нам доверяют<br/><em style={{fontStyle:"italic",fontWeight:400}}>профессионалы</em>
            </h2>
          </div>
          <div style={{display:"flex",gap:8}}>
            {reviews.map((_,i)=>(
              <button key={i} onClick={()=>setActive(i)} style={{
                width: i===active?30:8, height:8, borderRadius:8,
                background: i===active?"#161412":"rgba(0,0,0,0.14)",
                border:"none", cursor:"pointer", transition:"all 0.3s",
              }}/>
            ))}
          </div>
        </motion.div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:20}}>
          {reviews.map((r,i)=>(
            <motion.div key={i}
              initial={{opacity:0,y:40}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.6,delay:i*0.1}}
              onClick={()=>setActive(i)}
              style={{
                background: i===active?"#161412":"white",
                borderRadius:10, padding:"36px 32px",
                border:`1px solid ${i===active?"transparent":"rgba(0,0,0,0.055)"}`,
                transition:"all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)",
                cursor:"pointer",
                transform: i===active?"scale(1.025)":"scale(1)",
              }}
            >
              <div style={{display:"flex",gap:3,marginBottom:22}}>
                {Array.from({length:5}).map((_,j)=>(
                  <span key={j} style={{fontSize:13,color:i===active?"#C4C0BB":"#161412"}}>★</span>
                ))}
              </div>
              <p className="f-display" style={{
                fontSize:17, fontWeight:400, lineHeight:1.65, fontStyle:"italic",
                color: i===active?"rgba(255,255,255,0.88)":"#161412",
                marginBottom:28,
              }}>
                «{r.text}»
              </p>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{
                  width:46,height:46,borderRadius:46,
                  background: i===active?"rgba(255,255,255,0.1)":"#ECEAE5",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                }}>
                  <span className="f-heading" style={{fontSize:12,fontWeight:700,color:i===active?"rgba(255,255,255,0.7)":"#161412"}}>{r.initials}</span>
                </div>
                <div>
                  <div className="f-heading" style={{fontSize:12,fontWeight:700,color:i===active?"white":"#161412",letterSpacing:"0.02em"}}>{r.name}</div>
                  <div style={{fontSize:11,color:i===active?"rgba(255,255,255,0.35)":"#A09890",marginTop:3}}>{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── КОНТАКТЫ ────────────────────────────────────────────────────────────────
const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-80px"});
  const [form, setForm] = useState({name:"",email:"",phone:"",msg:""});
  const iStyle = {
    width:"100%", background:"transparent", border:"none",
    borderBottom:"1.5px solid rgba(255,255,255,0.18)",
    padding:"13px 0", fontSize:15, fontWeight:300, color:"white",
    fontFamily:"Manrope,sans-serif", transition:"border-color 0.3s", caretColor:"white",
  };
  return (
    <section id="contact" ref={ref} style={{ padding:"120px 56px", background:"#161412", position:"relative", overflow:"hidden" }}>
      <div style={{position:"absolute",top:"-20%",right:"-8%",width:"48%",height:"140%",background:"radial-gradient(ellipse,rgba(196,192,187,0.055) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{ maxWidth:1400, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start", position:"relative", zIndex:1 }} className="mob-full mob-col">

        {/* Левая часть */}
        <motion.div initial={{opacity:0,x:-40}} animate={inView?{opacity:1,x:0}:{}} transition={{duration:0.8}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <div style={{width:28,height:1,background:"rgba(255,255,255,0.25)"}}/>
            <span className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:"#5A5450"}}>Написать нам</span>
          </div>
          <h2 className="f-display" style={{fontSize:"clamp(38px,5vw,72px)",fontWeight:500,lineHeight:1.05,color:"white",marginBottom:28}}>
            Начните ваш<br/><em style={{color:"#C4C0BB",fontStyle:"italic",fontWeight:400}}>проект сегодня</em>
          </h2>
          <p style={{fontSize:15,fontWeight:300,lineHeight:1.85,color:"rgba(255,255,255,0.38)",marginBottom:52,maxWidth:400}}>
            Расскажите нам о вашей идее — мы воплотим её в металле.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:44}}>
            {[
              {ico:"📞",label:"+7 (495) 123-45-67",sub:"Пн–Пт, 9:00–18:00"},
              {ico:"✉️",label:"hello@steelstyle.ru",sub:"Ответ в течение 24 ч"},
              {ico:"📍",label:"ул. Стальная, 12, Москва",sub:"Мастерская и шоурум"},
            ].map((c,i)=>(
              <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <span style={{fontSize:16}}>{c.ico}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:"white",marginBottom:2}}>{c.label}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.28)"}}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[
              {label:"WhatsApp",bg:"#25D366",ico:"💬"},
              {label:"Telegram",bg:"#2AABEE",ico:"✈️"},
            ].map(b=>(
              <button key={b.label} style={{
                padding:"14px 26px", borderRadius:5, border:"none", cursor:"pointer",
                background:b.bg, color:"white", fontSize:11, fontWeight:700,
                letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"Unbounded,sans-serif",
                display:"flex",alignItems:"center",gap:8, transition:"all 0.3s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.opacity="0.82";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}
              >{b.ico} {b.label}</button>
            ))}
          </div>
        </motion.div>

        {/* Правая часть — форма */}
        <motion.div initial={{opacity:0,x:40}} animate={inView?{opacity:1,x:0}:{}} transition={{duration:0.8,delay:0.2}}
          style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"48px 44px"}}
        >
          <h3 className="f-heading" style={{fontSize:16,fontWeight:700,color:"white",marginBottom:7,letterSpacing:"0.02em"}}>Запросить смету</h3>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.28)",marginBottom:42,fontWeight:300}}>Подготовим детальное предложение в течение 48 часов.</p>
          <div style={{display:"flex",flexDirection:"column",gap:30}}>
            {[
              {key:"name",  label:"Имя и фамилия",    type:"text",  ph:"Иван Петров"},
              {key:"email", label:"Электронная почта", type:"email", ph:"ivan@example.ru"},
              {key:"phone", label:"Номер телефона",    type:"tel",   ph:"+7 ..."},
            ].map(f=>(
              <div key={f.key}>
                <label style={{display:"block",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:5,fontFamily:"Unbounded,sans-serif"}}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]}
                  onChange={e=>setForm({...form,[f.key]:e.target.value})}
                  style={iStyle}
                  onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.65)"}
                  onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.18)"}
                />
              </div>
            ))}
            <div>
              <label style={{display:"block",fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:5,fontFamily:"Unbounded,sans-serif"}}>Описание проекта</label>
              <textarea rows={4} placeholder="Опишите проект — тип, размер, объект, сроки..."
                value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})}
                style={{...iStyle,resize:"none",display:"block"}}
                onFocus={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.65)"}
                onBlur={e=>e.target.style.borderBottomColor="rgba(255,255,255,0.18)"}
              />
            </div>
            <button style={{
              background:"white", color:"#161412", padding:"18px 0",
              borderRadius:5, border:"none", cursor:"pointer",
              fontSize:11, fontWeight:800, letterSpacing:"0.14em",
              textTransform:"uppercase", fontFamily:"Unbounded,sans-serif",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              transition:"all 0.3s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="#ECEAE5";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.transform="translateY(0)";}}
            >
              Отправить заявку
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5H11.5M8 2.5L11.5 6.5L8 10.5" stroke="#161412" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── ФУТЕР ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ background:"#0E0D0B", padding:"64px 56px 36px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
    <div style={{ maxWidth:1400, margin:"0 auto" }}>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:44,marginBottom:60}} className="mob-full">
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
            <div style={{width:34,height:34,background:"white",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 15L9 3L15 15" stroke="#161412" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 10.5H12.5" stroke="#161412" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="f-heading" style={{fontSize:16,fontWeight:700,letterSpacing:"0.05em",color:"white"}}>STEEL STYLE</span>
          </div>
          <p style={{fontSize:13,fontWeight:300,lineHeight:1.78,color:"rgba(255,255,255,0.28)",maxWidth:260}}>
            Премиальное производство металлоконструкций и художественная ковка в Москве. Лестницы, ограждения, ворота, мебель с 2004 года.
          </p>
        </div>
        {[
          {h:"Услуги",   links:["Ограждения","Ворота","Лестницы","Мебель","Конструкции"]},
          {h:"Компания", links:["О нас","Портфолио","Процесс","Отзывы","Карьера"]},
          {h:"Контакты", links:["+7 (495) 123-45-67","hello@steelstyle.ru","ул. Стальная, 12","Москва, Россия"]},
        ].map((col,i)=>(
          <div key={i}>
            <h4 className="f-heading" style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:18}}>{col.h}</h4>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {col.links.map(l=>(
                <a key={l} href="#" style={{fontSize:13,fontWeight:300,color:"rgba(255,255,255,0.32)",textDecoration:"none",transition:"color 0.2s"}}
                  onMouseEnter={e=>e.target.style.color="white"}
                  onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.32)"}
                >{l}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:26,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.2)",fontWeight:300}}>© 2024 Steel Style ООО. Все права защищены.</span>
        <div style={{display:"flex",gap:22}}>
          {["Instagram","VKontakte","Telegram","Behance"].map(s=>(
            <a key={s} href="#" style={{fontSize:11,color:"rgba(255,255,255,0.2)",textDecoration:"none",transition:"color 0.2s",fontFamily:"Unbounded,sans-serif",fontWeight:600,letterSpacing:"0.06em"}}
              onMouseEnter={e=>e.target.style.color="white"}
              onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.2)"}
            >{s}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── ЗАГРУЗОЧНЫЙ ЭКРАН ───────────────────────────────────────────────────────
const Loader = ({ onDone }) => {
  useEffect(()=>{ const t=setTimeout(onDone,1600); return ()=>clearTimeout(t); },[]);
  return (
    <motion.div exit={{opacity:0}} transition={{duration:0.7}}
      style={{position:"fixed",inset:0,zIndex:9999,background:"#161412",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28}}
    >
      <motion.div
        initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:1.2,ease:[0.25,0.46,0.45,0.94]}}
        style={{width:220,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",transformOrigin:"left"}}
      />
      <motion.span
        animate={{opacity:[0.3,1,0.3]}} transition={{duration:1.6,repeat:Infinity}}
        className="f-display"
        style={{fontSize:32,fontWeight:400,color:"white",letterSpacing:"0.1em",fontStyle:"italic"}}
      >
        Steel Style
      </motion.span>
      <motion.div
        initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:1.2,ease:[0.25,0.46,0.45,0.94],delay:0.1}}
        style={{width:220,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",transformOrigin:"right"}}
      />
    </motion.div>
  );
};

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady] = useState(false);
  return (
    <>
      <GlobalStyles/>
      <AnimatePresence>
        {!ready && <Loader key="loader" onDone={()=>setReady(true)}/>}
      </AnimatePresence>
      {ready && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}}>
          <Nav/>
          <Hero/>
          <Marquee/>
          <Services/>
          <Portfolio/>
          <WhyUs/>
          <Process/>
          <Testimonials/>
          <Contact/>
          <Footer/>
        </motion.div>
      )}
    </>
  );
}

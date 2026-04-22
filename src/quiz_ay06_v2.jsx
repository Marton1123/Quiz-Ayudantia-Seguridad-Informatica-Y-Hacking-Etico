import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const channel = supabase.channel('room-quiz');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#0D1117", card:"#161B22", card2:"#1F2937", gDark:"#0D4429",
  green:"#39D353", cyan:"#58A6FF", purple:"#BC8CFF",
  orange:"#F0883E", red:"#F85149", white:"#E6EDF3", muted:"#8B949E", border:"#30363D",
};
const LC = { A:C.cyan, B:C.green, C:C.orange, D:C.purple };
const LS = ["A","B","C","D"];
const POINTS = 100;

const uid   = () => Math.random().toString(36).slice(2,10);
const now   = () => Date.now();

// ─── 25 PREGUNTAS ─────────────────────────────────────────────────────────────
const QS = [
  { id:1,  topic:"Tríada CIA",       q:'¿Qué representa la "A" en la tríada CIA?',
    opts:["Autenticación","Autorización","Disponibilidad (Availability)","Auditoría"], ans:2,
    exp:"CIA = Confidencialidad, Integridad, Disponibilidad. Availability garantiza que los sistemas estén accesibles para usuarios autorizados cuando los necesiten." },
  { id:2,  topic:"Tipos de Hacker",  q:"¿Cuál es la diferencia principal entre White Hat y Grey Hat?",
    opts:["White Hat usa mejores herramientas","White Hat actúa con autorización; Grey Hat puede actuar sin ella","Grey Hat siempre trabaja para empresas privadas","No existe diferencia práctica entre ambos"], ans:1,
    exp:"White Hat = con permiso explícito. Grey Hat = puede actuar sin autorización pero sin intención maliciosa. Black Hat = malicioso." },
  { id:3,  topic:"Tipos de Hacker",  q:"¿Cuál es la motivación principal de un Black Hat?",
    opts:["Mejorar la seguridad de sistemas","Obtener reconocimiento en la comunidad","Causar daño u obtener beneficio propio sin autorización","Realizar auditorías de seguridad contratadas"], ans:2,
    exp:"El Black Hat actúa con intención maliciosa o para beneficio personal, sin permiso del dueño del sistema." },
  { id:4,  topic:"Conceptos Base",   q:"¿Qué es un Zero Day?",
    opts:["Un ataque que ocurre exactamente a medianoche","Una vulnerabilidad desconocida por el fabricante, sin parche disponible","Un malware que se activa el 1° día del mes","Una técnica de ingeniería social basada en urgencia"], ans:1,
    exp:"Zero Day = vulnerabilidad que el fabricante aún no conoce o sin parche disponible. Son extremadamente valiosas y peligrosas." },
  { id:5,  topic:"Fases del Pentest", q:"¿Cuál de estas NO es una fase del pentesting?",
    opts:["Reconocimiento","Explotación","Compilación de Código","Post-explotación"], ans:2,
    exp:"Fases reales: Reconocimiento → Escaneo → Explotación → Post-explotación → Reporte. 'Compilación' no existe en el ciclo." },
  { id:6,  topic:"Leyes",            q:"¿Qué establece la Ley 19.223 en Chile?",
    opts:["Regula el comercio electrónico nacional","Protege los datos personales de los ciudadanos","Tipifica los delitos informáticos","Regula el uso corporativo de internet"], ans:2,
    exp:"Ley 19.223 (1993): tipifica delitos informáticos en Chile. Cubre sabotaje, espionaje y acceso no autorizado a sistemas." },
  { id:7,  topic:"Ética",            q:"¿En qué consiste el Responsible Disclosure?",
    opts:["Publicar la vuln de inmediato para presionar un parche","Vender la vulnerabilidad al mejor postor","Notificar al afectado primero y dar plazo para corregir antes de divulgar","Reportar solo a organismos gubernamentales"], ans:2,
    exp:"Responsible Disclosure: notificar primero al fabricante, dar ~90 días para corregir, y solo entonces publicar si no fue corregida." },
  { id:8,  topic:"Tipos de Pentest", q:"¿Qué es un pentest de caja negra (Black Box)?",
    opts:["Auditor con acceso total al código fuente","Auditor sin información previa; simula atacante externo real","Pentest realizado solo en bases de datos","Prueba ejecutada solo en horario nocturno"], ans:1,
    exp:"Black Box: sin información previa. Simula un atacante real externo. El más realista pero también el más lento de ejecutar." },
  { id:9,  topic:"Documentación",    q:"¿Cuál es el objetivo principal de un NDA en un pentest?",
    opts:["Definir el alcance técnico del ataque","Proteger la información confidencial intercambiada entre las partes","Establecer los honorarios del auditor","Garantizar que los sistemas estén actualizados"], ans:1,
    exp:"El NDA protege la confidencialidad de la información compartida entre el auditor y el cliente durante el proceso." },
  { id:10, topic:"Ética",            q:"Un investigador publica una vuln crítica en Twitter sin avisar a la empresa. ¿Qué violó?",
    opts:["Bug Bounty","Penetration Testing","Responsible Disclosure","Red Teaming"], ans:2,
    exp:"Violó el Responsible Disclosure. Publicar sin aviso previo deja usuarios expuestos y daña la reputación del investigador." },
  { id:11, topic:"Metodología",      q:"¿Cuál es el orden correcto de las fases de un pentest?",
    opts:["Explotación → Reconocimiento → Post-explotación → Reporte","Escaneo → Reconocimiento → Explotación → Reporte","Reconocimiento → Escaneo → Explotación → Post-explotación → Reporte","Planificación → Explotación → Reconocimiento → Reporte"], ans:2,
    exp:"Reconocimiento → Escaneo → Explotación → Post-explotación → Reporte. Siempre información antes de atacar." },
  { id:12, topic:"Herramientas",     q:"¿Qué herramienta es estándar para escanear puertos en reconocimiento activo?",
    opts:["Maltego","theHarvester","Nmap","Metasploit"], ans:2,
    exp:"Nmap es el estándar para descubrir hosts y puertos. Maltego/theHarvester son OSINT pasivo. Metasploit es para explotación." },
  { id:13, topic:"Post-Explotación", q:"¿Cuál es el objetivo principal de la fase de Post-Explotación?",
    opts:["Encontrar nuevas vulnerabilidades en el sistema","Mantener el acceso, escalar privilegios y moverse lateralmente","Generar el informe final con hallazgos","Escanear puertos adicionales pendientes"], ans:1,
    exp:"Post-Explotación: persistencia (mantener acceso), escalación de privilegios (root/admin) y lateral movement hacia otros sistemas." },
  { id:14, topic:"Post-Explotación", q:"¿Qué significa 'pivoting' en post-explotación?",
    opts:["Cambiar de herramienta durante el ataque","Usar un sistema comprometido como puente para atacar otros sistemas internos","Rotar credenciales comprometidas automáticamente","Reiniciar el ciclo del pentest desde cero"], ans:1,
    exp:"Pivoting = usar una máquina comprometida como puente para alcanzar sistemas internos inaccesibles directamente desde internet." },
  { id:15, topic:"Herramientas",     q:"¿Cuál es el rol principal de Metasploit en un pentest?",
    opts:["Recopilar correos y subdominios del objetivo","Escanear subdominios y certificados SSL","Ejecutar exploits contra vulnerabilidades ya identificadas","Generar reportes automáticos en PDF"], ans:2,
    exp:"Metasploit es un framework de explotación con módulos de exploits y payloads. Se usa DESPUÉS de identificar vulnerabilidades." },
  { id:16, topic:"Planificación",    q:"¿Qué documento define el alcance, límites y reglas operativas de un pentest?",
    opts:["Informe final de hallazgos","Acuerdo de No Divulgación (NDA)","Rules of Engagement (RoE)","Plan de Respuesta a Incidentes"], ans:2,
    exp:"RoE: define qué sistemas atacar, en qué horarios, qué técnicas están permitidas y el punto de contacto. Es el contrato operativo." },
  { id:17, topic:"Tipos de Pentest", q:"Auditor con credenciales de empleado pero sin código fuente. ¿Qué tipo de pentest es?",
    opts:["Black Box","White Box","Grey Box","Red Team"], ans:2,
    exp:"Grey Box: conocimiento parcial del objetivo. Combina Black Box (sin info total) y White Box (con algún acceso)." },
  { id:18, topic:"Planificación",    q:"¿Cuál es la diferencia principal entre Red Team y pentest tradicional?",
    opts:["Red Team usa más herramientas simultáneamente","Red Team simula adversario real sostenido en el tiempo; pentest es acotado","El pentest tradicional siempre es más costoso","No existe diferencia práctica entre ambos"], ans:1,
    exp:"Red Team = simula APT (Advanced Persistent Threat) real, prolongado, objetivos estratégicos. Pentest = más acotado en tiempo y alcance." },
  { id:19, topic:"OSINT — theHarvester", q:"¿Qué información recopila principalmente theHarvester?",
    opts:["Vulnerabilidades CVE y puertos abiertos","Grafos de relaciones entre entidades del objetivo","Correos electrónicos, subdominios y nombres de host","Módulos de reconocimiento en base de datos local"], ans:2,
    exp:"theHarvester extrae correos, subdominios y hosts desde Google, LinkedIn, Hunter.io y otras fuentes abiertas." },
  { id:20, topic:"OSINT — Shodan",   q:"¿Cuál es la diferencia principal entre Shodan y Google?",
    opts:["Google tiene mejores filtros de búsqueda","Shodan indexa dispositivos y servicios de red; Google indexa páginas web","Shodan solo funciona para empresas con licencia corporativa","Google puede encontrar puertos abiertos; Shodan no puede"], ans:1,
    exp:"Shodan = 'Google de los dispositivos conectados'. Indexa banners de servicios mostrando versiones, puertos y CVEs." },
  { id:21, topic:"Tríada CIA — Caso", q:"Ransomware cifra todos los archivos de una empresa y exige pago. ¿Qué pilar CIA es el MÁS afectado?",
    opts:["Confidencialidad","Integridad","Disponibilidad","Autenticidad"], ans:2,
    exp:"Disponibilidad: los usuarios no pueden acceder a sus datos. También puede afectar Confidencialidad si hubo exfiltración previa." },
  { id:22, topic:"OSINT — Maltego",  q:"¿Para qué se utiliza principalmente Maltego?",
    opts:["Escaneo de puertos y detección de servicios","Recolección masiva de correos desde buscadores","Visualización gráfica de relaciones entre entidades OSINT","Gestión de módulos de reconocimiento por CLI"], ans:2,
    exp:"Maltego genera grafos de relaciones entre dominios, IPs, correos y personas. Ideal para mapear la superficie de ataque visualmente." },
  { id:23, topic:"OSINT",            q:"¿Qué diferencia el reconocimiento PASIVO del ACTIVO?",
    opts:["El pasivo usa más herramientas y es más completo","El activo siempre tarda más tiempo","El pasivo no interactúa con el objetivo; el activo sí lo hace directamente","No hay diferencia práctica entre ambos"], ans:2,
    exp:"Pasivo: Google, Shodan, redes sociales (sin tocar el objetivo). Activo: Nmap, pings, peticiones HTTP (interacción directa)." },
  { id:24, topic:"OSINT — Recon-NG", q:"¿Cómo organiza Recon-NG el trabajo de reconocimiento?",
    opts:["Por capas del modelo OSI","Por tipo de vulnerabilidad detectada","Mediante workspaces con BD local y módulos instalables","Por fases automáticas sin intervención del usuario"], ans:2,
    exp:"Recon-NG: workspaces por proyecto, BD local con dominios/hosts/correos. Módulos instalados desde marketplace, ejecutados con 'run'." },
  { id:25, topic:"OSINT — Metadatos", q:"¿Qué información sensible pueden tener los metadatos de un PDF corporativo?",
    opts:["Solo el texto visible del documento","Nombre del autor, software usado, fechas y rutas internas del sistema","Solo el tamaño del archivo y número de páginas","Información cifrada inaccesible sin clave privada"], ans:1,
    exp:"Metadatos revelan: autor, software (Word 2019), rutas internas (C:\\Users\\admin...) y fechas de modificación. Una mina de oro OSINT." },
];

const CASE = {
  title:"CASO — Retail Express S.A.",
  story:`Durante una auditoría de seguridad de Retail Express S.A., se descubrió que un atacante externo había accedido a la base de datos de clientes.\n\n1. Buscó en LinkedIn al administrador de sistemas: obtuvo nombre, cargo y correo corporativo.\n2. Usó Shodan para buscar servicios del dominio: encontró el puerto 3306 (MySQL) abierto con versión 5.5.\n3. Esa versión tenía un CVE crítico conocido. Lo explotó y accedió a 50.000 registros de clientes (RUT, dirección, tarjeta de crédito).`,
  qs:[
    { q:"1. ¿Qué fases del pentest ejecutó el atacante y qué fuentes/herramientas OSINT usó?", a:"Reconocimiento pasivo: LinkedIn (datos del personal) + Shodan (servicios tecnológicos expuestos). Sin interacción directa hasta la explotación del CVE." },
    { q:"2. ¿Qué pilar(es) de la tríada CIA fueron vulnerados? Justifica.", a:"Confidencialidad (principal): acceso no autorizado a 50.000 registros privados. Disponibilidad podría afectarse si el sistema quedó comprometido post-ataque." },
    { q:"3. Entrega una recomendación de seguridad según CIS Control v8.", a:"CIS 7 (Gestión de Vulnerabilidades): actualizar MySQL regularmente. CIS 12: cerrar puertos innecesarios al exterior (3306 no debería ser público). CIS 14: limitar información del personal en LinkedIn." },
  ],
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function TimerRing({ rem, total=30, size=72 }) {
  const r=size/2-5, circ=2*Math.PI*r;
  const color = rem/total>0.5?C.green:rem/total>0.25?C.orange:C.red;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)",display:"block"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.card2} strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${circ*rem/total} ${circ}`}
          style={{transition:"stroke-dasharray 1s linear, stroke 0.3s"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",
        justifyContent:"center",fontFamily:"Consolas,monospace",
        fontSize:size*.3,fontWeight:900,color}}>{rem}</div>
    </div>
  );
}

function VoteBars({ votes={}, total=0, ans=null, revealed=false }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,alignItems:"flex-end"}}>
      {LS.map((l,i) => {
        const cnt=votes[l]||0, pct=total>0?cnt/total:0;
        const isCor=revealed&&i===ans;
        const col=isCor?C.green:LC[l];
        return (
          <div key={l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <span style={{fontFamily:"Consolas,monospace",fontSize:13,color:col,fontWeight:700}}>{cnt}</span>
            <div style={{width:"100%",height:90,background:C.card2,borderRadius:6,
              position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",bottom:0,left:0,right:0,
                height:`${Math.max(pct*100,cnt>0?3:0)}%`,background:col,
                borderRadius:"4px 4px 0 0",
                opacity:revealed&&!isCor?0.3:1,
                transition:"height 0.6s cubic-bezier(.22,1,.36,1),opacity 0.3s,background 0.3s"}}/>
            </div>
            <div style={{width:36,height:36,borderRadius:8,
              background:isCor?`${C.green}25`:`${LC[l]}15`,
              border:`2px solid ${col}`,display:"flex",alignItems:"center",
              justifyContent:"center",fontFamily:"Consolas,monospace",
              fontSize:17,fontWeight:900,color:col,
              transition:"background 0.3s, border-color 0.3s"}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
}

function Leaderboard({ players }) {
  const sorted=[...players].sort((a,b)=>b.score-a.score).slice(0,10);
  const medals=["🥇","🥈","🥉"];
  const podiumColor=i=>i===0?C.orange:i===1?"#C0C0C0":i===2?"#CD7F32":C.muted;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:560,margin:"0 auto"}}>
      {sorted.map((p,i)=>(
        <div key={p.id||i} style={{background:C.card,
          border:`1px solid ${i<3?podiumColor(i)+"60":C.border}`,
          borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:14,
          transform:i===0?"scale(1.02)":"none",transition:"transform 0.3s"}}>
          <span style={{fontSize:i<3?26:15,minWidth:34,textAlign:"center"}}>
            {medals[i]||`${i+1}`}
          </span>
          <span style={{flex:1,fontSize:16,fontWeight:700,color:C.white,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
          <span style={{fontFamily:"Consolas,monospace",fontSize:18,fontWeight:900,
            color:podiumColor(i)}}>{p.score}</span>
          <span style={{color:C.muted,fontSize:12}}>pts</span>
        </div>
      ))}
      {sorted.length===0&&<p style={{color:C.muted,textAlign:"center",fontStyle:"italic"}}>Ningún jugador todavía...</p>}
    </div>
  );
}

function Loading() {
  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",
      justifyContent:"center",fontFamily:"Consolas,monospace",color:C.muted,gap:8}}>
      <span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>◌</span>
      <span>Conectando...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const Btn=(({children,onClick,color=C.green,disabled=false,style={}})=>(
  <button onClick={onClick} disabled={disabled} style={{
    background:disabled?"#2a2a2a":color,color:C.bg,border:"none",borderRadius:8,
    padding:"12px 24px",fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
    fontFamily:"Consolas,monospace",opacity:disabled?0.5:1,
    transition:"opacity 0.2s,transform 0.1s",...style,
  }}
  onMouseOver={e=>{if(!disabled)e.currentTarget.style.opacity="0.85"}}
  onMouseOut={e=>{if(!disabled)e.currentTarget.style.opacity="1"}}
  >{children}</button>
));

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onHost, onJoin }) {
  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",fontFamily:"Calibri,sans-serif",
      color:C.white,padding:24,gap:0}}>
      <div style={{background:C.gDark,border:`1px solid ${C.green}`,borderRadius:4,
        padding:"4px 16px",marginBottom:22,fontFamily:"Consolas,monospace",
        fontSize:11,color:C.green,letterSpacing:2}}>TALLER DE HACKING ETICO</div>

      <h1 style={{fontSize:"min(52px,10vw)",fontWeight:900,margin:"0 0 6px",
        textAlign:"center",lineHeight:1.1}}>Simulacro de Prueba</h1>
      <p style={{color:C.cyan,fontFamily:"Consolas,monospace",fontSize:15,margin:"0 0 6px",
        textAlign:"center"}}>Ayudantía N.6  ·  25 preguntas  ·  Caso práctico  ·  Marcador en vivo</p>
      <div style={{background:"#1a0a0a",border:`1px solid ${C.orange}50`,borderRadius:6,
        padding:"6px 20px",marginBottom:36}}>
        <span style={{color:C.orange,fontWeight:"bold",fontSize:14}}>⚠ Prueba: Lunes 28 de Abril</span>
      </div>

      <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center",marginBottom:32}}>
        {[
          {label:"Host / Proyector",icon:"🖥️",sub:"Controla el quiz",color:C.green,fn:onHost},
          {label:"Unirse al Quiz",  icon:"📱",sub:"Vota desde el celular",color:C.cyan,fn:onJoin},
        ].map(b=>(
          <button key={b.label} onClick={b.fn} style={{
            background:b.color,color:C.bg,border:"none",borderRadius:12,
            padding:"20px 28px",width:190,cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:6,
            fontFamily:"Calibri,sans-serif",transition:"transform 0.15s,opacity 0.15s",
          }}
          onMouseOver={e=>e.currentTarget.style.transform="scale(1.04)"}
          onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}
          >
            <span style={{fontSize:30}}>{b.icon}</span>
            <span style={{fontFamily:"Consolas,monospace",fontWeight:900,fontSize:14,letterSpacing:0.5}}>{b.label}</span>
            <span style={{fontSize:11,opacity:.7,fontWeight:400}}>{b.sub}</span>
          </button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:420,width:"100%"}}>
        {[{v:25,l:"Preguntas",c:C.cyan},{v:"30s",l:"Timer c/u",c:C.orange},{v:POINTS+"",l:"Pts por acierto",c:C.green}].map(s=>(
          <div key={s.l} style={{background:C.card,border:`1px solid ${s.c}30`,borderRadius:8,
            padding:"12px 8px",textAlign:"center"}}>
            <div style={{fontSize:28,fontWeight:900,color:s.c,fontFamily:"Consolas,monospace"}}>{s.v}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOST APP ─────────────────────────────────────────────────────────────────
function HostApp() {
  const [gs,  setGs ]    = useState({phase:"lobby",qIndex:0,timerEnd:0});
  const [players,setPlayers] = useState([]);
  const [votes, setVotes]    = useState({A:0,B:0,C:0,D:0});
  const [loading,setLoading] = useState(true);
  const [rem, setRem]        = useState(30);

  const gsRef = useRef(gs);
  const playersRef = useRef(players);
  const votesRef = useRef(votes);

  useEffect(()=>{ gsRef.current=gs; },[gs]);
  useEffect(()=>{ playersRef.current=players; },[players]);
  useEffect(()=>{ votesRef.current=votes; },[votes]);

  // Sincronización en tiempo real con Supabase
  useEffect(()=>{
    channel
      .on('broadcast', { event: 'player:join' }, ({ payload }) => {
        setPlayers(prev => {
          if (prev.find(p => p.id === payload.id)) return prev;
          const next = [...prev, payload];
          channel.send({ type: 'broadcast', event: 'playersUpdated', payload: next });
          return next;
        });
        channel.send({ type: 'broadcast', event: 'stateUpdated', payload: gsRef.current });
      })
      .on('broadcast', { event: 'player:vote' }, ({ payload }) => {
        const { qIndex, letter, pid } = payload;
        if (gsRef.current.phase !== 'question') return;
        
        setVotes(prev => {
          const next = { ...prev, [letter]: (prev[letter] || 0) + 1 };
          channel.send({ type: 'broadcast', event: 'votesUpdated', payload: next });
          return next;
        });
        
        setPlayers(prev => {
          const next = prev.map(p => p.id === pid ? { ...p, answers: { ...p.answers, [qIndex]: letter } } : p);
          channel.send({ type: 'broadcast', event: 'playersUpdated', payload: next });
          return next;
        });
      })
      .on('broadcast', { event: 'player:updateData' }, ({ payload }) => {
        setPlayers(prev => {
          const next = prev.map(p => p.id === payload.pid ? { ...p, ...payload.data } : p);
          channel.send({ type: 'broadcast', event: 'playersUpdated', payload: next });
          return next;
        });
      })
      .on('broadcast', { event: 'player:requestState' }, () => {
        channel.send({ type: 'broadcast', event: 'stateUpdated', payload: gsRef.current });
        channel.send({ type: 'broadcast', event: 'playersUpdated', payload: playersRef.current });
        channel.send({ type: 'broadcast', event: 'votesUpdated', payload: votesRef.current });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setLoading(false);
          // Al iniciar mandamos nuestro estado "por si acaso" algún celular estaba esperando
          channel.send({ type: 'broadcast', event: 'stateUpdated', payload: gsRef.current });
          channel.send({ type: 'broadcast', event: 'playersUpdated', payload: playersRef.current });
        }
      });

    return () => {
       // Si nos vamos, en teoría el canal se limpia. 
       // Pero lo dejamos vivo porque Vercel no hará unmount a menos que cerremos pestaña.
    };
  },[]);

  // Timer countdown
  useEffect(()=>{
    if(gs.phase!=="question"){setRem(30);return;}
    const id=setInterval(()=>{
      const r=Math.max(0,Math.ceil((gs.timerEnd-now())/1000));
      setRem(r);
    },400);
    return()=>clearInterval(id);
  },[gs.phase,gs.timerEnd]);

  const updateState=useCallback(async(newGs)=>{
    channel.send({ type: 'broadcast', event: 'stateUpdated', payload: newGs });
    setGs(newGs);
    gsRef.current=newGs;
  },[]);

  const startQuestion=async()=>{
    const newVotes = {A:0,B:0,C:0,D:0};
    setVotes(newVotes);
    channel.send({ type: 'broadcast', event: 'votesUpdated', payload: newVotes });
    await updateState({...gs,phase:"question",timerEnd:now()+31000});
  };

  const revealAnswer=useCallback(async()=>{
    await updateState({...gsRef.current,phase:"revealed"});
  },[updateState]);

  const showLeaderboard=async()=>{
    await updateState({...gs,phase:"leaderboard"});
  };

  const nextQuestion=async()=>{
    const next=gs.qIndex+1;
    if(next>=QS.length) await updateState({...gs,phase:"case_story",qIndex:next});
    else await updateState({...gs,phase:"lobby_q",qIndex:next});
  };

  const advanceCase=async()=>{
    const steps=["case_story","case_q1","case_q2","case_q3","finished"];
    const i=steps.indexOf(gs.phase);
    await updateState({...gs,phase:steps[Math.min(i+1,steps.length-1)]});
  };

  const resetGame=async()=>{
    const fresh={phase:"lobby",qIndex:0,timerEnd:0};
    channel.send({ type: 'broadcast', event: 'gameReset', payload: {} });
    setGs(fresh);
    setPlayers([]);
    setVotes({A:0,B:0,C:0,D:0});
    channel.send({ type: 'broadcast', event: 'stateUpdated', payload: fresh });
  };

  // Auto-reveal
  useEffect(()=>{
    if(gs.phase==="question"&&rem===0) revealAnswer();
  },[rem,gs.phase,revealAnswer]);

  // Keyboard shortcuts
  useEffect(()=>{
    const h=e=>{
      if(gs.phase==="question"&&(e.key===" "||e.code==="Space")){e.preventDefault();revealAnswer();}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[gs.phase,revealAnswer]);

  if(loading) return <Loading/>;

  const q=QS[gs.qIndex]||null;
  const total=players.filter(p=>p.answers&&p.answers[gs.qIndex]!==undefined).length;

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"Calibri,sans-serif",color:C.white}}>
      {/* Top bar */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,
        padding:"7px 18px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{fontFamily:"Consolas,monospace",color:C.green,fontSize:12,fontWeight:700}}>HOST</span>
        <span style={{color:C.border}}>|</span>
        <span style={{fontFamily:"Consolas,monospace",color:C.muted,fontSize:11}}>
          {gs.phase} | Q{gs.qIndex+1}/{QS.length} | {players.length} jugadores
        </span>
        <div style={{flex:1}}/>
        <button onClick={resetGame} style={{background:"transparent",border:`1px solid ${C.red}50`,
          borderRadius:4,color:C.red,fontSize:11,padding:"3px 10px",cursor:"pointer",
          fontFamily:"Consolas,monospace"}}>⟳ reset</button>
      </div>

      <div style={{padding:"20px 20px",maxWidth:1060,margin:"0 auto"}}>
        {/* LOBBY */}
        {(gs.phase==="lobby"||gs.phase==="lobby_q")&&(
          <div>
            <h2 style={{color:C.cyan,fontFamily:"Consolas,monospace",fontSize:22,margin:"0 0 6px"}}>
              {gs.qIndex===0?"⏳ Sala de espera":"✅ Lista para Q"+(gs.qIndex+1)}
            </h2>
            <p style={{color:C.muted,fontSize:14,margin:"0 0 24px"}}>
              {gs.qIndex===0
                ?"Comparte este mismo link. Los alumnos abren en su celular y hacen clic en 'Unirse al Quiz'."
                :`Pregunta ${gs.qIndex} completada. Inicia la siguiente cuando estés listo.`}
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:28,minHeight:42}}>
              {players.map(p=>(
                <div key={p.id} style={{background:C.card2,border:`1px solid ${C.green}40`,
                  borderRadius:8,padding:"6px 14px",display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{color:C.green,fontSize:10}}>●</span>
                  <span style={{fontWeight:600,fontSize:14}}>{p.name}</span>
                  <span style={{color:C.cyan,fontFamily:"Consolas,monospace",fontSize:12}}>{p.score}pts</span>
                </div>
              ))}
              {players.length===0&&<p style={{color:C.muted,fontStyle:"italic",fontSize:14,margin:0}}>Esperando jugadores...</p>}
            </div>
            <Btn onClick={startQuestion} color={C.green} style={{fontSize:16,padding:"14px 40px"}}>
              {gs.qIndex===0?"$ iniciar_pregunta_1":`$ iniciar_pregunta_${gs.qIndex+1}`}
            </Btn>
          </div>
        )}

        {/* QUESTION */}
        {gs.phase==="question"&&q&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{background:`${LC[LS[q.ans>1?0:2]]}15`,border:`1px solid ${C.muted}40`,
                borderRadius:4,padding:"4px 12px",fontFamily:"Consolas,monospace",
                fontSize:12,color:C.muted}}>Q{gs.qIndex+1}/{QS.length}  ·  {q.topic}</div>
              <div style={{flex:1,height:2,background:C.border,borderRadius:99}}/>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:C.muted,fontSize:12,fontFamily:"Consolas,monospace"}}>{total}/{players.length} votaron</span>
                <TimerRing rem={rem} size={64}/>
              </div>
            </div>

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,
              padding:"22px 26px",marginBottom:16}}>
              <p style={{fontSize:22,fontWeight:700,margin:0,lineHeight:1.4,color:C.white}}>{q.q}</p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
              {q.opts.map((opt,i)=>(
                <div key={i} style={{background:C.card2,border:`1px solid ${LC[LS[i]]}40`,
                  borderRadius:8,padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}}>
                  <span style={{fontFamily:"Consolas,monospace",fontSize:22,fontWeight:900,
                    color:LC[LS[i]],flexShrink:0}}>{LS[i]}</span>
                  <span style={{fontSize:14,color:C.white,lineHeight:1.3}}>{opt}</span>
                </div>
              ))}
            </div>

            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
              padding:"14px 16px",marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}>
                <span style={{color:C.muted,fontSize:12,fontFamily:"Consolas,monospace"}}>votos en vivo</span>
                <span style={{color:C.cyan,fontFamily:"Consolas,monospace",fontSize:12}}>
                  {total} / {players.length}
                </span>
              </div>
              <VoteBars votes={votes} total={total} ans={q.ans} revealed={false}/>
            </div>

            <Btn onClick={revealAnswer} color={C.orange} style={{fontSize:15,padding:"12px 32px"}}>
              [SPACE] Revelar Respuesta
            </Btn>
          </div>
        )}

        {/* REVEALED */}
        {gs.phase==="revealed"&&q&&(()=>{
          const cLetter=LS[q.ans];
          const correctVotes=votes[cLetter]||0;
          return (
            <div>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
                <div style={{background:"#0d2010",border:`1px solid ${C.green}`,borderRadius:8,
                  padding:"10px 20px",display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontFamily:"Consolas,monospace",fontSize:22,fontWeight:900,color:C.green}}>{cLetter}</span>
                  <span style={{fontSize:16,fontWeight:700,color:C.white}}>— {q.opts[q.ans]}</span>
                </div>
                <span style={{color:C.muted,fontSize:13}}>
                  {correctVotes} de {total} acertaron ({total>0?Math.round(correctVotes/total*100):0}%)
                </span>
              </div>

              <div style={{background:C.card,borderLeft:`3px solid ${C.green}`,borderRadius:8,
                padding:"12px 16px",marginBottom:16}}>
                <span style={{color:C.green,fontFamily:"Consolas,monospace",fontSize:11,marginRight:8}}>// explicación</span>
                <p style={{margin:"6px 0 0",color:C.white,lineHeight:1.6,fontSize:14}}>{q.exp}</p>
              </div>

              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
                padding:"14px 16px",marginBottom:18}}>
                <VoteBars votes={votes} total={total} ans={q.ans} revealed={true}/>
              </div>

              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <Btn onClick={showLeaderboard} color={C.orange}>🏆 Ver Leaderboard</Btn>
                <Btn onClick={nextQuestion} color={gs.qIndex>=QS.length-1?C.purple:C.cyan}>
                  {gs.qIndex>=QS.length-1?"Ir al Caso →":`Siguiente Q${gs.qIndex+2}/${QS.length} →`}
                </Btn>
              </div>
            </div>
          );
        })()}

        {/* LEADERBOARD */}
        {gs.phase==="leaderboard"&&(
          <div style={{textAlign:"center"}}>
            <h2 style={{fontSize:32,fontWeight:900,color:C.orange,margin:"0 0 6px"}}>🏆 Leaderboard</h2>
            <p style={{color:C.muted,fontFamily:"Consolas,monospace",fontSize:13,marginBottom:24}}>
              Después de Q{gs.qIndex}/{QS.length}
            </p>
            <Leaderboard players={players}/>
            <Btn onClick={nextQuestion} color={C.cyan} style={{marginTop:24}}>Continuar →</Btn>
          </div>
        )}

        {/* CASE */}
        {["case_story","case_q1","case_q2","case_q3"].includes(gs.phase)&&(()=>{
          const vis={case_story:0,case_q1:1,case_q2:2,case_q3:3}[gs.phase];
          return (
            <div>
              <div style={{background:`${C.orange}20`,border:`1px solid ${C.orange}`,borderRadius:4,
                padding:"3px 12px",display:"inline-block",fontFamily:"Consolas,monospace",
                fontSize:11,color:C.orange,marginBottom:12}}>CASO PRÁCTICO</div>
              <h2 style={{fontSize:24,fontWeight:900,margin:"0 0 14px"}}>{CASE.title}</h2>
              <div style={{background:C.card,borderLeft:`4px solid ${C.orange}`,borderRadius:10,
                padding:"16px 20px",marginBottom:14}}>
                {CASE.story.split("\n").map((ln,i)=>(
                  <p key={i} style={{margin:"0 0 5px",fontSize:14,lineHeight:1.65,
                    color:ln.match(/^\d\./)? C.cyan:C.white,
                    fontWeight:ln.match(/^\d\./)?600:400}}>{ln}</p>
                ))}
              </div>
              {CASE.qs.map((cq,i)=>(
                <div key={i} style={{background:C.card,
                  border:`1px solid ${i<vis?C.orange+"60":C.border}`,
                  borderRadius:8,padding:"13px 16px",marginBottom:10,
                  opacity:i>=vis&&i>0?0.3:1,transition:"all 0.4s"}}>
                  <p style={{margin:"0 0 8px",fontWeight:700,color:C.orange,fontSize:14}}>{cq.q}</p>
                  {i<vis-1&&(
                    <div style={{background:"#0d2010",borderRadius:6,padding:"8px 12px"}}>
                      <p style={{margin:0,color:C.white,fontSize:13,lineHeight:1.6}}>{cq.a}</p>
                    </div>
                  )}
                </div>
              ))}
              <Btn onClick={advanceCase} color={gs.phase==="case_q3"?C.purple:C.orange}
                style={{marginTop:8}}>
                {gs.phase==="case_story"?"Mostrar Pregunta 1":
                 gs.phase==="case_q1"?"Revelar P1 + Mostrar P2":
                 gs.phase==="case_q2"?"Revelar P2 + Mostrar P3":
                 "Revelar Todo → Fin"}
              </Btn>
            </div>
          );
        })()}

        {/* FINISHED */}
        {gs.phase==="finished"&&(
          <div style={{textAlign:"center"}}>
            <h1 style={{fontSize:40,fontWeight:900,margin:"0 0 8px"}}>Simulacro Completado 🎓</h1>
            <p style={{color:C.muted,marginBottom:28,fontSize:15}}>Resultados finales</p>
            <Leaderboard players={players}/>
            <div style={{background:"#1a0a0a",border:`1px solid ${C.orange}`,
              borderRadius:8,padding:"12px 32px",margin:"28px auto",display:"inline-block"}}>
              <span style={{color:C.orange,fontWeight:"bold",fontSize:17}}>⚠ Prueba: Lunes 28 de Abril</span>
            </div>
            <br/>
            <Btn onClick={resetGame} color={C.muted} style={{background:"transparent",
              border:`1px solid ${C.muted}`,color:C.muted,marginTop:8}}>
              $ reiniciar_quiz
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PLAYER APP ───────────────────────────────────────────────────────────────
function PlayerApp() {
  const pidRef = useRef(uid());
  const pid = pidRef.current;

  const [name,   setName]   = useState("");
  const [joined, setJoined] = useState(false);
  const [gs,     setGs]     = useState(null);
  const [myData, setMyData] = useState({name:"",score:0,answers:{}});
  const [voted,  setVoted]  = useState(false);
  const [rem,    setRem]    = useState(30);
  const scoredRef = useRef(new Set());
  const myDataRef = useRef(myData);
  useEffect(()=>{ myDataRef.current=myData; },[myData]);

  // Sync with Supabase
  useEffect(() => {
    channel
      .on('broadcast', { event: 'stateUpdated' }, ({ payload }) => setGs(payload))
      .on('broadcast', { event: 'gameReset' }, () => {
        setJoined(false);
        setMyData({name:"",score:0,answers:{}});
        setVoted(false);
        scoredRef.current.clear();
        setGs({phase:"lobby",qIndex:0,timerEnd:0});
      })
      .subscribe((status) => {
         if (status === 'SUBSCRIBED') {
            // Le pedimos al Host que se reporte con el gameState actual si unimos tarde
            channel.send({ type: 'broadcast', event: 'player:requestState', payload: {} });
         }
      });

    return () => {};
  }, []);

  // Timer
  useEffect(()=>{
    if(!gs||gs.phase!=="question"){setRem(30);return;}
    const id=setInterval(()=>{
      setRem(Math.max(0,Math.ceil((gs.timerEnd-now())/1000)));
    },400);
    return()=>clearInterval(id);
  },[gs?.phase,gs?.timerEnd]);

  // Reset voted when question changes
  useEffect(()=>{
    if(!gs) return;
    setVoted(myDataRef.current.answers?.[gs.qIndex]!==undefined);
  },[gs?.qIndex]);

  // Self-score on reveal
  useEffect(()=>{
    if(!gs||gs.phase!=="revealed"||!joined) return;
    const qi=gs.qIndex;
    if(scoredRef.current.has(qi)) return;
    scoredRef.current.add(qi);
    const myAns=myDataRef.current.answers?.[qi];
    if(!myAns) return;
    if(myAns===LS[QS[qi]?.ans]){
      const updated={...myDataRef.current,score:(myDataRef.current.score||0)+POINTS};
      setMyData(updated);
      channel.send({ type: 'broadcast', event: 'player:updateData', payload: { pid, data: updated }});
    }
  },[gs?.phase,gs?.qIndex,joined]);

  const handleJoin=async()=>{
    const n=name.trim();
    if(!n) return;
    const data={ id: pid, name:n, score:0, answers:{} };
    setMyData(data);
    channel.send({ type: 'broadcast', event: 'player:join', payload: data });
    setJoined(true);
  };

  const handleVote=async(letter)=>{
    if(voted||!gs||gs.phase!=="question") return;
    setVoted(true);
    const updated={...myDataRef.current,answers:{...myDataRef.current.answers,[gs.qIndex]:letter}};
    setMyData(updated);
    channel.send({ type: 'broadcast', event: 'player:vote', payload: { qIndex: gs.qIndex, letter, pid } });
  };

  // ── JOIN SCREEN ──
  if(!joined) return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,
      fontFamily:"Calibri,sans-serif",color:C.white}}>
      <div style={{background:C.gDark,border:`1px solid ${C.green}`,borderRadius:4,
        padding:"4px 14px",marginBottom:20,fontFamily:"Consolas,monospace",
        fontSize:11,color:C.green}}>TALLER DE HACKING ETICO</div>
      <h2 style={{fontSize:28,fontWeight:900,margin:"0 0 6px",textAlign:"center"}}>
        Únete al Simulacro
      </h2>
      <p style={{color:C.muted,marginBottom:28,textAlign:"center",fontSize:14}}>
        Ingresa tu nombre para votar desde el celular
      </p>
      <div style={{width:"100%",maxWidth:300,display:"flex",flexDirection:"column",gap:12}}>
        <input value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleJoin()} placeholder="Tu nombre..."
          autoFocus style={{
            background:C.card,border:`1px solid ${C.border}`,
            borderRadius:8,padding:"14px 16px",fontSize:20,color:C.white,
            outline:"none",fontFamily:"Calibri,sans-serif",width:"100%",
            boxSizing:"border-box",
          }}/>
        <Btn onClick={handleJoin} disabled={!name.trim()} color={C.green}
          style={{padding:"14px",fontSize:16,width:"100%"}}>
          $ unirse_al_quiz
        </Btn>
      </div>
    </div>
  );

  if(!gs) return <Loading/>;

  const q=QS[gs.qIndex]||null;
  const myAns=myData.answers?.[gs.qIndex];

  // ── WAITING ──
  if(gs.phase==="lobby"||gs.phase==="lobby_q") return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,
      fontFamily:"Calibri,sans-serif",color:C.white,textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:16,animation:"pulse 2s ease infinite"}}>⌛</div>
      <h3 style={{margin:"0 0 8px",fontSize:22}}>Hola, {myData.name}!</h3>
      <p style={{color:C.muted,fontSize:14,maxWidth:280}}>
        {gs.qIndex===0?"Esperando que el ayudante inicie la primera pregunta...":
          `Pregunta ${gs.qIndex} completada. Espera la siguiente...`}
      </p>
      <div style={{marginTop:24,background:C.card,borderRadius:8,padding:"8px 20px",
        fontFamily:"Consolas,monospace",color:C.orange,fontSize:14,fontWeight:700}}>
        {myData.score} pts
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  // ── VOTING ──
  if(gs.phase==="question"&&q) return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      padding:"14px 14px 20px",fontFamily:"Calibri,sans-serif",color:C.white}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <span style={{fontFamily:"Consolas,monospace",color:C.muted,fontSize:11,
            display:"block"}}>Q{gs.qIndex+1}/{QS.length}</span>
          <span style={{fontSize:12,color:C.muted}}>{q.topic}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.orange,fontFamily:"Consolas,monospace",fontWeight:700,fontSize:14}}>
            {myData.score}pts
          </span>
          <TimerRing rem={rem} size={52}/>
        </div>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
        padding:"14px 16px",marginBottom:14}}>
        <p style={{margin:0,fontSize:16,fontWeight:700,lineHeight:1.45,color:C.white}}>{q.q}</p>
      </div>

      {!voted?(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,flex:1}}>
          {q.opts.map((opt,i)=>{
            const l=LS[i];
            return (
              <button key={l} onClick={()=>handleVote(l)} style={{
                background:C.card,border:`2px solid ${LC[l]}`,borderRadius:12,
                padding:"14px 10px",display:"flex",flexDirection:"column",
                alignItems:"center",gap:8,cursor:"pointer",color:C.white,
                fontFamily:"Calibri,sans-serif",textAlign:"center",minHeight:90,
                transition:"background 0.15s, transform 0.1s",
              }}
              onMouseOver={e=>{e.currentTarget.style.background=`${LC[l]}18`}}
              onMouseOut={e=>{e.currentTarget.style.background=C.card}}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
              >
                <span style={{fontFamily:"Consolas,monospace",fontSize:30,fontWeight:900,color:LC[l]}}>{l}</span>
                <span style={{fontSize:12,lineHeight:1.35,color:C.white}}>{opt}</span>
              </button>
            );
          })}
        </div>
      ):(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",gap:14}}>
          <div style={{fontSize:56}}>✅</div>
          <p style={{fontSize:20,fontWeight:700,margin:0}}>
            Votaste:{" "}
            <span style={{color:LC[myAns],fontFamily:"Consolas,monospace",fontSize:24}}>{myAns}</span>
          </p>
          <p style={{color:C.muted,fontSize:13,textAlign:"center",margin:0}}>
            Esperando que el ayudante revele la respuesta...
          </p>
        </div>
      )}
    </div>
  );

  // ── REVEALED ──
  if(gs.phase==="revealed"&&q){
    const cLetter=LS[q.ans];
    const isOk=myAns===cLetter;
    return (
      <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",padding:20,
        fontFamily:"Calibri,sans-serif",color:C.white,textAlign:"center"}}>
        <div style={{fontSize:60,marginBottom:14}}>{isOk?"🎉":"😅"}</div>
        <div style={{background:isOk?"#0d2010":"#2a0a0a",
          border:`2px solid ${isOk?C.green:C.red}`,
          borderRadius:12,padding:"16px 24px",marginBottom:14,maxWidth:360,width:"100%"}}>
          <p style={{margin:"0 0 6px",fontSize:20,fontWeight:900,
            color:isOk?C.green:C.red}}>
            {isOk?`¡Correcto! +${POINTS} pts`:`Incorrecto — era ${cLetter}`}
          </p>
          <p style={{margin:0,fontSize:14,color:C.white}}>
            <strong>{q.opts[q.ans]}</strong>
          </p>
        </div>
        <div style={{background:C.card,borderRadius:8,padding:"10px 14px",
          marginBottom:14,maxWidth:360,width:"100%"}}>
          <p style={{margin:0,fontSize:13,color:C.white,lineHeight:1.55}}>{q.exp}</p>
        </div>
        <div style={{fontFamily:"Consolas,monospace",fontSize:20,color:C.orange,fontWeight:900}}>
          {myData.score} pts
        </div>
      </div>
    );
  }

  // ── LEADERBOARD ──
  if(gs.phase==="leaderboard") return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:20,
      fontFamily:"Calibri,sans-serif",color:C.white,textAlign:"center"}}>
      <div style={{fontSize:46,marginBottom:10}}>🏆</div>
      <h2 style={{fontSize:24,margin:"0 0 6px"}}>Leaderboard</h2>
      <p style={{color:C.muted,fontSize:13,marginBottom:20}}>Después de Q{gs.qIndex}/{QS.length}</p>
      <div style={{background:C.card,border:`2px solid ${C.orange}`,borderRadius:12,
        padding:"16px 28px",marginBottom:16}}>
        <p style={{margin:"0 0 2px",color:C.muted,fontSize:12}}>{myData.name}</p>
        <p style={{margin:0,fontSize:34,fontWeight:900,color:C.orange,
          fontFamily:"Consolas,monospace"}}>{myData.score} pts</p>
      </div>
      <p style={{color:C.muted,fontSize:13}}>Esperando que el ayudante continúe...</p>
    </div>
  );

  // ── CASE ──
  if(["case_story","case_q1","case_q2","case_q3"].includes(gs.phase)){
    const vis={case_story:0,case_q1:1,case_q2:2,case_q3:3}[gs.phase];
    return (
      <div style={{background:C.bg,minHeight:"100vh",padding:"14px 16px",
        fontFamily:"Calibri,sans-serif",color:C.white}}>
        <div style={{background:`${C.orange}20`,border:`1px solid ${C.orange}`,borderRadius:4,
          padding:"3px 12px",display:"inline-block",fontFamily:"Consolas,monospace",
          fontSize:11,color:C.orange,marginBottom:10}}>CASO PRÁCTICO</div>
        <h3 style={{fontSize:16,margin:"0 0 12px",fontWeight:700}}>{CASE.title}</h3>
        <div style={{background:C.card,borderLeft:`3px solid ${C.orange}`,
          borderRadius:8,padding:"12px 14px",marginBottom:12}}>
          {CASE.story.split("\n").map((ln,i)=>(
            <p key={i} style={{margin:"0 0 4px",fontSize:12,lineHeight:1.6,
              color:ln.match(/^\d\./)? C.cyan:C.white,
              fontWeight:ln.match(/^\d\./)?600:400}}>{ln}</p>
          ))}
        </div>
        {CASE.qs.map((cq,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${i<vis?C.orange+"50":C.border}`,
            borderRadius:8,padding:"10px 13px",marginBottom:8,
            opacity:i>=vis?0.3:1,transition:"opacity 0.4s"}}>
            <p style={{margin:0,fontWeight:700,color:C.orange,fontSize:12}}>{cq.q}</p>
          </div>
        ))}
        <p style={{color:C.muted,fontSize:12,textAlign:"center",marginTop:12}}>Discutan con el ayudante en clase</p>
      </div>
    );
  }

  // ── FINISHED ──
  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,
      fontFamily:"Calibri,sans-serif",color:C.white,textAlign:"center"}}>
      <div style={{fontSize:60,marginBottom:14}}>🎓</div>
      <h2 style={{fontSize:26,fontWeight:900,margin:"0 0 6px"}}>¡Simulacro completado!</h2>
      <p style={{color:C.muted,marginBottom:20,fontSize:14}}>Tu resultado final</p>
      <div style={{background:C.card,border:`2px solid ${C.orange}`,borderRadius:12,
        padding:"20px 36px",marginBottom:20}}>
        <p style={{margin:"0 0 4px",color:C.muted,fontSize:13}}>{myData.name}</p>
        <p style={{margin:0,fontSize:42,fontWeight:900,color:C.orange,
          fontFamily:"Consolas,monospace"}}>{myData.score} pts</p>
        <p style={{margin:"4px 0 0",color:C.muted,fontSize:12}}>de {QS.length*POINTS} posibles</p>
      </div>
      <div style={{background:"#1a0a0a",border:`1px solid ${C.orange}50`,
        borderRadius:8,padding:"10px 24px"}}>
        <span style={{color:C.orange,fontWeight:"bold"}}>⚠ Prueba: Lunes 28 de Abril</span>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState(null);
  const [pid]  = useState(() => uid());
  if (!mode) return <HomeScreen onHost={()=>setMode("host")} onJoin={()=>setMode("player")}/>;
  if (mode==="host") return <HostApp/>;
  return <PlayerApp pid={pid}/>;
}

import { useState, useEffect, useCallback } from "react";

const QUESTIONS = [
  {
    id: 1,
    topic: "Tríada CIA",
    question: '¿Qué representa la "A" en la tríada CIA de ciberseguridad?',
    options: ["Autenticación", "Autorización", "Disponibilidad (Availability)", "Auditoría"],
    correct: 2,
    explanation: "Availability = Disponibilidad. La tríada es Confidencialidad, Integridad y Disponibilidad. Los sistemas deben estar accesibles para los usuarios autorizados cuando los necesiten.",
  },
  {
    id: 2,
    topic: "Tipos de Hacker",
    question: "¿Cuál es la principal diferencia entre un White Hat y un Grey Hat?",
    options: [
      "El White Hat usa mejores herramientas",
      "El White Hat actúa con autorización; el Grey Hat puede actuar sin ella",
      "El Grey Hat siempre trabaja para empresas de seguridad",
      "No existe diferencia práctica entre ambos",
    ],
    correct: 1,
    explanation: "El White Hat tiene permiso explícito del dueño del sistema. El Grey Hat puede actuar sin autorización pero no con intención maliciosa. El Black Hat actúa maliciosamente.",
  },
  {
    id: 3,
    topic: "Metodología",
    question: "¿Cuál es el orden correcto de las fases de un pentest?",
    options: [
      "Explotación → Reconocimiento → Post-explotación → Reporte",
      "Escaneo → Reconocimiento → Explotación → Reporte",
      "Reconocimiento → Escaneo → Explotación → Post-explotación → Reporte",
      "Planificación → Explotación → Reconocimiento → Reporte",
    ],
    correct: 2,
    explanation: "El orden correcto es: Reconocimiento → Escaneo → Explotación → Post-explotación → Reporte. Primero se recopila información, luego se buscan vulnerabilidades, luego se explotan, y finalmente se documenta.",
  },
  {
    id: 4,
    topic: "Leyes y Ética",
    question: "¿Qué establece la Ley 19.223 en Chile?",
    options: [
      "Regula el comercio electrónico nacional",
      "Protege los datos personales de los ciudadanos",
      "Tipifica los delitos informáticos",
      "Regula el uso corporativo de internet",
    ],
    correct: 2,
    explanation: "La Ley 19.223 (1993) es la ley de delitos informáticos de Chile. Tipifica delitos como el sabotaje informático, espionaje informático y acceso no autorizado a sistemas.",
  },
  {
    id: 5,
    topic: "OSINT — theHarvester",
    question: "¿Qué tipo de información recopila principalmente theHarvester?",
    options: [
      "Vulnerabilidades CVE y puertos abiertos",
      "Grafos de relaciones entre entidades",
      "Correos electrónicos, subdominios y nombres de host",
      "Módulos de reconocimiento automatizados",
    ],
    correct: 2,
    explanation: "theHarvester busca en motores de búsqueda y fuentes públicas (Google, Bing, LinkedIn, Hunter.io, etc.) para extraer correos, subdominios y hosts asociados a un dominio.",
  },
  {
    id: 6,
    topic: "OSINT — Shodan",
    question: "¿Cuál es la principal diferencia entre Shodan y Google?",
    options: [
      "Google es más rápido y tiene mejores filtros",
      "Shodan indexa dispositivos y servicios de red; Google indexa páginas web",
      "Shodan es de pago; Google es completamente gratuito",
      "Google puede encontrar puertos abiertos; Shodan, no",
    ],
    correct: 1,
    explanation: "Shodan es el 'Google de los dispositivos conectados'. Indexa banners de servicios (SSH, HTTP, FTP, etc.) de IPs expuestas en internet, mostrando versiones, puertos abiertos y CVEs.",
  },
  {
    id: 7,
    topic: "Tríada CIA — Caso",
    question: "Un ransomware cifra todos los archivos de una empresa y exige pago. ¿Qué pilar de la CIA es el MÁS afectado?",
    options: ["Confidencialidad", "Integridad", "Disponibilidad", "Autenticidad"],
    correct: 2,
    explanation: "Disponibilidad: los usuarios no pueden acceder a sus datos. El ransomware bloquea el acceso al sistema o a los archivos. Confidencialidad también podría verse afectada si el atacante extrajo datos antes de cifrar.",
  },
  {
    id: 8,
    topic: "Ética Hacker",
    question: "¿En qué consiste el 'Responsible Disclosure' (divulgación responsable)?",
    options: [
      "Publicar la vulnerabilidad de inmediato para presionar un parche",
      "Vender la vulnerabilidad al mejor postor en mercados oscuros",
      "Notificar primero al afectado y dar tiempo para corregir antes de divulgar",
      "Reportar únicamente a organismos gubernamentales",
    ],
    correct: 2,
    explanation: "Responsible Disclosure: el investigador notifica al fabricante/organización antes de hacer pública la vulnerabilidad, dando un plazo razonable (generalmente 90 días) para que puedan corregirla.",
  },
  {
    id: 9,
    topic: "OSINT — Maltego",
    question: "¿Para qué se utiliza principalmente Maltego?",
    options: [
      "Escaneo de puertos y detección de servicios en red",
      "Recolección masiva de correos electrónicos desde motores de búsqueda",
      "Visualización gráfica de relaciones entre entidades OSINT",
      "Gestión de módulos de reconocimiento por línea de comandos",
    ],
    correct: 2,
    explanation: "Maltego genera grafos interactivos que muestran relaciones entre dominios, IPs, correos, personas y organizaciones. Ideal para mapear la superficie de ataque de forma visual.",
  },
  {
    id: 10,
    topic: "Metodología — Reconocimiento",
    question: "¿Qué diferencia el reconocimiento PASIVO del ACTIVO?",
    options: [
      "El pasivo usa más herramientas y es más completo",
      "El activo tarda más tiempo en ejecutarse",
      "El pasivo no interactúa directamente con el objetivo; el activo sí lo hace",
      "No existe diferencia práctica entre ambos en OSINT",
    ],
    correct: 2,
    explanation: "Reconocimiento pasivo: se recopila información sin tocar el objetivo (Google, Shodan, redes sociales). Reconocimiento activo: se interactúa con el objetivo directamente (Nmap, pings, peticiones HTTP).",
  },
  {
    id: 11,
    topic: "Planificación",
    question: "¿Qué documento establece el alcance, límites y reglas de un pentest?",
    options: [
      "Informe final de hallazgos (Report)",
      "Acuerdo de No Divulgación (NDA)",
      "Rules of Engagement (RoE)",
      "Plan de Respuesta a Incidentes",
    ],
    correct: 2,
    explanation: "Las Rules of Engagement (RoE) definen qué sistemas pueden atacarse, en qué horarios, qué técnicas están permitidas y quién es el punto de contacto. Son el contrato operativo del pentest.",
  },
  {
    id: 12,
    topic: "OSINT — Recon-NG",
    question: "¿Cómo organiza Recon-NG el trabajo de reconocimiento?",
    options: [
      "Por capas del modelo OSI",
      "Por tipo de vulnerabilidad detectada",
      "Mediante workspaces con base de datos local y módulos instalables",
      "Por fases automáticas sin intervención del usuario",
    ],
    correct: 2,
    explanation: "Recon-NG usa workspaces para separar proyectos. Cada workspace tiene su propia BD local donde se almacenan dominios, hosts, correos, etc. Los módulos se instalan desde el marketplace y se ejecutan con 'run'.",
  },
];

const CASE = {
  title: "CASO — Retail Express S.A.",
  story: `Durante una auditoría de seguridad de Retail Express S.A., se descubrió que un atacante externo había accedido a la base de datos de clientes. La investigación reveló el siguiente flujo:

1. El atacante buscó en LinkedIn al administrador de sistemas de la empresa, obteniendo su nombre completo, cargo y correo corporativo.
2. Con esa información, utilizó Shodan para buscar servicios expuestos del dominio de la empresa, encontrando el puerto 3306 (MySQL) abierto públicamente con MySQL versión 5.5.
3. Esa versión tenía un CVE crítico conocido. El atacante lo explotó y accedió a la base de datos con 50.000 registros de clientes (RUT, dirección, tarjeta de crédito).`,
  questions: [
    {
      q: "1. ¿Qué fase(s) del pentest ejecutó el atacante y qué herramientas/fuentes usó?",
      a: "Reconocimiento pasivo (OSINT): LinkedIn como fuente abierta para datos del personal + Shodan para descubrir servicios tecnológicos expuestos. No hubo interacción directa con el objetivo hasta la explotación.",
    },
    {
      q: "2. ¿Qué pilar(es) de la tríada CIA fueron vulnerados? Justifica.",
      a: "Confidencialidad (principal): acceso no autorizado a 50.000 registros privados de clientes. Podría afectar Integridad si el atacante modificó datos. Disponibilidad si el sistema quedó comprometido.",
    },
    {
      q: "3. Entrega una recomendación de seguridad según CIS Control v8.",
      a: "CIS 7 (Gestión de Vulnerabilidades): actualizar MySQL y escanear regularmente CVEs. CIS 12 (Gestión de Infraestructura): cerrar puertos no necesarios al exterior. CIS 14 (Conciencia): limitar información pública del personal en redes sociales.",
    },
  ],
};

const COLORS = {
  bg: "#0D1117", card: "#161B22", card2: "#1F2937",
  green: "#39D353", cyan: "#58A6FF", purple: "#BC8CFF",
  orange: "#F0883E", red: "#F85149", white: "#E6EDF3", muted: "#8B949E",
};

const topicColors = {
  "Tríada CIA": COLORS.cyan, "Tríada CIA — Caso": COLORS.cyan,
  "Tipos de Hacker": COLORS.purple, "Metodología": COLORS.orange,
  "Metodología — Reconocimiento": COLORS.orange,
  "Leyes y Ética": COLORS.red, "Ética Hacker": COLORS.red,
  "OSINT — theHarvester": COLORS.green, "OSINT — Shodan": COLORS.cyan,
  "OSINT — Maltego": COLORS.purple, "OSINT — Recon-NG": COLORS.orange,
  "Planificación": "#F0883E",
};

function TimerRing({ seconds, total }) {
  const r = 28, circ = 2 * Math.PI * r;
  const pct = seconds / total;
  const dash = circ * pct;
  const color = seconds > total * 0.5 ? COLORS.green : seconds > total * 0.25 ? COLORS.orange : COLORS.red;
  return (
    <div style={{ position: "relative", width: 72, height: 72 }}>
      <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke={COLORS.card2} strokeWidth={5} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.5s" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Consolas, monospace", fontSize: 22, fontWeight: "bold", color,
      }}>{seconds}</div>
    </div>
  );
}

export default function QuizApp() {
  const [screen, setScreen] = useState("home"); // home | quiz | case | result
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [caseStep, setCaseStep] = useState(0); // 0=story, 1,2,3=question reveals
  const [correctCount, setCorrectCount] = useState(0);

  const q = QUESTIONS[qIndex];

  // Timer
  useEffect(() => {
    if (!timerActive || revealed) return;
    if (timer <= 0) { setTimerActive(false); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer, timerActive, revealed]);

  const startTimer = useCallback(() => { setTimer(30); setTimerActive(true); }, []);
  const reveal = useCallback(() => { setRevealed(true); setTimerActive(false); }, []);

  const nextQuestion = useCallback(() => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(i => i + 1);
      setRevealed(false);
      setTimer(30);
      setTimerActive(false);
    } else {
      setScreen("case");
      setCaseStep(0);
    }
  }, [qIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (screen !== "quiz") return;
      if ((e.key === " " || e.key === "Enter") && !revealed) reveal();
      else if ((e.key === "ArrowRight" || e.key === "n") && revealed) nextQuestion();
      else if (e.key === "t" && !revealed && !timerActive) startTimer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, revealed, timerActive, reveal, nextQuestion, startTimer]);

  const accentColor = q ? (topicColors[q.topic] || COLORS.cyan) : COLORS.green;

  // ── HOME ──────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Calibri, sans-serif", color: COLORS.white, padding: 24,
    }}>
      <div style={{
        background: COLORS.gDark, border: `1px solid ${COLORS.green}`,
        borderRadius: 4, padding: "4px 16px", marginBottom: 24,
        fontFamily: "Consolas, monospace", fontSize: 12, color: COLORS.green, letterSpacing: 2,
      }}>TALLER DE HACKING ETICO</div>

      <h1 style={{ fontSize: 52, fontWeight: 900, textAlign: "center", margin: "0 0 8px", lineHeight: 1.1 }}>
        Simulacro de Prueba
      </h1>
      <p style={{ color: COLORS.cyan, fontSize: 20, margin: "0 0 8px", fontFamily: "Consolas, monospace" }}>
        Ayudantía N.6 — Repaso Prueba
      </p>
      <p style={{ color: COLORS.muted, fontSize: 14, margin: "0 0 48px" }}>
        12 preguntas de alternativas + 1 caso práctico
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        maxWidth: 640, width: "100%", marginBottom: 48,
      }}>
        {[
          { label: "Preguntas", val: "12", color: COLORS.cyan },
          { label: "Tiempo c/u", val: "30s", color: COLORS.orange },
          { label: "Caso final", val: "1", color: COLORS.purple },
        ].map(({ label, val, color }) => (
          <div key={label} style={{
            background: COLORS.card, border: `1px solid ${color}30`,
            borderRadius: 8, padding: "16px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "Consolas, monospace" }}>{val}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: "#1a0a0a", border: `1px solid ${COLORS.orange}40`,
        borderRadius: 8, padding: "12px 24px", marginBottom: 40, textAlign: "center",
      }}>
        <span style={{ color: COLORS.orange, fontWeight: "bold" }}>⚠ Prueba: Lunes 28 de Abril</span>
      </div>

      <button onClick={() => setScreen("quiz")} style={{
        background: COLORS.green, color: COLORS.bg, border: "none",
        borderRadius: 6, padding: "16px 48px", fontSize: 18, fontWeight: 900,
        cursor: "pointer", fontFamily: "Consolas, monospace", letterSpacing: 1,
        transition: "transform 0.1s, opacity 0.1s",
      }}
        onMouseOver={e => e.target.style.opacity = 0.85}
        onMouseOut={e => e.target.style.opacity = 1}
      >
        $ iniciar_simulacro
      </button>

      <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 20, fontFamily: "Consolas, monospace" }}>
        [SPACE] revelar · [→] siguiente · [T] iniciar timer
      </p>
    </div>
  );

  // ── QUIZ ──────────────────────────────────────────────────────────
  if (screen === "quiz") return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", display: "flex",
      flexDirection: "column", fontFamily: "Calibri, sans-serif", color: COLORS.white,
      padding: "20px 28px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        {/* Progress */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "Consolas, monospace", fontSize: 13, color: COLORS.muted }}>
              Pregunta {qIndex + 1} / {QUESTIONS.length}
            </span>
            <span style={{
              background: `${accentColor}20`, border: `1px solid ${accentColor}60`,
              borderRadius: 4, padding: "2px 10px", fontSize: 12,
              fontFamily: "Consolas, monospace", color: accentColor,
            }}>{q.topic}</span>
          </div>
          <div style={{ background: COLORS.card2, borderRadius: 99, height: 5, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`,
              background: accentColor, borderRadius: 99,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
        {/* Timer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <TimerRing seconds={timer} total={30} />
          {!timerActive && !revealed && (
            <button onClick={startTimer} style={{
              background: "transparent", border: `1px solid ${COLORS.border}`,
              borderRadius: 4, color: COLORS.muted, fontSize: 10,
              padding: "2px 8px", cursor: "pointer", fontFamily: "Consolas, monospace",
            }}>[T] timer</button>
          )}
        </div>
      </div>

      {/* Top accent bar */}
      <div style={{ height: 3, background: accentColor, borderRadius: 99, marginBottom: 24 }} />

      {/* Question */}
      <div style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 10, padding: "24px 28px", marginBottom: 20, flex: "0 0 auto",
      }}>
        <p style={{ fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.4, color: COLORS.white }}>
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          const letter = ["A", "B", "C", "D"][i];
          const isCorrect = i === q.correct;
          let bg = COLORS.card, border = COLORS.card2, textColor = COLORS.white;
          if (revealed) {
            if (isCorrect) { bg = "#0d2e15"; border = COLORS.green; textColor = COLORS.green; }
            else { bg = "#1a0a0a"; border = "#3d1818"; textColor = COLORS.muted; }
          }
          return (
            <div key={i} style={{
              background: bg, border: `2px solid ${border}`,
              borderRadius: 10, padding: "18px 20px",
              display: "flex", alignItems: "center", gap: 16,
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                background: revealed
                  ? (isCorrect ? `${COLORS.green}30` : "#2a1010")
                  : `${accentColor}20`,
                border: `2px solid ${revealed ? (isCorrect ? COLORS.green : "#3d1818") : accentColor}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Consolas, monospace", fontSize: 18, fontWeight: 900,
                color: revealed ? (isCorrect ? COLORS.green : "#5a3030") : accentColor,
              }}>{letter}</div>
              <span style={{ fontSize: 17, fontWeight: 600, color: textColor, lineHeight: 1.3 }}>
                {revealed && isCorrect && "✓ "}{opt}
              </span>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div style={{
          background: "#0d2010", border: `1px solid ${COLORS.green}50`,
          borderRadius: 10, padding: "14px 20px", marginBottom: 16,
          animation: "fadeIn 0.3s ease",
        }}>
          <span style={{ color: COLORS.green, fontWeight: 700, marginRight: 8, fontFamily: "Consolas, monospace" }}>
            //
          </span>
          <span style={{ fontSize: 14, color: COLORS.white, lineHeight: 1.5 }}>{q.explanation}</span>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        {!revealed ? (
          <button onClick={reveal} style={{
            background: accentColor, color: COLORS.bg, border: "none",
            borderRadius: 6, padding: "12px 32px", fontSize: 15, fontWeight: 900,
            cursor: "pointer", fontFamily: "Consolas, monospace",
          }}>
            [SPACE] Revelar Respuesta
          </button>
        ) : (
          <button onClick={nextQuestion} style={{
            background: qIndex < QUESTIONS.length - 1 ? COLORS.cyan : COLORS.purple,
            color: COLORS.bg, border: "none", borderRadius: 6,
            padding: "12px 32px", fontSize: 15, fontWeight: 900,
            cursor: "pointer", fontFamily: "Consolas, monospace",
          }}>
            {qIndex < QUESTIONS.length - 1 ? "[→] Siguiente Pregunta" : "[→] Ir al Caso"}
          </button>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );

  // ── CASE ──────────────────────────────────────────────────────────
  if (screen === "case") return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", display: "flex",
      flexDirection: "column", fontFamily: "Calibri, sans-serif",
      color: COLORS.white, padding: "24px 28px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          background: `${COLORS.orange}20`, border: `1px solid ${COLORS.orange}`,
          borderRadius: 4, padding: "4px 14px",
          fontFamily: "Consolas, monospace", fontSize: 12, color: COLORS.orange,
        }}>CASO PRÁCTICO</div>
        <div style={{ flex: 1, height: 2, background: COLORS.orange, borderRadius: 99 }} />
      </div>

      <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 16px", color: COLORS.white }}>
        {CASE.title}
      </h2>

      {/* Story */}
      <div style={{
        background: COLORS.card, border: `1px solid ${COLORS.card2}`,
        borderRadius: 10, padding: "20px 24px", marginBottom: 20,
        borderLeft: `4px solid ${COLORS.orange}`,
      }}>
        {CASE.story.split("\n").map((line, i) => (
          <p key={i} style={{
            margin: "0 0 8px", fontSize: 15, lineHeight: 1.6,
            color: line.match(/^\d\./) ? COLORS.cyan : COLORS.white,
            fontWeight: line.match(/^\d\./) ? 600 : 400,
          }}>{line}</p>
        ))}
      </div>

      {/* Case questions, reveal one by one */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {CASE.questions.map((cq, i) => (
          <div key={i} style={{
            background: COLORS.card, border: `1px solid ${caseStep > i ? COLORS.green + "60" : COLORS.card2}`,
            borderRadius: 10, padding: "16px 20px",
            opacity: caseStep <= i ? 0.35 : 1,
            transition: "all 0.4s ease",
          }}>
            <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: COLORS.orange }}>{cq.q}</p>
            {caseStep > i + 1 && (
              <div style={{
                background: "#0d2010", border: `1px solid ${COLORS.green}40`,
                borderRadius: 6, padding: "10px 14px",
                animation: "fadeIn 0.3s ease",
              }}>
                <span style={{ fontFamily: "Consolas, monospace", color: COLORS.green, fontSize: 12 }}>// respuesta </span>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.white, lineHeight: 1.6 }}>{cq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
        {caseStep < CASE.questions.length + 1 ? (
          <button onClick={() => setCaseStep(s => s + 1)} style={{
            background: caseStep === 0 ? COLORS.orange : COLORS.green,
            color: COLORS.bg, border: "none", borderRadius: 6,
            padding: "12px 32px", fontSize: 15, fontWeight: 900,
            cursor: "pointer", fontFamily: "Consolas, monospace",
          }}>
            {caseStep === 0 ? "Mostrar Pregunta 1" :
              caseStep === 1 ? "Revelar P.1 + Mostrar P.2" :
              caseStep === 2 ? "Revelar P.2 + Mostrar P.3" :
              "Revelar Respuesta Final"}
          </button>
        ) : (
          <button onClick={() => setScreen("result")} style={{
            background: COLORS.purple, color: COLORS.bg, border: "none",
            borderRadius: 6, padding: "12px 32px", fontSize: 15, fontWeight: 900,
            cursor: "pointer", fontFamily: "Consolas, monospace",
          }}>Ver Resumen Final →</button>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );

  // ── RESULT ────────────────────────────────────────────────────────
  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Calibri, sans-serif", color: COLORS.white, padding: 32, textAlign: "center",
    }}>
      <div style={{
        fontFamily: "Consolas, monospace", fontSize: 13, color: COLORS.green,
        marginBottom: 16, letterSpacing: 2,
      }}>SIMULACRO COMPLETADO</div>

      <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 8px" }}>Eso es todo.</h1>
      <p style={{ color: COLORS.muted, fontSize: 16, margin: "0 0 40px" }}>
        Prueba el lunes 28 de Abril. Ya tienen las herramientas.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
        maxWidth: 540, width: "100%", marginBottom: 48,
      }}>
        {[
          { label: "Preguntas cubiertas", val: "12", color: COLORS.cyan },
          { label: "Caso práctico", val: "✓", color: COLORS.green },
          { label: "Días para la prueba", val: "7", color: COLORS.orange },
        ].map(({ label, val, color }) => (
          <div key={label} style={{
            background: COLORS.card, border: `1px solid ${color}40`,
            borderRadius: 10, padding: 20, textAlign: "center",
          }}>
            <div style={{ fontSize: 36, fontWeight: 900, color, fontFamily: "Consolas, monospace" }}>{val}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: "#1a0a0a", border: `1px solid ${COLORS.orange}`,
        borderRadius: 8, padding: "14px 32px", marginBottom: 40,
      }}>
        <span style={{ color: COLORS.orange, fontWeight: "bold", fontSize: 18 }}>
          ⚠  Prueba: Lunes 28 de Abril
        </span>
      </div>

      <button onClick={() => { setScreen("home"); setQIndex(0); setRevealed(false); setTimer(30); setTimerActive(false); }} style={{
        background: "transparent", border: `1px solid ${COLORS.muted}`,
        borderRadius: 6, padding: "10px 28px", fontSize: 14,
        color: COLORS.muted, cursor: "pointer", fontFamily: "Consolas, monospace",
      }}>$ reiniciar_simulacro</button>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { Trophy, GraduationCap, CheckCircle, XCircle, AlertTriangle, RotateCcw, Medal, Monitor, Smartphone, User, Hourglass, Play, LogIn } from "lucide-react";
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
const LC = { A:C.cyan, B:C.green, C:C.orange, D:C.purple, E:C.red };
const LS = ["A","B","C","D","E"];
const POINTS = 100;

const uid   = () => Math.random().toString(36).slice(2,10);
const now   = () => Date.now();

// ─── 25 PREGUNTAS ─────────────────────────────────────────────────────────────
const QS = [
  {"id":1,"topic":"Explotación","q":"¿Qué tipo de vulnerabilidad ocurre cuando un atacante inyecta código JavaScript que se ejecuta en el navegador de otra víctima?","opts":["Ninguna de las anteriores","IDOR","Cross-Site Scripting (XSS)","SQL Injection","Broken Access Control"],"ans":2,"exp":"XSS (Cross-Site Scripting) permite inyectar JavaScript que se ejecuta en el navegador de la víctima. A diferencia de SQLi, no busca afectar el servidor sino al cliente."},
  {"id":2,"topic":"Explotación","q":"En un ataque SQL Injection, el payload: ' OR '1'='1' -- ¿Qué hace el '--' al final?","opts":["Indica una concatenación de strings en SQL","Fuerza un error en la base de datos","Termina la sesión del servidor","Comenta el resto de la consulta SQL, evitando que se evalúe la condición de contraseña","Ninguna de las anteriores"],"ans":3,"exp":"En SQL, '--' es el inicio de un comentario de línea. Esto hace que todo lo que venga después (como AND password='xxx') sea ignorado por el motor de base de datos."},
  {"id":3,"topic":"Explotación","q":"¿Cuál es la diferencia entre Blind SQLi y Time-Based SQLi?","opts":["Son exactamente lo mismo, solo cambia el nombre","Blind SQLi solo funciona en MySQL; Time-Based en PostgreSQL","Blind SQLi es más rápido; Time-Based es más sigiloso","Ninguna de las anteriores","Blind SQLi no muestra resultados directos; Time-Based SQLi además usa tiempos de respuesta como canal de información"],"ans":4,"exp":"Blind SQLi no muestra errores ni datos visibles, el atacante infiere por el comportamiento. Time-Based es una variante donde la condición verdadera o falsa se detecta por el tiempo que tarda la respuesta (ej: SLEEP(5))."},
  {"id":4,"topic":"Explotación","q":"En Broken Access Control, ¿qué describe el término 'escalación vertical de privilegios'?","opts":["Un usuario normal logra acceder a funciones reservadas para administradores","Un atacante intercepta el tráfico entre cliente y servidor","Un usuario evita la autenticación usando cookies robadas","Un usuario accede a datos de otro usuario del mismo nivel","Ninguna de las anteriores"],"ans":0,"exp":"Escalación vertical = pasar a un rol superior. Un usuario normal accede a panel de admin, elimina usuarios, etc. La horizontal sería acceder a datos de otro usuario del mismo nivel."},
  {"id":5,"topic":"Explotación","q":"¿Qué es IDOR (Insecure Direct Object Reference)?","opts":["Un tipo de ataque de fuerza bruta contra APIs","Un método de autenticación multifactor inseguro","Una vulnerabilidad donde la aplicación usa IDs directos sin verificar si el usuario tiene permiso sobre ese recurso","Ninguna de las anteriores","Una técnica de cifrado para proteger URLs"],"ans":2,"exp":"IDOR ocurre cuando cambias /api/user/15 por /api/user/16 y obtienes datos de otro usuario. La app no verifica que el ID solicitado pertenezca al usuario autenticado."},
  {"id":6,"topic":"Explotación","q":"En XSS, ¿cuál es la diferencia entre Reflected XSS y Stored XSS?","opts":["No hay diferencia funcional, solo de nombre","Reflected es permanente; Stored es temporal","Reflected afecta al servidor; Stored solo al cliente","En Reflected el payload viaja en la request y vuelve inmediatamente; en Stored queda guardado en la app y afecta a todos los que vean ese contenido","Ninguna de las anteriores"],"ans":3,"exp":"Reflected XSS: el script va en la URL y la app lo refleja de vuelta (ej: parámetros de búsqueda). Stored XSS: el script se guarda en la DB (comentarios, perfiles) y ataca a cualquiera que cargue esa página."},
  {"id":7,"topic":"Post-Explo: AV Evasion","q":"¿Qué significa AV Evasion en el contexto de post-explotación?","opts":["Escalar privilegios después de obtener acceso inicial","Moverse lateralmente entre sistemas de la red","Técnicas para que el malware o payload no sea detectado por el software antivirus de la víctima","Ninguna de las anteriores","Eliminar los logs del sistema comprometido"],"ans":2,"exp":"AV Evasion son todas las técnicas usadas para que un payload malicioso no sea detectado por antivirus. Incluye ofuscación, cifrado del payload, uso de técnicas fileless, entre otras."},
  {"id":8,"topic":"Post-Explo: AV Evasion","q":"¿Qué diferencia existe entre un antivirus con detección basada en firmas y uno con detección basada en comportamiento?","opts":["El de firmas es más moderno y efectivo contra ataques 0-day","Son exactamente iguales en su funcionamiento","Ninguna de las anteriores","El de firmas compara el archivo contra una base de datos de malware conocido; el de comportamiento analiza lo que hace el proceso en tiempo de ejecución","El de comportamiento solo funciona en sistemas Windows"],"ans":3,"exp":"Detección por firma = busca patrones conocidos en el archivo (ineficaz contra malware nuevo u ofuscado). Detección por comportamiento = analiza las acciones del proceso en tiempo real (más efectivo contra malware nuevo pero más costoso en recursos)."},
  {"id":9,"topic":"Post-Explo: AV Evasion","q":"¿Qué es un ataque 'fileless' en el contexto de AV Evasion?","opts":["Ninguna de las anteriores","Un ataque que borra todos los archivos del sistema víctima","Una técnica para exfiltrar archivos sin dejar rastro en la red","Un tipo de malware que opera completamente en memoria RAM sin escribir archivos al disco, dificultando la detección","Un ataque que cifra los archivos del usuario (ransomware)"],"ans":3,"exp":"Malware fileless no escribe ejecutables al disco. Opera en memoria (ej: usando PowerShell, WMI, macros de Office). Al no haber archivo que analizar, los AV basados en firma tienen dificultad para detectarlo."},
  {"id":10,"topic":"Post-Explo: AV Evasion","q":"¿Cuál de las siguientes técnicas es una forma de AV Evasion mediante ofuscación de código?","opts":["Codificar el payload en Base64 o XOR para que no coincida con la firma conocida del AV","Desactivar el firewall del sistema comprometido","Usar HTTPS para comunicar el C2","Ninguna de las anteriores","Renombrar el payload de 'malware.exe' a 'update.exe'"],"ans":0,"exp":"La ofuscación modifica la representación del código (Base64, XOR, cifrado) sin cambiar su funcionalidad. El objetivo es que el binario resultante no coincida con ninguna firma en la base de datos del AV."},
  {"id":11,"topic":"Post-Explo: AV Evasion","q":"En el contexto de evasión de antivirus, ¿qué es un 'payload encriptado' y cuál es su limitación?","opts":["Un payload que solo funciona en redes cifradas con VPN","Un archivo comprimido con contraseña","Un payload cuyo contenido está cifrado para evitar la detección por firma, pero que debe descifrarse en memoria para ejecutarse, lo que puede ser detectado por AV de comportamiento","Un payload que no puede ser ejecutado en el sistema víctima","Ninguna de las anteriores"],"ans":2,"exp":"El cifrado evita la detección estática por firma. Sin embargo, para ejecutarse el payload debe desencriptarse en memoria, y ese proceso de desencriptado o la ejecución del shellcode puede ser detectado por AV con análisis de comportamiento."},
  {"id":12,"topic":"Post-Explo: Passwords","q":"¿Qué es un ataque de diccionario en el contexto de crackeo de contraseñas?","opts":["Forzar al usuario a ingresar su contraseña en una página falsa","Interceptar la contraseña mientras viaja por la red sin cifrar","Probar una lista de palabras y contraseñas comunes previamente compiladas contra el hash de la víctima","Buscar la contraseña probando todas las combinaciones posibles de caracteres","Ninguna de las anteriores"],"ans":2,"exp":"Ataque de diccionario = usa un wordlist (lista de contraseñas comunes como 'rockyou.txt'). Es mucho más rápido que fuerza bruta porque aprovecha que los usuarios tienden a usar contraseñas predecibles."},
  {"id":13,"topic":"Post-Explo: Passwords","q":"¿Qué diferencia existe entre un ataque de fuerza bruta y un ataque de diccionario?","opts":["Fuerza bruta prueba TODAS las combinaciones posibles de caracteres; diccionario prueba solo palabras de una lista predefinida","Ninguna de las anteriores","Fuerza bruta es más rápido que diccionario","Diccionario solo funciona contra contraseñas numéricas","Son exactamente lo mismo"],"ans":0,"exp":"Fuerza bruta: exhaustivo, prueba aaaaaa, aaaaab... hasta encontrarla. Diccionario: más eficiente, prueba contraseñas probables. En la práctica se combina con reglas (agregar números al final, mayúsculas, etc.)."},
  {"id":14,"topic":"Post-Explo: Passwords","q":"¿Qué es una Rainbow Table en el contexto de crackeo de contraseñas?","opts":["Una técnica para capturar contraseñas mediante un ataque man-in-the-middle","Un tipo especial de diccionario solo para contraseñas numéricas","Una tabla de colores usada para ofuscar el malware","Una tabla precalculada que mapea hashes a sus contraseñas en texto plano, acelerando el crackeo","Ninguna de las anteriores"],"ans":3,"exp":"Rainbow Table precalcula los hashes de millones de contraseñas. En vez de calcular el hash en el momento del ataque, simplemente se busca el hash capturado en la tabla. El 'salt' en los hashes modernos hace ineficaces las Rainbow Tables."},
  {"id":15,"topic":"Post-Explo: Passwords","q":"En post-explotación, ¿qué herramienta de Metasploit se usa comúnmente para extraer hashes de contraseñas de un sistema Windows comprometido?","opts":["use auxiliary/scanner/smb/smb_login","hashdump (comando dentro de meterpreter)","use exploit/windows/smb/ms17_010_eternalblue","Ninguna de las anteriores","search hashdump"],"ans":1,"exp":"Una vez con sesión Meterpreter activa en Windows, el comando 'hashdump' extrae los hashes NTLM de las cuentas del sistema desde la SAM (Security Account Manager). Luego esos hashes pueden crackearse offline."},
  {"id":16,"topic":"Post-Explo: Passwords","q":"¿Qué técnica se usa cuando, en vez de crackear un hash NTLM, se usa directamente el hash para autenticarse en otro sistema de la red?","opts":["Credential Stuffing","Kerberoasting","Rainbow Table Attack","Ninguna de las anteriores","Pass-the-Hash"],"ans":4,"exp":"Pass-the-Hash: en Windows, el protocolo NTLM puede autenticarse con solo el hash de la contraseña, sin necesidad de conocer la contraseña en texto plano. Esto permite moverse lateralmente en la red sin crackear nada."},
  {"id":17,"topic":"Post-Explo: Alternative Attacks","q":"¿Qué es un ataque de tipo 'Credential Stuffing'?","opts":["Usar combinaciones de usuario/contraseña filtradas de otras brechas de datos para intentar acceder a servicios distintos","Usar un diccionario de contraseñas comunes contra un solo sistema","Interceptar credenciales en tránsito usando un sniffer de red","Forzar al usuario a cambiar su contraseña mediante ingeniería social","Ninguna de las anteriores"],"ans":0,"exp":"Credential Stuffing aprovecha que muchos usuarios reutilizan contraseñas. Se toman credenciales filtradas (ej: de una brecha en un foro) y se prueban en otros servicios como Gmail, bancos, etc."},
  {"id":18,"topic":"Post-Explo: Alternative Attacks","q":"¿Qué describe el concepto de 'Lateral Movement' (movimiento lateral) en una intrusión?","opts":["El atacante cambia su dirección IP para evitar ser rastreado","Ninguna de las anteriores","El atacante mueve los archivos robados a un servidor externo (exfiltración)","El atacante eleva sus privilegios de usuario normal a administrador en el mismo sistema","El atacante se desplaza desde un sistema comprometido hacia otros sistemas de la misma red interna"],"ans":4,"exp":"Lateral Movement: una vez dentro de la red, el atacante se mueve de máquina en máquina usando credenciales robadas, shares, vulnerabilidades internas, etc. El objetivo es llegar a activos de mayor valor (DC, base de datos, etc.)."},
  {"id":19,"topic":"Post-Explo: Alternative Attacks","q":"¿Qué es un ataque de tipo 'Phishing' y en qué fase del Kill Chain se ubica principalmente?","opts":["Envío de comunicaciones engañosas (email, SMS) para robar credenciales o instalar malware; fase de Entrega","Escaneo de puertos abiertos en la víctima; fase de Reconocimiento","Explotación de vulnerabilidades en el servidor web; fase de Explotación","Instalación de backdoors; fase de Post-Explotación","Ninguna de las anteriores"],"ans":0,"exp":"Phishing crea comunicaciones falsas que parecen legítimas. En el Kill Chain se ubica en 'Entrega' (Delivery): el atacante entrega el payload o enlace malicioso a la víctima."},
  {"id":20,"topic":"Post-Explo: Alternative Attacks","q":"¿Qué es un C2 (Command & Control) en el contexto de post-explotación?","opts":["Un protocolo de cifrado para comunicaciones seguras entre administradores","Ninguna de las anteriores","La infraestructura que usa el atacante para enviar comandos y recibir datos de los sistemas comprometidos","Un tipo de firewall que controla el tráfico entrante y saliente","Un log centralizado de eventos de seguridad"],"ans":2,"exp":"C2 o C&C es el servidor del atacante con el que se comunica el malware instalado en la víctima. Permite enviar comandos, exfiltrar datos, actualizar el malware, etc. Herramientas como Metasploit, Cobalt Strike o Empire implementan C2."},
  {"id":21,"topic":"Post-Explo: Alternative Attacks","q":"¿Qué es el 'pivoting' en el contexto de una intrusión?","opts":["Usar un sistema comprometido como punto de salto para atacar otros sistemas de la red interna que no son accesibles directamente desde Internet","Rotar las claves de cifrado del C2 periódicamente","Cambiar el vector de ataque de SQLi a XSS durante una intrusión","Ninguna de las anteriores","Elevar privilegios usando una vulnerabilidad del kernel"],"ans":0,"exp":"Pivoting: el sistema comprometido actúa como 'puente'. El atacante enruta su tráfico a través de él para alcanzar subredes internas. En Metasploit se puede hacer con 'route add' o ProxyChains, que vieron en talleres anteriores."},
  {"id":22,"topic":"Redes WiFi","q":"¿Cuál es la principal vulnerabilidad del protocolo WEP que lo hace inseguro?","opts":["Ninguna de las anteriores","Solo funciona en la banda de 5 GHz","Usa contraseñas demasiado cortas obligatoriamente","El algoritmo RC4 implementado incorrectamente permitía recuperar la clave capturando suficientes paquetes de tráfico","No soporta más de 10 dispositivos conectados simultáneamente"],"ans":3,"exp":"WEP usaba RC4 con vectores de inicialización (IV) de solo 24 bits que se repetían frecuentemente. Un atacante capturando suficientes paquetes podía analizar los IVs repetidos y recuperar la clave. Fue declarado obsoleto en 2004."},
  {"id":23,"topic":"Redes WiFi","q":"En el ataque a redes WPA2, ¿qué es el 'handshake de 4 pasos' y por qué es el objetivo del atacante?","opts":["Ninguna de las anteriores","Es el proceso de desconexión segura entre cliente y AP","Es la contraseña WiFi transmitida en texto plano durante la conexión inicial","Es un protocolo de autenticación multifactor que usa 4 tokens distintos","Es el proceso de negociación entre router y cliente que contiene información derivada de la contraseña, permitiendo crackearla offline"],"ans":4,"exp":"El 4-way handshake es el intercambio de mensajes entre cliente y AP al conectarse. Contiene valores derivados de la contraseña (PMK/PTK). Al capturarlo, el atacante puede intentar crackear la contraseña offline con un diccionario usando Aircrack-ng."},
  {"id":24,"topic":"Redes WiFi","q":"¿Para qué sirve el comando 'airmon-ng start wlan0' en un ataque WiFi?","opts":["Ninguna de las anteriores","Inicia un escaneo de redes WiFi disponibles y muestra sus MACs","Conecta la tarjeta WiFi a la red objetivo automáticamente","Pone la tarjeta de red en modo monitor, permitiendo capturar todos los paquetes WiFi del entorno sin estar asociado a ninguna red","Inicia el proceso de deautenticación de clientes"],"ans":3,"exp":"El modo monitor permite a la tarjeta capturar todos los paquetes WiFi en el aire, incluyendo los de redes a las que no está conectada. Es el primer paso del flujo: airmon-ng → airodump-ng → aireplay-ng → aircrack-ng."},
  {"id":25,"topic":"Redes WiFi","q":"¿Qué hace el comando 'aireplay-ng --deauth 0 -a <MAC_AP> -c <MAC_cliente> wlan0mon'?","opts":["Conecta el atacante a la red WiFi usando las credenciales del cliente","Ninguna de las anteriores","Cambia la contraseña del AP remotamente","Envía paquetes de desautenticación falsos al cliente, forzándolo a desconectarse del AP y reconectarse, lo que genera el handshake WPA2 que el atacante quiere capturar","Descifra el tráfico capturado entre el cliente y el AP"],"ans":3,"exp":"El ataque de deauth envía paquetes 802.11 de desautenticación (suplantando al AP) al cliente. Al desconectarse, el cliente se vuelve a conectar automáticamente, generando el handshake de 4 pasos que airodump-ng captura en el archivo .cap."},
  {"id":26,"topic":"Redes WiFi","q":"¿Cuál es la mejora principal que introdujo WPA2 sobre WPA en términos de seguridad?","opts":["WPA2 eliminó la necesidad de contraseña en redes domésticas","Ninguna de las anteriores","WPA2 reemplazó TKIP por AES (Advanced Encryption Standard) como algoritmo de cifrado principal","WPA2 agregó autenticación de doble factor obligatoria","WPA2 introdujo contraseñas más largas de hasta 64 caracteres"],"ans":2,"exp":"WPA usaba TKIP (Temporal Key Integrity Protocol) como mejora temporal sobre RC4. WPA2 adoptó AES como estándar, que es significativamente más robusto. Sin embargo, WPA2-Personal sigue siendo vulnerable a ataques de diccionario si se captura el handshake."},
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
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,alignItems:"flex-end"}}>
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
  const medals=[<Medal color="#FFD700" size={18} />, <Medal color="#C0C0C0" size={18} />, <Medal color="#CD7F32" size={18} />];
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
function HomeScreen({ onHost, onJoin, onSolo }) {
  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",fontFamily:"Calibri,sans-serif",
      color:C.white,padding:24,gap:0}}>
      <div style={{background:C.gDark,border:`1px solid ${C.green}`,borderRadius:4,
        padding:"4px 16px",marginBottom:22,fontFamily:"Consolas,monospace",
        fontSize:11,color:C.green,letterSpacing:2}}>TALLER DE HACKING ETICO</div>

      <h1 style={{fontSize:"min(52px,10vw)",fontWeight:900,margin:"0 0 6px",
        textAlign:"center",lineHeight:1.1}}>¡Simulacro Evaluación Final!</h1>
      <p style={{color:C.cyan,fontFamily:"Consolas,monospace",fontSize:15,margin:"0 0 6px",
        textAlign:"center"}}>Ayudantía N.9  ·  25 preguntas  ·  Redes WiFi + Post-Explo  ·  Marcador en vivo</p>
      <div style={{background:"#1a0a0a",border:`1px solid ${C.orange}50`,borderRadius:6,
        padding:"6px 20px",marginBottom:36}}>
        <span style={{color:C.orange,fontWeight:"bold",fontSize:14}}><AlertTriangle size={20} style={{display:"inline-block", verticalAlign:"middle", marginRight:8}} /> Evaluación Final!</span>
      </div>

      <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center",marginBottom:32}}>
        {[
          {label:"Host / Proyector",icon:<Monitor size={36} />,sub:"Controla el quiz",color:C.green,fn:onHost},
          {label:"Unirse al Quiz",  icon:<Smartphone size={36} />,sub:"Vota desde el celular",color:C.cyan,fn:onJoin},
          {label:"Modo Alumno",     icon:<User size={36} />,sub:"Responde a tu ritmo",color:C.purple,fn:onSolo},
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
function HostApp({ onBack }) {
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
    if(next>=QS.length) await updateState({...gs,phase:"finished",qIndex:next});
    else await updateState({...gs,phase:"lobby_q",qIndex:next});
  };

  const advanceCase=async()=>{
    const steps=["case_story","case_q1","case_q2","case_q3","case_q4","finished"];
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
        <button onClick={onBack} title="Volver al menú" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:4,height:24,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.white,fontSize:14,padding:"0 6px",paddingBottom:2}}>←</button>
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

      <div style={{padding:"20px 20px",maxWidth:"100%",margin:"0 auto"}}>
        {/* LOBBY */}
        {(gs.phase==="lobby"||gs.phase==="lobby_q")&&(
          <div>
            <h2 style={{color:C.cyan,fontFamily:"Consolas,monospace",fontSize:22,margin:"0 0 6px"}}>
              {gs.qIndex===0?<span><Hourglass size={20} style={{verticalAlign:"bottom"}} /> Sala de espera</span>:<span><CheckCircle size={20} style={{verticalAlign:"bottom"}} /> Lista para Q{gs.qIndex+1}</span>}
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
              {gs.qIndex===0 ? <span><Play size={18} style={{verticalAlign:"middle", marginRight:6}}/> Iniciar Pregunta 1</span> : <span><Play size={18} style={{verticalAlign:"middle", marginRight:6}}/> Iniciar Pregunta {gs.qIndex+1}</span>}
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

            <div className="opts-grid" style={{marginBottom: 10, paddingBottom: 0}}>
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
              <p style={{fontSize:18,fontWeight:700,margin:"0 0 16px",lineHeight:1.4,color:C.white}}>{q.q}</p>
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
                <Btn onClick={showLeaderboard} color={C.orange}><Trophy size={28} style={{display:"inline-block", verticalAlign:"middle", marginRight:8, color:C.orange}} /> Ver Leaderboard</Btn>
                <Btn onClick={nextQuestion} color={gs.qIndex>=QS.length-1?C.purple:C.cyan}>
                  {gs.qIndex>=QS.length-1?"Ir a Resultados →":`Siguiente Q${gs.qIndex+2}/${QS.length} →`}
                </Btn>
              </div>
            </div>
          );
        })()}

        {/* LEADERBOARD */}
        {gs.phase==="leaderboard"&&(
          <div style={{textAlign:"center"}}>
            <h2 style={{fontSize:32,fontWeight:900,color:C.orange,margin:"0 0 6px"}}><Trophy size={28} style={{display:"inline-block", verticalAlign:"middle", marginRight:8, color:C.orange}} /> Leaderboard</h2>
            <p style={{color:C.muted,fontFamily:"Consolas,monospace",fontSize:13,marginBottom:24}}>
              Después de Q{gs.qIndex}/{QS.length}
            </p>
            <Leaderboard players={players}/>
            <Btn onClick={nextQuestion} color={C.cyan} style={{marginTop:24}}>Continuar →</Btn>
          </div>
        )}

        {/* CASE */}
        {["case_story","case_q1","case_q2","case_q3","case_q4"].includes(gs.phase)&&(()=>{
          const vis={case_story:0,case_q1:1,case_q2:2,case_q3:3,case_q4:4}[gs.phase];
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
              <Btn onClick={advanceCase} color={gs.phase==="case_q4"?C.purple:C.orange}
                style={{marginTop:8}}>
                {gs.phase==="case_story"?"Mostrar Pregunta 1":
                 gs.phase==="case_q1"?"Revelar P1 + Mostrar P2":
                 gs.phase==="case_q2"?"Revelar P2 + Mostrar P3":
                 gs.phase==="case_q3"?"Revelar P3":
                 "Revelar Todo → Fin"}
              </Btn>
            </div>
          );
        })()}

        {/* FINISHED */}
        {gs.phase==="finished"&&(
          <div style={{textAlign:"center"}}>
            <h1 style={{fontSize:40,fontWeight:900,margin:"0 0 8px"}}>¡Simulacro Completado <GraduationCap size={40} style={{verticalAlign:"bottom", marginLeft:8}} /></h1>
            <p style={{color:C.muted,marginBottom:28,fontSize:15}}>Resultados finales</p>
            <Leaderboard players={players}/>
            <div style={{background:"#1a0a0a",border:`1px solid ${C.orange}`,
              borderRadius:8,padding:"12px 32px",margin:"28px auto",display:"inline-block"}}>
              <span style={{color:C.orange,fontWeight:"bold",fontSize:17}}><AlertTriangle size={20} style={{display:"inline-block", verticalAlign:"middle", marginRight:8}} /> Evaluación Final!</span>
            </div>
            <br/>
            <Btn onClick={resetGame} color={C.muted} style={{background:"transparent",
              border:`1px solid ${C.muted}`,color:C.muted,marginTop:8,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
              <RotateCcw size={16} /> Reiniciar Simulacro
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PLAYER APP ───────────────────────────────────────────────────────────────
function PlayerApp({ onBack }) {
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
        Únete al ¡Simulacro
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
          <LogIn size={18} style={{verticalAlign:"middle", marginRight:6}}/> Unirse al Quiz
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
      padding:24,fontFamily:"Calibri,sans-serif",color:C.white,maxWidth:"100%",width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:20}}>
        <button onClick={onBack} title="Volver al menú" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.white,fontSize:18,paddingBottom:4}}>←</button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
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
        <div className="opts-grid">
          {q.opts.map((opt,i)=>{
            const l=LS[i];
            return (
              <button key={l} onClick={()=>handleVote(l)} style={{
                background:C.card,border:`2px solid ${LC[l]}`,borderRadius:12,
                padding:"14px 10px",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",color:C.white,
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
          <div style={{marginBottom:14,display:"flex",justifyContent:"center"}}><CheckCircle size={64} color={C.green} /></div>
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
        <div style={{marginBottom:14,display:"flex",justifyContent:"center"}}>{isOk?<CheckCircle size={80} color={C.green} />:<XCircle size={80} color={C.red} />}</div>
        <p style={{fontSize:18,fontWeight:700,margin:"0 0 16px",lineHeight:1.4,color:C.white,maxWidth:500}}>{q.q}</p>
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
      <div style={{fontSize:46,marginBottom:10}}><Trophy size={28} style={{display:"inline-block", verticalAlign:"middle", marginRight:8, color:C.orange}} /></div>
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
  if(["case_story","case_q1","case_q2","case_q3","case_q4"].includes(gs.phase)){
    const vis={case_story:0,case_q1:1,case_q2:2,case_q3:3,case_q4:4}[gs.phase];
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
      <GraduationCap size={80} color={C.orange} style={{marginBottom:14}} />
      <h2 style={{fontSize:26,fontWeight:900,margin:"0 0 6px"}}>¡Simulacro completado!</h2>
      <p style={{color:C.muted,marginBottom:28,fontSize:15}}>Resultados finales</p>
      <Leaderboard players={players}/>
      <div style={{background:"#1a0a0a",border:`1px solid ${C.orange}`,
        borderRadius:8,padding:"12px 32px",margin:"28px auto",display:"inline-block"}}>
        <span style={{color:C.orange,fontWeight:"bold",fontSize:17}}><AlertTriangle size={20} style={{display:"inline-block", verticalAlign:"middle", marginRight:8}} /> Evaluación Final!</span>
      </div>
      <br/>
      <Btn onClick={resetGame} color={C.muted} style={{background:"transparent",
        border:`1px solid ${C.muted}`,color:C.muted,marginTop:8}}>
        <RotateCcw size={18} style={{verticalAlign:"middle", marginRight:6}}/> Reiniciar Simulacro
      </Btn>
    </div>
  );
}

// ─── SOLO APP ─────────────────────────────────────────────────────────────────
function SoloApp({ onBack }) {
  const [gs, setGs] = useState({ phase: "question", qIndex: 0 });
  const [score, setScore] = useState(0);
  const [myAns, setMyAns] = useState(null);

  const q = QS[gs.qIndex] || null;

  const handleVote = (letter) => {
    if (gs.phase !== "question") return;
    setMyAns(letter);
    if (letter === LS[q.ans]) {
      setScore(s => s + POINTS);
    }
    setGs({ ...gs, phase: "revealed" });
  };

  const nextQuestion = () => {
    const next = gs.qIndex + 1;
    setMyAns(null);
    if (next >= QS.length) { setGs({ phase: "finished", qIndex: next }); } else {
      setGs({ phase: "question", qIndex: next });
    }
  };

  const advanceCase = () => {
    const steps = ["case_story", "case_q1", "case_q2", "case_q3", "case_q4", "finished"];
    const i = steps.indexOf(gs.phase);
    setGs({ ...gs, phase: steps[Math.min(i + 1, steps.length - 1)] });
  };

  const resetGame = () => {
    setGs({ phase: "question", qIndex: 0 });
    setScore(0);
    setMyAns(null);
  };

  if(!q && ["question", "revealed"].includes(gs.phase)) return null;

  // ── VOTING ──
  if (gs.phase === "question") return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      padding:"14px 14px 20px",fontFamily:"Calibri,sans-serif",color:C.white,maxWidth:"100%",width:"100%",boxSizing:"border-box",margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} title="Volver al menú" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.white,fontSize:18,paddingBottom:4}}>←</button>
          <div>
            <span style={{fontFamily:"Consolas,monospace",color:C.muted,fontSize:11,display:"block"}}>Q{gs.qIndex+1}/{QS.length}</span>
            <span style={{fontSize:12,color:C.muted}}>{q.topic}</span>
          </div>
        </div>
        <div style={{color:C.orange,fontFamily:"Consolas,monospace",fontWeight:700,fontSize:18}}>
          {score}pts
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
        padding:"20px 24px",marginBottom:24,marginTop:20}}>
        <p style={{margin:0,fontSize:22,fontWeight:700,lineHeight:1.45,color:C.white}}>{q.q}</p>
      </div>
      <div className="opts-grid">
        {q.opts.map((opt,i)=>{
          const l=LS[i];
          return (
            <button key={l} onClick={()=>handleVote(l)} style={{
              background:C.card,border:`2px solid ${LC[l]}`,borderRadius:12,
              padding:"20px 16px",display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",gap:12,cursor:"pointer",color:C.white,
              fontFamily:"Calibri,sans-serif",textAlign:"center",minHeight:120,
              transition:"background 0.15s, transform 0.1s",
            }}
            onMouseOver={e=>e.currentTarget.style.background=`${LC[l]}18`}
            onMouseOut={e=>e.currentTarget.style.background=C.card}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
            >
              <span style={{fontFamily:"Consolas,monospace",fontSize:36,fontWeight:900,color:LC[l]}}>{l}</span>
              <span style={{fontSize:16,lineHeight:1.35,color:C.white}}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── REVEALED ──
  if (gs.phase === "revealed") {
    const cLetter = LS[q.ans];
    const isOk = myAns === cLetter;
    return (
      <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
        padding:20,fontFamily:"Calibri,sans-serif",color:C.white,maxWidth:"100%",width:"100%",boxSizing:"border-box",margin:"0 auto"}}>
        
        <div style={{display:"flex",alignItems:"center",marginBottom:20}}>
          <button onClick={onBack} title="Volver al menú" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.white,fontSize:18,paddingBottom:4}}>←</button>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{marginBottom:14,display:"flex",justifyContent:"center"}}>{isOk?<CheckCircle size={80} color={C.green} />:<XCircle size={80} color={C.red} />}</div>
          <p style={{fontSize:18,fontWeight:700,margin:"0 0 16px",lineHeight:1.4,color:C.white,maxWidth:500,textAlign:"center"}}>{q.q}</p>
        <div style={{background:isOk?"#0d2010":"#2a0a0a",
          border:`2px solid ${isOk?C.green:C.red}`,
          borderRadius:12,padding:"20px 24px",marginBottom:20,maxWidth:500,width:"100%"}}>
          <p style={{margin:"0 0 10px",fontSize:24,fontWeight:900,color:isOk?C.green:C.red}}>
            {isOk ? `¡Correcto! +${POINTS} pts` : `Incorrecto — era ${cLetter}`}
          </p>
          <p style={{margin:0,fontSize:18,color:C.white}}>
            <strong>{q.opts[q.ans]}</strong>
          </p>
        </div>
        <div style={{background:C.card,borderLeft:`3px solid ${C.green}`,borderRadius:8,padding:"16px 20px",
          marginBottom:24,maxWidth:500,width:"100%"}}>
          <span style={{color:C.green,fontFamily:"Consolas,monospace",fontSize:11,marginBottom:8,display:"block"}}>// explicación</span>
          <p style={{margin:0,fontSize:15,color:C.white,lineHeight:1.6,textAlign:"left"}}>{q.exp}</p>
        </div>
        <div style={{fontFamily:"Consolas,monospace",fontSize:24,color:C.orange,fontWeight:900,marginBottom:24,textAlign:"center"}}>
          {score} pts
        </div>
        <div style={{textAlign:"center"}}>
          <Btn onClick={nextQuestion} color={C.cyan} style={{fontSize:18,padding:"12px 32px"}}>
            {gs.qIndex >= QS.length - 1 ? "Ir a Resultados →" : "Siguiente Pregunta →"}
          </Btn>
        </div>
        </div>
      </div>
    );
  }

  // ── CASE ──
  if(["case_story","case_q1","case_q2","case_q3","case_q4"].includes(gs.phase)){
    const vis={case_story:0,case_q1:1,case_q2:2,case_q3:3,case_q4:4}[gs.phase];
    return (
      <div style={{background:C.bg,minHeight:"100vh",padding:"20px 20px",
        fontFamily:"Calibri,sans-serif",color:C.white,maxWidth:"100%",margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:20}}>
          <button onClick={onBack} title="Volver al menú" style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.white,fontSize:18,paddingBottom:4}}>←</button>
        </div>
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
        <Btn onClick={advanceCase} color={gs.phase==="case_q4"?C.purple:C.orange}
          style={{marginTop:16}}>
          {gs.phase==="case_story"?"Mostrar Pregunta 1":
           gs.phase==="case_q1"?"Revelar P1 + Mostrar P2":
           gs.phase==="case_q2"?"Revelar P2 + Mostrar P3":
           gs.phase==="case_q3"?"Revelar P3":
           "Fin del ¡Simulacro →"}
        </Btn>
      </div>
    );
  }

  // ── FINISHED ──
  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:24,
      fontFamily:"Calibri,sans-serif",color:C.white,textAlign:"center"}}>
      <GraduationCap size={80} color={C.orange} style={{marginBottom:14}} />
      <h2 style={{fontSize:32,fontWeight:900,margin:"0 0 8px"}}>¡Simulacro completado!</h2>
      <p style={{color:C.muted,marginBottom:24,fontSize:16}}>Tu resultado final (Modo Alumno)</p>
      <div style={{background:C.card,border:`2px solid ${C.orange}`,borderRadius:12,
        padding:"24px 44px",marginBottom:24}}>
        <p style={{margin:0,fontSize:48,fontWeight:900,color:C.orange,
          fontFamily:"Consolas,monospace"}}>{score} pts</p>
        <p style={{margin:"6px 0 0",color:C.muted,fontSize:14}}>de {QS.length*POINTS} posibles</p>
      </div>
      <div style={{background:"#1a0a0a",border:`1px solid ${C.orange}50`,
        borderRadius:8,padding:"10px 24px",marginBottom:24}}>
        <span style={{color:C.orange,fontWeight:"bold",fontSize:16}}><AlertTriangle size={20} style={{display:"inline-block", verticalAlign:"middle", marginRight:8}} /> Evaluación Final!</span>
      </div>
      <Btn onClick={resetGame} color={C.muted} style={{background:"transparent",
        border:`1px solid ${C.muted}`,color:C.muted}}>
        <RotateCcw size={18} style={{verticalAlign:"middle", marginRight:6}}/> Volver a Intentar
      </Btn>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState(null);
  
  const handleBack = () => setMode(null);

  if (!mode) return <HomeScreen onHost={()=>setMode("host")} onJoin={()=>setMode("player")} onSolo={()=>setMode("solo")}/>;
  if (mode==="host") return <HostApp onBack={handleBack}/>;
  if (mode==="solo") return <SoloApp onBack={handleBack}/>;
  return <PlayerApp onBack={handleBack}/>;
}

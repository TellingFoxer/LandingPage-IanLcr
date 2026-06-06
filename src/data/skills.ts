export interface Skill {
  name: string;
  category: "language" | "tool" | "area";
  description: string;
}

export const skills: Skill[] = [
  // --- Languages ---
  {
    name: "C",
    category: "language",
    description: "Programacion a nivel de hardware, drivers y sistemas embebidos bare-metal.",
  },
  {
    name: "C++",
    category: "language",
    description: "POO aplicada a firmware, control en tiempo real y simulacion numerica.",
  },
  {
    name: "Python",
    category: "language",
    description: "Automatizacion, procesamiento de senales, scripting y prototipado rapido.",
  },
  {
    name: "Embedded C",
    category: "language",
    description: "Firmware sobre microcontroladores: registros, interrupciones y perifericos.",
  },
  {
    name: "Bash",
    category: "language",
    description: "Tooling de linea de comandos, CI/CD y automatizacion del entorno Linux.",
  },
  {
    name: "TypeScript",
    category: "language",
    description: "Frontend, tooling web y aplicaciones full-stack con tipado estricto.",
  },

  // --- Tools ---
  {
    name: "KiCad",
    category: "tool",
    description: "Diseno de PCBs open-source, esquematicos, footprints y reglas de diseno.",
  },
  {
    name: "Altium",
    category: "tool",
    description: "Diseno de PCBs profesional: enrutado diferencial, planos de referencia y DFM.",
  },
  {
    name: "ESP-IDF",
    category: "tool",
    description: "Framework oficial para ESP32: WiFi, BLE, perifericos y RTOS.",
  },
  {
    name: "Linux",
    category: "tool",
    description: "Entorno de desarrollo principal: kernel config, systemd y tooling embebido.",
  },
  {
    name: "Git",
    category: "tool",
    description: "Control de versiones, CI/CD pipelines y flujo GitHub.",
  },
  {
    name: "LaTeX",
    category: "tool",
    description: "Documentacion tecnica, reportes academicos y diagramas TikZ.",
  },
  {
    name: "Fusion 360",
    category: "tool",
    description: "Diseno mecanico 3D para gabinetes, brackets y montajes de PCB.",
  },
  {
    name: "VSCode",
    category: "tool",
    description: "Editor principal con toolchain embebida y extensiones de hardware.",
  },
  {
    name: "PlatformIO",
    category: "tool",
    description: "Entorno de desarrollo embebido integrado en VSCode.",
  },

  // --- Areas ---
  {
    name: "IoT",
    category: "area",
    description: "Sistemas conectados: sensores, MQTT, edge computing y dashboards.",
  },
  {
    name: "Embedded Systems",
    category: "area",
    description: "Diseno de sistemas embebidos completos: hardware, firmware e integracion.",
  },
  {
    name: "PCB Design",
    category: "area",
    description: "Layout, integridad de senal, planos de tierra y manufacturabilidad.",
  },
  {
    name: "Signal Processing",
    category: "area",
    description: "Filtros digitales, FFT, convolucion y analisis espectral.",
  },
  {
    name: "Automation",
    category: "area",
    description: "Control industrial, PLC, sensores y actuadores en lazo cerrado.",
  },
  {
    name: "Circuit Analysis",
    category: "area",
    description: "Analisis AC/DC, respuesta en frecuencia, estabilidad y ruido.",
  },
];

export const categoryMeta: Record<
  Skill["category"],
  { label: string; color: string }
> = {
  language: { label: "Lenguajes", color: "#C9A84C" },
  tool: { label: "Herramientas", color: "#00D4FF" },
  area: { label: "Areas", color: "#00FF41" },
};

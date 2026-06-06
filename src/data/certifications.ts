// Certifications data — datos placeholder, reemplazar con los reales
export interface Certification {
  title: string;
  issuer: string;
  date: string;
  description: string;
  logo?: string; // opcional: para icono del emisor (letra o SVG name)
  link?: string;
}

export const certifications: Certification[] = [
  {
    title: "Embedded Systems Essentials with Arm",
    issuer: "Arm Education",
    date: "2025",
    description:
      "Programacion bare-metal en ARM Cortex-M, perifericos, interrupciones y modos de bajo consumo.",
    logo: "A",
  },
  {
    title: "IoT Fundamentals",
    issuer: "Cisco Networking Academy",
    date: "2025",
    description:
      "Conectividad IoT, protocolos MQTT/CoAP, sensores, actuadores y edge computing.",
    logo: "C",
  },
  {
    title: "PCB Design for Manufacturing",
    issuer: "Altium Academy",
    date: "2024",
    description:
      "Diseno de PCBs multicapa, integridad de senal, planos de referencia y reglas de manufactura.",
    logo: "A",
  },
  {
    title: "Linux System Administration",
    issuer: "Linux Foundation",
    date: "2024",
    description:
      "Administracion de sistemas Linux, scripting bash, servicios systemd y contenedores.",
    logo: "L",
  },
  {
    title: "C Programming for Embedded",
    issuer: "Espressif Systems",
    date: "2024",
    description:
      "Programacion en C para microcontroladores ESP32, FreeRTOS, drivers y perifericos.",
    logo: "E",
  },
  {
    title: "Signal Processing Fundamentals",
    issuer: "MIT OpenCourseWare",
    date: "2025",
    description:
      "Filtros digitales, FFT, convolucion, modulacion y analisis espectral en tiempo real.",
    logo: "M",
  },
];

// Certifications data — datos placeholder, reemplazar con los reales
export interface Certification {
  title: string;
  issuer: string;
  url?: string; // link al certificado o emisor
  date: string;
  description: string;
  logo?: string; // letra del emisor (fallback visual)
}

export const certifications: Certification[] = [
  {
    title: "Embedded Systems Essentials with Arm",
    issuer: "Arm Education",
    url: "https://www.arm.com/resources/education",
    date: "2025",
    description:
      "Programacion bare-metal en ARM Cortex-M, perifericos, interrupciones y modos de bajo consumo.",
    logo: "A",
  },
  {
    title: "IoT Fundamentals",
    issuer: "Cisco Networking Academy",
    url: "https://www.netacad.com/courses/iot/iot-fundamentals",
    date: "2025",
    description:
      "Conectividad IoT, protocolos MQTT/CoAP, sensores, actuadores y edge computing.",
    logo: "C",
  },
  {
    title: "PCB Design for Manufacturing",
    issuer: "Altium Academy",
    url: "https://www.altium.com/education",
    date: "2024",
    description:
      "Diseno de PCBs multicapa, integridad de senal, planos de referencia y reglas de manufactura.",
    logo: "A",
  },
  {
    title: "Linux System Administration",
    issuer: "Linux Foundation",
    url: "https://training.linuxfoundation.org/",
    date: "2024",
    description:
      "Administracion de sistemas Linux, scripting bash, servicios systemd y contenedores.",
    logo: "L",
  },
  {
    title: "C Programming for Embedded",
    issuer: "Espressif Systems",
    url: "https://www.espressif.com/en/services/training",
    date: "2024",
    description:
      "Programacion en C para microcontroladores ESP32, FreeRTOS, drivers y perifericos.",
    logo: "E",
  },
  {
    title: "Signal Processing Fundamentals",
    issuer: "MIT OpenCourseWare",
    url: "https://ocw.mit.edu/",
    date: "2025",
    description:
      "Filtros digitales, FFT, convolucion, modulacion y analisis espectral en tiempo real.",
    logo: "M",
  },
];

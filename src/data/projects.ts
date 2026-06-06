export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  status: "active" | "coming" | "wip";
  category: "personal" | "academic";
}

export const projects: Project[] = [
  {
    title: "Red de Sensores IoT ESP32",
    description:
      "Malla de 8 nodos ESP32-S3 con sensores de temperatura, humedad y CO2. Comunicacion ESP-NOW a gateway central con uplink MQTT hacia dashboard Grafana. Firmware en C con FreeRTOS, OTA updates y deep-sleep por nodo para autonomia de 6 meses con bateria Li-Ion 18650.",
    tags: ["ESP32-S3", "ESP-NOW", "MQTT", "FreeRTOS", "Grafana"],
    link: "https://github.com/ianlrx/iot-sensor-mesh",
    status: "active",
    category: "personal",
  },
  {
    title: "Controlador BLDC FOC",
    description:
      "Driver para motor brushless trifasico con Field-Oriented Control sobre STM32G4. Medicion de corriente trifasica con shunts en linea, encoder incremental AS5047P, lazo PID de velocidad y torque. PCB de 4 capas disenada en KiCad con etapa de potencia basada en DRV8323.",
    tags: ["STM32G4", "FOC", "KiCad", "DRV8323", "PID"],
    status: "wip",
    category: "personal",
  },
  {
    title: "Estacion Meteorologica Low Power",
    description:
      "Sistema autonomo alimentado por panel solar con ESP32-C3, sensores BME280, anemometro RS485 y pluviometro de cubetas. Firmware optimizado para consumo < 50uA en deep-sleep. Datos transmitidos via LoRaWAN cada 15 minutos a The Things Network con dashboard en Node-RED.",
    tags: ["ESP32-C3", "LoRaWAN", "BME280", "TTN", "Node-RED"],
    link: "https://github.com/ianlrx/weather-station-lp",
    status: "active",
    category: "academic",
  },
  {
    title: "Analizador de Espectro FFT",
    description:
      "Analizador de audio en tiempo real con STM32H7, usando ADC a 192 kHz y FFT de 2048 puntos en CMSIS-DSP. Visualizacion en display TFT con barras por banda de frecuencia y waterfall. Implementado en C puro con DMA circular y doble buffering.",
    tags: ["STM32H7", "CMSIS-DSP", "FFT", "ADC", "TFT"],
    status: "wip",
    category: "personal",
  },
  {
    title: "Brazo Robotico SCARA",
    description:
      "Diseno cinematico y control de un brazo SCARA de 4 grados de libertad impreso en 3D. Motores paso a paso NEMA 17 con drivers TMC2209, cinematica inversa en Python sobre Raspberry Pi Zero 2W. Interfaz web con Three.js para control y simulacion de trayectorias.",
    tags: ["SCARA", "Raspberry Pi", "Python", "Three.js", "NEMA 17"],
    status: "coming",
    category: "academic",
  },
  {
    title: "Osciloscopio USB 2 Canales",
    description:
      "Osciloscopio digital portatil con ADC AD9288 a 100 MSPS dual channel, FPGA Lattice iCE40 para buffering y trigger, y front-end analogico con atenuador programable. Interfaz USB 2.0 hacia aplicacion Electron con visualizacion WebGL y protocolo de decodificacion personalizado.",
    tags: ["FPGA", "ADC", "AD9288", "iCE40", "Electron"],
    status: "coming",
    category: "personal",
  },
];

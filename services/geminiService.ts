import { CrosswordData, Topic, CrosswordWord } from "../types";

// Helper to define puzzle data without numbers (numbers are calculated dynamically)
interface RawWord {
  answer: string;
  clue: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
}

const PUZZLES: Record<Topic, RawWord[]> = {
  'TERMODINÁMICA': [
    { answer: "ENTROPIA", clue: "Medida del desorden de un sistema", startRow: 1, startCol: 5, direction: "down" },
    { answer: "LEY", clue: "Regla fundamental establecida (ej. Cero, Primera...)", startRow: 1, startCol: 4, direction: "across" },
    { answer: "CARNOT", clue: "Ciclo termodinámico ideal reversible", startRow: 2, startCol: 2, direction: "across" },
    { answer: "SISTEMA", clue: "Parte del universo que es objeto de estudio", startRow: 3, startCol: 2, direction: "across" },
    { answer: "CALOR", clue: "Energía en tránsito debido a diferencia de temperatura", startRow: 4, startCol: 1, direction: "across" },
    { answer: "JOULE", clue: "Unidad de medida de energía en el SI", startRow: 5, startCol: 4, direction: "across" }
  ],
  'TEMPERATURA': [
    { answer: "DILATACION", clue: "Aumento de volumen por calor", startRow: 0, startCol: 4, direction: "down" },
    { answer: "MEDIR", clue: "Determinar la magnitud de algo", startRow: 0, startCol: 2, direction: "across" },
    { answer: "FRIO", clue: "Ausencia de calor", startRow: 1, startCol: 2, direction: "across" },
    { answer: "KELVIN", clue: "Escala absoluta de temperatura", startRow: 2, startCol: 2, direction: "across" },
    { answer: "ESCALA", clue: "Graduación utilizada en un instrumento", startRow: 3, startCol: 1, direction: "across" },
    { answer: "AGITACION", clue: "Movimiento molecular relacionado con la temperatura", startRow: 4, startCol: 1, direction: "across" }
  ],
  'ONDAS': [
    { answer: "FRECUENCIA", clue: "Número de ciclos por segundo", startRow: 0, startCol: 5, direction: "down" },
    { answer: "FASE", clue: "Estado de vibración en un ciclo", startRow: 0, startCol: 5, direction: "across" },
    { answer: "HERTZ", clue: "Unidad de frecuencia", startRow: 1, startCol: 3, direction: "across" },
    { answer: "VALLE", clue: "Punto más bajo de una onda", startRow: 2, startCol: 1, direction: "across" },
    { answer: "PICO", clue: "Punto más alto de una onda (cresta)", startRow: 3, startCol: 3, direction: "across" },
    { answer: "LUZ", clue: "Onda electromagnética visible", startRow: 4, startCol: 4, direction: "across" },
    { answer: "TIMBRE", clue: "Cualidad que distingue sonidos de igual tono", startRow: 5, startCol: 0, direction: "across" }
  ],
  'MAS': [
    { answer: "OSCILACION", clue: "Movimiento repetitivo en torno a una posición", startRow: 0, startCol: 4, direction: "down" },
    { answer: "PERIODO", clue: "Tiempo en completar un ciclo", startRow: 0, startCol: 0, direction: "across" },
    { answer: "FASE", clue: "Ángulo que representa el estado del movimiento", startRow: 1, startCol: 2, direction: "across" },
    { answer: "CICLO", clue: "Una vuelta o vibración completa", startRow: 2, startCol: 2, direction: "across" },
    { answer: "SIMPLE", clue: "Tipo de movimiento armónico básico", startRow: 3, startCol: 3, direction: "across" },
    { answer: "AMPLITUD", clue: "Máxima distancia de la partícula al equilibrio", startRow: 4, startCol: 1, direction: "across" }
  ],
  'FLUIDOS': [
    { answer: "DENSIDAD", clue: "Relación entre masa y volumen", startRow: 1, startCol: 4, direction: "down" },
    { answer: "CAUDAL", clue: "Volumen de fluido que pasa por sección en un tiempo", startRow: 1, startCol: 1, direction: "across" },
    { answer: "PRENSA", clue: "Máquina hidráulica basada en Pascal", startRow: 2, startCol: 2, direction: "across" },
    { answer: "TENSION", clue: "Fuerza superficial en líquidos", startRow: 3, startCol: 2, direction: "across" },
    { answer: "VISCOSIDAD", clue: "Resistencia de un fluido a fluir", startRow: 4, startCol: 2, direction: "across" },
    { answer: "LIQUIDO", clue: "Estado de la materia que fluye", startRow: 5, startCol: 3, direction: "across" }
  ],
  'ELASTICIDAD': [
    { answer: "RESORTE", clue: "Objeto elástico que almacena energía", startRow: 1, startCol: 3, direction: "down" },
    { answer: "RIGIDEZ", clue: "Capacidad de resistir deformación", startRow: 1, startCol: 3, direction: "across" },
    { answer: "TENSO", clue: "Estado de un cuerpo estirado", startRow: 2, startCol: 2, direction: "across" },
    { answer: "ESFUERZO", clue: "Fuerza aplicada por unidad de área", startRow: 3, startCol: 2, direction: "across" },
    { answer: "YOUNG", clue: "Módulo de elasticidad longitudinal", startRow: 4, startCol: 2, direction: "across" },
    { answer: "TORSION", clue: "Deformación por giro", startRow: 5, startCol: 1, direction: "across" },
    { answer: "RUPTURA", clue: "Punto donde el material se rompe o falla", startRow: 6, startCol: 0, direction: "across" }
  ]
};

// Helper to calculate correct numbering based on grid positions
const processPuzzle = (topic: Topic, rawWords: RawWord[]): CrosswordData => {
  // Sort words by position to assign numbers correctly (Row then Col)
  // Logic: Identify all unique start positions.
  const starts = new Set<string>();
  rawWords.forEach(w => starts.add(`${w.startRow},${w.startCol}`));
  
  // Convert to array and sort
  const sortedStarts = Array.from(starts).map(s => {
    const [r, c] = s.split(',').map(Number);
    return { r, c };
  }).sort((a, b) => {
    if (a.r !== b.r) return a.r - b.r;
    return a.c - b.c;
  });

  // Map coordinate to number
  const coordToNumber: Record<string, number> = {};
  sortedStarts.forEach((pos, index) => {
    coordToNumber[`${pos.r},${pos.c}`] = index + 1;
  });

  // Create final words with numbers
  const finalWords: CrosswordWord[] = rawWords.map(w => ({
    ...w,
    number: coordToNumber[`${w.startRow},${w.startCol}`]
  }));

  return {
    title: topic,
    words: finalWords
  };
};

export const generateCrossword = async (topic: Topic): Promise<CrosswordData> => {
  // Simulate a short delay for UX consistency
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const rawWords = PUZZLES[topic];
  if (!rawWords) {
    throw new Error(`No puzzle found for topic ${topic}`);
  }

  return processPuzzle(topic, rawWords);
};

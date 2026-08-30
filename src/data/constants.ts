import { MateriaInfo, StoreItem, Task, ScoringConfig, ChildProfile } from '../types';

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  simpleTaskPoints: 10,
  guideCompletePoints: 30,
  weekCompleteBonus: 50,
  week1AllSubjectsBonus: 150,
  week2AllSubjectsBonus: 150,
  week3AllSubjectsBonus: 150,
  week4AllSubjectsBonus: 150,
  bimesterSubjectBonus: 300,
};

export const KINDER_MATERIA: MateriaInfo = {
  id: 'kinder_actividades',
  name: 'Aventuras de Kinder',
  shortName: 'Kinder',
  iconName: 'Sparkles',
  color: '#f59e0b',
  darkColor: '#d97706',
  lightColor: '#fde68a',
  bgGradient: 'from-amber-400 to-orange-600',
  description: 'Descubrimiento, juegos, motricidad, historias y canciones divertidas.',
  pathY: 300,
  angleDeg: 90,
  portalX: 400,
  portalY: 300,
};

export const MATERIAS: MateriaInfo[] = [
  {
    id: 'ciencias',
    name: 'Ciencias de la Vida',
    shortName: 'Ciencias',
    iconName: 'Leaf',
    color: '#22c55e',
    darkColor: '#15803d',
    lightColor: '#bbf7d0',
    bgGradient: 'from-emerald-500 to-green-700',
    description: 'Exploración de la naturaleza, seres vivos, cuerpo humano y el medio ambiente.',
    pathY: 120,
    angleDeg: -40,
    portalX: 620,
    portalY: 130,
  },
  {
    id: 'ingles',
    name: 'Inglés',
    shortName: 'Inglés',
    iconName: 'Globe',
    color: '#3b82f6',
    darkColor: '#1d4ed8',
    lightColor: '#bfdbfe',
    bgGradient: 'from-blue-500 to-indigo-700',
    description: 'Vocabulario, lectura, pronunciación y comprensión del idioma inglés.',
    pathY: 180,
    angleDeg: 5,
    portalX: 710,
    portalY: 295,
  },
  {
    id: 'historia',
    name: 'Historia',
    shortName: 'Historia',
    iconName: 'Scroll',
    color: '#eab308',
    darkColor: '#a16207',
    lightColor: '#fef08a',
    bgGradient: 'from-amber-500 to-yellow-700',
    description: 'Viaje en el tiempo por civilizaciones, personajes y valores históricos.',
    pathY: 240,
    angleDeg: 55,
    portalX: 630,
    portalY: 465,
  },
  {
    id: 'lenguaje',
    name: 'Lenguaje y Literatura',
    shortName: 'Lenguaje',
    iconName: 'BookOpen',
    color: '#ec4899',
    darkColor: '#be185d',
    lightColor: '#fbcfe8',
    bgGradient: 'from-pink-500 to-rose-700',
    description: 'Gramática, redacción creativa, ortografía y aventuras de lectura.',
    pathY: 300,
    angleDeg: 100,
    portalX: 435,
    portalY: 510,
  },
  {
    id: 'luces',
    name: 'Luces y Colores (Arte)',
    shortName: 'Arte',
    iconName: 'Palette',
    color: '#a855f7',
    darkColor: '#7e22ce',
    lightColor: '#e9d5ff',
    bgGradient: 'from-purple-500 to-fuchsia-700',
    description: 'Dibujo, creatividad plástica, armonía visual y proyectos artísticos.',
    pathY: 360,
    angleDeg: 150,
    portalX: 200,
    portalY: 480,
  },
  {
    id: 'matematicas',
    name: 'Matemáticas',
    shortName: 'Matemáticas',
    iconName: 'Calculator',
    color: '#06b6d4',
    darkColor: '#0e7490',
    lightColor: '#a5f3fc',
    bgGradient: 'from-cyan-500 to-teal-700',
    description: 'Cálculo ágil, geometría, desafíos lógicos y resolución de problemas.',
    pathY: 420,
    angleDeg: 195,
    portalX: 90,
    portalY: 310,
  },
  {
    id: 'sonidos',
    name: 'Sonidos (Música)',
    shortName: 'Música',
    iconName: 'Music',
    color: '#f97316',
    darkColor: '#c2410c',
    lightColor: '#fed7aa',
    bgGradient: 'from-orange-500 to-amber-700',
    description: 'Ritmo, teoría musical, apreciación sonora e instrumentos.',
    pathY: 480,
    angleDeg: 240,
    portalX: 180,
    portalY: 130,
  },
];

export function getMateriasForProfile(profile?: ChildProfile | null): MateriaInfo[] {
  if (profile && profile.gradeLevel === 'kinder') {
    return [KINDER_MATERIA];
  }
  return MATERIAS;
}

export const BIMESTRES_INFO = [
  { id: 1, name: 'Ciudad Primera', label: 'Bimestre 1', months: 'Feb - Abr', icon: '🏛️', minKm: 0 },
  { id: 2, name: 'Ciudad Segunda', label: 'Bimestre 2', months: 'May - Jun', icon: '🏰', minKm: 90 },
  { id: 3, name: 'Ciudad Tercera', label: 'Bimestre 3', months: 'Jul - Sep', icon: '🏯', minKm: 180 },
  { id: 4, name: 'Ciudad Cuarta', label: 'Bimestre 4', months: 'Oct - Nov', icon: '👑', minKm: 270 },
];

export const INITIAL_HABITS: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    materiaId: 'general',
    bimestre: 1,
    semana: 1,
    title: 'Hacer la cama al levantarse',
    description: 'Dejar la habitación ordenada para iniciar el día con excelencia.',
    type: 'vida',
    points: 5,
    status: 'pending',
    isDailyHabit: true,
  },
  {
    materiaId: 'general',
    bimestre: 1,
    semana: 1,
    title: 'Lectura devocional / reflexión matutina',
    description: 'Leer un pasaje inspirador y compartir una lección con la familia.',
    type: 'vida',
    points: 10,
    status: 'pending',
    isDailyHabit: true,
  },
  {
    materiaId: 'general',
    bimestre: 1,
    semana: 1,
    title: 'Mochila y escritorio ordenado',
    description: 'Organizar cuadernos, lápices y dejar el espacio listo para el día.',
    type: 'vida',
    points: 5,
    status: 'pending',
    isDailyHabit: true,
  },
  {
    materiaId: 'general',
    bimestre: 1,
    semana: 1,
    title: 'Higiene y lavado de dientes a tiempo',
    description: 'Cumplir los hábitos de aseo personal sin necesidad de recordatorios.',
    type: 'vida',
    points: 5,
    status: 'pending',
    isDailyHabit: true,
  },
  {
    materiaId: 'general',
    bimestre: 1,
    semana: 1,
    title: 'Ayudar en la mesa familiar',
    description: 'Poner o levantar los platos colaborando con alegría en el hogar.',
    type: 'vida',
    points: 10,
    status: 'pending',
    isDailyHabit: true,
  },
];

// Generador de tareas de muestra enriquecidas para las 7 materias x 4 bimestres x 8 semanas
export function generateSeedTasks(userId: string = 'user_1'): Task[] {
  // Libreta vac�a por defecto: el padre crea las tareas manualmente
  return [];
  // C�digo anterior deshabilitado - no generar tareas inventadas
  const tasks: Task[] = [];
  let taskIdCounter = 1;

  // Insert general habits
  INITIAL_HABITS.forEach((h) => {
    for (let b = 1; b <= 4; b++) {
      for (let s = 1; s <= 8; s++) {
        tasks.push({
          ...h,
          id: `task-habit-${b}-${s}-${taskIdCounter++}-${userId}`,
          userId,
          bimestre: b,
          semana: s,
          createdAt: new Date().toISOString(),
          status: 'pending',
        });
      }
    }
  });

  const subjectCurriculum: Record<string, string[]> = {
    ciencias: [
      'Clasificación de animales vertebrados e invertebrados',
      'El ciclo del agua y los estados de la materia',
      'Partes de la planta y fotosíntesis básica',
      'El cuerpo humano: huesos y músculos principales',
      'Alimentación saludable y la pirámide nutricional',
      'Los 5 sentidos y el cuidado de la salud',
      'Ecosistemas de nuestra región y biodiversidad',
      'Experimento de germinación y registro en libreta',
    ],
    ingles: [
      'Vocabulary: Family members and greetings',
      'Colors and Numbers from 1 to 100',
      'Days of the week & School objects',
      'Animals and their habitats reading sheet',
      'Action verbs: Run, jump, read, write, sing',
      'Simple sentences: "I like..." and "I have..."',
      'Daily routines listening & drawing activity',
      'Short story reading: The brave little bear',
    ],
    historia: [
      'Línea de tiempo de nuestra comunidad y próceres',
      'Primeros pobladores y pueblos originarios',
      'Vida cotidiana en la época colonial',
      'La bandera y símbolos patrios con significado',
      'Grandes inventos que cambiaron la humanidad',
      'Historia de la escritura y el papiro a la imprenta',
      'Costumbres familiares a través de las generaciones',
      'Investigación guiada: Entrevista al abuelo/a',
    ],
    lenguaje: [
      'Lectura guiada de cuento y comprensión lectora',
      'Sustantivos comunes y propios con ejemplos',
      'Adjetivos calificativos en oraciones divertidas',
      'Uso correcto del punto, coma y mayúsculas',
      'Redacción de una carta de agradecimiento',
      'Sinónimos y antónimos en crucigrama pedagógico',
      'Poesía infantil y rimas consonantes',
      'Mini-libro ilustrado: Escribir mi propio cuento',
    ],
    luces: [
      'Círculo cromático: Colores primarios y secundarios',
      'Técnica de puntillismo en paisaje natural',
      'Dibujo con perspectiva básica y sombras suaves',
      'Collage con texturas de hojas secas y cartón',
      'Retrato familiar con acuarelas o lápices',
      'Escultura con masa casera / plastilina de colores',
      'Patrones geométricos y mosaicos coloridos',
      'Mural creativo sobre el valor de la amistad',
    ],
    matematicas: [
      'Sumas y restas rápidas con reagrupación',
      'Desafío de cálculo mental y resolución de problemas',
      'Tablas de multiplicar: Estrategias y juegos',
      'Fracciones simples con pizzas y figuras',
      'Figuras geométricas 2D y 3D en el entorno',
      'Medidas de longitud: Uso de la regla y metro',
      'Gráficos de barras con encuestas familiares',
      'Desafío final de lógica y acertijos numéricos',
    ],
    sonidos: [
      'Cualidades del sonido: Altura, duración e intensidad',
      'Familia de instrumentos de percusión y viento',
      'Construcción de un instrumento reciclado (maraca/tambor)',
      'Reconocimiento auditivo de notas graves y agudas',
      'Lectura de figuras rítmicas: Negra, corchea y silencio',
      'Canto y afinación de una canción tradicional',
      'Sonidos de la naturaleza y paisajes sonoros',
      'Concierto familiar presentando el instrumento creado',
    ],
  };

  MATERIAS.forEach((materia) => {
    const list = subjectCurriculum[materia.id] || [];
    for (let b = 1; b <= 4; b++) {
      for (let s = 1; s <= 8; s++) {
        // Skip semana 1 for matemáticas (removes "Sumas y restas rápidas" and "Repaso interactivo: Matemáticas S1")
        if (materia.id === 'matematicas' && s === 1) continue;

        const topicIndex = (s - 1) % list.length;
        const topic = list[topicIndex];
        
        // Task 1: Main academic exercise
        tasks.push({
          id: `task-${materia.id}-b${b}-s${s}-1-${userId}`,
          userId,
          materiaId: materia.id,
          bimestre: b,
          semana: s,
          title: `${topic}`,
          description: `Completar la guía escolar y ejercicios de la semana ${s} en ${materia.name}.`,
          type: 'sabiduria',
          points: 15,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });

        // Task 2: Practical review / quiz
        tasks.push({
          id: `task-${materia.id}-b${b}-s${s}-2-${userId}`,
          userId,
          materiaId: materia.id,
          bimestre: b,
          semana: s,
          title: `Repaso interactivo: ${materia.shortName} S${s}`,
          description: `Explicar en voz alta lo aprendido a papá o mamá y resolver el desafío.`,
          type: 'sabiduria',
          points: 10,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  return tasks;
}

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  // Premios Vida Real (Configurables por padres)
  {
    id: 'reward-icecream',
    title: 'Salida por un Helado Artesanal',
    type: 'real_life',
    costType: 'vida',
    cost: 50,
    icon: '🍦',
    description: '¡Canjeá este cupón para ir juntos a disfrutar de tu helado favorito!',
    purchased: false,
  },
  {
    id: 'reward-videogame',
    title: '1 Hora Extra de Videojuegos',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 60,
    icon: '🎮',
    description: 'Tiempo libre extra para jugar en la consola o tablet el fin de semana.',
    purchased: false,
  },
  {
    id: 'reward-movie',
    title: 'Elegir la Película Familiar + Pochoclos',
    type: 'real_life',
    costType: 'vida',
    cost: 40,
    icon: '🍿',
    description: 'Vos elegís qué película vemos todos juntos en la noche de cine.',
    purchased: false,
  },
  {
    id: 'reward-park',
    title: 'Paseo en Bici o Tarde de Parque',
    type: 'real_life',
    costType: 'vida',
    cost: 45,
    icon: '🚲',
    description: 'Una tarde especial al aire libre con juegos y merienda rica.',
    purchased: false,
  },
  {
    id: 'reward-dinner',
    title: 'Elegir el Menú de la Cena',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 35,
    icon: '🍕',
    description: 'Tu comida favorita preparada con amor para toda la casa.',
    purchased: false,
  },
  // Accesorios de Avatar
  {
    id: 'avatar-backpack',
    title: 'Mochila de Explorador',
    type: 'avatar',
    costType: 'coins',
    cost: 50,
    icon: '🎒',
    description: 'Equipa una linda mochila escolar dorada en tu avatar.',
    purchased: false,
    itemKey: 'backpack',
  },
  {
    id: 'avatar-glasses',
    title: 'Gafas de Sabio',
    type: 'avatar',
    costType: 'coins',
    cost: 40,
    icon: '👓',
    description: 'Lentes inteligentes que destacan tu amor por el estudio.',
    purchased: false,
    itemKey: 'glasses',
  },
  {
    id: 'avatar-medal',
    title: 'Medalla de Campeón',
    type: 'avatar',
    costType: 'coins',
    cost: 80,
    icon: '🥇',
    description: 'Insignia brillante de honor al esfuerzo y constancia.',
    purchased: false,
    itemKey: 'medal',
  },
  {
    id: 'avatar-cape',
    title: 'Capa de Héroe del Conocimiento',
    type: 'avatar',
    costType: 'coins',
    cost: 120,
    icon: '🦸',
    description: 'Capa ondeante roja que te acompaña en tus aventuras.',
    purchased: false,
    itemKey: 'cape',
  },
];

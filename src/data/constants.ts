import { HabitDefinition, MateriaInfo, MedalDefinition, ScoringConfig, StoreItem, Task, ChildProfile } from '../types';

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
  // Por defecto VIDA REAL = SABIDURÍA (configurable a vida/coins por premio en Modo Padre)
  {
    id: 'reward-icecream',
    title: 'Salida por un Helado Artesanal',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 320,
    icon: '🍦',
    description: '¡Premio semanal! Canjeá este cupón para ir juntos por tu helado favorito.',
    purchased: false,
    redeemLimit: 1,
    redeemPeriod: 'per_month',
  },
  {
    id: 'reward-videogame',
    title: '1 Hora Extra de Videojuegos',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 300,
    icon: '🎮',
    description: 'Premio semanal: 1 hora extra el finde. Máximo 3h TV/semana por niño.',
    purchased: false,
    redeemLimit: 1,
    redeemPeriod: 'per_week',
  },
  {
    id: 'reward-movie',
    title: 'Elegir la Película Familiar + Pochoclos',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 180,
    icon: '🍿',
    description: 'Vos elegís la peli familiar.',
    purchased: false,
    redeemLimit: 1,
    redeemPeriod: 'per_week',
  },
  {
    id: 'reward-park',
    title: 'Paseo en Bici o Tarde de Parque',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 200,
    icon: '🚲',
    description: 'Tarde al aire libre con merienda.',
    purchased: false,
    redeemLimit: 2,
    redeemPeriod: 'per_week',
  },
  {
    id: 'reward-dinner',
    title: 'Elegir el Menú de la Cena',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 150,
    icon: '🍕',
    description: 'Tu comida favorita para toda la casa.',
    purchased: false,
    redeemLimit: 2,
    redeemPeriod: 'per_week',
  },
  // Diarios sin dinero ni videojuegos — con límite semanal configurable
  {
    id: 'reward-play-parents',
    title: '10 min jugando con Papá o Mamá',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 55,
    icon: '🧸',
    description: '10 minutos de juego libre con papá o mamá, sin pantallas.',
    purchased: false,
    redeemLimit: 5,
    redeemPeriod: 'per_week',
  },
  {
    id: 'reward-piano',
    title: '10 min con el Piano',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 50,
    icon: '🎹',
    description: '10 minutos extra para practicar piano con alegría. Sin tele.',
    purchased: false,
    redeemLimit: 5,
    redeemPeriod: 'per_week',
  },
  {
    id: 'reward-draw',
    title: '10 min dibujando juntos',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 60,
    icon: '🎨',
    description: '10 minutos de dibujo libre con mamá o papá.',
    purchased: false,
    redeemLimit: 4,
    redeemPeriod: 'per_week',
  },
  {
    id: 'reward-story',
    title: 'Cuento leído por Papá/Mamá 10 min',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 45,
    icon: '📚',
    description: 'Papá o mamá te lee tu cuento favorito 10 minutos.',
    purchased: false,
    redeemLimit: 5,
    redeemPeriod: 'per_week',
  },
  {
    id: 'reward-boardgame',
    title: '15 min juego de mesa en familia',
    type: 'real_life',
    costType: 'sabiduria',
    cost: 65,
    icon: '🎲',
    description: 'Partida corta a tu juego de mesa favorito.',
    purchased: false,
    redeemLimit: 3,
    redeemPeriod: 'per_week',
  },
  // Accesorios de Avatar — se ganan con VIDA (configurable) y duran 1 semana máximo (configurable)
  {
    id: 'avatar-backpack',
    title: 'Mochila de Explorador',
    type: 'avatar',
    costType: 'vida',
    cost: 70,
    icon: '🎒',
    description: 'Se ve en tu personaje en el juego. Equipa una mochila dorada.',
    purchased: false,
    itemKey: 'backpack',
    gender: 'unisex',
    avatarDuration: 'limited_days',
    avatarDurationDays: 7,
  },
  {
    id: 'avatar-glasses',
    title: 'Gafas de Sabio',
    type: 'avatar',
    costType: 'vida',
    cost: 60,
    icon: '👓',
    description: 'Se ve en tu personaje: lentes reales sobre el rostro.',
    purchased: false,
    itemKey: 'glasses',
    gender: 'unisex',
    avatarDuration: 'limited_days',
    avatarDurationDays: 7,
  },
  {
    id: 'avatar-medal',
    title: 'Medalla de Campeón',
    type: 'avatar',
    costType: 'vida',
    cost: 120,
    icon: '🥇',
    description: 'Se ve en el pecho: medalla dorada brillante.',
    purchased: false,
    itemKey: 'medal',
    gender: 'unisex',
    avatarDuration: 'limited_days',
    avatarDurationDays: 7,
  },
  {
    id: 'avatar-cape',
    title: 'Capa de Héroe del Conocimiento',
    type: 'avatar',
    costType: 'vida',
    cost: 150,
    icon: '🦸',
    description: 'Se ve flameando detrás: capa roja de héroe.',
    purchased: false,
    itemKey: 'cape',
    gender: 'unisex',
    avatarDuration: 'limited_days',
    avatarDurationDays: 7,
  },
  {
    id: 'avatar-lantern',
    title: 'Linterna de Explorador',
    type: 'avatar',
    costType: 'vida',
    cost: 80,
    icon: '🔦',
    description: 'Linterna que ilumina tus aventuras. Se ve en la mano del personaje.',
    purchased: false,
    itemKey: 'lantern',
    gender: 'unisex',
    avatarDuration: 'limited_days',
    avatarDurationDays: 7,
  },
];

export function getDefaultMedalDefinitions(): MedalDefinition[] {
  const defs: MedalDefinition[] = [];
  // Generales
  defs.push({ id: 'medal-daily-5', title: '¡5 en un Día!', description: 'Más de 5 actividades aprobadas en un mismo día', icon: '🌟', materiaId: null, criteriaType: 'daily_activities', criteriaParams: { threshold: 5 }, enabled: true });
  defs.push({ id: 'medal-daily-8', title: 'Día Imparable', description: '8 actividades en un día', icon: '🔥', materiaId: null, criteriaType: 'daily_activities', criteriaParams: { threshold: 8 }, enabled: true });
  // Por materia: semana 1 completa a tiempo / fuera de tiempo, bimestre completo
  const semanas = [1, 2, 3, 4] as const;
  const bimestres = [1, 2, 3, 4] as const;
  for (const m of MATERIAS) {
    // Semana 1 como hito destacado
    defs.push({ id: `medal-${m.id}-s1-ontime`, title: `${m.shortName}: Semana 1 a tiempo`, description: `Semana 1 de ${m.name} completada sin atrasos`, icon: '🏅', materiaId: m.id, criteriaType: 'week_complete_ontime', criteriaParams: { semana: 1, bimestre: 1 }, enabled: true });
    defs.push({ id: `medal-${m.id}-s1-any`, title: `${m.shortName}: Semana 1 completada`, description: `Semana 1 de ${m.name} completada (aunque fuera de tiempo)`, icon: '🎯', materiaId: m.id, criteriaType: 'week_complete', criteriaParams: { semana: 1, bimestre: 1 }, enabled: true });
    for (const b of bimestres) {
      defs.push({ id: `medal-${m.id}-b${b}`, title: `${m.shortName}: Bimestre ${b} completado`, description: `Todas las semanas del Bimestre ${b} de ${m.name} completadas`, icon: '🏆', materiaId: m.id, criteriaType: 'bimestre_complete', criteriaParams: { bimestre: b }, enabled: true });
    }
    // Medallas genéricas por materia para semanas 2-4 (compactas)
    for (const s of semanas.slice(1)) {
      defs.push({ id: `medal-${m.id}-s${s}`, title: `${m.shortName}: Semana ${s}`, description: `Semana ${s} completada`, icon: '🥇', materiaId: m.id, criteriaType: 'week_complete', criteriaParams: { semana: s, bimestre: 1 }, enabled: false });
    }
  }
  // Kinder
  defs.push({ id: 'medal-kinder-s1', title: 'Kinder: Semana 1', description: 'Semana 1 de Aventuras de Kinder', icon: '🎈', materiaId: KINDER_MATERIA.id, criteriaType: 'week_complete', criteriaParams: { semana: 1, bimestre: 1 }, enabled: true });
  return defs;
}

export const DEFAULT_PROMISES: string[] = [
  'Josué 1:9 – "¡Sé fuerte y valiente! ¡No tengas miedo ni te desanimes! Porque el Señor tu Dios está contigo dondequiera que vayas".',
  'Salmo 23:4 – "Incluso cuando pase por el valle más oscuro, no temeré peligro alguno, porque tú estás a mi lado".',
  'Mateo 28:20 – "Y tengan por seguro esto: que estoy con ustedes siempre, hasta el fin de los tiempos".',
  'Salmo 46:1 – "Dios es nuestro amparo y nuestra fuerza, siempre está dispuesto a ayudarnos en los tiempos de dificultad".',
  'Isaías 41:10 – "No tengas miedo, porque yo estoy contigo; no te desalientes, porque yo es tu Dios. Te daré fuerzas y te ayudaré".',
  'Salmo 121:7 – "El Señor te libra de todo mal y cuida tu vida".',
  'Proverbios 3:24 – "Puedes irte a dormir sin miedo; te acostarás y dormirás profundamente".',
  'Salmo 91:11 – "Pues él ordenará a sus ángeles que te protejan por dondequiera que vayas".',
  'Salmo 34:7 – "Pues el ángel del Señor es un guardián; rodea y defiende a todos los que le temen".',
  '2 Tesalonicenses 3:3 – "Pero el Señor es fiel; él los fortalecerá y los protegerá del maligno".',
  'Jeremías 31:3 – "Con amor eterno te he amado; por eso te sigo mostrando mi fidelidad".',
  '1 Juan 3:1 – "Miren cuánto nos ama nuestro Padre celestial, que nos llama sus hijos, ¡y lo somos!".',
  'Salmo 100:5 – "Pues el Señor es bueno. Su amor inagotable permanece para siempre, y su fidelidad continúa de generación en generación".',
  'Romanos 8:39 – "Ningún poder... será capaz de separarnos del amor de Dios que está en Cristo Jesús nuestro Señor".',
  'Sofonías 3:17 – "El Señor tu Dios vive en medio de ti... Se deleitará en ti con alegría. Con su amor calmará todos tus temores".',
  '1 Pedro 5:7 – "Pongan todas sus preocupaciones y ansiedades en las manos de Dios, porque él cuida de ustedes".',
  'Salmo 34:17 – "El Señor escucha a los suyos cuando le piden auxilio; los rescata de todas sus dificultades".',
  'Jeremías 29:12 – "En esos días, cuando oren, los escucharé".',
  'Mateo 7:7 – "Sigue pidiendo y recibirás lo que pides; sigue buscando y encontrarás; sigue llamando y la puerta se te abrirá".',
  'Salmo 50:15 – "Llamame en el día de la angustia; yo te libraré, y tú me honrarás".',
  'Juan 14:27 – "Les dejo un regalo: paz en la mente y en el corazón... Así que no se preocupen ni tengan miedo".',
  'Filipenses 4:7 – "La paz de Dios, que supera todo lo que podemos entender, cuidará sus corazones y sus mentes".',
  'Salmo 16:11 – "Me mostrarás el camino de la vida; en tu presencia hay plenitud de gozo".',
  'Nehemías 8:10 – "No se entristezcan, porque el gozo del Señor es su fuerza".',
  'Isaías 26:3 – "¡Tú guardarás en perfecta paz a todos los que confían en ti; a todos los que concentran en ti sus pensamientos!".',
  'Jeremías 29:11 – "Pues yo sé los planes que tengo para ustedes —dice el Señor—. Son planes para lo bueno y no para lo malo, para darles un futuro y una esperanza".',
  'Salmo 139:14 – "¡Gracias por hacerme tan maravillosamente complejo! Tu mano de obra es maravillosa".',
  'Proverbios 3:6 – "Busca su voluntad en todo lo que hagas, y él te mostrará cuál camino tomar".',
  'Filipenses 1:6 – "Dios empezó el buen trabajo en ustedes, y estoy seguro de que lo continuará hasta que quede terminado".',
  'Romanos 8:28 – "Y sabemos que Dios hace que todas las cosas cooperen para el bien de los que lo aman".',
];

export function getDefaultHabitDefinitions(): HabitDefinition[] {
  return [
    { id: 'habit-tender-cama', title: 'Tender la cama y ordenar la habitación', description: 'Dejar la habitación ordenada al levantarse', icon: '🛏️', points: 10, goalType: 'daily', goalCount: 1, enabled: true },
    { id: 'habit-lavarse-dientes-cara', title: 'Lavarse los dientes y la cara', description: 'Higiene facial y dental', icon: '🪥', points: 5, goalType: 'daily', goalCount: 4, enabled: true },
    { id: 'habit-banarse-vestirse', title: 'Bañarse a tiempo y vestirse solo', description: 'Higiene y autonomía', icon: '🚿', points: 30, goalType: 'weekly', goalCount: 4, enabled: true },
    { id: 'habit-lectura-biblia', title: 'Lectura de la biblia por día', description: 'Tiempo diario con la Palabra', icon: '📖', points: 10, goalType: 'daily', goalCount: 1, enabled: true },
    { id: 'habit-trabajo-sin-distraerse', title: 'Trabajo en su tarea sin distraerse por 1 hora', description: 'Concentración sostenida', icon: '⏳', points: 20, goalType: 'daily', goalCount: 1, enabled: true },
    { id: 'habit-guardar-juguetes', title: 'Guardar los juguetes y materiales utilizados durante el día', description: 'Orden al finalizar el juego', icon: '🧸', points: 20, goalType: 'daily', goalCount: 1, enabled: true },
    { id: 'habit-guardar-utiles', title: 'Cuando termina la tarea, guarda los útiles', description: 'Guardar útiles al terminar', icon: '✏️', points: 10, goalType: 'daily', goalCount: 1, enabled: true },
    { id: 'habit-poner-mesa', title: 'Poner o levantar la mesa en las comidas', description: 'Colaborar en la mesa', icon: '🍽️', points: 5, goalType: 'daily', goalCount: 1, enabled: true },
    { id: 'habit-ropa-canasto', title: 'Deja la ropa sucia en el canasto', description: 'Hábitos de orden', icon: '👕', points: 5, goalType: 'daily', goalCount: 1, enabled: true },
    { id: 'habit-higiene-nocturna', title: 'Hábitos de higiene nocturna SOLITO (dientes y baño) sin que un adulto le insista', description: 'Autonomía nocturna', icon: '🌙', points: 5, goalType: 'daily', goalCount: 1, enabled: true },
  ];
}

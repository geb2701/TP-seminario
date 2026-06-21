/**
 * Seed de reseñas para verificar el ranking por prestigio del test vocacional.
 *
 * Ejecutar: pnpm db:seed-reviews
 *
 * Los ratings están diseñados con contrastes deliberados:
 *   - UBA / UDESA / UTDT → universidades con rating alto (4.5–4.9)
 *   - UNC / UNT / UNR   → universidades con rating bajo (2.8–3.5)
 *
 * Esto hace que al seleccionar "Prestigio" en el test, la reordenación sea
 * claramente visible: carreras de UDESA/UTDT suben aunque tengan menos
 * afinidad vocacional que carreras de UTN o UNC.
 */

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Review = { rating: number; content: string; authorName: string };

type CareerReviewSeed = {
  universityCode: string;
  careerName: string;
  reviews: Review[];
};

type UniversityReviewSeed = {
  universityCode: string;
  reviews: Review[];
};

// ─── Reseñas de carreras ──────────────────────────────────────────────────────

const CAREER_REVIEWS: CareerReviewSeed[] = [
  // ── UBA (universidad: avg 4.8) ────────────────────────────────────────────
  {
    universityCode: "UBA",
    careerName: "Ingeniería en Computación",
    // avg carrera: 4.8 → top de ingeniería con prestige activado
    reviews: [
      { rating: 5, content: "Formación muy sólida en hardware y software. El nivel de exigencia es alto pero la calidad académica lo justifica. Egresé con ofertas de trabajo en mano.", authorName: "Sebastián R." },
      { rating: 5, content: "Los docentes son investigadores activos. Accedí a proyectos del CONICET desde tercer año. Muy recomendable para quien quiera hacer ciencia o industria.", authorName: "Lucía F." },
      { rating: 5, content: "Plan de estudios robusto con mucha matemática y algoritmos. Al principio cuesta, pero después entendés por qué te diferencia en el mercado.", authorName: "Tomás A." },
      { rating: 4, content: "Excelente carrera, aunque la infraestructura edilicia podría mejorar. El nivel técnico es de primer nivel internacional.", authorName: "Camila V." },
      { rating: 5, content: "Difícil de cursar y larga, pero el título de la UBA abre todas las puertas en el sector tecnológico.", authorName: "Diego M." },
    ],
  },
  {
    universityCode: "UBA",
    careerName: "Medicina",
    // avg carrera: 4.6
    reviews: [
      { rating: 5, content: "La formación clínica en los hospitales universitarios no tiene comparación. Desde tercero ya estás en contacto real con pacientes.", authorName: "Martina B." },
      { rating: 5, content: "Exigente pero impecable. Los profesores son referentes nacionales en sus especialidades.", authorName: "Lucas P." },
      { rating: 4, content: "El CBC filtra bastante al principio pero luego la carrera se vuelve apasionante. Muy reconocida en el exterior.", authorName: "Valentina C." },
      { rating: 5, content: "La mejor medicina pública del país, sin dudas.", authorName: "Rodrigo S." },
      { rating: 4, content: "Infraestructura mejorable en algunas facultades, pero el cuerpo docente es excelente.", authorName: "Ana G." },
    ],
  },
  {
    universityCode: "UBA",
    careerName: "Abogacía",
    // avg carrera: 4.4
    reviews: [
      { rating: 5, content: "La Facultad de Derecho de la UBA tiene un peso simbólico enorme en el mundo jurídico argentino.", authorName: "Florencia D." },
      { rating: 4, content: "Formación teórica muy sólida. Te prepara para pensar críticamente el derecho, no solo aplicarlo.", authorName: "Matías H." },
      { rating: 4, content: "La masividad es un reto, pero los mejores profesores son muy accesibles en sus horarios de consulta.", authorName: "Soledad R." },
      { rating: 5, content: "Salí con una base jurídica muy completa. Muy valorada en estudios de abogados y el sector público.", authorName: "Emilio N." },
    ],
  },
  {
    universityCode: "UBA",
    careerName: "Psicología",
    // avg carrera: 4.0
    reviews: [
      { rating: 4, content: "La tradición psicoanalítica de la facultad es muy fuerte. Si te interesa esa corriente, es la mejor del país.", authorName: "Julia M." },
      { rating: 4, content: "Buen nivel académico pero con poca variedad de orientaciones teóricas. La clínica es el fuerte.", authorName: "Ignacio T." },
      { rating: 4, content: "El plan de estudios es denso pero la formación es reconocida en toda Latinoamérica.", authorName: "Clara P." },
      { rating: 4, content: "Muy buena para quien quiere dedicarse a la clínica. Para otras ramas de la psicología puede quedarse corta.", authorName: "Bruno K." },
    ],
  },
  {
    universityCode: "UBA",
    careerName: "Contador Público",
    // avg carrera: 3.4 (debería subir poco con prestige por universidad alta)
    reviews: [
      { rating: 4, content: "La carrera cumple, pero se nota que es masiva y algunos cursos son muy teóricos sin aplicación práctica.", authorName: "Agustín L." },
      { rating: 3, content: "El título está bien visto, pero la cursada puede ser bastante rutinaria. La salida laboral es buena igual.", authorName: "Nadia F." },
      { rating: 3, content: "Muchos trámites burocráticos. El ritmo de la carrera es lento comparado con otras opciones.", authorName: "Ramiro B." },
      { rating: 4, content: "La calidad varía mucho según la cátedra que te toca. En general es aceptable.", authorName: "Daniela C." },
    ],
  },

  // ── UNLP (universidad: avg 4.3) ───────────────────────────────────────────
  {
    universityCode: "UNLP",
    careerName: "Ingeniería en Sistemas",
    // avg carrera: 4.4
    reviews: [
      { rating: 5, content: "Una de las mejores ingenierías en sistemas del país. Las empresas conocen y valoran el título de la UNLP.", authorName: "Pablo R." },
      { rating: 4, content: "La carrera tiene un buen equilibrio entre teoría y práctica. Hay muchos convenios con empresas locales.", authorName: "Magalí S." },
      { rating: 4, content: "Muy buena formación en algoritmos y bases de datos. Te cuesta al principio pero después lo valorás.", authorName: "Nicolás B." },
      { rating: 5, content: "La comunidad de estudiantes es muy activa. El ambiente de estudio es genial.", authorName: "Carla D." },
      { rating: 4, content: "Sólida pero larga. El mercado laboral te espera con buenas oportunidades al terminar.", authorName: "Esteban V." },
    ],
  },
  {
    universityCode: "UNLP",
    careerName: "Medicina Veterinaria",
    // avg carrera: 4.5
    reviews: [
      { rating: 5, content: "La facultad tiene las mejores instalaciones veterinarias del país. Los hospitales para animales son de primer nivel.", authorName: "Sofía R." },
      { rating: 4, content: "Muy buena formación en sanidad animal y producción. Muy demandada en el sector agropecuario.", authorName: "Gonzalo P." },
      { rating: 5, content: "Los docentes son profesionales activos. Hacés prácticas en campo desde segundo año.", authorName: "Luciana M." },
      { rating: 4, content: "Extensa pero muy completa. La reputación de la UNLP en veterinaria es enorme.", authorName: "Juan C." },
    ],
  },
  {
    universityCode: "UNLP",
    careerName: "Arquitectura",
    // avg carrera: 3.5
    reviews: [
      { rating: 4, content: "Buena formación técnica. La facultad tiene una identidad de diseño propia.", authorName: "Mariana F." },
      { rating: 3, content: "La carga horaria es brutal y el plan de estudios necesita actualización en herramientas digitales.", authorName: "Hernán V." },
      { rating: 4, content: "Muy valorada en el interior del país. Para trabajar en Buenos Aires preferirían UBA o FADU.", authorName: "Lorena T." },
      { rating: 3, content: "Infraestructura regular. Le falta modernizar los talleres de diseño.", authorName: "Mauricio A." },
    ],
  },

  // ── UNC (universidad: avg 3.8) ────────────────────────────────────────────
  {
    universityCode: "UNC",
    careerName: "Medicina",
    // avg carrera: 3.8
    reviews: [
      { rating: 4, content: "La UNC tiene una tradición médica muy larga, pero el título no tiene el mismo peso nacional que la UBA.", authorName: "Romina L." },
      { rating: 4, content: "Buena formación clínica en los hospitales de Córdoba. El cuerpo docente es comprometido.", authorName: "Federico O." },
      { rating: 3, content: "El plan de estudios está desactualizado en algunas áreas. El título es respetable en el interior del país.", authorName: "Verónica S." },
      { rating: 4, content: "La experiencia en el Hospital Universitario es muy buena. Hay que buscar las cátedras correctas.", authorName: "Ariel M." },
    ],
  },
  {
    universityCode: "UNC",
    careerName: "Abogacía",
    // avg carrera: 3.3
    reviews: [
      { rating: 4, content: "Buena base teórica, aunque la formación práctica es menos robusta. Sirve para litigar en Córdoba.", authorName: "Patricia D." },
      { rating: 3, content: "La masividad hace que la atención individualizada sea difícil de conseguir.", authorName: "Ricardo T." },
      { rating: 3, content: "El título tiene reconocimiento local, pero para mercados nacionales el peso es menor que UBA o UDESA.", authorName: "Graciela B." },
      { rating: 3, content: "Cursada aceptable. Le falta más énfasis en práctica jurídica real.", authorName: "Carlos P." },
    ],
  },
  {
    universityCode: "UNC",
    careerName: "Ingeniería Industrial",
    // avg carrera: 2.8 (baja → se hunde con prestige activado)
    reviews: [
      { rating: 3, content: "Carrera con buena salida laboral en Córdoba por las industrias locales, pero el prestigio nacional es limitado.", authorName: "Adrián R." },
      { rating: 3, content: "El nivel varía mucho según el año. Los primeros años son más rigurosos que los últimos.", authorName: "Cecilia F." },
      { rating: 2, content: "La cursada necesita actualización urgente. Los contenidos de gestión y automatización están desactualizados.", authorName: "Mauricio N." },
      { rating: 3, content: "Aceptable para trabajar en el sector industrial cordobés, pero difícil de proyectar en el exterior.", authorName: "Teresa V." },
      { rating: 3, content: "Los profesores son buenos en teoría pero falta más conexión con la industria real.", authorName: "Jorge S." },
    ],
  },

  // ── UTN (universidad: avg 3.7) ────────────────────────────────────────────
  {
    universityCode: "UTN",
    careerName: "Ingeniería en Sistemas de Información",
    // avg carrera: 3.9 (media — neutral con prestige)
    reviews: [
      { rating: 4, content: "La UTN-ISI es la carrera con más demanda laboral antes del egreso. Muy orientada a la industria.", authorName: "Lucas B." },
      { rating: 4, content: "Excelente para conseguir trabajo rápido. Algunos cursos son algo teóricos, pero en general el nivel es bueno.", authorName: "Paola M." },
      { rating: 4, content: "El título es reconocido en todo el país y en muchas empresas multinacionales.", authorName: "Andrés F." },
      { rating: 4, content: "Gran comunidad estudiantil. Hay muchas actividades extracurriculares.", authorName: "Julieta C." },
      { rating: 3, content: "Es buena pero no es una ingeniería de élite. Para quien quiere investigar o ir al exterior, queda corta.", authorName: "Hernán D." },
    ],
  },
  {
    universityCode: "UTN",
    careerName: "Ingeniería Electrónica",
    // avg carrera: 3.2 (baja — se hunde con prestige)
    reviews: [
      { rating: 3, content: "La cursada es muy dura pero el título no tiene el mismo reconocimiento que otras ingenierías más modernas.", authorName: "Gabriel T." },
      { rating: 3, content: "Contenido muy matemático sin suficiente aplicación práctica hasta los últimos años.", authorName: "Soledad B." },
      { rating: 4, content: "Buena para trabajar en automatización industrial. La salida laboral existe aunque es más estrecha que sistemas.", authorName: "Pablo A." },
      { rating: 3, content: "Plan de estudios algo antiguo. Necesita más contenido de electrónica digital y sistemas embebidos.", authorName: "Valeria N." },
      { rating: 3, content: "La reputación de la UTN ayuda, pero la carrera en sí necesita modernización.", authorName: "Marcos R." },
    ],
  },
  {
    universityCode: "UTN",
    careerName: "Ingeniería Civil",
    // avg carrera: 2.6 (muy baja)
    reviews: [
      { rating: 3, content: "Plan de estudios desactualizado. Para trabajar en obra pública sirve, pero la formación no es diferencial.", authorName: "Oscar F." },
      { rating: 3, content: "Los docentes tienen experiencia pero la conexión con el sector privado es escasa.", authorName: "Karina L." },
      { rating: 2, content: "Las instalaciones para laboratorios son limitadas. Difícil hacer prácticas reales de estructuras.", authorName: "Javier C." },
      { rating: 3, content: "Aceptable para construir en el interior del país. Para proyectos de envergadura nacional preferís otra universidad.", authorName: "Marcela D." },
      { rating: 2, content: "La carrera cumple lo mínimo pero no más que eso. Para construcción seria te iría mejor en la UBA.", authorName: "Facundo B." },
    ],
  },

  // ── UNR (universidad: avg 3.4) ────────────────────────────────────────────
  {
    universityCode: "UNR",
    careerName: "Medicina",
    // avg carrera: 3.2
    reviews: [
      { rating: 3, content: "Carrera digna pero el peso del título fuera de Santa Fe es limitado. La infraestructura hospitalaria es irregular.", authorName: "Natalia K." },
      { rating: 3, content: "Cuerpo docente comprometido pero plan de estudios necesita revisión.", authorName: "Emanuel P." },
      { rating: 4, content: "La experiencia en el Hospital Provincial es positiva. La formación clínica básica está bien cubierta.", authorName: "Silvia M." },
      { rating: 3, content: "Demasiada teoría en los primeros años. La práctica clínica llega tarde.", authorName: "Rodrigo F." },
      { rating: 3, content: "Título respetado en la región pero con poco reconocimiento nacional comparado con UBA o UNC.", authorName: "Claudia V." },
    ],
  },
  {
    universityCode: "UNR",
    careerName: "Arquitectura",
    // avg carrera: 2.6
    reviews: [
      { rating: 3, content: "La facultad tiene una identidad interesante, pero los recursos son muy limitados.", authorName: "Gustavo R." },
      { rating: 2, content: "Talleres con equipamiento obsoleto. Para un arquitecto que quiere competir en diseño contemporáneo, hay mejores opciones.", authorName: "Laura C." },
      { rating: 3, content: "El nivel varía mucho entre cátedras. Hay que saber elegir bien los talleres.", authorName: "Roberto A." },
      { rating: 2, content: "La conexión con el sector privado y las constructoras es casi nula durante la carrera.", authorName: "Miriam T." },
      { rating: 3, content: "Aceptable para quedarse en Rosario, pero el prestigio nacional no es comparable con FADU o UNLP.", authorName: "Eduardo S." },
    ],
  },

  // ── UDESA (universidad: avg 4.9) ──────────────────────────────────────────
  {
    universityCode: "UDESA",
    careerName: "Administración de Empresas",
    // avg carrera: 4.9 → debería subir mucho con prestige activado
    reviews: [
      { rating: 5, content: "El mejor programa de negocios del país para quien busca el mundo corporativo de primer nivel. Los alumni son una red increíble.", authorName: "Santiago K." },
      { rating: 5, content: "Profesores que son directivos activos de empresas. Los casos de estudio son de primera. Muy internacional.", authorName: "Jimena L." },
      { rating: 5, content: "La inversión vale absolutamente. Salí con tres ofertas laborales antes de recibirme.", authorName: "Alejandro M." },
      { rating: 5, content: "El campus de Victoria es hermoso y el ambiente académico es de nivel mundial.", authorName: "Victoria P." },
      { rating: 5, content: "La reputación de UDESA en el mundo corporativo argentino no tiene igual entre las privadas.", authorName: "Ignacio F." },
    ],
  },
  {
    universityCode: "UDESA",
    careerName: "Economía",
    // avg carrera: 4.7
    reviews: [
      { rating: 5, content: "La carrera más rigurosa en economía del país. Mucha econometría y teoría formal. Para los que van a fondo.", authorName: "Martín A." },
      { rating: 5, content: "Los profesores son PhDs de universidades americanas y europeas. El nivel académico es extraordinario.", authorName: "Catalina R." },
      { rating: 4, content: "Excelente para investigación y para trabajar en organismos internacionales.", authorName: "Tomás B." },
      { rating: 5, content: "El título de Economía de UDESA abre puertas en el mundo financiero que ninguna otra carrera puede.", authorName: "Sofía N." },
      { rating: 5, content: "Muy pequeña y selectiva, pero por eso mismo el nivel es altísimo.", authorName: "Diego P." },
    ],
  },
  {
    universityCode: "UDESA",
    careerName: "Abogacía",
    // avg carrera: 4.6
    reviews: [
      { rating: 5, content: "Orientación al derecho corporativo y arbitraje internacional. Lo que necesitás si querés los grandes estudios de abogados.", authorName: "Florencia T." },
      { rating: 4, content: "Pequeña, cara, pero con una red de alumni que te coloca en las mejores firmas del país.", authorName: "Emilio D." },
      { rating: 5, content: "El nivel de inglés que te exigen y la perspectiva internacional es un diferenciador clave.", authorName: "Paula C." },
      { rating: 5, content: "La mejor combinación entre negocios y derecho en Argentina.", authorName: "Rodrigo M." },
      { rating: 4, content: "Muy buena pero cara. Hay que evaliar bien el retorno de la inversión.", authorName: "Luciana K." },
    ],
  },

  // ── UTDT (universidad: avg 4.8) ───────────────────────────────────────────
  {
    universityCode: "UTDT",
    careerName: "Ingeniería Informática",
    // avg carrera: 4.9 → debería subir mucho con prestige activado
    reviews: [
      { rating: 5, content: "El ambiente de innovación y emprendimiento es único en Argentina. Mis compañeros de cursada están en las mejores empresas tech del mundo.", authorName: "Valentina G." },
      { rating: 5, content: "Profesores que son CTO y fundadores de startups. Aprendí más sobre la industria real acá que en cualquier otro lado.", authorName: "Nicolás A." },
      { rating: 5, content: "Red de alumni extraordinaria. Me consiguió trabajo en una empresa en San Francisco antes de recibirme.", authorName: "Mariana E." },
      { rating: 5, content: "La Di Tella invierte mucho en tecnología de enseñanza. Labs, equipamiento y conectividad de primer nivel.", authorName: "Facundo R." },
      { rating: 4, content: "Cara, pero el retorno de la inversión es claro si querés el mercado tech internacional.", authorName: "Belén S." },
    ],
  },
  {
    universityCode: "UTDT",
    careerName: "Economía Empresarial",
    // avg carrera: 4.8
    reviews: [
      { rating: 5, content: "La combinación de economía, finanzas y negocios en un solo programa es única en el país.", authorName: "Marcos V." },
      { rating: 5, content: "Los profesores son economistas que trabajan en bancos, fondos de inversión y consultoras de tope.", authorName: "Inés P." },
      { rating: 5, content: "El rigor cuantitativo es alto, pero la salida laboral lo justifica ampliamente.", authorName: "Tomás C." },
      { rating: 4, content: "Muy exigente pero aprendés a pensar el mundo de los negocios de una manera muy distinta.", authorName: "Camila L." },
      { rating: 5, content: "El título de economía de la Di Tella es probablemente el más valorado por el sector financiero privado.", authorName: "Julián F." },
    ],
  },

  // ── UCA (universidad: avg 3.6) ────────────────────────────────────────────
  {
    universityCode: "UCA",
    careerName: "Derecho",
    // avg carrera: 3.8
    reviews: [
      { rating: 4, content: "Buena formación en valores y derecho natural. Para quien quiere derecho con ética profesional sólida.", authorName: "Sebastián P." },
      { rating: 4, content: "El ambiente es bueno y los profesores tienen experiencia en el Poder Judicial.", authorName: "Andrea F." },
      { rating: 3, content: "La orientación religiosa de la institución puede ser un limitante para algunos temas jurídicos modernos.", authorName: "Leandro M." },
      { rating: 4, content: "Título respetado en el sector privado, especialmente en estudios con perfil conservador.", authorName: "Patricia R." },
      { rating: 4, content: "La red de alumni de la UCA en el sector jurídico privado es buena.", authorName: "Carlos B." },
    ],
  },
  {
    universityCode: "UCA",
    careerName: "Comunicación Social",
    // avg carrera: 3.3
    reviews: [
      { rating: 3, content: "Carrera correcta pero con orientación muy tradicional. Le falta adaptarse a los medios digitales actuales.", authorName: "Melisa T." },
      { rating: 4, content: "Buen nivel de redacción y comunicación institucional. Las materias optativas son lo mejor de la carrera.", authorName: "Esteban K." },
      { rating: 3, content: "El foco está demasiado en medios gráficos y TV. El mundo del contenido digital está subrepresentado.", authorName: "Florencia A." },
      { rating: 3, content: "Aceptable, pero hay mejores opciones para comunicación en Argentina si no te importa el perfil católico.", authorName: "Gustavo R." },
    ],
  },

  // ── UNT (universidad: avg 2.7) ────────────────────────────────────────────
  {
    universityCode: "UNT",
    careerName: "Ingeniería Agronómica",
    // avg carrera: 2.4 (muy baja → se hunde con prestige)
    reviews: [
      { rating: 3, content: "La carrera tiene sentido para trabajar en el NOA pero fuera de la región el título tiene poco reconocimiento.", authorName: "Rubén C." },
      { rating: 2, content: "Infraestructura de laboratorios muy deficiente. Las prácticas de campo son escasas y poco planificadas.", authorName: "Eliana M." },
      { rating: 2, content: "El plan de estudios no se actualiza hace años. Los cultivos que estudian no siempre reflejan la producción actual.", authorName: "Aldo V." },
      { rating: 3, content: "Sirve para insertarte en el sector azucarero tucumano, pero no mucho más allá.", authorName: "Mirta F." },
      { rating: 2, content: "Para agronomía hay opciones mucho mejores en el país como la UNLP o la UBA.", authorName: "Hugo T." },
    ],
  },
  {
    universityCode: "UNT",
    careerName: "Odontología",
    // avg carrera: 2.8
    reviews: [
      { rating: 3, content: "Las clínicas tienen equipamiento básico pero no de punta. La formación práctica es aceptable.", authorName: "Beatriz L." },
      { rating: 3, content: "El título sirve para ejercer en el NOA. Para especializarte o ir al exterior necesitás hacer posgrados.", authorName: "Ricardo A." },
      { rating: 2, content: "La gestión académica tiene muchos problemas. Los turnos en clínica son escasos y hay mucha espera.", authorName: "Norma P." },
      { rating: 3, content: "Correcta para lo que ofrece. No es de élite pero cumple su función.", authorName: "Alfredo S." },
    ],
  },

  // ── UNMDP (universidad: avg 4.1) ─────────────────────────────────────────
  {
    universityCode: "UNMDP",
    careerName: "Biología Marina",
    // avg carrera: 4.7 (alta carrera, universidad media — interesante con prestige parcial)
    reviews: [
      { rating: 5, content: "No existe otra carrera igual en el país con este nivel de especialización en el Atlántico Sur. El CONICET está a la vuelta.", authorName: "Florencia V." },
      { rating: 5, content: "Los docentes son investigadores activos del INIDEP y el IIMYC. Aprendés de gente que hace ciencia real.", authorName: "Matías C." },
      { rating: 5, content: "La especialización y la rareza del título hacen que seas muy valorado en el mundo académico y de conservación marina.", authorName: "Paola R." },
      { rating: 4, content: "La carrera es pequeña y eso es una ventaja: los profesores te conocen y el seguimiento es personalizado.", authorName: "Hernán B." },
      { rating: 4, content: "Para quien quiere investigación marina es la única opción real en Argentina. La conectividad con institutos internacionales es muy buena.", authorName: "Carolina N." },
    ],
  },
  {
    universityCode: "UNMDP",
    careerName: "Licenciatura en Turismo",
    // avg carrera: 3.8
    reviews: [
      { rating: 4, content: "Mar del Plata es un laboratorio natural para el turismo. La carrera saca partido de eso con buenas prácticas en temporada.", authorName: "Cintia M." },
      { rating: 4, content: "Buena formación en turismo costero y de naturaleza. Para hotelería de lujo o turismo internacional queda corta.", authorName: "Leandro P." },
      { rating: 4, content: "Los convenios con municipios y cámaras de turismo de la costa son un diferenciador interesante.", authorName: "Rosario F." },
      { rating: 3, content: "La carrera cumple pero el perfil del egresado es bastante local. Difícil proyectarse fuera de la costa bonaerense.", authorName: "Martín A." },
    ],
  },
];

// ─── Reseñas de universidades ─────────────────────────────────────────────────

const UNIVERSITY_REVIEWS: UniversityReviewSeed[] = [
  {
    universityCode: "UBA",
    // avg universidad: 4.8 → top prestige público
    reviews: [
      { rating: 5, content: "La institución más prestigiosa del país, sin discusión. El título de la UBA abre puertas en todo el mundo.", authorName: "Ana G." },
      { rating: 5, content: "La diversidad de carreras, la gratuidad y el nivel académico la hacen única en América Latina.", authorName: "Roberto M." },
      { rating: 5, content: "Una institución que ha formado presidentes, premios Nobel y referentes de todas las disciplinas.", authorName: "Graciela S." },
      { rating: 4, content: "El prestigio es indiscutible pero la burocracia administrativa puede ser agotadora.", authorName: "Carlos D." },
      { rating: 5, content: "La excelencia académica de la UBA es consistente a lo largo del tiempo. Un valor seguro para cualquier carrera.", authorName: "Sandra V." },
    ],
  },
  {
    universityCode: "UNLP",
    // avg universidad: 4.3
    reviews: [
      { rating: 4, content: "Una de las universidades con más tradición del país. El ambiente universitario de La Plata es incomparable.", authorName: "Oscar T." },
      { rating: 5, content: "La UNLP tiene una vida estudiantil muy rica. Las organizaciones estudiantiles son muy activas.", authorName: "Rosana M." },
      { rating: 4, content: "El nivel académico es muy sólido, especialmente en veterinaria, sistemas y derecho.", authorName: "Ignacio B." },
      { rating: 4, content: "Buena infraestructura y docentes comprometidos. La ciudad universitaria es una experiencia única.", authorName: "Nadia R." },
      { rating: 4, content: "Reconocida a nivel nacional e internacional. El título de la UNLP tiene peso en casi todas las disciplinas.", authorName: "Leandro F." },
    ],
  },
  {
    universityCode: "UNC",
    // avg universidad: 3.8
    reviews: [
      { rating: 4, content: "La más antigua de Argentina y con una historia muy rica. La Reforma del 18 salió de acá.", authorName: "Ernesto V." },
      { rating: 4, content: "Muy buena para quedarse en Córdoba. Para proyectarse nacionalmente hay que complementar con posgrados en otro lado.", authorName: "Miriam P." },
      { rating: 4, content: "La vida universitaria es excelente. La ciudad y la universidad van de la mano.", authorName: "Santiago K." },
      { rating: 3, content: "La gestión administrativa deja mucho que desear. El nivel académico varía bastante entre facultades.", authorName: "Alejandra T." },
    ],
  },
  {
    universityCode: "UTN",
    // avg universidad: 3.7
    reviews: [
      { rating: 4, content: "La UTN tiene presencia en todo el país y sus títulos de ingeniería son reconocidos por la industria.", authorName: "Hernán D." },
      { rating: 4, content: "Muy orientada al mercado laboral. Desde segundo año hay empresas que te ofrecen pasantías.", authorName: "Laura T." },
      { rating: 3, content: "La calidad varía mucho entre las sedes regionales. Hay que investigar bien la sede antes de inscribirse.", authorName: "Mario C." },
      { rating: 4, content: "Para ingeniería aplicada a la industria, la UTN es una opción sólida y accesible.", authorName: "Gloria P." },
    ],
  },
  {
    universityCode: "UNR",
    // avg universidad: 3.4
    reviews: [
      { rating: 3, content: "Buena universidad para estudiar en Rosario, pero el reconocimiento nacional es menor al de la UNLP o la UBA.", authorName: "Sergio M." },
      { rating: 4, content: "El ambiente universitario en Rosario es agradable. La ciudad y la universidad tienen buena sinergia.", authorName: "Carolina F." },
      { rating: 3, content: "La gestión tiene muchos problemas internos que afectan la cursada. Hay mucha burocracia.", authorName: "Guillermo T." },
      { rating: 3, content: "Para algunas carreras como medicina la infraestructura queda corta.", authorName: "Beatriz A." },
    ],
  },
  {
    universityCode: "UDESA",
    // avg universidad: 4.9 → top prestige privado
    reviews: [
      { rating: 5, content: "La universidad privada de mayor prestigio académico del país en el área de negocios y ciencias sociales.", authorName: "Federico L." },
      { rating: 5, content: "El campus, los profesores y la red de alumni son de nivel internacional. Vale cada peso de la inversión.", authorName: "Valeria M." },
      { rating: 5, content: "La reputación de UDESA en el sector corporativo es extraordinaria. El 'brand' abre puertas que otras universidades no pueden.", authorName: "Pablo R." },
      { rating: 5, content: "Pequeña, selectiva y con un nivel académico que no baja jamás. La mejor decisión que tomé en mi vida.", authorName: "Jimena S." },
      { rating: 5, content: "Los eventos, conferencias y conexiones que genera UDESA no tienen precio.", authorName: "Alejandro B." },
    ],
  },
  {
    universityCode: "UTDT",
    // avg universidad: 4.8 → top prestige privado (empata con UDESA)
    reviews: [
      { rating: 5, content: "La Di Tella es sinónimo de excelencia e innovación. El mejor ambiente para quienes quieren emprender o investigar.", authorName: "Nicolás V." },
      { rating: 5, content: "Profesores de altísimo nivel académico. La mayoría tiene doctorados de las mejores universidades del mundo.", authorName: "Lucia F." },
      { rating: 5, content: "La conexión con el ecosistema de startups y el mercado internacional es un activo enorme.", authorName: "Tomás A." },
      { rating: 4, content: "Cara pero justificada. El retorno de la inversión en términos de red de contactos y salario inicial es notable.", authorName: "Camila R." },
      { rating: 5, content: "Una institución que combina rigor académico con apertura al mundo real. No hay otra igual en Argentina.", authorName: "Martín P." },
    ],
  },
  {
    universityCode: "UCA",
    // avg universidad: 3.5
    reviews: [
      { rating: 4, content: "Universidad con buena formación en humanidades y derecho. El entorno es tranquilo y organizado.", authorName: "Patricia H." },
      { rating: 3, content: "El perfil religioso de la institución puede no adaptarse a todos. Académicamente es correcta pero no excepcional.", authorName: "Diego C." },
      { rating: 4, content: "Buena para carreras como comunicación o derecho con orientación conservadora.", authorName: "Laura M." },
      { rating: 3, content: "El costo no se justifica con el nivel académico cuando lo comparás con otras privadas como UDESA o UTDT.", authorName: "Norberto F." },
    ],
  },
  {
    universityCode: "UNT",
    // avg universidad: 2.7 → más baja del seed
    reviews: [
      { rating: 3, content: "La universidad tiene historia en el NOA pero los recursos institucionales son muy limitados.", authorName: "Beatriz C." },
      { rating: 2, content: "La infraestructura es deficiente y la gestión académica es caótica. Hay un problema sistémico de recursos.", authorName: "Roberto L." },
      { rating: 3, content: "Para quien no puede moverse de Tucumán, es la opción lógica. Pero el reconocimiento nacional es bajo.", authorName: "Silvia M." },
      { rating: 3, content: "Algunos docentes son excelentes pero el sistema institucional los limita.", authorName: "Alfredo V." },
      { rating: 2, content: "Mucha burocracia y poca inversión en modernización. El sector privado no valora mucho el título fuera de la región.", authorName: "Graciela P." },
    ],
  },
  {
    universityCode: "UNMDP",
    // avg universidad: 4.1
    reviews: [
      { rating: 4, content: "Muy buena universidad para Mar del Plata y la región costera. Sus carreras de ciencias naturales son de primer nivel.", authorName: "Cecilia R." },
      { rating: 4, content: "El vínculo con el CONICET y los centros de investigación de la ciudad es un activo enorme.", authorName: "Horacio B." },
      { rating: 5, content: "Para Biología Marina y ciencias del mar es la mejor universidad del país, sin discusión posible.", authorName: "Fernanda T." },
      { rating: 4, content: "La ciudad universitaria es excelente y el ambiente estudiantil es muy cálido.", authorName: "Eduardo A." },
      { rating: 3, content: "Muy buena para carreras específicas pero limitada en oferta si querés algo más general.", authorName: "Gladys M." },
    ],
  },
];

// ─── Mapeo código → nombre completo ──────────────────────────────────────────
// shortCode es nullable en la DB; usamos el nombre completo como clave robusta.

const CODE_TO_NAME: Record<string, string> = {
  UBA:   "Universidad de Buenos Aires",
  UNLP:  "Universidad Nacional de La Plata",
  UNC:   "Universidad Nacional de Córdoba",
  UTN:   "Universidad Tecnológica Nacional",
  UNR:   "Universidad Nacional de Rosario",
  UDESA: "Universidad de San Andrés",
  UTDT:  "Universidad Torcuato Di Tella",
  UCA:   "Pontificia Universidad Católica Argentina",
  UNT:   "Universidad Nacional de Tucumán",
  UNMDP: "Universidad Nacional de Mar del Plata",
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Limpiando reseñas existentes...");
  await prisma.careerReview.deleteMany();
  await prisma.universityReview.deleteMany();

  // Fetch all universities indexed by name
  const allUniversities = await prisma.university.findMany({
    select: { id: true, name: true },
  });
  const uniByCode = new Map(
    allUniversities.map((u) => {
      const code = Object.entries(CODE_TO_NAME).find(([, name]) => name === u.name)?.[0];
      return [code, u] as [string | undefined, typeof u];
    }).filter(([code]) => code !== undefined) as [string, typeof allUniversities[0]][]
  );

  // Fetch all careers with their university name
  const allCareers = await prisma.career.findMany({
    select: { id: true, name: true, university: { select: { name: true } } },
  });

  // ── Career reviews ────────────────────────────────────────────────────────

  console.log("\nCreando reseñas de carreras...");
  let careerReviewCount = 0;
  const careerSummary: { career: string; university: string; avg: string }[] = [];

  for (const entry of CAREER_REVIEWS) {
    const uniName = CODE_TO_NAME[entry.universityCode];
    const career = allCareers.find(
      (c) => c.name === entry.careerName && c.university.name === uniName
    );
    if (!career) {
      console.warn(`  ⚠ No encontrada: ${entry.universityCode} / ${entry.careerName}`);
      continue;
    }
    for (const review of entry.reviews) {
      await prisma.careerReview.create({ data: { ...review, careerId: career.id } });
    }
    careerReviewCount += entry.reviews.length;
    const avg = (entry.reviews.reduce((s, r) => s + r.rating, 0) / entry.reviews.length).toFixed(1);
    careerSummary.push({ career: entry.careerName, university: entry.universityCode, avg });
  }

  // ── University reviews ────────────────────────────────────────────────────

  console.log("Creando reseñas de universidades...");
  let uniReviewCount = 0;
  const uniSummary: { university: string; avg: string }[] = [];

  for (const entry of UNIVERSITY_REVIEWS) {
    const uni = uniByCode.get(entry.universityCode);
    if (!uni) {
      console.warn(`  ⚠ No encontrada: ${entry.universityCode}`);
      continue;
    }
    for (const review of entry.reviews) {
      await prisma.universityReview.create({ data: { ...review, universityId: uni.id } });
    }
    uniReviewCount += entry.reviews.length;
    const avg = (entry.reviews.reduce((s, r) => s + r.rating, 0) / entry.reviews.length).toFixed(1);
    uniSummary.push({ university: entry.universityCode, avg });
  }

  // ── Resumen ───────────────────────────────────────────────────────────────

  console.log(`\n✓ ${careerReviewCount} reseñas de carrera y ${uniReviewCount} de universidad creadas.\n`);

  console.log("═══ Ratings de universidades ═══════════════════════════════");
  uniSummary
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
    .forEach(({ university, avg }) => {
      const bar = "█".repeat(Math.round(parseFloat(avg)));
      console.log(`  ${university.padEnd(6)} ${avg} ${bar}`);
    });

  console.log("\n═══ Ratings de carreras (por área de interés) ══════════════");
  careerSummary
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg))
    .forEach(({ career, university, avg }) => {
      const bar = "█".repeat(Math.round(parseFloat(avg)));
      console.log(`  ${avg} ${bar}  ${career} (${university})`);
    });

  console.log(`
─────────────────────────────────────────────────────────────
Para verificar el efecto de prestige en el test vocacional:

1. Completá el test seleccionando un área (ej: Ingeniería y Tecnología).
2. En la última pregunta elegí "Prestigio académico" como prioridad.
3. Esperado: Ingeniería Informática (UTDT, avg ≈4.8) e Ingeniería en
   Computación (UBA, avg ≈4.8) deberían subir por sobre
   Ingeniería en Sistemas de Información (UTN, avg ≈3.9) e
   Ingeniería Civil (UTN, avg ≈2.6), incluso si las últimas
   tienen mayor afinidad vocacional pura.
─────────────────────────────────────────────────────────────`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

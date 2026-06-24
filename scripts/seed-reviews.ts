// Seed de reseñas curadas para el dataset real (SIU). A diferencia de un seed
// exhaustivo, esto cubre solo un puñado de universidades muy conocidas y un
// par de carreras reales por área — suficiente para probar el flujo de
// reseñas y el ranking por prestigio del test vocacional sin multiplicar el
// tamaño de la base.
//
// Resuelve universidades por `name` exacto (no por `shortCode`, que en el
// dataset real siempre es null) y carreras por `(universityId, name)` exacto.
//
// Safety rail: igual que scripts/import-siu-data.ts — apunta a SQLite local
// por default; requiere --confirm-prod explícito para escribir en el Turso
// compartido.
//
// Uso: tsx scripts/seed-reviews.ts [--confirm-prod]
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const LOCAL_DB_URL = "file:./prisma/dev.db";

const confirmProd = process.argv.includes("--confirm-prod");
const targetUrl = confirmProd ? process.env.TURSO_DATABASE_URL! : LOCAL_DB_URL;

if (confirmProd) {
  console.log(`--confirm-prod passed: targeting ${targetUrl}`);
} else {
  console.log(`Safety default: targeting local SQLite (${LOCAL_DB_URL}). Pass --confirm-prod to write to the shared Turso DB instead.`);
}

const adapter = new PrismaLibSql({
  url: targetUrl,
  authToken: confirmProd ? process.env.TURSO_AUTH_TOKEN : undefined,
});
const prisma = new PrismaClient({ adapter });

type Review = { rating: number; content: string; authorName: string };

type CareerReviewSeed = {
  universityName: string;
  careerName: string;
  reviews: Review[];
};

type UniversityReviewSeed = {
  universityName: string;
  reviews: Review[];
};

// ─── Reseñas de universidades ─────────────────────────────────────────────────
// 8 universidades muy reconocidas, mezclando públicas y privadas. Rating
// promedio deliberadamente distinto entre ellas (todas en rango positivo,
// 3.8-4.9) para que elegir "Prestigio académico" en el test produzca un
// reordenamiento visible, sin sugerir que ninguna institución real es mala.

const UNIVERSITY_REVIEWS: UniversityReviewSeed[] = [
  {
    universityName: "Universidad de Buenos Aires",
    // avg ≈ 4.7
    reviews: [
      { rating: 5, content: "El prestigio de la UBA abre puertas en cualquier ámbito laboral. La exigencia académica es real, pero vale la pena.", authorName: "Martina G." },
      { rating: 5, content: "Docentes de primer nivel, muchos activos en investigación. El CBC filtra bastante pero después la experiencia es excelente.", authorName: "Lucas R." },
      { rating: 4, content: "La infraestructura varía mucho según la facultad, pero la formación académica siempre es sólida.", authorName: "Camila F." },
      { rating: 5, content: "Estudiar en la UBA te conecta con gente de todo el país. La diversidad de perspectivas enriquece muchísimo el cursado.", authorName: "Tomás A." },
      { rating: 5, content: "Pública, gratuita y de nivel internacional. No hay mucho más para pedir.", authorName: "Valentina S." },
      { rating: 4, content: "Los trámites administrativos pueden ser lentos, pero el nivel de los profesores compensa cualquier demora.", authorName: "Ignacio P." },
      { rating: 4, content: "Masiva, lo que tiene sus pros y sus contras. Si te organizás bien, sacás el máximo provecho.", authorName: "Sofía M." },
    ],
  },
  {
    universityName: "Instituto Tecnológico de Buenos Aires",
    // avg ≈ 4.8
    reviews: [
      { rating: 5, content: "El ITBA tiene una relación muy fuerte con la industria. Hice una pasantía desde tercer año gracias a contactos de la facu.", authorName: "Federico L." },
      { rating: 5, content: "Exigente pero con un nivel de seguimiento docente que no encontré en otras universidades. Grupos chicos, mucho contacto directo.", authorName: "Julieta N." },
      { rating: 5, content: "La currícula está muy actualizada, sobre todo en las áreas de tecnología. Egresás con herramientas que el mercado pide hoy.", authorName: "Bruno T." },
      { rating: 4, content: "El costo es alto, pero hay becas y el retorno en salida laboral lo justifica bastante rápido.", authorName: "Agustina V." },
      { rating: 5, content: "El networking con egresados es un plus enorme. Muchos profesores son también referentes de la industria.", authorName: "Joaquín B." },
    ],
  },
  {
    universityName: "Universidad Torcuato Di Tella",
    // avg ≈ 4.9
    reviews: [
      { rating: 5, content: "Grupos reducidos, profesores con doctorados en universidades top del mundo y una formación muy rigurosa en lo cuantitativo.", authorName: "Manuel C." },
      { rating: 5, content: "La calidad del cuerpo docente es excepcional. Se nota el nivel de investigación que hay detrás de cada cátedra.", authorName: "Catalina H." },
      { rating: 5, content: "Es cara, pero la inversión se siente justificada por la salida laboral y el prestigio del título en el ámbito privado.", authorName: "Nicolás D." },
      { rating: 4, content: "El campus es chico comparado con universidades públicas, pero la cercanía con los docentes compensa de sobra.", authorName: "Renata O." },
    ],
  },
  {
    universityName: "Universidad de San Andrés",
    // avg ≈ 4.8
    reviews: [
      { rating: 5, content: "La formación interdisciplinaria es el gran diferencial. Te exigen pensar críticamente desde el primer cuatrimestre.", authorName: "Pedro I." },
      { rating: 5, content: "Profesores accesibles, clases de pocos alumnos y una comunidad académica muy comprometida con la calidad educativa.", authorName: "Lola E." },
      { rating: 4, content: "Es una burbuja en términos de costo, pero el nivel de discusión en clase no lo encontré en ningún otro lado.", authorName: "Simón W." },
      { rating: 5, content: "Excelente para quien busca una experiencia universitaria con mucho contacto humano y rigor académico.", authorName: "Abril Q." },
    ],
  },
  {
    universityName: "Pontificia Universidad Católica Argentina Santa María de los Buenos Aires",
    // avg ≈ 4.2
    reviews: [
      { rating: 4, content: "Buen nivel académico y una formación que también pone foco en lo humano, no solo lo técnico.", authorName: "Mariano K." },
      { rating: 4, content: "Las instalaciones de Puerto Madero son muy buenas. El cuerpo docente es sólido en general.", authorName: "Carla Z." },
      { rating: 5, content: "Me sentí muy acompañado durante toda la carrera. Hay mucho seguimiento académico individual.", authorName: "Esteban Y." },
      { rating: 4, content: "El arancel es elevado pero hay buen sistema de becas. La salida laboral en mi área fue rápida.", authorName: "Milagros J." },
    ],
  },
  {
    universityName: "Universidad Tecnológica Nacional",
    // avg ≈ 4.0
    reviews: [
      { rating: 4, content: "Muy orientada a la práctica, ideal si querés salir con herramientas concretas para trabajar en la industria.", authorName: "Diego U." },
      { rating: 4, content: "Pública y con sedes en todo el país, lo que es un golazo si no podés mudarte a una gran ciudad.", authorName: "Florencia X." },
      { rating: 3, content: "El ritmo es exigente y las cursadas son largas, pero el título tiene buena reputación en el sector industrial.", authorName: "Hernán V." },
      { rating: 4, content: "Buenos laboratorios y convenios con empresas para prácticas profesionales. Se nota el enfoque aplicado.", authorName: "Romina T." },
      { rating: 4, content: "Algunas sedes están mejor equipadas que otras, pero en general la formación técnica es muy completa.", authorName: "Alejo S." },
    ],
  },
  {
    universityName: "Universidad Argentina de la Empresa",
    // avg ≈ 3.8
    reviews: [
      { rating: 4, content: "Buena relación con el mundo corporativo, muchas charlas con egresados que ya están trabajando en empresas grandes.", authorName: "Brenda R." },
      { rating: 4, content: "Las carreras de diseño y negocios tienen muy buen nivel y orientación práctica.", authorName: "Gastón Ñ." },
      { rating: 3, content: "Es una universidad masiva dentro de lo privado, así que el contacto con los profesores varía según la materia.", authorName: "Paula M." },
      { rating: 4, content: "Buena infraestructura y horarios flexibles, ideal para compatibilizar con un trabajo.", authorName: "Cristian L." },
    ],
  },
  {
    universityName: "Universidad Nacional de Córdoba",
    // avg ≈ 3.9
    reviews: [
      { rating: 4, content: "Tradición académica enorme, sobre todo en carreras de ciencias y humanidades. Muy buena vida universitaria en general.", authorName: "Yamila K." },
      { rating: 4, content: "Pública y de gran nivel, aunque la masividad hace que en los primeros años cueste el seguimiento personalizado.", authorName: "Franco H." },
      { rating: 3, content: "Los trámites administrativos pueden demorar, pero el cuerpo docente en general es muy bueno.", authorName: "Daniela G." },
      { rating: 4, content: "Córdoba como ciudad universitaria suma mucho a la experiencia, más allá de la carrera elegida.", authorName: "Matías F." },
    ],
  },
];

// ─── Reseñas de carreras ───────────────────────────────────────────────────────
// 2 carreras reales por área (Ciencias Aplicadas, Básicas, de la Salud,
// Humanas, Sociales), todas confirmadas presentes en data/siu-careers.json en
// estas universidades exactas. "Sin Rama" (catch-all sin clasificar) se deja
// afuera a propósito — no tiene carreras representativas para este propósito.

const CAREER_REVIEWS: CareerReviewSeed[] = [
  // ── Ciencias Aplicadas ──────────────────────────────────────────────────────
  {
    universityName: "Universidad Tecnológica Nacional",
    careerName: "Ingeniero Civil",
    // avg ≈ 3.6
    reviews: [
      { rating: 4, content: "Carrera muy completa en estructuras y obras. El nivel de exigencia matemática es alto desde el primer año.", authorName: "Walter D." },
      { rating: 3, content: "Es larga y demandante, pero la salida laboral en construcción e infraestructura es muy buena.", authorName: "Noelia B." },
      { rating: 4, content: "Buenos laboratorios de materiales y prácticas reales en obra. Se nota el perfil aplicado de la UTN.", authorName: "Ezequiel R." },
      { rating: 3, content: "Cursada pesada combinada con trabajo no es fácil, pero es la realidad de la mayoría de mis compañeros.", authorName: "Ailén C." },
    ],
  },
  {
    universityName: "Instituto Tecnológico de Buenos Aires",
    careerName: "Ingeniero/a Civil",
    // avg ≈ 4.8
    reviews: [
      { rating: 5, content: "El enfoque en gestión de proyectos junto con lo estructural te deja muy bien parado para liderar obras grandes.", authorName: "Santiago M." },
      { rating: 5, content: "Profesores que además ejercen en estudios de ingeniería reconocidos. La currícula está muy conectada con la práctica real.", authorName: "Constanza P." },
      { rating: 5, content: "Salí con varias ofertas de trabajo antes de graduarme. El nombre del ITBA pesa mucho en las entrevistas.", authorName: "Tobías N." },
      { rating: 4, content: "Exigente en matemática y física, pero el acompañamiento docente hace que sea muy llevadero.", authorName: "Delfina A." },
    ],
  },

  // ── Ciencias Básicas ────────────────────────────────────────────────────────
  {
    universityName: "Universidad de Buenos Aires",
    careerName: "Licenciado en Ciencias Biológicas",
    // avg ≈ 4.6
    reviews: [
      { rating: 5, content: "Acceso a laboratorios de investigación de nivel internacional desde los primeros años. Una experiencia formativa enorme.", authorName: "Guadalupe S." },
      { rating: 5, content: "Docentes que son referentes en sus campos, muchos vinculados al CONICET. Se aprende ciencia de verdad, no solo de los libros.", authorName: "Iván T." },
      { rating: 4, content: "Es una carrera larga y con mucha carga horaria de prácticas, pero la formación es excelente.", authorName: "Ornella V." },
      { rating: 5, content: "Para quien quiere dedicarse a investigación, es de las mejores opciones del país sin dudas.", authorName: "Maximiliano L." },
    ],
  },
  {
    universityName: "Universidad Nacional de Córdoba",
    careerName: "Licenciado/a en Química",
    // avg ≈ 3.8
    reviews: [
      { rating: 4, content: "Buen nivel en química analítica y orgánica. Los laboratorios podrían estar mejor equipados, pero se aprende bien.", authorName: "Brisa O." },
      { rating: 4, content: "La planta docente tiene mucha experiencia. La carrera prepara bien tanto para industria como para investigación.", authorName: "Leandro G." },
      { rating: 3, content: "Es exigente y algo burocrática para conseguir turnos de laboratorio, pero el contenido vale la pena.", authorName: "Yésica F." },
    ],
  },

  // ── Ciencias de la Salud ────────────────────────────────────────────────────
  {
    universityName: "Universidad de Buenos Aires",
    careerName: "Licenciado en Enfermería",
    // avg ≈ 4.5
    reviews: [
      { rating: 5, content: "La práctica hospitalaria empieza temprano y es muy completa. Salís con experiencia clínica real.", authorName: "Rocío M." },
      { rating: 4, content: "Carrera exigente en lo físico y emocional, pero la formación humana que te da no la encontrás en cualquier lado.", authorName: "Cristian A." },
      { rating: 5, content: "Docentes con mucha trayectoria hospitalaria. El título de la UBA es muy bien valorado en el sistema de salud.", authorName: "Lourdes P." },
      { rating: 4, content: "Buena combinación de teoría y práctica, aunque la cursada en hospitales públicos puede ser caótica a veces.", authorName: "Maximiliano R." },
    ],
  },
  {
    universityName: "Pontificia Universidad Católica Argentina Santa María de los Buenos Aires",
    careerName: "Médico",
    // avg ≈ 4.7
    reviews: [
      { rating: 5, content: "Formación clínica muy ordenada, con rotaciones en hospitales de buen nivel desde los primeros años de práctica.", authorName: "Eugenia C." },
      { rating: 5, content: "El cuerpo docente combina investigación y práctica clínica activa. Se nota el nivel en cada materia.", authorName: "Fernando D." },
      { rating: 4, content: "Es una carrera larga y costosa, pero el acompañamiento académico es constante durante todo el trayecto.", authorName: "Antonella H." },
      { rating: 5, content: "Salí muy bien preparado para residencias médicas competitivas. El nombre de la facultad ayuda en las entrevistas.", authorName: "Joaquín B." },
    ],
  },

  // ── Ciencias Humanas ────────────────────────────────────────────────────────
  {
    universityName: "Universidad de Buenos Aires",
    careerName: "Licenciado en Psicología",
    // avg ≈ 4.6
    reviews: [
      { rating: 5, content: "La tradición psicoanalítica de la facultad es muy fuerte y reconocida en toda Latinoamérica.", authorName: "Julia M." },
      { rating: 4, content: "Buen nivel académico, aunque hay poca variedad de corrientes teóricas más allá del psicoanálisis.", authorName: "Ignacio T." },
      { rating: 5, content: "El plan de estudios es denso pero muy completo. Las prácticas clínicas finales son una experiencia clave.", authorName: "Clara P." },
      { rating: 4, content: "Masiva como toda carrera de la UBA, pero los docentes de cátedra suelen ser muy buenos.", authorName: "Bruno K." },
    ],
  },
  {
    universityName: "Universidad de San Andrés",
    careerName: "Licenciado en Humanidades",
    // avg ≈ 4.4
    reviews: [
      { rating: 5, content: "La currícula interdisciplinaria entre filosofía, historia y letras es un diferencial enorme frente a otras universidades.", authorName: "Olivia R." },
      { rating: 4, content: "Grupos chicos que permiten un nivel de debate en clase muy superior al de carreras masivas.", authorName: "Tomás F." },
      { rating: 4, content: "Es costosa, pero el acompañamiento docente y la calidad de las lecturas asignadas son excelentes.", authorName: "Valeria N." },
    ],
  },

  // ── Ciencias Sociales ───────────────────────────────────────────────────────
  {
    universityName: "Universidad de Buenos Aires",
    careerName: "Abogado",
    // avg ≈ 4.6
    reviews: [
      { rating: 5, content: "La Facultad de Derecho de la UBA tiene un peso simbólico enorme en el mundo jurídico argentino.", authorName: "Florencia D." },
      { rating: 4, content: "Formación teórica muy sólida que te prepara para pensar críticamente el derecho, no solo aplicarlo.", authorName: "Matías H." },
      { rating: 5, content: "Salí con una base jurídica muy completa, muy valorada tanto en estudios privados como en el sector público.", authorName: "Emilio Ñ." },
      { rating: 4, content: "La masividad es un desafío real, pero los mejores profesores son muy accesibles en sus horarios de consulta.", authorName: "Soledad R." },
    ],
  },
  {
    universityName: "Universidad Torcuato Di Tella",
    careerName: "Licenciado/a en Administración de Empresas",
    // avg ≈ 4.9
    reviews: [
      { rating: 5, content: "Formación muy fuerte en finanzas y estrategia, con docentes que combinan academia con experiencia real en empresas.", authorName: "Bautista L." },
      { rating: 5, content: "El networking con egresados que ya ocupan puestos gerenciales es un activo enorme para el primer empleo.", authorName: "Ariadna S." },
      { rating: 5, content: "Grupos reducidos y mucho trabajo en casos reales. Se nota la diferencia frente a programas más masivos.", authorName: "Felipe V." },
      { rating: 4, content: "Es de las más caras del país, pero la salida laboral en consultoría y finanzas justifica la inversión.", authorName: "Mía Z." },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Limpiando reseñas existentes...");
  await prisma.careerReview.deleteMany();
  await prisma.universityReview.deleteMany();

  const allUniversities = await prisma.university.findMany({ select: { id: true, name: true } });
  const uniByName = new Map(allUniversities.map((u) => [u.name, u]));

  const allCareers = await prisma.career.findMany({
    select: { id: true, name: true, universityId: true },
  });

  console.log("\nCreando reseñas de universidades...");
  let uniReviewCount = 0;
  for (const entry of UNIVERSITY_REVIEWS) {
    const uni = uniByName.get(entry.universityName);
    if (!uni) {
      console.warn(`  ⚠ Universidad no encontrada: ${entry.universityName}`);
      continue;
    }
    for (const review of entry.reviews) {
      await prisma.universityReview.create({ data: { ...review, universityId: uni.id } });
    }
    uniReviewCount += entry.reviews.length;
  }

  console.log("Creando reseñas de carreras...");
  let careerReviewCount = 0;
  for (const entry of CAREER_REVIEWS) {
    const uni = uniByName.get(entry.universityName);
    if (!uni) {
      console.warn(`  ⚠ Universidad no encontrada: ${entry.universityName}`);
      continue;
    }
    const career = allCareers.find((c) => c.universityId === uni.id && c.name === entry.careerName);
    if (!career) {
      console.warn(`  ⚠ Carrera no encontrada: ${entry.universityName} / ${entry.careerName}`);
      continue;
    }
    for (const review of entry.reviews) {
      await prisma.careerReview.create({ data: { ...review, careerId: career.id } });
    }
    careerReviewCount += entry.reviews.length;
  }

  console.log(`\n✓ ${uniReviewCount} reseñas de universidad y ${careerReviewCount} de carrera creadas.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

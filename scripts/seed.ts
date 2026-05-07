import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Limpiando datos existentes...");
  await prisma.careerReview.deleteMany();
  await prisma.universityReview.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.career.deleteMany();
  await prisma.area.deleteMany();
  await prisma.university.deleteMany();

  console.log("Creando áreas...");
  const areas = await Promise.all([
    prisma.area.create({ data: { name: "Ingeniería y Tecnología" } }),
    prisma.area.create({ data: { name: "Ciencias de la Salud" } }),
    prisma.area.create({ data: { name: "Ciencias Económicas" } }),
    prisma.area.create({ data: { name: "Derecho y Ciencias Sociales" } }),
    prisma.area.create({ data: { name: "Humanidades y Artes" } }),
    prisma.area.create({ data: { name: "Ciencias Exactas y Naturales" } }),
    prisma.area.create({ data: { name: "Arquitectura y Diseño" } }),
    prisma.area.create({ data: { name: "Comunicación y Periodismo" } }),
  ]);

  const [
    areaIngenieria,
    areaSalud,
    areaEconomia,
    areaDerecho,
    areaHumanidades,
    areaCiencias,
    areaArquitectura,
    areaComunicacion,
  ] = areas;

  console.log("Creando universidades...");
  const universities = await Promise.all([
    prisma.university.create({
      data: {
        name: "Universidad de Buenos Aires",
        city: "Buenos Aires",
        province: "Buenos Aires",
        type: "PUBLIC",
        website: "https://www.uba.ar",
        foundedYear: 1821,
        description:
          "La UBA es la universidad más grande de Argentina y una de las más prestigiosas de América Latina. Cuenta con 13 facultades y ofrece más de 100 carreras de grado.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad Nacional de La Plata",
        city: "La Plata",
        province: "Buenos Aires",
        type: "PUBLIC",
        website: "https://www.unlp.edu.ar",
        foundedYear: 1897,
        description:
          "La UNLP es una de las universidades nacionales más importantes del país, reconocida por su excelencia académica y su fuerte vínculo con la comunidad.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad Nacional de Córdoba",
        city: "Córdoba",
        province: "Córdoba",
        type: "PUBLIC",
        website: "https://www.unc.edu.ar",
        foundedYear: 1613,
        description:
          "La UNC es la universidad más antigua de Argentina y una de las más antiguas de América Latina. Fue cuna de la Reforma Universitaria de 1918.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad Tecnológica Nacional",
        city: "Buenos Aires",
        province: "Buenos Aires",
        type: "PUBLIC",
        website: "https://www.utn.edu.ar",
        foundedYear: 1948,
        description:
          "La UTN es la única universidad nacional dedicada exclusivamente a la educación tecnológica, con presencia en todo el país a través de sus facultades regionales.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad Nacional de Rosario",
        city: "Rosario",
        province: "Santa Fe",
        type: "PUBLIC",
        website: "https://www.unr.edu.ar",
        foundedYear: 1968,
        description:
          "La UNR es la segunda universidad nacional más grande del país, con doce facultades y una amplia oferta académica en la ciudad de Rosario.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad de San Andrés",
        city: "Victoria",
        province: "Buenos Aires",
        type: "PRIVATE",
        website: "https://www.udesa.edu.ar",
        foundedYear: 1988,
        description:
          "UDESA es una universidad privada de élite reconocida por la calidad de sus programas de negocios, derecho y ciencias sociales.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad Torcuato Di Tella",
        city: "Buenos Aires",
        province: "Buenos Aires",
        type: "PRIVATE",
        website: "https://www.utdt.edu",
        foundedYear: 1991,
        description:
          "La Di Tella es una universidad privada con fuerte énfasis en la investigación y la innovación, reconocida por sus programas de economía, derecho y administración.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Pontificia Universidad Católica Argentina",
        city: "Buenos Aires",
        province: "Buenos Aires",
        type: "PRIVATE",
        website: "https://www.uca.edu.ar",
        foundedYear: 1958,
        description:
          "La UCA es la universidad católica más importante de Argentina, con una sólida formación en valores y excelencia académica en diversas disciplinas.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad Nacional de Tucumán",
        city: "San Miguel de Tucumán",
        province: "Tucumán",
        type: "PUBLIC",
        website: "https://www.unt.edu.ar",
        foundedYear: 1914,
        description:
          "La UNT es la principal institución educativa del noroeste argentino, con una destacada trayectoria en ciencias exactas, ingeniería y ciencias de la salud.",
      },
    }),
    prisma.university.create({
      data: {
        name: "Universidad Nacional de Mar del Plata",
        city: "Mar del Plata",
        province: "Buenos Aires",
        type: "PUBLIC",
        website: "https://www.mdp.edu.ar",
        foundedYear: 1961,
        description:
          "La UNMdP es la universidad nacional más importante de la costa bonaerense, con gran fortaleza en ciencias exactas, humanidades y ciencias de la salud.",
      },
    }),
  ]);

  const [uba, unlp, unc, utn, unr, udesa, utdt, uca, unt, unmdp] =
    universities;

  console.log("Creando carreras...");
  const careers = await Promise.all([
    // UBA
    prisma.career.create({
      data: {
        name: "Medicina",
        durationYears: 6,
        degreeTitle: "Médico/a",
        modality: "PRESENCIAL",
        description:
          "La carrera de Medicina de la UBA es una de las más exigentes y reconocidas del país, formando profesionales con sólidos conocimientos científicos y compromiso social.",
        studentCount: 28500,
        universityId: uba.id,
        areaId: areaSalud.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Abogacía",
        durationYears: 5,
        degreeTitle: "Abogado/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Derecho de la UBA forma abogados con una sólida formación jurídica y conciencia crítica sobre el rol del derecho en la sociedad.",
        studentCount: 31200,
        universityId: uba.id,
        areaId: areaDerecho.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Ingeniería en Computación",
        durationYears: 5,
        degreeTitle: "Ingeniero/a en Computación",
        modality: "PRESENCIAL",
        description:
          "La carrera de Ingeniería en Computación del FIUBA forma profesionales con profundos conocimientos en hardware, software y sistemas computacionales.",
        studentCount: 4800,
        universityId: uba.id,
        areaId: areaIngenieria.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Psicología",
        durationYears: 5,
        degreeTitle: "Licenciado/a en Psicología",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Psicología de la UBA es la más grande de habla hispana, con una fuerte tradición psicoanalítica y una formación clínica de excelencia.",
        studentCount: 22000,
        universityId: uba.id,
        areaId: areaHumanidades.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Contador Público",
        durationYears: 5,
        degreeTitle: "Contador/a Público/a",
        modality: "PRESENCIAL",
        description:
          "La carrera de Contador Público de la UBA forma profesionales con amplios conocimientos en contabilidad, finanzas e impuestos.",
        studentCount: 18400,
        universityId: uba.id,
        areaId: areaEconomia.id,
      },
    }),
    // UNLP
    prisma.career.create({
      data: {
        name: "Ingeniería en Sistemas",
        durationYears: 5,
        degreeTitle: "Ingeniero/a en Sistemas",
        modality: "PRESENCIAL",
        description:
          "La carrera de Ingeniería en Sistemas de la UNLP forma profesionales con amplia capacidad para diseñar, desarrollar e implementar soluciones informáticas.",
        studentCount: 6200,
        universityId: unlp.id,
        areaId: areaIngenieria.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Arquitectura",
        durationYears: 6,
        degreeTitle: "Arquitecto/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Arquitectura y Urbanismo de la UNLP tiene una destacada trayectoria en la formación de arquitectos con visión urbana y social.",
        studentCount: 5800,
        universityId: unlp.id,
        areaId: areaArquitectura.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Medicina Veterinaria",
        durationYears: 6,
        degreeTitle: "Médico/a Veterinario/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Ciencias Veterinarias de la UNLP es una de las más reconocidas del país, con fuerte énfasis en sanidad animal y producción agropecuaria.",
        studentCount: 4200,
        universityId: unlp.id,
        areaId: areaSalud.id,
      },
    }),
    // UNC
    prisma.career.create({
      data: {
        name: "Medicina",
        durationYears: 6,
        degreeTitle: "Médico/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Ciencias Médicas de la UNC cuenta con una de las tradiciones más largas en formación médica del país, con hospitales universitarios propios.",
        studentCount: 12000,
        universityId: unc.id,
        areaId: areaSalud.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Abogacía",
        durationYears: 5,
        degreeTitle: "Abogado/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Derecho y Ciencias Sociales de la UNC es cuna de destacados juristas argentinos y tiene una fuerte vocación por los derechos humanos.",
        studentCount: 9500,
        universityId: unc.id,
        areaId: areaDerecho.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Ingeniería Industrial",
        durationYears: 5,
        degreeTitle: "Ingeniero/a Industrial",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Ciencias Exactas, Físicas y Naturales de la UNC forma ingenieros industriales con sólida base científica y técnica.",
        studentCount: 3800,
        universityId: unc.id,
        areaId: areaIngenieria.id,
      },
    }),
    // UTN
    prisma.career.create({
      data: {
        name: "Ingeniería en Sistemas de Información",
        durationYears: 5,
        degreeTitle: "Ingeniero/a en Sistemas de Información",
        modality: "PRESENCIAL",
        description:
          "Una de las carreras más demandadas del mercado laboral argentino, orientada al desarrollo de software, bases de datos y gestión de sistemas.",
        studentCount: 15000,
        universityId: utn.id,
        areaId: areaIngenieria.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Ingeniería Electrónica",
        durationYears: 5,
        degreeTitle: "Ingeniero/a Electrónico/a",
        modality: "PRESENCIAL",
        description:
          "Carrera orientada al diseño y desarrollo de sistemas electrónicos, telecomunicaciones y automatización industrial.",
        studentCount: 6800,
        universityId: utn.id,
        areaId: areaIngenieria.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Ingeniería Civil",
        durationYears: 5,
        degreeTitle: "Ingeniero/a Civil",
        modality: "PRESENCIAL",
        description:
          "Formación integral en diseño y construcción de infraestructuras, con fuerte orientación al desarrollo urbano y territorial.",
        studentCount: 5200,
        universityId: utn.id,
        areaId: areaIngenieria.id,
      },
    }),
    // UNR
    prisma.career.create({
      data: {
        name: "Medicina",
        durationYears: 6,
        degreeTitle: "Médico/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Ciencias Médicas de la UNR forma médicos con una sólida base clínica y compromiso con la salud pública de la región.",
        studentCount: 8900,
        universityId: unr.id,
        areaId: areaSalud.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Arquitectura",
        durationYears: 5,
        degreeTitle: "Arquitecto/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Arquitectura, Planeamiento y Diseño de la UNR es reconocida por su enfoque experimental y vanguardista en el diseño arquitectónico.",
        studentCount: 4500,
        universityId: unr.id,
        areaId: areaArquitectura.id,
      },
    }),
    // UDESA
    prisma.career.create({
      data: {
        name: "Administración de Empresas",
        durationYears: 4,
        degreeTitle: "Licenciado/a en Administración de Empresas",
        modality: "PRESENCIAL",
        description:
          "Programa de excelencia internacional con fuerte énfasis en liderazgo, estrategia e innovación empresarial.",
        studentCount: 1800,
        universityId: udesa.id,
        areaId: areaEconomia.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Economía",
        durationYears: 4,
        degreeTitle: "Licenciado/a en Economía",
        modality: "PRESENCIAL",
        description:
          "Carrera con fuerte rigor matemático y econométrico, orientada a la investigación y a los mercados financieros internacionales.",
        studentCount: 900,
        universityId: udesa.id,
        areaId: areaEconomia.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Abogacía",
        durationYears: 5,
        degreeTitle: "Abogado/a",
        modality: "PRESENCIAL",
        description:
          "Programa de derecho con enfoque internacional y énfasis en derecho corporativo, arbitraje y litigación estratégica.",
        studentCount: 700,
        universityId: udesa.id,
        areaId: areaDerecho.id,
      },
    }),
    // UTDT
    prisma.career.create({
      data: {
        name: "Ingeniería Informática",
        durationYears: 4,
        degreeTitle: "Ingeniero/a Informático/a",
        modality: "PRESENCIAL",
        description:
          "Carrera orientada al desarrollo de software con foco en innovación tecnológica, startups y mercado global.",
        studentCount: 1200,
        universityId: utdt.id,
        areaId: areaIngenieria.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Economía Empresarial",
        durationYears: 4,
        degreeTitle: "Licenciado/a en Economía Empresarial",
        modality: "PRESENCIAL",
        description:
          "Programa que combina economía, negocios y análisis cuantitativo con una perspectiva global y orientación al mercado laboral de alta demanda.",
        studentCount: 1100,
        universityId: utdt.id,
        areaId: areaEconomia.id,
      },
    }),
    // UCA
    prisma.career.create({
      data: {
        name: "Derecho",
        durationYears: 5,
        degreeTitle: "Abogado/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Derecho de la UCA forma juristas con sólida formación en derecho natural, derechos humanos y ética profesional.",
        studentCount: 3200,
        universityId: uca.id,
        areaId: areaDerecho.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Comunicación Social",
        durationYears: 4,
        degreeTitle: "Licenciado/a en Comunicación Social",
        modality: "HIBRIDO",
        description:
          "Carrera que forma comunicadores con sólidos conocimientos en periodismo, comunicación institucional y medios digitales.",
        studentCount: 2400,
        universityId: uca.id,
        areaId: areaComunicacion.id,
      },
    }),
    // UNT
    prisma.career.create({
      data: {
        name: "Ingeniería Agronómica",
        durationYears: 5,
        degreeTitle: "Ingeniero/a Agrónomo/a",
        modality: "PRESENCIAL",
        description:
          "Carrera orientada al desarrollo sustentable del agro del noroeste argentino, con énfasis en cultivos regionales como la caña de azúcar y los cítricos.",
        studentCount: 2800,
        universityId: unt.id,
        areaId: areaIngenieria.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Odontología",
        durationYears: 5,
        degreeTitle: "Odontólogo/a",
        modality: "PRESENCIAL",
        description:
          "La Facultad de Odontología de la UNT es referente regional en salud bucal, con clínicas propias y atención a la comunidad.",
        studentCount: 2100,
        universityId: unt.id,
        areaId: areaSalud.id,
      },
    }),
    // UNMDP
    prisma.career.create({
      data: {
        name: "Licenciatura en Turismo",
        durationYears: 4,
        degreeTitle: "Licenciado/a en Turismo",
        modality: "PRESENCIAL",
        description:
          "Carrera orientada a la gestión turística en contextos costeros y de naturaleza, con Mar del Plata como laboratorio natural.",
        studentCount: 1600,
        universityId: unmdp.id,
        areaId: areaEconomia.id,
      },
    }),
    prisma.career.create({
      data: {
        name: "Biología Marina",
        durationYears: 5,
        degreeTitle: "Licenciado/a en Biología Marina",
        modality: "PRESENCIAL",
        description:
          "Una de las pocas carreras de Biología Marina del país, con acceso único al ecosistema del Atlántico Sur y a centros de investigación del CONICET.",
        studentCount: 800,
        universityId: unmdp.id,
        areaId: areaCiencias.id,
      },
    }),
  ]);

  console.log("Creando reseñas...");
  const reviewsData = [
    {
      careerId: careers[0].id, // UBA Medicina
      reviews: [
        { rating: 5, content: "Carrera muy exigente pero la formación es increíble. Los hospitales universitarios dan una experiencia clínica difícil de superar.", authorName: "Martina R." },
        { rating: 4, content: "Excelente nivel académico, aunque la infraestructura a veces deja que desear. Los profesores son muy comprometidos.", authorName: "Lucas P." },
      ],
    },
    {
      careerId: careers[5].id, // UNLP Sistemas
      reviews: [
        { rating: 5, content: "Muy buen nivel técnico. La facultad tiene convenios con empresas que permiten inserción laboral rápida.", authorName: "Diego F." },
        { rating: 4, content: "Plan de estudio sólido, con buen equilibrio entre teoría y práctica. La comunidad de estudiantes es muy activa.", authorName: "Sol M." },
      ],
    },
    {
      careerId: careers[11].id, // UTN ISI
      reviews: [
        { rating: 5, content: "La mejor relación calidad-precio del sistema universitario. Muy valorada por las empresas de tecnología.", authorName: "Tomás L." },
        { rating: 4, content: "Mucha demanda laboral antes de recibirte. Algunos profesores trabajan en la industria lo que enriquece las clases.", authorName: "Camila B." },
        { rating: 3, content: "La carga horaria es muy alta. Hay que organizarse bien para no atrasarse.", authorName: "Gonzalo S." },
      ],
    },
    {
      careerId: careers[19].id, // UTDT Ingeniería Informática
      reviews: [
        { rating: 5, content: "El ambiente es muy internacional y los profesores son investigadores activos. Muy buena para quienes quieren ir al exterior.", authorName: "Valentina K." },
        { rating: 5, content: "Excelente networking y conexión con el ecosistema emprendedor. Salí con ofertas de trabajo antes de recibirme.", authorName: "Nicolás A." },
      ],
    },
    {
      careerId: careers[26].id, // UNMDP Biología Marina
      reviews: [
        { rating: 5, content: "Una carrera única en el país. El contacto con el mar y los institutos del CONICET es una experiencia que no se encuentra en otra universidad.", authorName: "Florencia V." },
        { rating: 4, content: "Pequeña pero muy especializada. Los docentes son investigadores activos y te involucran en proyectos desde el primer año.", authorName: "Matías C." },
      ],
    },
  ];

  for (const { careerId, reviews } of reviewsData) {
    for (const review of reviews) {
      await prisma.careerReview.create({ data: { ...review, careerId } });
    }
  }

  const universityReviewsData = [
    {
      universityId: uba.id,
      reviews: [
        { rating: 5, content: "La mejor universidad pública de Argentina. El nivel académico es comparable con las mejores del mundo.", authorName: "Ana G." },
        { rating: 4, content: "Gran diversidad de carreras y docentes de primer nivel. La masividad es un desafío pero también una experiencia de vida.", authorName: "Roberto M." },
      ],
    },
    {
      universityId: utn.id,
      reviews: [
        { rating: 5, content: "La UTN tiene presencia en todo el país y sus títulos son muy respetados por la industria.", authorName: "Hernán D." },
        { rating: 4, content: "Muy orientada al mercado laboral. Desde segundo año hay empresas que te ofrecen pasantías.", authorName: "Laura T." },
      ],
    },
  ];

  for (const { universityId, reviews } of universityReviewsData) {
    for (const review of reviews) {
      await prisma.universityReview.create({ data: { ...review, universityId } });
    }
  }

  console.log("\n✓ Seed completado:");
  console.log(`  - ${areas.length} áreas`);
  console.log(`  - ${universities.length} universidades`);
  console.log(`  - ${careers.length} carreras`);
  console.log(`  - ${reviewsData.reduce((a, r) => a + r.reviews.length, 0) + universityReviewsData.reduce((a, r) => a + r.reviews.length, 0)} reseñas`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

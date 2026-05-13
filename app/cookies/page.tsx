export const metadata = {
  title: 'Política de Cookies — Buscador de Carreras',
}

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10 space-y-10">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-3xl font-bold">Política de Cookies</h1>
        <p className="text-sm text-muted-foreground">Última actualización: mayo de 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">¿Qué son las cookies?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Las cookies son pequeños archivos de texto que un sitio web almacena en su navegador cuando lo visita.
          Permiten que el sitio recuerde información sobre su visita para mejorar la experiencia de uso.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Existen distintos tipos de cookies según su finalidad: técnicas (necesarias para el funcionamiento
          del sitio), analíticas (miden el uso), publicitarias (gestionan anuncios), entre otras.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cookies propias que utilizamos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Este sitio utiliza una única cookie propia, de carácter estrictamente técnico:
        </p>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Finalidad</th>
                <th className="text-left px-4 py-3 font-medium">Duración</th>
                <th className="text-left px-4 py-3 font-medium">Datos personales</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 font-mono text-xs">sidebar_state</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Guarda si el menú lateral está expandido o contraído para mantener su preferencia de visualización.
                </td>
                <td className="px-4 py-3 text-muted-foreground">7 días</td>
                <td className="px-4 py-3 text-muted-foreground">No</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Esta cookie no contiene datos personales y no se utiliza para fines de seguimiento ni publicidad.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Almacenamiento local (localStorage)</h2>
        <p className="text-muted-foreground leading-relaxed">
          Además de cookies, este sitio utiliza el almacenamiento local del navegador (<code className="font-mono text-sm bg-muted px-1 rounded">localStorage</code>)
          para guardar sus preferencias de forma temporal. A diferencia de las cookies, esta información
          <strong> no se envía a nuestros servidores</strong> con cada solicitud y permanece únicamente en su dispositivo.
        </p>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Clave</th>
                <th className="text-left px-4 py-3 font-medium">Contenido</th>
                <th className="text-left px-4 py-3 font-medium">Cuándo se usa</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 font-mono text-xs">mis-carreras</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Lista de IDs de carreras que guardó para revisar más tarde.
                </td>
                <td className="px-4 py-3 text-muted-foreground">Al guardar una carrera desde el explorador.</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-3 font-mono text-xs">compare-careers</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Lista de IDs de carreras seleccionadas para comparar (máximo 4).
                </td>
                <td className="px-4 py-3 text-muted-foreground">Al usar la herramienta de comparación.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Puede eliminar estos datos en cualquier momento borrando los datos del sitio desde la configuración
          de su navegador (generalmente en Configuración → Privacidad → Datos del sitio).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cookies de la plataforma de alojamiento</h2>
        <p className="text-muted-foreground leading-relaxed">
          Nuestra plataforma de alojamiento e infraestructura puede establecer cookies técnicas propias con
          fines de rendimiento, seguridad y análisis de uso. Estas cookies son responsabilidad exclusiva de
          dicho proveedor y están sujetas a su propia política de privacidad. No tenemos control directo
          sobre ellas.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cómo gestionar o deshabilitar las cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Puede configurar su navegador para aceptar, bloquear o eliminar las cookies instaladas en su
          equipo. Tenga en cuenta que bloquear la cookie de preferencias del menú lateral puede afectar la
          experiencia de navegación del sitio.
        </p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/es-es/HT201265"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Safari (Apple)
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Más información</h2>
        <p className="text-muted-foreground leading-relaxed">
          Para más información sobre cómo tratamos sus datos personales, consulte nuestra{" "}
          <a href="/privacidad" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Política de Privacidad
          </a>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Esta política de cookies está regulada por la{" "}
          <a
            href="https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/norma.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Ley 25.326 de Protección de Datos Personales
          </a>{" "}
          de la República Argentina.
        </p>
      </section>
    </div>
  )
}

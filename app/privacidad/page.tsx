export const metadata = {
  title: 'Política de Privacidad — Buscador de Carreras',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10 space-y-10">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: mayo de 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Quiénes somos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Buscador de Carreras es una plataforma de información sobre carreras universitarias en Argentina.
          Permite explorar y comparar carreras e instituciones universitarias.
          Este sitio no cuenta con fines comerciales y no persigue lucro de ningún tipo.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Qué información recopilamos</h2>

        <div className="space-y-2">
          <h3 className="font-medium">Información que usted proporciona voluntariamente</h3>
          <p className="text-muted-foreground leading-relaxed">
            Al interactuar con algunas funciones del sitio, puede proporcionarnos información de forma voluntaria:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Publicaciones en Comunidad:</span> contenido del mensaje,
              nombre (opcional), rol o profesión (opcional) y etiquetas temáticas (opcionales).
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            El campo de nombre es siempre opcional. Puede participar de forma completamente anónima en todas
            las funciones del sitio.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Datos técnicos recopilados automáticamente</h3>
          <p className="text-muted-foreground leading-relaxed">
            Nuestra infraestructura de alojamiento recopila automáticamente datos técnicos de acceso al sitio,
            como dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia. Esta información es
            utilizada con fines estadísticos y de rendimiento por nuestro proveedor de infraestructura.
            No tenemos acceso directo a datos personales identificables recopilados por esta vía.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Datos almacenados en su dispositivo (no en nuestros servidores)</h3>
          <p className="text-muted-foreground leading-relaxed">
            Al usar el guardado de carreras o la herramienta de comparación, almacenamos identificadores
            internos en el almacenamiento local de su navegador (<code className="font-mono text-sm bg-muted px-1 rounded">localStorage</code>).
            Estos datos nunca son enviados a nuestros servidores y permanecen únicamente en su dispositivo.
            Puede eliminarlos en cualquier momento borrando los datos del sitio desde la configuración de su navegador.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Qué no hacemos</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>No creamos cuentas de usuario ni solicitamos registro.</li>
          <li>No permitimos la carga de imágenes ni archivos.</li>
          <li>No gestionamos publicidad propia ni de terceros.</li>
          <li>No vendemos, cedemos ni compartimos datos personales con terceros para fines comerciales.</li>
          <li>No utilizamos sistemas propios de analítica o seguimiento de usuarios.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Uso de cookies y almacenamiento local</h2>
        <p className="text-muted-foreground leading-relaxed">
          El sitio utiliza una única cookie técnica y el almacenamiento local del navegador para funciones
          básicas de la interfaz. No se utilizan cookies de seguimiento, publicidad ni analítica propia.
          Consulte nuestra{" "}
          <a href="/cookies" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Política de Cookies
          </a>{" "}
          para más detalle.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cuánto tiempo conservamos los datos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Las publicaciones enviadas voluntariamente se conservan mientras el sitio esté en
          funcionamiento. Los datos almacenados en su dispositivo (localStorage) permanecen hasta que
          usted los elimine desde la configuración de su navegador.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sus derechos sobre sus datos</h2>
        <p className="text-muted-foreground leading-relaxed">
          De acuerdo con la{" "}
          <a
            href="https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/norma.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Ley 25.326 de Protección de Datos Personales
          </a>{" "}
          de la República
          Argentina y su normativa complementaria, usted tiene derecho a acceder, rectificar y eliminar los
          datos personales que haya proporcionado voluntariamente al sitio.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Para solicitar la eliminación de una publicación que haya enviado, puede contactar a los
          administradores del sitio. Procesaremos su solicitud en un plazo razonable.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Respecto a la exportación de sus datos personales: actualmente el sitio no cuenta con una
          herramienta de autoservicio para este fin. De ser necesario, evaluaremos la posibilidad de obtener
          dicha información a través de nuestra plataforma de infraestructura.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cambios a esta política</h2>
        <p className="text-muted-foreground leading-relaxed">
          Podemos actualizar esta Política de Privacidad ocasionalmente. Cualquier cambio significativo será
          comunicado mediante una actualización de la fecha indicada al inicio de este documento.
        </p>
      </section>
    </div>
  )
}

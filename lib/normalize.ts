// Normaliza un texto para comparaciones que deben ignorar mayúsculas/minúsculas
// y tildes. SQLite no tiene collation con folding de acentos, así que la
// comparación se hace en JS. Se usa tanto en las rutas de API (búsqueda) como
// en los scripts de seed (match de nombres de universidades).
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

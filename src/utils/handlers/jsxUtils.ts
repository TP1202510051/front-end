export const normalizeJSX = (raw: string) => {
  let code = raw.trim();

  // Normalizar ComponentWrapper (asegura mayúscula)
  code = code
    .replace(/<\s*componentwrapper/gi, "<ComponentWrapper")
    .replace(/<\/\s*componentwrapper\s*>/gi, "</ComponentWrapper>");

  // Envolver en fragmento si no empieza con <> ni es un nodo válido
  if (!(code.startsWith("<>") || /^<[^/][\s\S]*>[\s\S]*<\/[^>]+>$/.test(code))) {
    code = `<>${code}</>`;
  }

  return code;
};
export const normalizeJSX = (raw: string) => {
  let code = raw.trim();

  code = code
    .replace(/<\s*componentwrapper/gi, "<ComponentWrapper")
    .replace(/<\/\s*componentwrapper\s*>/gi, "</ComponentWrapper>");

  // Si ya empieza con <> o con un único nodo raíz, lo dejas
  if (code.startsWith("<>") || code.startsWith("<ComponentWrapper") || code.startsWith("<div")) {
    return code;
  }

  return `<>${code}</>`;
};

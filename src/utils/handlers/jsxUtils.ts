export const normalizeJSX = (raw: string) => {
  let code = raw.trim();

  code = code
    .replace(/<\s*componentwrapper/gi, "<ComponentWrapper")
    .replace(/<\/\s*componentwrapper\s*>/gi, "</ComponentWrapper>")
    .replace(/\bclass=/g, "className=");

  if (code.startsWith("<>") || code.startsWith("<ComponentWrapper") || code.startsWith("<div")) {
    return code;
  }

  return `<>${code}</>`;
};

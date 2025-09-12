export const normalizeJSX = (raw: string) => {
  const code = raw.trim();
  return code.startsWith('<>') || /^<[^/][\s\S]*>[\s\S]*<\/[^>]+>$/.test(code)
    ? code
    : `<>${code}</>`;
};

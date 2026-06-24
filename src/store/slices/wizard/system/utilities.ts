const extractLanguageCode = (locale: string): string | undefined => {
  const [regionPart] = locale.split('.');
  const [languageCode] = regionPart.split('_');
  if (!languageCode) {
    return undefined;
  }
  const lc = languageCode.toLowerCase();
  if (lc === 'c') {
    return undefined;
  }
  return lc;
};

export const getLangpackNameForLocale = (
  locale: string,
): string | undefined => {
  const code = extractLanguageCode(locale);
  return code ? `langpacks-${code}` : undefined;
};

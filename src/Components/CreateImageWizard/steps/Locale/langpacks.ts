// Helpers to determine which langpacks to install for selected locales
// Rule:
//  - Extract language code from <lang>_<REGION>.<encoding>
//  - Skip only 'C.UTF-8'; all other languages require langpacks-<lang>
export function extractLanguageCode(locale: string): string | undefined {
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
}

export function getLangpackNameForLocale(locale: string): string | undefined {
  const code = extractLanguageCode(locale);
  return code ? `langpacks-${code}` : undefined;
}

export function getRequiredLangpacksForLocales(locales: string[]): string[] {
  const set = new Set<string>();
  for (const loc of locales) {
    const pkg = getLangpackNameForLocale(loc);
    if (pkg) {
      set.add(pkg);
    }
  }
  return Array.from(set);
}

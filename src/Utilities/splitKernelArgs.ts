const plain = String.raw`[^\s"']+`;
const doubleQuotes = String.raw`"[^"]*"`;
const singleQuotes = String.raw`'[^']*'`;
const token = `(?:${plain}|${doubleQuotes}|${singleQuotes})+`;

export const splitKernelArgs = (kernelAppend: string): string[] => {
  return kernelAppend.match(new RegExp(token, 'g')) ?? [];
};

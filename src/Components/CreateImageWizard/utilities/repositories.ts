import type { Architectures } from '../../../store/service/imageBuilderApi';

export function getDistroRepoUrlsForArch(
  architecturesData: Architectures | undefined,
  arch: string,
): string[] {
  if (!architecturesData || architecturesData.length === 0) {
    return [];
  }
  const match = architecturesData.find((item) => item.arch === arch);
  if (!match) {
    return [];
  }
  return match.repositories
    .flatMap((repo: { baseurl?: string | undefined }) => {
      if (!repo.baseurl) {
        throw new Error(`Repository ${repo} missing baseurl`);
      }
      return repo.baseurl;
    })
    .filter((u: string | undefined): u is string => Boolean(u));
}

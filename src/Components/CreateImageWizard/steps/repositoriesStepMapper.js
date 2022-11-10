export default ({
  'third-party-repositories': thirdPartyRepositories,
} = {}) => {
  if (thirdPartyRepositories?.length > 0) {
    return 'packages-content-sources';
  }

  return 'image-name';
};

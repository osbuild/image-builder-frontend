const repositoriesStepMapper = ({
  'payload-repositories': customRepositories,
} = {}) => {
  if (customRepositories?.length > 0) {
    return 'packages-content-sources';
  }

  return 'details';
};

export default repositoriesStepMapper;

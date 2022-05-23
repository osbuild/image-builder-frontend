const TargetEnvironmentValidator = () => (targets) => {
  if (!targets) {
    return undefined;
  }

  // at least one of the target environments must
  // be set to true. This reduces the value to
  // a single boolean which is a flag for whether
  // at least one target has been selected or not
  let valid = Object.values(targets).reduce(
    (prev, curr) => curr || prev,
    false
  );
  return !valid ? 'Please select an image' : undefined;
};

export default TargetEnvironmentValidator;

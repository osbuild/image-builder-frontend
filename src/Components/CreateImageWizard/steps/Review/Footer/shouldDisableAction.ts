// When validateBeforeAction is provided, buttons stay enabled and
// validation runs on click; otherwise fall back to the static flag.
export const shouldDisableAction = (
  isDisabled: boolean,
  validateBeforeAction?: () => boolean,
): boolean => !validateBeforeAction && isDisabled;

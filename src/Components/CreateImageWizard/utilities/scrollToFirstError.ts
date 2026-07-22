export const scrollToFirstError = (): boolean => {
  const scope =
    document.querySelector('.pf-v6-c-wizard__main-body') ?? document;
  const element = scope.querySelector('.pf-m-error, [data-pending-warning]');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const parent = element.closest('.pf-v6-c-form-group, [role="group"]');
    const input = parent?.querySelector('input, textarea, select');
    if (input instanceof HTMLElement) input.focus();
    return true;
  }
  return false;
};

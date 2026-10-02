export const scrollToFirstError = (): boolean => {
  const element = document.querySelector('.pf-m-error, [data-pending-warning]');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const parent = element.closest('.pf-v6-c-form-group, [role="group"]');
    const input = parent?.querySelector('input, textarea, select');
    if (input instanceof HTMLElement) input.focus();
    return true;
  }
  return false;
};

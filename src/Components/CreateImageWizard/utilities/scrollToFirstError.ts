export const scrollToFirstError = (): boolean => {
  const errorEl = document.querySelector('.pf-m-error');
  if (errorEl) {
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const parent = errorEl.closest('.pf-v6-c-form-group, [role="group"]');
    const input = parent?.querySelector('input, textarea, select');
    if (input instanceof HTMLElement) input.focus();
    return true;
  }
  return false;
};

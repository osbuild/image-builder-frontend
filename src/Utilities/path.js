function resolveRelPath(path = '') {
  return `/insights/image-builder${path.length > 0 ? `/${path}` : ''}`;
}

export { resolveRelPath };

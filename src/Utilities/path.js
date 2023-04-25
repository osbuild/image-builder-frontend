function getBaseName(pathname) {
  let release = '/';
  const pathName = pathname.split('/');

  pathName.shift();

  if (pathName[0] === 'preview') {
    pathName.shift();
    release = `/preview/`;
  }

  return `${release}`;
}

function resolveRelPath(path = '') {
  return `/insights/image-builder${path.length > 0 ? `/${path}` : ''}`;
}

export { getBaseName, resolveRelPath };

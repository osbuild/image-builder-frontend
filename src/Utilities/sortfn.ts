const sortfn = (
  a: string | undefined,
  b: string | undefined,
  searchTerm: string,
) => {
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  // check exact match first
  if (x === searchTerm) {
    return -1;
  }
  if (y === searchTerm) {
    return 1;
  }
  // check for packages that start with the search term
  if (x.startsWith(searchTerm) && !y.startsWith(searchTerm)) {
    return -1;
  }
  if (y.startsWith(searchTerm) && !x.startsWith(searchTerm)) {
    return 1;
  }
  // if both (or neither) start with the search term
  // sort alphabetically
  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
};

export default sortfn;

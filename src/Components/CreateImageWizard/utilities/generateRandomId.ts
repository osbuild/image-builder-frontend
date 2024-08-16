export const generateRandomId = () => {
  let id = '';
  const characterSet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  while (id.length < 6) {
    id += characterSet.charAt(Math.floor(Math.random() * characterSet.length));
  }
  return id;
};

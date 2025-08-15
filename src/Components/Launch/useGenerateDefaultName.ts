export const generateDefaultName = (imageName: string) => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const dateTimeString = `${month}${day}${year}-${hours}${minutes}`;

  // gcloud images are valid in the form of: (?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)
  let newBlueprintName = imageName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  const maxLength = 63;
  const uniquePartLength = dateTimeString.length + 1;
  const baseNameMaxLength = maxLength - uniquePartLength;
  if (newBlueprintName.length > baseNameMaxLength) {
    newBlueprintName = newBlueprintName.substring(0, baseNameMaxLength);
  }

  while (newBlueprintName.endsWith('-')) {
    newBlueprintName = newBlueprintName.slice(0, -1);
  }

  return `${newBlueprintName}-${dateTimeString}`;
};

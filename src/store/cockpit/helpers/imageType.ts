export const imageTypeLookup = (imageType: string) => {
  // Fedora image types have a `server-` prefix that
  const image = imageType.startsWith('server-')
    ? imageType.slice('server-'.length)
    : imageType;

  // this is a list of types that we know we need to translate
  const lookup: Record<string, string> = {
    qcow2: 'guest-image',
    ami: 'aws',
    gce: 'gcp',
    vhd: 'azure',
    vmdk: 'vsphere',
    ova: 'vsphere-ova',
  };

  const result = lookup[image];
  return result ? result : image;
};

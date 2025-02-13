import hash from "hash.js";
import { CaCertFile } from "../../../store/wizardSlice";

const sha256 = (data: string): string => {
  return hash.sha256().update(data).digest("hex");
};

export const getHashedCertName = (certificate: CaCertFile): string => {
  const parts = certificate.name.split('.');
  const extension = parts.length > 1 ? parts.pop() : '';

  const hash = sha256(certificate.content)
  return extension ? hash + "." + extension : hash;
}

import path from "path";

export function getDataDir() {
  return process.env.DATA_DIR?.trim() || path.join(process.cwd(), ".data");
}

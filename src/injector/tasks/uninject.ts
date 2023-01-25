import type { UtilInfo } from "../../typings";

export default function uninject(utilInfo: UtilInfo) {
  return new Promise<void>((resolve, reject) => {
    console.log("UNINJECT:\n", utilInfo);

    resolve();
  });
}

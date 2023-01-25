import type { UtilInfo } from "../../typings";

export default function inject(utilInfo: UtilInfo) {
  return new Promise<void>((resolve, reject) => {
    console.log("INJECT:\n", utilInfo);

    resolve();
  });
}

import type { UtilInfo } from "../../typings";

export default function update(utilInfo: UtilInfo) {
  return new Promise<void>((resolve, reject) => {
    console.log("UPDATE:\n", utilInfo);

    resolve();
  });
}

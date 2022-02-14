import { resolve as pathResolve } from "path";
import { promises as fsPromises } from "fs";
import { nativeImage } from "electron";

function getImageWebUrl(path: string) {
    const protocol = path.split(":")[0];

    if (protocol === "http" || protocol === "https" || path.startsWith("/")) return path;
}
export function getImageUrl(dirname: string, path: string) {
    return getImageWebUrl(path) || nativeImage.createFromPath(pathResolve(dirname, path)).toDataURL();
}

// 150kb
const maxSmallImageSize = 0x25800;

export async function getSmallImageUrl(dirname: string, path: string) {
    // If image was given from a website
    const webUrl = getImageWebUrl(path);

    if (webUrl) return webUrl;

    const filePath = pathResolve(dirname, path);

    return await fsPromises
        .stat(filePath)
        .then(stats => {
            if (stats.size > maxSmallImageSize) throw new Error("File cannot be over 150kb in size");
        })
        .then(() => nativeImage.createFromPath(filePath).toDataURL());
}

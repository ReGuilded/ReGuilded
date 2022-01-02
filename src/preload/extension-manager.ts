import { promises as fsPromises } from "fs";

export default class ExtensionManager {
    dirname: string;
    // TODO
    idsToDirnames: {};
    all: object[];
    constructor(dirname: string) {
        this.dirname = dirname;
    }
    async delete(extensionId: string) {
        // Because .rm doesn't exist in Electron's Node.JS apparently
        // TODO: Unloading
        await fsPromises.rmdir(this.idsToDirnames[extensionId].dirname, { recursive: true });
    }
}

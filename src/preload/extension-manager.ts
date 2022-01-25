import { promises as fsPromises, stat, readdirSync, readdir, readFile } from "fs";
import { AnyExtension } from "../common/extensions";
import { watch as chokidarWatch } from "chokidar";
import { ipcRenderer, nativeImage } from "electron";
import { copy } from "fs-extra";
import path from "path";

// TODO: Checking
export default abstract class ExtensionManager<T extends AnyExtension> {
    /**
     * The list of all extensions.
     */
    all: T[];
    /**
     * The list of IDs of all extensions.
     */
    allIds: string[];
    /**
     * The map of extension IDs to their metadata.
     */
    idsToMetadata: { [extensionId: string]: T };

    /**
     * The memory of already loaded preview images in an extension.
     */
    idsToImages: { [extensionId: string]: string[] };
    /**
     * Whether every extension has been initiated.
     */
    allInit: boolean;
    /**
     * The directory where all the extensions are.
     */
    dirname: string;
    /**
     * The callback when extension gets deleted.
     */
    onDeletion: (extension: T) => void;
    /**
     * The callback when every extension has finished initiating.
     */
    watchDoneCallback: (all: T[]) => void;
    /**
     * The callback when file change happens in `this.dirname`.
     */
    watchCallback: (extension: T, loaded: boolean, previousId: string) => void;
    /**
     * The properties that will be exported to context bridge.
     */
    exportable: { [prop: string]: any };
    /**
     * The type of extension it is (theme, addon).
     */
    extensionType: string;

    constructor(extensionType: string, dirname: string) {
        this.all = [];
        this.allIds = [];
        this.dirname = dirname;
        this.allInit = false;
        this.idsToMetadata = {};
        this.idsToImages = {};
        this.extensionType = extensionType;

        let empty = () => {};
        this.onDeletion = empty;
        this.watchCallback = empty;
        this.watchDoneCallback = empty;

        let self = this;
        // For context bridge
        this.exportable = {
            dirname,
            delete: this.delete.bind(this),
            getAll() {
                return self.all;
            },
            getHasLoaded() {
                return self.allInit;
            },
            // Loading them in `addToMetadata` contributes to reduced performance
            fetchImagesOf(extensionId: string, callback: (images: string[]) => void) {
                // Don't reduce performance again
                // TODO: Image refetch as an option in settings?
                const imageCache = self.idsToImages[extensionId];

                if (imageCache) callback(imageCache);
                else {
                    // Otherwise, it was never fetched
                    const { images, dirname } = self.idsToMetadata[extensionId];

                    let fetchedImages = [];

                    if (images) {
                        fetchedImages = images.map(imagePath =>
                            nativeImage.createFromPath(path.resolve(dirname, imagePath)).toDataURL()
                        );

                        // Save it for later reuse, until the extension's metadata gets changed
                        self.idsToImages[extensionId] = fetchedImages;
                    }
                    callback(fetchedImages);
                }
            },
            setWatchCallback(callback: (extension: T, loaded: boolean) => void) {
                self.watchCallback = callback;
            },
            setLoadCallback(callback: (all: T[]) => void) {
                self.watchDoneCallback = callback;
            },
            setDeletionCallback(callback: (extension: T) => void) {
                self.onDeletion = callback;
            },
            async openImportPrompt() {
                await ipcRenderer
                    .invoke("reguilded-extension-dialog", self.extensionType)
                    .then(({ filePaths, canceled }) => {
                        if (!canceled)
                            // Copy only directories with metadata.json
                            for (let importedDir of filePaths) {
                                stat(path.join(importedDir, "metadata.json"), async (e, d) => {
                                    if (e)
                                        if (e.code === "ENOENT")
                                            throw new Error(
                                                `Directory '${importedDir}' cannot be imported as an extension: it has no metadata.json file.`
                                            );
                                        else return console.error("Error while importing extension:", e);

                                    await copy(importedDir, path.join(self.dirname, path.basename(importedDir)), {
                                        overwrite: true,
                                        recursive: true,
                                        errorOnExist: false
                                    });
                                });
                            }
                    });
            }
        };
    }
    /**
     * Deletes the given extension.
     * @param extensionId The identifier of the extension to delete`
     */
    async delete(extensionId: string): Promise<void> {
        const metadata = this.idsToMetadata[extensionId];

        if (!metadata) throw new ReferenceError(`Metadata with ID '${extensionId}' was not found.`);

        // Because .rm doesn't exist in Electron's Node.JS apparently
        await fsPromises.rmdir(this.idsToMetadata[extensionId].dirname, { recursive: true });
    }
    /**
     * Manages the extension once its files get changed.
     * @param extension The extension that has been updated
     */
    protected abstract onFileChange(extension: T): Promise<void>;
    /**
     * Watches the extension directory for any changes.
     */
    watch() {
        // This is messy
        const available = readdirSync(this.dirname, { withFileTypes: true }).length,
            // Split '/' and get its length, to get the name of the extension.
            // The length already gives us +1, so no need to do that.
            relativeIndex = this.dirname.split(path.sep).length;

        // Create a loaded dictionary, to replace the old index-based load checker,
        // along with unloading when hot reloading
        const loaded = {};
        // Create a de-bouncer dictionary, to prevent lag from multi-loading
        const deBouncers = {};

        // Watch the directory for any file changes
        chokidarWatch(this.dirname).on("all", (changeType: any, fp: string) => {
            const splitFp = fp.split(path.sep);
            const extName = splitFp[relativeIndex];

            // Make sure extName exists(this not being `settings/addons` or `settings/themes`)
            // and it's currently not in the process of rebouncing
            if (extName && !deBouncers[extName])
                deBouncers[extName] = setTimeout(async () => {
                    const extPath = path.join(this.dirname, extName);

                    // Get the metadata.json file path, and if it doesn't exist, ignore it
                    const metadataPath = path.join(extPath, "metadata.json");

                    const changeIsMetadata = fp === metadataPath;

                    if ((changeIsMetadata || fp === extPath) && (changeType === "unlink" || changeType === "unlinkDir")) {
                        const existingExt = this.all.find(metadata => metadata.dirname === extPath);
                        if (existingExt !== undefined) {
                            // Since allIds and all will have the same indexes
                            const index = this.all.indexOf(existingExt);

                            this.all.splice(index, 1);

                            delete loaded[extName];
                            delete this.idsToMetadata[existingExt.id];

                            this.onDeletion(existingExt);
                        }
                        delete deBouncers[extName];
                        return;
                    }

                    // For both getting the metadata and removing it
                    const metadataIndex = this.all.findIndex(metadata => metadata.dirname === extPath);

                    let metadata: T = this.all[metadataIndex],
                        previousId;

                    const newMetadata = metadata === undefined;

                    if (!newMetadata && changeIsMetadata) {
                        previousId = metadata.id;
                        this.all.splice(metadataIndex, 1);
                        delete this.idsToImages[metadata.id];
                    }
                    // Require the metadata file.
                    if (newMetadata || changeIsMetadata) {
                        metadata = await fsPromises.readFile(metadataPath, "utf8").then(JSON.parse);
                        metadata.dirname = extPath;
                        this.idsToMetadata[metadata.id] = metadata;
                    }

                    // Add Readme, etc.
                    addToMetadata(metadata, extPath);

                    const hasBeenLoaded = Boolean(loaded[extName]);

                    await this.onFileChange(metadata)
                        // Mark it as loaded
                        .then(
                            () => this.all.push((loaded[extName] = metadata)),
                            e => console.error(`Error in extension by ID '${metadata.id}':\n`, e)
                        )
                        // Call the renderer callback
                        .then(() => this.watchCallback(metadata, hasBeenLoaded, previousId))
                        .finally(() => {
                            // Ensure this is the last extension and that we haven't already tripped the event
                            if (available == Object.keys(loaded).length && !this.allInit) {
                                this.allInit = true;

                                this.watchDoneCallback(this.all);
                            }

                            // Remove debouncer from the set for further debouncing and updatings
                            delete deBouncers[extName];
                        });
                }, 250);
        });
    }
}
/**
 * Adds misc properties to the metadata and verifies it.
 * @param extension The current metadata of the extension
 * @param dirname The path to the extension
 */
function addToMetadata<T extends AnyExtension>(extension: T, dirname: string) {
    readFile(path.join(dirname, "README.md"), "utf8", (err, d) => {
        if (err)
            if (err.code === "ENOENT") return;
            else throw err;

        extension.readme = d;
    });
    if (extension.images && !Array.isArray(extension.images)) {
        console.warn("Extension metadata property 'images' must be a string array in extension by ID '%s'", extension.id);
        extension.images = undefined;
    }
    // Make sure author is an ID
    if (extension.author && (typeof extension.author !== "string" || extension.author.length !== 8)) {
        console.warn("Author must be an identifier of the user in Guilded, not their name or anything else");
        // To not cause errors and stuff
        extension.author = undefined;
    }
}

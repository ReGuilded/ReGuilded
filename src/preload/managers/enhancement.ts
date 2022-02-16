import { promises as fsPromises, stat, readdirSync } from "fs";
import { AnyEnhancement } from "../../common/enhancements";
import { getImageUrl, getSmallImageUrl } from "../util";
import { watch as chokidarWatch } from "chokidar";
import { ipcRenderer } from "electron";
import { copy } from "fs-extra";
import path from "path";
import { BaseManager } from "./base";

// TODO: Introduce checking
export default abstract class EnhancementManager<T extends AnyEnhancement>
    implements BaseManager<{ [prop: string]: any }>
{
    /**
     * The list of all enhancements.
     */
    all: T[];
    /**
     * The list of IDs of all enhancements.
     */
    allIds: string[];
    /**
     * The map of enhancement IDs to their metadata.
     */
    idsToMetadata: { [enhancementId: string]: T };

    /**
     * The memory of already loaded preview images in an enhancement.
     */
    idsToImages: { [enhancementId: string]: string[] };
    /**
     * Whether every enhancement has been initiated.
     */
    allInit: boolean;
    /**
     * The directory where all the enhancements are.
     */
    dirname: string;
    /**
     * The callback when enhancement gets deleted.
     */
    onDeletion: (enhancement: T) => void;
    /**
     * The callback when every enhancement has finished initiating.
     */
    watchDoneCallback: (all: T[]) => void;
    /**
     * The callback when file change happens in `this.dirname`.
     */
    watchCallback: (enhancement: T, loaded: boolean, previousId: string) => void;
    /**
     * The properties that will be exported to context bridge.
     */
    exportable: { [prop: string]: any };
    /**
     * The type of enhancement it is (theme, addon).
     */
    enhancementType: string;

    constructor(enhancementType: string, dirname: string) {
        this.all = [];
        this.allIds = [];
        this.dirname = dirname;
        this.allInit = false;
        this.idsToMetadata = {};
        this.idsToImages = {};
        this.enhancementType = enhancementType;

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
            fetchImagesOf(enhancementId: string, callback: (images: string[]) => void) {
                // Don't reduce performance again
                const imageCache = self.idsToImages[enhancementId];

                if (imageCache) {
                    callback(imageCache);
                    return;
                }
                // Otherwise, it was never fetched
                const { images, dirname } = self.idsToMetadata[enhancementId];

                let fetchedImages = [];

                if (images) {
                    fetchedImages = images.map(imagePath => getImageUrl(dirname, imagePath));

                    // Save it for later reuse, until the enhancement's metadata gets changed
                    self.idsToImages[enhancementId] = fetchedImages;
                }
                callback(fetchedImages);
            },
            setWatchCallback(callback: (enhancement: T, loaded: boolean) => void) {
                self.watchCallback = callback;
            },
            setLoadCallback(callback: (all: T[]) => void) {
                self.watchDoneCallback = callback;
            },
            setDeletionCallback(callback: (enhancement: T) => void) {
                self.onDeletion = callback;
            },
            async openImportPrompt() {
                await ipcRenderer
                    .invoke("reguilded-enhancement-dialog", self.enhancementType)
                    .then(({ filePaths, canceled }) => {
                        if (!canceled)
                            // Copy only directories with metadata.json
                            for (let importedDir of filePaths) {
                                stat(path.join(importedDir, "metadata.json"), async (e, d) => {
                                    if (e)
                                        if (e.code === "ENOENT")
                                            throw new Error(
                                                `Directory '${importedDir}' cannot be imported as an enhancement: it has no metadata.json file.`
                                            );
                                        else return console.error("Error while importing enhancement:", e);

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
     * Deletes the given enhancement.
     * @param enhancementId The identifier of the enhancement to delete`
     */
    async delete(enhancementId: string): Promise<void> {
        const metadata = this.idsToMetadata[enhancementId];

        if (!metadata) throw new ReferenceError(`Metadata with ID '${enhancementId}' was not found.`);

        // Because .rm doesn't exist in Electron's Node.JS apparently
        await fsPromises.rmdir(this.idsToMetadata[enhancementId].dirname, { recursive: true });
    }
    /**
     * Manages the enhancement once its files get changed.
     * @param enhancement The enhancement that has been updated
     */
    protected abstract onFileChange(enhancement: T): Promise<void>;

    /**
     * Watches the enhancement directory for any changes.
     */
    watch() {
        // This is messy
        const available = readdirSync(this.dirname, { withFileTypes: true }).length,
            // Split '/' and get its length, to get the name of the enhancement.
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
                // To not do 100 changes instantly
                deBouncers[extName] = setTimeout(async () => {
                    const extPath = path.join(this.dirname, extName);
                    // Get the metadata.json file path, and if it doesn't exist, ignore it
                    const metadataPath = path.join(extPath, "metadata.json");
                    const changeIsMetadata = fp === metadataPath;

                    // Leave no trace
                    if ((changeIsMetadata || fp === extPath) && (changeType === "unlink" || changeType === "unlinkDir"))
                        return this.watchOnMetadataDeletion(extName, extPath, loaded, deBouncers);

                    // For both getting the metadata and removing it
                    const metadataIndex = this.all.findIndex(metadata => metadata.dirname === extPath);

                    let metadata: T = this.all[metadataIndex],
                        previousId: string;

                    const newMetadata = metadata === undefined;

                    if (!newMetadata && changeIsMetadata) {
                        previousId = metadata.id;
                        this.all.splice(metadataIndex, 1);
                        delete this.idsToImages[metadata.id];
                    }
                    // Re-require new metadata
                    if (newMetadata || changeIsMetadata) {
                        metadata = await fsPromises.readFile(metadataPath, "utf8").then(JSON.parse);
                        metadata.dirname = extPath;
                        this.idsToMetadata[metadata.id] = metadata;
                    }

                    // Add Readme, etc.
                    await addToMetadata(metadata, extPath);

                    const hasBeenLoaded = Boolean(loaded[extName]);

                    await this.onFileChange(metadata)
                        // Mark it as loaded
                        .then(
                            () => this.all.push((loaded[extName] = metadata)),
                            e => console.error(`Error in enhancement by ID '${metadata.id}':\n`, e)
                        )
                        // Call the renderer callback
                        .then(() => this.watchCallback(metadata, hasBeenLoaded, previousId))
                        .finally(() => {
                            // Ensure this is the last enhancement and that we haven't already tripped the event
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
    // ---- Watch stuff ----
    /**
     * Deletes everything about the metadata when its files get deleted.
     * @param extName The name of the enhancement's directory
     * @param extPath The path to the enhancement
     * @param loaded The currently loaded enhancements
     * @param deBouncers The debouncers of all enhancements
     */
    private watchOnMetadataDeletion(
        extName: string,
        extPath: string,
        loaded: { [enhancementId: string]: T },
        deBouncers: { [extName: string]: NodeJS.Timeout }
    ) {
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
    }
}
/**
 * Adds misc properties to the metadata and verifies it.
 * @param enhancement The current metadata of the enhancement
 * @param dirname The path to the enhancement
 */
async function addToMetadata<T extends AnyEnhancement>(enhancement: T, dirname: string) {
    if (enhancement.images && !Array.isArray(enhancement.images)) {
        console.warn(
            "Enhancement metadata property 'images' must be a string array in enhancement by ID '%s'",
            enhancement.id
        );
        enhancement.images = undefined;
    }
    // Make sure author is an ID
    if (enhancement.author && (typeof enhancement.author !== "string" || enhancement.author.length !== 8)) {
        console.warn(
            "Enhancement metadata property 'author' must be a Guilded identifier in enhancement by ID '%s'",
            enhancement.id
        );
        // To not cause errors and stuff
        enhancement.author = undefined;
    }
    await Promise.all([
        // README.md
        fsPromises
            .readFile(path.join(dirname, "README.md"), "utf8")
            .then(data => (enhancement.readme = data))
            .catch(err => {
                if (err.code !== "ENOENT")
                    console.error("Error while fetching readme file of an enhancement by ID '%s':", enhancement.id, err);
            }),
        // Cover/banner
        enhancement.banner &&
            getSmallImageUrl(dirname, enhancement.banner)
                .then(url => (enhancement.banner = url))
                .catch(e => console.error("Error while fetching banner of an enhancement by ID '%s':", enhancement.id, e))
    ]);
}

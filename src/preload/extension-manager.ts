import { promises as fsPromises, existsSync, readdirSync, readdir, readFile } from "fs";
import { AnyExtension } from "../common/extensions";
import { watch as chokidarWatch } from "chokidar";
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
    watchCallback: (extension: T, loaded: boolean) => void;
    /**
     * The properties that will be exported to context bridge.
     */
    exportable: { [prop: string]: any };

    constructor(dirname: string) {
        this.all = [];
        this.allIds = [];
        this.dirname = dirname;
        this.allInit = false;
        this.idsToMetadata = {};

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
            setWatchCallback(callback: (extension: T, loaded: boolean) => void) {
                self.watchCallback = callback;
            },
            setLoadCallback(callback: (all: T[]) => void) {
                self.watchDoneCallback = callback;
            },
            setDeletionCallback(callback: (extension: T) => void) {
                self.onDeletion = callback;
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
    protected abstract onFileChange(extension: T): Promise<void>;
    /**
     * Watches the extension directory for any changes.
     */
    watch() {
        // This is messy
        const available = readdirSync(this.dirname, { withFileTypes: true }).length,
            // Split '/' and get its length, to get the name of the extension.
            // The length already gives us +1, so no need to do that.
            // That's a dumdum way of doing it, but eh.
            relativeIndex = this.dirname.split(path.sep).length;

        // Create a loaded dictionary, to replace the old index-based load checker,
        // along with unloading when hot reloading
        const loaded = {};
        // Create a de-bouncer dictionary, to prevent lag from multi-loading
        const deBouncers = {};

        // Watch the directory for any file changes
        chokidarWatch(this.dirname).on("all", (_: any, fp: string) => {
            const extName = fp.split(path.sep)[relativeIndex];

            // Make sure extName exists(this not being `settings/addons` or `settings/themes`)
            // and it's currently not in the process of rebouncing
            if (extName && !deBouncers[extName])
                deBouncers[extName] = setTimeout(async () => {
                    const extPath = path.join(this.dirname, extName);

                    // Get the metadata.json file path, and if it doesn't exist, ignore it
                    const metadataPath = path.join(extPath, "metadata.json");
                    // TODO: Use chokidar type instead
                    if (!existsSync(metadataPath)) {
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

                    let metadata: T = this.all.find(metadata => metadata.dirname === extPath);
                    // Require the metadata file.
                    if (metadata === undefined) {
                        metadata = require(metadataPath);
                        metadata.dirname = extPath;
                    }

                    // Add Readme, etc.
                    addToMetadata(metadata, extPath);

                    await this.onFileChange(metadata)
                        // Mark it as loaded
                        .then(
                            () => this.all.push((loaded[extName] = metadata)),
                            e => console.error("Error in extension by ID '", metadata.id, "':\n", e)
                        )
                        // Call the renderer callback
                        .then(() => this.watchCallback(metadata, loaded[extName]))
                        .finally(() => {
                            // Ensure this is the last extension and that we haven't already tripped the event
                            if (available == Object.keys(loaded).length && !this.allInit) {
                                this.allInit = true;
                                this.idsToMetadata =
                                    // [ { x: {...} }, { y: {...} } ]
                                    this.all
                                        .map(s => ({ [s.id]: s }))
                                        // { x: {...}, y: {...} }
                                        .reduce((x, y) => Object.assign(x, y));

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
    readdir(dirname, (err, files) => {
        if (err) throw err;

        // Add readme to metadata if one of the readme file names exist
        const readmeName = files.find(f => f.toLowerCase() === "readme.md");

        if (readmeName) {
            readFile(path.join(dirname, readmeName), { encoding: "utf8" }, (err, d) => {
                if (err) throw err;

                extension.readme = d;
            });
        }
    });
    // Make sure author is an ID
    if (extension.author && (typeof extension.author !== "string" || extension.author.length !== 8)) {
        console.warn(
            "Author must be an identifier of the user in Guilded, not their name or anything else"
        );
        // To not cause errors and stuff
        extension.author = undefined;
    }
}

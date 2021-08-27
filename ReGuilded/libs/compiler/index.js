const fs = require("fs");
const path = require("path");
const sucrase = require("sucrase");
const sass = require("sass");
const _module = require("module");

// The list of originals for the un-patcher
const originals = [];

/**
 * Patch the require function with the specified
 * @param patcher The patch callback, first argument is the module, second is the file path
 * @param extensions
 */
function patchRequire(patcher, ...extensions) {
    extensions.forEach(ext => (
        originals.push({ ext, original: _module._extensions[ext] }),
        _module._extensions[ext] = patcher
    ));
}

/**
 * Unpatch all requires
 */
function unpatchRequire() {
    originals.forEach(o => _module._extensions[o.ext] = o.original);
}

module.exports = {
    sucrase, sass,
    /**
     * Patch the require to handle TS/JSX/TSX/CSS/SASS/SCSS.
     */
    patchRequires: function() {
        // If you knew how long this took me to figure out, you wouldn't be wondering why it was here, you wouldn't want to know
        // But since you just asked, the process and Buffer object need to be defined on the window for sass to compile properly
        // And the SASS_PATH property needs to be defined so sass knows where it exists at? Because they've never heard of __dirname I guess?
        window.process = process;
        window.Buffer = Buffer;
        process.env.SASS_PATH = path.join(__dirname, "node_modules", "sass");
        
        // Patch React and TypeScript
        patchRequire((module, fp) => {
            // Get the module's source as string
            const content = fs.readFileSync(fp, "utf8");
            // If the import is a lib import, return it as normal
            if (/node_modules/.test(fp)) return module._compile(content, fp);

            // Transform the TS/JSX/TSX and get its source code
            const { code } = sucrase.transform(content, { transforms: ["typescript", "imports", "jsx"] });

            // Compile the transformed code
            module._compile(code, fp);
        }, ".js", ".jsx", ".ts", ".tsx");
        
        // Patch Style-sheets
        patchRequire((module, file) => {
            // Get the addon name from the directory
            const addonName = path.basename(path.dirname(file));
            // Generate a random 7-length string
            const randomKey = Math.random().toString(36).substr(7);
            // Create a unique ID compound
            const id = `${addonName}-styles-${randomKey}`;
            
            // Compile the style-sheet source code to plain CSS
            const code = sass.renderSync({ file }).css.toString();

            // Create an element to be injected into the document
            const element = Object.assign(document.createElement("style"), {
                textContent: code, id
            });

            // Export the styles object
            module.exports = {
                inject: () => document.head.appendChild(element),
                uninject: () => element.remove(),
                destroy: () => element.remove(),
                element, id,
                source: code
            };
        }, ".css", ".scss", ".sass");
    },
    patchRequire, unpatchRequire
};
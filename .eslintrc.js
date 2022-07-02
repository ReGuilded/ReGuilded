/** @type {import("eslint").ESLint.ConfigData} */
const config = {
    root: true,
    env: {
        node: true
    },
    parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
            jsx: true
        }
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"]
};

module.exports = config;

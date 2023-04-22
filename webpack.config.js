const path = require("path");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const createTsTransformPaths = require('typescript-transform-paths').default;

const srcPath = path.join(__dirname, "src");
const distPath = path.join(__dirname, "dist");

const commonConfig = {
    context: srcPath,
    resolve: {
        plugins: [new TsconfigPathsPlugin()],
        extensions: [".js", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        getCustomTransformers: (program) => ({
                            before: [createTsTransformPaths(program, {})],
                            afterDeclarations: [createTsTransformPaths(program, {
                                afterDeclarations: true
                            })]
                        })
                    }
                },
                exclude: /node_modules|\.d\.ts$/
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            injectType: "lazyStyleTag",
                        },
                    },
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],
    },
};

module.exports = [
    Object.assign(
        {
            target: "electron-renderer",
            entry: { index: path.join(srcPath, 'index.ts') },
            output: {
                path: distPath,
                filename: "index.js",
                libraryTarget: "umd",
                globalObject: "this",
            },
        },
        commonConfig
    ),
    Object.assign(
        {
            target: "electron-main",
            entry: { main: path.join(srcPath, 'main', 'index.ts') },
            output: {
                path: distPath,
                filename: "main.js",
                libraryTarget: "umd",
                globalObject: "this",
            },
        },
        commonConfig
    ),
];

const path = require("path");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const srcPath = path.join(__dirname, "src");

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
                use: "ts-loader",
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
                path: __dirname,
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
            entry: { main: path.join(srcPath, 'main', 'main.ts') },
            output: {
                path: __dirname,
                filename: "main.js",
                libraryTarget: "umd",
                globalObject: "this",
            },
        },
        commonConfig
    ),
];

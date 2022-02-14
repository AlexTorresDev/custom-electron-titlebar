const path = require("path");

const commonConfig = {
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
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
            entry: { index: "./src/index.ts" },
            output: {
                path: path.resolve(__dirname, "./dist"),
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
            entry: { main: "./src/main/main.ts" },
            output: {
                path: path.resolve(__dirname, "./dist"),
                filename: "main.js",
                libraryTarget: "umd",
                globalObject: "this",
            },
        },
        commonConfig
    ),
];

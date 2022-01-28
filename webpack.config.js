const path = require('path');

module.exports = {
    target: 'node',
    entry: {
        index: './src/index.ts',
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'index.js',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/
        },
        {
            test: /\.scss$/,
            use: [
                {
                    loader: "style-loader",
                    options: {
                        injectType: "lazyStyleTag"
                    },
                },
                "css-loader",
                "sass-loader"
            ]
        }]
    }
};
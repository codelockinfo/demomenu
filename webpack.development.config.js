const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    watch: true,
    entry: {
        "global" : "./scripts/app.js",
        "product-form" : "./scripts/components/product-form.js",
        "cart" : "./scripts/components/cart.js",
        "bundle" : "./scripts/components/bundle.js",
        "discount-codes" : "./scripts/components/discount-codes.js",
        "quick-add" : "./scripts/components/quick-add.js"
    },
    output: {
        path: path.resolve(__dirname, 'assets'),
        filename: '[name].js',
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
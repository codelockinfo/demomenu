const path              = require('path');
const webpack           = require('webpack');

module.exports = {
    mode: 'production',
    watch: false,
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
        filename: '[name].min.js',
        umdNamedDefine: false
    },
    optimization: {
        minimize: true,
        concatenateModules: false,
        providedExports: false,
        usedExports: false,
        sideEffects: true
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
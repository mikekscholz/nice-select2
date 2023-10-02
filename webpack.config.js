//npm install mini-css-extract-plugin sass-loader sass webpack webpack-cli --save-dev

const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');

module.exports = {
	mode: "production", // "production" | "development" | "none"
	watch: true,
	watchOptions: {
	  aggregateTimeout: 1000,
	  poll: 1000,
	  ignored: ['/.git/', '/node_modules/', '/webfonts/', '/config.json/', '/main.js/', '/package/'],
	},
    entry: {
		"nice-select2": './src/js/nice-select2.js',
		style: "./src/scss/style.scss",
	},
    output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].js',
		library: {
			type: 'module',
		},
	},
	experiments: {
		outputModule: true,
	},
    optimization: {
		usedExports: true,
    },
	plugins: [
		new MiniCssExtractPlugin({ filename: "css/[name].css" }),
		new webpack.ProgressPlugin(),
	],
	module: {
		rules: [
		  {
			test: /\.(sa|sc|c)ss$/i,
			use: [
				MiniCssExtractPlugin.loader,
				"css-loader",
				"sass-loader",
			],
		  },
		],
	},
}

if (process.env.NODE_ENV !== 'production') {
	module.exports['devtool'] = 'source-map';
}
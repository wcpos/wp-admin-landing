const path = require('path');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(NODE_ENV);
const OUTPUT = NODE_ENV === 'development' ? 'build' : 'assets';

module.exports = function (_env, argv) {
	const config = {
		mode: NODE_ENV,
		bail: false,
		entry: {
			landing: './src/index.tsx',
		},
		output: {
			path: path.resolve(__dirname, OUTPUT),
			filename: 'js/[name].js',
			publicPath: '/',
		},
		externals: {
			react: 'React',
			'react-dom': 'ReactDOM',
			lodash: 'lodash',
			wp: 'wp',
			'@wordpress/components': 'wp.components',
			'@wordpress/element': 'wp.element',
			'@wordpress/api-fetch': 'wp.apiFetch',
			'@wordpress/url': 'wp.url',
			// '@tanstack/react-query': 'ReactQuery', // unpkg.com is unreliable
			'@transifex/native': 'Transifex',
			// 'react-beautiful-dnd': 'ReactBeautifulDnd', // unpkg.com is unreliable
		},
		module: {
			rules: [
				// {
				// 	test: /\.(ts|js)x?$/i,
				// 	exclude: /node_modules/,
				// 	use: {
				// 		loader: 'babel-loader',
				// 		options: {
				// 			presets: [
				// 				['@babel/preset-env', { modules: false }],
				// 				'@babel/preset-react',
				// 				'@babel/preset-typescript',
				// 			],
				// 		},
				// 	},
				// },
				{
					test: /\.(ts|js)x?$/i,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [['@babel/preset-env', { modules: false }], '@babel/preset-react'],
							},
						},
						{
							loader: 'ts-loader',
							options: {
								transpileOnly: true,
							},
						},
					],
				},
				{
					test: /\.s[ac]ss$/i,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						// Creates `style` nodes from JS strings
						// "style-loader",
						// Translates CSS into CommonJS
						'css-loader',
						// Compiles Sass to CSS
						'sass-loader',
					],
				},
				{
					test: /\.css$/,
					use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
				},
				{
					test: /\.(png|jpg)$/,
					loader: 'url-loader',
				},
				{
					test: /\.svg$/,
					use: ['@svgr/webpack'],
				},
			],
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
		},
		plugins: [
			// new ForkTsCheckerWebpackPlugin(),
			// new ESLintPlugin({
			// 	extensions: ["js", "jsx", "ts", "tsx"],
			// }),
			new MiniCssExtractPlugin({
				filename: './css/[name].css',
			}),
			new LiveReloadPlugin(),
			new BundleAnalyzerPlugin({
				analyzerMode: 'static',
				openAnalyzer: false,
			}),
		],
		optimization: {
			minimize: NODE_ENV === 'production',
			minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
			splitChunks: {
				name: false,
			},
			usedExports: true,
		},
		stats: {
			assetsSort: '!size',
			assetsSpace: 999,
			modulesSpace: 999,
		},
	};

	if (NODE_ENV === 'development') {
		config.devtool = 'inline-source-map';
	}

	return config;
};

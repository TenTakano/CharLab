const path = require("node:path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (_env, argv) => {
	const common = {
		mode: argv.mode,
		resolve: {
			extensions: [".ts", ".tsx", ".js", ".jsx"],
			alias: {
				"@": path.resolve(__dirname, "src"),
				"@main": path.resolve(__dirname, "src/main"),
				"@ui": path.resolve(__dirname, "src/renderer"),
				"@preload": path.resolve(__dirname, "src/preload"),
			},
		},
		module: {
			rules: [
				{
					test: /\.[jt]sx?$/,
					exclude: /node_modules/,
					use: {
						loader: "ts-loader",
						options: { transpileOnly: true },
					},
				},
				{
					test: /\.css$/,
					use: [
						"style-loader",
						{
							loader: "css-loader",
							options: { importLoaders: 1 },
						},
					],
				},
				{
					test: /\.(png|jpe?g|gif|svg)$/,
					type: "asset/resource",
				},
			],
		},
		devtool: argv.mode === "development" ? "source-map" : false,
	};

	return [
		{
			...common,
			name: "main",
			entry: {
				main: "./src/main/main.ts",
				preload: "./src/preload/preload.ts",
			},
			target: "electron-main",
			output: {
				path: path.resolve(__dirname, "dist"),
				filename: "[name].js",
			},
			externals: [{ sharp: "commonjs sharp" }],
		},
		{
			...common,
			name: "renderer",
			entry: {
				renderer: "./src/renderer/index.tsx",
			},
			target: "electron-renderer",
			output: {
				path: path.resolve(__dirname, "dist"),
				filename: "[name].js",
			},
			plugins: [
				new HtmlWebpackPlugin({
					template: "./public/index.html",
					filename: "index.html",
					chunks: ["renderer"],
				}),
			],
		},
	];
};

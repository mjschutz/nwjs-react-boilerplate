const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var pjson = require('../package.json');

const staticDir = path.resolve(__dirname, '../static');

if (!fs.existsSync(staticDir)){
    fs.mkdirSync(staticDir);
} else {
	var removeDir = (dirPath) => {
		if (fs.existsSync(dirPath)) {
			return;
		}

		var list = fs.readdirSync(dirPath);
		for (var i = 0; i < list.length; i++) {
			var filename = path.join(dirPath, list[i]);
			var stat = fs.statSync(filename);

			if (filename == "." || filename == "..") {
				// do nothing for current and parent dir
			} else if (stat.isDirectory()) {
				removeDir(filename);
			} else {
				fs.unlinkSync(filename);
			}
		}

		fs.rmdirSync(dirPath);
	};
	removeDir(staticDir);
}

webpack({
	mode: 'development',
	entry: './src/index.js',
	output: {
		publicPath: staticDir + '/',
		path: staticDir,
		filename: 'index.js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: pjson.name,
			publicPath: path.resolve(__dirname, '../public'),
			template: path.resolve(__dirname, '../public') + '/index.html',
			filename: 'index.html'
		})
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env", "@babel/preset-react"]
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader"
				]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: 'file-loader'
			}
		]
	}
}, (err, stats) => { // Stats Object
	if (err || stats.hasErrors()) {
		console.log(stats)
		console.log("\nbuild finished with errors: ", err);
		return;
	}

	console.log(stats)
	console.log("\nbuild finished without errors!", );
});
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
	target: 'node',
	entry: './src/index.js',
	output: {
		publicPath: staticDir + '/',
		path: staticDir,
		filename: 'index.js'
	},
    resolve: {
        extensions: [ '.mjs', '.js', '.json', '.node' ]
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
				test: /\.js(x)?$/,
				exclude: /node_modules/,
				use: [ {
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env", "@babel/preset-react"]
						}
					},
					{
						loader: "eslint-loader"
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader"
				]
			},
			{
				test: /\.node$/,
				use: 'node-loader'
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
	
	let ai = 2;
	let nwbconf = require('../nwbconf.json');
	
	if (process.argv[ai] == '-d') {
		ai++;
		nwbconf.production = false;
	}
	
	var NwBuilder = require('nw-builder');
	var nw = new NwBuilder(nwbconf);
	
	if (process.argv[ai] == '-r') {
		nw.run().then(function () {
		   console.log('all done!');
		}).catch(function (error) {
			console.error(error);
		});
	} else if (process.argv[ai] == '-p') {
		let p = process.argv.slice(ai+1);
		
		if (p.length) {
			nwbconf.platforms = p;
		}
		
		// Log stuff you want
		nw.on('log',  console.log);

		nw.build().then(function () {
		   console.log('all done!');
		}).catch(function (error) {
			console.error(error);
		});
	}
});
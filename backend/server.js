var express = require('express');
var store = require('./store');
var fs = require('fs');
var nodePromise = require("node-promise");
var Promise = nodePromise.Promise;
var configReader = require('./config');
var app = express();

function loadFile(file) {
	if (!loadFile.cache[file] || !loadFile.doCache) {
		loadFile.cache[file] = new Promise();
		fs.readFile(file, 'utf8', function (err, page) {
			if (err) throw err;
			loadFile.cache[file].resolve(page)
		});
	}
	return loadFile.cache[file];
}
loadFile.cache = {};
loadFile.doCache = false;

function registerPage(file, url) {
	app.get(url, function (req, res) {
		loadFile(file).then(function (page) {
			if (url.substr(-3) === '.js') {
				res.setHeader('Content-Type', 'application/javascript');
			} else if (url.substr(-4) === '.css') {
				res.setHeader('Content-Type', 'text/css');
			}
			res.send(page);
		});
	});
}

function dataServer(source, url) {
	app.get(url, function (req, res) {
		source.get().then(function (data) {
			res.send(data);
		});
	});
}

registerPage('../frontend/page.html', '/');
registerPage('../frontend/frontend.css', '/frontend/frontend.css');
registerPage('../frontend/frontend.js', '/frontend/frontend.js');
registerPage('../frontend/loader.js', '/frontend/loader.js');
registerPage('../frontend/rsvp.min.js', '/frontend/rsvp.min.js');
registerPage('../frontend/graph.js', '/frontend/graph.js');
registerPage('../frontend/raphael-min.js', '/frontend/raphael-min.js');

configReader.getConfig().then(function (config) {
	store.connect(config.database).then(function () {
		dataServer(store.domains, '/data/domains');
		dataServer(store.subReddits, '/data/subreddits');
		dataServer(store.subscribers, '/data/subscribers');
		dataServer(store.types, '/data/types');
		dataServer(store.postIds, '/data/postIds');
		dataServer(store.authors, '/data/authors');
		dataServer(store.posts, '/data/posts');
		dataServer(store.positions, '/data/positions');
	});
});


app.listen(3000);

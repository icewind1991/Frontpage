var express = require('express');
var store = require('./store');
var fs = require('fs');
var nodePromise = require("node-promise");
var Promise = nodePromise.Promise;
var configReader = require('./config');
var app = express();

function dataServer(source, url) {
	app.get(url, function (req, res) {
		source.get().then(function (data) {
			res.send(data);
		});
	});
}

app.use(express.static(__dirname + '/../frontend'));

configReader.getConfig().then(function (config) {
	store.connect(config.database).then(function () {
		dataServer(store.domains, '/data/domains');
		dataServer(store.subReddits, '/data/subreddits');
		dataServer(store.subscribers, '/data/subscribers');
		dataServer(store.types, '/data/types');
		dataServer(store.postIds, '/data/postids');
		dataServer(store.authors, '/data/authors');
		dataServer(store.posts, '/data/posts');
		dataServer(store.positions, '/data/positions');
	});
	app.listen(config.port);
});

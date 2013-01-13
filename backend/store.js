var mysql = require('mysql');
var Promise = require("node-promise").Promise;

var connection;


var types = {
	self: 1,
	image: 2,
	video: 3,
	link: 4
};
types.get = function () {
	var promise = new Promise();
	promise.resolve({
		self: 1,
		image: 2,
		video: 3,
		link: 4
	});
	return promise;
};

function connect(options) {
	var promise = new Promise();
	connection = mysql.createConnection(options);
	connection.connect(function (err) {
		if (err) throw err;
		promise.resolve();
	});
	return promise;
}

function ObjectsStore(type) {
	if (!type) {
		throw 'No type specified';
	}
	this.type = type;
	this.cache = {};
	this.cached = false;
}
ObjectsStore.prototype = {};
ObjectsStore.prototype.getId = function (name) {
	var promise = new Promise(),
		that = this;
	this.get().then(function (objects) {
		for (var id in objects) {
			if (objects.hasOwnProperty(id)) {
				if (objects[id] === name) {
					promise.resolve(id);
					return;
				}
			}
		}
		connection.query('INSERT INTO ' + that.type + ' SET ?', {name: name}, function (err, result) {
			if (err) return;

			var id = result.insertId;
			that.cache[id] = name;
			promise.resolve(id);
		});
	});
	return promise;
};
ObjectsStore.prototype.get = function (id) {
	var promise = new Promise();
	if (this.cached) {
		if (id) {
			promise.resolve(this.cache[id]);
		} else {
			promise.resolve(this.cache);
		}
	} else {
		var that = this;
		connection.query('SELECT id, name FROM ' + that.type, function (err, rows) {
			if (err) throw err;

			that.cached = true;
			for (var i = 0; i < rows.length; i++) {
				that.cache[rows[i].id] = rows[i].name;
			}
			if (id) {
				promise.resolve(that.cache[id]);
			} else {
				promise.resolve(that.cache);
			}
		});
	}
	return promise;
};

var subReddits = new ObjectsStore('subreddits');
var domains = new ObjectsStore('domains');
var postIds = new ObjectsStore('post_ids');
var authors = new ObjectsStore('authors');

var subscribers = {};
subscribers.get = function (subreddit) {
	var promise = new Promise();
	if (subscribers.cached) {
		if (subreddit) {
			promise.resolve(subscribers.cache[subreddit]);
		} else {
			promise.resolve(subscribers.cache);
		}
	} else {
		connection.query('SELECT id, count, time FROM subscribers', function (err, rows) {
			if (err) throw err;

			subscribers.cached = true;
			for (var i = 0; i < rows.length; i++) {
				subscribers.cache[rows[i].id] = rows[i];
			}
			if (subreddit) {
				promise.resolve(subscribers.cache[subreddit]);
			} else {
				promise.resolve(subscribers.cache);
			}
		});
	}
	return promise;
};
subscribers.set = function (subreddit, count, now) {
	var promise = new Promise();
	now = now || Date.now() / 1000;
	connection.query('SELECT count FROM subscribers WHERE  time = ? AND id = ?', [now, subreddit], function (err, rows) {
		if (err) throw err;
		if (rows.length === 0) {
			connection.query('REPLACE INTO subscribers SET ?', {time: now, id: subreddit, count: count}, function (err) {
				if (err) throw err;

				promise.resolve();
			});
		}
	});
	return promise;

};
subscribers.cached = false;
subscribers.cache = {};

var posts = {};
posts.get = function (filter) {
	filter = filter || true;
	var promise = new Promise();
	connection.query('SELECT * FROM posts WHERE ?', filter, function (err, rows) {
		if (err) throw err;

		promise.resolve(rows);
	});
	return promise;
};
posts.set = function (data) {
	var promise = new Promise(), post = {};
	postIds.getId(data.id).then(function (id) {
		connection.query('SELECT id FROM posts WHERE id = ?', id, function (err, rows) {
			if (err) throw err;
			if (rows.length === 0) {
				authors.getId(data.author).then(function (author) {
					subReddits.getId(data.subreddit).then(function (subreddit) {
						domains.getId(data.domain).then(function (domain) {
							post.id = id;
							post.author = author;
							post.subreddit = subreddit;
							post.domain = domain;
							post.nsfw = data.nsfw;
							post.type = data.type;
							post.create = data.create;
							post.self_length = data.length;
							post.title_length = data.title.length;
							connection.query('REPLACE INTO posts SET ?', post, function (err) {
								if (err) throw err;
								promise.resolve();
							});
						});
					});
				});
			} else {
				promise.resolve();
			}
		});
	});
	return promise;
};

var positions = {};
positions.get = function (filter) {
	filter = filter || true;
	var promise = new Promise();
	connection.query('SELECT * FROM positions WHERE ?', filter, function (err, rows) {
		if (err) throw err;

		promise.resolve(rows);
	});
	return promise;
};
positions.set = function (data) {
	var promise = new Promise(), position = {};
	postIds.getId(data.id).then(function (id) {
		subReddits.getId(data.source).then(function (subreddit) {
			position.id = id;
			position.subreddit = subreddit;
			position.time = data.crawl_time;
			position.position = data.position;
			position.up = data.up;
			position.down = data.down;
			position.comments = data.comments;
			connection.query('INSERT INTO positions SET ?', position, function (err) {
				if (err) throw err;
				promise.resolve();
			});
		});
	});
	return promise;
};

module.exports.connect = connect;
module.exports.subReddits = subReddits;
module.exports.domains = domains;
module.exports.subscribers = subscribers;
module.exports.types = types;
module.exports.postIds = postIds;
module.exports.authors = authors;
module.exports.posts = posts;
module.exports.positions = positions;

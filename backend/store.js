var mysql = require('mysql');
var Promise = require("node-promise").Promise;

var connection;


var types = {
	self: 1,
	image: 2,
	video: 3,
	link: 4
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
		throw new 'No type specified';
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
			connection.query('REPLACE INTO subscribers SET ?', {time: now, id: subreddit, count: count}, function (err, result) {
				if (err) throw err;

				promise.resolve();
			});
		}
	});
	return promise;

};
subscribers.cached = false;
subscribers.cache = {};

var items = {};
items.get = function (filter) {
	filter = filter || true;
	var promise = new Promise();
	connection.query('SELECT * FROM items WHERE ?', filter, function (err, rows) {
		if (err) throw err;

		promise.resolve(rows);
	});
	return promise;
};
items.set = function (item) {
	var promise = new Promise();
	connection.query('INSERT INTO items SET ?', item, function (err, result) {
		if (err) throw err;

		promise.resolve();
	});
	return promise;
};

module.exports.connect = connect;
module.exports.subReddits = subReddits;
module.exports.domains = domains;
module.exports.subscribers = subscribers;
module.exports.types = types;
module.exports.items = items;

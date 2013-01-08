var restler = require('restler');
var Promise = require("node-promise").Promise;

function SubReddit(name) {
	this.name = name;
	this.url = (name) ? 'r/' + name : '';
}
SubReddit.prototype = {};
SubReddit.prototype.getSubscribers = function () {
	var promise = new Promise();
	subQueue.push({name: this.name, promise: promise, url: this.url});
	return promise;
};
SubReddit.prototype.getPosts = function (count) {
	count = count || 25;
	var promise = new Promise();
	restler.get('http://reddit.com/' + this.url + '.json?limit=' + count).on('complete', function (response) {
		if (!response.data || !response.data.children) {//reddit errors fail silently
			promise.resolve([]);
		}
		var i, children = [];
		for (i = 0; i < response.data.children.length; i++) {
			response.data.children[i].data.position = i + 1;
			children.push(response.data.children[i].data);
		}
		promise.resolve(children);
	});
	return promise;
};

var subQueue = [];

setInterval(function () {
	if (subQueue.length) {
		var item = subQueue.pop();
		getSubscribers(item.name, item.promise, item.url);
	}
}, 1000);

function getSubscribers(name, promise, url) {
	var that = this;
	restler.get('http://reddit.com/' + url + '/about.json').on('complete', function (response) {
		if (!response.data || !response.data.subscribers) {//reddit errors fail silently
			console.log('sub fail ' + name);
			return;
		}
		promise.resolve(response.data.subscribers);
	});
}

module.exports = SubReddit;

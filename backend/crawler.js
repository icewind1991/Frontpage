var nodePromise = require("node-promise");
var Promise = nodePromise.Promise;
var configReader = require('./config');
var SubReddit = require('./subreddit');
var store = require('./store');

configReader.getConfig().then(function (config) {
	store.connect(config.database).then(function () {
		setUpPosts(config.subreddits, config.interval, config.count);
		setUpSubscribers(getSubscriberSubreddits(config.subreddits, config.subscriberSubreddits), config.subscriberInterval);
	});
});

function getSubscriberSubreddits(reddits, subReddits) {
	for (var i = 0; i < reddits.length; i++) { //no frontpage and all
		if (reddits[i] && reddits[i] !== 'all') {
			subReddits.push(reddits[i]);
		}
	}
	return subReddits;
}

function setUpSubscribers(subreddits, interval) {
	for (var i = 0; i < subreddits.length; i++) {
		saveSubscribers(subreddits[i]);
	}
	setUpSubscribers.interval = setInterval(function () {
		var date = new Date();
		console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' - log subscribers');
		for (var i = 0; i < subreddits.length; i++) {
			saveSubscribers(subreddits[i]);
		}
	}, interval * 1000);
}
setUpSubscribers.interval = 0;

function setUpPosts(subreddits, interval, count) {
	var now = Date.now() / 1000;
	for (var i = 0; i < subreddits.length; i++) {
		crawl(subreddits[i], count, now);
	}
	setUpPosts.interval = setInterval(function () {
		var date = new Date();
		console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ' - log posts');
		var now = Date.now() / 1000;
		for (var i = 0; i < subreddits.length; i++) {
			crawl(subreddits[i], count, now);
		}
	}, interval * 1000);
}
setUpPosts.interval = 0;

function saveSubscribers(name) {
	var promise = new Promise(),
		subReddit = new SubReddit(name);
	subReddit.getSubscribers().then(function (count) {
		store.subReddits.getId(name).then(function (id) {
			store.subscribers.set(id, count).then(function () {
				promise.resolve();
			});
		});
	});
	return promise;
}

function savePost(post) {
	var promise = new Promise(),
		data = {},
		extension;
	if (post.domain.substr(0, 5) !== 'self.' && subDomain(post.domain)) {
		post.domain = post.domain.replace(/^[^.]+\./g, "");
	}
	if (post.domain === 'youtu.be') {
		post.domain = 'youtube.com';
	}
	data.position = post.position;
	data.id = post.id;
	data.up = post.ups;
	data.down = post.downs;
	data.crawl_time = Date.now() / 1000;
	data.author = post.author;
	data.comments = post.num_comments;
	data.create = post.created_utc;
	data.length = post.selftext.length;
	data.title = post.title;
	data.nsfw = post.over_18;
	if (post.is_self) {
		data.type = store.types.self;
	} else {
		extension = post.url.substr(-4);
		if (post.domain === 'youtube.com') {
			data.type = store.types.video;
		} else if (extension === '.jpg' || extension === '.png' ||
			post.domain === 'imgur.com' || post.domain === 'quickmeme.com' || post.domain === 'postimage.org' ||
			post.domain === 'qkme.me' || post.domain === 'gifboom.com') {
			data.type = store.types.image;
		} else {
			data.type = store.types.link;
		}
	}

	data.domain = post.domain;
	data.subreddit = post.subreddit;
	data.source = post.source;
	store.posts.set(data).then(function () {
		store.positions.set(data).then(function () {
			promise.resolve();
		});
	});
	return promise;
}

function crawl(name, count, now) {
	var promise = new Promise(),
		subReddit = new SubReddit(name);
	subReddit.getPosts(count).then(function (posts) {
		var subPromises = [], i;
		for (i = 0; i < posts.length; i++) {
			subPromises.push(savePost(posts[i]), now);
		}
		nodePromise.all(subPromises).then(function () {
			promise.resolve();
		});
	});
	return promise;
}

function subDomain(url) {

	// IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
	url = url.trim();

	// IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
	url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i), "");

	// IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
	url = url.replace(new RegExp(/^www\./i), "");

	// REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
	url = url.replace(new RegExp(/\/(.*)/), "");

	// REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
	if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
		url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i), "");

		// REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
	} else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
		url = url.replace(new RegExp(/\.[a-z]{2,4}$/i), "");
	}

	// CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
	return !!(url.match(/\./g));
}

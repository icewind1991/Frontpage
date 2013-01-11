var nodePromise = require("node-promise");
var Promise = nodePromise.Promise;
var configReader = require('./config');
var SubReddit = require('./subreddit');
var store = require('./store');

configReader.getConfig().then(function (config) {
	store.connect(config.database).then(function () {
		setUpPosts(config.subreddits, config.interval);
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
		console.log('log subscribers');
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
		console.log('log posts');
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
	data.position = post.position;
	data.post_id = post.id;
	data.up = post.ups;
	data.down = post.downs;
	data.crawl_time = Date.now() / 1000;
	data.author = post.author;
	data.comments = post.num_comments;
	data.create = post.created_utc;
	data.self_length = post.selftext.length;
	data.title_length = post.title.length;
	data.nsfw = post.over_18;
	if (post.is_self) {
		data.type = store.types.self;
	} else {
		extension = post.url.substr(-4);
		if (post.domain === 'youtube.com' || post.domain === 'youtu.be') {
			data.type = store.types.video;
		} else if (extension === '.jpg' || extension === '.png' || post.domain === 'imgur.com') {
			data.type = store.types.image;
		} else {
			data.type = store.types.link;
		}
	}

	store.subReddits.getId(post.subreddit).then(function (id) {
		store.domains.getId(post.domain).then(function (domain) {
			store.subReddits.getId(post.source).then(function (source) {
				data.domain = domain;
				data.subreddit = id;
				data.source = source;
				store.items.set(data).then(function () {
					promise.resolve();
				});
			});
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

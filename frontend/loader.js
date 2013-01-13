function loadData(progressListener) {
	var promise = new RSVP.Promise();
	if (!progressListener) {
		progressListener = {};
		RSVP.EventTarget.mixin(progressListener);
	}
	progressListener.trigger('load');
	loadSingle('domains', progressListener).then(function (domains) {
		loadSingle('subreddits', progressListener).then(function (subreddits) {
			loadSingle('subscribers', progressListener).then(function (subscribers) {
				loadSingle('types', progressListener).then(function (types) {
					loadSingle('authors', progressListener).then(function (authors) {
						loadSingle('posts', progressListener).then(function (posts) {
							loadSingle('positions', progressListener).then(function (positions) {
								progressListener.trigger('process');
								var result = processData(domains, subreddits, subscribers, types, authors, posts, positions);
								promise.resolve(result);
							});
						});
					});
				});
			});
		});
	});
	return promise;
}

function getType(id, types) {
	if (!getType.cache) {
		for (var name in types) {
			if (types.hasOwnProperty(name)) {
				getType.cache[types[name]] = name;
			}
		}
	}
	return getType.cache[id];
}
getType.cache = {};
getType.cached = false;

function processData(domains, subreddits, subscribers, types, authors, posts, positions) {
	var i, j, postitions, id, firstPos, lastPos, postPositions = {};
	for (i = 0; i < positions.length; i++) {
		id = positions[i].id;
		if (!postPositions[id]) {
			postPositions[id] = [];
		}
		postPositions[id].push(positions[i]);
	}
	for (i = 0; i < posts.length; i++) {
		posts[i].domain = domains[posts[i].domain];
		posts[i].subreddit = subreddits[posts[i].subreddit];
		posts[i].source = subreddits[posts[i].source];
		posts[i].author = authors[posts[i].author];
		posts[i].positions = postPositions[posts[i].id];
		if (posts[i].positions && posts[i].positions.length > 0) {
			postitions = posts[i].positions;
			firstPos = postitions[0];
			lastPos = postitions[postitions.length - 1];
			posts[i].duration = lastPos.time - firstPos.time;
			posts[i].max = Data.min(postitions, 'position');
		}
		else {
			posts[i].duration = 0;
			posts[i].max = 100;
		}
		posts[i].up = Data.min(postitions, 'up');
		posts[i].down = Data.min(postitions, 'down');
		posts[i].comments = Data.min(postitions, 'comments');
	}
	return posts;
}

function loadSingle(type, progressListener) {
	var promise = new RSVP.Promise();
	$.ajax({
		url: "/data/" + type,
		dataType: 'json',
		xhr: function () {
			xhr = jQuery.ajaxSettings.xhr();
			interval = setInterval(function () {
				if (xhr.readyState > 2) {
					total = parseInt(xhr.getResponseHeader('Content-length'));
					completed = parseInt(xhr.responseText.length);
					percentage = (100.0 / total * completed).toFixed(2);

					progressListener.trigger('download', {type: type, percentage: percentage});
				}
			}, 10);
			return xhr;
		},
		complete: function () {
			clearInterval(interval);
		},
		success: function (data) {
			promise.resolve(data);
		}
	});
	return promise;
}


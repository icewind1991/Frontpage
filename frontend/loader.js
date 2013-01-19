var types = {
	self: 1,
	image: 2,
	video: 3,
	link: 4
};
var typesReverse = {
	1: 'Self',
	2: 'Image',
	3: 'Video',
	4: 'Link'
};

var globalSubreddits = [];

function loadData(progressListener) {
	var promise = new RSVP.Promise();
	if (!progressListener) {
		progressListener = {};
		RSVP.EventTarget.mixin(progressListener);
	}
	progressListener.trigger('load');
	loadSingle('domains', progressListener).then(function (domains) {
		loadSingle('subreddits', progressListener).then(function (subreddits) {
			globalSubreddits = subreddits;
			loadSingle('subscribers', progressListener).then(function (subscribers) {
				loadSingle('authors', progressListener).then(function (authors) {
					loadSingle('posts', progressListener).then(function (posts) {
						loadSingle('postids', progressListener).then(function (postIds) {
							loadSingle('positions', progressListener).then(function (positions) {
								progressListener.trigger('process');
								var result = processData(domains, subreddits, subscribers, authors, posts, positions, postIds);
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

function processData(domains, subreddits, subscribers, authors, posts, positions, postIds) {
	var i, j, id, startAll, startFront, postPositions = {}, allId, frontId;
	for (i = 0; i < positions.length; i++) {
		id = positions[i].id;
		if (!postPositions[id]) {
			postPositions[id] = [];
		}
		postPositions[id].push(positions[i]);
	}
	for (i in subreddits) {
		if (subreddits.hasOwnProperty(i)) {
			if (subreddits[i] == 'all') {
				allId = i;
			}
			if (subreddits[i] == '') {
				frontId = i;
			}
		}
	}
	for (i = 0; i < posts.length; i++) {
		posts[i].domain = domains[posts[i].domain];
		posts[i].subreddit = subreddits[posts[i].subreddit];
		posts[i].source = subreddits[posts[i].source];
		posts[i].author = authors[posts[i].author];
		posts[i].redditId = postIds[posts[i].id];
		posts[i].positions = postPositions[posts[i].id];
		posts[i].type = typesReverse[posts[i].type];
		posts[i].nsfwLabel = (posts[i].nsfw) ? 'NSFW' : 'SFW';
		if (posts[i].positions && posts[i].positions.length > 0) {
			pos = posts[i].positions;
			posts[i].maxAll = 101;
			posts[i].maxFront = 101;
			startAll = 0;
			startFront = 0;
			posts[i].durationAll = 0;
			posts[i].durationFront = 0;
			posts[i].positionsAll = [];
			posts[i].positionsFront = [];
			for (j = 0; j < pos.length; j++) {
				pos[j].age = (pos[j].time - posts[i].create) / 60;
				if (pos[j].subreddit == allId) {
					if (pos[j].position < posts[i].maxAll) {
						posts[i].maxAll = pos[j].position;
					}
					if (!startAll) {
						startAll = pos[j].time;
					}
					posts[i].durationAll = pos[j].time - startAll;
					posts[i].positionsAll.push(pos[j]);
				}
				if (pos[j].subreddit == frontId) {
					if (pos[j].position < posts[i].maxFront) {
						posts[i].maxFront = pos[j].position;
					}
					if (!startFront) {
						startFront = pos[j].time;
					}
					posts[i].durationFront = pos[j].time - startFront;
					posts[i].positionsFront.push(pos[j]);
				}
			}
		}
		else {
			posts[i].durationAll = 0;
			posts[i].durationFront = 0;
			posts[i].maxAll = 100;
			posts[i].maxFront = 100;
		}
		posts[i].up = Data.min(pos, 'up');
		posts[i].down = Data.min(pos, 'down');
		posts[i].comments = Data.min(pos, 'comments');
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


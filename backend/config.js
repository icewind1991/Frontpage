var Promise = require("node-promise").Promise;
var fs = require('fs');

function getConfig() {
	var promise = new Promise();
	fs.readFile(__dirname + '/../config.json', 'utf8', function (err, data) {
		if (err) {
			throw err;
		}
		promise.resolve(JSON.parse(data));
	});
	return promise;
}

module.exports.getConfig = getConfig;

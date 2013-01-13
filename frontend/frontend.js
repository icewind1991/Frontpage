var Data = {};

Data.match = function (object, filter) {
	var context, parts, part;
	for (var name in filter) {
		if (filter.hasOwnProperty(name)) {
			context = object;
			if (name.indexOf('.')) {
				parts = name.explode('.');
				while (parts.length > 1) {
					part = parts.splice(0, 1);
					if (context[part]) {
						context = context[part];
					} else {
						context = {};
					}
				}
				name = parts[0];
			}
			if (context[name] !== filter[name]) {
				return false;
			}
		}
	}
	return true;
};

Data.reduce = function (data, filter) {
	var result = [];
	for (var i = 0; i < data.length; i++) {
		if (match(data[i], filter)) {
			result.push(data[i]);
		}
	}
	return result;
};

Data.size = function (data) {
	var size = 0, key;
	for (key in data) {
		if (data.hasOwnProperty(key)) size++;
	}
	return size;
};

Data.max = function (data, field) {
	var result = data[0][field];
	for (var i = 1; i < data.length; i++) {
		if (data[i][field] > result) {
			result = data[i][field];
		}
	}
	return result;
};

Data.min = function (data, field) {
	var result = data[0][field];
	for (var i = 1; i < data.length; i++) {
		if (data[i][field] < result) {
			result = data[i][field];
		}
	}
	return result;
};

Data.count = function (data, field) {
	var val;
	result = {};
	for (var i = 0; i < data.length; i++) {
		val = data[i][field];
		if (!result[val]) {
			result[val] = 0;
		}
		result[val]++;
	}
	return result;
};

Data.group = function (data, field) {
	var val;
	result = {};
	for (var i = 0; i < data.length; i++) {
		val = data[i][field];
		if (!result[val]) {
			result[val] = [];
		}
		result[val].push(data[i]);
	}
	return result;
};

Data.select = function (data, fields) {
	var result = [];
	for (var i = 0; i < data.length; i++) {
		var item = [];
		for (var j = 0; j < fields.length; j++) {
			item.push(data[i][fields[j]]);
		}
		result.push(item);
	}
	return result;
};

Data.splitObject = function (data) {
	var keys = Object.keys(data),
		values = [], i;
	for (i = 0; i < keys.length; i++) {
		values.push(data[keys[i]]);
	}
	return {values: values, keys: keys};
};

Data.sortObject = function (data, field) {
	var sortable = [], i, result = {};
	for (i in data) {
		if (data.hasOwnProperty(i)) {
			sortable.push({key: i, value: data[i]});
		}
	}
	if (field === 'length') {
		sortable.sort(function (a, b) {
			return b.value.length - a.value.length;
		});
	} else if (field) {
		sortable.sort(function (a, b) {
			return b.value[field] - a.value[field];
		});
	} else {
		sortable.sort(function (a, b) {
			return b.value[field] - a.value[field];
		});
	}
	for (i = 0; i < sortable.length; i++) {
		result[sortable[i].key] = sortable[i].value;
	}
	return result;
};

Data.sort = function (data, field) {
	if (field === 'length') {
		data.sort(function (a, b) {
			return a.length - b.length;
		});
	} else {
		data.sort(function (a, b) {

			return a[field] - b[field];
		});
	}
	return data;
};

Data.first = function (data, count) {
	var result = {}, name, i=0;
	for (name in data) {
		if (data.hasOwnProperty(name)) {
			i++;
			result[name] = data[name];
			if (i >= count) {
				return result;
			}
		}
	}
	return result;
};

var globalData;
$(document).ready(function () {
	loadData().then(function (data) {
		globalData = data;
//		var counts = Data.count(data, 'subreddit');
//		counts = Data.sortObject(counts);
//		Raphael("holder", 700, 700).pieChart(350, 350, 200, counts, "#fff");
		var rel = Data.select(data, ['up', 'comments', 'subreddit']);
		rel = Data.group(rel, 2);
		rel = Data.sortObject(rel, 'length');
		rel = Data.first(rel, 10);
		Raphael("holder", 700, 700).scatterPlot(600, 600, rel);
	});
});

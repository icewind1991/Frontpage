var Data = {};

Data.match = function (object, filter) {
	var context, parts, part;
	for (var name in filter) {
		if (filter.hasOwnProperty(name)) {
			context = object;
			if (name.indexOf('.')) {
				parts = name.split('.');
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

Data.filter = function (data, filter, not) {
	var result = [];
	for (var i = 0; i < data.length; i++) {
		if (Data.match(data[i], filter)) {
			if (!not || !Data.match(data[i], not)) {
				result.push(data[i]);
			}
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
			return b.value - a.value;
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
	var result = {}, name, i = 0;
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

Data.split = function (data, count) {
	var first = {}, last = {}, name, i = 0;
	for (name in data) {
		if (data.hasOwnProperty(name)) {
			i++;
			if (i < count) {
				first[name] = data[name];
			} else {
				last[name] = data[name];
			}
		}
	}
	return {
		first: first,
		last: last
	};
};

Data.sum = function (data) {
	var name, result = 0;
	for (name in data) {
		if (data.hasOwnProperty(name)) {
			result += data[name];
		}
	}
	return result;
};

var globalData;
$(document).ready(function () {
	loadData().then(function (data) {
		globalData = data;
		renderScatter();
		$('#scatter_x').change(renderScatter);
		$('#scatter_y').change(renderScatter);
		$('#scatter_color').change(renderScatter);
		$('#scatter_color_count').change(renderScatter);

		renderPie();
		$('#pie_option').change(renderPie);
		$('#pie_count').change(renderPie);
	});
});

function renderScatter() {
	var x, y, color, count, rel = globalData;
	x = $('#scatter_x').val();
	y = $('#scatter_y').val();
	if (x.indexOf('All') > 1 || y.indexOf('All') > 1) {
		rel = Data.filter(rel, {}, {maxAll: 101});
	}
	if (x.indexOf('Front') > 1 || y.indexOf('Front') > 1) {
		rel = Data.filter(rel, {}, {maxFront: 101});
	}
	if (x == 'self_length' || y == 'self_length') {
		rel = Data.filter(rel, {}, {self_length: 0});
	}
	color = $('#scatter_color').val();
	count = $('#scatter_color_count').val();
	rel = Data.select(rel, [x, y, color]);
	rel = Data.group(rel, 2);
	rel = Data.sortObject(rel, 'length');
	rel = Data.first(rel, count);
	if (!renderScatter.paper) {
		renderScatter.paper = Raphael("scatter", 700, 700)
	}
	renderScatter.paper.clear();
	renderScatter.paper.scatterPlot(600, 600, rel);
}

renderScatter.paper = null;

function renderPie() {
	var counts, color, count, split;
	if (!renderPie.paper) {
		renderPie.paper = Raphael("pie", 700, 700)
	}
	color = $('#pie_option').val();
	count = $('#pie_count').val();
	counts = Data.count(globalData, color);
	counts = Data.sortObject(counts);
	split = Data.split(counts, count);
	counts = split.first;
	counts['Other'] = Data.sum(split.last);
	renderPie.paper.pieChart(350, 350, 200, counts, "#fff");
}

renderPie.paper = null;

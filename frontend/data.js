var Data = {};

Data.map = function (data, fn) {
	var result = [], i;
	for (i = 0; i < data.length; i++) {
		result.push(fn(data[i], i));
	}
	return result;
};

Data.toArray = function (data) {
	var result = [], i;
	for (i in data) {
		if (data.hasOwnProperty(i)) {
			result.push(data[i]);
		}
	}
	return result;
};

Data.movingAverage = function (data, size) {
	var result = [], i, j, start, end, sum, item;
	size = size / 2;
	for (i = 0; i < data.length; i++) {
		sum = 0;
		item = [];
		start = Math.max(0, i - size);
		end = Math.min(data.length, i + size);
		for (j = start; j < end; j++) {
			sum += data[j][1];
		}
		item.push(data[i][0]);
		item.push(sum / (end - start));
		result.push(item);
	}
	return result;
};

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
			if (filter[name] instanceof Array) {
				if (filter[name].indexOf(context[name]) === -1) {
					return false;
				}
			} else {
				if (context[name] !== filter[name]) {
					return false;
				}
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

Data.selectOne = function (data, field) {
	var result = [];
	for (var i = 0; i < data.length; i++) {
		if (data[i][field]) {
			result.push(data[i][field]);
		}
	}
	return result;
};

Data.flattenArray = function (data) {
	var result = [];
	result = result.concat.apply(result, data);
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

Data.average = function (data, index, fields) {
	var result = {}, values = {}, name, i, j, item, sums, indexValue;
	for (i = 0; i < data.length; i++) {
		indexValue = data[i][index];
		if (!values[indexValue]) {
			values[indexValue] = [];
		}
		item = {};
		for (j = 0; j < fields.length; j++) {
			item[fields[j]] = data[i][fields[j]];
		}
		values[indexValue].push(item);
	}
	for (name in values) {
		if (values.hasOwnProperty(name)) {
			sums = {};
			for (j = 0; j < fields.length; j++) {
				sums[j] = 0;
			}
			item = {};
			for (i = 0; i < values[name].length; i++) {
				for (j = 0; j < fields.length; j++) {
					sums[j] += values[name][i][fields[j]];
				}
			}
			for (j = 0; j < fields.length; j++) {
				item[fields[j]] = sums[j] / values[name].length;
			}
			result[name] = item;
		}
	}
	return result;
};

Data.linearFit = function (data, xIndex, yIndex) {
	var sum_x = 0,
		sum_y = 0,
		sum_xy = 0,
		sum_xx = 0,
		count = 0,
		x = 0,
		y = 0,
		v, result = [], m, b, item;

	for (v = 0; v < data.length; v++) {
		x = data[v][xIndex];
		y = data[v][yIndex];
		sum_x += x;
		sum_y += y;
		sum_xx += x * x;
		sum_xy += x * y;
		count++;
	}

	m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
	b = (sum_y / count) - (m * sum_x) / count;

	for (v = 0; v < data.length; v++) {
		x = data[v][xIndex];
		y = x * m + b;
		if (typeof xIndex === 'number' && typeof yIndex === 'number') {
			result.push([x, y]);
		} else {
			item = {};
			item[xIndex] = x;
			item[yIndex] = y;
			result.push(item);
		}
	}
	return result;
};

Data.fit = function (data, xIndex, yIndex, order, values) {
	var i, pairs = [], result, coefficients, fn, xMin, xMax, step, x, y;
	values = values || 100;
	xMin = Data.min(data, xIndex);
	xMax = Data.max(data, xIndex);
	for (i = 0; i < data.length; i++) {
		pairs.push(new Pair(data[i][xIndex], data[i][yIndex]));
	}
	coefficients = compute_coefficients(pairs, order);
	fn = function (x) {
		var y = 0, i;
		for (i = 0; i < coefficients.length; i++) {
			y += coefficients[i] * Math.pow(x, i);
		}
		return y;
	};
	result = [];
	step = (xMax - xMin) / values;
	for (x = xMin; x < xMax; x += step) {
		y = fn(x);
		result.push([x, y]);
	}
	return result;
};

Data.fitAverage = function (data, xIndex, yIndex, order, values) {
	var j, i, pairs, result, coefficients = [], fn, xMin, xMax, step, x, y, partMax, partMin, weights = [], total = 0, avg;
	xMin = -1;
	xMax = 0;
	values = values || 100;
	for (j = 0; j < data.length; j++) {
		if (data[j].length > 1) {
			pairs = [];
			partMin = Data.min(data[j], xIndex);
			partMax = Data.max(data[j], xIndex);
			if (partMin < xMin || xMin == -1) {
				xMin = partMin;
			}
			if (partMax > xMax) {
				xMax = partMax;
			}
			for (i = 0; i < data[j].length; i++) {
				pairs.push(new Pair(data[j][i][xIndex], data[j][i][yIndex]));
			}
			coefficients.push(compute_coefficients(pairs, order));
			weights.push(partMax - partMin);
			total += partMax - partMin;
		}
	}
	avg = [];
	for (i = 0; i < order + 1; i++) {
		avg.push(0);
	}
	for (i = 0; i < coefficients.length; i++) {
		for (j = 0; j < order + 1; j++) {
			avg[j] += coefficients[i][j] * weights[i] / total;
		}
	}
	fn = function (x) {
		var y = 0, i;
		for (i = 0; i < avg.length; i++) {
			y += avg[i] * Math.pow(x, i);
		}
		return y;
	};
	result = [];
	step = (xMax - xMin) / values;
	for (x = xMin; x < xMax; x += step) {
		y = fn(x);
		result.push([x, y]);
	}
	return result;
};

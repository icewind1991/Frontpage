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
		$('#pie_source').change(renderPie);
		$('#pie_type').change(renderPie);
		$('#pie_nsfw').change(renderPie);

		renderPositions();
		$('#line_color').change(renderPositions);
		$('#line_y').change(renderPositions);
		$('#line_count').change(renderPositions);
		$('#line_order').change(renderPositions);
	});
});

function renderScatter() {
	var x, y, color, count, rel = globalData, xTitle, yTitle;
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
	xTitle = $('#scatter_x').children("option:selected").text();
	yTitle = $('#scatter_y').children("option:selected").text();
	rel = Data.select(rel, [x, y, color]);
	rel = Data.group(rel, 2);
	rel = Data.sortObject(rel, 'length');
	rel = Data.first(rel, count);
	if (!renderScatter.paper) {
		renderScatter.paper = Raphael("scatter", 800, 800)
	}
	renderScatter.paper.clear();
	renderScatter.paper.scatterPlot(605, 605, rel, xTitle, yTitle);
}
renderScatter.paper = null;

function renderPie() {
	var counts, color, count, split, source, data, other, type, nsfw;
	if (!renderPie.paper) {
		renderPie.paper = Raphael("pie", 700, 700)
	}
	data = globalData;
	color = $('#pie_option').val();
	count = $('#pie_count').val();
	source = $('#pie_source').val();
	type = $('#pie_type').val();
	nsfw = $('#pie_nsfw').val();
	if (source === 'frontpage') {
		data = Data.filter(data, {}, {maxFront: 101});
	}
	if (source === 'all') {
		data = Data.filter(data, {}, {maxAll: 0});
	}
	if (type !== 'all') {
		data = Data.filter(data, {type: type});
	}
	if (nsfw !== 'all') {
		data = Data.filter(data, {nsfwLabel: nsfw});
	}
	counts = Data.count(data, color);
	counts = Data.sortObject(counts);
	split = Data.split(counts, count);
	counts = split.first;
	other = Data.sum(split.last);
	if (other) {
		counts['Other'] = other;
	}
	renderPie.paper.clear();
	renderPie.paper.pieChart(350, 350, 200, counts, "#fff", 10, 100);
}
renderPie.paper = null;

function renderPositions() {
	var data, source, groups = {}, i, groupBy, group, x, y, max, order;
	if (!renderPositions.paper) {
		renderPositions.paper = Raphael("line", 700, 700)
	}
	source = 'positionsAll';
	groupBy = $('#line_color').val();
	x = 'age';
	y = $('#line_y').val();
	order = parseInt($('#line_order').val(), 10);
	max = $('#line_count').val();
	data = globalData;
	data = Data.group(data, groupBy);
	data = Data.sortObject(data, 'length');
	data = Data.first(data, max);
	for (i in data) {
		if (data.hasOwnProperty(i)) {
			data[i] = Data.selectOne(data[i], source);
			data[i] = Data.flattenArray(data[i], source);
			data[i] = Data.fit(data[i], x, y, order);
//			data[i] = Data.fitAverage(data[i], x, y, order);
		}
	}
	renderPositions.paper.clear();
	renderPositions.paper.lineGraph(600, 600, data);

}
renderPositions.paper = null;

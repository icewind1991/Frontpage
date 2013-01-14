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
	renderPie.paper.pieChart(350, 350, 200, counts, "#fff");
}

renderPie.paper = null;

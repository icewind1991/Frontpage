Raphael.fn.scatterPlot = function (width, height, groups) {
	var paper = this,
		count = Data.size(groups),
		name, i, scaleX, scaleY, maxX = 0, maxY = 0,
		color, circle, txt,
		labels = {};

	for (name in groups) {
		if (groups.hasOwnProperty(name)) {
			for (i = 0; i < groups[name].length; i++) {
				if (groups[name][i][0] > maxX) {
					maxX = groups[name][i][0];
				}
				if (groups[name][i][1] > maxY) {
					maxY = groups[name][i][1];
				}
			}
		}
	}
	scaleX = (width - 10) / maxX;
	scaleY = (height - 10) / maxY;

	plotGroup = function (data, label, color) {
		var x, y, i;
		for (i = 0; i < data.length; i++) {
			x = (data[i][0] * scaleX) + 5;
			y = (height - data[i][1] * scaleY) + 5;
			var circle = paper.circle(x, y, 3);
			circle.attr("fill", color);
			circle.attr("stroke", color);
			circle.mouseover(function (circle) {
				circle.stop().animate({
					transform: "s2"
				}, 100, "elastic");
				labels[label].stop().attr({
					"font-weight": "bold"
				});
			}.bind(null, circle));
			circle.mouseout(function (circle) {
				circle.stop().animate({
					transform: ""
				}, 100, "elastic");
				labels[label].stop().attr({
					"font-weight": ""
				});
			}.bind(null, circle));
		}
	};
	i = 0;
	for (name in groups) {
		if (groups.hasOwnProperty(name)) {
			color = Raphael.hsb(i / count, 1, 1);
			plotGroup(groups[name], name, color);
			i++;
			circle = paper.circle(5, i * 15, 3);
			circle.attr("fill", color);
			circle.attr("stroke", color);
			txt = paper.text(17, i * 15, name).attr({
				fill: "black",
				stroke: "none",
				"font-size": 15,
				'text-anchor': 'start'
			});
			labels[name] = txt;
		}
	}
};

Raphael.fn.pieChart = function (cx, cy, r, data, stroke) {
	var paper = this,
		rad = Math.PI / 180,
		chart = this.set(),
		labels = Object.keys(data),
		values = [];
	for (var i = 0; i < labels.length; i++) {
		values.push(data[labels[i]]);
	}

	function sector(cx, cy, r, startAngle, endAngle, params) {
		var x1 = cx + r * Math.cos(-startAngle * rad),
			x2 = cx + r * Math.cos(-endAngle * rad),
			y1 = cy + r * Math.sin(-startAngle * rad),
			y2 = cy + r * Math.sin(-endAngle * rad);
		return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
	}

	var angle = 0,
		total = 0,
		start = 0,
		process = function (j) {
			var value = values[j],
				angleplus = 360 * value / total,
				popangle = angle + (angleplus / 2),
				color = Raphael.hsb(start, .75, 1),
				ms = 500,
				delta = 30,
				bcolor = Raphael.hsb(start, 1, 1),
				p = sector(cx, cy, r, angle, angle + angleplus, {
					fill: "90-" + bcolor + "-" + color,
					stroke: stroke,
					"stroke-width": 3
				}),
				txt = paper.text(cx + (r + delta + 55) * Math.cos(-popangle * rad), cy + (r + delta + 25) * Math.sin(-popangle * rad), labels[j] + ": " + value).attr({
					fill: bcolor,
					stroke: "none",
					opacity: 0,
					"font-size": 20
				});
			p.mouseover(function () {
				p.stop().animate({
					transform: "s1.1 1.1 " + cx + " " + cy
				}, ms, "elastic");
				txt.stop().animate({
					opacity: 1
				}, ms, "elastic");
			}).mouseout(function () {
					p.stop().animate({
						transform: ""
					}, ms, "elastic");
					txt.stop().animate({
						opacity: 0
					}, ms);
				});
			angle += angleplus;
			chart.push(p);
			chart.push(txt);
			start += .1;
		};
	for (i = 0, ii = values.length; i < ii; i++) {
		total += values[i];
	}
	for (i = 0; i < ii; i++) {
		process(i);
	}
	return chart;
};

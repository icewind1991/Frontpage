Raphael.fn.drawGenericAxis = function (width, height, xTitle, yTitle, xSteps, ySteps) {
	var paper, i, txt;
	paper = this;
	paper.path('M 50, 5 L 50, ' + (height + 10) + ' L ' + (width + 55) + ', ' + (height + 10));
	for (i in xSteps) {
		if (xSteps.hasOwnProperty(i)) {
			i = parseInt(i, 10);
			paper.path('M ' + (55 + i) + ', ' + (height + 10) + ' L ' + (55 + i) + ', ' + (height + 5));
			paper.text((55 + i), (height + 20), xSteps[i]);
		}
	}
	for (i in ySteps) {
		if (ySteps.hasOwnProperty(i)) {
			i = parseInt(i, 10);
			paper.path('M 50, ' + (5 + height - i) + ' L 55, ' + (5 + height - i));
			txt = paper.text(45, (5 + height - i), ySteps[i]);
			txt.attr({
				'text-anchor': 'end'
			});
		}
	}

	txt = paper.text(width / 2, height + 40, xTitle);
	txt.attr({
		"font-size": 15
	});
	txt = paper.text(7, height / 2, yTitle);
	txt.attr({
		'transform': 'r90',
		"font-size": 15
	});
};

Raphael.fn.drawAxis = function (width, height, xTitle, yTitle, xScale, yScale, flipX, flipY) {
	var i, xSteps = {}, ySteps = {};
	for (i = 0; i < width; i += 50) {
		if (flipX) {
			xSteps[width - i] = Math.round(i / xScale);
		} else {
			xSteps[i] = Math.round(i / xScale);
		}
	}
	for (i = 0; i < height; i += 50) {
		if (flipY) {
			ySteps[height - i] = Math.round(i / yScale);
		} else {
			ySteps[i] = Math.round(i / yScale);
		}
	}
	this.drawGenericAxis(width, height, xTitle, yTitle, xSteps, ySteps);
};

Raphael.fn.scatterPlot = function (width, height, groups, xLabel, yLabel, flipX, flipY, linkIndex) {
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
	scaleX = (width) / maxX;
	scaleY = (height) / maxY;

	paper.drawAxis(width, height, xLabel, yLabel, scaleX, scaleY, flipX, flipY);

	plotGroup = function (data, label, color) {
		var x, y, i, link;
		for (i = 0; i < data.length; i++) {
			link = data[i][linkIndex];
			if (flipX) {
				x = ((maxX - data[i][0]) * scaleX) + 55;
			} else {
				x = (data[i][0] * scaleX) + 55;
			}
			if (flipY) {
				y = (height - (maxY - data[i][1]) * scaleY) + 5;
			} else {
				y = (height - data[i][1] * scaleY) + 5;
			}
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
			circle.click(function (id) {
				window.open('http://reddit.com/' + id);
			}.bind(null, link));
		}
	};
	i = 0;
	for (name in groups) {
		if (groups.hasOwnProperty(name)) {
			color = Raphael.hsb(i / count, 1, 1);
			plotGroup(groups[name], name, color);
			i++;
			circle = paper.circle(width + 75, i * 15, 3);
			circle.attr("fill", color);
			circle.attr("stroke", color);
			txt = paper.text(width + 82, i * 15, name).attr({
				fill: "black",
				stroke: "none",
				"font-size": 15,
				'text-anchor': 'start'
			});
			labels[name] = txt;
		}
	}
};

Raphael.fn.pieChart = function (cx, cy, r, data, stroke, lx, ly) {
	var paper = this,
		rad = Math.PI / 180,
		chart = this.set(),
		labels = Object.keys(data),
		values = [], i;
	for (i = 0; i < labels.length; i++) {
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
				circle, txt,
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
			circle = paper.circle(lx, ly + j * 15, 3);
			circle.attr("fill", color);
			circle.attr("stroke", color);
			paper.text(lx + 10, ly + j * 15, labels[j]).attr({
				fill: "black",
				"font-size": 15,
				'text-anchor': 'start'
			});
			labels[name] = txt;
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

Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
	color = color || "#000";
	var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
		rowHeight = h / hv,
		columnWidth = w / wv;
	for (var i = 1; i < hv; i++) {
		path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
	}
	for (i = 1; i < wv; i++) {
		path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
	}
	return this.path(path.join(",")).attr({
		stroke: color
	});
};

Raphael.fn.lineGraph = function (width, height, groups) {
	var maxX = 0, maxY = 0, scaleX, scaleY, name, i, data, colorIndex = 0, groupCount = 0, color, labels = {}, paper, xOff, yOff;
	xOff = 55;
	yOff = 5;
	paper = this;
	for (name in groups) {
		if (groups.hasOwnProperty(name)) {
			groupCount++;
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
	drawGroup = function (name, data, color) {
		var x, y, line, path, txt, circle, i;
		x = data[0][0] * scaleX + xOff;
		y = height - data[0][1] * scaleY + yOff;
		path = 'M ' + x + ',' + y;
		for (i = 1; i < data.length; i++) {
			x = data[i][0] * scaleX + xOff;
			y = height - data[i][1] * scaleY + yOff;
			path += ' L ' + x + ',' + y;
		}
		line = paper.path(path);
		line.attr({
			'stroke': color,
			"stroke-width": 2
		});

		line.mouseover(function () {
			this.stop().animate({
				"stroke-width": 3
			}, 100, "elastic");
			labels[name].stop().attr({
				"font-weight": "bold"
			});
		});
		line.mouseout(function () {
			this.stop().animate({
				"stroke-width": 2
			}, 100, "elastic");
			labels[name].stop().attr({
				"font-weight": ""
			});
		});
		circle = paper.circle(width + xOff + 5, colorIndex * 15, 3);
		circle.attr("fill", color);
		circle.attr("stroke", color);
		txt = paper.text(width + xOff + 17, colorIndex * 15, name).attr({
			fill: "black",
			stroke: "none",
			"font-size": 15,
			'text-anchor': 'start'
		});
		labels[name] = txt;
	};
	for (name in groups) {
		if (groups.hasOwnProperty(name)) {
			data = groups[name];
			color = Raphael.hsb(colorIndex / groupCount, 1, 1);
			colorIndex++;
			drawGroup(name, data, color);
		}
	}
};

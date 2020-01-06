dot = {
	init: (color_value, level) => new Object({
		offset: 0,
		level,
		color: color_value,
		died: false,
	})
}

bar = {
	init: (color_value) => new Object({
		height: 0,
		color: color_value,
	})
}

galton = {
	width: 800,
	height: 600,
	max_height: 100,
	bars: null,
	initBars: (barsNumber, color_choose) => Array(barsNumber).fill().map(_ => bar.init(color_choose())),
	dotsNumber: 600,
	dots: null,
	initDots: (dotsNumber, color_choose, level_choose) => Array(dotsNumber).fill().map(_ => dot.init(color_choose(), level_choose())),
	step: (dots, binary_choose, bars, level_limit, color_mix, is_over) => {
		dots.forEach(dot => {
			if (!dot.died) {
				dot.level += 1;
				dot.offset += binary_choose();
				if (dot.level >= level_limit) {
					const touched_bar = bars[dot.offset];
					touched_bar.color = color_mix(touched_bar.color, dot.color, touched_bar.height, 1);
					touched_bar.height += 1;
					if (is_over) {
						dot.died = true;
					}			
					dot.level = 0;
					dot.offset = 0;
				} else if (dot.level < 0) {
					dot.offset = 0;
				}
			}
		});
	},
	scale_x: (x, center_x, scale) => (x - center_x) * scale + center_x,
	scale: 7,
	normal_distribution: null,
	normal_distribution_height_coeff: 7,
	normal_distribution_standart_deviation: 85,
}

function setup() {
	galton.binary_choose = () => random([0, 1]);
	galton.color_choose = () => color(`hsb(${round(random(360))}, 100%, 100%)`);
	galton.level_choose = () => -round(random(galton.height));
	galton.color_mix = (a, b, a_count, b_count) => lerpColor(a, b, b_count / (a_count + b_count));
	galton.normal_distribution = (x, mu, sig, pi) => exp(-pow(x-mu, 2)/(2*pow(sig, 2)))/(sig*sqrt(2*pi));
	galton.bars = galton.initBars(galton.height, () => color(0));
	galton.dots = galton.initDots(galton.dotsNumber, galton.color_choose, galton.level_choose);
	createCanvas(galton.width, galton.height);
}

function draw() {
	background(220, 50);

	let max_height = 0;
	let sum_height = 0;
	for (const bar_index in galton.bars) {
		const height = galton.bars[int(bar_index)].height;
		max_height = max(max_height, height);
		sum_height += height;
	}

	galton.step(
		galton.dots,
		galton.binary_choose,
		galton.bars,
		galton.height,
		galton.color_mix,
		max_height > galton.max_height,
	);

	strokeWeight(5);
	const center_x = galton.width / 2;
	for (const bar_index in galton.bars) {
		const index = int(bar_index);
		const bar = galton.bars[index];
		stroke(bar.color);
		const x = galton.scale_x(index + galton.width / 2 - galton.height / 2, center_x, galton.scale)
		line(
			x,
			galton.height,
			x,
			galton.height - bar.height
		);
	};

	galton.dots.forEach(dot => {
		if (!dot.died) {
			stroke(dot.color);
			const x = galton.scale_x(dot.offset + galton.width / 2 - dot.level / 2, center_x, galton.scale)
			point(
				x,
				dot.level
			)
		}
	});

	strokeWeight(1);
	stroke(0);
	let x0 = 0;
	let x = x0;
	let y0 = galton.normal_distribution(x, galton.width / 2, 400, PI)
	let y = y0;
	while (x < galton.width) {
		x += 10;
		y = galton.normal_distribution(x, galton.width / 2, galton.normal_distribution_standart_deviation, PI) * sum_height * galton.normal_distribution_height_coeff;
		line(x0, galton.height - y0, x, galton.height - y);
		x0 = x;
		y0 = y;
	}
}
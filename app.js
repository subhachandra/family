'use strict';

// TODO: Remove the need for these global variable
var challenges;
var i = 0;
var oppulu = 0;

const $holder = d3.select('ul');
const $next = d3.select('button')
	  .on('click', update)
;

d3.csv("https://raw.githubusercontent.com/subhachandra/family/main/data.csv", row)
	.then(function(data) {
		challenges = d3.shuffle(data);
		update();
	})
// TODO: Show error to the user
	.catch(error => console.error('ERROR: Cannot fetch data:', error))
;

function update() {

	if (i == challenges.length) {
		showFinalScoreCard(1 /*restart*/);
		return;
	}
	// clear prev options
	$holder.selectAll('li').remove();
	$next.style('display', 'none');

	const $options = $holder.selectAll('li').data(d3.shuffle(challenges[i]));

	// ENTER + UPDATE
	$options.enter().append('li')
		.attr('class', '')
		.text(d => d[1])
		.on('click', validate)
		.transition(d3.transition().duration(750))
		.attr('color', 'red')
	;
}

function row(d) {
	return Object.entries(d).filter(d => d[1]);
}


function validate() {

	const n = d3.select(this);

	if (n.classed('oppu') || n.classed('tappu')) {
		update();

	} else {
		n.attr('class', 'selected');
		i = ++i;
		reveal();

		// show intermediate score card every 25 challenges
		if ((i > 0 && i%25 == 0) ) {
			setTimeout(showFinalScoreCard, 600);
		}
	}
}

function reveal() {
	$next
		.style('display', 'block')
	;
	d3.selectAll('li')
		.classed('oppu', d => isCorrect(d))
		.classed('tappu', d => !isCorrect(d))
	;

	const $score = d3.select('#score');
	$score.select('span').text(' /' + i);

	if (!d3.select('li.selected.oppu').empty()) {
		oppulu = ++oppulu;
		$score.select('strong').text(oppulu);
	}
}

function isCorrect(d) {
	return d[0] == 'ఒప్పు';
}

function showFinalScoreCard(restart) {
	
	const margin = {top: 6, right: 6, bottom: 6, left: 6,};
	const $container = d3.select('#scorecard').style('display', 'block');
	const width = $container.node().clientWidth - margin.right - margin.left;
	const height = $container.node().clientHeight - margin.top - margin.bottom;
	const radius = Math.min(width, height) *.72 * .5;

	const $g = $container.append('svg')
		  .attr('width', (radius * 2) + margin.left + margin.right)
		  .attr('height', (radius * 2) + margin.top + margin.bottom)
		  .append('g')
		  .attr('transform', 'translate('
				+ (margin.left + radius) + ','
				+ (margin.top + radius) + ')')
	;

	const oppulaShaatam = oppulu/i;
	const data = [oppulaShaatam, 1 - oppulaShaatam]

	const arc = d3.arc()
		  .innerRadius(radius * .64)
		  .outerRadius(radius * .92)
		  .cornerRadius(10)
	;

	const pie = d3.pie()
		  .padAngle(0.015)
		  .sortValues(null)
	;

	$g.append('g')
		.selectAll()
		.data(pie(data))
		.join('path')
		.attr('d', arc)
		.attr('fill', (d, i) => i == 0 ? '#66bd63' : '#f46d43')
		.transition().duration(1000).ease(d3.easeBounce)
		.attrTween('d', a => {
			let i = d3.interpolate(a.startAngle, a.endAngle);
			return function(t) {
				a.endAngle = i(t);
				return arc(a);
			}
		})
	;
	
	$g.append('text')
		.text(oppulaShaatam === 1 ? '💯' : parseInt(oppulaShaatam * 100, 10) + '%')
		.attr('fill', '#333')
		.attr('font-size', '3rem')
		.attr('font-weight', 'bold')
		.attr('text-anchor', 'middle')
		.attr('dy', '-0.2rem')
	;

	$g.append('text')
		.text(oppulu + '/' + i)
		.attr('fill', '#333')
		.attr('font-size', '1.6rem')
		.attr('text-anchor', 'middle')
		.attr('dy', '2.5rem')
	;

	let text;
	
	if (oppulu === 0) {
		text = 'అన్నీ తప్పులే! మీకో గుండు సున్న!! 😦';
	} else if (oppulaShaatam <= .4) {
		text = 'అన్ని తప్పులా! మీరు చాలా నేర్చుకోవాలి!!';
	} else if (oppulaShaatam < .75) {
		text = 'పర్లేదు, కానీ మీరు ఇంకా మెరుగవ్వాలి!';
	} else if (oppulaShaatam < .9) {
		text = 'అబ్బో, పర్లేదే! ఇంకొంచెం శ్రద్ధ పెట్టండి.';
	} else if (oppulaShaatam < 1) {
		text = 'అభినందనలు! ఎక్కడో పప్పులో కాలేసారు. 👍';
	} else {
		text = '💯 అద్భుతం! మీకు తిరుగులేదు!! 👍'
	}
	
	$container.append('p')
		.text(text)
	;

	$container.append('button')
		.text(restart ? 'మళ్ళీ ఆడండి!' : 'కొనసాగించండి')
		.on('click', restart ? replay : hideScore)
	;

}
function hideScore() {
	d3.select('#scorecard').style('display', 'none').html('');
	update();
}

function replay() {
	challenges = d3.shuffle(challenges);
	i = 0;
	oppulu = 0;

	d3.select('#scorecard').style('display', 'none').html('');
	d3.select('#score strong').text('0');
	d3.select('#score span').text('/0');

	update();
}

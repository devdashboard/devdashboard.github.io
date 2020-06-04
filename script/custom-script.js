var allInOne;
var allConf;
var allReco;
var allDec;
var allSamp;

var allRecRate;
var allDecRate;

var allInOneStates;

var allConfState;
var allRecoState;
var allDecState;

function formatDate(date) {
	var utc = date.toUTCString() // 'ddd, DD MMM YYYY HH:mm:ss GMT'
	return utc.slice(8, 12) + utc.slice(5, 7) + ", " + utc.slice(12, 16)
}

function comp(a, b) {
	return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function callCovidApi(stateRequired, timeRequired, bodyRequired, rRateRequired, mRateRequired) {
	$.ajax({
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {

			var statewise = resData["statewise"];

			for (var i = 0; i < statewise.length - 1; i++) {
				var stateDetails = statewise[i];

				if (stateDetails["statecode"] === stateRequired) {
					$(timeRequired).append(computeUpdatedTime(stateDetails["lastupdatedtime"]));

					valueTemplate = '<td class="header-confirmed">' + numberWithCommas(stateDetails["confirmed"]) + '<br><img src="./images/triangle.png" width="10" height="10" draggable="false"/> <span class="delta">' + numberWithCommas(stateDetails["deltaconfirmed"]) + '</span></td>' +
						'<td class="header-active">' + numberWithCommas(stateDetails["active"]) + '</td>' +
						'<td class="header-recovered">' + numberWithCommas(stateDetails["recovered"]) + '<br><img src="./images/triangle.png" width="10" height="10" draggable="false"/> <span class="delta">' + numberWithCommas(stateDetails["deltarecovered"]) + '</span></td>' +
						'<td class="header-dead">' + numberWithCommas(stateDetails["deaths"]) + '<br><img src="./images/triangle.png" width="10" height="10" draggable="false"/> <span class="delta">' + numberWithCommas(stateDetails["deltadeaths"]) + '</span></td>';
					$(bodyRequired).append(valueTemplate);
					
					var recoRate = computeRecoveryRate(stateDetails["confirmed"], stateDetails["recovered"], stateDetails["deaths"]);
					
					
					var mortRate = computeMortalityRate(stateDetails["confirmed"], stateDetails["deaths"]);
					
					if (rRateRequired === '#rRatePct') {
						$(rRateRequired).append(gaugeReco(recoRate.slice(0, recoRate.length-1), rRateRequired.slice(1, rRateRequired.length)));
					} else if (mRateRequired === '#mRatePct') {
						$(mRateRequired).append(gaugeMort(mortRate.slice(0, mortRate.length-1), mRateRequired.slice(1, mRateRequired.length)));
					} else {	
						var actRate = parseFloat(100) - (parseFloat(sliceRates(recoRate)) + parseFloat(sliceRates(mortRate)));
						$(rRateRequired).append(pieChartCreate(rRateRequired.slice(1, rRateRequired.length), sliceRates(recoRate), sliceRates(mortRate), actRate));
					}
				}
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function computeRecoveryRate(conf, recvr, death) {
	var recoRate = (((recvr) / (conf - death)) * 100).toFixed(2);

	if (Number.isNaN(recoRate)) {
		return 'NA';
	} else {
		return (recoRate + '%');
	}
}

function computeMortalityRate(conf, death) {

	var mortRate = ((death / conf) * 100).toFixed(2);

	if (Number.isNaN(mortRate)) {
		return 'NA';
	} else {
		return (mortRate + '%');
	}
}

function computeUpdatedTime(updateTime) {
	var formatTime = updateTime.slice(3, 5) + '/' +
		updateTime.slice(0, 2) + '/' +
		updateTime.slice(6, updateTime.length);
	var nowTime = new Date();

	var utcUpdatedTime = new Date(formatTime);
	utcUpdatedTime = new Date(utcUpdatedTime.toUTCString().slice(0, -4));

	var utcNowTime = new Date(nowTime.toUTCString().slice(0, -4));

	var diff = utcNowTime.getTime() - utcUpdatedTime.getTime();

	var msec = diff;
	var hh = Math.floor(msec / 1000 / 60 / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(msec / 1000 / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(msec / 1000);
	msec -= ss * 1000;

	if (hh === 0 && mm === 0 && ss === 0) {
		return 'Updated now';
	} else if (hh === 0 && mm === 0 && ss === 1) {
		return 'Updated a second ago';
	} else if (hh === 0 && mm === 0 && ss != 0) {
		return 'Updated ' + ss + ' seconds ago';
	} else if (hh === 0 && mm === 1) {
		return 'Updated a minute ago';
	} else if (hh === 0 && mm != 0) {
		return 'Updated ' + mm + ' minutes ago';
	} else if (hh === 1) {
		return 'Updated an hour ago';
	} else {
		return 'Updated ' + hh + ' hours ago';
	}
}


function callCovidStateApi(state, stateId) {
	$.ajax({
		method: "GET",
		url: "https://api.covid19india.org/state_district_wise.json",
		success: function (resData) {
			var statewise = resData[state];
			var districtDetails = statewise["districtData"];

			for (var eachDistrict in districtDetails) {
				var entry = districtDetails[eachDistrict];
				valueTemplate = '<tr class="custom-tr"><td class="district-td">' + eachDistrict + '</td>' +
					'<td class="district-td-data">' + entry["confirmed"] + '</td>' +
					'<td class="district-td-data-active">' + entry["active"] + '</td>';
				$(stateId).append(valueTemplate);
			}

		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function getCasesTestedCount() {
	$.ajax({
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var testedOverAll = resData["tested"];

			var count = testedOverAll.length;

			var testedSamples = testedOverAll[count - 1]["totalsamplestested"];


			$("#cases-tested-in").append(testedSamples);
			//$("#cases-time-in").append(testedOverAll[count - 1]["updatetimestamp"]);


		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function computeOverallRecoRate(bodyRequired) {
	$.ajax({
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {

			var statewise = resData["statewise"];

			for (var i = 0; i < statewise.length - 1; i++) {
				var stateDetails = statewise[i];

				if (stateDetails["statecode"] != 'TT') {
					valueTemplate = '<tr class="custom-tr-reco"><td class="custom-td-reco-state">' + stateDetails["state"].slice(0, 19) + '</td>' +
						'<td class="custom-td-reco">' + computeRecoveryRate(stateDetails["confirmed"], stateDetails["recovered"], stateDetails["deaths"]) + '</td>' +
						'<td class="custom-td-reco-upd">' + computeUpdatedTimeState(stateDetails["lastupdatedtime"]) + '</td>' + '</tr>';
					$(bodyRequired).append(valueTemplate);
				}
			}

			sortDataByAscOrder(bodyRequired.slice(1, bodyRequired.length));
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function computeOverallMortRate(bodyRequired) {
	$.ajax({
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {

			var statewise = resData["statewise"];

			for (var i = 0; i < statewise.length - 1; i++) {
				var stateDetails = statewise[i];

				if (stateDetails["statecode"] != 'TT') {
					valueTemplate = '<tr class="custom-tr-mort"><td class="custom-td-mort-state">' + stateDetails["state"].slice(0, 19) + '</td>' +
						'<td class="custom-td-mort">' + computeMortalityRate(stateDetails["confirmed"], stateDetails["deaths"]) + '</td>' +
						'<td class="custom-td-mort-upd">' + computeUpdatedTimeState(stateDetails["lastupdatedtime"]) + '</td>' + '</tr>';
					$(bodyRequired).append(valueTemplate);
				}
			}

			sortDataByAscOrder(bodyRequired.slice(1, bodyRequired.length));
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function computeUpdatedTimeState(updateTime) {
	var formatTime = updateTime.slice(3, 5) + '/' +
		updateTime.slice(0, 2) + '/' +
		updateTime.slice(6, updateTime.length);
	var nowTime = new Date();

	var utcUpdatedTime = new Date(formatTime);
	utcUpdatedTime = new Date(utcUpdatedTime.toUTCString().slice(0, -4));

	var utcNowTime = new Date(nowTime.toUTCString().slice(0, -4));

	var diff = utcNowTime.getTime() - utcUpdatedTime.getTime();

	var msec = diff;
	var hh = Math.floor(msec / 1000 / 60 / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(msec / 1000 / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(msec / 1000);
	msec -= ss * 1000;

	if (hh === 0 && mm === 0 && ss === 0) {
		return 'now';
	} else if (hh === 0 && mm === 0 && ss === 1) {
		return 'a second ago';
	} else if (hh === 0 && mm === 0 && ss != 0) {
		return ss + ' seconds ago';
	} else if (hh === 0 && mm === 1) {
		return 'a minute ago';
	} else if (hh === 0 && mm != 0) {
		return mm + ' minutes ago';
	} else if (hh === 1) {
		return 'an hour ago';
	} else if (hh <= 23) {
		return hh + ' hours ago';
	} else if (hh <= 47) {
		return 'a day ago';
	} else if (hh <= 167) {
		return 'few days ago';
	} else if (hh <= 719) {
		return 'few week(s) ago';
	} else if (hh <= 1339) {
		return 'a month ago';
	} else {
		return 'few month(s) ago';
	}
}


// Sort data by ascending order
function sortDataByAscOrder(nodeId) {
	var list = document.getElementById(nodeId);

	var items = list.childNodes;
	var itemsArr = [];
	for (var i in items) {
		if (items[i].nodeType == 1) { // get rid of the whitespace text nodes
			itemsArr.push(items[i]);
		}
	}

	itemsArr.sort(function (a, b) {
		return a.innerHTML == b.innerHTML ?
			0 :
			(a.innerHTML > b.innerHTML ? 1 : -1);
	});

	for (i = 0; i < itemsArr.length; ++i) {
		list.appendChild(itemsArr[i]);
	}
}

function processValuesForChart(homePage, recoPage, decPage) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var caseSeries = resData["cases_time_series"];
			var caseSeriesLength = caseSeries.length;

			for (var i = caseSeriesLength - 1; i >= caseSeriesLength - 10; i--) {
				var caseDetails = caseSeries[i];

				if (homePage === true) {
					xValLoop.push(caseDetails["date"].slice(0,6));
					yValConfLoop.push(caseDetails["dailyconfirmed"]);
					yValRecoLoop.push(caseDetails["dailyrecovered"]);
					yValDecLoop.push(caseDetails["dailydeceased"]);
				}

				if (recoPage === true) {
					xValLoop.push(caseDetails["date"].slice(0,6));
					yValRrLoop.push(computeRecoRateLastFiveDays(caseDetails["totalconfirmed"], caseDetails["totalrecovered"], caseDetails["totaldeceased"]));
				}

				if (decPage === true) {
					xValLoop.push(caseDetails["date"].slice(0,6));
					yValMrLoop.push(computeDecRateLastFiveDays(caseDetails["totalconfirmed"], caseDetails["totaldeceased"]));
				}
			}

			if (homePage === true) {
				getChart('confirmedChart', xValLoop, yValConfLoop, '#ff073a', 'Confirmed');
				getChart('recoChart', xValLoop, yValRecoLoop, '#28a745', 'Recovered');
				getChart('decChart', xValLoop, yValDecLoop, '#6c757d', 'Deceased');
				getAllInOneChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);

				var tested = resData["tested"];
				var testedLength = tested.length;

				for (var i = testedLength - 1; i >= testedLength - 10; i--) {
					var testedDetails = tested[i];
					var xVal = testedDetails["updatetimestamp"];
					xValSampleLoop.push(getFormattedDayAndMonth(xVal));
					yValSampleLoop.push((tested[i]["totalsamplestested"] - tested[i - 1]["totalsamplestested"]));
				}

				getChart('samplesChart', xValSampleLoop, yValSampleLoop, 'white', 'Tests in a day', '');
			}

			if (recoPage === true) {
				getChartForRates('rrChart', xValLoop, yValRrLoop, '#28a745', 'Recovery Rate');
			}

			if (decPage === true) {
				getChartForRates('mrChart', xValLoop, yValMrLoop, '#6c757d', 'Mortality Rate');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function getChart(chartId, xVal, yVal, color, labelVal) {
	Chart.defaults.global.legend.display = false;
	var ctx = document.getElementById(chartId).getContext("2d");
	var data = {
		labels: xVal,
		datasets: [{
			label: labelVal,
			backgroundColor: color,
			data: yVal
		}]
	};

	if (chartId != undefined && chartId === 'confirmedChart') {
		loadChartForConf(ctx, data);
	}

	if (chartId != undefined && chartId === 'recoChart') {
		loadChartForReco(ctx, data);
	}

	if (chartId != undefined && chartId === 'decChart') {
		loadChartForDec(ctx, data);
	}

	if (chartId != undefined && chartId === 'samplesChart') {
		loadChartForSamp(ctx, data);
	}
	/* if (allConf != undefined) {
		allConf.destroy();
	}
			
		allConf = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							return (value / 1000) + 'K'; // convert it to thousands
						}
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	}); */
}


function loadChartForConf(ctx, data) {
	if (allConf != undefined) {
		allConf.destroy();
	}

	allConf = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							return (value / 1000) + 'K'; // convert it to thousands
						}
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});
}


function loadChartForReco(ctx, data) {
	if (allReco != undefined) {
		allReco.destroy();
	}

	allReco = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							return (value / 1000) + 'K'; // convert it to thousands
						}
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});
}


function loadChartForDec(ctx, data) {
	if (allDec != undefined) {
		allDec.destroy();
	}

	allDec = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							return (value / 1000) + 'K'; // convert it to thousands
						}
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});
}


function loadChartForSamp(ctx, data) {
	if (allSamp != undefined) {
		allSamp.destroy();
	}

	allSamp = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							return (value / 1000) + 'K'; // convert it to thousands
						}
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});
}


function loadChartForConfState(ctx, data) {

	if (allConfState != undefined) {
		allConfState.destroy();
	}

	allConfState = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						//callback: function (value) {
						//return (value / this.max * 100).toFixed(2) + '%'; // convert it to percentage
						//},
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});

}


function loadChartForRecoState(ctx, data) {

	if (allRecoState != undefined) {
		allRecoState.destroy();
	}

	allRecoState = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						//callback: function (value) {
						//return (value / this.max * 100).toFixed(2) + '%'; // convert it to percentage
						//},
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});

}


function loadChartForDecState(ctx, data) {

	if (allDecState != undefined) {
		allDecState.destroy();
	}

	allDecState = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						//callback: function (value) {
						//return (value / this.max * 100).toFixed(2) + '%'; // convert it to percentage
						//},
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});

}


function getChartForRates(chartId, xVal, yVal, color, labelVal) {
	Chart.defaults.global.legend.display = false;
	var conf = document.getElementById(chartId);
	var confirmedChart = new Chart(conf, {
		type: 'bar',
		data: {
			labels: xVal,
			datasets: [{
				label: labelVal,
				data: yVal,
				backgroundColor: [
					color,
					color,
					color,
					color,
					color,
					color,
					color,
					color,
					color,
					color
				],
				borderColor: [
					color,
					color,
					color,
					color,
					color,
					color,
					color,
					color,
					color,
					color
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							return value + '%'; // convert it to percentage
						},
					},
					gridLines: {
						display: true,
						color: 'rgba(200, 200, 200, 0.15)'
					}
				}],
				xAxes: [{
					barPercentage: 0.3,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});
}


function getAllInOneChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop) {
	var ctx = document.getElementById("allInOneChart");

	var data = {
		labels: xValLoop,
		datasets: [{
				label: "Confirmed",
				backgroundColor: "#ff073a",
				data: yValConfLoop
			},

			{
				label: "Recovered",
				backgroundColor: "#28a745",
				data: yValRecoLoop
			},

			{
				label: "Deceased",
				backgroundColor: "#6c757d",
				data: yValDecLoop
			}
		]
	};


	//var myBarChart = document.getElementById("allInOneChart").getContext("2d");
	if (allInOne != undefined)
		allInOne.destroy();
	allInOne = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			showTooltips: false,
			barValueSpacing: 20,
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function (value) {
							return (value / 1000).toFixed(0) + 'K'; // convert it to thousands
						},
						gridLines: {
							display: true,
							color: 'rgba(200, 200, 200, 0.15)'
						}
					}
				}],
				xAxes: [{
					barPercentage: 1,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});
}

function computeRecoRateLastFiveDays(conf, recvr, death) {
	var recoRate = (((recvr) / (conf - death)) * 100).toFixed(2);

	if (Number.isNaN(recoRate)) {
		return 'NA';
	} else {
		return (recoRate);
	}
}

function computeDecRateLastFiveDays(conf, death) {

	var mortRate = ((death / conf) * 100).toFixed(2);

	if (Number.isNaN(mortRate)) {
		return 'NA';
	} else {
		return (mortRate);
	}
}


function getFormattedDayAndMonth(xVal) {
	var formatTime = xVal.slice(3, 5) + '/' +
		xVal.slice(0, 2) + '/' +
		xVal.slice(6, xVal.length);

	var newDate = new Date(formatTime);
	newDate.setDate(newDate.getDate() - 1);

	var month = new Array();
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";

	return ((newDate.getDate()) + ' ' + month[newDate.getMonth()].slice(0, 3));
}

function processValuesForStateChart(stateCode) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/states_daily.json",
		success: function (resData) {
			var statesSeries = resData["states_daily"];
			var statesSeriesLength = statesSeries.length;

			for (var i = statesSeriesLength - 1; i >= statesSeriesLength - 30; i--) {
				var stateDetails = statesSeries[i];

				if (stateDetails["status"] === 'Confirmed') {
					var xVal = stateDetails["date"];
					xValLoop.push(xVal.replace(/-/g, " ").slice(0, xVal.length - 2));
					yValConfLoop.push(stateDetails[stateCode]);
				}

				if (stateDetails["status"] == 'Recovered') {
					yValRecoLoop.push(stateDetails[stateCode]);
				}

				if (stateDetails["status"] == 'Deceased') {
					yValDecLoop.push(stateDetails[stateCode]);
				}
			}

			getChartForStates('confirmedChart', xValLoop, yValConfLoop, '#ff073a', 'Confirmed');
			getChartForStates('recoChart', xValLoop, yValRecoLoop, '#28a745', 'Recovered');
			getChartForStates('decChart', xValLoop, yValDecLoop, '#6c757d', 'Deceased');
			getAllInOneChartForStates(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function getChartForStates(chartId, xVal, yVal, color, labelParam) {
	Chart.defaults.global.legend.display = false;
	var ctx = document.getElementById(chartId).getContext("2d");
	var data = {
		labels: xVal,
		datasets: [{
			label: labelParam,
			backgroundColor: color,
			data: yVal
		}]
	};

	if (chartId != undefined && chartId === 'confirmedChart') {
		loadChartForConfState(ctx, data);
	}

	if (chartId != undefined && chartId === 'recoChart') {
		loadChartForRecoState(ctx, data);
	}

	if (chartId != undefined && chartId === 'decChart') {
		loadChartForDecState(ctx, data);
	}
}


function getAllInOneChartForStates(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop) {
	var ctx = document.getElementById("allInOneChart");

	var data = {
		labels: xValLoop,
		datasets: [{
				label: "Confirmed",
				backgroundColor: "#ff073a",
				data: yValConfLoop
			},

			{
				label: "Recovered",
				backgroundColor: "#28a745",
				data: yValRecoLoop
			},

			{
				label: "Deceased",
				backgroundColor: "#6c757d",
				data: yValDecLoop
			}
		]
	};


	if (allInOneStates != undefined) {
		allInOneStates.destroy();
	}
	allInOneStates = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
			barValueSpacing: 20,
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						gridLines: {
							display: true,
							color: 'rgba(200, 200, 200, 0.15)'
						}
					}
				}],
				xAxes: [{
					barPercentage: 1,
					ticks: {
						autoSkip: false,
						maxRotation: 90,
						minRotation: 90
					}
				}]
			}
		}
	});

}

var clicks = 0;

function allInOneExtendedChart(stateChange) {

	if (stateChange === 'prev') {
		clicks -= 1;
	}

	if (stateChange === 'next') {
		clicks += 1;
	}

	document.getElementById("allInOneChart").innerHTML = "";
	chartReDraw(clicks);
}


function chartReDraw(countVal) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var caseSeries = resData["cases_time_series"];
			var caseSeriesLength = caseSeries.length;
			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (countVal === 0) {
				$("#prev").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 10;
			} else if (countVal < 0) {
				$("#prev").attr("hidden", true);
				return;
			} else {
				$("#prev").attr("hidden", false);
				loopLesser = countVal * 10;
				loopGreater = loopLesser + 10;
			}

			if (caseSeriesLength >= loopLesser) {
				$("#next").attr("hidden", false);
				if (countVal === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = caseSeriesLength - initVal; i >= caseSeriesLength - exitVal; i--) {
					//console.log(i);
					if (i >= 0) {
						var caseDetails = caseSeries[i];
						xValLoop.push(caseDetails["date"].slice(0,6));
						yValConfLoop.push(caseDetails["dailyconfirmed"]);
						yValRecoLoop.push(caseDetails["dailyrecovered"]);
						yValDecLoop.push(caseDetails["dailydeceased"]);
					}

					if (i == 0) {
						$("#next").attr("hidden", true);
					}
				}
				getAllInOneChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


var clickConf = 0;

function confirmedChart(stateChange) {

	if (stateChange === 'prev') {
		clickConf -= 1;
	}

	if (stateChange === 'next') {
		clickConf += 1;
	}

	document.getElementById("confirmedChart").innerHTML = "";
	chartReDrawConfirmed(clickConf);
}

var clickReco = 0;

function recoChart(stateChange) {

	if (stateChange === 'prev') {
		clickReco -= 1;
	}

	if (stateChange === 'next') {
		clickReco += 1;
	}

	document.getElementById("recoChart").innerHTML = "";
	chartReDrawRecovered(clickReco);
}


var clickDec = 0;

function decChart(stateChange) {

	if (stateChange === 'prev') {
		clickDec -= 1;
	}

	if (stateChange === 'next') {
		clickDec += 1;
	}

	document.getElementById("decChart").innerHTML = "";
	chartReDrawDeceased(clickDec);
}


var clickSamp = 0;

function sampChart(stateChange) {

	if (stateChange === 'prev') {
		clickSamp -= 1;
	}

	if (stateChange === 'next') {
		clickSamp += 1;
	}

	document.getElementById("samplesChart").innerHTML = "";
	chartReDrawSample(clickSamp);
}


var recoRate = 0;

function allRecoRate(stateChange) {

	if (stateChange === 'prev') {
		recoRate -= 1;
	}

	if (stateChange === 'next') {
		recoRate += 1;
	}

	document.getElementById("rrChart").innerHTML = "";
	chartReDrawRecoRate(recoRate);
}

var mortRate = 0;

function allMortRate(stateChange) {

	if (stateChange === 'prev') {
		mortRate -= 1;
	}

	if (stateChange === 'next') {
		mortRate += 1;
	}

	document.getElementById("mrChart").innerHTML = "";
	chartReDrawMortRate(mortRate);
}


var clickAllState = 0;

function allInOneState(stateChange, stateCode) {

	if (stateChange === 'prev') {
		clickAllState -= 1;
	}

	if (stateChange === 'next') {
		clickAllState += 1;
	}

	document.getElementById("allInOneChart").innerHTML = "";
	chartReDrawAllInOneState(clickAllState, stateCode);
}


var clickConfState = 0;

function confirmedChartState(stateChange, stateCode) {

	if (stateChange === 'prev') {
		clickConfState -= 1;
	}

	if (stateChange === 'next') {
		clickConfState += 1;
	}

	document.getElementById("confirmedChart").innerHTML = "";
	chartReDrawConfState(clickConfState, stateCode);
}

var clickRecoState = 0;

function recoChartState(stateChange, stateCode) {

	if (stateChange === 'prev') {
		clickRecoState -= 1;
	}

	if (stateChange === 'next') {
		clickRecoState += 1;
	}

	document.getElementById("recoChart").innerHTML = "";
	chartReDrawRecoState(clickRecoState, stateCode);
}


var clickDecState = 0;

function decChartState(stateChange, stateCode) {

	if (stateChange === 'prev') {
		clickDecState -= 1;
	}

	if (stateChange === 'next') {
		clickDecState += 1;
	}

	document.getElementById("decChart").innerHTML = "";
	chartReDrawDecState(clickDecState, stateCode);
}

function chartReDrawConfirmed(clickConf) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var caseSeries = resData["cases_time_series"];
			var caseSeriesLength = caseSeries.length;
			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickConf === 0) {
				$("#prevConf").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 10;
			} else if (clickConf < 0) {
				$("#prevConf").attr("hidden", true);
				return;
			} else {
				$("#prevConf").attr("hidden", false);
				loopLesser = clickConf * 10;
				loopGreater = loopLesser + 10;
			}

			if (caseSeriesLength >= loopLesser) {
				$("#nextConf").attr("hidden", false);
				if (clickConf === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = caseSeriesLength - initVal; i >= caseSeriesLength - exitVal; i--) {
					//console.log(i);
					if (i >= 0) {
						var caseDetails = caseSeries[i];
						xValLoop.push(caseDetails["date"].slice(0,6));
						yValConfLoop.push(caseDetails["dailyconfirmed"]);
						yValRecoLoop.push(caseDetails["dailyrecovered"]);
						yValDecLoop.push(caseDetails["dailydeceased"]);
					}

					if (i == 0) {
						$("#nextConf").attr("hidden", true);
					}
				}
				//getChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
				getChart('confirmedChart', xValLoop, yValConfLoop, '#ff073a', 'Confirmed', '');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawRecovered(clickReco) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var caseSeries = resData["cases_time_series"];
			var caseSeriesLength = caseSeries.length;
			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickReco === 0) {
				$("#prevReco").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 10;
			} else if (clickReco < 0) {
				$("#prevReco").attr("hidden", true);
				return;
			} else {
				$("#prevReco").attr("hidden", false);
				loopLesser = clickReco * 10;
				loopGreater = loopLesser + 10;
			}

			if (caseSeriesLength >= loopLesser) {
				$("#nextReco").attr("hidden", false);
				if (clickReco === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = caseSeriesLength - initVal; i >= caseSeriesLength - exitVal; i--) {
					//console.log(i);
					if (i >= 0) {
						var caseDetails = caseSeries[i];
						xValLoop.push(caseDetails["date"].slice(0,6));
						yValConfLoop.push(caseDetails["dailyconfirmed"]);
						yValRecoLoop.push(caseDetails["dailyrecovered"]);
						yValDecLoop.push(caseDetails["dailydeceased"]);
					}

					if (i == 0) {
						$("#nextReco").attr("hidden", true);
					}
				}
				//getChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
				getChart('recoChart', xValLoop, yValRecoLoop, '#28a745', 'Recovered', '');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawDeceased(clickDec) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var caseSeries = resData["cases_time_series"];
			var caseSeriesLength = caseSeries.length;
			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickDec === 0) {
				$("#prevDec").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 10;
			} else if (clickDec < 0) {
				$("#prevDec").attr("hidden", true);
				return;
			} else {
				$("#prevDec").attr("hidden", false);
				loopLesser = clickDec * 10;
				loopGreater = loopLesser + 10;
			}

			if (caseSeriesLength >= loopLesser) {
				$("#nextDec").attr("hidden", false);
				if (clickDec === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = caseSeriesLength - initVal; i >= caseSeriesLength - exitVal; i--) {
					//console.log(i);
					if (i >= 0) {
						var caseDetails = caseSeries[i];
						xValLoop.push(caseDetails["date"].slice(0,6));
						yValConfLoop.push(caseDetails["dailyconfirmed"]);
						yValRecoLoop.push(caseDetails["dailyrecovered"]);
						yValDecLoop.push(caseDetails["dailydeceased"]);
					}

					if (i == 0) {
						$("#nextDec").attr("hidden", true);
					}
				}
				//getChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
				getChart('decChart', xValLoop, yValDecLoop, '#6c757d', 'Deceased', '');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawSample(clickSamp) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var tested = resData["tested"];
			var testedLength = tested.length;
			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickSamp === 0) {
				$("#prevSamp").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 10;
			} else if (clickSamp < 0) {
				$("#prevSamp").attr("hidden", true);
				return;
			} else {
				$("#prevSamp").attr("hidden", false);
				loopLesser = clickSamp * 10;
				loopGreater = loopLesser + 10;
			}

			if (testedLength >= loopLesser) {
				$("#nextSamp").attr("hidden", false);
				if (clickSamp === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}


				for (var i = testedLength - initVal; i >= testedLength - exitVal; i--) {
					if (i >= 0) {
						var testedDetails = tested[i];
						var xVal = testedDetails["updatetimestamp"];
						var formattedDate = getFormattedDayAndMonth(xVal);

						if (formattedDate === '18 Mar') {
							$("#nextSamp").attr("hidden", true);
						}

						xValSampleLoop.push(formattedDate);
						var greater = tested[i]["totalsamplestested"];
						var lesser = tested[i - 1]["totalsamplestested"];

						if (greater == undefined) {
							$("#nextSamp").attr("hidden", true);
							return;
						}

						if (greater === "") {
							yValSampleLoop.push('0');
						} else if (lesser === "") {
							yValSampleLoop.push('0');
						} else {
							yValSampleLoop.push(greater - lesser);
						}
					}

					if (i == 0) {
						$("#nextSamp").attr("hidden", true);
					}
				}

				//getChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
				getChart('samplesChart', xValSampleLoop, yValSampleLoop, 'white', 'Tests in a day', '');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawRecoRate(recoRate) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var caseSeries = resData["cases_time_series"];
			var caseSeriesLength = caseSeries.length;
			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (recoRate === 0) {
				$("#prevRecoRate").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 10;
			} else if (recoRate < 0) {
				$("#prevRecoRate").attr("hidden", true);
				return;
			} else {
				$("#prevRecoRate").attr("hidden", false);
				loopLesser = recoRate * 10;
				loopGreater = loopLesser + 10;
			}

			if (caseSeriesLength >= loopLesser) {
				$("#nextRecoRate").attr("hidden", false);
				if (recoRate === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = caseSeriesLength - initVal; i >= caseSeriesLength - exitVal; i--) {
					//console.log(i);
					if (i >= 0) {
						var caseDetails = caseSeries[i];

						xValLoop.push(caseDetails["date"].slice(0,6));
						yValRrLoop.push(computeRecoRateLastFiveDays(caseDetails["totalconfirmed"], caseDetails["totalrecovered"], caseDetails["totaldeceased"]));

					}

					if (i == 0) {
						$("#nextRecoRate").attr("hidden", true);
					}
				}
				getChartForRates('rrChart', xValLoop, yValRrLoop, '#28a745', 'Recovery Rate');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawMortRate(mortRate) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/data.json",
		success: function (resData) {
			var caseSeries = resData["cases_time_series"];
			var caseSeriesLength = caseSeries.length;
			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (mortRate === 0) {
				$("#prevMortRate").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 10;
			} else if (mortRate < 0) {
				$("#prevMortRate").attr("hidden", true);
				return;
			} else {
				$("#prevMortRate").attr("hidden", false);
				loopLesser = mortRate * 10;
				loopGreater = loopLesser + 10;
			}

			if (caseSeriesLength >= loopLesser) {
				$("#nextMortRate").attr("hidden", false);
				if (mortRate === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = caseSeriesLength - initVal; i >= caseSeriesLength - exitVal; i--) {
					//console.log(i);
					if (i >= 0) {
						var caseDetails = caseSeries[i];

						xValLoop.push(caseDetails["date"].slice(0,6));
						yValMrLoop.push(computeDecRateLastFiveDays(caseDetails["totalconfirmed"], caseDetails["totaldeceased"]));

					}

					if (i == 0) {
						$("#nextMortRate").attr("hidden", true);
					}
				}
				getChartForRates('mrChart', xValLoop, yValMrLoop, '#6c757d', 'Mortality Rate');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawAllInOneState(clickAllState, stateCode) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/states_daily.json",
		success: function (resData) {
			var statesSeries = resData["states_daily"];
			var statesSeriesLength = statesSeries.length;

			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickAllState === 0) {
				$("#prevAllState").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 30;
			} else if (clickAllState < 0) {
				$("#prevAllState").attr("hidden", true);
				return;
			} else {
				$("#prevAllState").attr("hidden", false);
				loopLesser = clickAllState * 30;
				loopGreater = loopLesser + 30;
			}

			if (statesSeriesLength >= loopLesser) {
				$("#nextAllState").attr("hidden", false);
				if (clickAllState === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = statesSeriesLength - initVal; i >= statesSeriesLength - exitVal; i--) {
					if (i >= 0) {
						var stateDetails = statesSeries[i];

						if (stateDetails["status"] === 'Confirmed') {

							var xVal = stateDetails["date"];
							xValLoop.push(xVal.replace(/-/g, " ").slice(0, xVal.length - 2));
							yValConfLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Recovered') {
							yValRecoLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Deceased') {
							yValDecLoop.push(stateDetails[stateCode]);
						}
					}
					if (i == 0) {
						$("#nextAllState").attr("hidden", true);
					}
				}
				//getChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
				getAllInOneChartForStates(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawConfState(clickConfState, stateCode) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/states_daily.json",
		success: function (resData) {
			var statesSeries = resData["states_daily"];
			var statesSeriesLength = statesSeries.length;

			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickConfState === 0) {
				$("#prevConf").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 30;
			} else if (clickConfState < 0) {
				$("#prevConf").attr("hidden", true);
				return;
			} else {
				$("#prevConf").attr("hidden", false);
				loopLesser = clickConfState * 30;
				loopGreater = loopLesser + 30;
			}

			if (statesSeriesLength >= loopLesser) {
				$("#nextConf").attr("hidden", false);
				if (clickConfState === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = statesSeriesLength - initVal; i >= statesSeriesLength - exitVal; i--) {
					if (i >= 0) {
						var stateDetails = statesSeries[i];

						if (stateDetails["status"] === 'Confirmed') {

							var xVal = stateDetails["date"];
							xValLoop.push(xVal.replace(/-/g, " ").slice(0, xVal.length - 2));
							yValConfLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Recovered') {
							yValRecoLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Deceased') {
							yValDecLoop.push(stateDetails[stateCode]);
						}
					}
					if (i == 0) {
						$("#nextConf").attr("hidden", true);
					}
				}

				getChartForStates('confirmedChart', xValLoop, yValConfLoop, '#ff073a', 'Confirmed');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawRecoState(clickRecoState, stateCode) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/states_daily.json",
		success: function (resData) {
			var statesSeries = resData["states_daily"];
			var statesSeriesLength = statesSeries.length;

			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickRecoState === 0) {
				$("#prevReco").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 30;
			} else if (clickRecoState < 0) {
				$("#prevReco").attr("hidden", true);
				return;
			} else {
				$("#prevReco").attr("hidden", false);
				loopLesser = clickRecoState * 30;
				loopGreater = loopLesser + 30;
			}

			if (statesSeriesLength >= loopLesser) {
				$("#nextReco").attr("hidden", false);
				if (clickRecoState === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = statesSeriesLength - initVal; i >= statesSeriesLength - exitVal; i--) {
					if (i >= 0) {
						var stateDetails = statesSeries[i];

						if (stateDetails["status"] === 'Confirmed') {

							var xVal = stateDetails["date"];
							xValLoop.push(xVal.replace(/-/g, " ").slice(0, xVal.length - 2));
							yValConfLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Recovered') {
							yValRecoLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Deceased') {
							yValDecLoop.push(stateDetails[stateCode]);
						}
					}
					if (i == 0) {
						$("#nextReco").attr("hidden", true);
					}
				}

				getChartForStates('recoChart', xValLoop, yValRecoLoop, '#28a745', 'Recovered');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function chartReDrawDecState(clickDecState, stateCode) {
	var xValLoop = [];
	var yValConfLoop = [];
	var yValRecoLoop = [];
	var yValDecLoop = [];

	var xValSampleLoop = [];
	var yValSampleLoop = [];

	var yValRrLoop = [];
	var yValMrLoop = [];

	$.ajax({
		async: false,
		method: "GET",
		url: "https://api.covid19india.org/states_daily.json",
		success: function (resData) {
			var statesSeries = resData["states_daily"];
			var statesSeriesLength = statesSeries.length;

			var loopLesser;
			var loopGreater;

			//console.log('C:: ', countVal);
			//console.log('L:: ', caseSeriesLength);

			if (clickDecState === 0) {
				$("#prevDec").attr("hidden", true);
				loopLesser = 0;
				loopGreater = 30;
			} else if (clickDecState < 0) {
				$("#prevDec").attr("hidden", true);
				return;
			} else {
				$("#prevDec").attr("hidden", false);
				loopLesser = clickDecState * 30;
				loopGreater = loopLesser + 30;
			}

			if (statesSeriesLength >= loopLesser) {
				$("#nextDec").attr("hidden", false);
				if (clickDecState === 1) {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				} else {
					initVal = loopLesser + 1;
					exitVal = loopGreater;
				}

				for (var i = statesSeriesLength - initVal; i >= statesSeriesLength - exitVal; i--) {
					if (i >= 0) {
						var stateDetails = statesSeries[i];

						if (stateDetails["status"] === 'Confirmed') {

							var xVal = stateDetails["date"];
							xValLoop.push(xVal.replace(/-/g, " ").slice(0, xVal.length - 2));
							yValConfLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Recovered') {
							yValRecoLoop.push(stateDetails[stateCode]);
						}

						if (stateDetails["status"] == 'Deceased') {
							yValDecLoop.push(stateDetails[stateCode]);
						}
					}
					if (i == 0) {
						$("#nextDec").attr("hidden", true);
					}
				}

				getChartForStates('decChart', xValLoop, yValDecLoop, '#6c757d', 'Deceased');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function gaugeReco(recoValue, elementId) {
	google.charts.load('current', {'packages':['gauge']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
		var data = new google.visualization.DataTable();
      data.addColumn('number', 'Recovery');
      
      data.addRows(1);
      data.setCell(0, 0, recoValue);

        var options = {
          width: 400,
		  height: 120,
          redFrom: 0,
		  redTo: 10,
		  yellowFrom: 10,
		  yellowTo: 30,
          greenFrom: 30,
		  greenTo: 100,
		  min: 0,
		  max: 100,
        };

        var chart = new google.visualization.Gauge(document.getElementById(elementId));
        chart.draw(data, options);
      }
}

function gaugeMort(mortValue, elementId) {
	  google.charts.load('current', {'packages':['gauge']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
	  var data = new google.visualization.DataTable();
      data.addColumn('number', 'Mortality');
      
      data.addRows(1);
      data.setCell(0, 0, mortValue);
      
        var options = {
          width: 400,
		  height: 120,
          redFrom: 0,
		  redTo: 100,
		  min: 0,
		  max: 100,
        };

        var chart = new google.visualization.Gauge(document.getElementById(elementId));
        chart.draw(data, options);
      }
}


function pieChartCreate(elementId, rec, mort, act) {
	  google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
		var data = google.visualization.arrayToDataTable([
          ['Rates', 'Overall'],
          ['Recovery %', parseFloat(rec)],
		  ['Mortality %', parseFloat(mort)],
		  ['Active %', parseFloat(act)],
        ]);

        var options = {
			legend: 'none',
			backgroundColor: '#161625',
			is3D: true,
			slices: {0: {color: '#28a745'}, 1: {color: '#6c757d'}, 2: {color: '#007bff'}},
			width: 300,
			height: 200,
        };

        var chart = new google.visualization.PieChart(document.getElementById(elementId));
        chart.draw(data, options);
      }
}

function sliceRates(rateVal) {
	return (rateVal.slice(0, rateVal.length-1));
}

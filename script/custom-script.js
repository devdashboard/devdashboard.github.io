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
					$(rRateRequired).append(computeRecoveryRate(stateDetails["confirmed"], stateDetails["recovered"], stateDetails["deaths"]));

					$(mRateRequired).append(computeMortalityRate(stateDetails["confirmed"], stateDetails["deaths"]));
				}
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function computeRecoveryRate(conf, recvr, death) {
	var recoRate = Math.round(((recvr) / (conf - death)) * 100);

	if (Number.isNaN(recoRate)) {
		return 'NA';
	} else {
		return (recoRate + '%');
	}
}

function computeMortalityRate(conf, death) {

	var mortRate = Math.round((death / conf) * 100);

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
					'<td class="district-td-data">' + entry["confirmed"] + '</td>';
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
			$("#cases-time-in").append(testedOverAll[count - 1]["updatetimestamp"]);


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
					xValLoop.push(caseDetails["date"]);
					yValConfLoop.push(caseDetails["dailyconfirmed"]);
					yValRecoLoop.push(caseDetails["dailyrecovered"]);
					yValDecLoop.push(caseDetails["dailydeceased"]);
				}

				if (recoPage === true) {
					xValLoop.push(caseDetails["date"]);
					yValRrLoop.push(computeRecoRateLastFiveDays(caseDetails["totalconfirmed"], caseDetails["totalrecovered"], caseDetails["totaldeceased"]));
				}

				if (decPage === true) {
					xValLoop.push(caseDetails["date"]);
					yValMrLoop.push(computeDecRateLastFiveDays(caseDetails["totalconfirmed"], caseDetails["totaldeceased"]));
				}
			}

			if (homePage === true) {
				getChart('confirmedChart', xValLoop, yValConfLoop, '#ff073a');
				getChart('recoChart', xValLoop, yValRecoLoop, '#28a745');
				getChart('decChart', xValLoop, yValDecLoop, '#6c757d');
				getAllInOneChart(xValLoop, yValConfLoop, yValRecoLoop, yValDecLoop);

				var tested = resData["tested"];
				var testedLength = tested.length;

				for (var i = testedLength - 1; i >= testedLength - 10; i--) {
					var testedDetails = tested[i];
					var xVal = testedDetails["updatetimestamp"];
					xValSampleLoop.push(getFormattedDayAndMonth(xVal));
					yValSampleLoop.push(testedDetails["totalsamplestested"]);
				}

				getChart('samplesChart', xValSampleLoop, yValSampleLoop, 'white');
			}

			if (recoPage === true) {
				getChartForRates('rrChart', xValLoop, yValRrLoop, '#28a745');
			}

			if (decPage === true) {
				getChartForRates('mrChart', xValLoop, yValMrLoop, '#6c757d');
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function getChart(chartId, xVal, yVal, color) {
	Chart.defaults.global.legend.display = false;
	var conf = document.getElementById(chartId);
	var confirmedChart = new Chart(conf, {
		type: 'bar',
		data: {
			labels: xVal,
			datasets: [{
				label: 'In last 10 days',
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
							return (value / 1000).toFixed(0) + 'K'; // convert it to thousands
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


function getChartForRates(chartId, xVal, yVal, color) {
	Chart.defaults.global.legend.display = false;
	var conf = document.getElementById(chartId);
	var confirmedChart = new Chart(conf, {
		type: 'bar',
		data: {
			labels: xVal,
			datasets: [{
				label: 'In last 10 days',
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
						max: 100,
						callback: function (value) {
							return (value / this.max * 100).toFixed(0) + '%'; // convert it to percentage
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

	var myBarChart = new Chart(ctx, {
		type: 'bar',
		data: data,
		options: {
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
	var recoRate = Math.round(((recvr) / (conf - death)) * 100);

	if (Number.isNaN(recoRate)) {
		return 'NA';
	} else {
		return (recoRate);
	}
}

function computeDecRateLastFiveDays(conf, death) {

	var mortRate = Math.round((death / conf) * 100);

	if (Number.isNaN(mortRate)) {
		return 'NA';
	} else {
		return (mortRate);
	}
}


function getFormattedDayAndMonth(xVal) {
	var tempDate = xVal.slice(3, 5) + '/' +
		xVal.slice(0, 2) + '/' +
		xVal.slice(6, xVal.length);

	var formattedDate = new Date(tempDate);

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

	return ((formattedDate.getDate() - 1) + ' ' + month[formattedDate.getMonth()].slice(0, 3));
}
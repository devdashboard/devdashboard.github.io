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

					valueTemplate = '<td class="header-confirmed">' + numberWithCommas(stateDetails["confirmed"]) + '<br><img src="./images/triangle.png" width="10" height="10" draggable="false"/>&nbsp;<span class="delta">' + numberWithCommas(stateDetails["deltaconfirmed"]) + '</span></td>' +
						'<td class="header-active">' + numberWithCommas(stateDetails["active"]) + '</td>' +
						'<td class="header-recovered">' + numberWithCommas(stateDetails["recovered"]) + '<br><img src="./images/triangle.png" width="10" height="10" draggable="false"/>&nbsp;<span class="delta">' + numberWithCommas(stateDetails["deltarecovered"]) + '</span></td>' +
						'<td class="header-dead">' + numberWithCommas(stateDetails["deaths"]) + '<br><img src="./images/triangle.png" width="10" height="10" draggable="false"/>&nbsp;<span class="delta">' + numberWithCommas(stateDetails["deltadeaths"]) + '</span></td>';
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
					valueTemplate = '<tr class="custom-tr-reco"><td class="custom-td-reco-state">' + stateDetails["state"].slice(0,19) + '</td>'
					+ '<td class="custom-td-reco">' + computeRecoveryRate(stateDetails["confirmed"], stateDetails["recovered"], stateDetails["deaths"]) + '</td>'
					+ '<td class="custom-td-reco-upd">' + computeUpdatedTimeState(stateDetails["lastupdatedtime"]) + '</td>' + '</tr>';
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
					valueTemplate = '<tr class="custom-tr-mort"><td class="custom-td-mort-state">' + stateDetails["state"].slice(0,19) + '</td>'
					+ '<td class="custom-td-mort">' + computeMortalityRate(stateDetails["confirmed"], stateDetails["deaths"]) + '</td>'
					+ '<td class="custom-td-mort-upd">' + computeUpdatedTimeState(stateDetails["lastupdatedtime"]) + '</td>' + '</tr>';
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
	} else if (hh <= 23){
		return hh + ' hours ago';
	} else if (hh <= 47){
		return 'a day ago';
	} else if (hh <= 167){
		return 'few days ago';
	} else if (hh <= 719){
		return 'few week(s) ago';
	} else if (hh <= 1339){
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

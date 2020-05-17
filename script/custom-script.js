function getSensexIndex() {

	$.ajax({
		method: "GET",
		url: "https://priceapi-aws.moneycontrol.com/pricefeed/notapplicable/inidicesindia/in%3BSEN",
		success: function (resData) {

			var actualData = resData["data"];

			if (actualData["company"] === 'SENSEX') {
				valueTemplate = '<tr><td class="header-confirmed numberFirst">' + numberWithCommas(actualData["company"]).toUpperCase() + '</td>' +
					'<td class="header-cprice numberValue">' + numberWithCommas(actualData["pricecurrent"]) + '</td>' +
					'<td class="header-dhigh numberValue">' + numberWithCommas(actualData["HIGH"]) + '</td>' +
					'<td class="header-dlow numberValue">' + numberWithCommas(actualData["LOW"]) + '</td>' +
					'<td class="header-change numberValue">' + numberWithCommas(actualData["PERCCHANGE"]) + '%</td></tr>';
				$("#table-body").append(valueTemplate);
			}
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function getAsianIndices() {
	$.ajax({
		method: "GET",
		url: "https://quote.cnbc.com/quote-html-webservice/quote.htm?noform=1&partnerId=2&fund=1&exthrs=0&output=json&symbols=.N225|.SSEC|.SZSC|.HSI|.AXJO|.KS11|.STI|.NZ50|.NSEI|.SETI|.JKSE|.KLSE|.TWII&requestMethod=extended",
		success: function (resData) {

			var loopData = resData["ExtendedQuoteResult"]["ExtendedQuote"];
			loopData.forEach(function (item) {
				var actualData = item["QuickQuote"];
				valueTemplate = '<tr><td class="header-confirmed numberFirst">' + actualData["shortName"].toUpperCase() + '</td>' +
					'<td class="header-cprice numberValue">' + actualData["last"] + '</td>' +
					'<td class="header-dhigh numberValue">' + actualData["high"] + '</td>' +
					'<td class="header-dlow numberValue">' + actualData["low"] + '</td>' +
					getFormattedChangePercent(actualData["change_pct"]) + '</tr>';
				$("#table-body").append(valueTemplate);
			});
			sortDataByAscOrder('table-body');
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function getAmericanIndices() {
	$.ajax({
		method: "GET",
		url: "https://quote.cnbc.com/quote-html-webservice/quote.htm?noform=1&partnerId=2&fund=1&exthrs=0&output=json&symbols=.DJI|.IXIC|.SPX|.RUT|.VIX|.GSPTSE|.SPTSE|.MXX|.BVSP|.MERV|.IPSA|.IBC&requestMethod=extended",
		success: function (resData) {

			var loopData = resData["ExtendedQuoteResult"]["ExtendedQuote"];
			loopData.forEach(function (item) {
				var actualData = item["QuickQuote"];
				valueTemplate = '<tr><td class="header-confirmed numberFirst">' + actualData["shortName"].toUpperCase() + '</td>' +
					'<td class="header-cprice numberValue">' + actualData["last"] + '</td>' +
					'<td class="header-dhigh numberValue">' + actualData["high"] + '</td>' +
					'<td class="header-dlow numberValue">' + actualData["low"] + '</td>' +
					getFormattedChangePercent(actualData["change_pct"]) + '</tr>';
				$("#table-body").append(valueTemplate);
			});
			sortDataByAscOrder('table-body');
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function getEuropeanIndices() {
	$.ajax({
		method: "GET",
		url: "https://quote.cnbc.com/quote-html-webservice/quote.htm?noform=1&partnerId=2&fund=1&exthrs=0&output=json&symbols=.FTSE|.GDAXI|.FCHI|.STOXX|.AEX|.BFX|.PSI20|.IMOEX|.FTMIB|.SSMI|.OBX|.OMXHPI|.OMXS30|.ATG|.OMXC25CAP&requestMethod=extended",
		success: function (resData) {

			var loopData = resData["ExtendedQuoteResult"]["ExtendedQuote"];
			loopData.forEach(function (item) {
				var actualData = item["QuickQuote"];
				valueTemplate = '<tr><td class="header-confirmed numberFirst">' + actualData["shortName"].toUpperCase() + '</td>' +
					'<td class="header-cprice numberValue">' + actualData["last"] + '</td>' +
					'<td class="header-dhigh numberValue">' + actualData["high"] + '</td>' +
					'<td class="header-dlow numberValue">' + actualData["low"] + '</td>' +
					getFormattedChangePercent(actualData["change_pct"]) + '</tr>';
				$("#table-body").append(valueTemplate);
			});
			sortDataByAscOrder('table-body');
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function getNseIndices(indexCode) {
	$.ajax({

		method: "GET",
		url: "https://priceapi-aws.moneycontrol.com/pricefeed/notapplicable/inidicesindia/" + indexCode,
		success: function (resData) {

			var actualData = resData["data"];

			//Populate timestamp only once in iteration
			if (indexCode === "in%3Bccx") {
				$("#updatedTimeNse").append(computeUpdatedTime(actualData["lastupd"]));
			}

			valueTemplate = '<tr><td class="header-confirmed numberFirst">' + numberWithCommas(actualData["company"]).toUpperCase() + '</td>' +
				'<td class="header-cprice numberValue">' + numberWithCommas(actualData["pricecurrent"]) + '</td>' +
				'<td class="header-dhigh numberValue">' + numberWithCommas(actualData["HIGH"]) + '</td>' +
				'<td class="header-dlow numberValue">' + numberWithCommas(actualData["LOW"]) + '</td>' +
				getFormattedChangePercent(actualData["PERCCHANGE"]) + '</tr>';
			$("#table-body").append(valueTemplate);
			sortDataByAscOrder('table-body');
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function getBseIndices(indexCode) {
	$.ajax({

		method: "GET",
		url: "https://priceapi-aws.moneycontrol.com/pricefeed/notapplicable/inidicesindia/" + indexCode,
		success: function (resData) {

			var actualData = resData["data"];

			//Populate timestamp only once in iteration
			if (indexCode === "in%3Bccx") {
				$("#updatedTimeNse").append(computeUpdatedTime(actualData["lastupd"]));
			}

			valueTemplate = '<tr><td class="header-confirmed numberFirst">' + numberWithCommas(actualData["company"]).toUpperCase() + '</td>' +
				'<td class="header-cprice numberValue">' + numberWithCommas(actualData["pricecurrent"]) + '</td>' +
				'<td class="header-dhigh numberValue">' + numberWithCommas(actualData["HIGH"]) + '</td>' +
				'<td class="header-dlow numberValue">' + numberWithCommas(actualData["LOW"]) + '</td>' +
				getFormattedChangePercent(actualData["PERCCHANGE"]) + '</tr>';
			$("#table-body").append(valueTemplate);
			sortDataByAscOrder('table-body');
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function getNiftyIndices() {
	$.ajax({
		method: "GET",
		url: "https://etmarketsapis.indiatimes.com/ET_Stats/getIndexByIds?pagesize=30&exchange=47&sortby=currentprice&sortorder=desc&indexid=2369&company=true&marketcap=",
		success: function (resData) {

			var searchResult = resData["searchresult"];
			searchResult.forEach(function (companies) {
				for (i = 0; i < companies["companies"].length; i++) {
					var actualData = companies["companies"][i];
					valueTemplate = '<tr><td class="header-confirmed numberFirst">' + actualData["symbol"].toUpperCase() + '</td>' +
						'<td class="header-cprice numberValue">' + actualData["current"] + '</td>' +
						'<td class="header-dhigh numberValue">' + actualData["high"] + '</td>' +
						'<td class="header-dlow numberValue">' + actualData["low"] + '</td>' +
						getFormattedChangePercent(actualData["percentChange"]) + '</tr>';

					$("#table-body").append(valueTemplate);
				}
			});
			sortDataByAscOrder('table-body');
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}

function getSensexIndices() {
	$.ajax({
		method: "GET",
		url: "https://etmarketsapis.indiatimes.com/ET_Stats/getIndexByIds?pagesize=30&exchange=47&sortby=currentprice&sortorder=desc&indexid=2365&company=true&marketcap=",
		success: function (resData) {

			var searchResult = resData["searchresult"];
			searchResult.forEach(function (companies) {
				for (i = 0; i < companies["companies"].length; i++) {
					var actualData = companies["companies"][i];
					valueTemplate = '<tr><td class="header-confirmed numberFirst">' + actualData["symbol"].toUpperCase() + '</td>' +
						'<td class="header-cprice numberValue">' + actualData["current"] + '</td>' +
						'<td class="header-dhigh numberValue">' + actualData["high"] + '</td>' +
						'<td class="header-dlow numberValue">' + actualData["low"] + '</td>' +
						getFormattedChangePercent(actualData["percentChange"]) + '</tr>';

					$("#table-body").append(valueTemplate);
				}
			});
			sortDataByAscOrder('table-body');
		},
		error: function (xhr, status, error) {
			alert(error);
		}
	});
}


function getFormattedChangePercent(chngPrcnt) {
	var formattedPrcnt;
	if (chngPrcnt >= 0) {

		formattedPrcnt = '<td class="header-change numberValueGreen">' + chngPrcnt + '%</td>';
	}
	else {
		formattedPrcnt = '<td class="header-change numberValueRed">' + chngPrcnt + '%</td>';
	}

	return formattedPrcnt;
}


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

function computeUpdatedTime(updateTime) {
	//var formatTime = updateTime.slice(3,5) + '/' 
	+updateTime.slice(0, 2) + '/' +
		updateTime.slice(6, updateTime.length);
	var nowTime = new Date();

	var utcUpdatedTime = new Date(updateTime);
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
	}
	else if (hh === 0 && mm === 0 && ss === 1) {
		return 'Updated a second ago';
	}
	else if (hh === 0 && mm === 0 && ss != 0) {
		return 'Updated ' + ss + ' seconds ago';
	}
	else if (hh === 0 && mm === 1) {
		return 'Updated a minute ago';
	}
	else if (hh === 0 && mm != 0) {
		return 'Updated ' + mm + ' minutes ago';
	}
	else if (hh === 1) {
		return 'Updated an hour ago';
	}
	else {
		return 'Updated ' + hh + ' hours ago';
	}
}
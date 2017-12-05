var map;
var countries;

function loadCoordinates(callback){
	var coordinates = new Object();

	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "coordinates.txt", true);
	txtFile.send();
	txtFile.onreadystatechange = function(){
		if(this.readyState === 4 && this.status == 200){
			coordinates = txtFile.responseText.split("\n");
		}
	}
	countries = info;
	txtFile.onload = function(){
		callback(coordinates);
	};
};

function initMap(coordinates){
	var mapOptions = {
			zoom: 2,
			center:  new google.maps.LatLng(0, 0),
			mapTypeId: google.maps.MapTypeId.HYBRID
	};

	map = new google.maps.Map(document.getElementById('theMap'), mapOptions);
	// BEGIN PERSISTENCE
	var savedDataString = localStorage.getItem("mapData");
	if(savedDataString){
		var savedData = JSON.parse(savedDataString);
		map.setCenter(savedData.center);
		map.setHeading(savedData.heading);
		map.setTilt(savedData.tilt);
		map.setZoom(savedData.zoom);
	}
	function saveData(){
		localStorage.setItem("mapData", JSON.stringify({
			center: map.getCenter(),
			heading: map.getHeading(),
			tilt: map.getTilt(),
			zoom: map.getZoom()
		}));
	}
	map.addListener("center_changed", saveData);
	map.addListener("heading_changed", saveData);
	map.addListener("tilt_changed", saveData);
	map.addListener("zoom_changed", saveData);
	// END PERSISTENCE

	var i;
	var marker = new Array();
	var markers = new Array();
	var coordinate = new Array();
	var image = {
		url: "home_airplane_icon.png",
		size: new google.maps.Size(727,363),
		origin: new google.maps.Point(0,0),
		anchor: new google.maps.Point(20,50),
		scaledSize: new google.maps.Size(40,50)
	};

	if(coordinates != undefined){
		for (i = 0; i < coordinates.length; i++){
			var coordinateString = coordinates[i].split(" ");
			coordinate[i] = new google.maps.LatLng(coordinateString[0],coordinateString[1]);

			function setMarker(callback){
				marker[i] = new google.maps.Marker({
					position: coordinate[i],
					map: map,
					visible: true,
					icon: image
				});
				callback(marker[i]);
			};

			function addListener(thisMarker){
				if(thisMarker != undefined){
						thisMarker.addListener('click',function(){
						map.setZoom(8);
						map.setCenter(thisMarker.getPosition());
						var markerInfo = thisMarker.getPosition().toString;
						var markerBox = new google.maps.InfoWindow({
						content: markerInfo,
						});

						markerBox.setPosition(thisMarker.getPosition());
						markerBox.open(map);
					});
				}
			}setMarker(addListener);
		}

	}

		map.data.setStyle(styleFeature);
		map.data.addListener('mouseover', mouseInToRegion);
		map.data.addListener('mouseout', mouseOutOfRegion);
		map.data.loadGeoJson('countries.json');

		map.data.addListener('click', function(event){

			if(event.feature.getProperty('isServed')){
				var infoId = event.feature.getProperty('infoReference');
				var infoString = "<div class=\"container\"><h2>" + countries[infoId].countryId + "</h2><div class=\"topRow\"><div class=\"countryInfo\">";
				if(parseInt(countries[infoId].numOfBases) > 0){
					infoString = infoString + ("<br><strong>Number of bases:</strong> " + countries[infoId].numOfBases);
				}
				if(parseInt(countries[infoId].numOfAircraft) > 0){
					infoString = infoString + ("<br><strong>Number of aircraft:</strong> " + countries[infoId].numOfAircraft);
				}
				infoString = infoString + ("<br><strong>Population:</strong> " + countries[infoId].population + "<br><strong>Capital:</strong> " +
					countries[infoId].capital + "<br><strong>Official language:</strong> " + countries[infoId].languageOfficial +
					"<br><strong>Currency:</strong> " + countries[infoId].currency +
					"</div><div class=\"countryBorderImg\"><img src=\"" + countries[infoId].countryImage + "\" alt=\"" +
					countries[infoId].countryId + "\"></div></div><div class=\"familyAndVideo\">");

				for(i = 0; i < countries[infoId].numOfFamilyUnits; i++){
					if(i % 8 == 0){
						infoString = infoString + ("<br>");
					}

					infoString = infoString + ("<a href=\"" + countries[infoId].familyUnits[i].pageLink + "\"><img src=\"" +
						countries[infoId].familyUnits[i].photo + "\" class=\"missionaryPhoto\" alt=\"" + countries[infoId].familyUnits[i].displayName + "\"></a>");
				}
				infoString = infoString + ("<br><strong>Families<strong></div></div>");

				var infoBox = new google.maps.InfoWindow({
					content: infoString,
				});

				anchorLocation = new google.maps.LatLng(countries[infoId].anchorLat, countries[infoId].anchorLng);
				infoBox.setPosition(anchorLocation);
				infoBox.open(map);
			}
		});
	}
function startLoading() {
	coordinates = loadCoordinates(initMap);
}

function styleFeature(feature) {
    var outlineWeight = 0.5, zIndex = 1;
    if (feature.getProperty('state') === 'hover') {
		outlineWeight = zIndex = 2;
    }

	for(i = 0; i < info.length; i++){
		if(feature.getProperty('ADMIN') == info[i].countryId){

			feature.setProperty('isServed', true);
			feature.setProperty('infoReference', info[i].countryNum);
			return{
				strokeWeight: outlineWeight,
				strokeColor: '#fff',
				zIndex: zIndex,
				fillColor: 'hsla(237, 93%, 45%, 1)',
				fillOpacity: 0.75
			};
		}
	}

	feature.isServed = false;
	feature.infoReference = null;
	return {
		strokeWeight: outlineWeight,
		strokeColor: '#fff',
		zIndex: zIndex,
		fillColor: 'hsla(0, 0%, 0%, 0)',
		fillOpacity: 0.75
	};
};


function mouseInToRegion(e){
	e.feature.setProperty('state','hover');
};

function mouseOutOfRegion(e){
	e.feature.setProperty('state','normal');
};

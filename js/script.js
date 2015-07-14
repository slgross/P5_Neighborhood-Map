
// create the google maps object
var	Map	= function (element, opts) {
	"use strict";
	this.gMap =	new	google.maps.Map(element, opts);

	this.zoom =	function (level) {
		if (level) {
			this.gMap.setZoom(level);
		} else {
			return this.gMap.getZoom();
		}
	};
};


//map options to be	supplied to	create new map - center	on my house
var mapOptions = {
	zoom: 14,
	center:	new google.maps.LatLng(40.336856,-74.043134),

	mapTypeId: google.maps.MapTypeId.ROADMAP,
	zoomControlOptions:	{
		position: google.maps.ControlPosition.RIGHT_BOTTOM,
		style: google.maps.ZoomControlStyle.SMALL
	},
	panControlOptions: {
		position: google.maps.ControlPosition.RIGHT_BOTTOM
	}
};

// init
var	element	= document.getElementsByClassName('map-canvas')[0],
	iconSelected = './images/Pin.png';
var	map	= new Map(element, mapOptions);
// map.zoom(14);

//initialize infotab
var	infoBubble = new InfoBubble({
	maxWidth: 300,
	maxHeight: 200,
	closeSrc: './images/finish.png',
	backgroundClassName: 'infoBubble'
});

// TAB NAMES for infoBubbles
infoBubble.addTab('StreetView ','Google	Streetview');
infoBubble.addTab('	Info','Info	to be presented');

// Different places	for	my neighborhood	map
var	places = [
	{
		id: 1,
		name: 'Little Silver, New Jersey',
		map: map.gMap,
		position: {
			lat: 40.337454,
			lng: -74.040079
		},
		icon: null,
		selected: 0
	},{
		id: 2,
		name: 'Red Bank Regional High School',
		map: map.gMap,
		position: {
			lat: 40.336777,
			lng: -74.047084
		},
		icon: null,
		selected: 0
	},{
		id: 3,
		name: 'Embury United Methodist Church',
		map: map.gMap,
		position: {
			lat: 40.340833,
			lng: -74.041389
		},
		icon: null,
		selected: 0
	},{
		id:	4,
		name: 'Parker Homestead',
		map: map.gMap,
		position: {
			lat: 40.342388,
			lng: -74.040889
		},
		icon: null,
		selected: 0
	},{
		id: 5,
		name: 'My Home',
		map: map.gMap,
		position: {
			lat: 40.336856,
			lng: -74.043134
		},
		icon: null,
		selected: 0
	},{
		id: 6,
		name: 'Bruce Springsteen',
		map: map.gMap,
		position: {
			lat: 40.362179,
			lng: -74.012637
		},
		icon: null,
		selected: 0
	} ,{
		id: 7,
		name: 'Little Silver (NJT station)',
		map: map.gMap,
		position: {
			lat: 40.326794,
			lng: -74.040803
		},
		icon: null,
		selected: 0
	}
];

// create google map marker
var	Place = function(place) {
	"use strict";
	place.name = ko.observable(place.name);
	place.selected = ko.observable(place.selected);
	var marker = new google.maps.Marker(place);
	if (map.markerCluster) {
		map.markerCluster.addMarker(marker);
	}
	return marker;
};

// At this point - set up the "octopus"
var Octpus_View	= function(){
	"use strict";
	var	self = this;
	self.list = ko.observableArray([]);

	//create and bind markers with locations
	places.forEach(function(place){
		var	marker = new Place(place);
		// event listener
		google.maps.event.addListener(marker, 'click', (function(Copy) {
			return function() {
				self.setCurrentPlace(Copy);
			};
		})(marker));
		self.list().push(marker);
	});


	// Get wikipedia data - if any
	this.wikiCall = function(data) {
		"use strict";
		var	wikiTimeOut	= setTimeout(function(){
			infoBubble.updateTab(1, '<div class="infoBubble"> Info</div>', "request failed");
			infoBubble.updateContent_();
		}, 4000);

		if (data.id !=3 && data.id !=5 && data.id != 6)
		{
		$.ajax({
			url: "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallback&limit=10&search="+data.name(),
			type: 'POST',
			dataType: "jsonp",
			success: function(response) {
				"use strict";
				var articleTitle = response[1];
				var articleLink = response[3];
				var result = [];

				for (var i = 0; i < articleTitle.length; i++){
					var title = articleTitle[i];
					var link = articleLink[i];

					result.push('<li><a  href="'+link+'"target="_blank">'+title+'</a></li>');
				}
				var contentString = result.join('');
				clearTimeout(wikiTimeOut);
				infoBubble.updateTab(1,'<div class="infoBubble">Info</div>',contentString);
				infoBubble.updateContent_();
			}
		});
		}
		else
		if (data.id == 3 || data.id == 5 || data.id == 6)
		{
				var result = [];
				if (data.id == 6)
				{
					result.push('<li><a href"'+"http://www.zillow.com/homes/map/36-Bellevue-Ave-Rumson-NJ-07760_rb/"+'"target="_blank">'+"Springsteen Hut"+'</a></li>');
				}
				if (data.id == 3)
				{
					result.push('<li><a href="'+"http://emburyumc.org/?page_id=31"+'"target="_blank">'+"Embury Church History"+'</a></li>');
				}
				if (data.id == 5)
				{
					result.push('<li><a href="'+"http://www.zillow.com/homes/map/104-Markham-Place-Little-Silver-NJ_rb/"+'"target="_blank">'+"Home Sweet Home"+'</a></li>');
				}
			var contentString = result.join('');
			clearTimeout(wikiTimeOut);
			infoBubble.updateTab(1,'<div class="infoBubble">Info</div>',contentString);
			infoBubble.updateContent_();
		}
	};

	// show street view from google
	this.streetView = function(data){
		"use strict";
		var img = data.position.A + "," + data.position.F;
		var contentString = '<img class="bg" alt="failed to load image...check internet" src="https://maps.googleapis.com/maps/api/streetview?size=600x300&location='+img+'">';
		infoBubble.updateTab(0,'<div class="infoBubble">StreetView</div>',contentString);
		infoBubble.updateContent_();
	};

	this.setCurrentPlace = function(data){
	// first clear everything
		"use strict";
		 self.list().forEach(function(data){
			data.setIcon(null);
			data.selected(null);
		});
		// set up the Icons
		data.setIcon(iconSelected);
		data.selected(1);
		self.currentPlace(data);
		self.wikiCall(data);
		self.streetView(data);
		infoBubble.open(map.gMap, data);
		return true;
	};

	this.currentPlace = ko.observable(this.list()[0]);
	this.searchBox = ko.observable("");

	// KO utility arrayFilter implement search functionality
	this.searchPlaces = ko.computed(function() {
			"use strict";
			if(self.searchBox() === "") {
				return self.list();
			}else {
				return ko.utils.arrayFilter(self.list(), function(item){
				return item.name().toLowerCase().indexOf(self.searchBox().toLowerCase())>-1;
			});
		}
	});
	$( "#placesBtn" ).click(function() {
		$( "#places" ).toggleClass( "hidden-xs" );
	});

	window.onload = function() {
		self.setCurrentPlace(self.list()[0]);
	};
};
ko.applyBindings(new Octpus_View());
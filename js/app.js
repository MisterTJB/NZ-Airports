$(document).foundation();

// Constants and globals
var INFO_TEMPLATE = "<div class='infoWindow' style='width: 250px;'><h1>%AIRPORT% (%CODE%)</h1><h2>Elevation: %ELEVATION% ft</h2><h2>Group Rating: %GROUP%</h2>";
var ENDPOINT = "https://api.wunderground.com/api/30d55959c65fe197/forecast/q/%LAT%,%LON%.json";
var infoWindow;
var map;

// ViewModel for Airports. Responsible for observing changes to the
// group rating slider and updating the list of airports and the
// markers on the map.
function AirportsViewModel(data) {
  var self = this;

  self.airports = data; // Data Source
  self.groupRating = ko.observable(6);

  // Filter the list of airports by group rating and return a sorted array
  // of suitable airports
  self.filteredAirports = ko.computed(function() {
    return ko.utils.arrayFilter(self.airports, function(airport){
      return airport.maxGroupRating >= self.groupRating();
    }).sort(function (left, right){
      return left.airportCode < right.airportCode ? -1 : 1;
    });
  });

  // Set the visibility of markers on the map with respect to the
  // groupRating property, and close any open infowindow
  self.filterMarkers = ko.computed(function() {
    self.airports.forEach(function(airport){
      if (airport.maxGroupRating >= self.groupRating() && airport.marker){
        airport.marker.setVisible(true);
      } else if (airport.marker) {
        airport.marker.setVisible(false);
      }
    });
    if (infoWindow) {
      infoWindow.close(); // If an infowindow is being displayed, close it
    }
  });

  // Open the infowindow on the map for an airport chosen from the list view
  self.calloutMarker = function(airport) {
    google.maps.event.trigger(airport.marker, 'click');
  };

}

// Establish the ViewModel
var viewModel = new AirportsViewModel(airportsData);
ko.applyBindings(viewModel);

// Create Marker objects for each airport and associate them with
// event listeners
function createMarkers(map){
  infoWindow = new google.maps.InfoWindow({maxWidth: 250});

  // Stop animation when the infowindow associated with a marker is closed
  google.maps.event.addListener(infoWindow,'closeclick',function(){
    viewModel.airports.forEach(function(airport){
      airport.marker.setAnimation(null);
    });
  });

  // Create a marker for each airport
  viewModel.airports.forEach(function(airport){
    var marker = new google.maps.Marker({
      position: {lat: airport.latitude, lng: airport.longitude},
      map: map
    });

    // On each marker, listen for the click event; on click, open an infowindow
    // and begin animating the marker
    google.maps.event.addListener(marker, 'click', function () {
      buildInfoWindowForAirport(airport, infoWindow);
      map.setCenter({lat: airport.latitude, lng: airport.longitude});

      // Suspend animation on all markers
      viewModel.airports.forEach(function(airport){
        airport.marker.setAnimation(null);
      });

      // Animate this marker
      if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    });

    // Associate the marker with its airport object
    airport.marker = marker;
  });
}

// Build an infobox for a marker by retrieving data from the airports dataset
// and the Wunderground forecast API
function buildInfoWindowForAirport(airport, infoWindow) {

  // Build the URI for the forecast data associated with this airport's location
  var endpoint = ENDPOINT.replace("%LAT%", airport.latitude);
  endpoint = endpoint.replace("%LON%", airport.longitude);

  // Build the static content for the infobox and display it
  var contentString;
  contentString = INFO_TEMPLATE.replace("%AIRPORT%", airport.airportName);
  contentString = contentString.replace("%CODE%", airport.airportCode);
  contentString = contentString.replace("%GROUP%", airport.maxGroupRating);
  contentString = contentString.replace("%ELEVATION%", airport.elevation);
  infoWindow.setContent(contentString);
  infoWindow.open(map, airport.marker);

  // Execute an AJAX call to the Wunderground API
  $.ajax( {
    url: endpoint,
    dataType: 'jsonp',
    type: 'GET'
    }).done(function(data) {

      // Attempt to unpack the forecast information
      var forecast;
      try {
        forecast = data.forecast.txt_forecast.forecastday[0].fcttext_metric;

        // If an empty forecast is returned, echo this to the user
        if (forecast.length === 0){
          forecast = "No forecast data available";
        }
      } catch (err) {
        // If the request is successful, but there is no forecast information,
        // echo this to the user
        forecast = "No forecast data available";
      }
      contentString += "<hr><p>" + forecast + "</p>";
      contentString += "<p><em>Forecast provided by <a href='http://www.wunderground.com'>Weather Underground</a></em></p>";

    }).fail(function(){
      contentString += "<hr><p>This is embarassing: a networking issue prevented me from retrieving weather information</p>";
    }).always(function(){
      infoWindow.setContent(contentString);
    });
}

// Initialise tha main map, centered on New Zealand
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom:5,
    center: {lat: -40.9006, lng: 174.8860},
    mapTypeControl: false,
    streetViewControl: false
  });
  createMarkers(map);
}

function mapLoadError() {
  var errorText = '<div class="row" style="margin-top: 15%;"><div class="small-12 small-centered column"><h3 class="text-center">Looks like there was a problem loading Google Maps &#x1f648;</h3><p>You might like to check your network settings and refresh your browser</div></div>';
  $("#map").append(errorText);
  //alert("Oh no, there was a problem loading the map! You might like to check your network and try again.");
}

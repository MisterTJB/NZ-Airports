$(document).foundation()

var INFO_TEMPLATE = "<div class='infoWindow'><h1>%AIRPORT% (%CODE%)</h1><h3>Elevation: %ELEVATION% ft</h3><h4>Group Rating: %GROUP%</h4><p>%FORECAST%</p>";

function AirportsViewModel(data) {
  var self = this;
  self.airports = data;
  self.groupRating = ko.observable(6);
  self.filteredAirports = ko.computed(function() {
    return ko.utils.arrayFilter(self.airports, function(airport){
      return airport.maxGroupRating >= self.groupRating();
    }).sort(function (left, right){
      return left.airportCode < right.airportCode ? -1 : 1;
    });
  });
  self.filterMarkers = ko.computed(function() {
    self.airports.forEach(function(airport){
      if (airport.maxGroupRating >= self.groupRating() && airport.marker){
        airport.marker.setVisible(true);
      } else if (airport.marker) {
        airport.marker.setVisible(false);
      }
    });
    if (infoWindow) {
      infoWindow.close();
    }
  });
  self.calloutMarker = function(airport) {
    google.maps.event.trigger(airport.marker, 'click');
  };

}

var viewModel = new AirportsViewModel(airportsData);
var infoWindow;
ko.applyBindings(viewModel);

function createMarkers(map){
  infoWindow = new google.maps.InfoWindow();
  google.maps.event.addListener(infoWindow,'closeclick',function(){
    viewModel.airports.forEach(function(airport){
      airport.marker.setAnimation(null);
    });
 });
  viewModel.airports.forEach(function(airport){
    var marker = new google.maps.Marker({
      position: {lat: airport.latitude, lng: airport.longitude},
      map: map
    });
    google.maps.event.addListener(marker, 'click', function () {
      buildInfoWindowForAirport(airport, infoWindow);
      viewModel.airports.forEach(function(airport){
        airport.marker.setAnimation(null);
      });
      if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    });
    airport.marker = marker;
  });
}

function buildInfoWindowForAirport(airport, infoWindow) {
  var endpoint = "http://api.wunderground.com/api/30d55959c65fe197/forecast/q/%LAT%,%LON%.json"
  endpoint = endpoint.replace("%LAT%", airport.latitude);
  endpoint = endpoint.replace("%LON%", airport.longitude);
  infoWindow.setContent("<h1>" + airport.airportName + "</h1>");
  infoWindow.open(map, airport.marker);
  var contentString;
  $.ajax( {
    url: endpoint,
    dataType: 'jsonp',
    type: 'GET'}).done(function(data) {
      var forecast = data.forecast.txt_forecast.forecastday[0].fcttext_metric;
      contentString = INFO_TEMPLATE.replace("%AIRPORT%", airport.airportName);
      contentString = contentString.replace("%CODE%", airport.airportCode);
      contentString = contentString.replace("%GROUP%", airport.maxGroupRating);
      contentString = contentString.replace("%ELEVATION%", airport.elevation);
      if (forecast) {
        contentString = contentString.replace("%FORECAST%", forecast);
      } else {
        contentString = contentString.replace("%FORECAST%", "No weather data available");
      }
    }).fail(function(){
      contentString = contentString.replace("%FORECAST%", "This is embarassing: a networking issue prevented me from retrieving weather information");
    }).always(function(){
      infoWindow.setContent(contentString);
    });
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 6,
    center: {lat: -40.9006, lng: 174.8860}
  });
  createMarkers(map);
}

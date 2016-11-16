$(document).foundation()

function AirportsViewModel(data) {
  var self = this;
  self.airports = data;
  self.groupRating = ko.observable(6);
  self.filteredAirports = ko.computed(function() {
    var filtered = ko.utils.arrayFilter(self.airports, function(airport){
      return airport.maxGroupRating >= self.groupRating();
    });
    return filtered;
  });
}

ko.applyBindings(new AirportsViewModel(airportsData));

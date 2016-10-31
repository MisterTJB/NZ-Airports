function AirportsViewModel(data) {
  var self = this;
  self.airports = ko.observableArray(data);
}

ko.applyBindings(new AirportsViewModel(airportsData));

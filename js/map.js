

// Chicago Halal Locations Database.
var locationDatabase = [
  {name: 'The Halal Guys Chicago', location: {lat: 41.9309268, lng: -87.7459486}, id: '55d3e980498e4713211cef73'},
  {name: 'Rumi Middle Eastern Grill', location: {lat: 41.9980032, lng: -87.6871963}, id: '576f2158498e96ab80e82569'},
  {name: 'I-Cafe Sukurs Place', location: {lat: 41.95430984150239, lng: -87.67477845545348}, id: '4c2113bc7e85c92802f1b921'},
  {name: 'La Pane Halal Pizza', location: {lat: 41.9281963, lng: -87.6907459}, id: '4c0e734cd64c0f476430285d'},
  {name: 'Chicago Halal Loop', location: {lat: 41.9047732, lng: -87.6581608}, id: '57da140d498e60e4772233c8'},
  {name: 'Cafe 53', location: {lat: 41.8780215, lng: -87.6289296}, id: '4d94d5971231b60ca31283a1'}
];

// Global variable callouts.
var map;
var infowindow;


/*///////////////////////////////////////////////
* Initiating the Google Maps using its API.
*////////////////////////////////////////////////

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
  center: {lat: 41.9111101, lng: -87.5740802},
  zoom: 12,
  styles: [{"featureType":"water","stylers":[{"color":"#19a0d8"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road.highway","elementType":"labels.icon"},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape.man_made","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]}]
  // Styles from: https://snazzymaps.com/style/17/bright-and-bubbly
  });

  // Creating popup InfoWindow
  infowindow = new google.maps.InfoWindow();

  //Knockouts viewModel() to create filteration.
  ko.applyBindings(new ViewModel());

  // Error alert if map doesn't function.
  function mapError() {
    alert('Map failed to render :( Please try again later or check console log in inspection window');
  }

} // <-- End of initMap()


/*////////////////////////////////////////////////
* Getting the data from FourSqaure, using its API.
*/////////////////////////////////////////////////

function Location(data) {
  var self = this;
  self.name = ko.observable(data.name);
  self.location = data.location;
  self.venueId = data.id;
  
  // API Client key and secret key obtained from FourSquare.
    var client_id = "NZKSG4BLF0G5BWNCBRXYUMAKULVFP25Q4JREOOHX3CI4RGHV";
    var client_secret = "EKLEUWH1OJBUA2NPUM1LEEIGEKJRUCY2DSHLK4AHMZ54JXUK";

  // FourSquare API used to grab the following data.
  var foursquareURL = 'https://api.foursquare.com/v2/venues/' + self.venueId + '?' + '&client_id=' + client_id + '&client_secret=' + client_secret + '&v=20171129';

  //calling using Ajax.
  $.ajax({
    url: foursquareURL,
    dataType: 'json'
  }).done(function(getData){
    var rating = getData.response.venue.rating
    self.content = '<h3>' + self.name() + ' ' + '<div class="badge">' + rating + '/10' + '</div></h3>';
    self.content += '<hr class="linestyle">';
    self.content += '<div><b>Location: </b> ' + getData.response.venue.location.address + '</div></ br>';
    self.content += '<div><b>Call: </b>' + getData.response.venue.contact.formattedPhone + '</div>';
  }).fail(function(){
    self.content = '<h4>Sorry, we were not able to retrive data from fourSquare(</h4>';
  });

  // Creating markers with animation and addlisteners.
  self.marker = new google.maps.Marker({
    name: self.name(),
    position: self.location,
    map: map,
    animation: google.maps.Animation.DROP,
  });

  //Animation
  self.marker.setAnimation(google.maps.Animation.DROP);


  //addlisteners for 'click' function
    self.marker.addListener('click', function(){
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
      self.marker.setAnimation(null);
    }, 1500);
    populateInfoWindow(this, self.content);
    
  });

  // Locations list from side navigation click function
  self.sideNavClick = function() {
    google.maps.event.trigger(self.marker, 'click');
  };
} // <---Location() End.




/*///////////////////////////////////////////////////////
* Initiating ViewModel() to create filters using Knockout.
*////////////////////////////////////////////////////////

function ViewModel() {
  var self = this;

  // Creating an array so it can loop through all location.
  self.allLocations = ko.observableArray([]);
  locationDatabase.forEach(function(joint){
    joint = new Location(joint);
    self.allLocations.push(joint);
  });



// Functions to loop through display and hide markers on the map. 
// Credit: Udacity Google Maps API Course
function ShowMarkers(restaurants) {
  for (var i = 0; i < restaurants.length; i++) {
    restaurants[i].marker.setMap(map);
  }
}
function HideMarkers(restaurants) {
  for (var i = 0; i < restaurants.length; i++) {
    restaurants[i].marker.setMap(null);
  }
}

// Filteration for all locations
  self.filter = ko.observable();
  self.filterable = ko.computed(function(){
    var searchFilter = self.filter();
    HideMarkers(self.allLocations());

    //Show all markers by default
    if(!searchFilter) {
      ShowMarkers(self.allLocations());
      return self.allLocations();
    } else {
      
    // Show filterd location.
      var searchResult = ko.utils.arrayFilter(self.allLocations(), function(joint){
        return joint.name().toLowerCase().indexOf(searchFilter.toLowerCase()) != -1;
      });
    // Displaying only searched markers.
      ShowMarkers(searchResult);
      return searchResult;
    }
  });
}

// Distrubting FourSquared data into the popup infoWindow of the google maps.
// One current window closes as other popup window opens.
// Credit: Udacity Google Maps API Course
  function populateInfoWindow(marker, content) {
  if(infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent(content);
    infowindow.open(map, marker);

    //close current window when click on other markers.
    infowindow.addListener('closeclick', function(){
      infowindow.marker = null;
    });
  }
}


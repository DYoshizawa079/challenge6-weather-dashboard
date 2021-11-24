
var elemSearchbox = document.querySelector("#searchbox");
var elemSubmitBtn = document.querySelector("#submit");
var elemSearchList = document.querySelector("#searchlist");
var searches = [];

var apiKey = "0052c45ec6b9cc06b70de487e9bbc6bc";

// Add past searches to localStorage and sidebar
var addSearch = function(search) {
    localStorage.getItem("searches");
    console.log("searches", searches);
    searches.push(search);
    localStorage.setItem("searches", JSON.stringify(searches));
    console.log("searches", searches);
}

// Get the city's name from the searchbox
var getCity = function(event){
    event.preventDefault();
    var cityName = elemSearchbox.value;
    console.log("cityName", cityName);
    getWeatherAPI(cityName);
    addSearch(cityName);
}

// Generate the weather API URL
var getWeatherAPI = function(city) {

    var latitude;
    var longitude;
    var geocodingAPI = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + apiKey;
    var weatherAPI;

    fetch(geocodingAPI)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            console.log("lat-long object",data);
            console.log("lat", data[0].lat);
            console.log("long", data[0].lon);

            latitude = data[0].lat;
            longitude = data[0].lon;

            weatherAPI = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=metric&appid=" + apiKey;
            
            console.log("weatherAPI",weatherAPI);
            
            getWeather(weatherAPI);
        });
}

// Get the weather data fromt the generated API URL
var getWeather = function(apiUrl) {
    fetch(apiUrl)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            console.log("weather object", data);
        });
}

elemSubmitBtn.addEventListener("click",getCity);


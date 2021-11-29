
var elemSearchbox = document.querySelector("#searchbox");
var elemSubmitBtn = document.querySelector("#submit");
var elemSearchList = document.querySelector("#searchlist");
var searches = [];
var elemCurrentWeather = document.querySelector("#currentweather div");
var elemForecastedWeather = document.querySelector("#forecasted div");

var apiKey = "0052c45ec6b9cc06b70de487e9bbc6bc";

var cityName;

// Clears/Resets weather info that's displayed
var clearDisplay = function(){
    elemCurrentWeather.innerHTML = "";
    elemForecastedWeather.innerHTML = "";
}

// Creates list of saved searches by retreiving saved searches from localStorage
var getSavedSearches = function() {
    searches = localStorage.getItem("searches");
    searches = JSON.parse(searches);

    if (searches) {
        for (var i=0; i < searches.length; i++) {
            var searchListBtn = document.createElement("button");
            searchListBtn.textContent = searches[i].city;
            searchListBtn.setAttribute("data-lat", searches[i].lat);
            searchListBtn.setAttribute("data-long", searches[i].long);
            elemSearchList.appendChild(searchListBtn);
        }
    }
    
}

// "Get saved search" function
// When the user clicks on a saved search, get the latitude, longitude info needed to perform a new weather lookup based on that saved search
var getBtnInfo = function(event) {
    clearDisplay();
    var cityBtn = event.target;
    cityName = cityBtn.textContent;
    var lat = cityBtn.getAttribute("data-lat");
    var long = cityBtn.getAttribute("data-long");
    getWeather(lat,long);
}

// Add past searches to localStorage and sidebar
var addSearch = function(city,lat,long) {

    var savedSearch = {
        city: city,
        lat: lat,
        long: long
    }
    if (searches) {
        searches.push(savedSearch);
    } else {
        searches = [savedSearch];
    }
    var searchListBtn = document.createElement("button");
    searchListBtn.textContent = savedSearch.city;
    searchListBtn.setAttribute("data-lat", savedSearch.lat);
    searchListBtn.setAttribute("data-long", savedSearch.long);
    elemSearchList.appendChild(searchListBtn);
    
    localStorage.setItem("searches", JSON.stringify(searches));
}

// Runs when user clicks the "Search" button
// Get the text in the searchbox and feed that into a search that uses an API
var getCity = function(event){
    event.preventDefault();
    clearDisplay();
    cityName = elemSearchbox.value;
    cityName.trim();
    getWeatherAPI(cityName);
}

// Generate the weather API URL
var getWeatherAPI = function(city) {

    var latitude;
    var longitude;
    var geocodingAPI = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + apiKey;

    fetch(geocodingAPI)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){

            if (data.length===0) {
                alert("That's not a valid search");
            } else {
                latitude = data[0].lat;
                longitude = data[0].lon;

                // Check whether search entry matches an existing search

                if (searches) {
                    var matched;
                    for (var i=0; i < searches.length; i++) {
                        var btnLat = searches[i].lat;
                        var btnLon = searches[i].long;
                        if (latitude === btnLat && longitude === btnLon) {
                            matched = true;
                        } else {
                        }
                    }
                    if (matched!=true) {
                        addSearch(cityName, latitude, longitude);
                        matched = false;
                    }
                } else {
                    addSearch(cityName, latitude, longitude);
                }
                
                getWeather(latitude,longitude);
                
            }
        });
}

// Convert a Unix timestamp to (customized) date object
var convertTimestamp = function(timestamp){
    var timestamp = timestamp * 1000;
    timestamp = new Date(timestamp);
    var dateinfo = {
        weekday: timestamp.toLocaleString("en-US", {weekday: "long"}),
        month: timestamp.toLocaleString("en-US", {month: "long"}), 
        day: timestamp.toLocaleString("en-US", {day: "numeric"}), 
        year: timestamp.toLocaleString("en-US", {year: "numeric"}) 
    };
    return dateinfo;
}

// Display the current weather data 
var displayCurrentWeather = function(data) {
    var city = document.createElement("h3");
    city.textContent = cityName;
    elemCurrentWeather.appendChild(city);

    var date = document.createElement("p");
    var currentDate = convertTimestamp(data.current.dt);
    date.textContent = currentDate.weekday + ", " + currentDate.month + ", " + currentDate.day + ", " + currentDate.year;
    elemCurrentWeather.appendChild(date);

    var weather = document.createElement("img");
    var weatherSrc = "https://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
    weather.setAttribute("src", weatherSrc);
    elemCurrentWeather.appendChild(weather);

    var temp = document.createElement("p");
    temp.textContent = "Temp: " + data.current.temp + "C";
    elemCurrentWeather.appendChild(temp);

    var humidity = document.createElement("p");
    humidity.textContent = "Humidity: " + data.current.humidity + "%";
    elemCurrentWeather.appendChild(humidity);

    var wind = document.createElement("p");
    wind.textContent = "Wind: " + data.current.wind_speed + "m/sec";
    elemCurrentWeather.appendChild(wind);

    var uv = document.createElement("p");
    uv.textContent = "UV Index: " + data.current.uvi;
    if (data.current.uvi <= 2) {
        uv.setAttribute("class", "uv_favorable");
    } else if (data.current.uvi > 2 && data.current.uvi <=5) {
        uv.setAttribute("class", "uv_moderate");
    } else {
        uv.setAttribute("class", "uv_severe");
    }
    elemCurrentWeather.appendChild(uv);
}

// Display the forecasted weather data
var displayForecastedWeather = function(data) {
    for (var i=1; i <= 5; i++) {
        var forecastDay = document.createElement("div");
        forecastDay.setAttribute("class","day");

        var dayLI = document.createElement("h4");
        var day = data.daily[i].dt;
        day = convertTimestamp(day);
        dayLI.innerHTML = day.weekday + "<br>" + day.month + " " + day.day;
        forecastDay.appendChild(dayLI);

        var weather = document.createElement("img");
        var weatherSrc = "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png";
        weather.setAttribute("src", weatherSrc);
        forecastDay.appendChild(weather);

        var tempLI = document.createElement("p");
        tempLI.textContent = "Temp (Max): " + data.daily[i].temp.max + "C";
        forecastDay.appendChild(tempLI);

        var windLI = document.createElement("p");
        windLI.textContent = "Wind: " + data.daily[i].wind_speed + "m/sec";
        forecastDay.appendChild(windLI);

        var humidityLI = document.createElement("p");
        humidityLI.textContent = "Humidity: " + data.daily[i].humidity + "%";
        forecastDay.appendChild(humidityLI);

        elemForecastedWeather.appendChild(forecastDay);

    }
}

// Get the weather data fromt the generated API URL
var getWeather = function(lat,long) {

    var weatherAPI = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&units=metric&appid=" + apiKey;
    fetch(weatherAPI)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            displayCurrentWeather(data);
            displayForecastedWeather(data);
        });
}

getSavedSearches();
elemSubmitBtn.addEventListener("click",getCity);
elemSearchList.addEventListener("click", getBtnInfo);


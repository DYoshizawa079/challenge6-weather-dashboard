
var elemSearchbox = document.querySelector("#searchbox");
var elemSubmitBtn = document.querySelector("#submit");
var elemSearchList = document.querySelector("#searchlist");
var searches = [];
var elemCurrentWeather = document.querySelector("#currentweather");
var elemForecastedWeather = document.querySelector("#forecasted");

var apiKey = "0052c45ec6b9cc06b70de487e9bbc6bc";

var cityName;

// "Clear weather info" function
var clearDisplay = function(){
    elemCurrentWeather.innerHTML = "";
}

// "Get Saved Searches" function
var getSavedSearches = function() {
    searches = localStorage.getItem("searches");
    searches = JSON.parse(searches);
    console.log("searches from localstorage", searches);

    for (var i=0; i < searches.length; i++) {
        console.log(searches[i]);
        var searchListBtn = document.createElement("button");
        searchListBtn.textContent = searches[i];
        searchListBtn.setAttribute("data-lat","");
        searchListBtn.setAttribute("data-long","");
        elemSearchList.appendChild(searchListBtn);
    }
}

// "Get button info" function
var getBtnInfo = function(event) {
    clearDisplay();
    var cityBtn = event.target;
    console.log("city Button clicked",cityBtn);
    var lat = cityBtn.getAttribute("data-lat");
    var long = cityBtn.getAttribute("data-long");
    getWeather(lat,long);
}

// Add past searches to localStorage and sidebar
var addSearch = function(search) {
    searches.push(search);
    localStorage.setItem("searches", JSON.stringify(searches));
    console.log("searches updated", searches);
}

// Runs when user clicks the "Search" button
var getCity = function(event){
    event.preventDefault();
    clearDisplay();
    cityName = elemSearchbox.value;
    cityName.trim();
    console.log("cityName", cityName);
    getWeatherAPI(cityName);
    addSearch(cityName);
}

// Generate the weather API URL
var getWeatherAPI = function(city) {

    var latitude;
    var longitude;
    var geocodingAPI = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + apiKey;

    fetch(geocodingAPI)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            console.log("lat-long object",data);

            if (data.length===0) {
                alert("That's not a valid search");
            } else {
                latitude = data[0].lat;
                longitude = data[0].lon;
                console.log("lat", data[0].lat);
                console.log("long", data[0].lon);

                // Check whether search entry matches an existing search
                /*if (match) {
                    // make no new button
                    // run getWeather()
                } else {
                    // make new button
                }
                */
                getWeather(latitude, longitude);
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
    var city = document.createElement("li");
    city.textContent = "City: " + cityName;
    elemCurrentWeather.appendChild(city);

    var date = document.createElement("li");
    var currentDate = convertTimestamp(data.current.dt);
    console.log(currentDate);
    date.textContent = "Date: " + currentDate.weekday + ", " + currentDate.month + ", " + currentDate.day + ", " + currentDate.year;
    elemCurrentWeather.appendChild(date);

    var weatherLI = document.createElement("li");
    elemCurrentWeather.appendChild(weatherLI);
    var weather = document.createElement("img");
    var weatherSrc = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
    weather.setAttribute("src", weatherSrc);
    weatherLI.appendChild(weather);

    var temp = document.createElement("li");
    temp.textContent = "Temperature: " + data.current.temp + "C";
    elemCurrentWeather.appendChild(temp);

    var humidity = document.createElement("li");
    humidity.textContent = "Humidity: " + data.current.humidity + "%";
    elemCurrentWeather.appendChild(humidity);

    var wind = document.createElement("li");
    wind.textContent = "Wind speed: " + data.current.wind_speed + "m/sec";
    elemCurrentWeather.appendChild(wind);

    var uv = document.createElement("li");
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
    console.log("forecasted weather");
    for (var i=1; i <= 5; i++) {
        console.log(data.daily[i]);
        var forecastDay = document.createElement("div");
        forecastDay.setAttribute("class","day");

        var forecastDayUL = document.createElement("ul");
        forecastDay.appendChild(forecastDayUL);

        var dayLI = document.createElement("li");
        var day = data.daily[i].dt;
        day = convertTimestamp(day);
        dayLI.textContent = "Date: " + day.weekday + ", " + day.month + ", " + day.day;
        forecastDayUL.appendChild(dayLI);

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
            console.log("weather object", data);

            displayCurrentWeather(data);
            displayForecastedWeather(data);
        });
}

getSavedSearches();
elemSubmitBtn.addEventListener("click",getCity);
elemSearchList.addEventListener("click", getBtnInfo);


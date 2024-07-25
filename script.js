const cityInput = document.getElementById("textBar");
const searchButton = document.querySelector(".search-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentlocation = document.querySelector(".location-btn");

// API key for OpenWeatherMap API
const API_KEY = "f9ab58a3c83775de97438dbb6fdd641a"; 

const createWeatherCard = (cityName,weatherItem, index) => {
   if(index === 0) { // HTML for the main weather card
    return `<div class="details">
                    <h3>${cityName}${weatherItem.dt_txt.split(" ")[0]}</h2>
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>wind: ${weatherItem.wind.speed}M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png"  alt="Weather Icon" >
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
   }else {  // HTML for the 5 days weather card 
    return `<li class="card">  
         <h3>(${weatherItem.dt_txt.split(" ")[0]})</h2>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon">
        <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>wind: ${weatherItem.wind.speed}M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}</h4>
        <li>`;
   }

    
}

const getWeatherDetails = (cityName,lat,lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
       
      // filter forecasts to get only one forecast per day  
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter(forcast => {
           const forecastDate = new Date(forcast.dt_txt).getDate();
           if(!uniqueForecastDays.includes(forecastDate)) {
            return uniqueForecastDays.push(forecastDate);
           } 
      });

      cityInput.value ="";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      console.log(fiveDaysForecast);
      fiveDaysForecast.forEach((weatherItem, index) => {
         if(index === 0) {
            currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
         }else {
            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
         }
        
      });
    
    }).catch(() => {
        alert("An error occured while fetching the Weather forcast");
    });
}

// Show weather details from city name

const getCitycoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return;

     const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
     fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for${cityName}`);
        const { name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
     }).catch(() => {
        alert("An error occured while fetching the coordinates");
     });
}

// Code for weather details using users current location

const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL =`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
           
            // Get city name from coordinates using reverse API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
            const {name} = data[0];
            getWeatherDetails(name, latitude, longitude);
             }).catch(() => {
                alert("An error occured while fetching the City!");
             });
        },
        error => { // Show alert if user dennied permission
            if(error.code === error.PERMISSION_DENIED) {
                alert("Please reset location permission to grant access");
            }
        }
    )
}

currentlocation.addEventListener("click",getUserLocation);
searchButton.addEventListener("click", getCitycoordinates);

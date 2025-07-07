const API_KEY = "c5ac928c659edbbfbe12a0384d6a656e";

const weatherDiv = document.getElementById("weatherInfo");
const button = document.getElementById("getWeatherBtn");
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const unitToggle = document.getElementById("unitToggle");
const loader = document.getElementById("loader");

let currentUnit = "metric"; // default in Celsius

// Load last stored result
window.addEventListener("DOMContentLoaded", () => {
  const lastData = localStorage.getItem("weatherData");
  if (lastData) {
    displayWeather(JSON.parse(lastData));
  }
});

// Handle unit switch
unitToggle.addEventListener("change", () => {
  currentUnit = unitToggle.checked ? "imperial" : "metric";
});

// Show loader
function showLoader() {
  loader.classList.remove("hidden");
}

// Hide loader
function hideLoader() {
  loader.classList.add("hidden");
}

// Get weather by location
button.addEventListener("click", () => {
  if (!navigator.geolocation) {
    weatherDiv.innerHTML = "Geolocation not supported.";
    return;
  }

  showLoader();
  navigator.geolocation.getCurrentPosition(success, error);
});

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`)
    .then(res => res.json())
    .then(data => handleWeather(data))
    .catch(() => showError("Failed to retrieve weather."));
}

function error() {
  showError("Location permission denied.");
}

// Search by city
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    weatherDiv.innerHTML = "Please enter a city name.";
    return;
  }

  showLoader();

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`)
    .then(res => res.json())
    .then(data => handleWeather(data))
    .catch(() => showError("Failed to retrieve weather."));
});

function handleWeather(data) {
  hideLoader();

  if (data.cod !== 200) {
    showError(data.message || "Invalid response.");
    return;
  }

  localStorage.setItem("weatherData", JSON.stringify(data));
  displayWeather(data);
}

function showError(msg) {
  hideLoader();
  weatherDiv.innerHTML = `❌ ${msg}`;
}

function displayWeather(data) {
  const city = data.name;
  const temp = data.main.temp;
  const condition = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const unitSymbol = currentUnit === "imperial" ? "°F" : "°C";

  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherDiv.innerHTML = `
    <p><strong>📍 ${city}</strong></p>
    <p><img src="${iconUrl}" alt="${condition}"></p>
    <p>🌡️ ${temp} ${unitSymbol}</p>
    <p>🌤️ ${condition}</p>
  `;
}

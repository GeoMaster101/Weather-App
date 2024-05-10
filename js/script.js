const myAPI = "e8524f0d7fd1c2b3c5e990d8c0c5bc78";
const clock = dayjs();
const DAY_LENGTH = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TEMP_COLOR_LENGTH = [
  "var(--temp-color-freeze)",
  "var(--temp-color-cold)",
  "var(--temp-color-neutral)",
  "var(--temp-color-warm)",
  "var(--temp-color-hot)",
];
const WEATHER_STATUS_ICON_LENGTH = [
  "Rain.png",
  "Sunny.png",
  "Moon.png",
  "cloudy.png",
  "Clouds.png",
];
let cityOption;
// console.log(cityOption);

let selectedCity = JSON.parse(localStorage.getItem("selectedCity"))
  ? JSON.parse(localStorage.getItem("selectedCity"))
  : {};
let cityList = JSON.parse(localStorage.getItem("cityList"))
  ? JSON.parse(localStorage.getItem("cityList"))
  : [];

// get the latitude and longtitude of a city
// set country as US by DEFAULT
// save city name, state, and country
// this only run when new city is added
const addNewCity = function () {
  $.ajax({
    url: `https://api.openweathermap.org/geo/1.0/direct?q=${selectedCity.cityName.replace(
      " ",
      "-"
    )},${selectedCity.state},us&limit=50&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    console.log(res);
    selectedCity.cityName = res[0].name;
    selectedCity.state = res[0].state;
    selectedCity.lat = res[0].lat;
    selectedCity.lon = res[0].lon;
    //   console.log(selectedCity);
    getTempToday();
    getTempNextFiveDays();
    // displayCityList();
    // displayCityListMenuToggle();
  });
};

// suppose I already have an object of a city
// now I can pass lat and lon of that city
// store all neccessary data: temp, temp max and min, humidity and status.
// then store this object to local storage for further action.
const getTempToday = function () {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    selectedCity.currentTemp = Math.ceil(res.main.temp);
    selectedCity.tempMax = Math.ceil(res.main.temp_max);
    selectedCity.tempMin = Math.ceil(res.main.temp_min);
    selectedCity.huminity = res.main.humidity;
    selectedCity.weatherStatus = res.weather[0].main;
    localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
    const isCityExisted = cityList.find(function (city) {
      if (
        city.cityName == selectedCity.cityName &&
        city.state == selectedCity.state
      ) {
        return true;
      }
      return false;
    });
    if (!isCityExisted) {
      cityList.push(selectedCity);
    } else {
      cityList = cityList.filter(function (city) {
        if (
          city.cityName == selectedCity.cityName &&
          city.state == selectedCity.state
        )
          city.currentTemp = selectedCity.currentTemp;
        return city;
      });
    }
    localStorage.setItem("cityList", JSON.stringify(cityList));
    displayCityList();
    displayCityListMenuToggle();
    displayCurrentTemp();
    // console.log(res);
  });
};

// Now I want to retrieve data for the next 5 days in every 3 hours.
// this function only works when user select a particular city, so we dont need to store data to local storage.

// $.ajax({
//   url: `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${myAPI}`,
//   medthod: "GET",
// }).then(function (res) {
//   displayTempNextHours(res);
//   displayTempNextDays(res.list);
//   //   console.log(res);
// });
const getTempNextFiveDays = function () {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedCity.lat}&lon=${selectedCity.lon}&units=metric&appid=${myAPI}`,
    medthod: "GET",
  }).then(function (res) {
    displayTempNextHours(res);
    displayTempNextDays(res.list);
    //   console.log(res);
  });
};

const displayCurrentTemp = function () {
  const body = $("body");
  const currentLocation = $("#current-location");
  currentLocation.empty();
  const cityName = $("<h3>");
  const temp = $("<h2>");
  const tempDescription = $("<div>");
  const tempStatus = $("<p>");
  const tempMinMaxContainer = $("<div>");
  const tempMax = $("<p>");
  const tempMin = $("<p>");

  tempMax.html(`H:${Math.ceil(selectedCity.tempMax)}&deg;`);
  tempMin.html(`L:${Math.ceil(selectedCity.tempMin)}&deg;`);
  tempMinMaxContainer.addClass("d-flex-row w-1 justify-content-between");
  tempMinMaxContainer.append(tempMax);
  tempMinMaxContainer.append(tempMin);
  tempStatus.text(selectedCity.weatherStatus);
  tempDescription.addClass("d-flex-col align-items-center");
  tempDescription.append(tempStatus);
  tempDescription.append(tempMinMaxContainer);

  temp.html(`${Math.ceil(selectedCity.currentTemp)}&deg;`);
  cityName.text(`${selectedCity.cityName}`);
  currentLocation.append(cityName);
  currentLocation.append(temp);
  currentLocation.append(tempDescription);

  const currentHour = clock.get("hour");
  if (
    selectedCity.weatherStatus == "Rain" ||
    currentHour >= 19 ||
    currentHour <= 5
  ) {
    if (selectedCity.weatherStatus == "Rain")
      body.css("background-image", `url(./images/rain-bg.jpeg)`);
    else body.css("background-image", `url(./images/night-bg.jpeg)`);
    $(".section").addClass("bg-dark-custom");
  } else {
    body.css("background-image", `url(./images/sunny-bg.jpeg)`);
    $(".section").addClass("bg-light-custom");
  }
};

// display hourly weather
const displayTempNextHours = function (data) {
  console.log("displayTempNextHours is running");
  const weatherInNextThreeHoursList = $("#temp-in-three-hours");
  //   console.log(data);
  for (let i = -1; i < 15; i++) {
    const item = $("<li>");
    const hour = $("<p>");
    const weatherStatus = $("<img>");
    const tempNextThreeHour = $("<p>");
    tempNextThreeHour.addClass("hourly-forecast__temp");

    item.addClass("list-item d-flex-col align-items-center mr-2");
    hour.addClass("hourly-forecast__time");

    // get status of a weather
    // set up icon

    if (i == -1) {
      hour.text("Now");
      weatherStatus.attr(
        "src",
        setWeatherStatusIcon(
          parseInt(clock.get("hour")),
          selectedCity.weatherStatus
        )
      );
      weatherStatus.addClass("icon mt-2 mb-2");
      tempNextThreeHour.html(`${Math.ceil(selectedCity.currentTemp)}&deg;`);
    } else {
      let nextHour = parseInt(data.list[i].dt_txt.split(" ")[1].split(":")[0]);
      weatherStatus.attr(
        "src",
        setWeatherStatusIcon(nextHour, data.list[i].weather.main)
      );
      weatherStatus.addClass("icon mt-2 mb-2");
      nextHour = convertToAmPm(nextHour);
      hour.text(`${nextHour}`);
      tempNextThreeHour.html(`${Math.ceil(data.list[i].main.temp)}&deg;`);
    }

    item.append(hour);
    item.append(weatherStatus);
    item.append(tempNextThreeHour);

    weatherInNextThreeHoursList.append(item);
  }
};

const displayTempNextDays = function (data) {
  //   console.log(data);
  console.log("displayTempNextDays is running");
  let currentDay = parseInt(clock.date());
  const forecastDaily = $("#forecast-daily");
  forecastDaily.empty();

  let isToday = true;
  // weatherStatus[0] = rain
  // weatherStatus[1] = clear
  // weatherStatus[2] = scattered cloud
  // weatherStatus[3] = cloud
  let weather = {
    min: selectedCity.tempMin,
    max: selectedCity.tempMax,
    weatherStatus: [0, 0, 0, 0],
  };

  for (obj of data) {
    const item = $("<li>");
    const date = $("<p>");
    const tempStatus = $("<img>");
    const tempMinMax = $("<div>");
    const tempMin = $("<p>");
    const tempBar = $("<span>");
    const tempMax = $("<p>");
    let nextDate = dayjs(obj.dt_txt.split(" ")[0], "YYYY-MM-DD");
    nextDay = parseInt(nextDate.date());
    // console.log(`current day: ${currentDay}`);
    // console.log(`next day: ${nextDay}`);
    if (currentDay == nextDay) {
      if (weather.min > obj.main.temp_min)
        weather.min = Math.ceil(obj.main.temp_min);
      if (weather.max < obj.main.temp_max)
        weather.max = Math.ceil(obj.main.temp_max);
      weatherStatus = obj.weather[0].main;
      if (weatherStatus == "Rain") weather.weatherStatus[0]++;
      else if (weatherStatus == "Clear") weather.weatherStatus[1]++;
      else if (obj.weather[0].description == "scattered clouds")
        weather.weatherStatus[2]++;
      else weather.weatherStatus[3]++;
    } else {
      //   console.log(weather);
      tempMax.html(`${weather.max}&deg;`);
      tempMin.html(`${weather.min}&deg;`);
      tempBar.addClass(`temp-bar`);
      tempBar.css("background", `${findTempBar(weather.min, weather.max)}`);
      tempMinMax.addClass("d-flex-row align-items-center");
      tempMinMax.append(tempMin);
      tempMinMax.append(tempBar);
      tempMinMax.append(tempMax);

      let statusIdx = 0;
      let counter = weather.weatherStatus[0];
      console.log(weather);
      for (let i = 1; i < 4; i++) {
        if (weather.weatherStatus[i] > counter) {
          counter = weather.weatherStatus[i];
          statusIdx = i;
        }
      }
      tempStatus.addClass("icon");
      if (statusIdx == 0) {
        if (counter == 0) {
          tempStatus.attr("src", "./images/Clouds.png");
        } else {
          tempStatus.attr("src", "./images/Rain.png");
        }
      } else if (statusIdx == 1) {
        tempStatus.attr("src", "./images/Sunny.png");
      } else if (statusIdx == 2) {
        tempStatus.attr("src", "./images/cloudy.png");
      } else {
        tempStatus.attr("src", "./images/Clouds.png");
      }

      if (isToday) {
        date.text("Today");
        isToday = false;
      } else {
        if (nextDate.day() == 0) {
          date.text(`${DAY_LENGTH[6]}`);
        } else date.text(`${DAY_LENGTH[nextDate.day() - 1]}`);
      }

      item.addClass(
        "list-item d-flex-row justify-content-between align-items-center"
      );
      item.append(date);
      item.append(tempStatus);
      item.append(tempMinMax);

      forecastDaily.append(item);

      currentDay = nextDay;
      weather = { min: 99, max: -99, weatherStatus: [0, 0, 0, 0] };
    }
  }
};

const displayCityList = function () {
  const list = $("#city-list");
  //   const menuToggleList = $("#menu-toggle__city-list");
  list.empty();
  const rightNow = dayjs().format("hh:mm");
  for (city of cityList) {
    const item = $("<li>");
    const btn = $("<button>");
    const cardHeader = $("<div>");
    const cardHeaderGroup = $("<div>");
    const cardHeaderCity = $("<h3>");
    const cardHeaderTime = $("<p>");
    const cardHeaderTemp = $("<h2>");
    cardHeaderCity.text(`${city.cityName}`);
    cardHeaderTime.text(rightNow);
    cardHeaderTemp.html(`${city.currentTemp}&deg;`);
    cardHeaderCity.addClass("card__city fw-bold");
    cardHeaderTime.addClass("list-item__city-time fw-bold text-start");
    cardHeaderTemp.addClass("card__current-temp");
    cardHeaderGroup.append(cardHeaderCity);
    cardHeaderGroup.append(cardHeaderTime);
    cardHeader.addClass(
      "d-flex-row justify-content-between align-items-center w-100 mb-2"
    );
    cardHeader.append(cardHeaderGroup);
    cardHeader.append(cardHeaderTemp);

    const cardBody = $("<div>");
    const tempStatus = $("<p>");
    const tempMinMax = $("<div>");
    const tempMin = $("<p>");
    const tempMax = $("<p>");
    tempStatus.text(`${city.weatherStatus}`);
    tempMin.html(`L:${city.tempMin}&deg;`);
    tempMax.html(`H:${city.tempMax}&deg;`);
    tempMinMax.addClass(
      "d-flex-row justify-content-between card__weather-min-max"
    );
    tempMinMax.append(tempMax);
    tempMinMax.append(tempMin);
    cardBody.addClass(
      "d-flex-row justify-content-between align-items-end fw-bold w-100"
    );
    cardBody.append(tempStatus);
    cardBody.append(tempMinMax);

    btn.addClass("card");
    btn.attr("type", "button");
    btn.attr("id", `${city.cityName.replace(" ", "-")}`);
    btn.attr("state", `${city.state}`);
    btn.append(cardHeader);
    btn.append(cardBody);

    if (city.weatherStatus == "Rain")
      btn.css("background-image", "url(./images/rain-bg.png)");
    else {
      if (clock.get("hour") > 5 && clock.get("hour") < 19)
        btn.css("background-image", "url(./images/sunny-bg.jpeg");
      else btn.css("background-image", "url(./images/night-bg-phone.jpeg");
    }

    item.addClass("list-item");
    item.append(btn);

    list.append(item);
  }
};

const displayCityListMenuToggle = function () {
  // const list = $("#city-list");
  //   const list = $("#city-list");
  const list = $("#menu-toggle__city-list");
  list.empty();
  const rightNow = dayjs().format("hh:mm");
  for (city of cityList) {
    const item = $("<li>");
    const btn = $("<button>");
    const container = $("<div>");
    const label = $("<label>");
    const input = $("<input>");
    const cardHeader = $("<div>");
    const cardHeaderGroup = $("<div>");
    const cardHeaderCity = $("<h3>");
    const cardHeaderTime = $("<p>");
    const cardHeaderTemp = $("<h2>");
    cardHeaderCity.text(`${city.cityName}`);
    cardHeaderTime.text(rightNow);
    cardHeaderTemp.html(`${city.currentTemp}&deg;`);
    cardHeaderCity.addClass("card__city fw-bold");
    cardHeaderTime.addClass("list-item__city-time fw-bold");
    cardHeaderTemp.addClass("card__current-temp");
    cardHeaderGroup.append(cardHeaderCity);
    cardHeaderGroup.append(cardHeaderTime);
    cardHeader.addClass(
      "d-flex-row justify-content-between align-items-center w-100 mb-2"
    );
    cardHeader.append(cardHeaderGroup);
    cardHeader.append(cardHeaderTemp);

    const cardBody = $("<div>");
    const tempStatus = $("<p>");
    const tempMinMax = $("<div>");
    const tempMin = $("<p>");
    const tempMax = $("<p>");
    tempStatus.text(`${city.weatherStatus}`);
    tempMin.html(`L:${city.tempMin}&deg;`);
    tempMax.html(`H:${city.tempMax}&deg;`);
    tempMinMax.addClass(
      "d-flex-row justify-content-between card__weather-min-max"
    );
    tempMinMax.append(tempMax);
    tempMinMax.append(tempMin);
    cardBody.addClass(
      "d-flex-row justify-content-between align-items-end fw-bold w-100"
    );
    cardBody.append(tempStatus);
    cardBody.append(tempMinMax);

    btn.addClass("card");
    btn.attr("type", "button");
    btn.attr("id", `${city.cityName.replace(" ", "-")}`);
    btn.attr("state", `${city.state}`);
    btn.attr("data-bs-dismiss", "offcanvas");
    btn.append(cardHeader);
    btn.append(cardBody);

    if (city.weatherStatus == "Rain")
      btn.css("background-image", "url(./images/rain-bg.png)");
    else {
      if (clock.get("hour") > 5 && clock.get("hour") < 19)
        btn.css("background-image", "url(./images/sunny-bg.jpeg");
      else btn.css("background-image", "url(./images/night-bg-phone.jpeg");
    }

    item.addClass("list-item");
    item.append(btn);

    list.append(item);
  }
};

const convertToAmPm = function (hour) {
  if (hour == 0) return "12AM";
  if (hour == 12) return "12PM";
  if (hour > 12) return `${hour - 12}PM`;
  return `${hour}AM`;
};

// 0: < 8
// 1: 9 - 16
// 2: 17 - 24
// 3: 25 - 32
// 4: > 32
const findTempBar = function (tempMin, tempMax) {
  const tempBase = [8, 16, 24, 32, 40];
  let left = 0,
    right = 0;

  for (let i = 0; i < 4; i++) {
    if (tempMin <= tempBase[i] || tempMin <= tempBase[i] + 2) {
      left = i;
      break;
    }
  }

  for (let i = 4; i > -1; i--) {
    if (tempMax >= tempBase[i] - 2) {
      right = i;
      break;
    }
  }

  let tempBar = `linear-gradient(90deg,`;
  if (right - left != 0) {
    for (let i = 0; i <= right - left; i++) {
      tempBar += `${TEMP_COLOR_LENGTH[left + i]} ${
        (100 * i) / (right - left)
      }%`;
      if (i != right - left) {
        tempBar += ", ";
      } else {
        tempBar += ")";
      }
    }
    return tempBar;
  }
  //   console.log(tempBar + `${TEMP_COLOR_LENGTH[left]} 0%, ${TEMP_COLOR_LENGTH[left]} 100%)`);

  return (
    tempBar + `${TEMP_COLOR_LENGTH[left]} 0%, ${TEMP_COLOR_LENGTH[left]} 100%)`
  );
};

// set icon based on weather status and current hour
// if it is rainy -> then icon rain
// if it is clear -> then icon based on hour
//                  if hour from the morning to noon (5AM - 6PM) -> then set sun icon
//                  if hour from the evening to early morning (7Pm - 4AM (next day)) -> then set icon moon.
// if it is cloudy -> then set icon cloudy
// 0: rain
// 1: sunny
// 2: moon
// 3: cloudy (morning)
// 4: cloudy
const setWeatherStatusIcon = function (hour, weatherStatus) {
  // weatherStatus.attr("src", "./images/Clouds.png");
  if (weatherStatus == "Rain")
    return `./images/${WEATHER_STATUS_ICON_LENGTH[0]}`;
  if (weatherStatus == "Clear") {
    if (hour > 4 && hour < 19)
      return `./images/${WEATHER_STATUS_ICON_LENGTH[1]}`;
    return `./images/${WEATHER_STATUS_ICON_LENGTH[2]}`;
  }
  if (hour > 4 && hour < 19) return `./images/${WEATHER_STATUS_ICON_LENGTH[3]}`;
  return `./images/${WEATHER_STATUS_ICON_LENGTH[4]}`;
};

const displayTime = function () {
  const time = dayjs().format("hh:mm:ss");
  // console.log("TIME: ", time);
  $(".list-item__city-time").text(time);
};

$("#city-list").on("click", ".card", function () {
  const cityName = $(this).attr("id");
  const cityState = $(this).attr("state");
  // console.log($(this).attr("state"));
  selectedCity = cityList.find(function (city) {
    console.log(city.cityName.replace(" ", "-"));
    console.log($(this).attr("id"));
    if (city.cityName.replace(" ", "-") == cityName && city.state == cityState)
      return city;
  });
  // console.log(selectedCity);
  $("#current-location").empty();
  $("#temp-in-three-hours").empty();
  $("#forecast-daily").empty();
  displayCurrentTemp();
  getTempNextFiveDays();
  localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
  console.log("clicked");
});

$("#menu-toggle__city-list").on("click", ".card", function () {
  const cityName = $(this).attr("id");
  const cityState = $(this).attr("state");
  // console.log($(this).attr("state"));
  selectedCity = cityList.find(function (city) {
    console.log(city.cityName.replace(" ", "-"));
    console.log($(this).attr("id"));
    if (city.cityName.replace(" ", "-") == cityName && city.state == cityState)
      return city;
  });
  // console.log(selectedCity);
  $("#current-location").empty();
  $("#temp-in-three-hours").empty();
  $("#forecast-daily").empty();
  getTempToday();
  displayCurrentTemp();
  getTempNextFiveDays();
  localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
  //   console.log("clicked");
});

$("#city-search-list").on("click", ".add-city-btn", function (event) {
  const cityName = $(event.target).closest("li").attr("id");
  const cityState = $(event.target).closest("li").attr("state");
  // console.log(id);
  // console.log(cityState);
  selectedCity.cityName = cityName;
  selectedCity.state = cityState;
  $("search-city-input").val("");
  addNewCity();
});

$("#search-city-input").on("keyup", function () {
  let input = $(this).val().trim();
  input = input.replace(" ", "-");
  if (input.length > 2) {
    $.ajax({
      url: `https://api.openweathermap.org/geo/1.0/direct?q=${input},us&limit=50&appid=${myAPI}`,
      method: "GET",
      data: { query: input },
      success: function (res) {
        $("#city-search-list").empty();
        res.forEach(function (city) {
          const btn = $("<button>");
          const item = $("<li>");

          btn.addClass("btn border text-white add-city-btn");
          btn.text(`ADD`);

          item.addClass("list-item d-flex-row justify-content-between");
          item.attr("id", `${city.name.replace(" ", "-")}`);
          item.attr("state", `${city.state}`);
          item.text(`${city.name}, ${city.state}`);
          item.append(btn);

          $("#city-search-list").append(item);
        });
      },
      error: function (xhr, status, error) {
        console.log("Error", error);
      },
    });
  } else {
    $("#city-search-list").empty();
  }
});

// displayCurrentTemp();
// displayCityList();
// displayCityListMenuToggle();
setInterval(displayTime, 1000);
addNewCity();

// 05/09/2024
// search city is available in the big screen, but it's not ready in the smaller screen. (COMPLETED)
// when adding many cities, I cannot scroll down.
// after adding new city, the input should be back to default.

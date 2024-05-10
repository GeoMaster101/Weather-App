const myAPI = "e8524f0d7fd1c2b3c5e990d8c0c5bc78";
let lon = "",
  lat = "";
const body = $("body");
const section = $(".section");
const clock = dayjs();
const DAY_LENGTH = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

$.ajax({
  url: `https://api.openweathermap.org/geo/1.0/direct?q=milwaukee,us&limit=50&appid=${myAPI}`,
  method: "GET",
}).then(function (res) {
  const usCountries = [];
  console.log(res);

  lat = res[0].lat;
  lon = res[0].lon;
  for (obj of res) {
    if (obj.country === "US") {
      usCountries.push(obj);
    }
  }

  const listNextFiveDays = findNextFiveDays();
  console.log(listNextFiveDays);
});

const getWeatherNextFiveDays = function (lat, lon, city) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    console.log(city);
    localStorage.setItem("weatherHourly", JSON.stringify(res));
    // getWeatherInNextThreeHours(res, city);
  });
};

const getWeatherToday = function (lat, lon, city) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${myAPI}`,
    method: "GET",
  }).then(function (res) {
    console.log(res);
    const currentLocation = $("#current-location");

    const cityName = $("<h3>");

    const temp = $("<h2>");
    const tempDescription = $("<div>");
    const tempStatus = $("<p>");
    const tempMinMaxContainer = $("<div>");

    const tempMax = $("<p>");

    const tempMin = $("<p>");

    tempMax.html(`H:${Math.ceil(res.main.temp_max)}&deg;`);
    tempMin.html(`L:${Math.ceil(res.main.temp_min)}&deg;`);
    tempMinMaxContainer.addClass("d-flex-row w-1 justify-content-between");
    tempMinMaxContainer.append(tempMax);
    tempMinMaxContainer.append(tempMin);

    tempStatus.text("Sunny");

    tempDescription.addClass("d-flex-col align-items-center");
    tempDescription.append(tempStatus);
    tempDescription.append(tempMinMaxContainer);

    temp.html(`${Math.ceil(res.main.temp)}&deg;`);

    cityName.text(`${city.name}`);

    currentLocation.append(cityName);
    currentLocation.append(temp);
    currentLocation.append(tempDescription);

    localStorage.setItem("currentCity", JSON.stringify(res));
  });
};

const getWeatherInNextThreeHours = function () {
  const weatherInNextThreeHoursList = $("#temp-in-three-hours");
  const data = JSON.parse(localStorage.getItem("weatherHourly"));
  const city = JSON.parse(localStorage.getItem("currentCity"));

  for (let i = -1; i < 10; i++) {
    const item = $("<li>");
    const hour = $("<p>");
    const status = $("<img>");
    const tempNextThreeHour = $("<p>");
    tempNextThreeHour.addClass("hourly-forecast__temp");

    item.addClass("list-item d-flex-col align-items-center mr-2");
    hour.addClass("hourly-forecast__time");
    status.attr("src", "./images/cloud.png");
    status.addClass("icon mt-2 mb-2");
    if (i == -1) {
      hour.text("Now");
      tempNextThreeHour.html(`${Math.ceil(city.main.temp)}&deg;`);
    } else {
      const nextHour = convertToAmPm(
        parseInt(data.list[i].dt_txt.split(" ")[1].split(":")[0])
      );
      hour.text(`${nextHour}`);
      tempNextThreeHour.html(`${Math.ceil(data.list[i].main.temp)}&deg;`);
    }

    item.append(hour);
    item.append(status);
    item.append(tempNextThreeHour);

    weatherInNextThreeHoursList.append(item);
  }
};

$(document).ready(function () {
  changeBackground();
});

const changeBackground = function () {
  const currentTime = clock.get("hour");

  if (currentTime > 6 && currentTime < 18) {
    body.css("background-image", `url("./images/sunny-bg.jpeg")`);
    section.css("background-color", "var(--bg-light)");
  } else {
    body.css("background-image", `url("./images/night-bg-phone.jpeg")`);
    section.css("background-color", "var(--bg-dark)");
  }
};

const convertToAmPm = function (hour) {
  if (hour == 0) return "12AM";
  if (hour == 12) return "12PM";
  if (hour > 12) return `${hour - 12}PM`;
  return `${hour}AM`;
};

const findNextFiveDays = function () {
  const data = JSON.parse(localStorage.getItem("weatherHourly"));
  const dayList = [];
  let currentDay = clock.day();
  let day = 0;
  let i = 0;

  while (day < 5) {
    let nextDay = dayjs(data.list[i].dt_txt.split(" ")[0], "YYYY-MM-DD");
    nextDay = nextDay.day();
    console.log(`today: ${currentDay}\nnextDay: ${nextDay}`);
    if (nextDay > currentDay) {
      dayList.push(i);
      currentDay = nextDay;
      console.log("i: ", i);
      day++;
    }
    i++;
  }

  return dayList;
};

const setFiveDaysForecast = function (dayList) {
  const data = JSON.parse(localStorage.getItem("weatherHourly"));
  console.log(data);
  const dayOfWeek = clock.day();
  console.log(DAY_LENGTH[dayOfWeek]);
};

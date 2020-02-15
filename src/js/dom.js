import { formatTime, uplift } from './helpers/formatting';
import {
  todayDate,
  yesterdayDate,
  thisWeek,
  lastWeek,
  thisMonth,
  lastMonth,
  thisYear,
  lastYear
} from './helpers/date';
import { readData } from './tracker';
import { getCookie, setCookie } from './helpers/cookie';
import { log } from './helpers/log';
import { readLimits } from './tracker';

const timerBlock = function() {
  const logo = document.getElementById("logo");
  let timer = document.getElementById("youtube-time-tracker");

  if(!timer) {
    timer = document.createElement("div");

    timer.innerHTML = `
      <div class="youtube-time-tracker__body">
        <div class="youtube-time-tracker__stopwatch-icon">
        </div>

        <div class="youtube-time-tracker__time">
        </div>

        <div class="youtube-time-tracker__popup">
          <div class="youtube-time-tracker__popup-body">
            <div class="youtube-time-tracker__name">
              Youtube Time Tracker
            </div>

            <ul class="youtube-time-tracker__stats">
            </ul>

            <ul class="youtube-time-tracker__timelimit">
                <label for="time-limit-input">Day watch time limit in hours:</label>
                <input type="number" id="time-limit-input" name="time-limit-input" max=24 min=0 step=0.01>
                <button id="submit-time-limit">Submit</button>
            </ul>

            <div class="youtube-time-tracker__links">
              <a class="youtube-time-tracker__link secondary-link"
                href="https://github.com/makaroni4/youtube_time_tracker"
                target="_blank">
                Source code
              </a>

              <a class="youtube-time-tracker__link secondary-link"
                href="http://bit.ly/YTT-feedback"
                target="_blank">
                Give feedback
              </a>
            </div>
          </div>

          <div class="youtube-time-tracker__rating">
           
          </div>
        </div>
      </div>
    `.trim();

    timer.id = "youtube-time-tracker";
    timer.className = "youtube-time-tracker";

    logo.parentNode.insertBefore(timer, logo.nextSibling);
  }

  return timer;
}

const upliftCssClass = function(currentTime, prevTime) {
  if(currentTime === 0 || currentTime === undefined || prevTime === undefined || prevTime < 5) {
    return "";
  }

  let cssClass = "ytt-stat__uplift--active";

  if(currentTime > prevTime) {
    cssClass += " ytt-stat__uplift--red";
  } else {
    cssClass += " ytt-stat__uplift--green";
  }

  return cssClass;
}

const renderStat = function(timerData, name, key, prevKey) {
  let output = "";

  const duration = formatTime(timerData[key]);

  output += `
    <li>
      <div class="ytt-stat">
        <div class="ytt-stat__time">
          ${name}: ${duration}
        </div>

        <div class="ytt-stat__uplift ${upliftCssClass(timerData[key], timerData[prevKey])}">
          ${uplift(timerData[key], timerData[prevKey]) || ""}
        </div>
      </div>
    </li>
  `;

  return output;
}

const statsContent = function(timerData) {
  const today = todayDate();
  const week = thisWeek();
  const month = thisMonth();
  const year = thisYear();

  const yesterday = yesterdayDate();
  const prevWeek = lastWeek();
  const prevMonth = lastMonth();
  const prevYear = lastYear();

  let stats = "";

  stats += renderStat(timerData, "Today", today, yesterday);
  stats += renderStat(timerData, "This week", week, prevWeek);
  stats += renderStat(timerData, "This month", month, prevMonth);
  stats += renderStat(timerData, "This year", year, prevYear);

  if(timerData["installed_at"]) {
    const installedAt = new Date(timerData["installed_at"]);

    stats += renderStat(timerData, `Total since ${installedAt.getFullYear()}`, "time_watched");
  }

  return stats;
}

export const renderTimer = function(timerData) {
  log('--> renderTimer');

  let logo = document.getElementById("logo");

  if(logo) {
    const timer = timerBlock();
    const timeBlock = timer.querySelector(".youtube-time-tracker__time");
    const statsBlock = timer.querySelector(".youtube-time-tracker__stats");

    const today = todayDate();
    const yesterday = yesterdayDate();

    if(timerData) {
      timeBlock.innerHTML = formatTime(timerData[today]);
      statsBlock.innerHTML = statsContent(timerData);
    } else {
      readData(function(timerData) {
        timeBlock.innerHTML = formatTime(timerData[today]);
        statsBlock.innerHTML = statsContent(timerData);
      });
    }
  }
}

export const renderTimerFirstTime = function() {
  readLimits(function(limits) {
    let submitInput = document.getElementById("time-limit-input");
    submitInput.value = limits / 60;
  });

  bindEvents();
}

export const bindEvents = function () {
  let submitBtn = document.getElementById("submit-time-limit");

  submitBtn.onclick = function() { persistLimits(); };
}

function persistLimits () {
  const TRACKER_STORAGE_LIMITS = "youtube_time_tracker_limits";

  let limitsInHours = document.getElementById('time-limit-input').value;
  let limitsInMinutes = limitsInHours * 60;

  chrome.storage.local.set({ [TRACKER_STORAGE_LIMITS]: limitsInMinutes }, function () {
      log('YouTube Time Tracker limit is set to:');
      log(limitsInMinutes);
  });
}

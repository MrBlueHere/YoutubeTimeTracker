import { log } from './helpers/log';
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

const TRACKER_STORAGE_KEY = "youtube_time_tracker_data";
const TRACKER_STORAGE_LIMITS = "youtube_time_tracker_limits";

const persistData = function(timer, callback) {
  chrome.storage.local.set({ [TRACKER_STORAGE_KEY]: timer }, function() {
    log('YouTube Time Tracker is set to:');
    log(timer);

    if(callback) {
      callback(timer);
    }
  });
}

const cleanUpOldKeys = function(timer) {
  const allowedKeys = new Set([
    todayDate(),
    thisWeek(),
    thisMonth(),
    thisYear(),
    yesterdayDate(),
    lastWeek(),
    lastMonth(),
    lastYear(),
    "installed_at",
    "time_watched"
  ]);

  Object.keys(timer)
    .filter(key => !allowedKeys.has(key))
    .forEach(key => delete timer[key]);
}

export const readData = function(callback) {
  chrome.storage.local.get([TRACKER_STORAGE_KEY], function(result) {
    log('YouTube Time Tracker read as:');
    log(result);

    const timer = result[TRACKER_STORAGE_KEY];

    if(timer) {
      callback(timer);
    } else {
      let result = {};

      result[todayDate()] = 0;
      result[thisWeek()] = 0;
      result[thisMonth()] = 0;
      result[thisYear()] = 0;

      callback(result);
    }
  });
}

export const readLimits = function(callback) {
  chrome.storage.local.get([TRACKER_STORAGE_LIMITS], function (result) {
      log('YouTube Time Tracker limit read as:');
      log(result);

      const limits = result[TRACKER_STORAGE_LIMITS];

      callback(limits);
  });
}

export const blockSiteWithCover = function (limits, timeToday) {
  if (limits !== undefined && limits !== null) {
      if (timeToday > limits) {
         document.body.innerHTML = `
           <style>
              body {
                font-family: Roboto, sans-serif;
                color: white;
                background: #798897;
                padding: 1em;
                -webkit-font-smoothing: antialiased;
              }

              h1{
                font-size: 25px;
              }
              h2 {
                font-size: 20px;
              }

              section {
                display: block;
                width: 60%;
                background: #B5232A;
                margin: 30% auto 1em;
                height: 200px;
                position: relative;
                -webkit-transform-style: preserve-3d;
                -moz-transform-style: preserve-3d;
                transform-style: preserve-3d;
                border-radius: 25px;
                p {
                  padding: 1em;
                  margin: 0;
                }
              }

              .element {
                position: relative;
                top: 50%;
                text-align: center;
                -webkit-transform: translateY(-50%);
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
              }
            </style>

            <section>
              <h1 class="element">Youtube Time Tracker has blocked this website</h2>
            </section>

            <h2 style="padding-top: 25%;" class="element">You've exceeded your daily time limit for this website. Go and be productive!</h2>
          `;
      }
  }
}

export const incrementTime = function(increment, callback) {
  if (document.visibilityState === "hidden") {
    return;
  }

  readData(function(timer) {
    const today = todayDate();
    const week  = thisWeek();
    const month = thisMonth();
    const year  = thisYear();

    if(!timer["time_watched"]) {
      timer["time_watched"] = (timer[lastYear()] || 0) + (timer[year] || 0);
    }

    [today, week, month, year, "time_watched"].forEach(key => {
      if(timer[key]) {
        timer[key] += increment;
      } else {
        timer[key] = increment;
      }
    });

    if(!timer["installed_at"]) {
      timer["installed_at"] = today;
    }

    cleanUpOldKeys(timer);

    persistData(timer, callback);

    readLimits(function(limits) { 
      blockSiteWithCover(limits, timer[today]);
    });
  });
}

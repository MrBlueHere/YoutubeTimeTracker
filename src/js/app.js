import { incrementTime } from './tracker';
import { renderTimer } from './dom';
import { renderTimerFirstTime } from './dom';

const HEARTBIT = 6; // sec

renderTimer();
renderTimerFirstTime();

setInterval(function() {
  incrementTime(HEARTBIT / 60, renderTimer);
}, HEARTBIT * 1000);

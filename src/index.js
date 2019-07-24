import './assets/scss/styles.scss';
import moment from 'moment';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const DAY = 24 * 60 * MINUTE;

class App {
  constructor() {
    this.startTimer = this.startTimer.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetValues = this.resetValues.bind(this);
    this.getHistory = App.getHistory.bind(this);
    this.saveIntervalData = this.saveIntervalData.bind(this);
    this.displayTime = this.displayTime.bind(this);
    this.displayCyclesToday = this.displayCyclesToday.bind(this);
    this.displayHistory = this.displayHistory.bind(this);

    this.resetValues();
    this.getElements();
    this.toggleEvents();
    this.displayTime();
    this.displayCyclesToday();
    this.displayHistory();
    this.removeOldHistory();
  }

  resetValues() {
    this.workLength = 25;
    this.breakLength = 5;
    this.isTimerStopped = true;
    this.onWork = true;
    this.startAt = null;
    this.endAt = null;
  }

  static getHistory() {
    const items = localStorage.getItem('intervalData');
    let collection = [];
    if (items) collection = JSON.parse(items);
    return collection;
  }

  saveIntervalData(momentItem) {
    const collection = this.getHistory();
    collection.push(momentItem.valueOf());
    localStorage.setItem('intervalData', JSON.stringify(collection));
  }

  getElements() {
    this.timeDisplay = document.getElementById('time-display');
    this.countOfTodayDisplay = document.getElementById('count-today');
    this.percentOfTodayDisplay = document.getElementById('percent-today');
    this.displayHistory = document.getElementById('history');
    this.startButton = document.getElementById('start-button');
    this.stopButton = document.getElementById('stop-button');
  }

  toggleEvents() {
    this.startButton.addEventListener('click', this.startTimer);
    this.stopButton.addEventListener('click', this.stopTimer);
  }

  startTimer(e = null, time = moment()) {
    if (e) e.preventDefault();
    this.startButton.disabled = true;
    this.stopButton.disabled = false;
    this.isTimerStopped = false;
    this.startAt = time;
    const startAtClone = moment(this.startAt);
    this.endAt = startAtClone.add(this.workLength, 'minutes');
    this.timerUpdater = window.setInterval(this.updateTimer, 500);
    this.displayTime();
  }

  updateTimer(time = moment()) {
    const rest = this.endAt.diff(time);
    if (rest <= 0) {
      if (this.onWork) {
        this.saveIntervalData(time);
        this.displayCyclesToday();
        this.displayHistory();
      }
      this.onWork = !this.onWork;
      this.startAt = time;
      this.endAt = this.onWork ? moment(time).add(this.workLength, 'minutes') : moment(time).add(this.breakLength, 'minutes');
    }
    this.displayTime(time);
  }

  stopTimer(e = null) {
    if (e) e.preventDefault();
    this.resetValues();
    this.startButton.disabled = false;
    this.stopButton.disabled = true;
    window.clearInterval(this.timerUpdater);
    this.timerUpdater = null;
    this.displayTime();
  }

  displayTime(time = moment()) {
    let mins;
    let secs;
    if (this.isTimerStopped) {
      mins = this.workLength.toString();
      secs = 0;
    } else {
      const diff = this.endAt.diff(time);
      mins = Math.floor(diff / MINUTE);
      secs = Math.floor((diff % MINUTE) / 1000);
    }
    const minsString = mins.toString();
    let secsString = secs.toString();
    if (secs < 10) {
      secsString = `0${secsString}`;
    }
    this.timeDisplay.innerHTML = `${minsString}:${secsString}`;
  }

  displayCyclesToday(time = moment()) {
    const collection = this.getHistory();
    const startOfToday = time.startOf('day');
    const filterItems = collection.filter(item => (
      parseInt(item, 10) >= startOfToday.valueOf()
    ));
    const count = filterItems.length;
    const percent = count / 4 * 100;
    this.countOfTodayDisplay.innerHTML = `${count.toString()}回 / 4回`;
    this.percentOfTodayDisplay.innerHTML = `目標を${percent}%達成中です。`;
  }

  displayHistory(time = moment()) {
    const collection = this.getHistory();
    const startOfToday = time.startOf('day');
    const startOfTodayClone = moment(startOfToday);
    const sevenDaysAgo = startOfTodayClone.subtract(7, 'days');
    const valueOfSevenDaysAgo = sevenDaysAgo.valueOf();
    const tableEl = document.createElement('table');
    tableEl.classList.add('table', 'table-bordered');
    const trElDate = document.createElement('tr');
    const trElCount = document.createElement('tr');
    for (let i = 0; i <= 6; i += 1) {
      const filterItems = collection.filter((item) => {
        const timestampOfItem = parseInt(item, 10);
        return timestampOfItem >= valueOfSevenDaysAgo + i * DAY &&
          timestampOfItem < valueOfSevenDaysAgo + (i + 1) * DAY;
      });
      const count = filterItems.length;
      const thElDate = document.createElement('th');
      const tdElCount = document.createElement('td');
      const sevenDaysAgoClone = moment(sevenDaysAgo);
      thElDate.innerHTML = sevenDaysAgoClone.add(i, 'day').format('MM月DD日');
      tdElCount.innerHTML = `${count}回<br>達成率${count / 4 * 100}%`;
      trElDate.appendChild(thElDate);
      trElCount.appendChild(tdElCount);
    }
    tableEl.appendChild(trElDate);
    tableEl.appendChild(trElCount);
    this.displayHistory.appendChild(tableEl);
  }

  removeOldHistory() {
    const now = moment();
    const startOfToday = now.startOf('day');
    const sevenDaysAgo = startOfToday.subtract(7, 'days');
    const collection = this.getHistory();
    const newCollection = collection.filter((item) => {
      const timestampOfItem = parseInt(item, 10);
      return timestampOfItem >= sevenDaysAgo;
    });
    localStorage.setItem('intervalData', JSON.stringify(newCollection));
  }
}

window.addEventListener('load', () => new App());

export default App;

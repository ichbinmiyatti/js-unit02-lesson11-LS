import './assets/scss/styles.scss';

class App {
  constructor() {
    this.workLength = 25;
    this.breakLength = 5;
    this.isTimerStopped = true;
    this.onWork = true;
    this.timeDisplay = document.getElementById('time-display');
  }

  displayTime() {
    let mins;
    let secs;
    if (this.isTimerStopped) {
      mins = this.workLength;
      secs = 0;
    }
    const minsString = mins.toString();
    let secsString = secs.toString();
    if (secs < 10) {
      secsString = `0${secsString}`;
    }
    this.timeDisplay.innerHTML = `${minsString}:${secsString}`;
  }

}

window.addEventListener('load', () => new App());

export default App;

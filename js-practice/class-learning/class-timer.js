class Clock {
    tick() {
        console.log(new Date().toLocaleTimeString());
    }

    start() {
        this.intervalID = setInterval(this.tick, 2000);
    }

    stop() {
        clearInterval(this.intervalID);
    }
}

const myClock = new Clock();

myClock.start();

setTimeout(() => {
    myClock.stop();
}, 10000);

const { exec } = require('child_process');

// Run command
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(`exec error: ${err}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(`stdout: ${stdout}`);
    });
  });
}

// Turn on LED
module.exports.turnOn = function () {
  return runCommand('sudo /home/pi/rpi-rgb-led-matrix-master/examples-api-use/demo -D 9 --led-rows 64 --led-cols 64 --led-chained 3 --led-parallel 2 --led-slowdown-gpio 4 --led-brightness 100');
};

// Turn off LED
module.exports.turnOff = function () {
  return runCommand('sudo /home/pi/rpi-rgb-led-matrix-master/utils/led-clear');
};

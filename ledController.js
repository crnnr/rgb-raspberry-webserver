// ledController.js
const { exec } = require('child_process');

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

module.exports.turnOn = function () {
  return runCommand('sudo /home/pi/rpi-rgb-led-matrix-master/examples-api-use/demo -D 9 --led-rows 64 --led-cols 64 --led-chained 3 --led-parallel 2 --led-slowdown-gpio 4 --led-brightness 100');
  // Add the correct command to turn on or trigger a specific animation
};

module.exports.turnOff = function () {
  // For turning off, you might need a specific command to clear the display or a workaround if there's no direct way.
  // This example uses a command placeholder. Replace it with an actual command.
  return runCommand('sudo /home/pi/rpi-rgb-led-matrix-master/utils/led-clear');
};

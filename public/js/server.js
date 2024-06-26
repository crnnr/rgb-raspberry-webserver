const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

let processRunning = false; // Global variable to track running processes

const videosDirectory = path.resolve(__dirname, '../media/videos');

// Ensure videos directory exists
if (!fs.existsSync(videosDirectory)) {
    fs.mkdirSync(videosDirectory, { recursive: true });
    console.log(`Created directory: ${videosDirectory}`);
}

app.use(express.json());
app.use(express.static('../public'));
app.use('/thumbnails', express.static(path.join('../media', 'thumbnails')));

// Helper function to start a process
function startProcess(command, callback) {
    if (processRunning) {
        callback(new Error('Process is already running'));
    } else {
        processRunning = true;
        exec(command, (err, stdout, stderr) => {
            processRunning = false;
            callback(err, stdout, stderr);
        });
    }
}

// Turn on LED matrix
app.get('/led/on', (req, res) => {
    const dValue = req.query.d || '9';
    if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].includes(dValue)) {
        return res.status(400).send('Invalid "-D" value');
    }

    const command = `sudo /home/pi/rpi-rgb-led-matrix-master/examples-api-use/demo -D ${dValue} --led-rows 64 --led-cols 64 --led-chained 6 --led-slowdown-gpio 4 --led-brightness 100 --led-daemon`;
    startProcess(command, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send('Failed to turn on LED Matrix');
        }
        res.send(`LED Matrix turned ON with "-D" value ${dValue}`);
    });
});

// Turn off LED matrix
app.get('/led/off', (req, res) => {
    startProcess('sudo pkill -f demo', (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send('Failed to turn off LED Matrix');
        }
        res.send("LED Matrix turned OFF");
    });
});

// Display video
app.get('/display-video', (req, res) => {
    const videoName = req.query.name;
    if (!videoName) {
        return res.status(400).json({ message: 'No video name provided' });
    }

    const videoPath = path.join(videosDirectory, `${videoName}.webm`);
    const command = `sudo ./../utils/video-viewer --led-cols=64 --led-rows=64 --led-chain=6 --led-limit-refresh=200 --led-slowdown-gpio=4 --led-pixel-mapper="U-Mapper;Rotate:180" -F ${videoPath}`;

    startProcess(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ message: 'Error displaying the video' });
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.json({ message: 'Video is being displayed on the LED matrix.' });
    });
});

// Download video
app.post('/download-video', (req, res) => {
    const youtubeLink = req.body.youtubeLink;
    if (!youtubeLink) {
        return res.status(400).json({ message: 'No YouTube link provided' });
    }

    const videoIdMatch = youtubeLink.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com.*[\?&]v=([^&#]*)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) {
        return res.status(400).json({ message: 'Invalid YouTube link' });
    }

    const videoPath = path.join(videosDirectory, `${videoId}.webm`);
    const thumbnailPath = path.join(__dirname, '../media/thumbnails', `${videoId}_thumbnail.jpg`);

    const command = `/home/pi/.local/bin/yt-dlp -o "${videoPath}" ${youtubeLink}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ message: 'Error downloading the video' });
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        const ffmpegCmd = `ffmpeg -i ${videoPath} -ss 00:00:01 -vframes 1 ${thumbnailPath}`;
        exec(ffmpegCmd, (ffmpegError, ffmpegStdout, ffmpegStderr) => {
            if (ffmpegError) {
                console.error(`Error generating thumbnail: ${ffmpegError}`);
                return res.status(500).json({ message: 'Error generating thumbnail' });
            }
            console.log(`Thumbnail generated at ${thumbnailPath}`);
            res.json({ message: 'Video has been downloaded successfully, and thumbnail generated.' });
        });
    });
});

// List videos
app.get('/list-videos', (req, res) => {
    console.log(`Reading directory: ${videosDirectory}`);

    fs.readdir(videosDirectory, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            return res.status(500).send('Internal Server Error');
        }

        console.log(`Found files: ${files.join(', ')}`);

        const videos = files.filter(file => file.endsWith('.webm')).map(file => {
            const videoId = file.split('.webm')[0];
            return {
                title: file,
                thumbnail: `${videoId}_thumbnail.jpg`
            };
        });

        res.json(videos);
    });
});

app.use(express.json());
app.use(express.static('public'));

let gameState = [["", "", ""], ["", "", ""], ["", "", ""]];

// Handle move
app.post('/move', (req, res) => {
    const { row, col, player } = req.body;
    if (gameState[row][col] === "") {
        gameState[row][col] = player;
        updateLEDMatrix();
        res.json({ success: true, gameState });
    } else {
        res.status(400).json({ success: false, message: "Cell already occupied" });
    }
});

// Display winner
app.post('/display-winner', (req, res) => {
    const { winner } = req.body;
    const message = `${winner} wins!`;
    displayMessageOnMatrix(message);
    res.send("Winner displayed on LED matrix");
});

// Display message
function displayMessageOnMatrix(message) {
    console.log(message);
}

app.post('/reset-game', (req, res) => {
    gameState = [["", "", ""], ["", "", ""], ["", "", ""]];
    clearLEDMatrix();
    initLEDMatrix();
    res.send("Game and LED matrix reset successfully");
});

// Update LED matrix
function updateLEDMatrix() {
    const colors = { X: 'R', O: 'G' };
    gameState.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== "") {
                let command = `sudo ./matrix-tool --set-pixel ${j},${i},${colors[cell]}`;
                exec(command, (err) => {
                    if (err) console.error(`Error setting pixel: ${err}`);
                });
            }
        });
    });
}

// Clear LED matrix
function clearLEDMatrix() {
    let command = 'sudo /home/pi/rpi-rgb-led-matrix-master/utils/led-clear';
    exec(command, (err) => {
        if (err) console.error(`exec error: ${err}`);
    });
}

// Initialize LED matrix
function initLEDMatrix() {
    console.log("Initializing LED Matrix with a 3x3 grid");
}

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening at http://localhost:${port}`);
});

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;


app.use(express.json());
app.use(express.static('/home/pi/web/public'));
app.use('/thumbnails', express.static(path.join('/home/pi/web/public/media', 'thumbnails')));


// Turn on the LED matrix with a dynamic "-D" value
app.get('/led/on', (req, res) => {
    const dValue = req.query.d || '9';
    if (!['0', '5', '6', '7', '8', '9', '10', '11'].includes(dValue)) {
        return res.status(400).send('Invalid "-D" value');
    }

    const command = `sudo /home/pi/rpi-rgb-led-matrix-master/examples-api-use/demo -D ${dValue} --led-rows 64 --led-cols 64 --led-chained 6 --led-slowdown-gpio 4 --led-brightness 100 --led-daemon`;
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send('Failed to turn on LED Matrix');
        }
        res.send(`LED Matrix turned ON with "-D" value ${dValue}`);
    });
});

// Turn off the LED matrix
app.get('/led/off', (req, res) => {
    exec('sudo pkill -f demo', (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send('Failed to turn off LED Matrix');
        }
        res.send("LED Matrix turned OFF");
    });
});

// Shutdown the Raspberry Pi
app.post('/api/shutdown', (req, res) => {
    exec('sudo shutdown now', (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send('Failed to shut down');
        }
        res.send('Shutting down...');
    });
});

app.get('/display-video', (req, res) => {
    const videoName = req.query.name;
    if (!videoName) {
        return res.status(400).json({ message: 'No video name provided' });
    }

    const videoPath = `/home/pi/web/public/media/videos/${videoName}.webm`;
    const command = `sudo ./../utils/video-viewer --led-cols=64 --led-rows=64 --led-chain=6 --led-limit-refresh=200 --led-slowdown-gpio=4 --led-pixel-mapper="U-Mapper;Rotate:180" -F ${videoPath}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ message: 'Error displaying the video' });
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.json({ message: 'Video is being displayed on the LED matrix.' });
    });
});

app.post('/download-video', (req, res) => {
    const youtubeLink = req.body.youtubeLink;
    if (!youtubeLink) {
        return res.status(400).json({ message: 'No YouTube link provided' });
    }

    // Extract video ID from the YouTube link
    const videoIdMatch = youtubeLink.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com.*[\?&]v=([^&#]*)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) {
        return res.status(400).json({ message: 'Invalid YouTube link' });
    }

    // Paths for the video and its thumbnail
    const videoPath = `/home/pi/web/public/media/video/${videoId}.webm`;
    const thumbnailPath = `/home/pi/web/public/media/thumbnails/${videoId}_thumbnail.jpg`;

    // Proceed with the download
    const command = `/home/pi/.local/bin/yt-dlp -o "${videoPath}" ${youtubeLink}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({ message: 'Error downloading the video' });
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

        // Generate thumbnail
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

app.get('/list-videos', (req, res) => {
    const videosDirectory = '../media/videos'; // Adjust this path
    console.log(`Reading directory: ${videosDirectory}`); // Log the directory being read

    fs.readdir(videosDirectory, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            return res.status(500).send('Internal Server Error');
        }

        console.log(`Found files: ${files.join(', ')}`); // Log found files

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

app.post('/display-winner', (req, res) => {
    const { winner } = req.body;
    const message = `${winner} wins!`;
    displayMessageOnMatrix(message); // Your implementation to display on matrix
    res.send("Winner displayed on LED matrix");
});

function displayMessageOnMatrix(message) {
    console.log(message);  // Log or send command to LED matrix
    // Example: exec(`some-command-to-display-text --message '${message}'`);
}

app.post('/reset-game', (req, res) => {
    gameState = [["", "", ""], ["", "", ""], ["", "", ""]];
    clearLEDMatrix();  // Clear the LED matrix display
    initLEDMatrix();  // Initialize a 3x3 grid on the LED matrix
    res.send("Game and LED matrix reset successfully");
});

function updateLEDMatrix() {
    // Update the LED matrix based on gameState
    const colors = { X: 'R', O: 'G' }; // X is Red, O is Green
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

function clearLEDMatrix() {
    let command = 'sudo /home/pi/rpi-rgb-led-matrix-master/utils/led-clear';
    exec(command, (err) => {
        if (err) console.error(`exec error: ${err}`);
    });
}

function initLEDMatrix() {
    console.log("Initializing LED Matrix with a 3x3 grid");
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


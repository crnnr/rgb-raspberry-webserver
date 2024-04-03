const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;


// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from 'public' directory
app.use(express.static('public'));
app.use('/thumbnails', express.static(path.join(__dirname, 'media', 'thumbnails')));


// Turn on the LED matrix with a dynamic "-D" value
app.get('/led/on', (req, res) => {
    const dValue = req.query.d || '9';
    if (!['0', '5', '6', '7', '8', '9', '10', '11'].includes(dValue)) {
        return res.status(400).send('Invalid "-D" value');
    }

    const command = `sudo /home/pi/rpi-rgb-led-matrix-master/examples-api-use/demo -D ${dValue} --led-rows 64 --led-cols 64 --led-chained 3 --led-parallel 2 --led-slowdown-gpio 4 --led-brightness 100`;
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
    // Ensure you replace this command with the actual one to clear the LED matrix
    exec('sudo your_command_to_clear_matrix', (err, stdout, stderr) => {
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

    // Define paths for the video and its thumbnail
    const videoPath = `/home/pi/web/media/${videoId}.webm`;
    const thumbnailPath = `/home/pi/web/media/thumbnails/${videoId}_thumbnail.jpg`;

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

// List videos with thumbnails
app.get('/list-videos', (req, res) => {
    const mediaDirectory = path.join(__dirname, 'media'); // Adjust the path as needed
    const thumbnailsDirectory = path.join(mediaDirectory, 'thumbnails');

    fs.readdir(mediaDirectory, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            return res.status(500).send('Internal Server Error');
        }

        // Filter for video files and map to desired structure
        const videos = files.filter(file => file.endsWith('.webm')).map(file => {
            const videoId = file.split('.webm')[0];
            return {
                title: file,
                path: `/media/${file}`,
                thumbnail: `/media/thumbnails/${videoId}_thumbnail.jpg`
            };
        });

        res.json(videos);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

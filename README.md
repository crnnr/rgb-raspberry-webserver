# LED Matrix Control and YouTube Downloader

This project provides a web interface for controlling an LED matrix display and downloading and displaying YouTube videos. It includes features such as turning on/off the LED matrix, displaying videos on the matrix, downloading videos from YouTube, and playing Tic-Tac-Toe on the LED matrix. The project also handles session management to ensure that only one video can be played at a time.

## Table of Contents
1. [Installation](#installation)
2. [Directory Structure](#directory-structure)
3. [Usage](#usage)
4. [Endpoints](#endpoints)
5. [Session Handling](#session-handling)
6. [Game Features](#game-features)
7. [Video Management](#video-management)
8. [LED Control](#led-control)
9. [Error Handling](#error-handling)

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/your-repository.git
    cd your-repository
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Set up the LED matrix software (assuming you're using a Raspberry Pi with an RGB LED matrix):**
    Follow the installation instructions for [rpi-rgb-led-matrix](https://github.com/hzeller/rpi-rgb-led-matrix).

4. **Install `yt-dlp` for downloading YouTube videos:**
    ```sh
    pip install yt-dlp
    ```

5. **Run the server:**
    ```sh
    node ./js/server.js
    ```

- **`css/style.css`**: Contains all the styles for the web pages.
- **`js/`**: Contains all the JavaScript files for the project.
  - **`game.js`**: JavaScript for Tic-Tac-Toe game logic.
  - **`ledController.js`**: Functions to control the LED matrix.
  - **`script.js`**: General scripts for handling video downloads and LED control.
  - **`server.js`**: Express server setup and routing.
- **`media/`**: Contains media assets including icons, logos, video thumbnails, and videos.
- **`public/`**: Contains the HTML files for the web interface.

## Usage

### Accessing the Web Interface

1. **Open your web browser and navigate to:**
    ```
    http://localhost:3000
    ```

2. **Main Menu:**
    - The main menu provides buttons to navigate to different functionalities:
      - **LED Program Control**
      - **YouTube Downloader**
      - **Tic-Tac-Toe**

### LED Control

1. **Navigate to the LED Control page:**
    ```
    http://localhost:3000/led-control.html
    ```

2. **Turn On LED Matrix:**
    - Select a "-D" value from the dropdown.
    - Click "Turn On with '-D'".

3. **Turn Off LED Matrix:**
    - Click "Turn Off".

### YouTube Downloader

1. **Navigate to the YouTube Downloader page:**
    ```
    http://localhost:3000/youtube-download.html
    ```

2. **Download a YouTube Video:**
    - Enter a valid YouTube URL in the input field.
    - Click "Download".
    - The video will be downloaded and a thumbnail will be generated.

3. **Play a Video on LED Matrix:**
    - Click on any video thumbnail to start playing the video on the LED matrix.
    - If a video is already playing, you will receive an alert.

### Tic-Tac-Toe

1. **Navigate to the Tic-Tac-Toe page:**
    ```
    http://localhost:3000/tictactoe.html
    ```

2. **Start a New Game:**
    - Click "New Game" to reset the game board.

3. **Make a Move:**
    - Click on any cell to make a move.
    - The game will detect wins and ties, displaying animations for both.

## Endpoints

### LED Control

- **Turn On LED Matrix:**
    ```
    GET /led/on
    Parameters: d (optional) -D value for LED matrix
    ```

- **Turn Off LED Matrix:**
    ```
    GET /led/off
    ```

### Video Management

- **Display Video:**
    ```
    GET /display-video
    Parameters: name - Video name
    ```

- **Download Video:**
    ```
    POST /download-video
    Body: { youtubeLink: <YouTube URL> }
    ```

- **List Videos:**
    ```
    GET /list-videos
    ```

### Tic-Tac-Toe

- **Make a Move:**
    ```
    POST /move
    Body: { row: <row>, col: <col>, player: <'X' or 'O'> }
    ```

- **Display Winner:**
    ```
    POST /display-winner
    Body: { winner: <'X' or 'O'> }
    ```

- **Reset Game:**
    ```
    POST /reset-game
    ```

### System

- **Shutdown Raspberry Pi:**
    ```
    POST /api/shutdown
    ```

## Session Handling

- **Session Management:**
    - The server uses `express-session` to manage sessions.
    - A session variable `videoRunning` is used to track if a video is currently playing.
    - If a new video play request is made while another video is running, an alert is shown to the user.

## Game Features

- **Tic-Tac-Toe:**
    - The game includes win and tie detection.
    - Winning cells have a pulsing animation.
    - Tie results in a different animation for all cells.

## Video Management

- **YouTube Downloader:**
    - Videos are downloaded using `yt-dlp`.
    - Thumbnails are generated using `ffmpeg`.

## LED Control

- **Turn On/Off:**
    - The LED matrix can be turned on or off via the web interface.
    - The LED matrix displays a 3x3 grid for the Tic-Tac-Toe game.

## Error Handling

- **Alerts and Messages:**
    - The web interface shows alerts for various actions such as video download completion, session handling errors, and invalid input.
    - Server responses include status messages for easier debugging and user feedback.

---

This README provides a comprehensive guide to setting up, using, and understanding the project. If you encounter any issues or have further questions, please refer to the documentation or reach out for support.

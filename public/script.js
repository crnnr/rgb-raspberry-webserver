function applyEffect() {
    const effect = document.getElementById('effect-dropdown').value;
    fetch(`/led/effect/${effect}`, { method: 'GET' })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchVideos();
});

function setupVideoClickListeners() {
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach(videoItem => {
        videoItem.addEventListener('click', function() {
            const videoName = this.dataset.videoName;
            displayOnLEDMatrix(videoName);
        });
    });
}

function displayOnLEDMatrix(videoName) {
    fetch(`/display-video?name=${encodeURIComponent(videoName)}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchVideos();
});

function fetchVideos() {
    fetch('/list-videos')
        .then(response => response.json())
        .then(videos => {
            const videosListContainer = document.getElementById('videos-list');
            videosListContainer.innerHTML = ''; // Clear the container before adding new content
            videos.forEach(video => {
                const correctThumbnailPath = video.thumbnail.replace('/media/thumbnails/', '/thumbnails/');
                const videoElement = document.createElement('div');
                videoElement.className = 'video-item';
                const videoName = video.title.replace('.webm', '');
                videoElement.dataset.videoName = videoName;
                videoElement.innerHTML = `
                    <div class="video-thumbnail">
                        <img src="${correctThumbnailPath}" alt="Thumbnail" style="width: 100%; height: auto;">
                    </div>
                    <div class="video-title">${video.title}</div>
                `;
                videosListContainer.appendChild(videoElement);
            });
            setupVideoClickListeners();
        })
    .catch(error => console.error('Error fetching videos:', error));
}


function controlLed(action) {
    let url = `/led/${action}`;
    if (action === 'on') {
        const dValue = document.getElementById('dValue').value;
        url += `?d=${dValue}`;
    }

    fetch(url)
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

function downloadVideo() {
    const link = document.getElementById('youtubeLink').value;
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('downloadProgress');

    if (link) {
        document.getElementById('youtubeLink').value = ''; // Clear input
        progressContainer.style.display = 'block'; // progress bar container
        progressBar.value = 0; // Reset progress bar

        let progressInterval = setInterval(() => {
            if (progressBar.value < 90) {
                progressBar.value += 10; // Simulate progress lol
            }
        }, 1000); // Update every second

        fetch('/download-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ youtubeLink: link }),
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            progressBar.value = 100;
            alert(data.message);
        })
        .catch(error => {
            console.error('Error downloading the file:', error);
            clearInterval(progressInterval); // Ensure interval is cleared on error
        });
    } else {
        alert("Please enter a YouTube link.");
    }
}

const { ipcRenderer } = require('electron');


const notConnected = document.getElementById('not-connected');
const player       = document.getElementById('player');
const albumArt     = document.getElementById('album-art');
const songName     = document.getElementById('song-name');
const artistName   = document.getElementById('artist-name');
const progressFill = document.getElementById('progress-fill');
const playPauseBtn = document.getElementById('play-pause-btn');
const timeCurrent  = document.getElementById('time-current');
const timeTotal    = document.getElementById('time-total');

let localProgress = 0;
let localDuration = 0;
let isPlaying = false;
let ticker = null;
let currentTrackUrl = 'https://open.spotify.com';

const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function startTicker() {
  if (ticker) clearInterval(ticker);
  ticker = setInterval(() => {
    if (!isPlaying) return;
    localProgress += 1000;
    if (localProgress > localDuration) localProgress = localDuration;

    const pct = (localProgress / localDuration) * 100;
    progressFill.style.width = `${pct}%`;
    timeCurrent.textContent = fmt(localProgress);
  }, 1000);
}

ipcRenderer.on('track-update', (_, track) => {
  if (!track) return;

  notConnected.classList.add('hidden');
  player.classList.remove('hidden');

  songName.textContent   = track.name;
  artistName.textContent = track.artist;
  albumArt.src           = track.albumArt;
 

 playPauseBtn.textContent = track.isPlaying ? 'pause' : 'play';



  // Sync from Spotify every 3s but don't jump the bar
  isPlaying = track.isPlaying;
  localProgress = track.progress;
  localDuration = track.duration;

  timeTotal.textContent = fmt(localDuration);
  timeCurrent.textContent = fmt(localProgress);

  const pct = (localProgress / localDuration) * 100;
  progressFill.style.width = `${pct}%`;
  currentTrackUrl = track.trackUrl || 'https://open.spotify.com';

  startTicker();
});
document.getElementById('connect-btn').addEventListener('click', () => {
  ipcRenderer.send('open-auth');
});

document.getElementById('play-pause-btn').addEventListener('click', () => {
  ipcRenderer.send('play-pause');
  isPlaying = !isPlaying;
  playPauseBtn.textContent = isPlaying ? 'pause' : 'play';
});

document.getElementById('next-btn').addEventListener('click', () => {
  ipcRenderer.send('next');
});

document.getElementById('prev-btn').addEventListener('click', () => {
  ipcRenderer.send('prev');
});

document.getElementById('album-wrap').addEventListener('click', () => {
  ipcRenderer.send('open-spotify', currentTrackUrl);
});
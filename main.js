const { menubar } = require('menubar');
const { app, ipcMain, shell } = require('electron');
const path = require('path');
const spotify = require('./spotify');
const { startAuthServer, getAccessToken } = require('./auth');

function getIcon() {
  if (process.platform === 'win32') return path.join(__dirname, 'assets/icons8-sound-cloud-24.ico');
  return path.join(__dirname, 'assets/icons8-sound-cloud-24.png');
}

const mb = menubar({
  icon: getIcon(),
  index: `file://${path.join(__dirname, 'index.html')}`,
  browserWindow: {
    width: 380,
    height: 160,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  },
  preloadWindow: true
});

mb.on('ready', async () => {
  console.log('App ready');

 if (process.platform === 'darwin') {
  app.dock.setIcon(getIcon());
}
if (process.platform === 'win32') {
  app.setAppUserModelId(app.name);
}
  await startAuthServer();

  setInterval(async () => {
    const token = getAccessToken();
    if (!token) return;
    const track = await spotify.getCurrentTrack(token);
    if (mb.window) {
      mb.window.webContents.send('track-update', track);
    }
  }, 5000);
});

// Windows: prevent app from quitting when window is closed
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

ipcMain.on('play-pause', async () => {
  const token = getAccessToken();
  if (token) await spotify.playPause(token);
});

ipcMain.on('next', async () => {
  const token = getAccessToken();
  if (token) await spotify.next(token);
});

ipcMain.on('prev', async () => {
  const token = getAccessToken();
  if (token) await spotify.prev(token);
});

ipcMain.on('open-auth', () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=cd6af62cac224355ac2e7a38fbf3a9ee&response_type=code&redirect_uri=http://127.0.0.1:8080/callback&scope=user-read-currently-playing+user-read-playback-state+user-modify-playback-state`;
  shell.openExternal(authUrl);
});

// Open Spotify web player when album art is clicked
ipcMain.on('open-spotify', (_, trackUrl) => {
  const url = trackUrl || 'https://open.spotify.com';
  shell.openExternal(url);
});
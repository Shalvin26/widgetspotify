const axios = require('axios');

const BASE = 'https://api.spotify.com/v1/me/player';
const headers = (token) => ({ Authorization: `Bearer ${token}` });

async function getCurrentTrack(token) {
  try {
    const res = await axios.get(`${BASE}/currently-playing`, { headers: headers(token) });
    if (!res.data || !res.data.item) return null;

    return {
      name: res.data.item.name,
      artist: res.data.item.artists.map(a => a.name).join(', '),
      albumArt: res.data.item.album.images[0]?.url || '',
      isPlaying: res.data.is_playing,
      duration: res.data.item.duration_ms,
      progress: res.data.progress_ms,
      trackUrl: res.data.item.external_urls.spotify 
    };
  } catch (err) {
    return null;
  }
}

async function playPause(token) {
  try {
    // Check current state first
    const res = await axios.get(`${BASE}`, { headers: headers(token) });
    if (res.data?.is_playing) {
      await axios.put(`${BASE}/pause`, {}, { headers: headers(token) });
    } else {
      await axios.put(`${BASE}/play`, {}, { headers: headers(token) });
    }
  } catch (err) {
    console.error('playPause error', err.message);
  }
}

async function next(token) {
  try {
    await axios.post(`${BASE}/next`, {}, { headers: headers(token) });
  } catch (err) {
    console.error('next error', err.message);
  }
}

async function prev(token) {
  try {
    await axios.post(`${BASE}/previous`, {}, { headers: headers(token) });
  } catch (err) {
    console.error('prev error', err.message);
  }
}

module.exports = { getCurrentTrack, playPause, next, prev };
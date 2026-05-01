const express = require('express');
const axios = require('axios');

const CLIENT_ID = 'cd6af62cac224355ac2e7a38fbf3a9ee';
const CLIENT_SECRET = '26d5fdb8c7a04a378d249d342eb4cea6';
const REDIRECT_URI = 'http://127.0.0.1:8080/callback';

let accessToken = null;
let refreshToken = null;

function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken() {
  try {
    const res = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    accessToken = res.data.access_token;
    console.log('Token refreshed');
  } catch (err) {
    console.error('Failed to refresh token', err.message);
  }
}

function startAuthServer() {
  return new Promise((resolve) => {
    const app = express();

    app.get('/callback', async (req, res) => {
      const code = req.query.code;
      try {
        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        setInterval(refreshAccessToken, 50 * 60 * 1000);

        res.send('<h2>✅ Spotify connected! You can close this tab.</h2>');
        console.log('Spotify authenticated!');
      } catch (err) {
        res.send('<h2>❌ Auth failed. Check your credentials.</h2>');
        console.error('Auth error', err.message);
      }
    });

    app.listen(8080, () => {
      console.log('Auth server running on http://127.0.0.1:8080');
      resolve();
    });
  });
}

module.exports = { startAuthServer, getAccessToken };
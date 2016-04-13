import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import storage from './storage';
import initDb from './models/index';
import HTTP from 'http';
import socketIO from 'socket.io';
import Trakt from 'trakt-utils';
import { exec } from 'child_process';
import chokidar from 'chokidar';
import mkdirp from 'mkdirp';
import got from 'got';
import path from 'path';

import {
  UPDATE_PLAYBACK,
  STOP_PLAYBACK,
  USER_PAUSE_MEDIA,
  USER_CLOSE,
  USER_SCREENSHOT,
  USER_SCREEN_OFF,
  USER_OPEN_BROWSER,
  USER_KEY_PRESS,
  USER_ANALYTICS,
  OMX_KEYS,
  RELOAD_FILES
} from './constants';

const getPath = (variable, defaultFolder) => {
  const result = process.env[variable] || path.resolve(__dirname, '..', '..', defaultFolder);
  mkdirp.sync(result);

  return result;
};

const MEDIA_PATH = getPath('MEDIA_PATH', 'Downloads');
const DB_PATH = getPath('DB_PATH', 'media-center-db');
const SCREENSHOTS_PATH = getPath('SCREENSHOTS_PATH', 'media-center-screenshots');

const PORT = process.env.PORT || 3000;
const TRAKT_TOKEN = process.env.TRAKT_TOKEN;

const traktId = '412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f';
const traktSecret = '714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb';
const trakt = new Trakt(traktId, traktSecret, TRAKT_TOKEN);

const db = initDb(DB_PATH + '/' + 'db');
const app = express();

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(morgan('request: :remote-addr :method :url :status'));
app.use(express.static('public'));
app.use('/screenshots', express.static(SCREENSHOTS_PATH));
app.use(cors());

let play;

if (process.env.NODE_ENV === 'production') {
  play = require('./players/omx').default;
} else {
  play = require('./players/mock-player').default;
}

const analyticsUrl = process.env.ANALYTICS_URL;

storage.on(USER_SCREENSHOT, () => {
  // https://github.com/info-beamer/tools/tree/master/screenshot
  exec(`DISPLAY=:0 /home/pi/tools/screenshot/screenshot > ${SCREENSHOTS_PATH}/${new Date().toISOString()}.jpg`);
});
storage.on(USER_ANALYTICS, () => {
  if (!analyticsUrl) {
    return;
  }

  const params = {
    json: true,
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(lastPlaybackStatus)
  };

  got(analyticsUrl, params)
    .then(res => console.log(res.body))
    .catch(err => console.log(err));
});
storage.on(USER_SCREEN_OFF, () => {
  exec(`DISPLAY=:0 xset dpms force suspend`);
});
storage.on(USER_OPEN_BROWSER, () => {
  exec(`DISPLAY=:0 xdg-open "http://localhost:${PORT}/" &`);
});

import VideoRouter from './routes/index';
import ScreenshotsRouter from './routes/screenshots';

app.use('/', VideoRouter(MEDIA_PATH, db, trakt, play));
app.use('/', ScreenshotsRouter(SCREENSHOTS_PATH));

app.use((err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  console.log(err, err.stack);
  res.status(500);
  res.json({ error: err.stack.split('\n') });
});

const http = HTTP.Server(app);
const io = socketIO(http);

let lastPlaybackStatus;

io.on('connection', (socket) => {
  socket.emit(UPDATE_PLAYBACK, lastPlaybackStatus);

  socket.on(USER_PAUSE_MEDIA, () => storage.emit(USER_KEY_PRESS, OMX_KEYS.pause));
  socket.on(USER_CLOSE, () => storage.emit(USER_KEY_PRESS, OMX_KEYS.stop));
});

storage.on(UPDATE_PLAYBACK, data => {
  lastPlaybackStatus = data;
  io.emit(UPDATE_PLAYBACK, data);
});

storage.on(STOP_PLAYBACK, data => {
  lastPlaybackStatus = data;
  io.emit(RELOAD_FILES);
});

chokidar
  .watch(MEDIA_PATH, {
    ignored: /\.part$/,
    persistent: true,
    ignoreInitial: true
  })
  .on('all', () => {
    io.emit(RELOAD_FILES);
  });

http.listen(PORT, () => {
  console.log(`listen localhost:${PORT}`);
});

import superagent from 'superagent';
import notify from './notify';

export let baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

export const setBaseUrl = url => { // for react-native
  baseUrl = url;
};

const fetch = (url, options = {}) => {
  let req = (
    options.method === 'post' ?
      superagent.post(url).send(options.body) :
      superagent.get(url)
  );

  if (options.query) {
    req = req.query(options.query);
  }

  if (options.headers) {
    req = req.set(options.headers);
  }

  return new Promise((resolve, reject) => {
    req.end((err, { status, body }) => {
      if (err) {
        reject(new Error(`${options.method || 'GET'} ${url} returned ${status}<br />${body.error.join('<br />')}`)); // possible xss :-(
      } else {
        resolve(body);
      }
    });
  });
  // return req
  //   .then(({ body }) => {
  //     return body;
  //   })
  //   .catch((err, a) => {
  //     throw err; // @TODO figure out where is body in catch function
  //                         https://github.com/visionmedia/superagent/pull/925
  //   })
};

export const get = (url, query = {}) => {
  return fetch(baseUrl + url, { query })
    .catch(err => notify.error(err.message));
};

export const post = (url, body) => {
  return fetch(baseUrl + url, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .catch(err => notify.error(err.message));
};

export const playFile = (filename, media, position, noScrobble) => {
  return post('/api/v1/playback/start', {
    filename,
    media,
    position,
    noScrobble
  });
};

export const saveInfo = (filename, media) => {
  return post('/api/v1/playback/info', {
    filename,
    media
  });
};

export const addToHistory = (filename, media) => {
  return post('/api/v1/files/scrobble', {
    filename,
    media
  });
};

export const setHidden = (file, filename) => {
  return post('/api/v1/files/hidden', {
    filename,
    file
  });
};

export const updatePosition = (filename, media, position, duration) => {
  return post('/api/v1/files/position', {
    filename,
    media,
    position,
    duration
  });
};

export const findFiles = () => {
  return get('/api/v1/files');
};

export const getScreenshots = () => {
  return get('/api/v1/screenshots');
};

export const getMediaSuggestion = (type, title) => {
  return get('/api/v1/suggestions?title=' + encodeURIComponent(title) + '&type=' + type);
};

export const getReport = () => {
  return get('/api/v1/report');
};

export const playYoutubeLink = query => {
  return post('/api/v1/youtube', { query });
};

export const getPosterUrl = (type, imdb, s) => {
  if (type && imdb) {
    return `${baseUrl}/api/v1/posters/${type}/${imdb}/${s}`;
  } else {
    return getPosterPlaceholderUrl();
  }
};

export const getPosterPlaceholderUrl = () => {
  return `${baseUrl}/api/v1/posters/placeholder.jpg`;
};

export const getMarks = since => {
  return get(`/api/v1/marks`, { since });
};

export const getMark = id => {
  return get(`/api/v1/marks/${id}`);
};

export const postMark = mark => {
  return post('/api/v1/marks', { mark });
};

import { USER_ANALYTICS } from '../constants';
import OpenSubtitles from 'opensubtitles-universal-api';
import got from 'got';

function MarksService({ Mark, Subtitles }, storage) {
  this.Mark = Mark;
  this.Subtitles = Subtitles;

  this.storage = storage;
  this.api = new OpenSubtitles('OSTestUserAgent');

  this.findByIndex = this.Mark.findByIndex.bind(this.Mark);

  this.storage.on(USER_ANALYTICS, () => {
    if (this.storage.lastPlaybackStatus) {
      this.add(this.storage.lastPlaybackStatus);
    } else {
      console.log('no playback');
    }
  });
}

MarksService.prototype.add = function(data) {
  const id = data.media || { imdb: 0 };

  const media = data.media;
  delete data.media;

  return this.Mark
    .findOne(id)
    .then(
      mark => {
        mark.marks.push(data);

        return this.Mark.put(id, mark);
      },
      err => this.Mark.onNotFound(err, () => {
        const mark = {
          ...media,
          marks: [data]
        };

        return this.Mark.put(id, mark);
      })
    );
};

MarksService.prototype.findAll = function(limit, since) {
  return this
    .findByIndex(this.Mark.indexes.UPDATED_AT.name, {
      descending: true,
      skip: since ? 1 : 0,
      startkey: since || undefined,
      limit
    });
};

MarksService.prototype.findOne = function(id) {
  let mark;

  return this.Mark
    .findById(id)
    .then(_mark => {
      mark = _mark;
      return this.getSubtitles(mark.imdb, mark.s, mark.ep);
    })
    .then(subtitles => {
      mark.subtitles = subtitles.text;
      return mark;
    });
};

MarksService.prototype.getSubtitles = function(imdb, s, ep) {
  return this.Subtitles.findOneOrInit({ imdb, s, ep }, this.fetchSubtitlesFromApi.bind(this, imdb, s, ep));
};

MarksService.prototype._fetchSubtitlesFromApi = function(imdb, s, ep) {
  const query = {
    imdbid: imdb,
    season: s,
    episode: ep
  };

  return this.api.search(query)
    .then(result => {
      const url = result.en[0].url;
      return got(url);
    })
    .then(({ body }) => {
      return body;
    });
};

MarksService.prototype.fetchSubtitlesFromApi = function(imdb, s, ep) {
  return this._fetchSubtitlesFromApi(imdb, s, ep)
    .then(body => {
      const subtitles = {
        imdb,
        s,
        ep,
        text: body,
        lang: 'en'
      };

      return this.Subtitles.put(subtitles);
    });
};

export default function(models, storage) {
  return new MarksService(models, storage);
}

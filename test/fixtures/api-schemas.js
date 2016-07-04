import t from 'tcomb';
import { validate } from 'tcomb-validation';

import { schema as fileSchema } from '../../src/models/file';
import { schema as markSchema } from '../../src/models/mark';
import { wordSchema, wordExampleSchema } from '../../src/models/word';

export const fileScrobbleRequestSchema = t.struct({
  filename: t.String,
  media: fileSchema
});

export const filePositionRequestSchema = t.struct({
  filename: t.String,
  media: fileSchema,
  position: t.Number,
  duration: t.Number
});

export const fileHiddenRequestSchema = t.struct({
  filename: t.String,
  file: t.String
});

export const playbackStartRequestSchema = fileScrobbleRequestSchema.extend({
  position: t.maybe(t.Number),
  noScrobble: t.maybe(t.Boolean)
});

export const playbackInfoResponseSchema = t.struct({
  progress: t.Number,
  position: t.Number,
  duration: t.Number,
  status: t.String,
  file: t.String,
  media: t.maybe(fileSchema)
});

export const fileResponseSchema = t.struct({
  file: fileSchema
});

export const statusStringResponse = t.struct({
  status: t.String
});

export const markRequestSchema = t.struct({
  mark: t.struct({
    media: fileSchema,
    position: t.Number,
    duration: t.Number,
    progress: t.Number,
    file: t.String
  })
});

export const markResponseSchema = markSchema;

export const subtitlesNlpTermSchema = t.struct({
  whitespace: t.struct({ preceding: t.maybe(t.String), trailing: t.maybe(t.String) }),
  text: t.String,
  normal: t.String,
  expansion: t.maybe(t.String),
  reasoning: t.list(t.String),
  pos: t.dict(t.String, t.Boolean),
  firstName: t.maybe(t.String),
  middleName: t.maybe(t.String),
  lastName: t.maybe(t.String),
  honourific: t.maybe(t.String),
  tag: t.String
});

export const subtitlesNlpSchema = t.list(t.list(t.list(subtitlesNlpTermSchema)));
export const markSubtitlesResponseSchema = markSchema.extend({
  subtitles: t.list(
    t.struct({
      id: t.maybe(t.String),
      startTime: t.maybe(t.String),
      startTimeMs: t.Number,
      endTime: t.maybe(t.String),
      endTimeMs: t.maybe(t.Number),
      text: t.maybe(subtitlesNlpSchema)
    })
  )
});

// export const markResponseSchema = t.struct({ mark: markSchema });

export const marksArrayResponseSchema = t.list(markSchema.extend({ posterUrl: t.String }));
export const traktSuggestionsResponseSchema = t.list(t.struct({ label: t.String, value: t.String }));

export const traktIds = t.struct({
  trakt: t.maybe(t.Number),
  slug: t.maybe(t.String),
  tvdb: t.maybe(t.Number),
  imdb: t.maybe(t.String),
  tmdb: t.maybe(t.Number),
  tvrage: t.maybe(t.Number)
});

export const traktReportEpisode = t.struct({
  season: t.Number,
  number: t.Number,
  title: t.maybe(t.String),
  ids: traktIds
});

export const traktReportShow = t.struct({
  title: t.String,
  year: t.Number,
  ids: traktIds
});

export const traktReport = t.struct({
  first_aired: t.String,
  episode: traktReportEpisode,
  show: traktReportShow,
  date: t.String
});

export const traktReportGaps = t.struct({
  gap: t.Number,
  episodes: t.list(traktReport)
});

export const traktReportResponseSchema = t.list(t.list(
  t.struct({
    show: t.String,
    showIds: traktIds,
    posterUrl: t.String,
    report: t.struct({
      aired: t.maybe(t.list(traktReport)),
      unaired: t.maybe(t.list(traktReportGaps)),
      future: t.maybe(t.list(traktReportGaps))
    })
  })
));

export const screenshotsResponseSchema = t.struct({ files: t.list(t.String) });

export const youtubeRequestSchema = t.struct({ query: t.String });

export const filesArrayResponseSchema = t.list(t.struct({
  key: t.String,
  media: t.list(
    t.struct({
      file: t.String,
      dir: t.String,
      fileName: t.String,
      dirName: t.String,
      recognition: t.struct({
        title: t.String,
        s: t.maybe(t.Number),
        ep: t.maybe(t.Number),
        year: t.maybe(t.Number),
        type: t.String
      }),
      db: t.maybe(fileSchema),
      watched: t.maybe(t.Boolean),
      hidden: t.maybe(t.Boolean)
    })
  ),
  dir: t.String,
  watched: t.Boolean,
  hidden: t.Boolean,
  imdb: t.maybe(t.String),
  s: t.maybe(t.Number),
  type: t.maybe(t.String),
  title: t.maybe(t.String),
  unwatchedCount: t.maybe(t.Number),
  summary: t.String,
  posterUrl: t.String
}));

export const postWordRequestSchema = t.struct({
  word: t.struct({
    type: t.String,
    word: t.String
  }),
  example: wordExampleSchema
});

export const wordResponseSchema = t.struct({ word: wordSchema });
export const wordsArrayResponseSchema = t.struct({ words: t.list(wordSchema.extend({ _key: t.String })) });
import test from 'ava';
import nockHook from 'nock-hook/ava';

import * as api from '../';

test.beforeEach(async t => {
  t.context.closeNock = nockHook(t, __filename, { dirname: __dirname + '/fixtures/index' });
});

test.afterEach.always(t => {
  t.context.closeNock();
});

test('search a movie', async t => {
  let movies;
  let movie;

  movies = await api.search('captain america');
  t.truthy(movies.length === 3);

  movie = movies[0];

  t.truthy(movie.title === 'Captain America 3 Civil War (2016)');
  t.truthy(movie.releaseDate);

  movies = await api.search('suicide squad');
  t.truthy(movies.length === 1);

  movie = movies[0];
  t.truthy(movie.title === 'Suicide Squad (2016)');
  t.truthy(movie.releaseDate);
});

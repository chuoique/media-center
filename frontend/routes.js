import React from 'react';
import { Router, Route, IndexRedirect, IndexRoute, Redirect } from 'react-router';

import Movie from './components/movie/movie';
import MoviesList from './components/movies-list/movies-list';
import MoviesListContainer from './components/movies-list-container/movies-list-container';

import TraktReport from './components/trakt-report/trakt-report';
import Show from './components/show/show';

import Person from './components/person/person';

import MediaList from './components/media-list/media-list';
import ScreenshotsGallery from './components/screenshots-gallery/screenshots-gallery';
import YoutubeInput from './components/youtube/youtube';

import Settings from './components/settings/settings';

import withScroll from 'scroll-behavior';

// used in /frontend/components/right-panel/right-panel.js
export default ({ shell, history }) => {
  const scrollHistory = withScroll(history, (prevLocation, location) => (
    !prevLocation || location.pathname !== prevLocation.pathname
  ));

  return (
    <Router history={scrollHistory}>
      <Route path="/" component={shell}>
        <IndexRedirect to="/shows" />
        <Route path="/media" component={MediaList} />

        <Route path="/movies" component={MoviesListContainer}>
          <IndexRedirect to="/movies/upcoming" />

          <Route path="/movies/upcoming" component={MoviesList} />
          <Route path="/movies/recommendations" component={MoviesList} />

          <Route path="/movies/tmdb/:tmdb" component={Movie} />
          <Route path="/movies/:imdb" component={Movie} />
        </Route>

        <Route path="/shows">
          <IndexRoute component={TraktReport} />
          <Route path="/shows/tmdb/:tmdb" component={Show} />
          <Route path="/shows/:imdb" component={Show} />
        </Route>

        <Route path="/persons">
          <Route path="/persons/tmdb/:tmdb" component={Person} />
          <Route path="/persons/:imdb" component={Person} />
        </Route>

        <Route path="/screenshots" component={ScreenshotsGallery} />
        <Route path="/youtube" component={YoutubeInput} />
        <Route path="/settings" component={Settings} />

        <Redirect from="*" to="/shows" />
      </Route>
    </Router>
  );

};

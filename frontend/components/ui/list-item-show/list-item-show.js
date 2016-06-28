import React from 'react';
import styles from './style.css';

import * as api from '../../../api';

export default React.createClass({
  render() {
    const { type, imdb, title, body } = this.props;

    return (
      <div className={styles.marginBottom}>
        <div className={styles.marginBottom}>
          <div className={styles.imgWrapper}>
            <img
              src={api.getPosterUrl(type, imdb)}
              className={styles.img} />
          </div>

          { title }
        </div>

        <span>{ body }</span>
      </div>
    );
  }
});

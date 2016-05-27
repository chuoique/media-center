import React from 'react';
import mainStyles from './style.css';
import styles from '../theme.css';

import MediaList from './media-list';
import Tabs from '../ui/tabs/tabs';

import { MEDIA_LIST_ALL, MEDIA_LIST_UNWATCHED } from '../../constants';

export default React.createClass({
  render: function() {
    const { mediaListProps, files, isLeftPanel } = this.props;

    const className = isLeftPanel ? mainStyles.leftPanel : styles.imageContainer;
    const el = label => ({
      label,
      component: MediaList,
      getProps: mode => ({
        mediaListProps,
        isLeftPanel,
        files,
        mode
      })
    });

    const elements = [
      el(MEDIA_LIST_ALL),
      el(MEDIA_LIST_UNWATCHED)
    ];

    let initial = localStorage.mode;

    if (!elements[initial]) {
      initial = MEDIA_LIST_UNWATCHED;
      delete localStorage.mode;
    }

    return (
      <div className={`${className}`}>
        <Tabs
          isLeftPanel={isLeftPanel}
          isStacked={!isLeftPanel}
          elements={elements}
          initial={initial} />
      </div>
    );
  }
});

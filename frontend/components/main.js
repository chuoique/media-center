import React from 'react';
import Modal from 'react-modal';

import MediaList from './media-list';
import MediaDialog from './media-dialog';

import * as api from './../api';

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

export default React.createClass({
  getInitialState: function() {
    return {
      modalIsOpen: false,
      files: []
    };
  },
  getFiles: function() {
    api.findFiles().then((files) => this.setState({ files }));
  },
  componentDidMount: function() {
    this.getFiles();
  },
  openModal: function(file) {
    this.setState({ modalIsOpen: true, file });
  },
  closeModal: function(event) {
    event.preventDefault();
    this.setState({ modalIsOpen: false });
  },
  render: function() {
    return (
			<div>
        <div className="container">
				  <MediaList openModal={this.openModal} files={this.state.files} />
        </div>

        <Modal
          isOpen={this.state.modalIsOpen}
          style={customStyles}
          onRequestClose={this.closeModal}>
          <MediaDialog closeModal={this.closeModal} file={this.state.file} />
        </Modal>
			</div>
    );
	}
});
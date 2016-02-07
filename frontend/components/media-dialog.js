import React from 'react';
import * as api from './../api';
import Select from 'react-select';
import { debounce } from 'lodash';

import IconButton from './icon-button';

export default React.createClass({
  getInitialState: function() {
    if (this.props.file.recognition) {
      const r = this.props.file.recognition;

      return {
        type: {
          label: r.type,
          value: r.type
        },
        s: r.s,
        ep: r.ep
      };
    } else {
      return {
        type: {
          label: 'show',
          value: 'show'
        }
      };
    }
  },
  componentDidMount: function() {
    if (this.props.file.recognition) {
      this.getSelectOptions(this.props.file.recognition.title)
        .then(res => {
          this.setState({ imdb: res.options[0] });
        });
    }
  },
  getSelectOptions: function(input, callback) {
    return api
      .getMediaSuggestion(input, this.state.type.value)
      .then(options => {
        let i = 0;

        options.forEach(item => {
          item.value = item.value || i++;
        });

        if (callback) {
          callback(null, { options });
        }

        return { options };
      }, err => {
        console.log(err);

        if (callback) {
          callback(err);
        }

        return { options: [] };
      });
  },
  onChangeInput: function(field, event) {
    const value = event.label && event.value ? event : event.target.value;
    this.setState({ [field]: value });
  },
  getInfo: function() {
    return {
      type: this.state.type.value,
      imdb: this.state.imdb.value,
      title: this.state.imdb.label,
      s: this.state.s,
      ep: this.state.ep
    };
  },
  handlePlaying: function(event) {
    event.preventDefault();

    api.playFile(this.props.file.file, this.getInfo())
      .then(() => this.props.closeModal(event));
  },
  handleSaveInfo: function(event) {
    event.preventDefault();

    api.saveInfo(this.props.file.file, this.getInfo())
      .then(() => this.props.closeModal(event));
  },
  handleHide: function(event) {
    event.preventDefault();

    api.setHidden(this.props.file.file, this.props.file.filename)
      .then(() => this.props.closeModal(event));
  },
  isNotValid: function() {
    return !!!this.state.imdb || this.state.type.value === 'show' && (!this.state.s || !this.state.ep);
  },
  onSaveClick: function(fn, event) {
    if (!this.isNotValid()) {
      fn(event);
    }
  },
  render: function() {
    return (
      <div className="MediaDialog">
        <h2>{this.props.file.filename}</h2>
        <form>
          <div className="field-group">
            <Select
              name="type"
              options={[{ value: 'show', label: 'show'}, { value: 'movie', label: 'movie' }]}
              value={this.state.type}
              onChange={this.onChangeInput.bind(this, 'type')}
            />
          </div>

          <div className="field-group">
            <Select.Async
              name="imdb"
              loadOptions={debounce(this.getSelectOptions, 200)}
              value={this.state.imdb}
              minimumInput={1}
              onChange={this.onChangeInput.bind(this, 'imdb')}
            />
          </div>

          {
            this.state.type.value === 'show' && (
              <div className="field-group">
                <input name="s" placeholder="Season" value={this.state.s} onChange={this.onChangeInput.bind(this, 's')} />
              </div>
            )
          }

          {
            this.state.type.value === 'show' && (
              <div className="field-group">
                <input name="ep" placeholder="Episode" value={this.state.ep} onChange={this.onChangeInput.bind(this, 'ep')} />
              </div>
            )
          }

          <div className="field-group">
            <IconButton icon="play" disabled={this.isNotValid()} onClick={this.onSaveClick.bind(this, this.handlePlaying)}>
              Play
            </IconButton>
            <IconButton icon="floppy-saved" disabled={this.isNotValid()} onClick={this.onSaveClick.bind(this, this.handleSaveInfo)}>
              Save & Close
            </IconButton>
            <IconButton icon="tree-conifer" onClick={this.handleHide}>
              Hide File
            </IconButton>
            <IconButton icon="remove" onClick={this.props.closeModal}>
              Close
            </IconButton>
          </div>
        </form>
      </div>
    );
  }
});

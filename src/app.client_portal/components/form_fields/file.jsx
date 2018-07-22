import React from 'react';
import PropTypes from 'prop-types';

const extensionRequirement = {
  pdf: 'application/pdf',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

class FileUpload extends React.Component {
  constructor() {
    super();

    this.state = {
      uploads: {},
    };

    this.uniqueIdentifier = Math.random().toString();
  }

  componentDidMount() {
    const dragEvents = [
      'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop',
    ];

    dragEvents.forEach((eventName) => {
      this.outerWrap.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (eventName === 'dragenter' || eventName === 'dragover') {
          this.fileUploadHover.style = 'opacity: 1';
        } else if (eventName === 'dragleave' || eventName === 'drop') {
          this.fileUploadHover.style = 'opacity: 0';
        }
      });
    });

    const dragOverStart = ['dragover', 'dragenter'];

    dragOverStart.forEach((eventName) => {
      this.outerWrap.addEventListener(eventName, () => {
        this.setState({ isDragOver: true });
      });
    });

    const dragOverComplete = [
      'dragleave', 'dragend', 'drop',
    ];

    dragOverComplete.forEach((eventName) => {
      this.outerWrap.addEventListener(eventName, () => {
        this.setState({ isDragOver: false });
      });
    });

    this.outerWrap.addEventListener('drop', (e) => {
      this.onUploadFiles(e.dataTransfer.files);
    });
  }

  onUploadFiles(files) {
    const uploads = {};

    Object.keys(files).forEach((key) => {
      uploads[files[key].name] = files[key];
    });

    if (this.props.restrictUploads) {
      let hasExtensionError = false;

      Object.keys(uploads).forEach((upload) => {
        const isAValidFileType = (
          this.props.restrictUploads
            .filter(extension => extensionRequirement[extension] === uploads[upload].type)
            .length > 0
        );

        if (!isAValidFileType) {
          hasExtensionError = true;
        }
      });

      if (hasExtensionError) {
        this.showError(`
          The file type is invalid. Please upload a file with the extension(s):
          ${this.props.restrictUploads.join(' ')}.
        `);

        return;
      }
    }

    this.hideError();

    window.uploads = uploads;

    this.setState(previousState => ({
      uploads: Object.assign({}, previousState.uploads, uploads),
    }));

    if (this.props.onChange) {
      this.props.onChange(uploads);
    }
  }

  onClickDelete(e, fileName) {
    const uploads = Object.assign({}, this.state.uploads);

    Object.entries(uploads).forEach(([key, upload]) => {
      if (upload.name === fileName) {
        delete uploads[key];
      }
    });

    this.setState({ uploads });
  }

  getValue() {
    if (!this.state.uploads) {
      return null;
    }

    return Object.keys(this.state.uploads).map(key => (this.state.uploads[key]));
  }

  setValue(arr) {
    if (!Array.isArray(arr)) {
      throw new Error('setValue parameter must be an array');
    }

    const uploads = {};

    arr.forEach((value, index) => {
      uploads[index] = {
        name: value,
      };
    });

    this.setState({ uploads });
  }

  clearField() {
    this.setState({ uploads: {} });
  }

  showError(message) {
    this.setState({ error: message });
  }

  hideError() {
    this.setState({ error: null });
  }

  render() {
    return (
      <div className="form-group">
        <input
          type="file"
          className="file-style"
          onChange={e => this.onUploadFiles(e.currentTarget.files)}
          ref={(e) => { this.field = e; }}
          id={this.uniqueIdentifier}
          name={this.props.name}
          multiple={this.props.isMultiple}
        />
        <div
          className="alert alert-danger"
          style={this.state.error ? { display: 'block' } : { display: 'none' }}
          role="alert"
        >
          {this.state.error}
        </div>
        {
          this.props.label && !this.props.isStatic && (
            <label htmlFor={this.uniqueIdentifier}>
              {this.props.label}
            </label>
          )
        }
        {
          !this.props.isStatic && (
            <div className="drag-drop-wrapper mb-10" key={this.uniqueIdentifier}>
              <button
                type="button"
                ref={(e) => { this.outerWrap = e; }}
                onClick={(e) => {
                  e.preventDefault();
                  this.field.click();
                }}
                className={`drag-drop-field file-upload ${this.state.isDragOver ? 'is-drag-over' : ''}`}
              >
                <div
                  ref={(e) => { this.fileUploadHover = e; }}
                  className="file-upload-hover"
                />
                <div className="text">{this.props.title}</div>
              </button>
            </div>
          )
        }
        <div className="drag-drop-uploaded-items">
          {
            Object.keys(this.state.uploads).length > 0 && (
              <h5>Selected Files</h5>
            )
          }
          {
            Object.values(this.state.uploads).length < 1 && this.props.isStatic && (
              <div style={{ padding: '10px 0' }}>
                {this.props.noUploadsMessage || 'No files have been uploaded.'}
              </div>
            )
          }
          <ul>
            {
              Object.values(this.state.uploads).map(file => (
                <li key={file.name}>
                  {
                    !this.props.isStatic && (
                      <button
                        type="button"
                        onClick={e => this.onClickDelete(e, file.name)}
                        className="badge badge-warning delete-file"
                      >
                        delete
                      </button>
                    )
                  }
                  {file.name}
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    );
  }
}

FileUpload.defaultProps = {
  isMultiple: false,
  title: '',
  label: null,
  onChange: null,
  restrictUploads: null,
  noUploadsMessage: '',
  isStatic: false,
};

FileUpload.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  isMultiple: PropTypes.bool,
  onChange: PropTypes.func,
  isStatic: PropTypes.bool,
  noUploadsMessage: PropTypes.string,
  restrictUploads: PropTypes.arrayOf(PropTypes.string),
};

export default FileUpload;

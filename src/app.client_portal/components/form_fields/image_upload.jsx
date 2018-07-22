import React from 'react';
import PropTypes from 'prop-types';
import {
  ajaxUploadProductImage,
} from '../../actions/product.actions';
import Loader from '../widgets/loader';

const extensionRequirement = {
  pdf: 'application/pdf',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

class ImageUpload extends React.Component {
  constructor() {
    super();

    this.state = {
      images: [],
    };

    this.uniqueIdentifier = Math.random().toString();
  }

  componentDidMount() {
    if (!this.props.isStatic && this.props.isMultiple) {
      this.addDragDropEventListeners();
    }
  }

  componentDidUpdate() {
    if (!this.props.isStatic && this.props.isMultiple) {
      this.addDragDropEventListeners();
    }
  }

  addDragDropEventListeners() {
    if (this.hasEventListeners) {
      return;
    }

    this.hasEventListeners = true;

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

    this.uploadProduct(uploads);

    if (this.props.onChange) {
      this.props.onChange(uploads);
    }
  }

  uploadProduct(uploads) {
    if (this.state.isFileUploading) {
      return;
    }

    this.setState({ isFileUploading: true, error: null });

    this.props.dispatch(ajaxUploadProductImage({
      data: {
        'image_uploads[]': Object.keys(uploads).map(key => (uploads[key])),
      },
      onSuccess: (response) => {
        if (this.props.isMultiple) {
          this.setState(prevState => ({
            images: [].concat(prevState.images, response.uploads),
          }));
        } else {
          this.setState({ images: [].concat(response.uploads) });
        }
      },
      onComplete: () => {
        this.setState({ isFileUploading: false });
      },
    }));
  }

  onClickDelete(e, index) {
    this.setState(prevState => (
      {
        images: [].concat(prevState.images.slice(0, index), prevState.images.slice(index + 1)),
      }
    ));
  }

  onClickMakePrimary(e, index) {
    const list = this.state.images.slice(0);

    list.splice(index, 1);

    this.setState({
      images: [].concat(this.state.images[index], list),
    });
  }


  getValue() {
    if (!this.state.images) {
      return null;
    }

    return this.state.images;
  }

  setValue(images) {
    if (!Array.isArray(images)) {
      throw new Error('setValue parameter must be an array');
    }

    this.setState({ images });
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
    const isLoadingNode = (
      <div className="loader">
        <Loader />
      </div>
    );

    return (
      <div className="form-group relative">
        {
          this.state.isFileUploading && isLoadingNode
        }
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
            Object.keys(this.state.images).length > 0 && (
              <h5>
                {this.props.staticUploadText || 'Uploaded Images'}
              </h5>
            )
          }
          {
            Object.values(this.state.images).length < 1 && this.props.isStatic && (
              <div style={{ padding: '10px 0' }}>
                {this.props.noUploadsMessage || 'No images have been uploaded.'}
              </div>
            )
          }
          <div className="row image-upload-list">
            {
              this.state.images.map((imageFileName, index) => (
                <div className="col-sm-4 image-row" key={imageFileName}>
                  <div className={`image-item ${index === 0 ? 'is-primary' : ''}`}>
                    <img
                      src={`/api/images/${imageFileName}`}
                      alt=""
                    />
                  </div>
                  {
                    this.props.hasActionLinks && (
                      <div className="action-links">
                        {
                          index === 0 && (
                            <button
                              type="button"
                              className="badge badge-info delete-file"
                              disabled
                            >
                              primary
                            </button>
                          )
                        }
                        {
                          !this.props.isStatic && index !== 0 && (
                            <button
                              type="button"
                              onClick={e => this.onClickMakePrimary(e, index)}
                              className="badge badge-default delete-file"
                            >
                              make primary
                            </button>
                          )
                        }
                        {
                          !this.props.isStatic && (
                            <button
                              type="button"
                              onClick={e => this.onClickDelete(e, index)}
                              className="badge badge-danger delete-file"
                            >
                              delete
                            </button>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}

ImageUpload.defaultProps = {
  isMultiple: false,
  title: '',
  label: null,
  onChange: null,
  restrictUploads: null,
  noUploadsMessage: '',
  isStatic: false,
};

ImageUpload.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  isMultiple: PropTypes.bool,
  onChange: PropTypes.func,
  isStatic: PropTypes.bool,
  noUploadsMessage: PropTypes.string,
  restrictUploads: PropTypes.arrayOf(PropTypes.string),
};

export default ImageUpload;

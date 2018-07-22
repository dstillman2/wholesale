import React from 'react';
import PropTypes from 'prop-types';
import sendAjaxRequest from '../../actions/ajax.actions';
import DropdownWidget from './dropdown';
import Loader from '../widgets/loader';

function debounce(func, time) {
  let currentInterval;

  return (event) => {
    if (currentInterval) {
      window.clearTimeout(currentInterval);
    }

    event.persist();

    const timeout = window.setTimeout(() => {
      func(event);
    }, time);

    currentInterval = timeout;
  };
}

class TableWidget extends React.Component {
  constructor() {
    super();

    this.state = {
      data: [],
      query: {
        offset: 0,
      },
      hasFetchedData: false,
    };

    this.onSearch = this.onSearch.bind(this);
    this.filterByColumn = this.filterByColumn.bind(this);
    this.onClickPaginationLeft = this.onClickPaginationLeft.bind(this);
    this.onClickPaginationRight = this.onClickPaginationRight.bind(this);
    this.ajaxRequests = [];
    this.debounceSearch = debounce(this.onSearch, 300);
  }

  componentDidMount() {
    this.fetchTableData();
  }

  componentWillUnmount() {
    this.ajaxRequests.forEach(request => request && request.abort && request.abort());
  }

  onSearch(event) {
    event.preventDefault();

    this.setState({ query: { offset: 0 }, isSearching: true });
    this.fetchTableData({ search: this.searchElement.value });
  }

  onClickPaginationLeft() {
    if (this.state.offset < 10 || !this.state.hasFetchedData) { return; }

    this.setState(prevState => ({ query: { offset: prevState.query.offset - 10 } }));
    this.ajaxRequests.push(
      this.fetchTableData({
        offset: this.state.query.offset - 10,
        column: this.state.column || '',
        direction: this.state.direction || '',
      }),
    );
  }

  onClickPaginationRight() {
    if (this.state.query.offset + 10 >= this.state.data.total_count || !this.state.hasFetchedData) {
      return;
    }

    this.setState(prevState => ({ query: { offset: prevState.query.offset + 10 } }));

    this.ajaxRequests.push(
      this.fetchTableData({
        offset: this.state.query.offset + 10,
        column: this.state.column || '',
        direction: this.state.direction || '',
      }),
    );
  }

  fetchTableData(searchQuery = {}) {
    this.setState({ hasFetchedData: false });

    this.ajaxRequests.push(this.props.dispatch(sendAjaxRequest({
      select: this.props.schema.xhr.select,

      data: Object.assign(
        {},
        this.props.schema.xhr.data || {},
        searchQuery,
      ),

      onSuccess: (data) => {
        this.setState({
          hasFetchedData: true,
          data,
        });
      },

      onFailure: (response) => {
        let errorMessage = 'Unable to fetch the data. Please refresh the page or contact support.';

        if (response.error.status === 403) {
          errorMessage = 'Your account cannot access this resource.';
        }

        this.setState({
          hasFetchedData: true,
          showError: errorMessage,
        });
      },

      onComplete: () => {
        this.setState({ isLoading: false });
      },
    })));
  }

  filterByColumn(column, direction) {
    this.setState({
      column, direction,
    });

    this.ajaxRequests.push(
      this.fetchTableData({ column, direction }),
    );
  }

  render() {
    const schema = this.props.schema;
    const data = this.state.data.data || [];

    const totalCt = this.state.data.total_count;
    const lowerCt = this.state.query.offset + 1;

    let upperCt = (
      this.state.query.offset + this.state.data.count > totalCt ?
      totalCt : this.state.query.offset + this.state.data.count
    );

    if (upperCt < 10) {
      upperCt = 10;
    } else if (upperCt - lowerCt < 10 && upperCt < totalCt) {
      upperCt = lowerCt + 9;
    }

    if (upperCt > totalCt && totalCt < 10) {
      upperCt = totalCt;
    }

    const navWidget = (
      <div className="flexbox align-items-center">
        <span
          className="flex-grow text-right pr-10"
        >
          {lowerCt} - {upperCt} of {totalCt}
        </span>
        <nav>
          <a
            className={`btn btn-secondary mr-1${this.state.query.offset === 0 || !this.state.hasFetchedData ? ' disabled' : ''}`}
            onClick={this.onClickPaginationLeft}
            tabIndex={this.state.query.offset === 0 ? '-1' : '0'}
            href="#left"
          >
            <i className="ti-angle-left" />
          </a>
          <a
            className={`btn btn-secondary${this.state.query.offset + 10 >= totalCt || !this.state.hasFetchedData ? ' disabled' : ''}`}
            onClick={this.onClickPaginationRight}
            tabIndex={this.state.query.offset + 10 >= totalCt ? '-1' : '0'}
            href="#right"
          >
            <i className="ti-angle-right" />
          </a>
        </nav>
      </div>
    );

    return (
      <div className="table-widget">
        {
          !this.state.hasFetchedData && data.length === 0 && !this.state.isSearching && (
            <Loader />
          )
        }
        {
          this.state.showError && (
            <h4 className="text-center mt-30 fs-14">
              {this.state.showError}
            </h4>
          )
        }
        {
          this.state.hasFetchedData
          && data.length === 0
          && !this.state.isSearching
          && !this.state.showError && (
            <div className="new-nimbus mt-40">
              {schema.new}
            </div>
          )
        }
        {
          this.state.hasFetchedData && data.length !== 0 && this.props.children
        }
        {
          (data.length > 0 || this.state.isSearching) && !this.state.showError && (
            <div className="table-data-populated">
              <div className="row mb-24">
                <div className="col-sm-8 col-md-7">
                  {
                    schema.sortBy && (
                      <DropdownWidget
                        externalClass={'mr-20'}
                        items={schema.sortBy}
                      />
                    )
                  }
                  {
                    schema.hasSearchBar && (
                      <form
                        id="default-search"
                        className="lookup lookup-sm"
                        onSubmit={this.onSearch}
                      >
                        <input
                          onKeyUp={this.debounceSearch}
                          ref={(c) => { this.searchElement = c; }}
                          type="text"
                          placeholder="Search"
                        />
                      </form>
                    )
                  }
                  <div>
                    {
                      schema.createButton && (
                        <button className="btn btn-secondary mr-10" style={{ textTransform: 'none' }}>
                          Create
                        </button>
                      )
                    }
                    {
                      schema.createButton && (
                        <button className="btn btn-secondary mr-10" style={{ textTransform: 'none' }}>
                          Create
                        </button>
                      )
                    }
                  </div>
                </div>
                <div className="col-sm-4 col-md-5">
                  <div style={{ float: 'right' }}>
                    {
                      schema.hasImport && (
                        <button className="btn btn-secondary mr-10" style={{ textTransform: 'none' }}>
                          <i className="ti-upload fs-15" /> Import
                        </button>
                      )
                    }
                    {
                      schema.hasExport && (
                        <button
                          className="btn btn-secondary btn-secondary-v3"
                          style={{ textTransform: 'none' }}
                          onClick={schema.onExport}
                        >
                          <i className="ti-download fs-15" /> Export
                        </button>
                      )
                    }
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="card mb-20">
                    <table className="table table-lg table-hover table-responsive nimbus-tb nimbus-hover">
                      <thead>
                        <tr
                          className="card-title"
                          style={{ lineHeight: 2 }}
                        >
                          {
                            schema.heading.map((item, index) => {
                              if (typeof item === 'string') {
                                return (
                                  <th
                                    key={item}
                                    width={
                                      schema.headingWidth ?
                                      schema.headingWidth[index] :
                                      `${100 / schema.heading.length}%`
                                    }
                                  >{item}</th>
                                );
                              } else if (Object.prototype.toString.call(item) === '[object Object]') {
                                return (
                                  <th
                                    key={item.name}
                                    width={
                                      schema.headingWidth ?
                                      schema.headingWidth[index] :
                                      `${100 / schema.heading.length}%`
                                    }
                                    data-direction="none"
                                    className={item.column ? 'filterby' : null}
                                    onClick={(event) => {
                                      let direction;

                                      if (!item.column) return;
                                      switch (event.target.dataset.direction) {
                                        case 'desc':
                                          event.target.dataset.direction = 'asc';
                                          direction = 'asc';
                                          break;
                                        default:
                                          event.target.dataset.direction = 'desc';
                                          direction = 'desc';
                                      }

                                      this.filterByColumn(item.column, direction);
                                    }}
                                  >{item.name}</th>
                                );
                              }

                              return '';
                            })
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {
                          !this.state.hasFetchedData && (data.length > 0 || this.state.isSearching) && (
                            <tr>
                              <td colSpan={schema.heading.length}>
                                <Loader />
                              </td>
                            </tr>
                          )
                        }
                        {
                          this.state.isSearching &&
                          this.state.hasFetchedData && data.length === 0 && (
                            <tr>
                              <td colSpan={schema.heading.length}>
                                <div className="text-center my-60">
                                <h5 style={{ fontWeight: 'normal' }}>No results found. Please try again.</h5>
                                </div>
                              </td>
                            </tr>
                          )
                        }
                        {
                          data.map(entry => (
                            <tr
                              style={!this.state.hasFetchedData && data.length > 0 ? { display: 'none' } : {}}
                              className="nimbus-hover"
                              role="button"
                              key={entry.id}
                              onClick={() => {
                                this.props.history.push({
                                  pathname: `${schema.editPath}/${entry.id}`,
                                });
                              }}
                            >
                              {
                                schema.body.map((resp, index) => (
                                  <td key={index}>
                                    {resp(entry)}
                                  </td>
                                ))
                              }
                            </tr>
                        ))
                        }
                      </tbody>
                    </table>
                  </div>
                  <footer className="mb-20">
                    {navWidget}
                  </footer>
                </div>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

TableWidget.propTypes = {
  dispatch: PropTypes.func.isRequired,
  schema: PropTypes.shape({
    sortBy: PropTypes.arrayOf(PropTypes.object),
    hasSearchBar: PropTypes.bool,
    editPath: PropTypes.string,
    xhr: PropTypes.shape({
      select: PropTypes.string,
      data: PropTypes.object,
    }),
  }).isRequired,
};

export default TableWidget;

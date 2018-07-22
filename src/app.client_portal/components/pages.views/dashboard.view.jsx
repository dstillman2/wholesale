import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Loader from '../widgets/loader';
import {
  ajaxFetchStatistics,
} from '../../actions/statistic.actions';

class DashboardView extends React.Component {
  constructor() {
    super();

    this.state = {
      isGraphLoading: true,
    };
  }

  UNSAFE_componentWillMount() {
    this.setState({ isStatisticsLoading: true });

    this.props.dispatch(ajaxFetchStatistics(
      {
        onComplete: () => {
          this.setState({ isStatisticsLoading: false });
        },
      },
    ));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.statistics.data) {
      this.generateGraph(nextProps.statistics.data.history);
    }
  }

  generateGraph(data) {
    this.setState({ isGraphLoading: false });

    const labelSet = [];
    const totalOrdersSet = [];
    const totalRevenueSet = [];

    for (let i = 0; i < data.length; i += 1) {
      labelSet.push(
        moment(`${data[i].month}-01-${data[i].year}`).format('M/Y'),
      );

      totalOrdersSet.push(data[i].orders);
      totalRevenueSet.push((data[i].revenue / 100).toFixed(2));
    }

    const chartNode = document.getElementById('weekly-sales-chart');
    const ctx = chartNode.getContext('2d');

    chartNode.style.backgroundColor = '#fff';

    return new Chart(ctx, {
      type: 'bar',
      data: {
        fill: '#fff',
        labels: labelSet,
        datasets: [{
          label: 'Orders',
          yAxisID: 'A',
          type: 'line',
          fill: false,
          borderColor: '#a1a1a1',
          pointRadius: 3,
          pointBackgroundColor: '#262b33',
          pointBorderColor: '#fff',
          data: totalOrdersSet,
          borderWidth: 1,
        }, {
          label: 'Revenue $',
          yAxisID: 'B',
          data: totalRevenueSet,
          borderColor: '#FFF',
          backgroundColor: '#4cc3e2',
          borderWidth: 1,
        }],
      },
      options: {
        legend: {
          display: true,
          usePointStyle: true,
        },
        scales: {
          yAxes: [{
            id: 'A',
            type: 'linear',
            gridLines: {
              color: 'rgba(0, 0, 0, 0)',
            },
            ticks: {
              beginAtZero: true,
              callback: value => (value % 1 === 0 ? value : null),
            },
          }, {
            id: 'B',
            ticks: {
              beginAtZero: true,
              callback: value => `$${(value).toLocaleString()}`,
            },
          }],
        },
      },
    });
  }

  render() {
    const data = this.props.statistics.data || { currentMonth: {}, previousMonth: {} };

    const isLoadingNode = (
      <div className="loader">
        <Loader />
      </div>
    );

    const p = data.previousMonth;
    const c = data.currentMonth;

    let revenueIncrease = ((c.total_revenue - p.total_revenue) / p.total_revenue);
    let ordersIncrease = ((c.orders - p.orders) / p.orders);
    let averageSaleIncrease = ((c.average_sale - p.average_sale) / p.average_sale);

    revenueIncrease = revenueIncrease === 'Infinity' ? 1 : revenueIncrease;
    ordersIncrease = ordersIncrease === 'Infinity' ? 1 : ordersIncrease;
    averageSaleIncrease = averageSaleIncrease === 'Infinity' ? 1 : averageSaleIncrease;

    revenueIncrease = isNaN(revenueIncrease) ? 0 : (revenueIncrease * 100).toFixed(1);
    ordersIncrease = isNaN(ordersIncrease) ? 0 : (ordersIncrease * 100).toFixed(1);
    averageSaleIncrease = isNaN(averageSaleIncrease) ? 0 : (averageSaleIncrease * 100).toFixed(1);

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="card card-body">
              { this.state.isStatisticsLoading && isLoadingNode }
              <h5 style={{ fontSize: '13px', fontWeight: 'bold' }}>Total Revenue</h5>
              <p className="fs-28 fw-100 mt-3">${Number((data.currentMonth.total_revenue / 100).toFixed(0)).toLocaleString()}
                <span className="fs-14 ml-2">this month</span>
              </p>
              {
                isFinite(revenueIncrease) && (
                  <div>
                    <hr style={{ margin: 0, padding: 0, marginBottom: 15, borderTopColor: 'rgba(77,82,89,0.2)' }} />
                    {
                      revenueIncrease < 0 ? (
                        <div className="text-gray fs-13">{revenueIncrease}% decrease from last month</div>
                      ) : (
                        <div className="text-gray fs-13">{revenueIncrease}% increase from last month</div>
                      )
                    }
                  </div>
                )
              }
            </div>
          </div>
          <div className="col-md-6 col-lg-4">
            <div className="card card-body">
              { this.state.isStatisticsLoading && isLoadingNode }
              <h5 style={{ fontSize: '13px', fontWeight: 'bold' }}>Orders</h5>
              <p className="fs-28 fw-100 mt-3">{Number(data.currentMonth.orders).toLocaleString()}<span className="fs-14 ml-2">this month</span></p>
                {
                  isFinite(ordersIncrease) && (
                    <div>
                      <hr style={{ margin: 0, padding: 0, marginBottom: 15, borderTopColor: 'rgba(77,82,89,0.2)' }} />
                      {
                        revenueIncrease < 0 ? (
                          <div className="text-gray fs-13">{ordersIncrease}% decrease from last month</div>
                        ) : (
                          <div className="text-gray fs-13">{ordersIncrease}% increase from last month</div>
                        )
                      }
                    </div>
                  )
                }
            </div>
          </div>
          <div className="col-md-6 col-lg-4">
            <div className="card card-body">
              { this.state.isStatisticsLoading && isLoadingNode }
              <h5 style={{ fontSize: '13px', fontWeight: 'bold' }}>Average Sale</h5>
              <p className="fs-28 fw-100 mt-3">
                ${Number((data.currentMonth.average_sale / 100).toFixed(0)).toLocaleString()}
                <span className="fs-14 ml-2">this month</span>
              </p>
              {
                isFinite(averageSaleIncrease) && (
                  <div>
                    <hr style={{ margin: 0, padding: 0, marginBottom: 15, borderTopColor: 'rgba(77,82,89,0.2)' }} />
                    {
                      averageSaleIncrease < 0 ? (
                        <div className="text-gray fs-13">{averageSaleIncrease}% decrease from last month</div>
                      ) : (
                        <div className="text-gray fs-13">{averageSaleIncrease}% increase from last month</div>
                      )
                    }
                  </div>
                )
              }
            </div>
          </div>
          <div className="col-12">
            <div className="card">
              { this.state.isGraphLoading && isLoadingNode }
              <div className="card-header">
                <h5 style={{ fontSize: '13px', fontWeight: 'bold' }}>Monthly Sales Trend</h5>
              </div>
              <div className="card-body">
                <div style={{ background: '#f9f9f9', marginBottom: 20 }}>
                  <canvas id="weekly-sales-chart" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DashboardView.defaultProps = {
  statistics: {
    data: {},
  },
};

DashboardView.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default withRouter(connect(state => ({ statistics: state.statistics }))(DashboardView));

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';

import {
  ButtonComponent,
  LoaderComponent,
  SocietyStatsComponent,
  ToastMessageComponent,
} from '../../common/components';
import MyStatsComponent from './MyStatsComponent';
import LogPointsComponent from './LogPointsModalContainer';
import MyActivitiesComponent from './MyActivitiesComponent';

import { myStats } from '../constants';
import { actions } from '../operations';
import { actions as societyActions } from '../../Societies/operations';
import { getUserInfo, getToken, search } from '../../utils';

export class DashboardContainer extends Component {
  state = {
    user: {},
    logPoints: false,
    currentPage: 1,
    activitiesPerPage: 6,
  };

  /**
   * @name defaultProps
   * @type {PropType}
   * @property {func} fetchUserActivites
   *
   */
  static defaultProps = {
    error: {},
    // dlevel: '',
    searchText: '',
    societyName: '',
    loading: false,
    society: {},
    pointsEarned: myStats.points,
    activitiesLogged: myStats.activities,
    userActivities: myStats.userActivities,
    fetchUserActivites: () => {},
    loadCategories: () => {},
    successMessage: '',
    showToastMessage: false,
    fetchSocietyInfoRequest: null,
  };

  /**
   * @name propTypes
   * @type {PropType}
   * @property {func} fetchUserActivites
   */
  static propTypes = {
    loading: PropTypes.bool,
    // dlevel: PropTypes.string,
    society: PropTypes.shape({}),
    societyName: PropTypes.string,
    searchText: PropTypes.string,
    error: PropTypes.shape({}),
    pointsEarned: PropTypes.number,
    activitiesLogged: PropTypes.number,
    fetchUserActivites: PropTypes.func,
    loadCategories: PropTypes.func,
    userActivities: PropTypes.arrayOf(PropTypes.shape({})),
    successMessage: PropTypes.string,
    showToastMessage: PropTypes.bool,
    fetchSocietyInfoRequest: PropTypes.func,
  };

  componentDidMount() {
    const { fetchUserActivites, loadCategories } = this.props;
    const token = getToken();
    const userInfo = getUserInfo(token);
    this.setState({ user: userInfo });
    fetchUserActivites(userInfo.id);
    loadCategories();
  }

  componentDidUpdate(prevProps) {
    const { societyName, fetchSocietyInfoRequest } = this.props;
    if (societyName && prevProps.societyName !== societyName) {
      fetchSocietyInfoRequest(societyName.toLowerCase());
    }
  }

  logPointsModal = () => {
    const { logPoints } = this.state;
    this.setState({
      logPoints: !logPoints,
    });
  };

  handlePageClick = (data) => {
    const { selected } = data;
    this.setState({
      currentPage: selected + 1,
    });
  };

  render() {
    const {
      error,
      loading,
      pointsEarned,
      activitiesLogged,
      userActivities,
      societyName,
      successMessage,
      showToastMessage,
      // dlevel,
      society,
      searchText,
    } = this.props;
    const {
      user, logPoints, currentPage, activitiesPerPage,
    } = this.state;
    const pageCount = Math.ceil(userActivities.length / activitiesPerPage);
    const indexOfLastActivity = currentPage * activitiesPerPage;
    const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
    const currentActivities = userActivities.slice(indexOfFirstActivity, indexOfLastActivity);
    let dashboardHtml;
    let logPointsComponent;
    if (logPoints) {
      logPointsComponent = <LogPointsComponent open={logPoints} close={this.logPointsModal} />;
    }
    if (loading) {
      dashboardHtml = <LoaderComponent className='loader' />;
    } else if (!loading && error) {
      dashboardHtml = <p>The was an error while fetching your data. Please try again later.</p>;
    } else {
      dashboardHtml = (
        <div className='user-dashboard'>
          <h2 className='user-dashboard__name col-sm-12'>{user.name}</h2>
          {/* The code below can be does not work on staging. Uncomment it after figuring it out */}
          {/* <div className='col-sm-12 user-dashboard__level--container'>
            <h3 className='user-dashboard__level'>{dlevel.substr(0, 2)}</h3>
          </div> */}
          <div className='profile-overview col-sm-12'>
            <div className='profile-overview__image' />
            <MyStatsComponent points={pointsEarned} activities={activitiesLogged} />
            {societyName && Object.keys(society[societyName.toLowerCase()]).length && (
              <SocietyStatsComponent
                society={societyName}
                usedPoints={society[societyName.toLowerCase()].usedPoints}
                remainingPoints={society[societyName.toLowerCase()].remainingPoints}
              />
            )}
          </div>
          <div className='user-dashboard__actions col-sm-12'>
            <h3 className='user-dashboard__title'>My Activities</h3>
            <ToastMessageComponent className='success' show={showToastMessage}>
              <div>
                <span className='success-message'>{successMessage}</span>
                <span className='checkmark'>
                  <div className='checkmark_stem' />
                  <div className='checkmark_kick' />
                </span>
              </div>
            </ToastMessageComponent>
            <div>
              <ButtonComponent
                type='button'
                className='button__add user-dashboard__button'
                onClick={this.logPointsModal}
              >
                <span className='fa fa-plus' />
                <span>Log Points</span>
              </ButtonComponent>
              <ButtonComponent className='button__filter user-dashboard__button'>
                <span>Filter</span>
                <span className='fa fa-filter' />
              </ButtonComponent>
            </div>
          </div>
          {logPointsComponent}
          <MyActivitiesComponent userActivities={search(searchText, currentActivities)} />
          <ReactPaginate
            previousLabel='previous'
            nextLabel='next'
            breakLabel='...'
            breakClassName='break-me'
            pageCount={pageCount}
            marginPagesDisplayed={3}
            pageRangeDisplayed={5}
            onPageChange={this.handlePageClick}
            containerClassName='pagination'
            subContainerClassName='pages pagination'
            activeClassName='active'
          />
        </div>
      );
    }
    return dashboardHtml;
  }
}

const mapStateToProps = ({ dashboard, society, navbar }) => ({
  society,
  error: null,
  // dlevel: dashboard.dlevel,
  societyName: dashboard.society,
  searchText: navbar.searchText,
  loading: dashboard.loading,
  pointsEarned: dashboard.pointsEarned,
  userActivities: dashboard.userActivities,
  activitiesLogged: dashboard.activitiesLogged,
  successMessage: dashboard.activity.message,
  showToastMessage: dashboard.showToastMessage,
});

export default connect(
  mapStateToProps,
  {
    fetchUserActivites: actions.fetchUserActivitiesRequest,
    loadCategories: actions.loadCategories,
    fetchSocietyInfoRequest: societyActions.fetchSocietyInfoRequest,
  },
)(DashboardContainer);

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import ModalPortal from './dialog/modal-portal';
import DropdownMenu from './dropdown-menu';
import NewViewDialog from './dialog/new-view-dialog';
import RenameViewDialog from './dialog/rename-view-dialog';
import '../locale';

import '../assets/css/gallery-tabs.css';

const SCROLL_TYPE = {
  PREV: 'prev',
  NEXT: 'next',
};

const viewTabPropTypes = {
  view: PropTypes.object,
  index: PropTypes.number,
  selectedViewIdx: PropTypes.number,
  setViewItem: PropTypes.func,
  onSelectView: PropTypes.func,
  onDeleteView: PropTypes.func,
  onMoveView: PropTypes.func,
  onRenameViewToggle: PropTypes.func,
  canDelete: PropTypes.bool
};

class ViewTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowViewDropdown: false,
      dropdownMenuPosition: {
        top: 0,
        left: 0
      }
    };
    this.enteredCounter = 0;
  }

  componentDidMount() {
    document.addEventListener('click', this.onHideViewDropdown);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onHideViewDropdown);
  }

  onHideViewDropdown = () => {
    if (this.state.isShowViewDropdown) {
      this.setState({isShowViewDropdown: false});
    }
  }

  onDropdownToggle = (evt) => {
    evt.nativeEvent.stopImmediatePropagation();
    let { top, left, height } = this.btnViewDropdown.parentNode.getBoundingClientRect();
    this.setState({
      isShowViewDropdown: !this.state.isShowViewDropdown,
      dropdownMenuPosition: {
        top: top + height - 3,
        left
      }
    });
  }

  onSelectView = () => {
    const { view, index, selectedViewIdx } = this.props;
    const { _id } = view;
    if (index === selectedViewIdx) return;
    this.props.onSelectView(_id);
  }

  onDeleteView = () => {
    const { view } = this.props;
    this.props.onDeleteView(view._id);
  }

  onDragStart = (event) => {
    event.stopPropagation();
    let ref = this.itemRef;
    event.dataTransfer.setDragImage(ref, 10, 10);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', this.props.view._id);
  }

  onDragEnter = (event) => {
    event.stopPropagation();
    this.enteredCounter++;
  }

  onDragOver = (event) => {
    if (event.dataTransfer.dropEffect === 'copy') {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    this.setState({
      dropRelativePosition: event.nativeEvent.offsetX <= event.target.clientWidth / 2 ?
        'before' : 'after'
    });
  }

  onDragLeave = (event) => {
    event.stopPropagation();
    this.enteredCounter--;
    if (this.enteredCounter === 0) {
      this.setState({
        dropRelativePosition: ''
      });
    }
  }

  onDrop = (event) => {
    event.stopPropagation();
    event.preventDefault();

    this.enteredCounter = 0;
    const { dropRelativePosition } = this.state;
    this.setState({
      dropRelativePosition: ''
    });

    const droppedViewID = event.dataTransfer.getData('text/plain');
    const { _id } = this.props.view;
    if (droppedViewID == _id) {
      return;
    }
    this.props.onMoveView(droppedViewID, _id, dropRelativePosition);
  }

  render() {
    const { view, index, selectedViewIdx, canDelete } = this.props;
    const { name } = view;
    const isActiveView = selectedViewIdx === index;

    const {
      isShowViewDropdown, dropdownMenuPosition,
      dropRelativePosition
    } = this.state;
    return (
      <div
        ref={ref => this.itemRef = ref}
        draggable="true"
        onDragStart={this.onDragStart}
        onDragEnter={this.onDragEnter}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        className={classnames({
          'view-item': true,
          'active': isActiveView,
          'view-item-can-drop-before': dropRelativePosition == 'before',
          'view-item-can-drop-after': dropRelativePosition == 'after'
        })}
      >
        <div className="view-item-content"
          ref={this.props.setViewItem(index)}
          onClick={this.onSelectView}>
          <div className="view-name">{name}</div>
          {isActiveView &&
          <div className="btn-view-dropdown" ref={ref => this.btnViewDropdown = ref} onClick={this.onDropdownToggle}>
            <i className="dtable-font dtable-icon-drop-down"></i>
            {isShowViewDropdown &&
            <ModalPortal>
              <DropdownMenu
                dropdownMenuPosition={dropdownMenuPosition}
                options={
                  <React.Fragment>
                    <button className="dropdown-item" onClick={this.props.onRenameViewToggle}>
                      <i className="item-icon dtable-font dtable-icon-rename"></i>
                      <span className="item-text">{intl.get('Rename_View')}</span>
                    </button>
                    {canDelete &&
                    <button className="dropdown-item" onClick={this.onDeleteView}>
                      <i className="item-icon dtable-font dtable-icon-delete"></i>
                      <span className="item-text">{intl.get('Delete_View')}</span>
                    </button>
                    }
                  </React.Fragment>
                }
              />
            </ModalPortal>
            }
          </div>
          }
        </div>
      </div>
    );
  }
}


const propTypes = {
  views: PropTypes.array,
  selectedViewIdx: PropTypes.number,
  isMobile: PropTypes.bool,
  onSelectView: PropTypes.func,
  onDeleteView: PropTypes.func,
  onAddView: PropTypes.func,
  onRenameView: PropTypes.func,
  onMoveView: PropTypes.func
};

class ViewsTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowNewViewDialog: false,
      isShowRenameViewDialog: false,
      canScrollPrev: false,
      canScrollNext: false,
      canViewsScroll: true,
    };
    this.views = [];
  }

  componentDidMount() {
    let { selectedViewIdx } = this.props;
    this.selectView(selectedViewIdx);
  }

  selectView(selectedViewIdx) {
    // get current view's distance with container's left
    let { left } = this.views[selectedViewIdx].getBoundingClientRect();

    // get container's view with and total width
    let { offsetWidth } = this.viewsTabsScroll;
    if (left > offsetWidth) {
      this.viewsTabsScroll.scrollLeft = left - offsetWidth;
    } else {
      this.checkAvailableScrollType();
    }
  }

  checkAvailableScrollType = () => {
    if (this.props.isMobile) {
      return;
    }
    const { canScrollPrev, canScrollNext } = this.state;
    let { offsetWidth, scrollWidth, scrollLeft } = this.viewsTabsScroll;
    let _canScrollPrev = false;
    let _canScrollNext = false;
    if (scrollLeft > 0) {
      _canScrollPrev = true;
    }
    if (scrollLeft + offsetWidth < scrollWidth) {
      _canScrollNext = true;
    }

    if (_canScrollPrev !== canScrollPrev || _canScrollNext !== canScrollNext) {
      this.setState({
        canScrollPrev: _canScrollPrev,
        canScrollNext: _canScrollNext,
      });
    }
  }

  onScrollWithControl = (type) => {
    const { offsetWidth, scrollWidth, scrollLeft } = this.viewsTabsScroll;
    let targetScrollLeft;
    if (type === SCROLL_TYPE.PREV) {
      if (scrollLeft === 0) {
        return;
      }
      targetScrollLeft = scrollLeft - offsetWidth;
      targetScrollLeft = targetScrollLeft > 0 ? targetScrollLeft : 0;
    }

    if (type === SCROLL_TYPE.NEXT) {
      if (scrollLeft + offsetWidth === scrollWidth) {
        return;
      }
      targetScrollLeft = scrollLeft + offsetWidth;
      targetScrollLeft = targetScrollLeft > scrollWidth - offsetWidth ? scrollWidth - offsetWidth : targetScrollLeft;
    }
    if (this.state.canViewsScroll) {
      this.setState({ canViewsScroll: false });
      let timer = null;
      timer = setInterval(() => {
        let step = (targetScrollLeft - scrollLeft) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        this.viewsTabsScroll.scrollLeft = this.viewsTabsScroll.scrollLeft + step;
        if (Math.abs(targetScrollLeft - this.viewsTabsScroll.scrollLeft) <= Math.abs(step)) {
          this.viewsTabsScroll.scrollLeft = targetScrollLeft;
          clearInterval(timer);
          this.setState({ canViewsScroll: true });
        }
      }, 15);
    }
  }

  onTabsScroll = () => {
    this.checkAvailableScrollType();
  }

  setViewItem = idx => viewItem => {
    this.views[idx] = viewItem;
  }

  setViewsTabsScroll = () => {
    if (!this.viewsTabsScroll) return;
    let { offsetWidth, scrollWidth } = this.viewsTabsScroll;
    if (scrollWidth > offsetWidth) {
      this.viewsTabsScroll.scrollLeft = scrollWidth - offsetWidth;
    }
  }

  onNewViewToggle = () => {
    this.setState({isShowNewViewDialog: !this.state.isShowNewViewDialog});
  }

  onNewViewCancel = () => {
    this.setState({isShowNewViewDialog: false});
  }

  onAddView = (viewName) => {
    this.props.onAddView(viewName);
    this.onNewViewToggle();
  }

  onRenameViewToggle = () => {
    this.setState({isShowRenameViewDialog: !this.state.isShowRenameViewDialog});
  }

  hideRenameViewDialog = () => {
    this.setState({isShowRenameViewDialog: false});
  }

  renderViewsItems = () => {
    let { views, selectedViewIdx } = this.props;
    const canDelete = views.length > 0;
    return (
      views.map((view, index) => {
        return (
          <ViewTab
            key={index}
            view={view}
            index={index}
            canDelete={canDelete}
            selectedViewIdx={selectedViewIdx}
            setViewItem={this.setViewItem}
            onSelectView={this.props.onSelectView}
            onRenameViewToggle={this.onRenameViewToggle}
            onDeleteView={this.props.onDeleteView}
            onMoveView={this.props.onMoveView}
          />
        );
      })
    );
  }

  render() {
    let { views, selectedViewIdx, isMobile } = this.props;
    let { isShowNewViewDialog, isShowRenameViewDialog, canScrollPrev, canScrollNext } = this.state;
    let selectedGridView = views[selectedViewIdx] || {};
    return (
      <div className="gallery-views-tabs">
        <div className="tabs-scroll-container">
          <div className="tabs-scroll pr-1" ref={ref => this.viewsTabsScroll = ref} onScroll={this.onTabsScroll}>
            {this.renderViewsItems()}
          </div>
        </div>
        {(!isMobile && (canScrollPrev || canScrollNext)) &&
          <div className="views-scroll-control">
            <span
              className={classnames('scroll-control-btn', 'scroll-prev', { 'scroll-active': canScrollPrev })}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.PREV)}
            >
              <i className="dtable-font dtable-icon-left-slide btn-scroll-icon" />
            </span>
            <span
              className={classnames('scroll-control-btn', 'scroll-next', { 'scroll-active': canScrollNext })}
              onClick={this.onScrollWithControl.bind(this, SCROLL_TYPE.NEXT)}
            >
              <i className="dtable-font dtable-icon-right-slide btn-scroll-icon" />
            </span>
          </div>
        }
        <div className="views-tabs-add-btn flex-shrink-0 align-self-center" onClick={this.onNewViewToggle}>
          <i className="dtable-font dtable-icon-add-table"></i>
        </div>
        {isShowNewViewDialog &&
          <NewViewDialog
            onNewViewConfirm={this.onAddView}
            onNewViewCancel={this.onNewViewCancel}
          />
        }
        {isShowRenameViewDialog &&
          <RenameViewDialog
            viewName={selectedGridView.name}
            onRenameView={this.props.onRenameView}
            hideRenameViewDialog={this.hideRenameViewDialog}
          />
        }
      </div>
    );
  }
}

ViewTab.propTypes = viewTabPropTypes;
ViewsTabs.propTypes = propTypes;

export default ViewsTabs;

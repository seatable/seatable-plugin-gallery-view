import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import intl from 'react-intl-universal';
import ModalPortal from './dialog/modal-portal';
import DropdownMenu from './dropdown-menu';
import NewViewDialog from './dialog/new-view-dialog';
import RenameViewDialog from './dialog/rename-view-dialog';
import '../locale';

import '../css/gallery-tabs.css';

const propTypes = {
  views: PropTypes.array,
  selectedViewIdx: PropTypes.number,
  onSelectView: PropTypes.func,
  onDeleteView: PropTypes.func,
  onAddView: PropTypes.func,
  onRenameView: PropTypes.func,
};

class GalleryViewsTabs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowViewDropdown: false,
      dropdownMenuPosition: {
        top: 0,
        left: 0
      },
      isShowNewViewDialog: false,
      isShowRenameViewDialog: false,
      scrollLeft: 0
    };
    this.views = [];
  }

  componentDidMount() {
    let { selectedViewIdx } = this.props;
    this.selectView(selectedViewIdx);
    document.addEventListener('click', this.onHideViewDropdown);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onHideViewDropdown);
  }

  selectView(selectedViewIdx) {
    // get current view's distance with container's left
    let { left } = this.views[selectedViewIdx].getBoundingClientRect();

    // get container's view with and total width
    let { offsetWidth, scrollWidth } = this.viewsTabsScroll;
    if (left > offsetWidth) {
      this.viewsTabsScroll.scrollLeft = left - offsetWidth; 
      this.setState({tabsScrollLeft: left - offsetWidth});
    }
    this.tabsNavWidth = offsetWidth;
    this.tabsNavTotalWidth = scrollWidth;
  }

  onTabsScroll = (event) => {
    this.setState({tabsScrollLeft: event.target.scrollLeft});
  }

  onDropdownToggle = (evt) => {
    evt.nativeEvent.stopImmediatePropagation()
    let { top, left, height } = this.btnViewDropdown.parentNode.getBoundingClientRect();
    this.setState({
      isShowViewDropdown: !this.state.isShowViewDropdown,
      dropdownMenuPosition: {
        top: top + height - 3,
        left
      }
    });
  }

  onHideViewDropdown = () => {
    this.setState({isShowViewDropdown: false});
  }

  setViewItem = idx => viewItem => {
    this.views[idx] = viewItem;
  }

  setGalleryViewsTabsScroll = () => {
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

  onSelectView = (id, index) => {
    let { selectedViewIdx } = this.props;
    if (index === selectedViewIdx) return;
    this.props.onSelectView(id);
  }

  renderViewsItems = () => {
    let { views, selectedViewIdx } = this.props;
    let { isShowViewDropdown, dropdownMenuPosition } = this.state;
    return (
      views.map((v, i) => {
        let { _id, name } = v;
        let isActiveView = selectedViewIdx === i;
        let activeViewClass = classnames({'view-item': true, 'active': isActiveView});
        return (
          <div key={`gallery-views-${_id}`} className={activeViewClass}>
            <div className="view-item-content" ref={this.setViewItem(i)} onClick={this.props.onSelectView.bind(this, _id, i)}>
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
                            <button className="dropdown-item" onClick={this.onRenameViewToggle}>
                              <i className="item-icon dtable-font dtable-icon-rename"></i>
                              <span className="item-text">{intl.get('Rename_View')}</span>
                            </button>
                            {i > 0 &&
                              <button className="dropdown-item" onClick={this.props.onDeleteView.bind(this, _id)}>
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
      })
    );
  }

  render() {
    let { views, selectedViewIdx } = this.props;
    let { tabsScrollLeft, isShowNewViewDialog, isShowRenameViewDialog } = this.state;
    let selectedGridView = views[selectedViewIdx] || {};
    return (
      <div className="gallery-views-tabs">
        <div className="tabs-scroll-container">
          {tabsScrollLeft > 0 && <div className="tabs-scroll-before"></div>}
          <div className="tabs-scroll" ref={ref => this.viewsTabsScroll = ref} onScroll={this.onTabsScroll}>
            <div className="tabs-content">{this.renderViewsItems()}</div>
          </div>
          {tabsScrollLeft + this.tabsNavWidth < this.tabsNavTotalWidth && <div className="tabs-scroll-after"></div>}
        </div>
        <div className="views-tabs-add-btn" onClick={this.onNewViewToggle}>
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

GalleryViewsTabs.propTypes = propTypes;

export default GalleryViewsTabs;
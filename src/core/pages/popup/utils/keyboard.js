import {
  TAB_DELETE,
  TAB_OPEN,
  TAB_NEXT,
  TAB_PREV,
  TAB_MOVE,
  TAB_REFRESH,
  TAB_PIN,
  URL_COPY,
  TAB_BOOKMARK,
  DUPLICATE_TAB_DELETE,
  MUTE_TOGGLE,
} from 'core/keyboard/constants';
import { compareKbdCommand } from 'core/keyboard/compare';
import {
  deleteTab,
  reloadTab,
  pinTab,
  queryTab,
  muteTab,
} from './browser';
import {
  removeHeadTabListNodeSelectedStyle,
  selectNodeText,
} from './dom';
import {
  d,
  tabList,
  searchInput,
} from '../constants';

// The main keydown handler calls this if one of the above commands
// are pressed
export function navigateResults(kbdCmd, controlMap, showRecentlyClosed) {
  // Should make sure no errors if tablist is empty
  const key = [...controlMap.keys()].find(x => compareKbdCommand(x, kbdCmd));
  const isSearchActive = d.activeElement === searchInput;
  const selectedTab = !isSearchActive
    ? d.activeElement
    : tabList.firstElementChild;
  switch (controlMap.get(key)) {
    case TAB_NEXT: {
      removeHeadTabListNodeSelectedStyle();
      if (isSearchActive) {
        selectedTab.focus();
      } else {
        selectedTab.nextElementSibling.focus();
      }
      break;
    }
    case TAB_PREV: {
      removeHeadTabListNodeSelectedStyle();
      const prevSibling = selectedTab.previousElementSibling;
      if (prevSibling) {
        prevSibling.focus();
      } else {
        searchInput.focus();
      }
      break;
    }
    case TAB_DELETE: {
      if (isSearchActive) {
        break;
      }
      deleteTab(selectedTab, showRecentlyClosed);
      break;
    }
    case TAB_OPEN: {
      selectedTab.click();
      break;
    }
    case TAB_REFRESH: {
      // TODO: visual indicator
      const { id } = selectedTab.dataset;
      reloadTab(id);
      break;
    }
    case TAB_PIN: {
      // TODO: visual pinning indicator
      const { id } = selectedTab.dataset;
      const togglePinStatus = ({ pinned }) => pinTab(id, !pinned);
      queryTab(id).then(togglePinStatus);
      break;
    }
    // browser.tabs.update({ id, pinned = !pinned })
    case URL_COPY: {
      const copyNode = selectedTab.querySelector('.tab-url');
      selectNodeText(copyNode);
      d.execCommand('copy');
      break;
    }
    case TAB_BOOKMARK: {
      // This requires bookmarks permission
      // browser.bookmarks.create()
      // TODO: Add this when the bookmarks branch is merged
      break;
    }
    case DUPLICATE_TAB_DELETE: {
      // Only delete duplicate tabs
      break;
    }
    case MUTE_TOGGLE: {
      // Issue: Successive mutes only works up till it's
      //        pressed twice. After that it doesn't
      //        toggle anymore.
      const { id } = selectedTab.dataset;
      const toggleMuteStatus = ({ audible }) => muteTab(id, audible);
      queryTab(id).then(toggleMuteStatus);
      break;
    }
    // browser.tabs.update({ id, muted })
    case TAB_MOVE:
    // later
    default:
      break;
  }
}

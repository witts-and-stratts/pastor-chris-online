import buildCustomSelect from './custom-select';
import GlobalSearch from './global-search';
import NavMenu from './nav-menu';

// Instantiate select elements on windows load
window.onload = function () {
  // Initialize custom select elements
  var selects = document.querySelectorAll('select');
  selects.forEach(buildCustomSelect);

  const globalSearch = new GlobalSearch({
    elem: document.querySelector('.js-global-search'),
    searchControl: document.querySelector('.js-global-search-control'),
    form: document.querySelector( '.js-global-search-form' ),
    formInput: document.querySelector( '.js-global-search-input' ),
    advancedSearchControl: document.querySelector( '.js-global-search-advanced-control' ),
    advancedSearchDropdown: document.querySelector( '.js-global-search-advanced' ),
    searchResultDropdown: document.querySelector( '.js-global-search-results' ),
    onSearch: ( evt: Event, globalSearch: GlobalSearch ) => {
      evt.preventDefault();
      globalSearch.advancedSearchResults.show();
    },
  } )
  
  const navMenu = new NavMenu( {
    elem: document.querySelector( '.js-global-nav-dropdown' ),
    controlElem: document.querySelector( '.js-global-nav-btn' ),
    closeElem: document.querySelector( '.js-global-nav-menu-close' ),
  });
};

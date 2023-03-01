import gsap from 'gsap';

interface GlobalSearchSettings {
  elem: HTMLElement | Element;
  searchControl?: HTMLElement | Element;
  advancedSearchControl?: HTMLElement | Element;
  advancedSearchDropdown?: HTMLElement | Element;
  searchResultDropdown?: HTMLElement | Element;
  form?: HTMLFormElement | HTMLElement;
  formInput?: HTMLInputElement | HTMLElement;
  onSearch?: (event: Event, $this: GlobalSearch) => void;
}

export default class GlobalSearch {
  private playhead: GSAPTimeline;
  private settings: GlobalSearchSettings;
  public advancedSearch: AdvancedSearch;
  public advancedSearchResults: AdvancedSearchResults;

  private defaultSettings: GlobalSearchSettings = {
    elem: null,
    searchControl: null,
    form: null,
    advancedSearchDropdown: null,
    onSearch: (evt: Event) => {},
  };

  constructor(elemOrOptions: HTMLElement | Element | GlobalSearchSettings) {
    this.settings =
      elemOrOptions instanceof Element || elemOrOptions instanceof HTMLElement
        ? { ...this.defaultSettings, elem: elemOrOptions }
        : { ...this.defaultSettings, ...elemOrOptions };

    const $this = this;
    this.advancedSearch = new AdvancedSearch(
      this.settings.advancedSearchDropdown,
      this.settings.advancedSearchControl
    );
    this.advancedSearchResults = new AdvancedSearchResults(
      this.settings.searchResultDropdown
    );

    this.playhead = gsap.timeline({
      yoyo: true,
      paused: true,
      onStart() {
        window.addEventListener('keydown', $this.escEvent);
        window.addEventListener('click', $this.dismissOnOutsideClick);
      },
      onComplete() {
        $this.settings.formInput.focus();
      },
      onReverseComplete() {
        window.removeEventListener('click', $this.dismissOnOutsideClick);
      },
    });

    this.playhead.fromTo(
      this.settings.elem,
      { autoAlpha: 0, duration: 10, y: '30%' },
      { autoAlpha: 1, y: '0%' }
    );

    // Enable control element
    this.settings.searchControl
      ? this.settings.searchControl.addEventListener(
          'click',
          this.toggle.bind(this)
        )
      : null;

    // Enable processing on form submit
    if (this.settings.form) {
      this.settings.form.addEventListener('submit', (evt) => {
        this.settings.onSearch(evt, this);
      });
    }
  }

  public show() {
    this.playhead.timeScale(1).play();
    window.addEventListener('keydown', this.escEvent);
  }

  public hide() {
    this.playhead.timeScale(2).reverse(0);
    window.removeEventListener('keydown', this.escEvent);
  }

  public toggle() {
    this.playhead.reversed() || this.playhead.paused()
      ? this.show()
      : this.hide();
  }

  // Enables the ability to close the global search by pressing the escape key
  escEvent = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hide();
    }
  };

  // Dismiss the global search on click outside of the search box
  dismissOnOutsideClick = (evt: MouseEvent) => {
    if (!this.settings.elem.contains(evt.target as Node)) {
      this.hide();
    }
  };
}

class AdvancedSearchResults {
  private dropdown: HTMLElement | Element;
  private playhead: GSAPTimeline;

  constructor(dropdown: HTMLElement | Element) {
    this.dropdown = dropdown;

    this.playhead = gsap
      .timeline({ paused: true })
      .fromTo(
        this.dropdown,
        { autoAlpha: 0, height: 0, duration: 0.6 },
        { autoAlpha: 1, height: 'auto', overflow: 'visible' }
      );
  }

  public show() {
    this.playhead.timeScale(1).play();
  }

  public hide() {
    this.playhead.timeScale(2).reverse();
  }
}

class AdvancedSearch {
  private playhead: GSAPTimeline;
  private dropdown: HTMLElement | Element;
  private controlElem: HTMLElement | Element;

  constructor(
    adaptiveSearchDropdown: HTMLElement | Element,
    advancedSearchControl: HTMLElement | Element
  ) {
    this.dropdown = adaptiveSearchDropdown;
    this.controlElem = advancedSearchControl;

    // Dropdown children
    const dropdownChildren = this.dropdown?.querySelectorAll(
      '.global-search__advanced-search__content'
    );

    this.playhead = gsap
      .timeline({ paused: true })
      .set(dropdownChildren, { autoAlpha: 0 })
      .fromTo(
        this.dropdown,
        {
          autoAlpha: 0,
          height: 0,
          duration: 0.6,
        },
        { height: 'auto', autoAlpha: 1, filter: 'drop-shadow(0 30px 30px rgba(0, 0, 128, 0.3))' }
      )
      .fromTo(
        dropdownChildren,
        { autoAlpha: 0, duration: 0.3 },
        { autoAlpha: 1, stagger: 0.1 }
      )
      .set(this.dropdown, { overflow: 'visible' });

    // Enable advanced search control
    this.controlElem
      ? this.controlElem.addEventListener('click', this.toggle.bind(this))
      : null;
  }

  public show() {
    this.playhead.timeScale(1).play();
    this.controlElem?.classList.add('active');
  }

  public hide() {
    this.playhead.timeScale(2).reverse();
    this.controlElem?.classList.remove('active');
  }

  public toggle() {
    if (this.playhead.reversed() || this.playhead.paused()) {
      this.show();
      return;
    }

    this.hide();
  }
}

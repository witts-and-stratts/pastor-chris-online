import gsap from 'gsap';

interface GlobalNavSettings {
  elem: HTMLElement | Element | null;
  controlElem?: HTMLElement | Element | null;
  submenuClass?: string;
  closeElem?: HTMLElement | Element | null;
}

export default class GlobalNav {
  private playhead: GSAPTimeline;
  constructor(public settings: GlobalNavSettings) {
    const $this = this;
    this.playhead = gsap.timeline({
      yoyo: true,
      paused: true,
      onStart() {
        window.addEventListener('keydown', this.escEvent);
        window.addEventListener('click', $this.dismissOnOutsideClick);
      },
      onReverseComplete() {
        window.removeEventListener('click', $this.dismissOnOutsideClick);
      },
    });

    const links = this.settings.elem.querySelectorAll('li');

    this.playhead
      .fromTo(
        // animate menu height
        this.settings.elem,
        {
          autoAlpha: 0,
          height: 0,
        },
        {
          autoAlpha: 1,
          height: 'auto',
        }
      )
      .fromTo(
        // animate links
        links,
        { autoAlpha: 0, y: '30%', rotationX: '45deg' },
        { autoAlpha: 1, y: '0%', rotationX: '0deg', stagger: 0.02 }
      );

    this.settings.controlElem?.addEventListener('click', (evt) => {
      this.toggle();
    });
    this.settings.closeElem?.addEventListener('click', (evt) => {
      this.hide();
    });

    const enableSubmenu = (elem: HTMLElement | Element) => {
      const t1 = gsap.timeline({
        yoyo: true,
        paused: true,
        onStart() {
          elem.classList.add('open');
        },
        onReverseComplete() {
          elem.classList.remove('open');
        },
      });
      const subMenu = elem.querySelector('ul');
      const links = subMenu.querySelectorAll('li');
      t1.set(links, { autoAlpha: 0 });
      t1.fromTo(
        subMenu,
        { autoAlpha: 0, height: 0, duration: 0.2 },
        { autoAlpha: 1, height: 'auto' }
      )
        .to(
          links,
          { autoAlpha: 1, stagger: 0.02, ease: 'power2.inOut' },
          '-=0.6'
        )
        .set(subMenu, { overflow: 'visible' });

      elem.addEventListener('click', (evt) => {
        if ( elem.classList.contains( 'has-submenu' ) ) {
          // Prevent default behavior if the link is empty
          if (
            elem.getAttribute('href') === '#' ||
            elem.getAttribute('href') === ''
          ) {
            evt.preventDefault();
          }
          toggle();
        }
      });

      const toggle = () => {
        t1.paused() || t1.reversed()
          ? t1.timeScale(1).play()
          : t1.timeScale(2).reverse();
      };
    };

    // Enable submenus
    const submenus = this.settings.elem?.querySelectorAll(
      '.' + this.settings.submenuClass.trim()
    );
    submenus.forEach((elem) => {
      enableSubmenu(elem);
    });
  }

  // Dismiss the global search on click outside of the search box
  dismissOnOutsideClick = (evt: MouseEvent) => {
    if (!this.settings.elem.contains(evt.target as Node)) {
      this.hide();
    }
  };

  // Enables the ability to close the global search by pressing the escape key
  escEvent = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hide();
    }
  };

  show() {
    this.settings.controlElem?.classList.add('open');
    this.playhead.timeScale(1).play();
    window.addEventListener('keydown', this.escEvent);
  }

  hide() {
    this.playhead.timeScale(2).reverse();
    this.settings.controlElem?.classList.remove('open');
    window.removeEventListener('keydown', this.escEvent);
  }

  toggle() {
    this.playhead.paused() || this.playhead.reversed()
      ? this.show()
      : this.hide();
  }
}

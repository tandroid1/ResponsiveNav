/**
 * Created by tannerlangley on 10/27/14.
 */

;!function ($, e3, window, document, undefined) {

  "use strict";

  e3.ResponsiveNav = function(options) {

    /**
     * Element to trigger menu toggle.
     * @type {string || object}
     */
    this.trigger = options.trigger;

    /**
     * Container for collapsible menu. This should be a wrapper
     * around an unordered list.
     * @type {string || object}
     */
    this.navContainer = options.navContainer;

    /**
     * Transition duration
     * @type {number}
     */
    this.transition = options.transition || 250;

    /**
     * Min-width where the nav should no longer collapse
     * @type {number}
     */
    this.breakpoint = options.breakpoint || 720;

    /**
     * Is there a sub level navigation?
     * @type {boolean}
     */
    this.hasSubnav = options.hasSubnav || false;

    /**
     * Decides if the subnav should be expanded by default.
     */
    this.subnavExpanded = options.subnavExpanded || false;

    /**
     * Specifies any additional vertical spacing to add when menu is expanded.
     */
    this.verticalPadding = options.verticalPadding || 0;

    /**
     * Specifies if the window should scroll to the top of the expanded nav.
     * @type {Window.scrollTo|boolean}
     */
    this.scrollTo = options.scrollTo || false;

    this.scrollOffset = options.scrollOffset || 0;

    this.autoCollapse = options.autoCollapse || true;

    /**
     * Determines if ResponsiveNav is initialized.
     * @type {boolean}
     */
    this.isIntialized = false;

    this.isMobile = false;

    // Make navContainer a jQuery object if it isn't already.
    this.$navContainer = isObj(this.navContainer) ? this.navContainer : $(this.navContainer);

    // Make trigger a jQuery object if it isn't already.
    this.$trigger = isObj(this.trigger) ? this.trigger : $(this.trigger);

    // The unordered list in topmost level.
    if (this.$navContainer.is("ul")) {
      this.topLevelNav = this.$navContainer;
    } else {
      this.topLevelNav = this.$navContainer.find('ul').not('.contextual-links').first();
    }

    // CSS class name of the element that will trigger the toggling of the sub nav.
    this.subNavTriggerClass = options.subNavTriggerClass || 'subnav-trigger';

    /**
     * Determine where the window should scroll to if the option is set.
     * @type {scrollTarget|*|string|Object}
     */
    this.scrollTarget = options.scrollTarget || null;

    switch (this.scrollTarget) {
      case null:
        this.scrollTarget = this.$trigger;
        break;

      case 'navContainer':
        this.scrollTarget = this.$navContainer;
        break;

      case 'trigger':
        this.scrollTarget = this.$trigger;
        break;

      default:
        this.scrollTarget = $(options.scrollTarget);
        break;
    }

    /**
     * The height of the top level navigation. This
     * shouldn't change over the lifetime of the script
     * so it's safe to declare it globally and then initialize
     * it on the first menu open.
     * @type {number}
     */
    this.topLevelNavHeight = 0;

    // Store the context of this object globally so it can
    // be accessed within child methods.
    var that = this;

    this.init = function () {

      if (that.hasSubnav) {

        // All unordered lists within the top level nav.
        that.subLevelNav = that.topLevelNav.find('ul');
      }

      that.$navContainer.addClass('responsive-nav');

      // Bind click handler
      that.$trigger.click(function (e) {
        e.preventDefault();

        $(this).toggleClass('active');

        that.handleClick(that.$navContainer);

      });

      // add Subnav stuff
      if (that.hasSubnav && !that.subnavExpanded) {

        if (!that.subNavTrigger) {
          that.addSubNavTrigger();
        }

        that.subNavTrigger.click(function () {
          if (that.isMobile) {
            that.handleClick($(this).next('ul'), true);
          }
        });
      }

      this.initDestroyOnResize();
      that.isIntialized = true;
    };

    /**
     * Adds the trigger for the sub nav toggle and adds it as a global jquery object.
     */
    this.addSubNavTrigger = function() {
      that.topLevelNav.find('ul').before('<span class="' + that.subNavTriggerClass + '"></span>');
      that.subNavTrigger = that.topLevelNav.find('.' + that.subNavTriggerClass);
    };

    /**
     *
     * @param target - clicked element passed as jQuery Object
     * @param isSubnav - boolean
     */
    this.handleClick = function (target, isSubnav) {
      var subnav = isSubnav || false;

      if (!target.hasClass('open')) {
        that.openMenu(target, subnav);
        if (that.scrollTo && !subnav) {
          that.scrollToMenu();
        }
      } else {
        that.closeMenu(target, subnav);
      }
    };

    /**
     * Opens main or sub menu
     * @param targetEl - element to open
     * @param isSubnav - is this the subnav
     */
    this.openMenu = function (targetEl, isSubnav) {
      var menuHeight;

      targetEl.addClass('open');
      targetEl.parent().addClass('openSub');

      if (isSubnav) {
        menuHeight = that.getNavHeight(targetEl);

        if (that.autoCollapse) {
          // Close other sub menus
          var currentIndex = targetEl.parent().index();

          that.topLevelNav.find('ul').each(function() {                                
            if ($(this).parent().index() != currentIndex) {
              that.closeMenu($(this), true);            
            }
          });
        }
      } else {
        // Get the height of the main menu.
        menuHeight = that.getNavHeight(that.topLevelNav);

        // add any extra spacing.
        menuHeight += that.verticalPadding;

        // Store the value globally.
        that.topLevelNavHeight = menuHeight;  
      }

      if (that.hasSubnav && that.subnavExpanded) {
        that.topLevelNav.find('ul').each(function () {
          var subHeight;
          subHeight = that.getNavHeight($(this));
          menuHeight += subHeight;

          setHeight($(this), subHeight);
        });
      }

      //Expand the target menu.
      setHeight(targetEl, menuHeight);

      // Expand the parent nav to make space for sub.
      if (isSubnav) {
        addHeight(that.$navContainer, menuHeight);
      }
    };

    /**
     * Closes main or sub menu
     * @param targetEl - element to close
     * @param isSubnav - is this the subnav
     */
    this.closeMenu = function (targetEl, isSubnav) {
      var targetHeight;

      targetEl.removeClass('open');
      targetEl.parent().removeClass('openSub');
      targetHeight = (targetEl.height() + getMargins(targetEl));

      targetEl.css({
        'min-height': 0,
        'max-height': 0
      });

      if (isSubnav) {
        that.$navContainer.css({
          'min-height': "-=" + targetHeight,
          'max-height': "-=" + targetHeight
        });
      }

      if (that.hasSubnav && that.subnavExpanded) {
        that.topLevelNav.find('ul').each(function () {
          var subHeight,
              menuItems;

          menuItems = $(this).find('li');

          setHeight($(this), 0);
        });
      }
    };

    this.scrollToMenu = function() {
      var top = that.scrollTarget.offset().top - that.scrollOffset;
      $("html, body").animate({scrollTop: top}, '300', 'swing');
    };

    this.getNavHeight = function(targetEl) {
      var height = 0;

      targetEl.children('li').each(function() {
        height = height + $(this).outerHeight();
      });

      return height;
    };

    /**
     * Initializes or destroys ResponsiveNav based on breakpoint.
     */
    this.initDestroyOnResize = function () {
      $(window).resize(function () {
        that.handleResize($(this).width());
      });
    };

    /**
     * Handles any functionality tied to resizing the browser.
     * @param width {number} The width of the window.
     */
    this.handleResize = function (width) {
      if (width <= that.breakpoint) {
        that.isMobile = true;
        if (!that.isIntialized) {

          that.init();
        } else {
          that.create();
        }
      } else {
        that.isMobile = false;
        if (that.isIntialized) {
          that.destroy();
        }
      }
    };

    /**
     * Adds the necessary things to make ResponsiveNav work.
     */
    this.create = function () {
      that.$navContainer.addClass('responsive-nav');
    };

    /**
     * Removes any ResponsiveNav specific styling.
     */
    this.destroy = function (){

      that.$navContainer.css({
        'min-height': '',
        'max-height': ''
      });

      that.$navContainer.removeClass('responsive-nav');

      that.$navContainer.removeClass('open');

      if (that.hasSubnav) {
        that.subLevelNav.css({
          'min-height': '',
          'max-height': ''
        });

        that.subLevelNav.removeClass('open');
      }

    };

    if ($(window).width() <= this.breakpoint) {
      that.isMobile = true;
      this.init();
    } else {
      this.addSubNavTrigger();

      this.initDestroyOnResize();
    }
  };

  /**
   * Get the total top and bottom margin size of the passed in element.
   * @param el
   * @returns {number}
   */
  function getMargins(el) {
    var top, bottom, total;
    top = parseInt(el.css('marginTop').replace('px', ''));
    bottom = parseInt(el.css('marginBottom').replace('px', ''));
    total = top + bottom;

    return total;
  }

  function setHeight(el, height) {
    el.css({
      'min-height': height,
      'max-height': height
    });
  }

  function addHeight(el, height) {
    el.css({
      'min-height': "+=" + height,
      'max-height': "+=" + height
    });
  }


  /**
   * helper function to check if variable is an object.
   * @param variable
   * @returns {boolean}
   */
  function isObj(variable) {
    return variable !== null && typeof variable === 'object';
  }

  // Public method to open menu.
  e3.ResponsiveNav.prototype.open = function() {
    this.openMenu();
  };

  // Public method to close menu.
  e3.ResponsiveNav.prototype.close = function() {
    this.closeMenu();
  };
}(jQuery, e3, this, this.document);
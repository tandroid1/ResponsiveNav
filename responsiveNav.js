/**
 * Created by tannerlangley.
 */

!function ($) {

  "use strict";

  $.fn.responsiveNav = function(options) {

    // Default settings
    var settings = $.extend({
      transition: 250,
      breakpoint: 720,
      hasSubnav: false,
      subnavExpanded: false,
      autoCollapse: true,
      verticalPadding: 0,
      scrollTo: false,
      scrollOffset: 0,
      scrollTarget: null,
      subNavTriggerClass: 'subnav-trigger',
      addSection: ''
    }, options);

    // Initialize all local variables
    var base = this,
      isInitialized = false,
      isMobile = false,
      $trigger = '',
      $topLevelNav = '',
      $subLevelNav = '',
      $subNavTrigger = '',
      topLevelNavHeight = '',
      $additionalSections = '',
      $scrollTarget = '';

    var addedSections = settings.addSection.length > 0;

    if (!settings.hasOwnProperty('trigger')) {

      // create a default trigger.
      settings.trigger = $('<a href="#" id="default-trigger">Menu</a>');

      this.before(settings.trigger);
    }

    // Make the trigger a jQuery object if it isn't already.
    $trigger = isObj(settings.trigger) ? settings.trigger : $(settings.trigger);

    // The unordered list in topmost level.
    if (base.is("ul")) {
      $topLevelNav = base;
    } else {
      $topLevelNav = base.find('ul').not('.contextual-links').first();
    }

    switch (settings.scrollTarget) {
      case null:
        $scrollTarget = $trigger;
        break;

      case 'navTop':
        $scrollTarget = base;
        break;

      case 'trigger':
        $scrollTarget = $trigger;
        break;

      default:
        $scrollTarget = $(settings.scrollTarget);
        break;
    }

    this.init = function () {
      if (settings.hasSubnav) {

        // All unordered lists within the top level nav.
        $subLevelNav = $topLevelNav.find('ul');
      }

      base.addClass('responsive-nav');

      if (addedSections) {
        $(settings.addSection).each(function() {
          $(this).wrap('<div class="added-section" />');
        });

        $additionalSections = $('.added-section');
      }


      // Bind click handler
      $trigger.click(function (e) {
        e.preventDefault();

        $(this).toggleClass('active');

        handleClick(base);
      });

      // add Subnav stuff
      if (settings.hasSubnav && !settings.subnavExpanded) {

        if (!$subNavTrigger) {
          addSubNavTrigger();
        }

        $subNavTrigger.click(function () {
          if (isMobile) {
            handleClick($(this).next('ul'), true);
          }
        });
      }

      initDestroyOnResize();
      isInitialized = true;
    };


    /****************************
     Public Methods
     *****************************/

    /**
     * Opens main or sub menu
     * @param targetEl - element to open
     * @param isSubnav - is this the subnav
     */
    this.openMenu = function(targetEl, isSubnav) {
      var menuHeight;

      targetEl.addClass('open');
      targetEl.parent().addClass('openSub');

      if (isSubnav) {
        menuHeight = getNavHeight(targetEl);

        if (settings.autoCollapse) {
          // Close other sub menus
          var currentIndex = targetEl.parent().index();

          $topLevelNav.find('ul').each(function() {
            if ($(this).parent().index() != currentIndex) {
              base.closeMenu($(this), true);
            }
          });
        }

      } else {
        // Get the height of the main menu.
        menuHeight = getNavHeight($topLevelNav);

        // add any extra spacing.
        menuHeight += settings.verticalPadding;

        // Store the value globally.
        topLevelNavHeight = menuHeight;
      }

      if (settings.hasSubnav && settings.subnavExpanded) {
        $topLevelNav.find('ul').each(function () {
          var subHeight;
          subHeight = getNavHeight($(this));
          menuHeight += subHeight;

          setHeight($(this), subHeight);
        });
      }

      if (addedSections && !isSubnav) {
        $additionalSections.each(function() {
          setHeight($(this), $(this).children().outerHeight());
        });
      }

      //Expand the target menu.
      setHeight(targetEl, menuHeight);

      // Expand the parent nav to make space for sub.
      if (isSubnav) {
        addHeight(base, menuHeight);
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

      setHeight(targetEl, 0);

      if (isSubnav) {
        removeHeight(base, targetHeight);
      }

      if (settings.hasSubnav && settings.subnavExpanded) {
        $topLevelNav.find('ul').each(function () {
          var subHeight,
            menuItems;

          menuItems = $(this).find('li');

          setHeight($(this), 0);
        });
      }

      if (addedSections && !isSubnav) {
        $additionalSections.each(function() {
          setHeight($(this), 0);
        });
      }

    };

    this.scrollToMenu = function() {
      var top = $scrollTarget.offset().top - settings.scrollOffset;
      $("html, body").animate({scrollTop: top}, '300', 'swing');
    };


    /****************************
     Private Functions
     *****************************/

    /**
     * Initializes or destroys ResponsiveNav based on breakpoint.
     */
    function initDestroyOnResize() {
      $(window).resize(function () {
        handleResize($(this).width());
      });
    }

    /**
     * Handles any functionality tied to resizing the browser.
     * @param width {number} The width of the window.
     */
    function handleResize(width) {
      if (width <= settings.breakpoint) {
        isMobile = true;
        if (!isInitialized) {

          base.init();
        } else {
          create();
        }
      } else {
        isMobile = false;
        if (isInitialized) {
          destroy();
        }
      }
    }

    /**
     * Adds the necessary things to make ResponsiveNav work.
     */
    function create() {
      base.addClass('responsive-nav');

      if (addedSections) {
        $additionalSections.each(function() {
          $(this).addClass('added-section');
        });
      }
    }

    /**
     * Removes any ResponsiveNav specific styling.
     */
    function destroy(){
      setHeight(base, '');

      base.removeClass('responsive-nav');
      base.removeClass('open');
      $trigger.removeClass('active');


      if (settings.hasSubnav) {
        setHeight($subLevelNav, '');
        $subLevelNav.removeClass('open');
      }

      if (addedSections) {
        $additionalSections.each(function() {
          $(this).removeClass('added-section');
        });
      }

    }


    /**
     * Adds the trigger for the sub nav toggle and adds it as a global jquery object.
     */
    function addSubNavTrigger() {
      $topLevelNav.find('ul').before('<span class="' + settings.subNavTriggerClass + '"></span>');
      $subNavTrigger = $topLevelNav.find('.' + settings.subNavTriggerClass);
    }

    /**
     * Handles click event logic.
     * @param target - clicked element passed as jQuery Object
     * @param isSubnav - boolean
     */
    function handleClick(target, isSubnav) {
      var subnav = isSubnav || false;

      if (!target.hasClass('open')) {
        base.openMenu(target, subnav);
        if (settings.scrollTo && !subnav) {
          base.scrollToMenu();
        }
      } else {
        base.closeMenu(target, subnav);
      }
    }

    function getNavHeight(targetEl) {
      var height = 0;

      targetEl.children('li').each(function() {
        height = height + $(this).outerHeight();
      });

      return height;
    }

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
        'minHeight': height,
        'maxHeight': height
      });
    }

    function addHeight(el, height) {
      el.css({
        'minHeight': "+=" + height,
        'maxHeight': "+=" + height
      });
    }

    function removeHeight(el, height) {
      el.css({
        'minHeight': "-=" + height,
        'maxHeight': "-=" + height
      });
    }

    /****************************
     Utility Functions
     *****************************/

    /**
     * helper function to check if variable is an object.
     * @param variable
     * @returns {boolean}
     */
    function isObj(variable) {
      return variable !== null && typeof variable === 'object';
    }

    /****************************
     Start
     *****************************/

    if ($(window).width() <= settings.breakpoint) {
      isMobile = true;
      this.init();
    } else {
      addSubNavTrigger();
      initDestroyOnResize();
    }
    return this;
  };
}(jQuery);
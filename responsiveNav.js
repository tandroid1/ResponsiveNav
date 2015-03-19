/**
 * ResponsiveNav jQuery plugin.
 */

!function ($) {

  "use strict";

  $.fn.responsiveNav = function(options) {

    // Default settings
    var settings = $.extend({
      transition: 250,
      breakpoint: 720,
      responsive: true,
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
    $additionalSections = getSections(); 

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
        wrapSections();
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
      var menuHeight,
        lastSubHeight = 0;

      targetEl.addClass('open');
      targetEl.parent().addClass('openSub');

      if (isSubnav) {
        menuHeight = getNavHeight(targetEl);

        if (settings.autoCollapse) {
          // Close other sub menus
          var currentIndex = targetEl.parent().index();

          $topLevelNav.find('ul').each(function() {
            if ($(this).parent().index() != currentIndex && $(this).height() > 0) {
              lastSubHeight = $(this).height();

              simpleClose($(this));
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
        var currentHeight = base.height();
        setHeight(base, currentHeight + menuHeight - lastSubHeight);
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
      targetHeight = (targetEl.outerHeight());
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

    /**
     * Adds the necessary things to make ResponsiveNav work.
     */
    this.create = function() {
      base.addClass('responsive-nav');
      $additionalSections.each(function() {
        $(this).addClass('added-section');
      });
    }

    /**
     * Removes any ResponsiveNav specific styling.
     */
    this.destroy = function(){
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
          setHeight($(this), '');
          $(this).removeClass('added-section')
        });
      }

    }


    /****************************
     Private Functions
     *****************************/

    /**
     * Wrap all added sections with a div.
     */
    function wrapSections() {
      $(settings.addSection).each(function() {
        $(this).wrap('<div class="responsive-nav-section added-section" />');
      });

      $additionalSections = $('.added-section');
    }

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
          base.create();
        }
      } else {
        isMobile = false;
        if (isInitialized) {
          base.destroy();
        }
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

    /**
     * A very stripped down version of the close method.
     * @param el
     */
    function simpleClose(el) {

      el.removeClass('open');
      el.parent().removeClass('openSub');
      setHeight(el, 0);
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

    function getSections() {
      if ($.isArray(settings.addSection)) {
        var $selection = $(settings.addSection[0]);
        
        $.each(settings.addSection, function(i, val) {
          if (i > 0) {
            $selection = $selection.add(val);      
          }
        });

        return $selection;
      } else {
         return $(settings.addSection);
      }
    }

    /****************************
     Start
     *****************************/

    this.init();

    if ($(window).width() <= settings.breakpoint) {
      isMobile = true;
    } else {
      addSubNavTrigger();
      if (settings.responsive) {
        initDestroyOnResize();
      }
    }
    return this;
  };
}(jQuery);

ResponsiveNav
=============

## Basic Usage

You will first need to download the Javascript And CSS files in this repository and include them in your project.

```html
<a href="#" id="primary-nav-trigger">Menu</a>
<nav id="primary-nav">
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>
      Item 3
      <ul>
        <li>Sub Item 1</li>
        <li>Sub Item 1</li>
        <li>Sub Item 1</li>
      </ul>
    </li>
    <li>Item 4</li>
  </ul>
</nav>
```
```javascript
$("#primary-nav").responsiveNav({
  trigger: '#primary-nav-trigger'
});
```
Currently, the only required option is `trigger`, but you'll likely want to configure some of the options. 
```javascript
$("#primary-nav").responsiveNav({
  trigger: '#primary-nav-trigger',
  breakpoint: 720,
  hasSubnav: true,
  subNavTriggerClass: 'subNavTrigger',
  addSection: '.social-buttons'
});
```

## Options

- `trigger` - Element to trigger the menu open/close. This can be a css selector or a a jQuery object. This option is required.
- `navContainer` - Container for collapsible menu. This can be a wrapper around an unordered list or the unordered list itself in the form of a css selector or jQuery object.
- `transition` - The duration of the open/close transition in milliseconds. Default: `250`.
- `breakpoint` - Min-width where the nav should no longer collapse. Default: `720`.
- `hasSubnav` - Determines if there is a sub-level navigation. Default: `false`.
- `subNavTriggerClass` - Specify a class for the sub-nav trigger. Default `subnav-trigger`.
- `autoCollapse` - If true, all sub-navs will be closed when a new one is opened. Default: `true`.
- `subnavExpanded` - Determines if the sub-level navigation should be expanded when the top level trigger is clicked. Default: `false`.
- `addSection` - Add an additional html element to open/close when the main trigger is clicked. Argument should be a string in the form of a css selector.
- `verticalPadding` - Adds extra spacing to the bottom of the nav. Default: `0`.
- `scrollTo` - Specifies if the window should scroll to the top of the expanded navigation. Default: `false`.
- `scrollTarget` - Determines where the window should scroll to if the `scrollTo` option is set. The argument can be a jQuery object, `"trigger"` or `"navContainer"`. Default: `"trigger"`.
- `scrollOffset` - Specifies an offset from the top of the scrolled to element. Default: `0`.



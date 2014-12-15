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
new e3.ResponsiveNav({
  navContainer: '#primary-nav',
  trigger: '#primary-nav-trigger',
  breakpoint: 720,
  hasSubnav: true,
  subNavTriggerClass: 'subNavTrigger' // this will get added to your markup.
});
```



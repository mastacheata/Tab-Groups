p1
- state persistence
- remove index & window id from nested tabs
- content in sidebar
  - create new group
  - toggle groups
  - hover styles
  - tab close button
  - style for active tab
  - tab search
  - images (favicon)
  - fade for overflow
  - status indication
    - audio playing, muted
    - pinned
    - loading
- options
  - base styling
  - storage (sync?)
  - add reload
  - toggles
    - theme
    - features
      - search
      - sync
- testing for suspend and replace
- handling if store is not defined on launch
- action
  - 2nd screen for open tabs
  - scrollable
  - tab search
- find in tabs
  - https://github.com/mdn/webextensions-examples/tree/master/find-across-tabs
- fix ellipsis color in sidebar or use fade
- clean up console warnings
- clear out repo
- setup browser with old version for comparison
- determine min version
- publish

p2
- tab groups page
  - implement 1 layout
- update tests for new state schema
- drag and drop
  - groups in sidebar
  - between windows
- sidebar
  - bubbling audio indicator
  - pinned tabs
  - toggle styles
    - background color
    - big vs little icons
- open main tab groups page with hotkey
- context menus

p3
- common css rules
- save settings and tabs to sync
  - synced groups
  - determine what current sync format is, can leverage for shared structure?
- styling
  - http://design.firefox.com/photon/visuals/color.html
  - pull css styles into shared file
  - toggle dark and light theme
- localization
  - https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Internationalization
  - investigate cleaner way to map localizations in components
- light and dark themes for actions

p4
- VueJS unit testing
  - https://vuejs.org/v2/guide/unit-testing.html
- documentation
- test rollup & typescript integration
  - https://vuejs.org/v2/guide/typescript.html
- chrome testing
  - shared data?
- animations
- is bookmark folder option possible?
- investigate plugin for vscode debugging
- investigate placeholder thumbnails on mobile new tab page
- 3rd party api documentation

p5
- performance testing
- interaction with containers

other
- investigate weh
  - https://github.com/mi-g/weh
  - should use standard form spec for preferences

p1
- checkout mozilla irc
- remove index & window id from nested tabs of state
- copy `is_open` from existing data if available
- content in sidebar
  - create new group [hover]
  - toggle groups
  - images (favicon)
  - status indication
    - audio playing, muted
    - pinned
    - loading
- options
  - base styling
  - toggles
    - features
      - search
      - sync
- testing for suspend and replace
- action
  - 2nd screen for open tabs
  - 2nd screen for config
    - rename group
  - scrollable
  - tab search
- find in tabs
  - https://github.com/mdn/webextensions-examples/tree/master/find-across-tabs
- fix ellipsis color in sidebar or use fade
- clean up console warnings
- clear out repo
- review @todos
- context menu for move tab
- determine min version
- publish
  - fix id

p2
- tab groups page
  - implement 1 layout
- load/save backup
- update tests for new state schema
- drag and drop
  - groups in sidebar
  - between windows
- sidebar
  - bubbling audio indicator
  - pinned tabs
  - tab search clear
  - tab close button
  - fade for overflow
  - ui style for suspended tabs
  - toggle styles
    - big vs little icons
- open main tab groups page with hotkey
- context menus

p3
- common css rules
- save settings and tabs to sync
  - synced groups
  - options
  - determine what current sync format is, can leverage for shared structure?
- styling
  - http://design.firefox.com/photon/visuals/color.html
  - pull css styles into shared file
- localization
  - https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Internationalization
  - investigate cleaner way to map localizations in components
- light and dark themes for actions
- filter for playing audio

p4
- VueJS unit testing
  - https://vuejs.org/v2/guide/unit-testing.html
- integration tests
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
  - virtual scroll
- interaction with containers

other
- investigate weh
  - https://github.com/mi-g/weh
  - should use standard form spec for preferences

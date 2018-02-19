# Tab Groups

This is a work in progress to port some basic functionality from tab groups to web-extensions

- https://github.com/dangvanthanh/vue-rollup-boilerplate
- https://addons.mozilla.org/en-US/firefox/addon/tab-center-redux/
- http://design.firefox.com/photon/welcome.html

# Building
```
npm run build
```

# Install Instructions

This is not ready for public consumption, but if you're curious you can load in firefox on linux/mac (`build.sh` in the root dir could be ported to windows bat file if you're interested).

1. Install node.js for your platform
2. `npm run build`
3. Load [about:debugging](about:debugging) in Firefox and click "Load Temporary Add-on".  Open `dist/manifest.json`.

Will add a new "Tab Group" sidebar.  It should open when you load.

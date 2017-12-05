# Tab Groups

This is a work in progress to port some basic functionality from tab groups to web-extensions

- https://github.com/dangvanthanh/vue-rollup-boilerplate
- https://addons.mozilla.org/en-US/firefox/addon/tab-center-redux/
- http://design.firefox.com/photon/welcome.html

# Building
- remove entries with `typeof isCrushed.name === 'string'` from redux library (the reference to undefined NODE_ENV hangs the application).

```
npm run build
```

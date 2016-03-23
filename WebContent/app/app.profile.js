/**
 * filename: app.profile.js
 * 功能: dojo toolkit 的配置
 */
var dojoConfig = {
  async: false,
  packages: [
  { location: '/dojotoolkit/dojo', name: 'dojo' },
  { location: '/dojotoolkit/dijit', name: 'dijit' },
  { location: '/dojotoolkit/dojox', name: 'dojox' },
  { location: '/dojotoolkit/dojoz', name: 'dojoz' },
  { location: '/dojotoolkit/app', name: 'app' }],
  cacheBust: false
};

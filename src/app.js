import Vue from 'vue';
import GalleryViewer from './gallery_viewer.vue';
import GalleryDashboard from './gallery_dashboard.vue';

/*
  prevents warnings about loading the wrong resource.
  if on homepage serve gallery, else feel free to server dashboard.
  if user adds 'dashboard' to url, no harm, just throws warning in console.
*/
if(location.pathname.indexOf('/dashboard') === -1) {
  new Vue({
    el: '#gallery-container',
    render(createElement) {
      return createElement(GalleryViewer);
    },
  });
} else {
  new Vue({
    el: '#dashboard-container',
    render(createElement) {
      return createElement(GalleryDashboard);
    },
  });
}

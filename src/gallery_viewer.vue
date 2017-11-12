<template>
  <div class="container">
    <div id="slideshow" class="dragslider">
      <section class="img-dragger img-dragger-large dragdealer">
        <div class="handle">
          <div v-for='pieceOfArt in gallery' :key='pieceOfArt.id' class="slide" data-content='content' >
            <div class="img-wrap"><img :src="'https://s3-us-west-2.amazonaws.com/alessa/' + pieceOfArt.link" :alt="pieceOfArt.link"/></div>
            <h2>{{ pieceOfArt.header }} <span>{{ pieceOfArt.subHeader }}</span></h2>
            <button class="content-switch">Info</button>
          </div>
        </div>
      </section>
      <!-- Content section -->
      <section class="pages">
        <div class="content" data-content='content'>
          <div class="contact-container">
            <h2>Instagram <span><a href="https://www.instagram.com/alessateresa"/>{{ info.instaSubHead }}</a></span></h2>
            <div id="instafeed"></div>
          </div>
          <div class="contact-container">
            <h2>About <span>{{ info.aboutSubHead }}</span></h2>
            {{ info.about }}
          </div>
          <div class="contact-container">
            <h2>Contact <span>{{ info.contactSubHead }}</span></h2>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import Instafeed from 'instafeed.js';

  export default {
    name: 'GalleryViewer',
    data: () => ({
      info: {},
      gallery: [],
    }),
    beforeMount() {
      axios.all([
        axios.get('/api/info'),
        axios.get('/api/gallery'),
      ]).then(([{ data: infoData }, { data: galleryData }]) => {
        this.info = infoData.info;
        this.gallery = galleryData.gallery;
      });
    },
    mounted() {
      var docFrag = document.createDocumentFragment();

      var dragDealer = document.createElement('script');
      dragDealer.type = 'text/javascript';
      dragDealer.async = true;
      dragDealer.src = '/assets/js/dragdealer.js';
      var classie = document.createElement('script');
      classie.type = 'text/javascript';
      classie.async = true;
      classie.src = '/assets/js/classie.js';
      var dragSlideshow = document.createElement('script');
      dragSlideshow.type = 'text/javascript';
      dragSlideshow.async = true;
      dragSlideshow.src = '/assets/js/dragslideshow.js';
      var runSlideshow = document.createElement('script');
      runSlideshow.type = 'text/javascript';
      runSlideshow.async = true;
      runSlideshow.src = '/assets/js/runSlideshow.js';

      docFrag.appendChild(dragDealer);
      docFrag.appendChild(classie);
      docFrag.appendChild(dragSlideshow);
      docFrag.appendChild(runSlideshow)

      var scriptSection = document.getElementsByTagName('script')[0];

      scriptSection.parentNode.insertBefore(docFrag, scriptSection);

      var userFeed = new Instafeed({
        get: 'user',
        userId: '1617354276',
        accessToken: '1551907548.cf0061c.0953c45c4f2149b6b870036f187e5abd',
        limit: 20,
        resolution: 'standard_resolution',
        sortBy: 'most-liked',
        template: '<a href="{{link}}" target="_blank"><img src="{{image}}" alt="{{caption}}" /></a>'
      });
      userFeed.run();
    },
  };
</script>

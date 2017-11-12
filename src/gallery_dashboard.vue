<template>
  <div class="container">
    <div class="row gallery_viewer">
        <Gallery-List :gallery='gallery' :onGalleryRemove='onArtPieceRemoved' :onGalleryUpdate='onArtPieceUpdated' :onGalleryShift='onUpdateArtPieceOrder' :onSaveArtPos='onGallerySaveArtPieceOrder' ></Gallery-List>
    </div>
    <div class="row add-form-container">
        <Gallery-Add-Form image-src="" :onAddArt="onArtPieceAdded"></Gallery-Add-Form>
    </div>
    <div class="row info-form-container">
        <Info-Update-Form :info='info' :onInfoUpdate='onInfoUpdated'></Info-Update-Form>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import GalleryList from './gallery_list.vue';
  import GalleryAddForm from './gallery_add_form.vue';
  import InfoUpdateForm from './info_form.vue';

  export default {
    name: 'GalleryDashboard',
    data: () => ({
      user: {
        scopes: [],
      },
      gallery: [],
      info: {},
    }),
    beforeMount() {
      axios.all([
        axios.get('/api/me'),
        axios.get('/api/gallery'),
        axios.get('/api/info'),
      ]).then(([{ data: meData }, { data: galleryData }, { data: personalInfo }]) => {
        this.user = meData.user;
        this.gallery = galleryData.gallery;
        this.info =  personalInfo.info;
      });
    },
    methods: {
      onArtPieceAdded(imageFile) {
        let filename = imageFile.name;
        let filetype = imageFile.type;

        axios.get('/api/gallery/aws', {
          params: {
            filename: filename,
            filetype: filetype
          }
        }).then(function (result) {
          var signedUrl = result.data.signedUrl;

          var options = {
            headers: {
              'Content-Type': imageFile.type
            }
          };

          return axios.put(signedUrl, imageFile, options);
        }).then((result) => {
          var name = result.config.data.name;
          axios.post('/api/gallery/add', { name })
            .then(({ data }) => {
              this.gallery = this.gallery.concat(data.newArt);
            });
        }).catch(function (err) {
          console.log(err);
        });
      },
      onArtPieceRemoved(id) {
        let deleteUrl = "/api/gallery/" + id;
        axios.delete(deleteUrl)
          .then(() => {
            this.gallery = this.gallery.filter(e => e.id !== id);
          });
      },
      onArtPieceUpdated(id, head, subHead) {
        axios.post('/api/gallery/update', { id, head, subHead});
      },
      onInfoUpdated(instaSubHead, aboutSubHead, contactSubHead, about, name) {
        axios.post('/api/info', { instaSubHead, aboutSubHead, contactSubHead, about, name });
      },
      onUpdateArtPieceOrder(newGallery) {
        this.gallery = newGallery;
      },
      onGallerySaveArtPieceOrder() {
        var galleryIds = [];
        for(var i = 0; i < this.gallery.length; i++) {
          galleryIds.push(this.gallery[i].id);
        }
      }
    },
    components: {
      GalleryList,
      GalleryAddForm,
      InfoUpdateForm
    },
  };
</script>

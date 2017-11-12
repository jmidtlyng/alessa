<style>
  .gallery-list {
    text-align: center;
  }
  .pieceOfArt {
    padding: 8px;
    box-shadow: 0 0 8px rgba(0,0,0,0.5);
    margin: 5px;
    display: inline-block;
    transition: all 0.4s;
    -webkit-transition: all 0.4s;
  }
  .pieceOfArt:focus {
    box-shadow: 0 0 8px rgba(50,205,50,0.5);
  }
  .previewImg {
    max-width: 200px;
    display: block;
    margin: auto;
  }
  .pieceOfArt .art-sub-header {
    min-width: 300px;
  }
  .remove-btn {
    margin: 6px 16px 6px 0;
    background-color: red;
  }
</style>

<template>
  <div class="gallery-list">
    <h1>Edit the gallery</h1>
    <button v-if="saveGalleryPosBtn" v-on:click="onSaveGalleryPositions">Save New Positions</button>
    <draggable v-model="galleryDraggable" @start="drag=true" @end="drag=false">
      <div class="pieceOfArt" v-for='pieceOfArt in galleryDraggable' :key='pieceOfArt.id'>
        <label>Image header</label>
        <br/>
        <input type="text" class="art-header" v-model="pieceOfArt.header"/>
        <br/>
        <label>Image sub-header</label>
        <br/>
        <input type="text" class="art-sub-header" v-model="pieceOfArt.subHeader"/>
        <br/>
        <button v-on:click='onUpdateClicked(pieceOfArt.id, pieceOfArt.header, pieceOfArt.subHeader)' class="update-btn">Update</button>
        <button v-on:click='onRemoveClicked(pieceOfArt.id)' class="remove-btn">Remove</button>
        <img :src="'https://s3-us-west-2.amazonaws.com/alessa/' + pieceOfArt.link" class="previewImg">
      </div>
    </draggable>
  </div>
</template>

<script>
  import draggable from 'vuedraggable';

  export default {
    props: {
      gallery: {
        type: Array,
        default: () => ([]),
      },
      onGalleryRemove: {
        default: () => {},
      },
      onGalleryUpdate: {
        default: () => {},
      },
      onGalleryShift: {
        default: () => {},
      },
      onSaveArtPos: {
        default: () => {},
      },
    },
    data: () => ({
      saveGalleryPosBtn: false
    }),
    methods: {
      onUpdateClicked(id, head, subHead) {
        this.onGalleryUpdate(id, head, subHead);
      },
      onRemoveClicked(id) {
        this.onGalleryRemove(id);
      },
      updateOrder(newGallery) {
        this.onGalleryShift(newGallery);
        this.saveGalleryPosBtn = true;
      },
      onSaveGalleryPositions() {
        this.onSaveArtPos();
      }
    },
    computed: {
      galleryDraggable: {
        get() {
          return this.gallery;
        },
        set(value) {
          this.updateOrder(value);
        }
      }
    },
    components: {
      draggable,
    }
  };
</script>

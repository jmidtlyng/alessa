<template>
  <div class="gallery_add_form">
    <form v-on:submit.prevent="onFormSubmit">
      <h2 for='artPieceText'>Add gallery art</h2>

      <div>
          <i v-show="! imageSrc"></i>
          <img v-show="imageSrc" :src="imageSrc">
      </div>

      <div>
          Upload image
          <input @change="previewThumbnail" name="thumbnail" type="file">
      </div>

      <input type="submit" v-if="imageFile" value="Add to gallery" class="btn btn-success">
      <p v-if="addImageSuccess">Added successfully. Edit info in gallery editor above</p>
    </form>
  </div>
</template>

<script>
// credit: http://taha-sh.com/blog/quick-tip-how-to-use-vuejs-to-preview-images-before-uploading
export default {
  props: {
    imageSrc: {
      default: () => {},
    },
    onAddArt: {
      default: () => {},
    }
  },
  data: () => ({
    imageFile: null,
    addImageSuccess: false,
  }),
  methods: {
    previewThumbnail: function(event) {
      var input = event.target;

      if (input.files && input.files[0]) {
          var reader = new FileReader();
          var vm = this;

          reader.onload = function(e) {
            vm.imageSrc = e.target.result;
          }

          this.imageFile = input.files[0];

          reader.readAsDataURL(input.files[0]);
        }
    },
    onFormSubmit() {
      this.onAddArt(this.imageFile);

      this.addImageSuccess = true;
    },
  }
}
</script>

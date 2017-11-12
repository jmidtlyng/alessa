<style>
  .info-input-text {
    min-width: 300px;
  }
</style>

<template>
  <form v-on:submit.prevent='onUpdateInfoClicked'>
    <div class="form-group">
      <h2>Info</h2>
      <label>Instagram sub-header</label>
      <br/>
      <input type="text" class="info-input-text" v-model="info.instaSubHead"/>
      <br/>
      <label>About sub-header</label>
      <br/>
      <input type="text" class="info-input-text" v-model="info.aboutSubHead"/>
      <br/>
      <label>Contact sub-header</label>
      <br/>
      <input type="text" class="info-input-text" v-model="info.contactSubHead"/>
      <br/>
      <label>About</label>
      <br/>
      <textarea cols="50" rows="4" class="form-control" v-model="info.about"/>
      <br/>
      <label>Name</label>
      <br/>
      <input type="text" class="info-input-text" v-model="info.name"/>
    </div>
    <input class="btn-submit" type="submit"/>
  </form>
</template>

<script>
  export default{
    props: {
      info: {
        type: Object,
        default: () => {},
      },
      onInfoUpdate: {
        default: () => {},
      }
    },
    methods: {
      onUpdateInfoClicked(){
        console.log("hey");
        this.onInfoUpdate(this.info.instaSubHead, this.info.aboutSubHead, this.info.contactSubHead, this.info.about, this.info.name);
      }
    }
  }
</script>

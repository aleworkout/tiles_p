<template>
  <div>
    <div style="height: 600px">
      <PinturaEditor
        v-bind="editorDefaults"
        :src="src"
        :imageCropAspectRatio="imageCropAspectRatio"
        @pintura:process="handleInlineProcess($event)"
      ></PinturaEditor>
    </div>
    <img v-if="inlineResult" :src="inlineResult" alt="" />
  </div>
</template>
<script>
// Import the editor default configuration
import { getEditorDefaults } from 'pintura';

// Import the component from `vue-pintura`
import { PinturaEditor } from 'vue-pintura';

export default {
  name: 'App',
  components: {
    PinturaEditor,
  },
  data() {
    return {
      // Pass the editor default configuration options
      editorDefaults: getEditorDefaults(),
      inlineResult: undefined,
      // The source image to load
      src: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmlld3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',

      // This will set a square crop aspect ratio
      imageCropAspectRatio: 1,
    };
  },
  mounted() {
    // editor.on('process', (res) => {
    //   console.log('res')
    //   // downloadFile(res.dest)
    // });
  },
  methods: {
    handleInlineProcess(event){
      // console.log(e)
      this.inlineResult = URL.createObjectURL(event.dest);
      // let file = e.dest
      // const link = document.createElement('a');
      // link.style.display = 'none';
      // link.href = URL.createObjectURL(file);
      // link.download = file.name;
      //
      // // We need to add the link to the DOM for "click()" to work
      // document.body.appendChild(link);
      // link.click();
      //
      // // To make this work on Firefox we need to wait a short moment before clean up
      // setTimeout(() => {
      //   URL.revokeObjectURL(link.href);
      //   link.parentNode.removeChild(link);
      // }, 0);
    }
  }
};
</script>
<style>
@import '../node_modules/pintura/pintura.css';
</style>

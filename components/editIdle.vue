<template>
  <div class="">
    <div
      v-if="uploadElement === 'video'"
      class="about-block__block about-block__block--video"
    >
      <video v-if="src" controls>
        <source :src="inlineResult" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>
    </div>

    <div
      v-if="uploadElement === 'image'"
      class="about-block__block"
      :style="{ backgroundImage: `url(${inlineResult})` }"
    >
      <PinturaEditorModal
        v-if="src"
        v-bind="editorDefaults"
        :src="src"
        :imageCropAspectRatio="imageCropAspectRatio"
        @pintura:process="$emit('handleInlineProcess', $event)"
      ></PinturaEditorModal>
    </div>
  </div>
</template>

<script>
// Import the component from `vue-pintura`
import { PinturaEditor, PinturaEditorModal } from 'vue-pintura'
import { getEditorDefaults } from 'pintura'
export default {
  name: 'editIdle',
  props: ['uploadElement', 'src', 'inlineResult'],
  components: {
    PinturaEditor,
    PinturaEditorModal,
  },
  data: () => ({
    editorDefaults: getEditorDefaults(),
    imageCropAspectRatio: 1,
  }),
}
</script>

<style scoped>
</style>

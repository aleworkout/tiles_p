<template>
  <div class='popup'>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'popup'
}
</script>

<style lang='scss' scoped>
.popup {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(7, 7, 107, 0.9);
  border-radius: 16px;
  padding: 24px 48px;

}
</style>

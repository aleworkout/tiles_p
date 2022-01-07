<template>
  <div class='page'>
    <div class='content'>
      <div class='header'>
        <img src='~/assets/logo.png' alt=''>
        <a href='/'>Home</a>
        <a href='/home'>How it works</a>
        <a href='/home'>FAQ</a>
        <a href='/home'>Contacts</a>
      </div>
      <div class='history mobile-history'>
        <h1 class='history-title'>EDIT TILES</h1>
        <div class='upload-buttons'>
          <label>
            <div @click='uploadElement = "image"' class='upload-buttons-item'>
              <img src='~/assets/upload-image.svg' alt=''>
              <p>image</p>
            </div>
            <input
              class='input-upload'
              ref="upload"
              type="file"
              name="file-upload"
              multiple=""
              accept="image/jpeg, image/png"
              @change="inputFile">
          </label>
          <div @click='uploadElement = "video"' class='upload-buttons-item'>
            <label>
              <img src='~/assets/video.svg' alt=''>
              <p>video</p>
              <input
                class='input-upload'
                ref="upload"
                type="file"
                name="file-upload"
                multiple=""
                accept="video/*"
                @change="inputFileVideo">
            </label>

          </div>
        </div>

      </div>
      <div class='about-block'>
        <div v-if='uploadElement === "video"'  class='about-block__block' >
          <label class='input-image'>
            <img src='~/assets/video.svg' alt=''>
            <input ref="upload"
                   type="file"
                   name="file-upload"
                   multiple=""
                   accept="video/*"
                   @change="inputFileVideo">
          </label>
        </div>
        <div v-if='uploadElement === "image"' class='about-block__block' :style='{backgroundImage: `url(${inlineResult})`}'>
          <PinturaEditorModal
            v-if='src'
            v-bind="editorDefaults"
            :src="src"
            :imageCropAspectRatio="imageCropAspectRatio"
            @pintura:process="handleInlineProcess($event)"
          ></PinturaEditorModal>
          <label class='input-image'>
            <img src='~/assets/upload.svg' alt=''>
            <input ref="upload"
                   type="file"
                   name="file-upload"
                   multiple=""
                   accept="image/jpeg, image/png"
                   @change="inputFile">
          </label>
        </div>
        <div class='about-block__description'>
          <div class='history'>
            <h1 class='history-title desktop'>EDIT TILES</h1>
            <div class='upload-buttons desktop'>
              <label>
                <div @click='uploadElement = "image"' class='upload-buttons-item'>
                  <img src='~/assets/upload-image.svg' alt=''>
                  <p>image</p>
                </div>
                <input
                  class='input-upload'
                  ref="upload"
                       type="file"
                       name="file-upload"
                       multiple=""
                       accept="image/jpeg, image/png"
                       @change="inputFile">
              </label>
              <div @click='uploadElement = "video"' class='upload-buttons-item'>
                <label>
                  <img src='~/assets/video.svg' alt=''>
                  <p>video</p>
                  <input
                    class='input-upload'
                    ref="upload"
                         type="file"
                         name="file-upload"
                         multiple=""
                         accept="video/*"
                         @change="inputFileVideo">
                </label>

              </div>
            </div>

            <label class='element-link-label'>
              <small>link</small>
              <input type='text'>
            </label>

            <div class='save-buttons'>
              <button class='save-buttons__save'>Save and close</button>
              <button class='save-buttons__cancel'>Cancel</button>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div class='footer'>
      <p>© 2021 10 Tiles LTD.</p>
    </div>
  </div>
</template>

<script>
// Import the editor default configuration
import { getEditorDefaults } from 'pintura';
import pinata from '../../../service/pinata'

// Import the component from `vue-pintura`
import { PinturaEditor, PinturaEditorModal } from 'vue-pintura';

export default {
  name: 'buy',
  components: {
    PinturaEditor,
    PinturaEditorModal
  },
  data() {
    return {
      // Pass the editor default configuration options
      editorDefaults: getEditorDefaults(),
      inlineResult: undefined,
      openEditor: false,
      // The source image to load
      src: undefined,

      // This will set a square crop aspect ratio
      imageCropAspectRatio: 1,
      uploadElement: 'image'
    };
  },
  methods: {
    handleInlineProcess(event){
      const tileId = this.$route.params.buy
      this.inlineResult = URL.createObjectURL(event.dest);
      let data = new FormData()
      data.append('file', event.dest)
      data.append('pinataMetadata', JSON.stringify({tile: tileId}))
      pinata.addPinata(this.$axios, data)
    },
    inputFile(event){

      this.src = event.target.files[0]
      console.log(this.src)
    },
    inputFileVideo(event){
      console.log(event, "video")
      console.log(event.target.files[0])
    }
  }
}
</script>

<style lang='scss'>
@import '../../../node_modules/pintura/pintura.css';

.page{
  min-height: 100vh;
  height: 100%;
  background: rgb(9,9,126);
  background:linear-gradient(38deg, #09097e 24%, #510074 100%);
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;

  .content {
    max-width: 1200px;
    //width: 100%;
    margin: 0 auto;
    padding: 0 16px;
    .about-block {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 120px;
      margin-top: 60px;
      &__block {
        min-height: 460px;
        border-radius: 30px;
        border: 2px dashed rgba(255,255,255, 0.3);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        .block-elements{
        }
        @media screen and (max-width: 768px) {
          min-height: 300px;
        }
      }
      &__description{
        .des-buttons {
          display: grid;
          grid-template-columns: auto 1fr 1fr;
          gap: 24px;
          margin-bottom: 72px;
          .price {
            .block-price {
              color: #00fc7b;
              line-height: 1.5;
              display: flex;
              align-items: center;
              font-size: 24px;
              &:after {
                content: url("~/assets/eth.png");
                margin-left: 4px;
              }
            }
            .block-price-dollar {
              font-size: 14px;
            }
          }
          .buy-now {
            background: #090069;
            padding: 18px;
            border-radius: 12px;
            text-align: center;
          }
          .place-bid {
            background: #ff2dac;
            padding: 18px;
            border-radius: 12px;
            text-align: center;
          }
        }

      }
      @media screen and (max-width: 1024px) {
        gap: 50px;
      }
      @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    .input-image {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      img {
        width: 40%;
        opacity: 0;
      }
      input{
        width: 0;
        height: 0;
      }
      &:hover {
        cursor: pointer;
        img {
          transition: .4s;
          opacity: .6;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    background:linear-gradient(38deg, #09097e 80%, #af00ff 100%);
    .page-background-text {
      display: none;
    }
    .content {
      background-size: 300px;
      background-position: right 100px;
      .header {
        a {
          font-size: 14px;
        }
      }
    }

  }
}
.input-upload {
  width: 0;
  height: 0;
  position: absolute;
}
.save-buttons {
  display: grid;
  grid-template-columns: auto auto;
  gap: 24px;
  margin-top: 50px;
  &__save{
    background: #090069;
    padding: 18px;
    border-radius: 12px;
    text-align: center;
    color: inherit;
    font-family: inherit;
    font-size: 14px;
    font-weight: inherit;
    outline: none;
    border: none;
    &:hover {
      cursor: pointer;
    }
  }
  &__cancel {
    background: #ff2dac;
    padding: 18px;
    border-radius: 12px;
    text-align: center;
    color: inherit;
    font-family: inherit;
    font-size: 14px;
    font-weight: inherit;
    outline: none;
    border: none;
    &:hover {
      cursor: pointer;
    }
  }
}
.history {
  .history-title {
    font-size: 32px;
  }
  .upload-buttons {
    display: grid;
    grid-template-columns: 80px 80px;
    grid-template-rows: 90px;
    gap: 24px;
    margin-top: 30px;
    margin-bottom: 70px;
    .upload-buttons-item {
      background-color: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      img {
        width: 45px;
        height: 45px;
      }
      p {
        color: #09097e;
      }
      &:hover {
        cursor: pointer;
        -webkit-box-shadow: 1px 14px 62px 11px rgba(0, 252, 123, 1);
        -moz-box-shadow: 1px 14px 62px 11px rgba(0, 252, 123, 1);
        box-shadow: 1px 14px 62px 11px rgba(0, 252, 123, 1);
        background: white;
        transition: 0.3s;
      }
    }
  }
  .element-link-label {
    display: flex;
    flex-direction: column;
    small {
      font-size: 12px;
    }
    input {
      background-color: rgba(0,0,0,0);
      outline: none;border: none;
      font-size: 18px;
      color: white;
      padding: 8px 0px;
      border-bottom: 2px solid white;
    }
  }
}
.mobile-history {
  margin-top: 40px;
  @media screen and (min-width: 768px) {
    display: none;
  }
}
.desktop {
  @media screen and (max-width: 768px) {
    display: none !important;
  }
}
</style>

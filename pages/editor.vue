<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <img src="~/assets/logo.png" alt="" />
        <a href="/">Home</a>
        <a href="/home">How it works</a>
        <a href="/home">FAQ</a>
        <a href="/home">Contacts</a>
        <NuxtLink to="/editor">Mint one $TILE</NuxtLink>
      </div>

      <div class="about-block">
        <popup v-if="walletPopup">
          <wallet @setWalletKey="setWalletKey" @walletClose="walletClose" />
        </popup>
        <popup v-if="loading">
          <wait-transaction :transactionInfo="transactionInfo" />
        </popup>
        <popup v-if="successPopup">
          <transaction-success :transactionInfo="transactionInfo" />
        </popup>

        <!-- Mobile side -->
        <div class="mobile-history">
          <h1 class="history-title mobile-history">CUSTOMIZE YOUR TILE</h1>
          <div class="upload-buttons mobile-history">
            <div class="upload-buttons-item">
              <label>
                <img src="~/assets/upload-image.svg" alt="" />
                <p>image</p>
                <input
                  class="input-upload"
                  ref="upload"
                  type="file"
                  name="file-upload"
                  multiple=""
                  accept="image/jpeg, image/png"
                  @change="inputFile"
                />
              </label>
            </div>
            <div class="upload-buttons-item">
              <label>
                <img src="~/assets/video.svg" alt="" />
                <p>video</p>
                <input
                  class="input-upload"
                  ref="upload"
                  type="file"
                  name="file-upload"
                  multiple=""
                  accept="video/*"
                  @change="inputFileVideo"
                />
              </label>
            </div>
          </div>
        </div>

        <component
          :is="editBlockComponent"
          :src="src"
          :inlineResult="inlineResult"
          :uploadElement="uploadElement"
          @handleInlineProcess="handleInlineProcess"
        />

        <div class="about-block__description">
          <div class="history">
            <h1 class="history-title desktop">CUSTOMIZE YOUR TILE</h1>

            <div class="upload-buttons desktop">
              <div class="upload-buttons-item">
                <label>
                  <img src="~/assets/upload-image.svg" alt="" />
                  <p>image</p>
                  <input
                    class="input-upload"
                    ref="upload"
                    type="file"
                    name="file-upload"
                    multiple=""
                    accept="image/jpeg, image/png"
                    @change="inputFile"
                  />
                </label>
              </div>
              <div class="upload-buttons-item">
                <label>
                  <img src="~/assets/video.svg" alt="" />
                  <p>video</p>
                  <input
                    class="input-upload"
                    ref="upload"
                    type="file"
                    name="file-upload"
                    multiple=""
                    accept="video/*"
                    @change="inputFileVideo"
                  />
                </label>
              </div>
            </div>

            <label class="element-link-label">
              <small>link</small>
              <input
                type="text"
                name="link"
                v-model="link"
                @change="linkChanged"
              />
            </label>

            <div v-if="errorText" class="save-buttons error-text">
              <p>{{ errorText }}</p>
            </div>

            <div
              v-if="loading === false && $networkId === project_network_id"
              class="save-buttons"
            >
              <button @click="uploadFileToArweave()" class="save-buttons__save">
                Save and close
              </button>
              <button class="save-buttons__cancel">Cancel</button>
            </div>

            <p v-if="$networkId === project_network_id" class="accuracy-text">
              All cool. You're connected to {{ project_network_name }}
            </p>
            <p v-else class="error-text">
              Ops! You're connected to the wrong network. Change to =>
              {{ project_network_name }}
            </p>
          </div>
        </div>
      </div>
      <p class="accuracy-text">{{ transactionStatus }}</p>
    </div>

    <div class="footer">
      <p>© 2021 10 Tiles LTD.</p>
    </div>
  </div>
</template>

<script>
// Import the editor default configuration
import { getEditorDefaults } from 'pintura'
//service
import arweave from '../service/arweave'
// Alucino => Editor (Done)
import EditIdle from '../components/editIdle'
//Components
import Popup from '../components/popup'
import Wallet from '../components/wallet'
import WaitTransaction from '../components/waitTransaction'
import TransactionSuccess from '../components/transactionSuccess'
// import { ArweaveSigner, createData } from "arbundles";

const states = {
  idle: EditIdle,
}

let getStatus

export default {
  name: 'editor',
  components: {
    TransactionSuccess,
    WaitTransaction,
    Wallet,
    Popup,
    EditIdle,
  },

  data() {
    return {
      // Inicializa PopUps
      walletPopup: false,
      waitLoading: false,
      successPopup: false,

      loading: false,
      // Pass the editor default configuration options
      editState: 'idle',
      editorDefaults: getEditorDefaults(),
      inlineResult: undefined,
      // The source image to load
      src: undefined,
      uploadElement: 'image',
      errorText: '',
      walletKey: undefined,
      transactionInfo: {},

      //A nossa horta
      uri: '',
      transactionJsonInfo: {},
      project_network_name: 'Rinkeby',
      project_network_id: 4,
      supply: undefined,
      mintTxHash: '',
      transactionStatus: 'transactionStatus',
      link: localStorage.getItem('link'),
    }
  },
  computed: {
    editBlockComponent() {
      return states[this.editState]
    },
  },
  created() {
    this.load()
    console.log('created no editor')
  },
  methods: {
    async uploadFileToArweave() {
      //1 => Selecionar o arquivo
      if (!this.src) {
        this.errorText = 'select one image or video'
        return false
      }

      if (this.supply == 10) {
        this.errorText = 'There are not available Tiles anymore'
        return false
      }

      this.transactionStatus = 'Please select your arweave wallet (json)'
      this.walletPopup = true
    },
    //CREATE/UPLOAD do Json
    async fetchSomething() {
      //Cria o JSON
      this.createBlob()
      /////////////

      try {
        //Começa a preparação do Upload do JSON
        this.transactionStatus =
          'PREPARING METADATA. THIS CAN TAKE UP TO 15 MINUTES'
        const type = this.src.type

        const jsonDataUri = await this.toBase64(this.src)

        const jsonBuffer = Buffer.from(jsonDataUri.split(',')[1], 'base64')

        const transaction = await arweave.createTransaction(
          {
            data: jsonBuffer,
          },
          this.walletKey
        )
        transaction.addTag('Content-Type', type)

        //Começa o Upload do JSON
        await arweave.transactions.sign(transaction, this.walletKey)

        await arweave.transactions.post(transaction)

        this.transactionJsonInfo = {
          address: await arweave.wallets.jwkToAddress(this.walletKey),
          transactionId: transaction.id,
        }

        console.log(this.transactionJsonInfo.transactionId)
        this.uri = 'ar://' + this.transactionJsonInfo.transactionId

        getStatus = setInterval(() => this.getTransactionStatus(), 60000)
      } catch (err) {
        console.log(err)
      }
    },
    async load() {
      await this.getSupply()
      /** Need more loadings? */
    },
    getSupply: async function () {
      let res = await this.$contract.methods.totalSupply().call()
      console.log('supply abaixo')
      console.log(res)
      this.supply = res
    },
    mint: async function (callback) {
      // let accounts = await this.$web3.eth.getAccounts();
      // let account = accounts[0];

      this.transactionStatus = 'Please Confirm the Mint Transaction'

      var ret = await this.$contract.methods
        .mint(this.$accounts[0], this.uri)
        .send({ from: this.$accounts[0] })
        .then(async (res) => {
          console.log(res)
          this.mintTxHash = res.transactionHash
        })
        .catch(() => {
          console.log('error')
        })

      this.$contract.events.allEvents((error, event) => {
        if (event != null && this.mintTxHash != null) {
          if (event.transactionHash == mintTxHash) {
            callback(event.returnValues.tokenId)
          }
        }
      })

      this.transactionStatus = 'Minted Succesfully'
      console.log('tokeId abaixo')
      console.log(callback)
    },
    async createBlob() {
      //transactionId
      var txid = this.transactionInfo.transactionId.toString()
      var part1 =
        '{\n    "name": "First Permanent NFT (para valer valer)",\n    "description": "Description for tiles collection",\n    "fee_recipient": "",\n    "seller_fee_basis_points": 250,\n'
      var part2 = '"image":' + '"https://arweave.net/' + txid + '"'
      var part3 =
        ',\n    "external_url": "",\n    "attributes": [\n        {\n            "trait_type": "Bg Exports",\n            "value": "Wd Nft"\n        },\n        {\n            "trait_type": "Heads Png",\n            "value": "Wd 0014 Wdhead18"\n        },\n        {\n            "trait_type": "Bodies Png",\n            "value": "Wd 0000 Wdbody10"\n        },\n        {\n            "trait_type": "Front Png",\n            "value": "Wd Front 0002 Wd Front 0001 Wd 0035 Wdfront1"\n        }\n    ],\n    "hash": "ea318b62ef4c54dea0e82999c655a5da",\n    "edition": "1"\n}'
      // var part4 =

      var jsonStringified = part1 + part2 + part3
      var aFileParts = [jsonStringified]
      var blob = new Blob(aFileParts, { type: 'application/json' }) // the blob
      this.src = blob
      this.uploadElement = 'json'
    },
    handleInlineProcess(event) {
      this.inlineResult = URL.createObjectURL(event.dest)
    },
    //Para IMAGEM
    inputFile(event) {
      if (!event.target.files.length) {
        return
      }
      //Se tem arquivo na fila
      this.src = event.target.files[0]
      this.uploadElement = 'image'
    },
    //Para VIDEO
    inputFileVideo(event) {
      console.log(event)
      if (!event.target.files.length) {
        return
      }
      this.src = event.target.files[0]
      this.uploadElement = 'video'
    },
    //[] YOU CAN DELETE THE FUNCTION BELOW
    linkChanged() {
      console.log(this.link)
    },
    async setWalletKey(key) {
      this.walletKey = key
      this.walletPopup = false
      try {
        //Chamar o POPUP "Waiting for a transaction"
        this.transactionStatus = 'PREPARING UPLOADING FILE'
        this.loading = true
        const type = this.src.type

        //Começa a preparação do Upload do File
        const fileDataUri = await this.toBase64(this.src)

        const fileBuffer = Buffer.from(fileDataUri.split(',')[1], 'base64')
        const transaction = await arweave.createTransaction(
          {
            data: fileBuffer,
          },
          key
        )
        transaction.addTag('Content-Type', type)

        //Começa o Upload do File
        this.transactionStatus = 'UPLOADING STARTED. PLEASE AWAIT'
        await arweave.transactions.sign(transaction, key)
        await arweave.transactions.post(transaction)

        //Seta o valor de transactionInfo
        this.transactionInfo = {
          address: await arweave.wallets.jwkToAddress(key),
          transactionId: transaction.id,
        }

        //Chama quem fará o CREATE/UPLOAD do Json
        this.fetchSomething()
        //getStatus = setInterval(() => this.getTransactionStatus(), 60000)
      } catch (err) {
        console.log(err)
      }
    },
    async getTransactionStatus() {
      let status = await arweave.transactions.getStatus(
        this.transactionJsonInfo.transactionId
      )

      if (status.status !== 202) {
        clearInterval(getStatus)
      }
      if (status.status === 200) {
        //DO JSON
        this.loading = false
        this.successPopup = true

        //ATIVAR O FLUXO DE MINT
        this.mint()
      }
      return status
    },
    toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    },
    walletClose() {
      this.walletPopup = false
    },
  },
}
</script>

<style lang='scss'>
@import '../node_modules/pintura/pintura.css';

.page {
  min-height: 100vh;
  height: 100%;
  background: rgb(9, 9, 126);
  background: linear-gradient(38deg, #09097e 24%, #510074 100%);
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 0 16px;

  .content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;

    p.accuracy-text {
      color: rgb(123, 255, 0);
    }

    .about-block {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 120px;
      margin-top: 60px;
      &__block {
        min-height: 460px;
        border-radius: 30px;
        border: 2px dashed rgba(255, 255, 255, 0.3);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        .block-elements {
        }
        &--video {
          border: none;
        }
        @media screen and (max-width: 768px) {
          min-height: 300px;
        }
      }
      &__description {
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
                content: url('~/assets/eth.png');
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
      p.accuracy-text {
        color: rgb(123, 255, 0);
      }

      p.error-text {
        color: rgb(238, 3, 3);
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
      input {
        width: 0;
        height: 0;
      }
      &:hover {
        cursor: pointer;
        img {
          transition: 0.4s;
          opacity: 0.6;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    background: linear-gradient(38deg, #09097e 80%, #af00ff 100%);
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
  &__save {
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
  .element-link-label {
    display: flex;
    flex-direction: column;
    small {
      font-size: 12px;
    }
    input {
      background-color: rgba(0, 0, 0, 0);
      outline: none;
      border: none;
      font-size: 18px;
      color: white;
      padding: 8px 0px;
      border-bottom: 2px solid white;
    }
  }
}

.history-title {
  font-size: 32px;
  color: white;
  font-family: 'Bungee', cursive;
  @media screen and (max-width: 768px) {
  }
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
    label {
      padding: 12px;
    }
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
  @media screen and (max-width: 768px) {
    margin-top: 30px;
    margin-bottom: 0;
  }
}
.desktop {
  @media screen and (max-width: 768px) {
    display: none !important;
  }
}

video {
  width: 100%;
}
input[type='file'] {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.error-text {
  p {
    color: orangered;
  }
}
.accuracy-text {
  p {
    color: rgb(123, 255, 0);
  }
}
.mobile-history {
  @media screen and (min-width: 768px) {
    display: none;
  }
}
</style>

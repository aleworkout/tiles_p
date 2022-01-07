<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <img src="~/assets/logo.png" alt="" />
        <a href="/">Home</a>
        <a href="/home">How it works</a>
        <a href="/home">FAQ</a>
        <a href="/home">Contacts</a>
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

        <div class="about-block__block">
          <div class="block-elements">
            <h1 class="element-title">TILES <br />#{{ $route.params.id }}</h1>
            <p class="element-des">
              Participate in the auction for each tile. The buyer gets the
              opportunity to leave a message.
            </p>
            <p class="element-des-2">The tiles can be resold.</p>
          </div>
        </div>
        <div class="about-block__description">
          <h1 class="about-block-title">TILE #{{ $route.params.id }}</h1>
          <div class="des-buttons">
            <div class="price">
              <p class="block-price">0.1</p>
              <p class="block-price-dollar">$416</p>
            </div>
            <!-- <nuxt-link to="#" class="buy-now buttons-mobile"
              >Buy now!</nuxt-link
            > -->
            <!-- <nuxt-link to="#" class="place-bid buttons-mobile"
              >Place a bid</nuxt-link
            > -->

            <button
              @click="uploadFileToArweave()"
              class="place-bid buttons-mobile"
            >
              Change Tile's Layout
            </button>
          </div>
          <p>{{ textError }}</p>
          <div class="history">
            <div class="upload-buttons">
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
            <div class="history-item">
              <p>Owner: <span>Not Connected</span></p>
              <p>Contract Address: <span>Not Connected</span></p>
              <p>Metadata on Arweave: <span>Not Connected</span></p>
              <p>Token ID: <span>Not Connected</span></p>
            </div>
            <h1 class="history-title">HISTORY</h1>
            <div class="history-blocks">
              <div
                v-for="i in history['asset_events']"
                class="history-blocks__block"
                :key="i"
              >
                <img
                  class="history-blocks__block-image"
                  src="~/assets/user-icon.svg"
                  alt=""
                />
                <div class="history-blocks__block-content">
                  <p v-if="got" class="history-blocks__block-title">
                    Listed for {{ i.starting_price / 10 ** 18 }}
                    <span> <img src="~/assets/eth.png" alt="" /></span>
                  </p>
                  <p v-if="got" class="history-blocks__block-des">
                    by a
                    {{ i.from_account.address }} at
                    {{ i.listing_time }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>© 2021 10 Tiles LTD.</p>
    </div>
  </div>
</template>

<script>
import { getEditorDefaults } from 'pintura'
//service
import arweave from '../../service/arweave'
// Alucino => Editor (Done)
import EditIdle from '../../components/editIdle.vue'
//Components
import Popup from '../../components/popup'
import Wallet from '../../components/wallet'
import WaitTransaction from '../../components/waitTransaction'
import TransactionSuccess from '../../components/transactionSuccess'

const states = {
  idle: EditIdle,
}

let getStatus

export default {
  name: 'nftAbout',
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
      // editorDefaults: getEditorDefaults(),
      inlineResult: undefined,
      // The source image to load
      src: undefined,
      uploadElement: 'image',
      textError: '',
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
      owner_is_active: false,
      history,
      got: false,
    }
  },
  computed: {
    editBlockComponent() {
      return states[this.editState]
    },
  },
  created() {
    console.log('ID DO TOKEN ATUAL ABAIXOO')
    console.log(this.$route.params.id)
    this.historyOpenSea()
  },
  methods: {
    async historyOpenSea() {
      const api_url =
        'https://testnets-api.opensea.io/events?asset_contract_address=0x652d852f761047a53fdc84570005e9cc6f524906&token_id=0&event_type=created&only_opensea=false&offset=0&limit=20' //Chamado à API
      const response = await this.$axios.$get(api_url)

      this.history = response
      this.got = true
      console.log('listing time')
      console.log(this.history['asset_events'][0].listing_time)
      console.log('starting_price')
      console.log(this.history['asset_events'][0].starting_price)
      console.log('from account')
      console.log(this.history['asset_events'][0].from_account.address)
    },
    //1 => Verifica que ha arquivos selecionados para upload
    async uploadFileToArweave() {
      window.ethereum.enable()
      if (!this.src) {
        this.textError = 'select one image or video'
        return false
      }

      console.log('o que é?')

      this.isOwner()
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

        console.log(this.transactionStatus)
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
        this.transactionStatus = 'UPLOADING STARTED'
        console.log(this.transactionStatus)

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
    setURI: async function () {
      // let accounts = await this.$web3.eth.getAccounts();
      // let account = accounts[0];

      await this.$contract.methods

        .setTokenUri(this.$route.params.id, this.uri)
        .send({ from: this.$accounts[0] })
        .then(() => {
          this.transactionStatus = 'uri changed Succesfully'
          console.log('uri changed succesfully!')
        })
        .catch(() => {
          console.log('error')
        })
    },
    isOwner: async function () {
      let owner = await this.$contract.methods
        .ownerOf(this.$route.params.id)
        .call()
      console.log('owner abaixo')
      console.log(owner)
      console.log(this.$accounts[0])
      if (owner == this.$accounts[0]) {
        this.transactionStatus = 'Please select your arweave wallet (json)'
        this.walletPopup = true
      } else {
        this.textError = 'You are not the owner of this Tiles'
      }
      //
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
        this.setURI()
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
    //width: 100%;
    margin: 0 auto;

    .about-block {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 120px;
      margin-top: 60px;
      .about-block-title {
        font-size: 54px;
        line-height: 50px;
        color: #00fc7b;
        font-weight: 400;
        font-family: 'Bungee', cursive;

        margin-bottom: 14px;
      }
      &__block {
        min-height: 460px;
        border-radius: 30px;
        border: 2px dashed rgba(255, 255, 255, 0.3);
        padding: 40px 30px;
        background-image: url('~/assets/man.png');
        background-repeat: no-repeat;
        background-position: 50px 50px;
        background-size: 200px;
        .block-elements {
          .element-title {
            font-size: 75px;
            line-height: 66px;
            color: #00fc7b;
            font-weight: 400;
            font-family: 'Bungee', cursive;
            margin-top: 200px;
            margin-bottom: 40px;
          }
          .element-des {
            font-size: 14px;
            line-height: 24px;
            margin-bottom: 18px;
          }
          .element-des-2 {
            font-size: 14px;
            line-height: 24px;
            color: #108d7f;
          }
        }
      }
      &__description {
        .des-buttons {
          display: grid;
          grid-template-columns: auto 1fr 1fr;
          gap: 24px;
          margin-bottom: 48px;
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
        .history {
          .history-title {
            font-size: 32px;
            font-weight: bold;
            font-family: 'Bungee', cursive;
            color: white;
          }
          .history-item {
            margin: 24px 0;
            p {
              margin-bottom: 10px;
              font-size: 14px;
              span {
                color: #00fc7b;
              }
            }
          }
          .history-blocks {
            margin-top: 12px;
            &__block {
              margin-bottom: 12px;
              display: grid;
              grid-template-columns: auto 1fr;
              gap: 16px;
              &-image {
                width: 40px;
                height: auto;
              }
              &-content {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
              }
              &-title {
                img {
                  width: 10px;
                }
              }
              &-des {
                font-size: 12px;
                font-weight: lighter;
              }
            }
          }
        }
      }
      @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
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
.buttons-mobile {
  @media screen and (max-width: 768px) {
    font-size: 14px;
    padding: 6px !important;
    display: flex;
    align-items: center;
    justify-content: center;
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
.input-upload {
  width: 0;
  height: 0;
  position: absolute;
}
</style>

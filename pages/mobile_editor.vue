<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <img src="~/assets/logo.png" alt="" />
        <a href="/">Home</a>
        <a href="/home">How it works</a>
        <a href="/home">FAQ</a>
        <a href="/home">Contacts</a>
        <NuxtLink to="/editor">Minter</NuxtLink>
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
              <input type="text" />
            </label>

            <div v-if="errorText" class="save-buttons error-text">
              <p>{{ errorText }}</p>
            </div>
            <div v-if="loading === false" class="save-buttons">
              <button @click="uploadToArweave()" class="save-buttons__save">
                Save and close
              </button>
              <button class="save-buttons__cancel">Cancel</button>
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
// Import the editor default configuration
import { getEditorDefaults } from 'pintura'

import Web3 from 'web3'
import json from '~/build/contracts/Tiles.json'
import TruffleContract from 'truffle-contract'

import arweave from '../service/arweave'
import EditIdle from '../components/editIdle'
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
      editState: 'idle',
      // Pass the editor default configuration options
      editorDefaults: getEditorDefaults(),
      inlineResult: undefined,
      // The source image to load
      src: undefined,
      // This will set a square crop aspect ratio
      uploadElement: 'image',
      errorText: '',
      walletKey: undefined,
      transactionInfo: {},
      //URI token => hash
      uri: '',
      transactionJsonInfo: {},
      successPopup: false,
      waitLoading: false,
      loading: false,
      walletPopup: false,
      ip: '',
      contracts: {},
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
    //Faz upload to Arweave
    // => JSON
    async fetchSomething() {
      //O Blob precisa de comida => id da IMG
      console.log('olha a transaction info da img')
      console.log(this.transactionInfo.transactionId)
      this.createBlob()
      this.walletPopup = false
      try {
        this.loading = true
        const type = this.src.type

        console.log('toBase64')
        const imageDataUri = await this.toBase64(this.src)

        console.log('Buffer')
        const imageBuffer = Buffer.from(imageDataUri.split(',')[1], 'base64')

        console.log('antes da tx')

        const transaction = await arweave.createTransaction(
          {
            data: imageBuffer,
          },
          this.walletKey
        )
        //ID (X)
        //OWNER (X)
        //SIGANTURE (X)
        console.log(transaction)

        transaction.addTag('Content-Type', type)

        const assinatura = await arweave.transactions.sign(
          transaction,
          this.walletKey
        )
        console.log(assinatura)
        await arweave.transactions.post(transaction)

        //console.log('post response', postResponse)
        // console.log(
        //   'getStatus',
        //   await arweave.transactions.getStatus(transaction.id)
        // )

        this.transactionJsonInfo = {
          address: await arweave.wallets.jwkToAddress(this.walletKey),
          transactionId: transaction.id,
        }
        console.log('ID JSON')
        console.log(this.transactionJsonInfo.transactionId)
        //this.uri = 'ar://' + this.transactionJsonInfo.transactionId

        getStatus = setInterval(() => this.getTransactionStatus(), 60000)
      } catch (err) {
        console.log(err)
      }
    },
    async load() {
      await this.loadWeb3()
      await this.loadAccount(this)
      await this.loadContract(this)
      //await this.renderTasks(this)
      //this.loading = false
    },
    async loadWeb3() {
      this.web3 = window.web3
      // console.log('web3', this.web3)
      if (typeof this.web3 !== 'undefined') {
        this.web3Provider = this.web3.currentProvider
        this.web3 = new Web3(this.web3.currentProvider)
      } else {
        window.alert('Please connect to Metamask.')
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        console.log('ethereum', window.ethereum)
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({
            /* ... */
          })
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({
          /* ... */
        })
      }
      // Non-dapp browsers...
      else {
        console.log(
          'Non-Ethereum browser detected. You should consider trying MetaMask!'
        )
      }
    },
    loadAccount: async (parent) => {
      // Set the current blockchain account
      let accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      console.log('Account', accounts)
      parent.account = accounts[0]
      console.log('0 Account', parent.account)
    },
    loadContract: async (parent) => {
      // Create a JavaScript version of the smart contract
      // parent.contracts.TodoList = TruffleContract(json)
      // parent.contracts.TodoList.setProvider(parent.web3Provider)
      // // Hydrate the smart contract with values from the blockchain
      // parent.todoList = await parent.contracts.TodoList.deployed()
      // console.log('contract TILES', parent.todoList)
    },
    renderTasks: async (parent) => {
      //prova de mint
      // console.log('reading => ' + parent.account)

      // const contract_address = await parent.todoList.owner()
      // console.log(contract_address)
      console.log('entrou no tasks')

      const daiExchangeContract = new web3.eth.Contract(
        JSON.parse(JSON.stringify(json)),
        '0xab02d9feda6297dd2202ebe368022d10ddf04285'
      )

      console.log('Id info abaixo')
      console.log(paren.transactionJsonInfo.transactionId)

      console.log('minting iniciated')

      const exchangeEncodeABI = daiExchangeContract.methods
        .mint(
          '0x574cCaeFa830C2112B46479DFc09fdf1a5c35E3d',
          paren.transactionJsonInfo.transactionId
        )
        .encodeABI()

      //Criando uma tx de Respeito em 3 2 1!

      // const tx1 = await parent.todoList.mint(
      //   '0xa3D6020C8480C410C1c0d4A9ea51eAf2f69D9c63',
      //   'ar://VImlDX9fVrmRiiFuj_gYXfqldEEAaUxipAqvZ4vSy3k'
      // )
      // tx1.wait()
      // console.log(tx1)
      console.log('nonce')
      const nonce = await web3.eth.getTransactionCount(
        '0x574cCaeFa830C2112B46479DFc09fdf1a5c35E3d',
        'latest'
      ) //get latest nonce

      console.log('gasPrice')
      const gasPrice = await web3.eth.getGasPrice()

      console.log('gas')
      const gas = await web3.eth.estimateGas({
        from: '0x574cCaeFa830C2112B46479DFc09fdf1a5c35E3d',
        nonce: nonce,
        to: '0xab02d9feda6297dd2202ebe368022d10ddf04285',
        data: exchangeEncodeABI,
      })

      const tx = {
        from: '0x574cCaeFa830C2112B46479DFc09fdf1a5c35E3d',
        to: '0xab02d9feda6297dd2202ebe368022d10ddf04285',
        value: 0,
        gas,
        gasPrice,
        data: exchangeEncodeABI,
      }

      console.log('signing')
      //Private key (by fernando) set
      const signedTx = await web3.eth.accounts.signTransaction(
        tx,
        '0xb9ab6408b0c746bb271d703269761e4d39d98d673d13473775b6bd631d8252ff'
      )

      console.log('send')

      try {
        const transactionReceipt = await web3.eth.sendSignedTransaction(
          signedTx.rawTransaction
        )

        console.log(transactionReceipt)
        console.log('Mint Done!')
      } catch (error) {
        console.log(error)
      }
    },
    async createBlob() {
      //transactionId
      var txid = this.transactionInfo.transactionId.toString()
      var part1 =
        '{\n    "name": "First Permanent NFT (para valer valer)",\n    "description": "Description for tiles collection",\n    "fee_recipient": "",\n    "seller_fee_basis_points": 250,\n'
      var part2 = '"image":' + '"https://arweave.net/' + txid + '"'
      var part3 =
        ',\n    "external_url": "",\n    "attributes": [\n        {\n            "trait_type": "Bg Exports",\n            "value": "Wd Nft"\n        },\n        {\n            "trait_type": "Heads Png",\n            "value": "Wd 0014 Wdhead18"\n        },\n        {\n            "trait_type": "Bodies Png",\n            "value": "Wd 0000 Wdbody10"\n        },\n        {\n            "trait_type": "Front Png",\n            "value": "Wd Front 0002 Wd Front 0001 Wd 0035 Wdfront1"\n        }\n    ],\n    "hash": "ea318b62ef4c54dea0e82999c655a5da",\n    "edition": "1"\n}'

      // var jsonStringified =
      //   '{\n    "name": "First Permanent NFT",\n    "description": "Description for tiles collection",\n    "fee_recipient": "",\n    "seller_fee_basis_points": 250,\n    "image": "https://arweave.net/9GfyYUNFh2ybQ41MOzLmU-vNrfsnivIRJfigNVN8R2I",\n    "external_url": "",\n    "attributes": [\n        {\n            "trait_type": "Bg Exports",\n            "value": "Wd Nft"\n        },\n        {\n            "trait_type": "Heads Png",\n            "value": "Wd 0014 Wdhead18"\n        },\n        {\n            "trait_type": "Bodies Png",\n            "value": "Wd 0000 Wdbody10"\n        },\n        {\n            "trait_type": "Front Png",\n            "value": "Wd Front 0002 Wd Front 0001 Wd 0035 Wdfront1"\n        }\n    ],\n    "hash": "ea318b62ef4c54dea0e82999c655a5da",\n    "edition": "1"\n}'
      var jsonStringified = part1 + part2 + part3

      var aFileParts = [jsonStringified]
      var blob = new Blob(aFileParts, { type: 'application/json' }) // the blob
      //this.inlineResult = URL.createObjectURL(blob)
      //console.log('this.inlineResult ', this.inlineResult)
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
    inputJson(event) {
      if (!event.target.files.length) {
        return
      }
      this.src = event.target.files[0]
      this.uploadElement = 'json'
    },
    async uploadToArweave() {
      this.errorText = ''
      console.log(this.src)
      if (!this.src) {
        this.errorText = 'input image or video'
        return false
      }
      //Se tiver algo no src
      try {
        //Chamar o POPUP "It's time for permanence"
        //this.walletPopup = true

        //Faz upload da img
        this.setWalletKey(this.key)
      } catch (err) {
        this.walletPopup = false
        this.errorText = 'transaction error. try again'
      }
    },
    async setWalletKey(key) {
      //Faz upload to Arweave
      // => IMAGEM
      this.walletKey = key
      this.walletPopup = false
      try {
        console.log('entrou no upload img')
        //Chamar o POPUP "Waiting for a transaction"
        this.loading = true
        const type = this.src.type

        //1) Blob => base de um file
        //2) File =>
        const imageDataUri = await this.toBase64(this.src)

        const imageBuffer = Buffer.from(imageDataUri.split(',')[1], 'base64')
        const transaction = await arweave.createTransaction(
          {
            data: imageBuffer,
          },
          key
        )
        transaction.addTag('Content-Type', type)
        await arweave.transactions.sign(transaction, key)
        await arweave.transactions.post(transaction)
        // console.log("post response", postResponse);
        // console.log('getStatus',await arweave.transactions.getStatus(transaction.id))
        this.transactionInfo = {
          address: await arweave.wallets.jwkToAddress(key),
          transactionId: transaction.id,
        }

        this.fetchSomething()
        getStatus = setInterval(() => this.getTransactionStatus(), 60000)
      } catch (err) {
        console.log(err)
      }
    },
    async getTransactionStatus() {
      let status = await arweave.transactions.getStatus(
        this.transactionInfo.transactionId
      )

      console.log(status)
      if (status.status !== 202) {
        clearInterval(getStatus)
      }
      if (status.status === 200) {
        this.loading = false
        //POPSUCCESS
        this.successPopup = true

        //ATIVAR O FLUXO DE MINT
        this.renderTasks()
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
.mobile-history {
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

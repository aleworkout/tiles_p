<template>
  <div class="wallet">
    <div>
      <p @click="$emit('walletClose')" class="return-back">
        <img src="~/assets/arrow-left.svg" alt="" /> Return to editor
      </p>
    </div>

    <div class="wallet--content">
      <h2 class="wallet--title">IT'S TIME TO MAKE YOUR TILE PERMANENT</h2>
      <p v-if="error" class="error-text">
        unable to read the file or incorrect wallet key
      </p>
      <label class="element-key-label">
        <small>Select Arweave Wallet</small>
        <input @change="setWalletKey" type="file" accept="application/JSON" />
      </label>
      <a href="https://faucet.arweave.net/" target="_blank"
        >Don't have a wallet? Get one here!</a
      >
    </div>
    <div>
      <a href="https://www.arweave.org/" target="_blank">What is Arweave?</a>
    </div>
  </div>
</template>

<script>
import arweave from '../service/arweave'

export default {
  name: 'wallet',
  data: () => ({
    error: false,
  }),
  methods: {
    async setWalletKey(event) {
      this.error = false
      if (!event.target.files.length) {
        return
      }
      //Se tiver arquivo (img?) continua aqui
      //Carrega (Load) => Wallet (json)
      await this.onReaderLoad(event.target.files[0])
        .then(async (res) => {
          try {
            await arweave.wallets.jwkToAddress(JSON.parse(res))
            this.$emit('setWalletKey', JSON.parse(res))
            console.log('emit (no component)=> setWalletKey')
          } catch (err) {
            this.error = true
          }
        })
        .catch(() => {
          this.error = true
        })
    },
    onReaderLoad(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.wallet {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  &--title {
    font-size: 32px;
    color: white;
  }
  &--content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
.element-key-label {
  width: 200px;
  height: 50px;
  text-align: center;
  cursor: pointer;
  display: flex;
  font-size: 14px;
  justify-content: center;
  align-items: center;
  transition: all 0.18s ease-in-out;
  border: 1px solid #333;
  color: white;
  background-color: #ff2dac;
  border-radius: 12px;
  margin-top: 24px;
  margin-bottom: 32px;
  &:hover {
    color: white;
    background: #333;
  }
}
.error-text {
  margin-top: 12px;
  color: orangered;
}
.return-back {
  color: white;
  display: inline-flex;
  img {
    width: 16px;
    margin-right: 8px;
  }
  &:hover {
    cursor: pointer;
    color: #3d92d9;
  }
}
</style>

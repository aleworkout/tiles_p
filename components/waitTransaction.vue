<template>
  <div class="transaction-load">
    <div class="transaction-load--content">
      <h2 class="transaction-load--title">
        WAITING FOR A TRANSACTION TO BE CONFIRMED
      </h2>
      <p>This usually takes up to 15 minutes</p>
      <a
        :href="`https://viewblock.io/arweave/tx/${transactionInfo.transactionId}`"
        target="_blank"
        class="check-block-ex"
        >Check Block Explorer</a
      >
      <p>TX ID: {{ transactionInfo.transactionId }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'waitTransaction',
  props: ['transactionInfo'],
}
</script>


<style lang="scss" scoped>
.transaction-load {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  &--title {
    font-size: 32px;
    color: white;
    margin-bottom: 24px;
  }
  &--content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .check-block-ex {
    color: white;
    background-color: #ff2dac;
    border-radius: 12px;
    margin-top: 24px;
    margin-bottom: 32px;
    width: 200px;
    height: 50px;
    display: flex;
    font-size: 14px;
    justify-content: center;
    align-items: center;
    transition: all 0.18s ease-in-out;
    border: 1px solid #333;
    &:hover {
      color: white;
      background: #333;
    }
  }
}
</style>


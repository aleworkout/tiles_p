import Vue from 'vue';
import VueArweave from 'vue-arweave';

Vue.use(VueArweave, {
  network: {
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
  }
});

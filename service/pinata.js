const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
const pinList = 'https://api.pinata.cloud/data/pinList'

const pinataApiKey = '8f28b3e88dbffcab08fd'
const pinataSecretKey = 'c5e41972983192f5491f179fd3b6a45b81e0ce94023d8fc6028e33d558385419'
function getPinata(axios){
  return axios.$get(pinList, {
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey
      }
    })
    .then(function (response) {
      console.log(response)
      //handle your response here
    })
    .catch(function (error) {
      console.error(error)
      //handle error here
    });
}

function addPinata(axios, data) {
  axios.$post(url,
    data,
    {
      headers: {
        'Content-Type': `multipart/form-data; boundary= ${data._boundary}`,
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey
      }
    }
  ).then(function (response) {
    console.log(response)
    //handle response here
  }).catch(function (error) {
    console.error(error)
    //handle error here
  });
}

export default {
  getPinata,
  addPinata
}

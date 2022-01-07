import Web3 from "web3"
import artifacts from "../build/contracts/Tiles.json"

export default async function (context, inject) {
    let web3

    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum)
        console.log("aqui")
        window.ethereum.enable().catch(error => {
            console.log(error)
        })
    } else if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
        web3 = new Web3(window.web3.currentProvider)
    } else {
        const httpEndpoint = 'http://127.0.0.1:7545'
        web3 = new Web3(new Web3.providers.HttpProvider(httpEndpoint))
    }
    let networkId = await web3.eth.net.getId()
    console.log("networkId no plugin web3.js =>" + networkId)

    let contract = new web3.eth.Contract(
        artifacts.abi,
        "0x652d852F761047A53Fdc84570005E9cC6F524906"
        //updated_at 6/jan/22 17:49
    )

    //Get selected account
    let accounts = await web3.eth.getAccounts()

    inject('web3', web3)
    inject('networkId', networkId)
    inject('contract', contract)
    inject('accounts', accounts)
}
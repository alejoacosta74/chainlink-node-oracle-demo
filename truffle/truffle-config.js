require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

module.exports = {
  networks: {
    ganache: {
     host: "127.0.0.1",
     port: 7545,
     gas: 500000,
     network_id: "*",
    },
    qtum: {
      host: "127.0.0.1",
      port: 23889,      
      network_id: "*",  
      gas: 10000000,
      confirmations: 2, 
      timeoutBlocks: 40,
    },
    testnet: {
      // host: "http://testnet-janus.qiswap.com/api/",
      //port: 443,
      provider: new Web3.providers.HttpProvider("https://testnet-janus.qiswap.com/api/"),
      // provider: new HDWalletProvider({
      //   privateKeys: process.env.QTUM_KEY,
      //   providerOrUrl: "https://testnet-janus.qiswap.com/api/"
      // }),
      network_id: "*",  
      gas: 10000000,
      confirmations: 2, 
      timeoutBlocks: 40,
    },
    rinkeby: {
      provider: () => new HDWalletProvider({ mnemonic : process.env.MNEMONIC, providerOrUrl : `https://rinkeby.infura.io/v3/${process.env.INFURA_APIKEY}`, addressIndex : 0 ,  numberOfAddresses : 10}),
      network_id: "*",
      gas: 10000000,
      confirmations: 1, 
    }  
  },
  compilers: {
    solc: {
      version: "0.4.24",
    }
  }
}

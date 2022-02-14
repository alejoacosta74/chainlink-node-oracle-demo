require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    ganache: {
     host: "127.0.0.1",
     port: 7545,
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

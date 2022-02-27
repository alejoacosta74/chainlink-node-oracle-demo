const Oracle = artifacts.require('Oracle');
const getAddr = require('../../chainlink/get-addr');

module.exports = async callback => {
  const oracle = await Oracle.deployed();

  const apiAccountAddr = "0x7926223070547d2d15b2ef5e7383e541c338ffe9"; // QTUM
  // const apiAccountAddr = "0x8E913917Bfd373C15A0FD8Fde859f31d92408949"; // GANACHE
  console.log(`Setting fulfill permission to true for ${apiAccountAddr}...`);
  let receipt = await oracle.setFulfillmentPermission(apiAccountAddr, true);
  console.log(`Fulfillment succeeded! Transaction ID: ${receipt.tx}.`);

  const accountAddr = await getAddr();
  const accounts = await web3.eth.getAccounts();
  console.log(`Sending 1 ETH from ${accounts[0]} to ${accountAddr}.`);
  receipt = await web3.eth.sendTransaction({from: accounts[0], to: accountAddr, value: '1000000000000000000'});
  console.log(`Transfer succeeded! Transaction ID: ${receipt.transactionHash}.`);
  let nodeBalance = await web3.eth.getBalance(accountAddr);
  console.log("Node balance: ", nodeBalance.toString());

  callback();
}

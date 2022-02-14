const getAddr = require('../../chainlink/get-addr');

const Oracle = artifacts.require('Oracle');

module.exports = async callback => {
  const oracle = await Oracle.deployed();
  const accountAddr = await getAddr();
  console.log(`Setting fulfill permission to true for ${accountAddr}...`);
  let receipt = await oracle.setFulfillmentPermission(accountAddr, true);
  console.log(`Fulfillment succeeded! Transaction ID: ${receipt.tx}.`);

  const accounts = await web3.eth.getAccounts();
  console.log(`Sending 1 ETH from ${accounts[0]} to ${accountAddr}.`);
  receipt = await web3.eth.sendTransaction({from: accounts[0], to: accountAddr, value: '1000000000000000000'});
  console.log(`Transfer succeeded! Transaction ID: ${receipt.transactionHash}.`);

  callback();
}

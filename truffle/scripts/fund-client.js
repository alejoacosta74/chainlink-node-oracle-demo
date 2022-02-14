const GanacheChainlinkClient = artifacts.require('GanacheChainlinkClient');
const LinkToken = artifacts.require('LinkToken');

module.exports = async callback => {
  const ganacheClient = await GanacheChainlinkClient.deployed();
  const tokenAddress = await ganacheClient.getChainlinkToken();
  const token = await LinkToken.at(tokenAddress);
  console.log(`Transferring 50 LINK to GanacheClient (address ${ganacheClient.address})...`);
  const receipt = await token.transfer(ganacheClient.address, `50000000000000000000`);
  console.log(`Transfer succeeded! Transaction ID: ${receipt.tx}.`);
  callback();
}

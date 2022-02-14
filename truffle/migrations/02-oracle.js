const fs = require('fs');
const path = require('path');

let LinkToken = artifacts.require('LinkToken');
let Oracle = artifacts.require('Oracle');

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(LinkToken);
  await deployer.deploy(Oracle, LinkToken.address);
  let addrFile;

  switch (network){
    case "ganache":
      addrFile = path.join(__dirname, '..', 'build', 'addrs.env');
      break;
    case "qtum":
      addrFile = path.join(__dirname, '..', 'build', 'qtum_addrs.env');
      break;
    default:
      addrFile = path.join(__dirname, '..', 'build', 'default_addrs.env');
      break;
  }

  try {
    fs.unlinkSync(addrFile);
  } catch {
    // delete if exists; ignore errors
  }

  fs.writeFileSync(addrFile, `LINK_CONTRACT_ADDRESS=${LinkToken.address}\nORACLE_CONTRACT_ADDRESS=${Oracle.address}\n`);
};

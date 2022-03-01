![chainlink](https://img.shields.io/badge/chainlink-375BD2?style=for-the-badge&logo=chainlink&logoColor=white) ![solidity](https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black) ![ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)  ![javascript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) ![docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white) ![postgres](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![golang](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)<img src="https://camo.githubusercontent.com/4485d17c3a177657700243cda0c3c8e78423102f11fbacbd9bb40d20cb1f0f27/68747470733a2f2f74727566666c6573756974652e636f6d2f696d672f74727566666c652d6c6f676f2d6461726b2e737667" height=70 />


# Running a local Chainlink node with Oracle contract

Step by step guide to run a Chainlink consumer test with a local chainlink node on Qtum, Rinkeby or Ganache chains.

Ref: https://docs.chain.link/docs/fulfilling-requests/

![chainlink poc](demo.png "chainlink-demo")


## Dependencies

This project has a number of dependencies, including but not limited to: Node.js, Ganache and Docker.

## Basic deployment to Gananche

- Before using this project, start a Ganache workspace that includes `./truffle/truffle-config.js` from this project and serves
on all interfaces (`0.0.0.0`).

- Run `npm start` to migrate the Truffle contracts and start a Chainlink node that is connected to Ganache.

- Run `npm run truffle:init-setup` to fund the deployed Chainlink client contract with `LINK`, fund your Chainlink node
with ETH and give the address of your Chainlink node fulfillment permissions on the deployed oracle contract.

- Run `npm run stop` to shutdown the Chainlink node.

## Custom deployment to Ganache/Rinkeby

- Migrate contracts with truffle

```
truffle migrate --network ganache|qtum|rinkeby
```

- Start Chainlink node

```
./chainlink/start-cl.sh
```


- Fund Client contract with LINK

```
truffle exec ./scripts/request-price.js --network ganache|qtum|rinkeby
```

- Setting fullfilment and funding Chainlink addres
  
```
truffle exec ./scripts/prep-node.js --network ganache|qtum|rinkeby
```

-  Define a Chainlin Job
Use your web browser and the Chainlink node web UI (`localhost:6688`) to add the following job to your Chainlink node

```toml
type = "directrequest"
schemaVersion = 1
name = "Get > Uint256"
# Optional External Job ID: Automatically generated if unspecified
# externalJobID = "b1d42cd5-4a3a-4200-b1f7-25a68e48aad8"
contractAddress = "YOUR_ORACLE_CONTRACT_ADDRESS"
maxTaskDuration = "0s"
observationSource = """
    decode_log   [type="ethabidecodelog"
                  abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                  data="$(jobRun.logData)"
                  topics="$(jobRun.logTopics)"]

    decode_cbor  [type="cborparse" data="$(decode_log.data)"]
    fetch        [type="http" method=GET url="$(decode_cbor.get)"]
    parse        [type="jsonparse" path="$(decode_cbor.path)" data="$(fetch)"]
    multiply     [type="multiply" input="$(parse)" times=100]
    encode_data  [type="ethabiencode" abi="(uint256 value)" data="{ \\"value\\": $(multiply) }"]
    encode_tx    [type="ethabiencode"
                  abi="fulfillOracleRequest(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes32 data)"
                  data="{\\"requestId\\": $(decode_log.requestId), \\"payment\\": $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration), \\"data\\": $(encode_data)}"
                 ]
    submit_tx    [type="ethtx" to="YOUR_ORACLE_CONTRACT_ADDRESS" data="$(encode_tx)"]

    decode_log -> decode_cbor -> fetch -> parse -> multiply -> encode_data -> encode_tx -> submit_tx
"""

```

Replace `<YOUR_ORACLE_CONTRACT_ADDRESS>` with your oracle contract address, enclosed in quotation marks. You can find
this value on the configuration page for your Chainlink node.

The credentials to login to the Chainlink node are `user@example.com/password`.

- Request ETH price

```
truffle exec ./scripts/request-price.js --network ganache|qtum|rinkeby
```

## Running chainlink as a binary

Alternatively, Chainlink node can be ran as a binary by executing following steps (qtum example)

1. Start postgres docker container
```
cd postgres
docker-compose up -d
```

2. Create DB for Qtum Testnet
  
```
psql --host=127.0.0.1 -p 5432 --dbname dbchainlink --username=dbuser --password --command="CREATE DATABASE qtumtestnet WITH OWNER dbuser"
```

3. Start chainlink node

- Source environment vars

```
source qtum-testnet.env
```

- Start chainlink

```
source ./chainlink/qtum_testnet.env
cd <location of chainlink node repo>/core
go run main.go local n -p $NODEPWD -a $APIPWD
```

or
```
./chainlink local n -p $NODEPWD -a $APIPWD
```

4. Test web Node Operator GUI

http://localhost:6688/signin


## Deployment addresses

```bash
Network: Rinkeby (id: 4)
  GanacheChainlinkClient: 0xf58e65d6489208eC56d7F4Fc2EF5DDdE7D915d36
  LinkToken: 0x86F24969877A4dc4334F7416AF1A6e68D49B8469
  Migrations: 0x6AE9F1692C7539cc4E90cA91Ca774d3d98B2b1Ed
  Oracle: 0x4E1d35fE640537558547A61F3E016B6b71C8B203
```

```bash
  GanacheChainlinkClient: 0x80d2f667e6bBf6Ab2937d1F6697903f858dd9090
  LinkToken: 0xE9555c1F9C8C97eeF5D4D9B37f8de07B6B359547
  Migrations: 0x21Cad20E7a8b6aFb3268A9c2Ba6575356784dC13
  Oracle: 0x7fD9A5E7a38CC396609cf389364e9504F14A5ee6
```
## Miscelaneous


### Updating env vars

- frontend
  
Update `App.js` accordingly:

```javascript
const backendURL = "http://127.0.0.1:3000/demo";
const JANUS="ws://54.193.12.166:23889";
```

- backend

Update `.env` :

```bash
JANUS="http://54.193.12.166:23889"
```

- Chainlink

Update `qtum_testnet.env`:

```bash
export ETH_URL=ws://54.193.12.166:23889
export DATABASE_URL=postgresql://dbuser:dbpass@127.0.0.1:5432/qtumchainlinkdev?sslmode=disable
```

### Wallets

Backend API expects a qtum node running with a local (funded) wallet for address `qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW`

### Subscribing to Oracle event

You can subscribe to `OracleRequest` event by running the following golang listener

```bash
cd utils
go run subscribe_oracle.go qtum 23890
```

### Deployment to Rinkeby

Create a `.env` file inside `truffle` folder with the infura credentials and seed phrase

```
MNEMONIC="<seed phrase>"
INFURA_APIKEY="<api key>"
```

### Chailink node address

Regular address
```
hex: "0x78Ad4cB180b93Af91D24f3A62A0346DB15E834F3"
base58: qUZTr7kDgpZDn6uctfv6sHZ4esJPJanCKR
```

Emergency funding address
```
hex: "0x4e07e496c5F6b93Ca913c3f20C1838F772c272e7"
base58: qQfyKQPsTLtnzp2Nnr9e5PuByLzXnVQduM
```

### start backend API 


```
NODE_ENV=production && pm2 start npm --name "qtum-api" -- start
```

### frontend web UI

![webui](frontend.png)
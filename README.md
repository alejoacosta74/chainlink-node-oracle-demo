![chainlink](https://img.shields.io/badge/chainlink-375BD2?style=for-the-badge&logo=chainlink&logoColor=white) ![solidity](https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black) ![ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)  ![javascript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) ![docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white) ![postgres](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![golang](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)<img src="https://camo.githubusercontent.com/4485d17c3a177657700243cda0c3c8e78423102f11fbacbd9bb40d20cb1f0f27/68747470733a2f2f74727566666c6573756974652e636f6d2f696d672f74727566666c652d6c6f676f2d6461726b2e737667" height=70 />


# Running a local Chainlink node with Oracle contract

Step by step guide to run a Chainlink oracle-consumer demo with a local chainlink node on Qtum testnet

Ref: https://docs.chain.link/docs/fulfilling-requests/

## 1. Overview diagram


<img src="./backend/qtum-api.png" height=600 align="center">


## 2. Project structure

### `backend`

API endpoints to fire Tx to qtum network

### `chainlink`

Configuration and environment files for chainlink node

### `frontend`

React Web UI to interact with the consumer contract

## `go-ethereum`

Custom go-ethereum types to enable interaction with Janus

### `helpers`

golang programs for testing subscription to oracle and consumer events

### `postgres`

docker-compose config to spin up a postgres container

### `trufle`

Truffle project with smart contrats, migration scripts and deployment scripts

## 3. Custom go-ethereum package

Current version of Janus requires a customized go-ethereum package for interoperatibility with Chainlink.

1. Clone chainlink repo and install dependencies

```sh
git clone https://github.com/smartcontractkit/chainlink
cd chainlink
yarn install
make install
```
2. Replace go-ethereum files

```sh
sudo cp ./go-ethereum/block.go.qtum $GOPATH/pkg/mod/github.com/ethereum/go-ethereum@v1.10.11/core/types/block.go
sudo cp ./go-ethereum/gen_header_json.go.qtum $GOPATH/pkg/mod/github.com/ethereum/go-ethereum@v1.10.11/core/types/gen_header_json.go
```

## 4. Deployment to Qtum testnet

1. Start postgres docker container

```sh
cd postgres
docker-compose up -d
```

2. Create DB for Qtum Testnet
  
```sh
psql --host=127.0.0.1 -p 5432 --dbname dbchainlink --username=dbuser --password --command="CREATE DATABASE qtumtestnet WITH OWNER dbuser"
```

3. Start chainlink node

- Source environment vars

```
source qtum-testnet.env
```

- Start chainlink

```
cd <location of chainlink node repo>/core
go run main.go local n -p $NODEPWD -a $APIPWD
```

or
```
./chainlink local n -p $NODEPWD -a $APIPWD
```


- Migrate contracts with truffle

```
truffle migrate --network ganache|qtum|rinkeby
```


- Fund Client contract with LINK

```
truffle exec ./scripts/request-price.js --network ganache|qtum|rinkeby
```

- Setting fullfilment and funding Chainlink addres
  
```
truffle exec ./scripts/prep-node.js --network ganache|qtum|rinkeby
```

- Open web Node Operator GUI

http://localhost:6688/signin

-  Define a Chainlin Job
Use your web browser and the Chainlink node web UI (`localhost:6688`) to add the following job to your Chainlink node

```toml
type = "directrequest"
schemaVersion = 1
name = "Send price v1"
externalJobID = "ebbac656-22f5-4a8d-bee2-bcb8328837ca"
maxTaskDuration = "0s"
contractAddress = `<YOUR_ORACLE_CONTRACT_ADDRESS>`
minIncomingConfirmations = 0
observationSource = """
    decode_log   [type="ethabidecodelog"
                  abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                  data="$(jobRun.logData)"
                  topics="$(jobRun.logTopics)"]

    decode_cbor  [type="cborparse" data="$(decode_log.data)"]
    fetch        [type="http" method=GET url="$(decode_cbor.get)"]
    parse       [type="jsonparse" path="$(decode_cbor.path)" data="$(fetch)"]
    post         [type="http" method=POST url="http://127.0.0.1:3000/api/qtum/" allowUnrestrictedNetworkAccess=true 
requestData="{\\"price\\": $(parse), \\"requestId\\": $(decode_log.requestId), \\"payment\\": $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration)}"]

     decode_log -> decode_cbor -> fetch -> parse -> post
"""
```

Replace `<YOUR_ORACLE_CONTRACT_ADDRESS>` with your oracle contract address, enclosed in quotation marks. You can find
this value on the configuration page for your Chainlink node.

The credentials to login to the Chainlink node are `user@example.com/password`.

## 4. Run demo: Request ETH price to Oracle

Ethereum price request shall be performed via truffle or via web UI

### truffle

```
truffle exec ./scripts/request-price.js --network ganache|qtum|rinkeby
```

### Web UI

<img src="./frontend.png" height=300>


## 5. Miscelaneous

### Deployment addresses

```javascript
  GanacheChainlinkClient: 0x80d2f667e6bBf6Ab2937d1F6697903f858dd9090
  LinkToken: 0xE9555c1F9C8C97eeF5D4D9B37f8de07B6B359547
  Migrations: 0x21Cad20E7a8b6aFb3268A9c2Ba6575356784dC13
  Oracle: 0x7fD9A5E7a38CC396609cf389364e9504F14A5ee6
```

### Hosting servers

Server IP: 104.154.24.91
Instances running:
- qtumd (testnet)
- janus
- chainlink node
- backend api

Server IP: 52.53.209.56
Instances running:
- frontend React server (http://52.53.209.56:3000/)


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

```javascript
MNEMONIC="<seed phrase>"
INFURA_APIKEY="<api key>"
```

### Chailink node address

Regular address
```javascript
hex: "0x78Ad4cB180b93Af91D24f3A62A0346DB15E834F3"
base58: qUZTr7kDgpZDn6uctfv6sHZ4esJPJanCKR
```

Emergency funding address
```javascript
hex: "0x4e07e496c5F6b93Ca913c3f20C1838F772c272e7"
base58: qQfyKQPsTLtnzp2Nnr9e5PuByLzXnVQduM
```

### start backend API 

```
NODE_ENV=production && pm2 start npm --name "qtum-api" -- start
```
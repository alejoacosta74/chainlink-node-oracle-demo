import React, {useState , useEffect} from "react";
import Web3 from "web3";
import axios from "axios";
import ClientContract from "./contracts/GanacheChainlinkClient.json";
import OracleContract from "./contracts/Oracle.json";
import { Col, Row, Card, CardBody, CardHeader, Nav, Badge, Button, NavbarBrand, NavLink, Navbar, Spinner, CardTitle } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import Demo from "./demo.png"
import "./App.css";

const backendURL = "http://127.0.0.1:3000/demo";
// const JANUS="wss://testnet-janus.qiswap.com/api/"
const JANUS="ws://54.193.12.166:23889";

function App(){
  const [price, setPrice] = useState(undefined);
  const [web3, setWeb3] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [oracle, setOracle] = useState(undefined);
  const [receipt, setReceipt] = useState(undefined);
  const [oracleEvent, setOracleEvent] = useState(undefined);

  useEffect(()=> {
    if (typeof web3 == 'undefined' && typeof contract == 'undefined') {
      const init = async () => {
        try {
          const web3 = await new Web3(JANUS);
          const clientContract = new web3.eth.Contract(
            ClientContract.abi,
            ClientContract.networks[8889].address
          );
          const oracleContract = new web3.eth.Contract(
            OracleContract.abi,
            OracleContract.networks[8889].address
            );
          
          setWeb3(web3);
          setContract(clientContract);
          setOracle(oracleContract);
            
          } catch (error) {
            console.error(error);
          }
        }
        init();
      }
    }, [web3, contract, oracle]);

  useEffect(() => {
    const load = async () => {
      await contract.events.RequestEthereumPriceFulfilled({})
      .on('data', (event) =>{
          let receivedPrice = event.returnValues.price.toString();
          setPrice(receivedPrice)
          console.log('Received price: ', receivedPrice);
          console.log(event.returnValues)    
      })
      .on('error', (error) => {
        console.log(error);
      })
    }

    if (typeof web3 !== 'undefined' && typeof contract !== 'undefined') {
        load();
    }
  }, [web3, contract])

  useEffect(() => {
    const subscribeOracle = async () => {
      await oracle.events.OracleRequest({})
      .on('data', (event) =>{
          let requester = event.returnValues.requester;
          let callbackAddr = event.returnValues.callbackAddr;
          let requestId = event.returnValues.requestId;
          setOracleEvent("Requester: " + requester + "\n\rCallBack Address: " + callbackAddr + "\n\rJobID: " + requestId);
          console.log("OracleEvent: ",event.returnValues)    
      })
      .on('error', (error) => {
        console.log(error);
      })
    }
    if (typeof web3 !== 'undefined' && typeof oracle !== 'undefined') {
        subscribeOracle();
    }
  }, [web3, oracleEvent, oracle])


  const sendTX = async () => {
    setPrice(null);
    setOracleEvent(null);
    setReceipt(null);
    axios
      .post(backendURL, {})
      .then((response) => {
        setReceipt(response.data);
        console.log("response: ", response);
      });
  }

  const reset = async () => {
    setPrice(undefined);
    setOracleEvent(undefined);
    setReceipt(undefined);
    setWeb3(undefined);
    setContract(undefined);
    setOracle(undefined);
  }

  let content;
  if (typeof receipt == 'undefined') {
    content = "No receipt";
  } else if (receipt == null) {
      content = <Spinner>"Waiting for TX receipt"</Spinner>;
      } else {
        content = receipt;
  }
  
  let oracleContent;
  if (typeof oracleEvent == 'undefined') {
    oracleContent = "No event";
  } else if (oracleEvent == null) {
    oracleContent = <Spinner>"Waiting for Oracle event"</Spinner>;
  } else {
    oracleContent = oracleEvent;
  }

  let priceContent;
  if (typeof price == 'undefined') {
    priceContent = "No price";
  } else if (price == null) {
    priceContent = <Spinner>"Waiting for price"</Spinner>;
  } else {
    priceContent = price;
  }


  if (typeof web3 == 'undefined' || typeof contract == 'undefined') {
      return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <div className="App">
      <Navbar className="App-header">
        <Nav tag="h2">Qtum Oracle App Demo</Nav>
        <Nav ><Badge pill color="light">
          <NavLink href="http://localhost:6688">Oracle Operator Panel</NavLink>
        </Badge></Nav>
      </Navbar>

      <Row className="App-row">
        <Col className="bg-light border" xs="5">
        <Navbar><Nav tag="h3">Smart contract layout</Nav></Navbar>  
        <Card align="center">
          <CardBody>
            <img
            alt="smart contracts"
            src={Demo}
            width="90%"
            />
          </CardBody>
        </Card>
        </Col>
      </Row>  

      <Row className="App-row">
      <Col className="bg-light border" xs="4">
        <Card inverse body color="info" >
          <CardHeader tag="h2">1. Request price</CardHeader>
          <CardBody className="CardBody">{content}<br/></CardBody>
          <Button color="danger" onClick={sendTX}>Send Tx!!</Button>
        </Card>
      </Col>
      <Col className="bg-light border" xs="4">
        <Card inverse body color="warning" >
          <CardHeader tag="h2">2. Oracle Event</CardHeader>
          <CardBody className="CardBody" >{oracleContent}<br/></CardBody>
        </Card>
      </Col>
      <Col className="bg-light border" xs="2">
        <Card inverse body color="success" >
          <CardHeader tag="h2">3. ETH Price</CardHeader>
          <CardBody className="CardBody">{priceContent}<br/></CardBody>
        </Card>
      </Col>
      </Row>
      <Button color="info" outline onClick={reset}>Reset</Button>


    </div>
  );

}

/*
class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 5 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 42</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValue}</div>
      </div>
    );
  }
}
*/
export default App;

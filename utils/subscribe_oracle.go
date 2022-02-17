package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"math/big"
	"os"
	"reflect"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

const ORACLE_ABI = `[{"constant":true,"inputs":[],"name":"EXPIRY_TIME","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_link","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"specId","type":"bytes32"},{"indexed":false,"name":"requester","type":"address"},{"indexed":false,"name":"requestId","type":"bytes32"},{"indexed":false,"name":"payment","type":"uint256"},{"indexed":false,"name":"callbackAddr","type":"address"},{"indexed":false,"name":"callbackFunctionId","type":"bytes4"},{"indexed":false,"name":"cancelExpiration","type":"uint256"},{"indexed":false,"name":"dataVersion","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"OracleRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"requestId","type":"bytes32"}],"name":"CancelOracleRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"onTokenTransfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_sender","type":"address"},{"name":"_payment","type":"uint256"},{"name":"_specId","type":"bytes32"},{"name":"_callbackAddress","type":"address"},{"name":"_callbackFunctionId","type":"bytes4"},{"name":"_nonce","type":"uint256"},{"name":"_dataVersion","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"oracleRequest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_requestId","type":"bytes32"},{"name":"_payment","type":"uint256"},{"name":"_callbackAddress","type":"address"},{"name":"_callbackFunctionId","type":"bytes4"},{"name":"_expiration","type":"uint256"},{"name":"_data","type":"bytes32"}],"name":"fulfillOracleRequest","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_node","type":"address"}],"name":"getAuthorizationStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_node","type":"address"},{"name":"_allowed","type":"bool"}],"name":"setFulfillmentPermission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_recipient","type":"address"},{"name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"withdrawable","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_requestId","type":"bytes32"},{"name":"_payment","type":"uint256"},{"name":"_callbackFunc","type":"bytes4"},{"name":"_expiration","type":"uint256"}],"name":"cancelOracleRequest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]`

/*
OracleRequestEvent(
   bytes32 indexed specId,
    address requester,
    bytes32 requestId,
    uint256 payment,
    address callbackAddr,
    bytes4 callbackFunctionId,
    uint256 cancelExpiration,
    uint256 dataVersion,
    bytes data
  );
*/

type OracleRequestEvent struct {
	// SpecId             [32]byte
	Requester          common.Address `json:"requester"`
	RequestId          [31]byte       `json:"requestId"`
	Payment            big.Int        `json:"payment"`
	CallbackAddr       common.Address `json:"callbackAddr"`
	CallbackFunctionId [3]byte        `json:"callbackFunctionId"`
	CancelExpiration   big.Int        `json:"cancelExpiration"`
	DataVersion        big.Int        `json:"dataVersion"`
	Data               []byte         `json:"data"`
}

//! Oracle Event signature:
//* OracleRequest(bytes32,address,bytes32,uint256,address,bytes4,uint256,uint256,bytes)
//! TOPIC1
//* d8d7ecc4800d25fa53ce0372f13a416d98907a7ef3d8d3bdd79cf4fe75529c65
//! TOPIC2
//* 6237333635656633646232353465353939353137346364313865343731633131 //job id

func printJsonTypes(x interface{}) {
	xVal := reflect.ValueOf(x)
	xType := xVal.Type()
	fmt.Printf("\n\t=>type: %s\n", xType)
	if reflect.ValueOf(x).Kind() == reflect.Struct {
		for i := 0; i < xVal.NumField(); i++ {
			fmt.Printf("\t\t=>Struct field name: %s\n\t\t=>Struct field type: %s \n\t\t=>Struct field value: %+v\n\n",
				xType.Field(i).Name, xVal.Field(i).Type(), xVal.Field(i).Interface())
		}
	}
	if xVal.Kind() == reflect.Interface || xVal.Kind() == reflect.Ptr {
		fmt.Printf("\t\t=>xVal.Kind: %s \n", xVal.Kind())
		fmt.Printf("\t\t=>xType.Elem: %s \n", xType.Elem())
		fmt.Printf("\t\t=>xVal.Elem %v \n", xVal.Elem())
		fmt.Printf("\t\t=>xVal.Interface: %+v \n", xVal.Interface())

	}
}

func main() {

	provider, envfile := parseArgs()
	client, err := ethclient.Dial(provider)
	if err != nil {
		log.Fatal(err)
	}

	oracleAddr := readOracleAddress(envfile)
	contractAddress := common.HexToAddress(oracleAddr)
	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
	}

	contractAbi, err := abi.JSON(strings.NewReader(ORACLE_ABI))
	if err != nil {
		log.Fatal(err)
	}

	logsCh := make(chan types.Log)
	sub, err := client.SubscribeFilterLogs(context.Background(), query, logsCh)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to blockchain")

	for {
		select {
		case err := <-sub.Err():
			log.Fatal(err)
		case vLog := <-logsCh:
			fmt.Println("\nprinting received eth LOG (vLog):")
			printJsonTypes(vLog)
			fmt.Println("Tx hash: ", vLog.TxHash.Hex())
			em := make(map[string]interface{})
			err = contractAbi.UnpackIntoMap(em, "OracleRequest", vLog.Data)
			if err != nil {
				log.Println("Error when calling UnpackIntoMap: ", err)

			} else {
				fmt.Println("printing revceived map event:")
				for i, val := range em {
					fmt.Printf("Map[%s] => (value) %s \\ (type) %T\n", i, fmt.Sprintf("%+v", val), val)

				}
			}

			var topics [4]string
			for i := range vLog.Topics {
				topics[i] = vLog.Topics[i].Hex()
			}

			fmt.Println("Topic[0]: ", topics[0])
		}
	}
}

func readOracleAddress(envfile string) (oracleAddr string) {
	file, err := os.Open("../chainlink/" + envfile)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		if strings.Contains(scanner.Text(), "ORACLE_CONTRACT_ADDRESS") {
			oracleAddr = strings.SplitAfter(scanner.Text(), "=")[1]
			fmt.Println("oracleAddr: ", oracleAddr)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
	return oracleAddr
}

func parseArgs() (provider, envfile string) {
	if len(os.Args) < 3 {
		panic("Please provide 'network' and 'port'")
	}
	network := os.Args[1]
	port := os.Args[2]
	provider = "ws://127.0.0.1:"
	switch network {
	case "qtum":
		provider += port
		envfile = "qtum_testnet.env"
	case "ganache":
		provider += "7545"
		envfile = "ganache.env"
	}
	return provider, envfile

}

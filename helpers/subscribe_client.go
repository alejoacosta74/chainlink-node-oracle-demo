package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"
	"reflect"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

//! expected order of events emmited by Client contract
// 1st event
//* Signature: ChainlinkRequested(bytes32)
//* Topic[0]: 0xb5e6e01e79f91267dc17b4e6314d5d4d03593d2ceee0fbb452b750bd70ea5af9

// 2nd event
//* Signature: ChainlinkFulfilled(bytes32)
//* Topic[0]: 0x7cc135e0cebb02c3480ae5d74d377283180a2601f8f644edf7987b009316c63a

// 3rd event
//* Signature: RequestEthereumPriceFulfilled(bytes32,uint256)
//* Topic[0]: 0x794eb9e29f6750ede99e05248d997a9ab9fa23c4a7eaff8afa729080eb7c6428

const CLFULL_ABI = `[{"anonymous": false,"inputs": [{"indexed": true,"name": "id","type": "bytes32"}],"name": "ChainlinkFulfilled","type": "event"}]`

func main() {

	provider, envfile := parseArgs()
	client, err := ethclient.Dial(provider)
	if err != nil {
		log.Fatal(err)
	}

	clientAddr := readClientAddress(envfile)
	contractAddress := common.HexToAddress(clientAddr)
	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
	}

	contractAbi, err := abi.JSON(strings.NewReader(CLFULL_ABI))
	if err != nil {
		log.Println("Error reading ABI: ", err)
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
			err = contractAbi.UnpackIntoMap(em, "ChainlinkFulfilled", vLog.Data)
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
				fmt.Printf("Topic[%d]: %+v\n", i, topics[i])
			}

		}
	}
}

func readClientAddress(envfile string) (clientAddr string) {
	file, err := os.Open("../chainlink/" + envfile)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		if strings.Contains(scanner.Text(), "CLIENT_CONTRACT_ADDRESS") {
			clientAddr = strings.SplitAfter(scanner.Text(), "=")[1]
			fmt.Println("clientAddr: ", clientAddr)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
	return clientAddr
}

func parseArgs() (provider, envfile string) {
	network := os.Args[1]
	provider = "ws://127.0.0.1:"
	switch network {
	case "qtum":
		if len(os.Args) < 2 {
			panic("missing port argument")
		}
		provider += os.Args[2]
		envfile = "qtum_testnet.env"
	case "ganache":
		provider += "7545"
		envfile = "ganache.env"
	case "testnet":
		provider = "wss://testnet-janus.qiswap.com/api/"
		envfile = "qtum_testnet.env"
	}
	return provider, envfile

}

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

package main

import (
	"fmt"
	"os"
	"reflect"
)

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

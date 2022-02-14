#! /bin/bash

source $(pwd)/chainlink/chainlink-dev.env
source $(pwd)/truffle/build/addrs.env
ETH_URL=ws://127.0.0.1:7545
NODEPWD=$(pwd)/chainlink/chainlink.pwd
APIPWD=$(pwd)/chainlink/api.pwd
DATABASE_URL=postgresql://dbuser:dbpass@127.0.0.1:5432/chainlinkdev?sslmode=disable
LOG_LEVEL=debug
LOG_SQL=true
cd /Users/alejoacosta/code/chainlink/node/core 
go run main.go local n -p $NODEPWD -a $APIPWD
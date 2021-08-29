#!/bin/sh

echo "Generating module"
nest g module $1
echo "Generating controller"
nest g controller $1
echo "Generating service"
nest g service $1

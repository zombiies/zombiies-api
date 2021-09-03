#!/bin/sh

NEST="npx @nestjs/cli"

echo "Generating module"
$NEST g module $1
echo "Generating service"
$NEST g service $1

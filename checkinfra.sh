#!/bin/bash

hasinfrachanges="$(git diff | grep '**/infra-shared')"

if [[ $1 = 'deploy' ]]
then
	echo "deploying infra-shared"
	deployinfra=$(nx deploy infra-shared)
	echo 'deployed infra-shared'
	echo $deployinfra
	exit 1
fi


if [[ $hasinfrachanges ]]
then
	echo 'detected infra changes\n'
	echo "------------------\n"
	echo $hasinfrachanges
	echo '\n'

	buildinfra=$(nx build infra-shared --skip-nx-cache)
	echo 'built infra-shared'
	echo $buildinfra
else
	echo "no changes in infra"
fi
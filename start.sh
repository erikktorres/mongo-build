#! /bin/bash -eu

DATA_DIR=`cat config/config.conf | grep "^dbpath" | cut -d '=' -f 2-`
if [ ! -d ${DATA_DIR} ];
then
  echo "Creating data dir[${DATA_DIR}]"
  mkdir -p ${DATA_DIR}
fi

exec bin/mongod --config config/config.conf

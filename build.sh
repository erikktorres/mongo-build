#! /bin/bash -eu

CURR_DIR=`pwd`
DIR=`dirname $0`
cd ${DIR}

MONGO_VERSION=r2.8.4
MONGO_REPO=https://github.com/mongodb/mongo.git
NUM_CPUS=`cat /proc/cpuinfo | grep processor | wc -l`
TARGET_DIR=${DIR}/target
CHECKOUT_DIR=${TARGET_DIR}/scratch/mongo

echo "Building Mongo:"
echo "Version: ${MONGO_VERSION}"
echo "Repo:    ${MONGO_REPO}"
echo "CPUs:    ${NUM_CPUS}"
sleep 2

git clone ${MONGO_REPO} ${CHECKOUT_DIR}
cd ${CHECKOUT_DIR}

if [ -z "`git tag | grep ${MONGO_VERSION}`" ];
then
  echo "Unknown mongo version[${MONGO_VERSION}]";
  exit 1;
fi
git checkout -q tags/${MONGO_VERSION}

sed -i 's/"-Werror", //' SConstruct
sed -i 's/"-Werror"//' src/third_party/v8/SConstruct

scons -j ${NUM_CPUS} --64 --ssl --prefix ${DIR} install
cd ${DIR}
rm -rf ${TARGET_DIR}

cd ${CURR_DIR}

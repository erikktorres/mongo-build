#! /bin/bash -eu

CURR_DIR=`pwd`
DIR=`dirname $0`
cd ${DIR}

MONGO_VERSION=r2.4.8
MONGO_REPO=https://github.com/mongodb/mongo.git
NUM_CPUS=`cat /proc/cpuinfo | grep processor | wc -l`
TARGET_DIR=${DIR}/target
CHECKOUT_DIR=${TARGET_DIR}/scratch/mongo

echo "Building Mongo:"
echo "Version: ${MONGO_VERSION}"
echo "Repo:    ${MONGO_REPO}"
echo "CPUs:    ${NUM_CPUS}"
sleep 2

DEPENDENCIES=("scons" "libssl-dev");
UNINSTALLED_DEPS=(""); #Put an empty value in the array to initialize

for dep in "${DEPENDENCIES[@]}";
do
  if [ -z "`aptitude search ${dep} | grep \"i \+${dep} \"`" ];
  then
    echo "${dep} not installed"
    UNINSTALLED_DEPS=("${UNINSTALLED_DEPS[@]}" ${dep});
  fi
done;

if [ ${#UNINSTALLED_DEPS[@]} -gt 1 ] # The empty value doesn't count
then
  echo "Some[`expr ${#UNINSTALLED_DEPS[@]} - 1`] build dependencies are not installed, please run:"
  echo "sudo aptitude install ${UNINSTALLED_DEPS[@]}"
  exit 2;
fi

if [ -e ${TARGET_DIR} ];
then
  echo "Target dir[${TARGET_DIR}] exists, removing."
  rm -rf ${TARGET_DIR}
fi

git clone ${MONGO_REPO} ${CHECKOUT_DIR}
cd ${CHECKOUT_DIR}

if [ -z "`git tag | grep ${MONGO_VERSION}`" ];
then
  echo "Unknown mongo version[${MONGO_VERSION}]";
  exit 1;
fi
git checkout -q tags/${MONGO_VERSION}

# Remove "-Werror" command-line arguments for compilation.  These set warnings
# to be errors and cause failures when compiling boost and v8
sed -i 's/"-Werror", //' SConstruct src/third_party/v8/SConscript

scons -j ${NUM_CPUS} --64 --ssl --prefix ${DIR} install
cd ${DIR}
rm -rf ${TARGET_DIR}

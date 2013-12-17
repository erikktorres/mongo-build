!# /bin/bash -eu

mkdir target
cd target
git clone https://github.com/mongodb/mongo.git
cd mongo
git checkout tags/r2.8.4

sed -i 's/"-Werror", //' SConstruct
sed -i 's/"-Werror"//' third-party/v8/SConstruct

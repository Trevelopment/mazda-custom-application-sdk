BASE=$(dirname $(greadlink -f $0))

#JCI folder we use
JCI=${BASE}/jci 

#sdcard (location of casdk)
SDCARD=${BASE}/../build/sdcard

#application location (can be same as sdcard)
APP=${BASE}/../apps

rm ${JCI}/gui/apps/custom/apps
mkdir -p ${JCI}/gui/apps/custom
ln -sf ${SDCARD}/system/js ${JCI}/gui/apps/custom/js 2>&1
ln -sf ${SDCARD}/system/css ${JCI}/gui/apps/custom/css 2>&1
ln -sf ${SDCARD}/system/templates ${JCI}/gui/apps/custom/templates 2>&1
ln -sf ${SDCARD}/system/runtime ${JCI}/gui/apps/custom/runtime 2>&1
ln -sf ${APP} ${JCI}/gui/apps/custom/apps 2>&1

node ${BASE}/server.js &
nodepid=$!

websocketd --port=9999 --devconsole bash &
wspid=$!

echo kill $nodepid > quit.sh
echo kill $wspid >> quit.sh
chmod 755 quit.sh
#call ./quit.sh to stop simulation
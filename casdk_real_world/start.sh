BASE=$(dirname $(greadlink -f $0))

rm ${BASE}/jci/gui/apps/custom/apps
mkdir -p ${BASE}/jci/gui/apps/custom
ln -sf ${BASE}/../build/sdcard/system/js ${BASE}/jci/gui/apps/custom/js 2>&1
ln -sf ${BASE}/../build/sdcard/system/css ${BASE}/jci/gui/apps/custom/css 2>&1
ln -sf ${BASE}/../build/sdcard/system/templates ${BASE}/jci/gui/apps/custom/templates 2>&1
ln -sf ${BASE}/../build/sdcard/system/runtime ${BASE}/jci/gui/apps/custom/runtime 2>&1
ln -sf ${BASE}/../apps ${BASE}/jci/gui/apps/custom/apps 2>&1
#ln -sf /tmp/root ${BASE}/jci/gui/apps/custom/data 2>&1

node ${BASE}/server.js &
nodepid=$!
websocketd --port=9999 --devconsole bash &
wspid=$!
Opera.app/Contents/MacOS/Opera -nomail file://localhost${BASE}/jci/gui/index.html &
echo kill pid $nodepid > quit.sh
echo kill pid $wspid >> quit.sh
echo "osascript -e 'quit app \"Opera\"'" >> quit.sh
chmod 755 quit.sh
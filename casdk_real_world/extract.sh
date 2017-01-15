for f in *_reinstall.up; do
	if [ ! -d $(basename $f _reinstall.up) ]
	then
		mkdir $(basename $f _reinstall.up)
		unzip -P 5X/9vAVhovyU2ygK -p $f rootfs1upd/e0000000001.dat.gz | tar -zxv -k -C  "$(basename $f _reinstall.up)"  "./jci/gui/*"
	fi
done


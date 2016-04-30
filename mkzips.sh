#!/bin/bash

mklink() {
	rm $1
	ln -s ../../$2/$(basename $PWD)/$1
}

mkzip() {
	echo $1

	pushd $1
	zip -r $1.zip bin lib package.json
	mv $1.zip ..
	popd
}

source_folder=streams3
target_folder=streams2

pushd $source_folder/lib
mklink streams2.js $target_folder
popd

mkzip $source_folder

for id in $(seq 4 9); do
	source_folder=streams$id
	target_folder=streams$(expr $id - 1)

	pushd $source_folder/lib
	for i in $(seq 2 $(expr $id - 2)); do
		mklink streams$i.js $target_folder
	done
	popd

	mkzip $source_folder
done

source_folder=streams0
target_folder=streams9

pushd $source_folder/lib
for i in $(seq 2 $(expr $id - 2)); do
	mklink streams$i.js $target_folder
done
popd

mkzip $source_folder

rm 'Javascript Streams.zip'
mv *.zip ~/Work/sphinx/source/scripting
zip -j 'Javascript Streams.zip' ~/Work/sphinx/source/scripting/streams*
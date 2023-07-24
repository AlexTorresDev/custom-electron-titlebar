#!/bin/bash

# Reverts ./dist path changes created in pipeline by package publish to NPM
sed -i -e '/"types":/,/},/{s|"\./|"./dist/|g}' -e '/"exports":/,/},/{/\"\.\/main\":/! s|"\./|"./dist/|g; s|"\./main/index.js|"./dist/main/index.js|g}' ../package.json

# Deletes postversion script in package.json of NPM package
sed -i '/"postversion":/d' package.json
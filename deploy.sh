#!/bin/bash

# git pull & git push

npm run generate:systemjs:sample

npm run generate:commonjs:sample

npm run build:ems

# increment version number

npm publish --access public

#!/bin/bash

echo "regenerate hugo pages....."

hugo 

echo "regenerage hugo pages finished...."

echo "start to deploy......"
git add *
git commit -m 'add a post'
git status
git push
echo "deploy to github finish......"

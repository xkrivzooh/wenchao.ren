#!/bin/bash

echo 'start to deploy......\n'
git add *
git commit -m 'add a post'
git status
git push
echo 'deploy to github finish......\n'

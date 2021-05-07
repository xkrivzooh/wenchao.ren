#!/bin/bash

certbot renew
/usr/sbin/nginx -s reload

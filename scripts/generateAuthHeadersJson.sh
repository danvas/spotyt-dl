#!/bin/bash

cookie=$(echo $1 | base64 --decode)
echo $cookie

cat << EOF > headers_auth.json
{
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.5",
  "Content-Type": "application/json",
  "X-Goog-AuthUser": "1",
  "x-origin": "https://music.youtube.com",
  "Cookie": "$cookie"
}
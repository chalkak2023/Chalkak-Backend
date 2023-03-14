![Node.js CI](https://github.com/chalkak2023/Chalkak-Backend/actions/workflows/node.js.yml/badge.svg)
# 찰칵(Chalkak)

여기저기 흩어져 있는 출사 관련 정보 및 커뮤니티를 한 곳에서!

## 목차

- [예시 1](#예시-1)
- [.env](#.env)

## 예시 1

예시 1 내용

## .env

```
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME="chalkak"
DATABASE_SYNC=true

JWT_ACCESS_TOKEN_SECRET="accessToken"
JWT_ACCESS_TOKEN_EXPIRES_IN="1h"
JWT_REFRESH_TOKEN_SECRET="refreshToken"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

MAILER_HOST="smtp.gmail.com"
MAILER_PORT=465
MAILER_USER="chalkak.test@gmail.com"
MAILER_PASS=계정비밀번호
MAILER_SECURE=false

AWS_BUCKET_REGION="ap-northeast-2"
AWS_BUCKET_NAME="nest-board-app"
AWS_ACCESS_KEY_ID="본인 키"
AWS_SECRET_ACCESS_KEY="본인 시크릿 키"

OAUTH2_NAVER_CLIENT_ID="nQfUzAQK5oaiS_ZzmoUe"
OAUTH2_NAVER_CLIENT_SECRET=(슬랙 참조)
OAUTH2_NAVER_REDIRECT_URI="http://localhost:3000/login/naver"

OAUTH2_KAKAO_CLIENT_ID="1a714019e35dcc3167e57afad9a04d74"
OAUTH2_KAKAO_CLIENT_SECRET=(슬랙 참조)
OAUTH2_KAKAOR_REDIRECT_URI="http://localhost:3000/login/kakao"

CACHE_STORE_NAME="redis"
CACHE_HOST="localhost"
CACHE_PORT=6379
CACHE_TTL=5
```

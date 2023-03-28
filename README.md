[<img src="./docs/banner.jpg" width=100%>](https://www.chalkak.site)

<br>

## 확장 테스트
<details>
  <summary>첫번째 항목</summary>
  <div markdown="1">
  - **하나**
  - **둘**
  </div>
</details>
<details>
  <summary>두번째 항목</summary>
  <div markdown="2">
  - 셋
  - 넷
  </div>
</details>

<br>

## 📸 사진 공유 플랫폼, 찰칵!

여기저기 흩어져 있는 출사 관련 정보 및 커뮤니티를 한 곳에서!   
`찰칵(Chalkak)`은 출사 관련 정보를 공유하는 플랫폼이자 커뮤니티 입니다.   
[여기](https://www.chalkak.site/)를 클릭해 사이트를 확인하세요 🙂

<br>

### 🤔 개발 동기

> 나만이 알고 있는 매력적인 포토스팟을 테마별 콜렉션으로 공유하여 누구나 쉽게 사진 명소를 찾을 수 있도록 돕습니다.   
>    
> 찍고, 찍어주고, 대화하고, 함께해요. 출사 모임을 직접 만들거나 참여하여 우리의 사진과 삶을 함께 나눕니다.

<br>
<br>

## 📌 목차 

- [서비스 아키텍처](#-서비스-아키텍처)
- [설계](#-설계)
- [주요기능](#주요기능)
- [기술적 의사결정](#기술적-의사결정)
- [트러블슈팅](#트러블슈팅)
- [시연 영상](#시연-영상)
- [지원하는 브라우저](#지원하는-브라우저)
- [팀원 소개](#팀원-소개)

<br>
<br>

## ⚙️ 서비스 아키텍처

<img src="./docs/service_architecture.png" width=100%>
<!-- Nest.js -->
<img src="https://img.shields.io/badge/Nest.js-E0234E?style=flat-square&logo=NestJs&logoColor=white"/>
<!-- Node.js -->
<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/>
<!-- TypeScript -->
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/>

<!-- React -->
<img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black"/>
<!-- Redux -->
<img src="https://img.shields.io/badge/Redux-764ABC?style=flat-square&logo=Redux&logoColor=black"/>
<!-- HTML5 -->
<!-- <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=HTML5&logoColor=black"/> -->
<!-- JavaScript -->
<!-- <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=JavaScript&logoColor=black"/> -->
<!-- CSS3 -->
<!-- <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=CSS3&logoColor=black"/> -->
<!-- Bootstrap -->
<!-- <img src="https://img.shields.io/badge/Bootstrapap-7952B3?style=flat-square&logo=bootstrap&logoColor=white"/> -->

<!-- AWS -->
<img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=flat-square&logo=Amazon EC2&logoColor=white"/>
<img src="https://img.shields.io/badge/Amazon RDS-527FFF?style=flat-square&logo=Amazon RDS&logoColor=white"/>
<img src="https://img.shields.io/badge/Amazon S3-569A31?style=flat-square&logo=Amazon S3&logoColor=white"/>
<!-- Vercel -->
<img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=Vercel&logoColor=white"/>
<!-- GitHub Actions -->
<img src="https://img.shields.io/badge/GitHub Actions-2088FF?style=flat-square&logo=GitHub Actions&logoColor=white"/>

<!-- MySQL -->
<img src="https://img.shields.io/badge/Mysql-4479A1?style=flat-square&logo=Mysql&logoColor=white"/>
<!-- Redis -->
<img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white"/>
<!-- Docker -->
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white"/>
<!-- Github -->
<!-- <img src="https://img.shields.io/badge/Github-181717?style=flat-square&logo=Github&logoColor=white"/> -->
<!-- Slack -->
<!-- <img src="https://img.shields.io/badge/Slack-4A154B?style=flat-square&logo=Slack&logoColor=white"/> -->

<br>
<br>

## 🛠 설계

- [ERD 보러가기](https://www.erdcloud.com/d/a36xRNx6woXE7ukPk)
- [API 보러가기](https://www.erdcloud.com/d/a36xRNx6woXE7ukPk)

<br>
<br>

## 🚀 주요 기능

- 포토스팟 콜렉션
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능
  - 좋아요 기능
  # <img src="./docs/meetup1.gif" width=50%>  

- 사진 모아보기
  - 클릭한 사진과 비슷한 사진을 보여주는 추천 시스템
  - 추천 시스템을 위해 업로드 하는 사진에 대해 자동 라벨링 기능 구현
  - Google Vision API 사용
  # <img src="./docs/meetup1.gif" width=50%>  

- 함께 찍어요 & 채팅
  - 출사 모임 모집 기능
  - 주최자가 모집 마감 시 채팅으로 넘어가 참여자들 끼리 채팅 할 수 있는 기능 구현
  # <img src="./docs/meetup1.gif" width=50%>  

<br>
<br>

## 👨‍⚖️ 기술적 의사결정

- Bull Queue
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능

- AWS S3
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능

- DB 모델링 STI
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능

- CI/CD
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능

<br>
<br>

## 🕵️‍♂️ 트러블슈팅

- 유저 블락 전략
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능

- 이미지 리사이징
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능

- 즉각적인 Bull Queue의 작업 결과 응답
  - Kakao Map API를 이용해 원하는 좌표에 포토스팟 저장 기능
  - 포토스팟 저장 시 최대 5장의 사진 저장 기능
  - 해결 전   
    <img src="./docs/bullqueue1.png" width=50%> 
    <img src="./docs/bullqueue2.png" width=50%> 
  - 해결 후   
    <img src="./docs/bullqueue3.gif" width=50%> 
    <img src="./docs/bullqueue4.gif" width=50%> 

<br>
<br>

## 🎥 시연 영상

<img src="./docs/service_architecture.png" width=100%>

<br>
<br>

## 🌏 지원하는 브라우저

| <img src='./docs/chrome.png' width=60> |
| :-: |
|latest|

<br>
<br>

## 👨‍👨‍👧‍👦 팀원 소개

| <img src='https://github.com/boleesystem.png' width=120> | <img src='https://github.com/cchoseonghun.png' width=120> | <img src='https://github.com/muja-code.png' width=120> | <img src='https://github.com/tstunas.png' width=120> |
| :-: | :-: | :-: | :-: |
| 이보형 | 조성훈 | 박무현 | 박진 |
| 리더 | 부리더 | 팀원 | 팀원 |
| [깃허브](https://github.com/boleesystem), [블로그](https://boleesystem.tistory.com) | [깃허브](https://github.com/cchoseonghun), [블로그](https://4sii.tistory.com) | [깃허브](https://github.com/muja-code), [블로그](https://muja-coder.tistory.com) | [깃허브](https://github.com/tstunas), [블로그](https://velog.io/@tstunas3) |
| boleesystem@gmail.com | cchoseonghun@gmail.com | pla2697@gmail.com | zoc6521@naver.com |
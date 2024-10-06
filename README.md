# <a href="https://www.cvmate.site/">
  <img alt="CVMATE LOGO" src="./public/images/resume.png">
</a>
<br/>

## 프로젝트 개요
CV 메이트는 직무명과 국/영문 경력 요약 한 줄만으로 영문 이력서를 자동으로 생성하는 AI 영문이력서 빌더입니다. 해외 및 국내 외국계 기업, 대학원에 지원하는 사용자들이 지원 공고에 맞춘 맞춤형 이력서를 신속하게 작성할 수 있도록 돕습니다. 또한, 글로벌 대기업에서 사용하는 이력서 양식을 제공하며, 작성된 이력서는 바로 PDF로 다운로드 가능합니다. 10,000개 이상의 이력서 데이터를 학습한 특화된 Solar 모델을 활용하며, 사용자는 이력서를 docs 편집기에서 자유롭게 수정할 수 있습니다. 작성된 이력서는 전문적인 어휘와 문장 구조, 성과의 수치화를 반영한 형태로 제공됩니다.

## 기술 스택

- **[Next.js](https://nextjs.org/)**: React 기반의 프레임워크로, 서버 사이드 렌더링과 정적 사이트 생성 등 다양한 기능을 지원.
- **[Supabase](https://supabase.com/)**: 실시간 데이터베이스, 인증 및 API 기능을 제공하는 백엔드 서비스 플랫폼.
- **[Pinecone](https://www.pinecone.io/)**: 임베딩 데이터베이스와 정보 검색 기능을 결합하여, RAG(Retrieval-Augmented Generation) 기능을 강화.
- **[SOLAR LLM](https://ko.upstage.ai/)**: 자연어 처리 및 텍스트 임베딩을 위한 LLM을 활용하여, CHAT 및 EMBEDDING 기능을 구현.

## 프로젝트 구조도
- **[프로젝트 구조도 보러가기](https://www.tldraw.com/s/v2_c_6OIL_xyhLqdY8hOVt9tLB?d=v-3717.-2261.10707.5631.owtTHk2bAUkSlG696SNMj)**
- **AI 활용부분**
<img alt="AI 구조도" src="./public/images/AISTRUCTURE.png">

## DEMO

다음에서 데모를 확인할 수 있습니다. [cvmate.site](https://www.cvmate.site/).

## 설치 방법

1. **프로젝트 클론**

  ```bash
  git clone https://github.com/juiceple/resume.git
  ```

2. **DIRECTORY 이동**

  ```bash
    cd name-of-new-app
  ```

3. **환경설정(API키 삽입)**
   1. .env.local root directiory에 생성하기
   2. 파일내 다음과 같은 코드 작성하기
   ```bash
   NEXT_PUBLIC_SUPABASE_URL= 

   NEXT_PUBLIC_SUPABASE_ANON_KEY=

   SOLAR_API_KEY=""

   PINECONE_API_KEY=""
   ```

4. **필수 패키지 설치**
   ```bash
   npm install
   ```

5. **로컬 서버 실행**
   ```bash
   npm run dev
   ```

>CVMATE는 [localhost:3000](http://localhost:3000/) 에서 접근가능합니다.

## 사용 방법
1. 회원가입

2. /docs 부분으로 진입(회원가입 마지막 단계에서 버튼 클릭)

3. 새 이력서 생성

4. CLICKED TO BULLET POINT 부분을 누르면 AI 버튼 활성화

5. 버튼을 누른 후 FORM 제출

6. 완성된 BULLETPOINT에서 수정사항 요청(MESSAGE)
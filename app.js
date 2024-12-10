// Express 모듈을 가져옵니다.
const express = require('express');
// 파일 및 디렉토리 경로를 조작하기 위한 모듈을 가져옵니다.
const path = require('path');
// HTTP 요청 로깅을 위한 모듈을 가져옵니다.
const morgan = require('morgan');
// 쿠키를 파싱하기 위한 모듈을 가져옵니다.
const cookieParser = require('cookie-parser');
// 세션 관리를 위한 모듈을 가져옵니다.
const session = require('express-session');
// 사용자 인증 및 인가를 처리하기 위한 모듈을 가져옵니다.
const passport = require('passport');
// 템플릿 엔진으로 Nunjucks를 사용하기 위한 모듈을 가져옵니다.
const nunjucks = require('nunjucks');
// 환경 변수를 관리하기 위한 모듈을 가져옵니다.
const dotenv = require('dotenv');
// dotenv 설정을 로드합니다.
dotenv.config();

// 라우팅을 위한 인덱스 라우터를 가져옵니다.
const indexRouter = require('./routes/index');
// 인증 라우터를 가져옵니다.
const authRouter = require('./routes/auth');
// Sequelize 모델을 가져옵니다.
const { sequelize } = require('./models');
// Passport 구성을 가져옵니다.
const passportConfig = require('./passport');
// SSE (Server-Sent Events) 기능을 가져옵니다.
const sse = require('./sse');
// WebSocket 기능을 가져옵니다.
const webSocket = require('./socket');
// 경매를 확인하는 기능을 가져옵니다.
const checkAuction = require('./checkAuction');
// Express 애플리케이션을 생성합니다.
const app = express();

// Passport 구성을 실행합니다.
passportConfig();
// 경매 확인 함수를 실행합니다.
checkAuction();

// 포트 설정을 설정합니다. 기본값은 8010입니다.
app.set('port', process.env.PORT || 8010);

// 템플릿 엔진으로 Nunjucks를 사용합니다.
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

// Sequelize와 연결하여 데이터베이스를 동기화합니다.
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

// 세션 미들웨어 설정
const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

// 미들웨어 설정
app.use(morgan('dev')); // 개발 환경에서의 요청 로깅
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.use('/img', express.static(path.join(__dirname, 'uploads'))); // 이미지 파일 제공
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: false })); // URL 인코딩된 데이터 파싱
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 파싱
app.use(sessionMiddleware); // 세션 미들웨어 등록
app.use(passport.initialize()); // Passport 초기화
app.use(passport.session()); // Passport 세션 사용

// 라우터 등록
app.use('/', indexRouter); // 인덱스 라우터
app.use('/auth', authRouter); // 인증 라우터

// 없는 라우터에 대한 에러 핸들링
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 핸들러
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 서버를 시작하여 해당 포트에서 대기합니다.
const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});

// WebSocket 및 SSE 기능을 초기화합니다.
webSocket(server, app);
sse(server);

//이 코드는 Express를 사용하여 웹 서버를 구성하고, 
//다양한 미들웨어 및 기능을 추가한 것입니다. 각 부분은 주석으로 자세히 설명되어 있습니다. 
//이 서버는 HTTP 요청을 처리하고, 정적 파일을 제공하며, 세션 및 사용자 인증 관리와 같은 기능을 포함하고 있습니다. 
//또한 WebSocket 및 SSE를 통해 실시간 통신을 지원하고 있습니다.
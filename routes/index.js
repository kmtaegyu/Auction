// Express 모듈을 가져옵니다.
const express = require('express');

// 파일 업로드를 처리하기 위한 multer 모듈을 가져옵니다.
const multer = require('multer');

// 파일 및 디렉토리 경로를 조작하기 위한 path 모듈을 가져옵니다.
const path = require('path');

// 파일 시스템 관련 작업을 위한 fs 모듈을 가져옵니다.
const fs = require('fs');

// 로그인 여부를 확인하는 미들웨어 함수들을 가져옵니다.
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');

// 컨트롤러 함수들을 가져옵니다.
const {
  renderMain, renderJoin, renderGood, createGood, renderAuction, bid, renderList,
} = require('../controllers');

// Express의 Router 객체를 생성합니다.
const router = express.Router();

// 모든 요청에 대해 유저 정보를 res.locals.user에 저장하는 미들웨어를 등록합니다.
router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
  
// '/' 경로에 대한 GET 요청을 처리하는 라우터를 등록합니다. 메인 페이지를 렌더링합니다.
router.get('/', renderMain);

// '/join' 경로에 대한 GET 요청을 처리하는 라우터를 등록합니다. 회원가입 페이지를 렌더링합니다.
router.get('/join', isNotLoggedIn, renderJoin);

// '/good' 경로에 대한 GET 요청을 처리하는 라우터를 등록합니다. 상품 등록 페이지를 렌더링합니다.
router.get('/good', isLoggedIn, renderGood);

// 'uploads' 폴더가 없을 경우 폴더를 생성합니다.
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

// 파일 업로드를 처리하기 위한 multer 설정을 정의합니다.
const upload = multer({ 
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/'); // 파일이 저장될 경로를 설정합니다.
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); // 파일의 확장자를 추출합니다.
      // 파일의 이름을 설정합니다. 기존 파일명 + 현재 시간을 기반으로한 고유한 값 + 확장자
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일의 최대 크기를 제한합니다.
});

// '/good' 경로에 대한 POST 요청을 처리하는 라우터를 등록합니다. 상품을 생성합니다.
router.post('/good', isLoggedIn, upload.single('img'), createGood);

// '/good/:id' 경로에 대한 GET 요청을 처리하는 라우터를 등록합니다. 경매 페이지를 렌더링합니다.
router.get('/good/:id', isLoggedIn, renderAuction);

// '/good/:id/bid' 경로에 대한 POST 요청을 처리하는 라우터를 등록합니다. 입찰을 처리합니다.
router.post('/good/:id/bid', isLoggedIn, bid);

// '/list' 경로에 대한 GET 요청을 처리하는 라우터를 등록합니다. 경매 상품 목록을 렌더링합니다.
router.get('/list', isLoggedIn, renderList);

// 라우터를 외부로 내보냅니다.
module.exports = router;

//이 코드는 Express 라우터를 사용하여 서버의 여러 경로에 대한 요청을 처리합니다.
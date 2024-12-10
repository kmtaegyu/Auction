// Passport 모듈을 가져옵니다.
const passport = require('passport');

// 로컬 인증 전략(localStrategy)을 가져옵니다.
const local = require('./localStrategy');

// 사용자 모델을 가져옵니다.
const User = require('../models/user');

// Passport 설정 함수를 내보냅니다.
module.exports = () => {
  // 사용자 정보를 세션에 저장할 때 호출되는 함수를 정의합니다.
  passport.serializeUser((user, done) => {
    // serializeUser 메서드는 사용자 객체와 done 콜백 함수를 인자로 받습니다.
    // done 콜백 함수의 첫 번째 인자는 에러를 나타내며, 두 번째 인자는 사용자를 식별하는 정보입니다.
    // 여기서는 사용자의 id를 식별자로 사용하여 세션에 저장합니다.
    done(null, user.id);
  });

  // 세션에 저장된 사용자 정보를 조회할 때 호출되는 함수를 정의합니다.
  passport.deserializeUser((id, done) => {
    // deserializeUser 메서드는 사용자의 식별자와 done 콜백 함수를 인자로 받습니다.
    // done 콜백 함수의 첫 번째 인자는 에러를 나타내며, 두 번째 인자는 조회된 사용자 객체입니다.
    // 사용자의 id를 이용하여 데이터베이스에서 사용자를 조회하고, 조회 결과를 done 콜백 함수에 전달합니다.
    User.findOne({ where: { id } })
      .then(user => done(null, user)) // 사용자 조회 성공 시 조회된 사용자 객체를 전달합니다.
      .catch(err => done(err)); // 사용자 조회 실패 시 에러를 전달합니다.
  });

  // 로컬 인증 전략을 설정합니다.
  local();
};

//이 코드는 Passport를 사용하여 사용자의 인증 및 세션 처리를 설정하는 부분입니다
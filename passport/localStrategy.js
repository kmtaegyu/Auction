// Passport 모듈을 가져옵니다.
const passport = require('passport');

// 로컬 전략을 사용하기 위한 Passport의 LocalStrategy를 가져옵니다.
const LocalStrategy = require('passport-local').Strategy;

// 비밀번호 해싱 및 비교를 위한 bcrypt 모듈을 가져옵니다.
const bcrypt = require('bcrypt');

// 사용자 모델을 가져옵니다.
const User = require('../models/user');

// Passport 로컬 전략을 설정하는 함수를 내보냅니다.
module.exports = () => {
  // Passport에 로컬 전략을 등록합니다.
  passport.use(new LocalStrategy({
    usernameField: 'email', // 사용자의 이메일을 사용자명 필드로 설정합니다.
    passwordField: 'password', // 사용자의 비밀번호를 비밀번호 필드로 설정합니다.
  }, async (email, password, done) => {
    try {
      // 이메일을 기준으로 데이터베이스에서 사용자를 조회합니다.
      const exUser = await User.findOne({ where: { email } });
      
      // 사용자가 존재하는 경우
      if (exUser) {
        // 비밀번호를 bcrypt를 사용하여 비교합니다.
        const result = await bcrypt.compare(password, exUser.password);
        
        // 비밀번호가 일치하는 경우
        if (result) {
          // 로그인에 성공했으므로 사용자 정보를 done 콜백에 전달합니다.
          done(null, exUser);
        } else {
          // 비밀번호가 일치하지 않는 경우에는 인증 실패 메시지와 함께 false를 전달합니다.
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        // 사용자가 존재하지 않는 경우에는 가입되지 않은 회원임을 알리는 메시지와 함께 false를 전달합니다.
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      // 오류가 발생한 경우 콘솔에 오류를 출력하고 done 콜백에 오류를 전달합니다.
      console.error(error);
      done(error);
    }
  }));
};

//이 코드는 Passport를 사용하여 로컬 인증을 구현하는 부분으로

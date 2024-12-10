// bcrypt 모듈을 가져옵니다.
const bcrypt = require('bcrypt');

// Passport 모듈을 가져옵니다.
const passport = require('passport');

// 사용자 모델을 가져옵니다.
const User = require('../models/user');

// 회원가입 처리를 위한 컨트롤러 함수입니다.
exports.join = async (req, res, next) => {
  // 요청 바디에서 이메일, 닉네임, 비밀번호, 잔액을 추출합니다.
  const { email, nick, password, money } = req.body;
  try {
    // 이미 존재하는 이메일인지 확인하기 위해 데이터베이스에서 사용자를 조회합니다.
    const exUser = await User.findOne({ where: { email } });
    // 이미 존재하는 이메일이라면 에러 메시지와 함께 회원가입 페이지로 리다이렉션합니다.
    if (exUser) {
      return res.redirect('/join?error=이미 가입된 이메일입니다.');
    }
    // 비밀번호를 bcrypt를 사용하여 해싱합니다.
    const hash = await bcrypt.hash(password, 12);
    // 사용자 정보를 데이터베이스에 저장합니다.
    await User.create({
      email,
      nick,
      password: hash, // 해싱된 비밀번호를 저장합니다.
      money,
    });
    // 회원가입이 성공했으므로 메인 페이지로 리다이렉션합니다.
    return res.redirect('/');
  } catch (error) {
    // 오류가 발생한 경우 콘솔에 오류를 출력하고 다음 미들웨어로 오류를 전달합니다.
    console.error(error);
    return next(error);
  }
}

// 로그인 처리를 위한 컨트롤러 함수입니다.
exports.login = (req, res, next) => {
  // Passport의 local 전략을 사용하여 로그인을 시도합니다.
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      // 인증 오류가 발생한 경우 콘솔에 오류를 출력하고 다음 미들웨어로 오류를 전달합니다.
      console.error(authError);
      return next(authError);
    }
    if ( !user) {
      // 인증에 실패한 경우 에러 메시지와 함께 메인 페이지로 리다이렉션합니다.
      return res.redirect(`/?error=${info.message}`);
    }
    // 로그인에 성공한 경우 사용자 정보를 세션에 저장합니다.
    return req.login(user, (loginError) => {
      if (loginError) {
        // 로그인 오류가 발생한 경우 콘솔에 오류를 출력하고 다음 미들웨어로 오류를 전달합니다.
        console.error(loginError);
        return next(loginError);
      }
      // 로그인이 성공했으므로 메인 페이지로 리다이렉션합니다.
      return res.redirect('/');
    });
  })(req, res, next); // passport.authenticate의 미들웨어에 (req, res, next)를 붙여 실행합니다.
};
/*
// 로그아웃 처리를 위한 컨트롤러 함수입니다.
exports.logout = (req, res) => {
  // Passport를 사용하여 세션에서 사용자 정보를 제거합니다.
  req.logout();
  // 현재 세션을 파괴합니다.
  req.session.destroy();
  // 메인 페이지로 리다이렉션합니다.
  res.redirect('/');
};
*/

exports.logout = (req, res) => {
  // Passport를 사용하여 세션에서 사용자 정보를 제거합니다.
  req.logout(function(err) {
    if (err) { 
      return next(err); 
    }
    // 세션을 파괴합니다.
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      // 메인 페이지로 리다이렉션합니다.
      res.redirect('/');
    });
  });
};



//이 코드는 회원가입, 로그인, 로그아웃을 처리하는 컨트롤러 함수들로
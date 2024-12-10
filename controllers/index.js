// Sequelize의 연산자 Op를 가져옵니다.
const { Op } = require('sequelize');

// 모델들과 Sequelize 객체를 가져옵니다.
const { Good, Auction, User, sequelize } = require('../models');

// node-schedule 모듈을 가져옵니다.
const schedule = require('node-schedule');

// 메인 페이지를 렌더링하는 컨트롤러 함수입니다.
exports.renderMain = async (req, res, next) => {
  try {
    // 어제 시간을 기준으로 24시간 이내에 생성된 상품들을 조회합니다.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const goods = await Good.findAll({
      where: { SoldId: null, createdAt: { [Op.gte]: yesterday } }, // 판매자가 없고, 어제부터 생성된 상품들을 조회합니다.
    });
    // 메인 페이지를 렌더링하고 조회된 상품들을 전달합니다.
    res.render('main', {
      title: 'NodeAuction', // 페이지 타이틀
      goods, // 조회된 상품들
    });
  } catch (error) {
    console.error(error);
    next(error);
  } 
};

// 회원가입 페이지를 렌더링하는 컨트롤러 함수입니다.
exports.renderJoin = (req, res) => {
  res.render('join', {
    title: '회원가입 - NodeAuction', // 페이지 타이틀
  });
};

// 상품 등록 페이지를 렌더링하는 컨트롤러 함수입니다.
exports.renderGood = (req, res) => {
  res.render('good', { title: '상품 등록 - NodeAuction' }); // 페이지 타이틀
};

// 상품을 등록하는 컨트롤러 함수입니다.
exports.createGood = async (req, res, next) => {
  try {
    // 요청 바디에서 상품 이름, 가격을 추출합니다.
    const { name, price } = req.body;
    // 상품을 생성하고 데이터베이스에 저장합니다.
    const good = await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price,
    });
    // 상품 등록 후 24시간 뒤에 경매가 종료되도록 스케줄링합니다.
    const end = new Date();
    end.setDate(end.getDate() + 1);
    const job = schedule.scheduleJob(end, async () => {
      const success = await Auction.findOne({
        where: { GoodId: good.id },
        order: [['bid', 'DESC']],
      });
      await good.setSold(success.UserId);
      await User.update({
        money: sequelize.literal(`money - ${success.bid}`),
      }, {
        where: { id: success.UserId },
      });
    });
    // 스케줄링 에러 및 성공 시의 처리를 정의합니다.
    job.on('error', (err) => {
      console.error('스케줄링 에러', err);
    });
    job.on('success', () => {
      console.log('스케줄링 성공');
    });
    // 메인 페이지로 리다이렉션합니다.
     res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
}; 

// 경매 페이지를 렌더링하는 컨트롤러 함수입니다.
exports.renderAuction = async (req, res, next) => {
  try {
    // 요청 파라미터로 전달된 상품 ID에 해당하는 상품과 해당 상품의 입찰 내역을 조회합니다.
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: {
          model: User,
          as: 'Owner',
        },
      }),
      Auction.findAll({
        where: { GoodId: req.params.id },
        include: { model: User },
        order: [['bid', 'ASC']],
      }),
    ]);
    // 경매 페이지를 렌더링하고 상품과 입찰 내역을 전달합니다.
    res.render('auction', {
      title: `${good.name} - NodeAuction`, // 페이지 타이틀
      good, // 조회된 상품
      auction, // 조회된 입찰 내역
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};  

// 입찰을 처리하는 컨트롤러 함수입니다.
exports.bid = async (req, res, next) => {
  try {
    // 요청 바디에서 입찰가와 메시지를 추출합니다.
    const { bid, msg } = req.body;
    // 요청 파라미터로 전달된 상품 ID에 해당하는 상품을 조회합니다.
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      order: [[{ model: Auction }, 'bid', 'DESC']],
    });
    // 상품이 존재하지 않으면 404 상태 코드와 메시지를 응답합니다.
    if (!good) {
      return res.status(404).send('해당 상품은 존재하지 않습니다.');
    }
    // 입찰가가 시작 가격보다 작거나 같으면 403 상태 코드와 메시지를 응답합니다.
    if (good.price >= bid) {
      return res.status(403).send('시작 가격보다 높게 입찰해야 합니다.');
    }
    // 경매 종료 시간이 지났으면 403 상태 코드와 메시지를 응답합니다.
    if (new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {
      return res.status(403).send('경매가 이미 종료되었습니다');
    }
    // 현재 최고 입찰가보다 낮은 입찰가를 입력한 경우 403 상태 코드와 메시지를 응답합니다.
    if (good.Auctions[0]?.bid >= bid) {
      return res.status(403).send('이전 입찰가보다 높아야 합니다'); 
    }
    // 입찰 정보를 생성하고 데이터베이스에 저장합니다.
    const result = await Auction.create({
      bid,
      msg,
      UserId: req.user.id, 
      GoodId: req.params.id,
    });
    // 실시간으로 입찰 내역을 전송합니다.
    req.app.get('io').to(req.params.id).emit('bid', {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick, 
    });
    // 응답으로 'ok'를 전송합니다.
    return res.send('ok');
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

// 낙찰 목록 페이지를 렌더링하는 컨트롤러 함수입니다.
exports.renderList = async (req, res, next) => {
  try {
    // 현재 사용자가 낙찰한 상품들을 조회합니다.
    const goods = await Good.findAll({
      where: { SoldId: req.user.id },
      include: { model: Auction },
      order: [[{ model: Auction }, 'bid', 'DESC']],
    });
    // 낙찰 목록 페이지를 렌더링하고 조회된 상품들을 전달합니다.
    res.render('list', { title: '낙찰 목록 - NodeAuction', goods });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
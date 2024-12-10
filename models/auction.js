const Sequelize = require('sequelize'); // Sequelize를 불러옵니다.

// Auction 모델 클래스를 정의합니다.
class Auction extends Sequelize.Model {
  // 데이터베이스 초기화 메서드를 정의합니다.
  static initiate(sequelize) {
    // Auction 모델의 스키마를 정의합니다.
    Auction.init({
      // 입찰가를 나타내는 속성입니다.
      bid: {
        type: Sequelize.INTEGER, // 정수 타입
        allowNull: false, // 널 값 허용하지 않음
        defaultValue: 0, // 기본값 0
      },
      // 입찰 메시지를 나타내는 속성입니다.
      msg: {
        type: Sequelize.STRING(100), // 문자열 타입, 최대 길이 100
        allowNull: true, // 널 값 허용
      },
    }, {
      // 모델 설정 옵션을 정의합니다.
      sequelize, // Sequelize 객체
      timestamps: true, // createdAt 및 updatedAt 자동 생성
      paranoid: true, // soft delete 활성화
      modelName: 'Auction', // 모델 이름
      tableName: 'auctions', // 테이블 이름
      charset: 'utf8', // 캐릭터셋
      collate: 'utf8_general_ci', // 콜레이션
    });
  }

  // 모델 간의 관계를 정의하는 메서드입니다.
  static associate(db) {
    // 사용자(User) 모델과의 일대다 관계를 정의합니다. (입찰자)
    db.Auction.belongsTo(db.User);
    // 상품(Good) 모델과의 일대다 관계를 정의합니다. (입찰 상품)
    db.Auction.belongsTo(db.Good);
  }
};

// Auction 모델 클래스를 내보냅니다.
module.exports = Auction;

//이 코드는 Sequelize를 사용하여 Auction 모델을 정의하는 클래스입니다.
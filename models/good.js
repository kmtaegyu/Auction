const Sequelize = require('sequelize');

// Good 모델 클래스를 정의합니다.
class Good extends Sequelize.Model {
  // 데이터베이스 초기화 메서드를 정의합니다.
  static initiate(sequelize) {
    // Good 모델의 스키마를 정의합니다.
    Good.init({
      // 상품 이름을 나타내는 속성입니다.
      name: {
        type: Sequelize.STRING(40), // 문자열 타입, 최대 길이 40
        allowNull: false, // 널 값 허용하지 않음
      },
      // 상품 이미지 경로를 나타내는 속성입니다.
      img: {
        type: Sequelize.STRING(200), // 문자열 타입, 최대 길이 200
        allowNull: true, // 널 값 허용
      },
      // 상품 가격을 나타내는 속성입니다.
      price: {
        type: Sequelize.INTEGER, // 정수 타입
        allowNull: false, // 널 값 허용하지 않음
        defaultValue: 0, // 기본값 0
      },
    }, {
      // 모델 설정 옵션을 정의합니다.
      sequelize, // Sequelize 객체
      timestamps: true, // createdAt 및 updatedAt 자동 생성
      paranoid: true, // soft delete 활성화
      modelName: 'Good', // 모델 이름
      tableName: 'goods', // 테이블 이름
      charset: 'utf8', // 캐릭터셋
      collate: 'utf8_general_ci', // 콜레이션
    });
  }

  // 모델 간의 관계를 정의하는 메서드입니다.
  static associate(db) {
    // 사용자(User) 모델과의 일대다 관계를 정의합니다. (상품 소유자)
    db.Good.belongsTo(db.User, { as: 'Owner' });
    // 사용자(User) 모델과의 일대다 관계를 정의합니다. (상품 낙찰자)
    db.Good.belongsTo(db.User, { as: 'Sold' });
    // 입찰(Auction) 모델과의 일대다 관계를 정의합니다. (상품과의 입찰)
    db.Good.hasMany(db.Auction);
  }
};

// Good 모델 클래스를 내보냅니다.
module.exports = Good;
// node-schedule 모듈에서 scheduleJob 메서드를 가져옵니다.
const { scheduleJob } = require('node-schedule'); 

// Sequelize에서 Op 객체를 가져옵니다.
const { Op } = require('sequelize');

// 모델들과 sequelize를 가져옵니다.
const { Good, Auction, User, sequelize  } = require('./models');

// 경매를 확인하는 함수를 내보냅니다.
module.exports = async () => {
  // 함수가 실행됨을 콘솔에 출력합니다.
  console.log('checkAuction');
  try {
    // 어제의 시간을 얻습니다.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // 어제 시간

    // 24시간이 지나 낙찰자가 없는 경매를 찾습니다.
    const targets = await Good.findAll({
      where: {
        SoldId: null, // 아직 낙찰자가 없는 상품들
        createdAt: { [Op.lte]: yesterday }, // 어제 이전에 생성된 상품들
        },
     });
 
    // 찾은 상품들을 순회하면서 처리합니다.
    targets.forEach(async (good) => {
      // 해당 상품에 대한 최고 입찰을 찾습니다.
      const success = await Auction.findOne({
        where: { GoodId: good.id },
        order: [['bid', 'DESC']], // 입찰이 가장 높은 순서대로
      });

      // 해당 상품을 낙찰자에게 판매 처리합니다.
      // 해당 낙찰자의 돈을 차감하여 업데이트합니다.
      if(success){

        await good.setSold(success.UserId);
 
        await User.update({
          money: sequelize.literal(`money - ${success.bid}`),
        }, {
          where: { id: success.UserId },
        });
      } 
    });

    // 24시간이 지나지 않은 상품들을 찾습니다.
    const ongoing = await Good.findAll({
      where: {
        SoldId: null, // 아직 낙찰자가 없는 상품들
        createdAt: { [Op.gte]: yesterday }, // 어제 이후에 생성된 상품들
      },
    });

    // 찾은 상품들을 순회하면서 스케줄링 작업을 수행합니다.
    ongoing.forEach((good) => {
      // 해당 상품의 생성일로부터 24시간 후를 경매 마감 시간으로 설정합니다.
      const end = new Date(good.createdAt);
      end.setDate(end.getDate() + 1); // 생성일 24시간 뒤가 낙찰 시간

      // 경매 마감 시간에 스케줄링 작업을 등록합니다.
      const job = scheduleJob(end, async() => {
        // 해당 상품에 대한 최고 입찰을 찾습니다.
        const success = await Auction.findOne({
          where: { GoodId: good.id },
          order: [['bid', 'DESC']], // 입찰이 가장 높은 순서대로
          //내림차순
        });

        // 해당 상품을 낙찰자에게 판매  처리합니다.
        await good.setSold(success.UserId);
        
        // 해당 낙찰자의 돈을 차감하여 업데이트합니다.
        await User.update({
          money: sequelize.literal(`money - ${success.bid}`),
        }, {
          where: { id: success.UserId },
        });
      });

      // 스케줄링 작업의 에러 이벤트 핸들러를 등록합니다.
      job.on('error', (err) => {
        console.error('스케줄링 에러', err);
      });

      // 스케줄링 작업의 성공 이벤트 핸들러를 등록합니다.
      job.on('success', () => {
        console.log('스케줄링 성공');
      });
    });

  } catch (error) {
    // 에러가 발생한 경우 에러를 콘솔에 출력합니다.
    console.error(error);
  }
};

//이 코드는 경매를 확인하는 기능을 구현한 것입니다. 코드를 자세히 설명하면 다음과 같습니다:

//1. node-schedule 모듈에서 scheduleJob 메서드를 가져와서 경매 마감 시간에 대한 스케줄링 작업을 수행할 수 있도록 합니다.
//2. Sequelize의 연산자 객체(Op)와 모델들(Good, Auction, User, sequelize)을 가져옵니다.
//3. 'checkAuction' 함수를 정의하고 내보냅니다.
//4. 함수가 실행되면 콘솔에 "checkAuction"이 출력됩니다.
//5. 24시간 전의 시간을 얻어 변수 yesterday에 할당합니다.
//6. 어제의 시간 이전에 생성된 상품들 중에서 아직 낙찰자가 없는 상품들을 찾아 targets에 할당합니다.
//7. targets 배열을 순회하면서 각 상품에 대해 다음 작업을 수행합니다:
//  - 상품에 대한 최고 입찰을 찾습니다.
//  - 상품을 해당 낙찰자에게 판매 처리합니다.
//  - 해당 낙찰자의 돈을 차감하여 업데이트합니다.
//8. 어제 이후에 생성된 상품들 중에서 아직 낙찰자가 없는 상품들을 찾아 ongoing에 할당합니다.
//9. ongoing 배열을 순회하면서 각 상품에 대해 다음 작업을 수행합니다:
//  - 해당 상품의 생성일로부터 24시간 후를 경매 마감 시간으로 설정합니다.
//  - 경매 마감 시간에 스케줄링 작업을 등록합니다.
//   - 스케줄링 작업의 에러 및 성공 이벤트 핸들러를 등록합니다.
//10. 에러가 발생하면 콘솔에 에러를 출력합니다.
//------------------------------------------------------
//여기서 Good와 good의 차이는 다음과 같습니다:

//Good:
//Good는 Sequelize 모델 클래스를 나타냅니다.
//Sequelize 모델 클래스는 데이터베이스의 특정 테이블에 대한 정의와 데이터베이스 작업을 수행하는 메서드를 포함합니다.
//데이터베이스의 각 테이블에 대한 모델 클래스를 정의하고, 해당 모델 클래스의 인스턴스를 사용하여 데이터베이스 작업을 수행합니다.

//good:
//good는 Sequelize 모델 클래스의 인스턴스입니다.
//모델 클래스의 인스턴스는 특정 테이블의 레코드를 나타냅니다.
//따라서 good는 실제 데이터베이스에서 가져온 레코드를 나타내며, 해당 레코드의 속성에는 테이블의 각 열의 값이 포함됩니다.
//간단히 말해서, Good는 데이터베이스의 특정 테이블에 대한 정의를 포함하는 클래스이고, good은 실제 데이터베이스 레코드를 나타내는 인스턴스입니다.

//--------------------------
//good은 실제 레코드


//주어진 코드에서 targets 변수는 어제의 시간 이전에 생성되었고 아직 낙찰자가 없는 상품들을 저장하는 배열입니다. 여기서 각 요소는 Sequelize 모델 클래스 Good의 인스턴스입니다.
//구체적으로 말하자면, targets 배열은  .findAll() 메서드를 사용하여 얻어지는 결과로, 데이터베이스에서 조건에 맞는 레코드들을 검색하여 가져온 것입니다. 여기서는 어제의 시간 이전에 생성된 상품들 중에서 아직 낙찰자가 없는 상품들을 검색하고 있습니다.
//즉, targets 배열에는 Sequelize 모델 클래스 Good의 인스턴스인 각 상품의 정보가 포함되어 있습니다. 이후 코드에서는 이러한 상품들을 순회하면서 각 상품에 대해 추가적인 처리를 수행합니다.
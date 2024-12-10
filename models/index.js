const Sequelize = require('sequelize'); // Sequelize를 불러옵니다.
const env = process.env.NODE_ENV || 'development'; // 환경 변수에서 환경 설정을 가져옵니다.
const fs = require('fs'); // 파일 시스템 모듈을 불러옵니다.
const path = require('path'); // 경로 관련 모듈을 불러옵니다.
  const config = require('../config/config')[env]; // 환경 설정 파일에서 환경에 맞는 설정을 가져옵니다.

const db = {}; // 데이터베이스 모델 객체를 저장할 빈 객체를 생성합니다.
const sequelize = new Sequelize( // Sequelize 인스턴스를 생성합니다.
  config.database, // 데이터베이스 이름
  config.username, // 사용자 이름
  config.password, // 비밀번호
  config, // 데이터베이스 설정
);

db.sequelize = sequelize; // db 객체에 Sequelize 인스턴스를 저장합니다.
 
const basename = path.basename(__filename); // 현재 파일명을 가져옵니다.
fs
  .readdirSync(__dirname) // 현재 디렉토리의 파일 목록을 동기적으로 읽어옵니다.
  .filter(file => { // 필터링 조건을 적용하여 .js 확장자 파일만 추출합니다.
    return (file.indexOf('.') !== 0) && (file !== basename)  && (file.slice(-3) === '.js');
  })
  .forEach(file => { // 각 파일에 대해 모델을 불러와 초기화합니다.
    const model = require(path.join(__dirname, file)); // 파일을 require하여 모델을 가져옵니다.
    console.log(file, model.name); // 파일명과 모델명을 콘솔에 출력합니다.
    db[model.name] = model; // db 객체에 모델을 저장합니다.
    model.initiate(sequelize); // 모델의 초기화 메서드를 호출하여 Sequelize 인스턴스와 연결합니다.
  });

Object.keys(db).forEach(modelName => { // db 객체에 저장된 각 모델에 대해 연관 관계를 설정합니다.
  if (db[modelName].associate) { // 모델에 associate 메서드가 있는지 확인합니다.
    db[modelName].associate(db); // 모델의 associate 메서드를 호출하여 연관 관계를 설정합니다.
  }
});

module.exports = db; // db 객체를 내보냅니다.

//이 코드는 Sequelize를 사용하여 데이터베이스와 모델을 초기화하는 과정을 수행합니다

//각 부분에 대한 설명은 다음과 같습니다:

//1. Sequelize 불러오기: Sequelize 패키지를 불러옵니다. 이 패키지는 Node.js에서 SQL 쿼리와 ORM(Object-Relational Mapping)을 제공합니다.
//2. 환경 설정 가져오기: 환경 설정 파일에서 환경에 맞는 설정을 가져옵니다. 이 설정은 데이터베이스 연결 정보와 관련된 다양한 설정을 포함합니다.
//3. 데이터베이스 인스턴스 생성: Sequelize를 사용하여 데이터베이스 인스턴스를 생성합니다. 이 때, 환경 설정에서 가져온 데이터베이스 연결 정보를 사용합니다.
//4. 모델 파일 읽기: 현재 디렉토리의 모든 모델 파일을 동기적으로 읽어옵니다. 이 때, .js 확장자를 가진 파일들만 필터링하여 가져옵니다.
//5. 모델 초기화: 각 모델 파일을 require하여 모델을 가져온 후, Sequelize 인스턴스와 연결합니다. 각 모델은 Sequelize의 모델 클래스를 확장하여 정의되며, 이를 통해 데이터베이스 테이블과의 매핑이 이루어집니다.
//6. 연관 관계 설정: 모든 모델에 대해 연관 관계를 설정합니다. 이는 모델 간의 관계를 정의하고 데이터베이스에서 이를 반영하는 과정입니다.
//7. 모듈 내보내기: 초기화된 모델과 데이터베이스 인스턴스를 내보냅니다. 이를 통해 다른 파일에서 해당 모델 및 데이터베이스 인스턴스에 접근할 수 있습니다.
//이 코드는 Sequelize를 사용하여 Node.js 애플리케이션에서 데이터베이스를 다루는데 필요한 기본적인 설정을 구성합니다.

//config는 환경 설정을 담고 있는 객체입니다. 이 객체는 보통 데이터베이스 연결 정보, 포트 번호, 암호화 키 등과 같은 애플리케이션 설정을 포함합니다. 코드에서 config 객체는 ../config/config.js 파일에서 가져온 것으로 보입니다.
//보통 개발 환경(development), 테스트 환경(test), 프로덕션 환경(production)에 따라 서로 다른 설정이 필요한데, 이러한 설정은 보통 환경 변수를 통해 관리됩니다. 예를 들어, 개발 환경에서는 로컬 데이터베이스를 사용하고, 프로덕션 환경에서는 클라우드 데이터베이스를 사용할 수 있습니다.
//config 객체는 이러한 설정을 담고 있으며, 코드에서는 NODE_ENV 환경 변수를 기반으로 현재 환경을 확인하고 해당 환경에 맞는 설정을 사용합니다. 따라서 코드에서 config 객체를 사용하여 데이터베이스 연결 정보를 가져오고, Sequelize 인스턴스를 생성할 때 이 정보를 활용합니다.
//일반적으로 config 객체는 JSON 또는 JavaScript 파일에 저장되어 있으며, 필요한 설정을 포함하고 있습니다. 설정 파일의 구조 및 내용은 각 프로젝트에 따라 다를 수 있습니다.

//예, 맞습니다. 주어진 JSON 파일은 config 객체의 내용을 포함하고 있습니다. 
//이 JSON 파일은 일반적으로 프로젝트의 환경 설정을 정의하는 데 사용됩니다.
//각각의 환경(development, test, production)에 대해 데이터베이스 연결 정보(username, password, database, host, dialect)를 지정하고 있습니다. 
//이 정보는 Sequelize를 사용하여 데이터베이스에 연결할 때 필요합니다.
//JavaScript 코드에서 이 파일을 불러와서 config 객체로 사용하는 것이 일반적입니다. 
//이렇게 하면 코드를 수정하지 않고도 각 환경에 맞는 설정을 손쉽게 변경할 수 있습니다. 코드에서는 현재 환경 변수(NODE_ENV)를 기반으로 해당 환경의 설정을 가져와 사용하게 됩니다.
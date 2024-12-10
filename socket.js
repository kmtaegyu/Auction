// 소켓 통신을 위한 Socket.IO 모듈을 가져옵니다.
const SocketIO = require('socket.io');

// WebSocket 기능을 초기화하는 함수를 내보냅니다.
module.exports = (server, app) => {
  // Socket.IO를 사용하여 서버와 클라이언트 간의 WebSocket 연결을 생성합니다.
  const io = SocketIO(server, { path: '/socket.io' });

  // Express 애플리케이션에 Socket.IO 인스턴스를 설정합니다.
  app.set('io', io);

  // 클라이언트가 소켓에 연결되었을 때의 이벤트를 처리합니다.
  io.on('connection', (socket) => {
    // 클라이언트로부터의 요청(request) 정보를 추출합니다.
    const req = socket.request;

    // 요청(request) 헤더에서 referer를 추출합니다.
    const { headers: { referer } } = req;

    // referer에서 방(room) 식별자를 추출합니다.
    const roomId = new URL(referer).pathname.split('/').at(-1);

    // 클라이언트를 해당 방(room)에 조인(join)시킵니다.
    socket.join(roomId);

    // 클라이언트가 연결을 해제(disconnect)했을 때의 처리를 정의합니다.
    socket.on('disconnect', () => {
      // 클라이언트를 해당 방(room)에서 떠나게 합니다.
      socket.leave(roomId);
    });
  });
};

//이 코드는 WebSocket을 통해 클라이언트와 서버 간의 실시간 통신을 설정하는 것입니다. 주석을 통해 자세히 설명하면 다음과 같습니다:

//1. Socket.IO 모듈을 사용하여 WebSocket 연결을 설정합니다.
//2. 연결된 io 객체를 Express 애플리케이션의 설정에 저장합니다.
//3. 클라이언트가 소켓에 연결되었을 때(connection 이벤트)의 처리를 정의합니다.
//4. 클라이언트로부터의 요청 정보(req)를 추출합니다.
//5. 요청 헤더에서 referer를 추출하여 클라이언트가 접속한 URL을 알아냅니다.
//6. 접속한 URL에서 방(room) 식별자를 추출합니다.
//7. 해당 방(room)에 클라이언트를 조인(join)시킵니다. 이를 통해 클라이언트는 해당 방의 이벤트를 수신할 수 있습니다.
//8. 클라이언트가 연결을 해제(disconnect)했을 때의 처리를 정의합니다. 클라이언트가 방을 떠날 수 있도록 socket.leave()를 호출하여 해당 방에서 클라이언트를 제거합니다.

//이 코드에서 socket은 Socket.IO의 connection 이벤트 핸들러 내부에서 각 클라이언트와의 통신을 담당하는 개체를 나타냅니다. 이 개체를 통해 클라이언트와 서버 간의 실시간 통신이 이루어집니다.
//여기서 socket 객체를 사용하여 다음과 같은 작업을 수행할 수 있습니다:
//클라이언트가 특정 방에 조인 또는 떠날 수 있도록 관리합니다.
//클라이언트로부터의 메시지를 수신하고 처리합니다.
//클라이언트에게 메시지를 전송합니다.
//연결이 해제될 때 클라이언트와 관련된 정리 작업을 수행합니다.
//여기서 socket 객체는 각 클라이언트와의 개별적인 연결을 나타내며, 이를 통해 클라이언트와 서버 간의 양방향 통신이 이루어집니다. 클라이언트가 특정 방에 조인 또는 떠날 때마다 해당 방과 관련된 socket 객체의 상태가 변경됩니다. 이를 통해 서버는 특정 방에 속한 클라이언트들에게 메시지를 전송하거나, 특정 이벤트에 대한 처리를 수행할 수 있습니다.
import express from 'express';
import configure from './routers';
import { WebSocket, WebSocketServer } from 'ws';

// util
import { getResponseMessage } from './utils';

const app = express();
const port = process.env.PORT || 3000;

configure(app);

console.log(`Attempting to run server on port ${port}`);

const expressServer = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

function onSocketPreError(error: Error) {
  console.error('WebSocket pre error:', error);
}

function onSocketPostError(error: Error) {
  console.error('WebSocket post error:', error);
}

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  ws.on('error', onSocketPostError);
  console.log('New WebSocket connection');

  ws.on('message', (message: string, isBinary: boolean) => {
    console.log(`Received message: ${message}`);

    const responseMessage = getResponseMessage(message);

    if (responseMessage) {
      ws.send(responseMessage, { binary: isBinary });
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

expressServer.on('upgrade', (request, socket, head) => {
  socket.on('error', onSocketPreError);

  // perform authentication here
  if (!!request.headers['authorization']) {
    socket.write('HTTP/1.1 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, ws => {
    socket.removeListener('error', onSocketPreError);
    wss.emit('connection', ws, request);
  });
});

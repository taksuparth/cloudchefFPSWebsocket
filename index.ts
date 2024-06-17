import express from 'express';
import configure from './routers';
import { WebSocket, WebSocketServer } from 'ws';

// util
import { getResponseMessage } from './utils';
import readline from 'readline';

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

  ws.on('message', async (message: string, isBinary: boolean) => {
    console.log(`Received message: ${message}`);

    const responseMessage = await getResponseMessage(message);

    console.log(`Sending message: ${responseMessage}`);

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('line', input => {
  // Check if the input matches the specific key press
  console.log('Input:', input);
  const [fn, payload] = input.split(' ');

  switch (fn) {
    case 'updateStepTimer':
      wss.clients.forEach(ws =>
        ws.send(JSON.stringify({ function: 'updateStepTimer', payload: { stepIndex: 1, stepTime: payload } }))
      );
      break;
    case 'startCountdown':
      wss.clients.forEach(ws =>
        ws.send(JSON.stringify({ function: 'startCountdown', payload: { stepIndex: 1, stepTime: payload } }))
      );
      break;
    default:
      console.log('Invalid input: ', input);
  }
});

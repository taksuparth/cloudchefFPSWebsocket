import express from 'express';
import configure from './routers';
import { WebSocket, WebSocketServer } from 'ws';

// util
import { getResponseMessage } from './utils';
import readline from 'readline';

const app = express();
const port = process.env.PORT || 3000;
let counter = 0;

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
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.function === 'ack') {
      return;
    }

    ws.send(JSON.stringify({ function: 'ack', messageId: parsedMessage.messageId }), { binary: isBinary });

    const responseMessage = await getResponseMessage(message, (counter++).toString());

    if (responseMessage) {
      console.log(`Sending message: ${responseMessage}`);
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
  const [fn, payload] = input.split(' ');

  switch (fn) {
    case 'updateStepTime':
      wss.clients.forEach(ws =>
        ws.send(
          JSON.stringify({
            messageId: counter++,
            function: 'updateStepTime',
            payload: { stepIndex: 1, stepTime: payload },
          })
        )
      );
      break;
    case 'startCountdown':
      wss.clients.forEach(ws =>
        ws.send(
          JSON.stringify({
            messageId: counter++,
            function: 'startCountdown',
            payload: { stepIndex: 1, stepTime: payload },
          })
        )
      );
      break;
    case 'updateInputContainerData':
      const parsedPayload = JSON.parse(JSON.parse(payload));
      wss.clients.forEach(ws =>
        ws.send(JSON.stringify({ messageId: counter++, function: 'updateInputContainerData', payload: parsedPayload }))
      );
      break;
    case 'deleteRecipe':
      wss.clients.forEach(ws =>
        ws.send(JSON.stringify({ messageId: counter++, function: 'deleteRecipe', taskId: payload }))
      );
      break;
    default:
      console.log('Invalid input: ', input);
  }
});

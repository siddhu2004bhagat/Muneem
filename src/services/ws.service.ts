let socket: WebSocket | null = null;
const listeners: Array<(msg: any) => void> = [];

export function connectWS() {
  try {
    socket = new WebSocket(`ws://localhost:8000/api/v1/sync/ws`);
    socket.onmessage = (ev) => {
      try { const data = JSON.parse(ev.data); listeners.forEach(l => l(data)); } catch {}
    };
    socket.onclose = () => { socket = null; setTimeout(connectWS, 3000); };
  } catch {
    setTimeout(connectWS, 5000);
  }
}

export function onWSMessage(fn: (msg: any) => void) { listeners.push(fn); }

export default { connectWS, onWSMessage };



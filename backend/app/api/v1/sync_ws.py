from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/api/v1/sync")

connections: List[WebSocket] = []

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connections.append(ws)
    try:
        while True:
            # Receive pings or ignore; echo small ack
            _ = await ws.receive_text()
            await ws.send_text("ack")
    except WebSocketDisconnect:
        if ws in connections:
            connections.remove(ws)

async def broadcast(event: dict):
    dead = []
    for c in connections:
        try:
            await c.send_json(event)
        except Exception:
            dead.append(c)
    for d in dead:
        if d in connections:
            connections.remove(d)



from typing import List, Optional
from pydantic import BaseModel, Field


class BuzzerPressRequest(BaseModel):
    client_timestamp: Optional[float] = None
    client_time_str: Optional[str] = None


class BuzzerPressResult(BaseModel):
    pressed: bool
    rank: int
    time: str
    clientTime: Optional[str] = None
    serverTime: Optional[str] = None
    latency: str
    title: str
    subtitle: str


class BuzzerQueueItem(BaseModel):
    id: int
    teamId: int
    teamName: str
    name: str
    handle: str
    latency: str
    timestamp: str
    clientTime: Optional[str] = None
    serverTime: Optional[str] = None
    rank: int


class BuzzerQueueStateResponse(BaseModel):
    buzzersArmed: bool
    queueIndex: int
    queue: List[BuzzerQueueItem] = Field(default_factory=list)
    currentWinner: Optional[BuzzerQueueItem] = None

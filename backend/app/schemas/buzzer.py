from typing import List, Optional
from pydantic import BaseModel, Field


class BuzzerPressRequest(BaseModel):
    client_timestamp: Optional[float] = None


class BuzzerPressResult(BaseModel):
    pressed: bool
    rank: int
    time: str
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
    rank: int


class BuzzerQueueStateResponse(BaseModel):
    buzzersArmed: bool
    queueIndex: int
    queue: List[BuzzerQueueItem] = Field(default_factory=list)
    currentWinner: Optional[BuzzerQueueItem] = None

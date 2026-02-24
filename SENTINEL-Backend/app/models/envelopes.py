from datetime import datetime, timezone
from typing import Any, Generic, TypeVar
from fastapi.responses import JSONResponse
from .schemas import ApiResponse, Meta, ErrorResponse


T = TypeVar("T")


def _meta() -> Meta:
    return Meta(timestamp=datetime.now(timezone.utc).isoformat())


def ok(data: Any) -> dict:
    return ApiResponse(success=True, data=data, meta=_meta()).model_dump(by_alias=True)


def err(message: str, status_code: int = 400) -> JSONResponse:
    body = ErrorResponse(
        success=False,
        error=message,
        meta=_meta(),
    ).model_dump(by_alias=True)
    return JSONResponse(status_code=status_code, content=body)

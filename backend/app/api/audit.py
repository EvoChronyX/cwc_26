import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.models.admin import AdminUser
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Kanaku Valaku (Audit Log)"])


@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    category: Optional[str] = Query("ALL"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    logs = await AuditService.get_logs(
        db=db,
        category=category,
        limit=limit,
        offset=offset
    )
    return logs


@router.post("/clear")
async def clear_audit_logs(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    await AuditService.clear_logs(db=db, admin_id=admin.id)
    return {"success": True, "message": "Audit buffer cleared."}


@router.post("/clear-all-records")
async def clear_all_records(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    await AuditService.clear_all_records(db=db, admin_id=admin.id)
    return {"success": True, "message": "All Kanaku Valaku records and tournament telemetry purged."}


@router.get("/export-csv")
async def export_audit_csv(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    logs = await AuditService.get_logs(db=db, category="ALL", limit=1000, offset=0)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Category", "Message"])
    for l in logs:
        writer.writerow([l["id"], l["time"], l["category"], l["message"]])
    
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kanaku_valaku_export.csv"}
    )

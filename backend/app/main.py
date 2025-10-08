from fastapi import FastAPI
from .api.v1.health import router as health_router
from .api.v1.ledger import router as ledger_router
from .api.v1.sync import router as sync_router
from .api.v1.roles import router as roles_router
from .api.v1.audit import router as audit_router
from .api.v1.session import router as session_router
from .api.v1.sync_ws import router as sync_ws_router
from .api.v1.reports import router as reports_router
from .ai.analytics.routes import router as analytics_router
from .ai.federated.routes import router as federated_router

app = FastAPI(title="DigBahi Local API")
app.include_router(health_router)
app.include_router(ledger_router)
app.include_router(sync_router)
app.include_router(roles_router)
app.include_router(audit_router)
app.include_router(session_router)
app.include_router(sync_ws_router)
app.include_router(reports_router)
app.include_router(analytics_router)
app.include_router(federated_router)



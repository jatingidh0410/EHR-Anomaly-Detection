from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import anomaly  # ADD THIS LINE

app = FastAPI(title="EHR Anomaly Detection API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include anomaly router
app.include_router(anomaly.router)  # ADD THIS LINE

@app.get("/")
async def root():
    return {"message": "EHR Anomaly Detection API is running!"}

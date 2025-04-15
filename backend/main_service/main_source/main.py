import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from main_source.users.router import router as router_users
from main_source.news.router import router as router_news
from main_source.objects.router import router as router_objects
from main_source.screenings.router import router as router_screenings
from main_source.deals.router import router as router_deals


app = FastAPI()


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home_page():
    return {"message": "API IS UP"}


app.include_router(router_users)
app.include_router(router_news)
app.include_router(router_objects)
app.include_router(router_screenings)
app.include_router(router_deals)


if __name__ == '__main__':
    uvicorn.run("main_source.main:app", port=8000, reload=True)

Commands:

alembic init migrations

alembic revision --autogenerate -m "Commit"

alembic upgrade head | hash




uvicorn main_source.main:app --reload


Deploy:

Run: ```docker compose up -d --build```

Bash: ```docker exec -t -i itsm-app-full-server-1 /bin/bash```



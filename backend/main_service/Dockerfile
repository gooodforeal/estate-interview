FROM python:3.9-slim

ENV PYTHONUNBUFFERED 1

WORKDIR .

# для абсолютных импортов
ENV PYTHONPATH="$PYTHONPATH:/main_source

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .
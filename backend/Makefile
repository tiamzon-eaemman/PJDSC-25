.PHONY: all

build:
	source .venv/bin/activate && pip install -r requirements.txt

run:
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

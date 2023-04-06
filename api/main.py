import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.api.serv:app", host="0.0.0.0", port=8000, log_level="info")

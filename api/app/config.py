DATABASE_URL = "sqlite:///../../zit.sqlite"

CELERY_BROKER = "amqp://localhost"
CELERY_BACKEND = "rpc://"
CELERY_INCLUDE = "app.utils.taskqueue.tasks"

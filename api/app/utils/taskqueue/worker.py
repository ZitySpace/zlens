from celery import Celery

from ...config import CELERY_BACKEND, CELERY_BROKER, CELERY_INCLUDE

Q_FORMULA = "formulaQ"
appFormula = Celery("appFormula", backend=CELERY_BACKEND, broker=CELERY_BROKER, include=f"{CELERY_INCLUDE}.formula")

appFormula.conf.update({"broker_connection_retry_on_startup": True})

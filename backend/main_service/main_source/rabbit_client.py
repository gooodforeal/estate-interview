from pika import ConnectionParameters, BlockingConnection
import json

from main_source.config import settings


class RabbitClient:
    def __init__(self):
        self.connection_params = ConnectionParameters(
            host=settings.RABBIT_HOST,
            port=settings.RABBIT_PORT,
        )

    def send_message(self, msg: dict):
        with BlockingConnection(self.connection_params) as conn:
            with conn.channel() as ch:
                ch.queue_declare(queue=settings.RABBIT_QUEUE)
                ch.basic_publish(
                    exchange="",
                    routing_key=settings.RABBIT_QUEUE,
                    body=json.dumps(msg, indent=4, sort_keys=True, default=str)
                )


def get_rabbit_client() -> RabbitClient:
    return RabbitClient()

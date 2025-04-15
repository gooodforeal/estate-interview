import json
import logging
import asyncio
import aio_pika
import aio_pika.abc

from notification_source.config import settings
from notification_source.email_sender import Email
from notification_source.config import configure_logging


logger = logging.getLogger(__name__)
configure_logging()


async def main(loop):
    connection = await aio_pika.connect_robust(
        host=settings.RABBIT_HOST,
        port=settings.RABBIT_PORT,
        login=settings.RABBIT_LOGIN,
        password=settings.RABBIT_PASSWORD,
        loop=loop
    )
    async with connection:
        queue_name = settings.RABBIT_QUEUE
        channel: aio_pika.abc.AbstractChannel = await connection.channel()
        queue: aio_pika.abc.AbstractQueue = await channel.declare_queue(
            queue_name,
            auto_delete=False
        )
        logger.info("Соединение установлено!")
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    logger.info("Получено сообщение: %r", message.body.decode())
                    notification_dict = json.loads(message.body.decode())
                    try:
                        await Email(data=notification_dict).send_verification_code()
                        logger.info("Сообщение отправлено на почту пользователю!")
                    except Exception as ex:
                        print(ex)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(loop))
    loop.close()

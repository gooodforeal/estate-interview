from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Environment, select_autoescape, FileSystemLoader

from notification_source.config import settings


env = Environment(
    loader=FileSystemLoader('templates'),
    autoescape=select_autoescape(['html', 'xml'])
)


class Email:
    def __init__(self, data: dict):
        self.name = data["fio"]
        self.sender = 'Timofey <admin@esate-interview.com>'
        self.emails = [data["email"]]
        self.url = data["verification_url"]

    async def send_mail(self, subject, template):
        # Define the config
        conf = ConnectionConfig(
            MAIL_USERNAME=settings.EMAIL_USERNAME,
            MAIL_PASSWORD=settings.EMAIL_PASSWORD,
            MAIL_FROM=settings.EMAIL_FROM,
            MAIL_PORT=settings.EMAIL_PORT,
            MAIL_SERVER=settings.EMAIL_HOST,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
        # Generate the HTML template base on the template name
        template = env.get_template(f'{template}.html')
        html = template.render(
            url=self.url,
            first_name=self.name,
            subject=subject
        )
        # Define the message options
        message = MessageSchema(
            subject=subject,
            recipients=self.emails,
            body=html,
            subtype="html"
        )
        # Send the email
        fm = FastMail(conf)
        await fm.send_message(message)

    async def send_verification_code(self):
        await self.send_mail('Your verification code (Valid for 10min)', 'verification')

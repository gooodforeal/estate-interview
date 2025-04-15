from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO


class PresGenerator:
    @staticmethod
    def create_comparison_image(obj1, obj2, output_path='comparison_real_estate.jpg'):
        width = 1200
        height = 700
        margin = 50
        padding = 20
        column_width = (width - 3 * margin) // 2
        bg_color = (255, 255, 255)
        header_color = (30, 30, 30)
        text_color = (50, 50, 50)
        font_size = 20
        title_font_size = 28

        # Load fonts
        font = ImageFont.truetype("arial.ttf", font_size)
        title_font = ImageFont.truetype("arial.ttf", title_font_size)

        image = Image.new('RGB', (width, height), color=bg_color)
        draw = ImageDraw.Draw(image)

        # Draw the title "Estate.Interview"
        title_text = "Estate.Interview"
        # Use textbbox instead of textsize
        bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = bbox[2] - bbox[0]
        title_height = bbox[3] - bbox[1]
        draw.text(((width - title_width) / 2, padding), title_text, fill=header_color, font=title_font)

        # Draw column titles
        draw.text((margin + column_width // 2 - 100, padding + title_height + 10), "Объект 1", fill=header_color, font=title_font)
        draw.text((margin * 2 + column_width + column_width // 2 - 100, padding + title_height + 10), "Объект 2", fill=header_color, font=title_font)

        fields = ["address", "metro", "total_square", "floor", "remont_type", "price", "author"]

        y_offset = 70 + title_height + 10
        line_spacing = 40

        for i, field in enumerate(fields):
            y = y_offset + i * line_spacing

            label = field.replace('_', ' ').capitalize() + ":"
            draw.text((margin, y), label, fill=text_color, font=font)
            draw.text((margin + 150, y), str(obj1.get(field, '-')), fill=text_color, font=font)
            draw.text((margin * 2 + column_width + 150, y), str(obj2.get(field, '-')), fill=text_color, font=font)

        # Load and paste photos
        def load_image_from_url(url, resize_to=(column_width - 40, 250)):
            try:
                response = requests.get(url)
                photo = Image.open(BytesIO(response.content)).convert("RGB")
                return photo.resize(resize_to)
            except:
                return None

        photo1 = load_image_from_url(obj1.get('photo_link', ''))
        photo2 = load_image_from_url(obj2.get('photo_link', ''))

        if photo1:
            image.paste(photo1, (margin, height - photo1.height - padding))
        if photo2:
            image.paste(photo2, (margin * 2 + column_width, height - photo2.height - padding))

        img_bytes = BytesIO()
        image.save(img_bytes, format='JPEG')  # важно: format='JPEG'
        img_bytes.seek(0)
        return img_bytes.getvalue()


# Пример данных объектов с новым полем "author"
obj1 = {
    "address": "ул. Ленина, 10",
    "metro": "Пушкинская",
    "total_square": "55 м²",
    "floor": "5 из 9",
    "remont_type": "Евроремонт",
    "price": "10 500 000 ₽",
    "author": "Частное лицо",
    "photo_link": "https://api.ru-7.storage.selcloud.ru/v2/panel/links/5c936817ba58ecd22deb5eae94b97208f3ce6723?inline=true"  # Замените на рабочую ссылку
}

obj2 = {
    "address": "пр. Мира, 22",
    "metro": "Маяковская",
    "total_square": "60 м²",
    "floor": "7 из 12",
    "remont_type": "Без ремонта",
    "price": "9 800 000 ₽",
    "author": "Компания",
    "photo_link": "https://api.ru-7.storage.selcloud.ru/v2/panel/links/8c449134708f8de5a2d06bf41c1c5479b2816a8d?inline=true"  # Замените на рабочую ссылку
}

#create_comparison_image(obj1, obj2)


def get_presgenerator() -> PresGenerator:
    prs = PresGenerator()
    return prs
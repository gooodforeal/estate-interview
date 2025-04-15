import aiohttp
import asyncio


async def post_method():
    async with aiohttp.ClientSession() as session:
        async with session.post('http://localhost:8000/auth/login', json={"email": "2390603@gmail.com", "password": "test123456"}) as response:
            print("Status:", response.status)
            print("Content-type:", response.headers['content-type'])
            print("cookie", response.cookies["users_access_token"].value)
            data = await response.text()
            print("dat: ", data)


asyncio.run(post_method())
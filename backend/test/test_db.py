import asyncio
from dotenv import load_dotenv
load_dotenv()
from db.mongodb import connect_db
from routes.crud import get_user_by_email, create_user
from passlib.context import CryptContext

async def test():
    await connect_db()
    pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
    try:
        user = await create_user('isolated@test.com', pwd_ctx.hash('testpass'))
        print('SUCCESS:', user)
    except Exception as e:
        import traceback; traceback.print_exc()

asyncio.run(test())

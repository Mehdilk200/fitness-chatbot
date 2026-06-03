import asyncio
from dotenv import load_dotenv
load_dotenv()
from db.mongodb import connect_db
from routes.crud import get_user_by_email, create_user
from passlib.context import CryptContext

async def main():
    await connect_db()
    pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
    try:
        email = "admin@fitbot.com"
        password = "Admin_Fitbot_2026!"
        existing = await get_user_by_email(email)
        if existing:
            print(f"User {email} already exists!")
        else:
            user = await create_user(email, pwd_ctx.hash(password))
            print(f"SUCCESS: Created admin user: {email} with password: {password}")
    except Exception as e:
        import traceback; traceback.print_exc()

asyncio.run(main())

from contextlib import asynccontextmanager
from prisma import Prisma
import logging


prisma = Prisma()


@asynccontextmanager
async def prisma_lifespan(app):  # type: ignore[no-untyped-def]
    try:
        await prisma.connect()
    except Exception as exc:  # tolerate missing DB during dev bootstrap
        logging.getLogger(__name__).warning("Prisma connect failed: %s", exc)
    try:
        yield
    finally:
        try:
            await prisma.disconnect()
        except Exception:
            pass

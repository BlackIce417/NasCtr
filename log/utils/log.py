import logging
from ..models import SystemLog

logger = logging.getLogger("main")  # 这里用 settings.py 配置的 logger 名称

def log_event(user=None, level="INFO", message=""):
    """
    写入日志（文件 + 数据库）
    """
    # 写文件日志
    if level == "INFO":
        logger.info(message)
    elif level == "WARNING":
        logger.warning(message)
    elif level == "ERROR":
        logger.error(message)
    else:
        logger.debug(message)

    # 写数据库日志
    SystemLog.objects.create(
        user=user if user and getattr(user, "is_authenticated", False) else None,
        level=level,
        message=message
    )

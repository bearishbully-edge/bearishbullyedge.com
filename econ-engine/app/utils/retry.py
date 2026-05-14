# utils/retry.py
import time
import logging
from functools import wraps

LOG = logging.getLogger("retry")

def retry(exc_types=(Exception,), tries=5, delay=1, backoff=2, logger=None):
    def deco(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            _tries, _delay = tries, delay
            while _tries > 1:
                try:
                    return f(*args, **kwargs)
                except exc_types as e:
                    msg = f"{f.__name__} failed: {e}, retrying in {_delay}s..."
                    if logger:
                        logger.warning(msg)
                    else:
                        LOG.warning(msg)
                    time.sleep(_delay)
                    _tries -= 1
                    _delay *= backoff
            return f(*args, **kwargs)
        return wrapper
    return deco
import logging
import logging.config
from logging import LogRecord
from os import path

import yaml

CONFIG_FILE = path.dirname(__file__) + "/logging.yaml"


class NameFilter(logging.Filter):
    __names: list[str]

    def __init__(self, names: list[str]) -> None:
        self.__names = list(names)

    def filter(self, record: LogRecord) -> bool:
        for name in self.__names:
            if record.name.startswith(name):
                return True
        return False


class __LoggerFactory:
    __initialized: bool = False

    @classmethod
    def init_logger(cls) -> None:
        if cls.__initialized:
            return
        cls.__initialized = True

        with open(CONFIG_FILE) as f:
            config = yaml.safe_load(f)

        logging.config.dictConfig(config)

    @classmethod
    def get_logger(cls, name: str) -> logging.Logger:
        cls.init_logger()
        return logging.getLogger(name)


__LoggerFactory.init_logger()

get_logger = __LoggerFactory.get_logger

from pathlib import PurePath as __PurePath

from yggy.basic import *

app_root = __PurePath(__file__).parent
web_root = app_root.parent / "web"

manager = Manager(
    app_root=app_root.as_posix(),
    web_root=web_root.as_posix(),
    singleton=True,
)

from pathlib import PurePath as __PurePath

from yggy.basic import *

app_root = __PurePath(__file__).parent
web_root = app_root.parent / "web"

static_file_exts = "html", "js", "css", "ico", "png", "gif", "svg"

manager = Manager(
    app_root=app_root.as_posix(),
    web_root=web_root.as_posix(),
    static_file_exts=static_file_exts,
    singleton=True,
)

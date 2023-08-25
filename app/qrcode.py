# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false

import socket
from pathlib import PurePath

import qrcode.image.styles.moduledrawers.svg as drawers
from qrcode.image.svg import SvgPathImage
from qrcode.main import QRCode


def get_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(0)
    try:
        s.connect(("10.254.254.254", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def save_ip_qrcode(web_root: PurePath) -> None:
    class MySvgPathImage(SvgPathImage):
        QR_PATH_STYLE = {}

    ip = get_ip()
    qr = QRCode(border=0, box_size=12)
    qr.add_data(f"http://{ip}:8000")
    img = qr.make_image(
        image_factory=MySvgPathImage,
        module_drawer=drawers.SvgPathSquareDrawer(),
        attrib={
            "style": "fill: var(--text-color);",
        },
    )
    with open(web_root / "qr.svg", "bw") as f:
        img.save(f)

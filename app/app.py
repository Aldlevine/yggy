import glob
import os
import subprocess
from pathlib import Path
from typing import Any

from flask import Flask, Response, make_response

import components as components
from pyggy import init_global_comm
from pyggy import observable as po
from pyggy.comm import init_global_comm
from pyggy.component import Component

app = Flask(__name__)
comm = init_global_comm(app)


@app.route("/")
def index() -> Response:
    with open("assets/index.html") as file:
        return make_response(file.read())


@app.route("/components/<path:id>.js")
def serve_component(id: str) -> Response:
    ...


@app.route("/<path:file>.<ext>")
def serve_static(file: str, ext: str) -> Response:
    status_code = 200
    try:
        with open(f"assets/{file}.{ext}", "r") as f:
            text = f.read()
    except FileNotFoundError:
        try:
            with open(f"assets/generated/{file}.{ext}", "r") as f:
                text = f.read()
        except FileNotFoundError:
            text = "404 - Not Found"
            status_code = 404

    resp = make_response(text)
    resp.status_code = status_code
    if ext == "js":
        resp.mimetype = "text/javascript"
    elif ext == "json":
        if file == "importmap":
            resp.mimetype = "application/importmap+json"
        else:
            resp.mimetype = "text/json"
    elif ext == "css":
        resp.mimetype = "text/css"
    elif ext == "html":
        ...
    return resp


@comm.recv("change")
def handle_change(sid: str, change: po.Change[Any]) -> None:
    po.Observable.get(change["id"]).value = change["new_value"]


def generate_comm_ts() -> None:
    gen_dir = Path(".") / "generated"
    os.makedirs(gen_dir, exist_ok=True)
    ts = comm.generate_ts()
    with open(gen_dir / "icomm.ts", "w") as f:
        f.write(ts)


def generate_component_ts() -> None:
    gen_dir = Path(".") / "generated"
    os.makedirs(gen_dir, exist_ok=True)
    ts = Component.generate_ts()
    with open(gen_dir / "icomponents.ts", "w") as f:
        f.write(ts)


def compile_mako() -> None:
    from .mako import render_mako

    for file in glob.glob("web/**/*.mako", recursive=True):
        new_file = "assets/" + file.removeprefix("web/").removesuffix(".mako")
        with open(file, "r") as inf:
            text = inf.read()

        text = render_mako(text)

        with open(new_file, "w") as outf:
            outf.write(text)


def compile_ts() -> None:
    subprocess.call(f"npx tsc".split(" "))

    for file in glob.glob("assets/generated/**/*", recursive=True):
        new_file = "assets/" + file.removeprefix("assets/generated/")
        os.rename(file, new_file)
    os.rmdir("assets/generated")

    for file in glob.glob("assets/web/**/*", recursive=True):
        new_file = "assets/" + file.removeprefix("assets/web/")
        os.rename(file, new_file)
    os.rmdir("assets/web")

    for file in glob.glob("assets/components/**/*", recursive=True):
        new_file = "assets/" + file.removeprefix("assets/components/")
        os.rename(file, new_file)
    os.rmdir("assets/components")


def copy_static_files() -> None:
    globs = (
        glob.glob("web/**/*.css", recursive=True)
        + glob.glob("web/**/*.html", recursive=True)
        + glob.glob("web/**/*.json", recursive=True)
    )
    for file in globs:
        new_file = "assets" + file.removeprefix("web")
        with open(Path(file), "r") as inf:
            with open(Path(new_file), "w") as outf:
                outf.write(inf.read())


def generate_ts():
    generate_comm_ts()
    generate_component_ts()


def startup() -> None:
    generate_ts()
    compile_ts()
    compile_mako()
    copy_static_files()


cache: list[Any] = []


from components import Slider

slider = Slider(val=50, min=0, max=200, step=5)


@comm.recv("start")
def handle_start(sid: str) -> None:
    po.Observable.send_registered(sid=sid)

    slider.attach("#slider", sid=sid)
    Slider(val=0, min=-100, max=100, step=10).attach("#slider2", sid=sid)

    comm.send("start", sid=sid)


if __name__ == "__main__":
    startup()
    comm.run()

# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false

from mako.lookup import TemplateLookup
from mako.template import Template


def render_mako(text: str) -> str:
    return str(Template(text, lookup=TemplateLookup(directories="./web")).render())

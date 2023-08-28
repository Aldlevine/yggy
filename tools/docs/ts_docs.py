from subprocess import call


def generate_docs() -> None:
    call("npx typedoc".split(" "))

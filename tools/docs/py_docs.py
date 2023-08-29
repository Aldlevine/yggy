from importlib import import_module

import docspec
from pydoc_markdown.contrib.loaders.python import PythonLoader
from pydoc_markdown.contrib.processors.crossref import CrossrefProcessor
from pydoc_markdown.contrib.processors.filter import FilterProcessor
from pydoc_markdown.contrib.processors.google import GoogleProcessor
from pydoc_markdown.contrib.renderers.markdown import (
    MarkdownReferenceResolver, MarkdownRenderer)
from pydoc_markdown.interfaces import Context


class Resolver(MarkdownReferenceResolver):
    def __get_parent_module(self, scope: docspec.ApiObject | None) -> docspec.Module | None:
        if scope is None or isinstance(scope, docspec.Module):
            return scope
        return self.__get_parent_module(scope.parent)

    def resolve_ref(self, scope: docspec.ApiObject, ref: str) -> str | None:
        import src

        ref_split = ref.split(".")

        try:
            # first try locally
            module_scope = self.__get_parent_module(scope)
            assert module_scope is not None
            
            mod = import_module("yggy."+module_scope.name)
            obj: object = getattr(mod, ref)
            module = obj.__module__.removeprefix("yggy.")
            return f"#{module}.{ref}"
        except:
            # then try from root
            try:
                cur_obj = src
                for piece in ref_split:
                    cur_obj = getattr(cur_obj, piece)
                assert isinstance(cur_obj, object)
                module: str = cur_obj.__module__
                module = module.removeprefix("yggy.")
                return f"#{module}.{getattr(cur_obj, "__qualname__", "")}"
            except:
                return super().resolve_ref(scope, ref)


def generate_docs() -> None:
    context = Context("yggy")
    loader = PythonLoader(search_path=["."])

    resolver = Resolver()
    processors = [
        FilterProcessor(skip_empty_modules=True, documented_only=True),
        GoogleProcessor(),
        CrossrefProcessor(),
    ]

    renderer = MarkdownRenderer(
        filename="docs/py/README.md",
        descriptive_class_title=False,
        render_toc=True,
        toc_maxdepth=1,
    )

    loader.init(context)
    for processor in processors:
        processor.init(context)
    renderer.init(context)


    modules = list(loader.load())

    for processor in processors:
        processor.process(modules, resolver)

    renderer.process(modules, resolver)
    renderer.render(modules)

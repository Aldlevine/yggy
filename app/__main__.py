from os import path
import yggy.basic as yggy

app = yggy.app.App(
    app_root=path.dirname(__file__),
    web_root=path.normpath(path.dirname(__file__) + "/../web"),
)


class ObjModel(yggy.ObjectModel, total=False):
    value: int
    min: int
    max: int


class Obj(app.Object[ObjModel]):
    value = app.obs(0)
    min = app.obs(0)
    max = app.obs(100)


class Obj2Model(yggy.ObjectModel, total=False):
    obj: Obj


class Obj2(app.Object[Obj2Model]):
    obj = app.obs(Obj)


def main() -> None:
    obj2 = Obj2({})
    obj2.obj.value.value = 10
    app.run()


if __name__ == "__main__":
    main()

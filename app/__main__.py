import yggy

from . import app

app.run()


class ObjModel(yggy.ObjectModel, total=False):
    value: int
    min: int
    max: int


class Obj(app.Object[ObjModel]):
    value = app.Value(0)
    min = app.Value(0)
    max = app.Value(100)


async def obj_change(key: str, change: yggy.ObservableChangeMessage[int]) -> None:
    print(key, change)


def main() -> None:
    obj = Obj({})
    obj.watch(obj_change)
    obj.value.value = 10


app.comm.recv("comm.ready")
main()

# print(obj.type.__annotations__)

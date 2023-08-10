from typing import TYPE_CHECKING, Any

from .observable import Observable

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = ["ObservableValue"]

class ObservableValue[T](Observable[T]):
    __value: T

    def __init__(self, __manager: "ObservableManager", __value: T) -> None:
        super().__init__(__manager)
        self.__value = __value

    def __json__(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "value": self.get()
        }

    def _get(self) -> T:
        return self.__value
    
    def _set(self, __value: T) -> None:
        self.__value = __value
        

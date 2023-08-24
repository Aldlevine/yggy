import { __uuid4 } from "../utils.js";

export type Message = {
    message_id: string;
};

export function create_message<T extends Message>(
    kwds: Omit<T, keyof Message>
): T {
    return <T>{
        ...kwds,
        message_id: __uuid4(),
    };
}

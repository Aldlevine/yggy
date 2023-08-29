import { uuid4 } from "../utils/uuid.js";
export function create_message(kwds) {
    return {
        ...kwds,
        message_id: uuid4(),
    };
}

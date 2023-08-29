export type Message = {
    message_id: string;
};
export declare function create_message<T extends Message>(kwds: Omit<T, keyof Message>): T;

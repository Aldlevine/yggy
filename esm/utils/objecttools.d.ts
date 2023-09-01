export type ObjectOf<T> = T extends object ? T : T extends boolean ? Boolean : T extends number ? Number : T extends string ? String : never;
export declare function object_of<T>(p: T): ObjectOf<T>;

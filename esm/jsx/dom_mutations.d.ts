declare global {
    interface Window {
        __yggy__dom_mutations__?: typeof __DomMutations;
    }
}
declare class TreeEvent extends Event {
}
export type TreeEvents = {
    /**
     * Called after this node enters the document
     */
    enter?(evt: TreeEvent): void;
    /**
     * Called after this node exits the document
     */
    exit?(evt: TreeEvent): void;
};
export type TreeEventHandlers = {
    [P in keyof TreeEvents as `on${P}`]: TreeEvents[P];
};
declare class __DomMutations {
    #private;
    static start(): void;
    static stop(): void;
    private constructor();
}
export declare const DomMutations: typeof __DomMutations;
export {};
const DEFAULT_TARGET_NODE: Node = document;
const DEFAULT_CONFIG: MutationObserverInit = { childList: true, subtree: true }

declare global {
    interface Window {
        __yggy__dom_mutations__?: typeof __TreeEventManager;
    }
}

class TreeEvent extends Event { }

export type TreeEvents = {
    /**
     * Called after this node enters the document
     */
    enter?(evt: TreeEvent): void;

    /**
     * Called after this node exits the document
     */
    exit?(evt: TreeEvent): void;
}

export type TreeEventHandlers = {
    [P in keyof TreeEvents as `on${P}`]: TreeEvents[P];
}

class __TreeEventManager {
    static #instance?: __TreeEventManager;

    #target_node: Node;
    #config: MutationObserverInit
    #observer: MutationObserver

    static start(): void {
        this.#get_instance().#stop();
        this.#get_instance().#start();
    }

    static stop(): void {
        this.#get_instance().#stop();
    }

    static #get_instance(): __TreeEventManager {
        if (this.#instance) {
            return this.#instance;
        }
        const instance = this.#instance = new __TreeEventManager();
        return instance;
    }

    private constructor({
        target_node = DEFAULT_TARGET_NODE,
        config = DEFAULT_CONFIG,
    } = {}) {
        this.#target_node = target_node;
        this.#config = config
        this.#observer = new MutationObserver(this.#handle_mutation.bind(this));
    }

    #call_mutation_event(node: Node & TreeEventHandlers, type: keyof TreeEvents): void {
        const event = new TreeEvent(type);
        node[`on${type}`]?.(event);
        node.dispatchEvent(event);
    }

    #handle_mutation(mutationList: MutationRecord[], observer: MutationObserver) {
        for (const mutation of mutationList) {
            if (mutation.type !== "childList") { return; }

            for (let node of Array.from(mutation.addedNodes)) {
                this.#call_mutation_event(node, "enter");
            }

            for (let node of Array.from(mutation.removedNodes)) {
                this.#call_mutation_event(node, "exit");
            }
        }
    }

    #start(): void {
        this.#observer.observe(this.#target_node, this.#config);
    }

    #stop(): void {
        this.#observer.disconnect();
    }
}


let __export: typeof __TreeEventManager;

if (window.__yggy__dom_mutations__) {
    __export = window.__yggy__dom_mutations__;
}
else {
    __export = window.__yggy__dom_mutations__ = __TreeEventManager;
}

export const TreeEventManager = __export;
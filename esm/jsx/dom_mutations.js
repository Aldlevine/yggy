const DEFAULT_TARGET_NODE = document;
const DEFAULT_CONFIG = { childList: true, subtree: true };
class TreeEvent extends Event {
}
class __DomMutations {
    static #instance;
    #target_node;
    #config;
    #observer;
    static start() {
        this.#get_instance().#stop();
        this.#get_instance().#start();
    }
    static stop() {
        this.#get_instance().#stop();
    }
    static #get_instance() {
        if (this.#instance) {
            return this.#instance;
        }
        const instance = this.#instance = new __DomMutations();
        return instance;
    }
    constructor({ target_node = DEFAULT_TARGET_NODE, config = DEFAULT_CONFIG, } = {}) {
        this.#target_node = target_node;
        this.#config = config;
        this.#observer = new MutationObserver(this.#handle_mutation.bind(this));
    }
    #call_mutation_event(node, type) {
        const event = new TreeEvent(type);
        node[`on${type}`]?.(event);
        node.dispatchEvent(event);
    }
    #handle_mutation(mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.type !== "childList") {
                return;
            }
            for (let node of Array.from(mutation.addedNodes)) {
                this.#call_mutation_event(node, "enter");
            }
            for (let node of Array.from(mutation.removedNodes)) {
                this.#call_mutation_event(node, "exit");
            }
        }
    }
    #start() {
        this.#observer.observe(this.#target_node, this.#config);
    }
    #stop() {
        this.#observer.disconnect();
    }
}
let __export;
if (window.__yggy__dom_mutations__) {
    __export = window.__yggy__dom_mutations__;
}
else {
    __export = window.__yggy__dom_mutations__ = __DomMutations;
}
export const DomMutations = __export;

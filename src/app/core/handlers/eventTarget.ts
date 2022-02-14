export abstract class AbstractEventTarget implements EventTarget {
    #eventHandlers: { [eventName: string]: Array<(e: Event) => void | PromiseLike<void>> } = {};

    public addEventListener<E extends Event>(type: string, callback: (e: E) => void | PromiseLike<void>) {
        if (this.#eventHandlers[type]) this.#eventHandlers[type].push(callback);
        else this.#eventHandlers[type] = [callback];
    }
    public removeEventListener<E extends Event>(type: string, callback: (e: E) => void | PromiseLike<void>) {
        const specifiedEvent = this.#eventHandlers[type];

        if (specifiedEvent) specifiedEvent.splice(specifiedEvent.indexOf(callback), 1);
    }
    public dispatchEvent<E extends Event>(event: E): boolean {
        const { type } = event;

        if (this.#eventHandlers[type]) {
            this.#eventHandlers[type].forEach(async callback => await callback(event));
            return true;
        } else return false;
    }
}

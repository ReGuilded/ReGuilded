export abstract class AbstractEventTarget implements EventTarget {
    /**
     * All of the event handlers that were attached to the event target.
     *
     * @default {}
     */
    #eventHandlers: {
        [eventName: string]: Array<(e: Event) => void | PromiseLike<void>>;
    } = {};

    /**
     * Adds a callback to an event.
     * @param type The type of event to listen to
     * @param callback The callback when the event gets fired
     */
    public addEventListener<E extends Event>(type: string, callback: (e: E) => void | PromiseLike<void>) {
        if (this.#eventHandlers[type]) this.#eventHandlers[type].push(callback);
        else this.#eventHandlers[type] = [callback];
    }
    /**
     * Removes a callback from an event.
     * @param type The type of the event the callback is in
     * @param callback The event callback to remove
     */
    public removeEventListener<E extends Event>(type: string, callback: (e: E) => void | PromiseLike<void>) {
        const specifiedEvent = this.#eventHandlers[type];

        if (specifiedEvent) specifiedEvent.splice(specifiedEvent.indexOf(callback), 1);
    }
    /**
     * Fires all callbacks an event has. The type is specified in the event's instance's `type` property.
     * @param event The event to fire
     * @returns Was it successful
     */
    public dispatchEvent<E extends Event>(event: E): boolean {
        const { type } = event;

        if (this.#eventHandlers[type]) {
            this.#eventHandlers[type].forEach(async (callback) => await callback(event));
            return true;
        } else return false;
    }
}

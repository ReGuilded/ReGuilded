/**
 * Handles errors of a function or promise.
 * @param fn The function to call
 * @param errorHandler The function to handle errors with
 * @returns The return value of the function
 */
export function handleErrorsOf<T>(fn: () => Promise<T> | T, errorHandler: (error: Error | any) => void): T | Promise<T> {
    try {
        const value = fn;

        if (value instanceof Promise) return value.catch(errorHandler);
    } catch (error) {
        errorHandler(error);
    }
}

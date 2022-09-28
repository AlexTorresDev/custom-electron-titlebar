/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { combinedDisposable, Disposable, IDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { LinkedList } from 'vs/base/common/linkedList';

/**
 * To an event a function with one or zero parameters
 * can be subscribed. The event is the subscriber function itself.
 */
export interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
}

export namespace Event {
    const _disposable = { dispose() { } };
    export const None: Event<any> = function () { return _disposable; };

	/**
	 * Given an event, returns another event which only fires once.
	 */
    export function once<T>(event: Event<T>): Event<T> {
        return (listener, thisArgs = null, disposables?) => {
            // we need this, in case the event fires during the listener call
            let didFire = false;

            const result = event(e => {
                if (didFire) {
                    return;
                } else if (result) {
                    result.dispose();
                } else {
                    didFire = true;
                }

                return listener.call(thisArgs, e);
            }, null, disposables);

            if (didFire) {
                result.dispose();
            }

            return result;
        };
    }

	/**
	 * Given an event and a `map` function, returns another event which maps each element
	 * throught the mapping function.
	 */
    export function map<I, O>(event: Event<I>, map: (i: I) => O): Event<O> {
        return (listener, thisArgs = null, disposables?) => event(i => listener.call(thisArgs, map(i)), null, disposables);
    }

	/**
	 * Given an event and an `each` function, returns another identical event and calls
	 * the `each` function per each element.
	 */
    export function forEach<I>(event: Event<I>, each: (i: I) => void): Event<I> {
        return (listener, thisArgs = null, disposables?) => event(i => { each(i); listener.call(thisArgs, i); }, null, disposables);
    }

	/**
	 * Given an event and a `filter` function, returns another event which emits those
	 * elements for which the `filter` function returns `true`.
	 */
    export function filter<T>(event: Event<T>, filter: (e: T) => boolean): Event<T>;
    export function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R): Event<R>;
    export function filter<T>(event: Event<T>, filter: (e: T) => boolean): Event<T> {
        return (listener, thisArgs = null, disposables?) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables);
    }

	/**
	 * Given an event, returns the same event but typed as `Event<void>`.
	 */
    export function signal<T>(event: Event<T>): Event<void> {
        return event as Event<any> as Event<void>;
    }

	/**
	 * Given a collection of events, returns a single event which emits
	 * whenever any of the provided events emit.
	 */
    export function any<T>(...events: Event<T>[]): Event<T> {
        return (listener, thisArgs = null, disposables?) => combinedDisposable(events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
    }

	/**
	 * Given an event and a `merge` function, returns another event which maps each element
	 * and the cummulative result throught the `merge` function. Similar to `map`, but with memory.
	 */
    export function reduce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, initial?: O): Event<O> {
        let output: O | undefined = initial;

        return map<I, O>(event, e => {
            output = merge(output, e);
            return output;
        });
    }

	/**
	 * Debounces the provided event, given a `merge` function.
	 *
	 * @param event The input event.
	 * @param merge The reducing function.
	 * @param delay The debouncing delay in millis.
	 * @param leading Whether the event should fire in the leading phase of the timeout.
	 * @param leakWarningThreshold The leak warning threshold override.
	 */
    export function debounce<T>(event: Event<T>, merge: (last: T, event: T) => T, delay?: number, leading?: boolean, leakWarningThreshold?: number): Event<T>;
    export function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number, leading?: boolean, leakWarningThreshold?: number): Event<O>;
    export function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay: number = 100, leading = false, leakWarningThreshold?: number): Event<O> {

        let subscription: IDisposable;
        let output: O | undefined = undefined;
        let handle: any = undefined;
        let numDebouncedCalls = 0;

        const emitter = new Emitter<O>({
            leakWarningThreshold,
            onFirstListenerAdd() {
                subscription = event(cur => {
                    numDebouncedCalls++;
                    output = merge(output, cur);

                    if (leading && !handle) {
                        emitter.fire(output);
                    }

                    clearTimeout(handle);
                    handle = setTimeout(() => {
                        let _output = output;
                        output = undefined;
                        handle = undefined;
                        if (!leading || numDebouncedCalls > 1) {
                            emitter.fire(_output!);
                        }

                        numDebouncedCalls = 0;
                    }, delay);
                });
            },
            onLastListenerRemove() {
                subscription.dispose();
            }
        });

        return emitter.event;
    }

	/**
	 * Given an event, it returns another event which fires only once and as soon as
	 * the input event emits. The event data is the number of millis it took for the
	 * event to fire.
	 */
    export function stopwatch<T>(event: Event<T>): Event<number> {
        const start = new Date().getTime();
        return map(once(event), _ => new Date().getTime() - start);
    }

	/**
	 * Given an event, it returns another event which fires only when the event
	 * element changes.
	 */
    export function latch<T>(event: Event<T>): Event<T> {
        let firstCall = true;
        let cache: T;

        return filter(event, value => {
            let shouldEmit = firstCall || value !== cache;
            firstCall = false;
            cache = value;
            return shouldEmit;
        });
    }

	/**
	 * Buffers the provided event until a first listener comes
	 * along, at which point fire all the events at once and
	 * pipe the event from then on.
	 *
	 * ```typescript
	 * const emitter = new Emitter<number>();
	 * const event = emitter.event;
	 * const bufferedEvent = buffer(event);
	 *
	 * emitter.fire(1);
	 * emitter.fire(2);
	 * emitter.fire(3);
	 * // nothing...
	 *
	 * const listener = bufferedEvent(num => console.log(num));
	 * // 1, 2, 3
	 *
	 * emitter.fire(4);
	 * // 4
	 * ```
	 */
    export function buffer<T>(event: Event<T>, nextTick = false, _buffer: T[] = []): Event<T> {
        let buffer: T[] | null = _buffer.slice();

        let listener: IDisposable | null = event(e => {
            if (buffer) {
                buffer.push(e);
            } else {
                emitter.fire(e);
            }
        });

        const flush = () => {
            if (buffer) {
                buffer.forEach(e => emitter.fire(e));
            }
            buffer = null;
        };

        const emitter = new Emitter<T>({
            onFirstListenerAdd() {
                if (!listener) {
                    listener = event(e => emitter.fire(e));
                }
            },

            onFirstListenerDidAdd() {
                if (buffer) {
                    if (nextTick) {
                        setTimeout(flush);
                    } else {
                        flush();
                    }
                }
            },

            onLastListenerRemove() {
                if (listener) {
                    listener.dispose();
                }
                listener = null;
            }
        });

        return emitter.event;
    }

	/**
	 * Similar to `buffer` but it buffers indefinitely and repeats
	 * the buffered events to every new listener.
	 */
    export function echo<T>(event: Event<T>, nextTick = false, buffer: T[] = []): Event<T> {
        buffer = buffer.slice();

        event(e => {
            buffer.push(e);
            emitter.fire(e);
        });

        const flush = (listener: (e: T) => any, thisArgs?: any) => buffer.forEach(e => listener.call(thisArgs, e));

        const emitter = new Emitter<T>({
            onListenerDidAdd(emitter: any, listener: (e: T) => any, thisArgs?: any) {
                if (nextTick) {
                    setTimeout(() => flush(listener, thisArgs));
                } else {
                    flush(listener, thisArgs);
                }
            }
        });

        return emitter.event;
    }

    export interface IChainableEvent<T> {
        event: Event<T>;
        map<O>(fn: (i: T) => O): IChainableEvent<O>;
        forEach(fn: (i: T) => void): IChainableEvent<T>;
        filter(fn: (e: T) => boolean): IChainableEvent<T>;
        reduce<R>(merge: (last: R | undefined, event: T) => R, initial?: R): IChainableEvent<R>;
        latch(): IChainableEvent<T>;
        on(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
        once(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
    }

    class ChainableEvent<T> implements IChainableEvent<T> {

        get event(): Event<T> { return this._event; }

        constructor(private _event: Event<T>) { }

        map<O>(fn: (i: T) => O): IChainableEvent<O> {
            return new ChainableEvent(map(this._event, fn));
        }

        forEach(fn: (i: T) => void): IChainableEvent<T> {
            return new ChainableEvent(forEach(this._event, fn));
        }

        filter(fn: (e: T) => boolean): IChainableEvent<T> {
            return new ChainableEvent(filter(this._event, fn));
        }

        reduce<R>(merge: (last: R | undefined, event: T) => R, initial?: R): IChainableEvent<R> {
            return new ChainableEvent(reduce(this._event, merge, initial));
        }

        latch(): IChainableEvent<T> {
            return new ChainableEvent(latch(this._event));
        }

        on(listener: (e: T) => any, thisArgs: any, disposables: IDisposable[]) {
            return this._event(listener, thisArgs, disposables);
        }

        once(listener: (e: T) => any, thisArgs: any, disposables: IDisposable[]) {
            return once(this._event)(listener, thisArgs, disposables);
        }
    }

    export function chain<T>(event: Event<T>): IChainableEvent<T> {
        return new ChainableEvent(event);
    }

    export interface NodeEventEmitter {
        on(event: string | symbol, listener: Function): this;
        removeListener(event: string | symbol, listener: Function): this;
    }

    export function fromNodeEventEmitter<T>(emitter: NodeEventEmitter, eventName: string, map: (...args: any[]) => T = id => id): Event<T> {
        const fn = (...args: any[]) => result.fire(map(...args));
        const onFirstListenerAdd = () => emitter.on(eventName, fn);
        const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
        const result = new Emitter<T>({ onFirstListenerAdd, onLastListenerRemove });

        return result.event;
    }

    export function fromPromise<T = any>(promise: Promise<T>): Event<undefined> {
        const emitter = new Emitter<undefined>();
        let shouldEmit = false;

        promise
            .then(undefined, () => null)
            .then(() => {
                if (!shouldEmit) {
                    setTimeout(() => emitter.fire(undefined), 0);
                } else {
                    emitter.fire(undefined);
                }
            });

        shouldEmit = true;
        return emitter.event;
    }

    export function toPromise<T>(event: Event<T>): Promise<T> {
        return new Promise(c => once(event)(c));
    }
}

type Listener<T> = [(e: T) => void, any] | ((e: T) => void);

export interface EmitterOptions {
    onFirstListenerAdd?: Function;
    onFirstListenerDidAdd?: Function;
    onListenerDidAdd?: Function;
    onLastListenerRemove?: Function;
    leakWarningThreshold?: number;
}

let _globalLeakWarningThreshold = -1;
export function setGlobalLeakWarningThreshold(n: number): IDisposable {
    let oldValue = _globalLeakWarningThreshold;
    _globalLeakWarningThreshold = n;
    return {
        dispose() {
            _globalLeakWarningThreshold = oldValue;
        }
    };
}

class LeakageMonitor {

    private _stacks: Map<string, number> | undefined;
    private _warnCountdown: number = 0;

    constructor(
        readonly customThreshold?: number,
        readonly name: string = Math.random().toString(18).slice(2, 5),
    ) { }

    dispose(): void {
        if (this._stacks) {
            this._stacks.clear();
        }
    }

    check(listenerCount: number): undefined | (() => void) {

        let threshold = _globalLeakWarningThreshold;
        if (typeof this.customThreshold === 'number') {
            threshold = this.customThreshold;
        }

        if (threshold <= 0 || listenerCount < threshold) {
            return undefined;
        }

        if (!this._stacks) {
            this._stacks = new Map();
        }
        let stack = new Error().stack!.split('\n').slice(3).join('\n');
        let count = (this._stacks.get(stack) || 0);
        this._stacks.set(stack, count + 1);
        this._warnCountdown -= 1;

        if (this._warnCountdown <= 0) {
            // only warn on first exceed and then every time the limit
            // is exceeded by 50% again
            this._warnCountdown = threshold * 0.5;

            // find most frequent listener and print warning
            let topStack: string;
            let topCount: number = 0;
            this._stacks.forEach((count, stack) => {
                if (!topStack || topCount < count) {
                    topStack = stack;
                    topCount = count;
                }
            });

            console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
            console.warn(topStack!);
        }

        return () => {
            let count = (this._stacks!.get(stack) || 0);
            this._stacks!.set(stack, count - 1);
        };
    }
}

/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
	class Document {

		private _onDidChange = new Emitter<(value:string)=>any>();

		public onDidChange = this._onDidChange.event;

		// getter-style
		// get onDidChange(): Event<(value:string)=>any> {
		// 	return this._onDidChange.event;
		// }

		private _doIt() {
			//...
			this._onDidChange.fire(value);
		}
	}
 */
export class Emitter<T> {

    private static readonly _noop = function () { };

    private readonly _options?: EmitterOptions;
    private readonly _leakageMon?: LeakageMonitor;
    private _disposed: boolean = false;
    private _event?: Event<T>;
    private _deliveryQueue?: [Listener<T>, T][];
    protected _listeners?: LinkedList<Listener<T>>;

    constructor(options?: EmitterOptions) {
        this._options = options;
        this._leakageMon = _globalLeakWarningThreshold > 0
            ? new LeakageMonitor(this._options && this._options.leakWarningThreshold)
            : undefined;
    }

	/**
	 * For the public to allow to subscribe
	 * to events from this Emitter
	 */
    get event(): Event<T> {
        if (!this._event) {
            this._event = (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]) => {
                if (!this._listeners) {
                    this._listeners = new LinkedList();
                }

                const firstListener = this._listeners.isEmpty();

                if (firstListener && this._options && this._options.onFirstListenerAdd) {
                    this._options.onFirstListenerAdd(this);
                }

                const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);

                if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
                    this._options.onFirstListenerDidAdd(this);
                }

                if (this._options && this._options.onListenerDidAdd) {
                    this._options.onListenerDidAdd(this, listener, thisArgs);
                }

                // check and record this emitter for potential leakage
                let removeMonitor: (() => void) | undefined;
                if (this._leakageMon) {
                    removeMonitor = this._leakageMon.check(this._listeners.size);
                }

                let result: IDisposable;
                result = {
                    dispose: () => {
                        if (removeMonitor) {
                            removeMonitor();
                        }
                        result.dispose = Emitter._noop;
                        if (!this._disposed) {
                            remove();
                            if (this._options && this._options.onLastListenerRemove) {
                                const hasListeners = (this._listeners && !this._listeners.isEmpty());
                                if (!hasListeners) {
                                    this._options.onLastListenerRemove(this);
                                }
                            }
                        }
                    }
                };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }

                return result;
            };
        }
        return this._event;
    }

	/**
	 * To be kept private to fire an event to
	 * subscribers
	 */
    fire(event: T): void {
        if (this._listeners) {
            // put all [listener,event]-pairs into delivery queue
            // then emit all event. an inner/nested event might be
            // the driver of this

            if (!this._deliveryQueue) {
                this._deliveryQueue = [];
            }

            for (let iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
                this._deliveryQueue.push([e.value, event]);
            }

            while (this._deliveryQueue.length > 0) {
                const [listener, event] = this._deliveryQueue.shift()!;
                try {
                    if (typeof listener === 'function') {
                        listener.call(undefined, event);
                    } else {
                        listener[0].call(listener[1], event);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    dispose() {
        if (this._listeners) {
            this._listeners = undefined;
        }
        if (this._deliveryQueue) {
            this._deliveryQueue.length = 0;
        }
        if (this._leakageMon) {
            this._leakageMon.dispose();
        }
        this._disposed = true;
    }
}

export interface IWaitUntil {
    waitUntil(thenable: Promise<any>): void;
}

export class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {

    private _asyncDeliveryQueue?: [Listener<T>, T, Promise<any>[]][];

    async fireAsync(eventFn: (thenables: Promise<any>[], listener: Function) => T): Promise<void> {
        if (!this._listeners) {
            return;
        }

        // put all [listener,event]-pairs into delivery queue
        // then emit all event. an inner/nested event might be
        // the driver of this
        if (!this._asyncDeliveryQueue) {
            this._asyncDeliveryQueue = [];
        }

        for (let iter = this._listeners.iterator(), e = iter.next(); !e.done; e = iter.next()) {
            let thenables: Promise<void>[] = [];
            this._asyncDeliveryQueue.push([e.value, eventFn(thenables, typeof e.value === 'function' ? e.value : e.value[0]), thenables]);
        }

        while (this._asyncDeliveryQueue.length > 0) {
            const [listener, event, thenables] = this._asyncDeliveryQueue.shift()!;
            try {
                if (typeof listener === 'function') {
                    listener.call(undefined, event);
                } else {
                    listener[0].call(listener[1], event);
                }
            } catch (e) {
                console.error(e);
                continue;
            }

            // freeze thenables-collection to enforce sync-calls to
            // wait until and then wait for all thenables to resolve
            Object.freeze(thenables);
            await Promise.all(thenables);
        }
    }
}

/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
export class EventBufferer {

    private buffers: Function[][] = [];

    wrapEvent<T>(event: Event<T>): Event<T> {
        return (listener, thisArgs?, disposables?) => {
            return event(i => {
                const buffer = this.buffers[this.buffers.length - 1];

                if (buffer) {
                    buffer.push(() => listener.call(thisArgs, i));
                } else {
                    listener.call(thisArgs, i);
                }
            }, undefined, disposables);
        };
    }

    bufferEvents<R = void>(fn: () => R): R {
        const buffer: Array<() => R> = [];
        this.buffers.push(buffer);
        const r = fn();
        this.buffers.pop();
        buffer.forEach(flush => flush());
        return r;
    }
}

/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
export class Relay<T> implements IDisposable {

    private listening = false;
    private inputEvent: Event<T> = Event.None;
    private inputEventListener: IDisposable = Disposable.None;

    private emitter = new Emitter<T>({
        onFirstListenerDidAdd: () => {
            this.listening = true;
            this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
        },
        onLastListenerRemove: () => {
            this.listening = false;
            this.inputEventListener.dispose();
        }
    });

    readonly event: Event<T> = this.emitter.event;

    set input(event: Event<T>) {
        this.inputEvent = event;

        if (this.listening) {
            this.inputEventListener.dispose();
            this.inputEventListener = event(this.emitter.fire, this.emitter);
        }
    }

    dispose() {
        this.inputEventListener.dispose();
        this.emitter.dispose();
    }
}
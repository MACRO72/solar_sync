import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// This is a typed event emitter.
class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<TEventName extends keyof TEvents>(
    eventName: TEventName,
    ...eventArg: Parameters<TEvents[TEventName]>
  ) {
    this.emitter.emit(eventName as string, ...eventArg);
  }

  on<TEventName extends keyof TEvents>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ) {
    this.emitter.on(eventName as string, handler as any);
  }

  off<TEventName extends keyof TEvents>(
    eventName: TEventName,
    handler: TEvents[TEventName]
  ) {
    this.emitter.off(eventName as string, handler as any);
  }
}

// It's a singleton, so we can listen to it from anywhere in the app.
export const errorEmitter = new TypedEventEmitter<AppEvents>();

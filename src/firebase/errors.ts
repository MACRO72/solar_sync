// This defines the context for a security rule violation.
// It's used to provide detailed information for debugging.
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

// A custom error class for Firestore permission errors.
// This is used in development to provide rich, contextual errors
// to the Next.js dev overlay, making it easier to debug security rules.
export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions. The following request was denied by Firestore Security Rules:`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is necessary for the custom error to work correctly with instanceof
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  // Returns a plain object representation of the error context,
  // suitable for logging or displaying in the UI.
  public toContextObject() {
    return {
      message: this.message,
      context: this.context,
    };
  }
}

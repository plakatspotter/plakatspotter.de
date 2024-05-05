/**
 * A JSX Component that does not have children
 */
export type View<T> = (this: void, props: T) => JSX.Element;

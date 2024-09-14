import { ReactNode } from "react";

export type ExpandType<T> = {
  [K in keyof T]: T[K];
};

export interface PageParams<P extends object> {
  params: P;
}

export interface PageSearchParams<S extends object> {
  searchParams: S;
}

export type Page<
  P extends object,
  S extends object = Record<string, never>,
> = ExpandType<PageParams<P> & PageSearchParams<S>>;

export type Layout<P extends string = never> = ExpandType<
  { [K in P]: K extends string ? ReactNode : never } & {
    children: ReactNode;
  }
>;

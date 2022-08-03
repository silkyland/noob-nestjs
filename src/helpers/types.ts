export type Filter = {
  where?: { [key: string]: any };
  skip?: number;
  take?: number;
  [key: string]: any;
};

export type IdOrEmail = {
  id?: string;
  email?: string;
};

export type UserFilter = RequireAtLeastOne<IdOrEmail, 'id' | 'email'>;

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

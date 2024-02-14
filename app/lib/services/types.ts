export interface Customer {
  name: string;
  avatar: string;
}

export interface AccountSaving {
  customerName: string;
  currentBalance: number;
  lifetimeBalance: number;
  mutations: Array<Mutation>;
}

export interface Mutation {
  type: "deposit" | "withdraw";
  amount: number;
  mutationDate: number;
}

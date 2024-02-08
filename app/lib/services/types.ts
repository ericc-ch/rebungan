export interface AccountSaving {
  customerName: string;
  currentBalance: number;
  lifetimeBalance: number;
  mutations: Array<Mutation>;
}

export interface AccountCredit {
  customerName: string;
  amountPerDay: number;
  balance: number;
  startDate: Date;
  mutations: Array<Mutation>;
}

export interface Mutation {
  type: "deposit" | "withdraw";
  amount: number;
  date: Date;
}

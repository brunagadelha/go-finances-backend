import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const repository = getRepository(Transaction);

    const transactions = await repository.find();

    const incomeTotal = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((accumulator, transaction) => accumulator + transaction.value, 0);

    const outcomeTotal = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((accumulator, transaction) => accumulator + transaction.value, 0);

    const total = incomeTotal - outcomeTotal;

    return {
      income: incomeTotal,
      outcome: outcomeTotal,
      total,
    };
  }
}

export default TransactionsRepository;

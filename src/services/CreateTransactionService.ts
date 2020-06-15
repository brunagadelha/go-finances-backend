import { getCustomRepository, getRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_name: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_name,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid balance type');
    }

    const transactionsRepository = getCustomRepository(TransactionRepository);
    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Invalid balance');
    }

    const categoriesRepository = getRepository(Category);

    let category = await categoriesRepository.findOne({
      where: {
        title: category_name,
      },
    });

    if (!category) {
      category = categoriesRepository.create({
        title: category_name,
      });

      await categoriesRepository.save(category);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

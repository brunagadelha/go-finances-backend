import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import uploadConfig from '../config/upload';

interface Request {
  fileName: string;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_name: string;
}

class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, fileName);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const importedTransactions: TransactionDTO[] = [];

    parseCSV.on('data', line => {
      const transaction = {
        title: line[0],
        type: line[1],
        value: line[2],
        category_name: line[3],
      };

      importedTransactions.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransaction = new CreateTransactionService();

    const imports: Transaction[] = [];
    for (const item of importedTransactions) {
      const transaction = await createTransaction.execute({
        title: item.title,
        category_name: item.category_name,
        value: item.value,
        type: item.type,
      });

      imports.push(transaction);
    }

    // Exclui o arquivo .csv
    await fs.promises.unlink(csvFilePath);

    return imports;
  }
}

export default ImportTransactionsService;

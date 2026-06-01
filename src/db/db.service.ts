import { Inject, Injectable } from '@nestjs/common';
import type { DbModuleOptions } from './db.module';
import { access, readFile, writeFile } from 'fs/promises';

@Injectable()
export class DbService {
  @Inject('OPTIONS')
  private options: DbModuleOptions;

  async write(obj: Record<string, any>) {
    await writeFile(this.options.path, JSON.stringify(obj || []), {
      encoding: 'utf8',
    });
  }

  async read() {
    try {
      const filePath = this.options.path;
      await access(filePath);
      const data = await readFile(filePath, { encoding: 'utf8' });

      if (!data.trim()) return [];

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Nếu file chưa tồn tại, trả về mảng rỗng luôn
      return [];
    }
  }
}

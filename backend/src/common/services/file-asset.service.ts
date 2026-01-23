import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileAsset } from '../entities/file-asset.entity';
import { createHash } from 'crypto';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { writeFile, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  id: number;
  sha256: string;
  storagePath: string;
  originalName: string;
  size: number;
  mime: string;
  isExisting: boolean; // 是否为已存在的文件（复用）
}

/**
 * 文件资产服务
 * 提供基于 SHA256 的文件去重存储
 */
@Injectable()
export class FileAssetService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(FileAsset)
    private readonly fileAssetRepo: Repository<FileAsset>,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || '../project/uploads';
    // 确保上传目录存在
    const generalDir = join(this.uploadDir, 'general');
    if (!existsSync(generalDir)) {
      mkdirSync(generalDir, { recursive: true });
    }
  }

  /**
   * 计算文件的 SHA256 哈希值
   */
  async calculateSha256(buffer: Buffer): Promise<string> {
    const hash = createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  }

  /**
   * 计算文件流的 SHA256 哈希值（大文件友好）
   */
  async calculateSha256FromStream(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * 上传文件（带去重）
   */
  async upload(
    file: Express.Multer.File,
    subDir: string = 'general',
  ): Promise<UploadResult> {
    // 计算文件哈希
    const sha256 = await this.calculateSha256(file.buffer);

    // 检查是否已存在
    const existing = await this.fileAssetRepo.findOne({
      where: { sha256 },
    });

    if (existing) {
      // 文件已存在，复用
      return {
        id: existing.id,
        sha256: existing.sha256,
        storagePath: existing.storagePath,
        originalName: existing.originalName,
        size: existing.size,
        mime: existing.mime,
        isExisting: true,
      };
    }

    // 保存新文件
    const ext = extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const relativePath = `${subDir}/${fileName}`;
    const fullPath = join(this.uploadDir, relativePath);

    // 确保子目录存在
    const targetDir = join(this.uploadDir, subDir);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // 写入文件
    await writeFile(fullPath, file.buffer);

    // 创建文件资产记录
    const fileAsset = this.fileAssetRepo.create({
      sha256,
      originalName: file.originalname,
      size: file.size,
      mime: file.mimetype,
      storagePath: `/uploads/${relativePath}`,
    });

    const saved = await this.fileAssetRepo.save(fileAsset);

    return {
      id: saved.id,
      sha256: saved.sha256,
      storagePath: saved.storagePath,
      originalName: saved.originalName,
      size: saved.size,
      mime: saved.mime,
      isExisting: false,
    };
  }

  /**
   * 根据 ID 获取文件信息
   */
  async findById(id: number): Promise<FileAsset> {
    const fileAsset = await this.fileAssetRepo.findOne({ where: { id } });
    if (!fileAsset) {
      throw new NotFoundException(`文件 ID ${id} 不存在`);
    }
    return fileAsset;
  }

  /**
   * 根据 SHA256 获取文件信息
   */
  async findBySha256(sha256: string): Promise<FileAsset | null> {
    return this.fileAssetRepo.findOne({ where: { sha256 } });
  }

  /**
   * 检查文件是否存在
   */
  async exists(sha256: string): Promise<boolean> {
    const count = await this.fileAssetRepo.count({ where: { sha256 } });
    return count > 0;
  }

  /**
   * 删除未被引用的文件（清理孤儿文件）
   * 注意：需要在业务层判断文件是否被引用
   */
  async deleteById(id: number): Promise<void> {
    const fileAsset = await this.findById(id);
    
    // 删除物理文件
    const fullPath = join(this.uploadDir, fileAsset.storagePath.replace('/uploads/', ''));
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    // 删除记录
    await this.fileAssetRepo.delete(id);
  }

  /**
   * 获取文件的完整物理路径
   */
  getFullPath(storagePath: string): string {
    return join(this.uploadDir, storagePath.replace('/uploads/', ''));
  }
}

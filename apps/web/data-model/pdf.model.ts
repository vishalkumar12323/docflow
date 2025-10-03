interface PDFFile {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  filePath: string;
  thumbnailPath?: string | null;
  pageCount: number;
  mimeType: string;
  isPublic: boolean;
  shareToken?: string | null;
  version: number;
  parentFileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

class PDFFileEntity implements PDFFile {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  filePath: string;
  thumbnailPath?: string | null;
  pageCount: number;
  mimeType: string;
  isPublic: boolean;
  shareToken?: string | null;
  version: number;
  parentFileId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  constructor(data: PDFFile) {
    Object.assign(this, data);
  }

  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  canBeAccessedBy(userId: string): boolean {
    return this.userId === userId || this.isPublic;
  }

  generateShareUrl(baseUrl: string): string {
    if (this.shareToken) {
      return `${baseUrl}/share/${this.shareToken}`;
    }
    throw new Error("No share token available");
  }
}

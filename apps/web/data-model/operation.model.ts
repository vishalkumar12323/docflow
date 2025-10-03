interface PDFOperation {
  id: string;
  userId: string;
  operationType: "upload" | "edit" | "split" | "merge";
  sourceFileIds: string[];
  resultFileId?: string | null;
  operationDetails?: Record<string, any>;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

class PDFOperationEntity implements PDFOperation {
  id: string;
  userId: string;
  operationType: "upload" | "edit" | "split" | "merge";
  sourceFileIds: string[];
  resultFileId?: string | null;
  operationDetails?: Record<string, any>;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string | null;
  createdAt: Date;
  completedAt?: Date | null;

  constructor(data: PDFOperation) {
    Object.assign(this, data);
  }

  isCompleted(): boolean {
    return this.status === "completed";
  }

  isFailed(): boolean {
    return this.status === "failed";
  }

  markAsProcessing(): void {
    this.status = "processing";
  }

  markAsCompleted(resultFileId: string): void {
    this.status = "completed";
    this.resultFileId = resultFileId;
    this.completedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.status = "failed";
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
  }
}

interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date | null;
  replacedByToken?: string | null;
}

class RefreshTokenEntity implements RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt?: Date | null;
  replacedByToken?: string | null;

  constructor(data: RefreshToken) {
    Object.assign(this, data);
  }

  isValid(): boolean {
    return !this.revokedAt && new Date() < this.expiresAt;
  }

  revoke(replacedBy?: string): void {
    this.revokedAt = new Date();
    this.replacedByToken = replacedBy;
  }
}

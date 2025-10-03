interface User {
  id: string;
  email: string;
  passwordHash?: string | null;
  fullName: string;
  authProvider: "email" | "google";
  googleId?: string | null;
  profilePictureUrl?: string | null;
  role: "user" | "admin";
  isVerified: boolean;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
}

class UserEntity implements User {
  id: string;
  email: string;
  passwordHash?: string | null;
  fullName: string;
  authProvider: "email" | "google";
  googleId?: string | null;
  profilePictureUrl?: string | null;
  role: "user" | "admin";
  isVerified: boolean;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;

  constructor(data: User) {
    Object.assign(this, data);
  }

  hasStorageSpace(requiredSize: number): boolean {
    return this.storageUsed + requiredSize <= this.storageLimit;
  }

  canUpload(fileSize: number): boolean {
    return this.isVerified && this.hasStorageSpace(fileSize);
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }
}

interface User {
  id: string;
  email: string;
  password_hash?: string | null;
  full_name: string;
  auth_provider: "email" | "google";
  google_id?: string | null;
  profile_picture_url?: string | null;
  role: "user" | "admin";
  is_verified: boolean;
  storage_used: number;
  storage_limit: number;
  created_at: Date;
  updated_at: Date;
  last_login?: Date | null;
}

export class UserEntity implements User {
  id: string;
  email: string;
  password_hash?: string | null;
  full_name: string;
  auth_provider: "email" | "google";
  google_id?: string | null;
  profile_picture_url?: string | null;
  role: "user" | "admin";
  is_verified: boolean;
  storage_used: number;
  storage_limit: number;
  created_at: Date;
  updated_at: Date;
  last_login?: Date | null;

  constructor(data: User) {
    Object.assign(this, data);
  }

  hasStorageSpace(requiredSize: number): boolean {
    return this.storage_used + requiredSize <= this.storage_limit;
  }

  canUpload(fileSize: number): boolean {
    return this.is_verified && this.hasStorageSpace(fileSize);
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }
}

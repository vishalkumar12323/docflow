import { UserRepository } from "@/repositories/user.repository";
import bcrypt from "bcryptjs";

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async register(data: {
    full_name: string;
    email: string;
    password: string;
    google_id: string;
    profile_picture_url: string;
    auth_provider: string;
  }) {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await this.userRepo.create({
      email: data.email,
      full_name: data.full_name,
      password_hash: hashedPassword,
      auth_provider: "email",
      role: "user",
      google_id: data.google_id,
      profile_picture_url: data.profile_picture_url,
    });

    return user;
  }

  async login(data: { email: string; password: string }) {
    return await this.userRepo.findByEmail(data.email);
  }

  async loginWithGoogle() {}

  async userById(id: string) {
    return await this.userRepo.findById(id);
  }
  async userByEmail(email: string) {
    return await this.userRepo.findByEmail(email);
  }

  async updateLoginTimeStamp(id: string) {
    return await this.userRepo.updateLastLogin(id);
  }
}

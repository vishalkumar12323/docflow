import { Pool } from "pg";
import { UserEntity } from "@/data-model/user.model";

export class UserRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const query = `
      INSERT INTO users (
        email, password_hash, full_name, auth_provider, 
        google_id, profile_picture_url, role, is_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.email,
      data.password_hash,
      data.full_name,
      data.auth_provider,
      data.google_id,
      data.profile_picture_url,
      data.role || "user",
      data.is_verified || false,
    ];

    const result = await this.pool.query(query, values);
    return new UserEntity(result.rows[0]);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) return null;
    return new UserEntity(result.rows[0]);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await this.pool.query(query, [email]);

    if (result.rows.length === 0) return null;
    return new UserEntity(result.rows[0]);
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const query = "SELECT * FROM users WHERE google_id = $1";
    const result = await this.pool.query(query, [googleId]);

    if (result.rows.length === 0) return null;
    return new UserEntity(result.rows[0]);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const fields = Object.keys(data)
      .map((key, index) => `${this.toSnakeCase(key)} = ${index + 2}`)
      .join(", ");

    const query = `
      UPDATE users 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...Object.values(data)];
    const result = await this.pool.query(query, values);

    return new UserEntity(result.rows[0]);
  }

  async updateLastLogin(id: string): Promise<void> {
    const query =
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1";
    await this.pool.query(query, [id]);
  }

  async updateStorageUsed(id: string, additionalSize: number): Promise<void> {
    const query = `
      UPDATE users 
      SET storage_used = storage_used + $2 
      WHERE id = $1
    `;
    await this.pool.query(query, [id, additionalSize]);
  }

  async delete(id: string): Promise<void> {
    const query = `DELETE FROM users WHERE id = $1;`;
    await this.pool.query(query, [id]);
  }
}

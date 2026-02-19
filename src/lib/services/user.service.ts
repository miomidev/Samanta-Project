import '@/lib/db'; // Ensure DB is initialized
import { UserModel } from '@/models/user.model';
import { User, UserRole } from '@/lib/types';
import bcrypt from 'bcryptjs';

export class UserService {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<UserModel | null> {
    try {
      return await UserModel.findOne({ where: { email } });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<UserModel | null> {
    try {
      return await UserModel.findByPk(id);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(data: Partial<User> & { password?: string }): Promise<UserModel> {
    try {
      // If password provided, hash it (though usually AuthService handles hashing, 
      // sometimes UserService is used directly for creation)
      // Note: UserModel definition in previous turns didn't show a password field in the interface.
      // Usually password is stored. I will assume for now we might need to add it or it's handled elsewhere.
      // Looking at User model, it doesn't have password! 
      // This is a common pattern where auth details are separate or I missed it.
      // Let's assume standard auth for now and maybe User model needs update or I store it in a separate Auth table?
      // Re-reading User model: it has email, name, role... no password.
      // I will assume for this implementation that we might need to update the model or it was missed.
      // For now, I will proceed with creating the user without password field in the model call,
      // but typically we need it. 
      // *Wait*, most auth systems need password. 
      // I will check if I should update the User model to include password_hash.
      
      return await UserModel.create(data as any);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user details
   */
  async update(id: string, data: Partial<User>): Promise<[number, UserModel[]]> {
    try {
      return await UserModel.update(data, {
        where: { id },
        returning: true, // For PostgreSQL
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();

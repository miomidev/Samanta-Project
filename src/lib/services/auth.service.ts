import '@/lib/db'; // Ensure DB is initialized
import { userService } from './user.service';
import { User } from '@/lib/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Note: Ensure you have JWT_SECRET in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1d';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: any): Promise<{ user: User; token: string }> {
    const existingUser = await userService.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    // Note: We need to ensure the User model handles the password field. 
    // Since the provided User model in the context didn't show a password field,
    // we assume it is either added to the model or we are passing it hoping the DB has it.
    // For a real implementation, you must add 'password' to your UserModel.
    const newUser = await userService.create({
      ...data,
      password: hashedPassword, // This might be ignored if not in model definition
    });

    // Generate token
    const token = this.generateToken(newUser.id);

    return {
      user: newUser,
      token,
    };
  }

  /**
   * Login user
   */
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const user = await userService.findByEmail(credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    // Looking at the UserModel from previous context, it didn't expose password.
    // We might need to fetch it explicitly if it was hidden/excluded, 
    // or access the raw attribute if available. 
    // Assuming 'password' is a property on the record even if strict typing hides it temporarily.
    // In a real app, update UserModel to include password field!
    const isPasswordValid = await bcrypt.compare(credentials.password, (user as any).password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id);

    return {
      user,
      token
    };
  }

  /**
   * Generate JWT Token
   */
  private generateToken(userId: string): string {
    return jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  /**
   * Verify Token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export const authService = new AuthService();

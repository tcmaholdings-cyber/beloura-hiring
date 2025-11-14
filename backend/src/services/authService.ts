import { prisma } from '../index';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateTokenPair, TokenPair } from '../utils/jwt';
import type { User, OwnerRole } from '@prisma/client';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: OwnerRole;
}

export interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: TokenPair;
}

/**
 * Register a new user
 */
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { email, password, name, role } = input;

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
    },
  });

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    tokens,
  };
};

/**
 * Login user
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, username, password } = input;

  // Require either email or username
  if (!email && !username) {
    throw new Error('Email or username is required');
  }

  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : {},
        username ? { username } : {},
      ].filter(obj => Object.keys(obj).length > 0),
    },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Remove password hash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    tokens,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<Omit<User, 'passwordHash'> | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

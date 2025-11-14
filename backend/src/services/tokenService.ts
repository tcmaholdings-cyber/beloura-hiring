import { verifyRefreshToken, generateTokenPair, TokenPair, JwtPayload } from '../utils/jwt';
import { getUserById } from './authService';

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenPair> => {
  try {
    // Verify refresh token
    const payload: JwtPayload = verifyRefreshToken(refreshToken);

    // Get user to ensure they still exist
    const user = await getUserById(payload.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return tokens;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
    throw new Error('Token refresh failed');
  }
};

import type { Request, Response, NextFunction } from 'express';

export type ValidationRule = {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'array';
  arrayItemType?: 'string' | 'uuid'; // Type of items in array
  minItems?: number; // Minimum number of items in array
  maxItems?: number; // Maximum number of items in array
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: any) => string | undefined; // Returns error message if invalid
};

/**
 * Validate request body against rules
 */
export const validateBody = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      // Skip further validation if field is not required and not provided
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rule.type) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push({ field: rule.field, message: `${rule.field} must be a string` });
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push({ field: rule.field, message: `${rule.field} must be a number` });
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push({ field: rule.field, message: `${rule.field} must be a boolean` });
            }
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push({ field: rule.field, message: `${rule.field} must be a valid email` });
            }
            break;
          case 'uuid':
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(value)) {
              errors.push({ field: rule.field, message: `${rule.field} must be a valid UUID` });
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              errors.push({ field: rule.field, message: `${rule.field} must be an array` });
            } else {
              // Validate array length
              if (rule.minItems !== undefined && value.length < rule.minItems) {
                errors.push({
                  field: rule.field,
                  message: `${rule.field} must contain at least ${rule.minItems} items`,
                });
              }
              if (rule.maxItems !== undefined && value.length > rule.maxItems) {
                errors.push({
                  field: rule.field,
                  message: `${rule.field} must contain at most ${rule.maxItems} items`,
                });
              }

              // Validate array item types
              if (rule.arrayItemType) {
                for (let i = 0; i < value.length; i++) {
                  const item = value[i];
                  switch (rule.arrayItemType) {
                    case 'string':
                      if (typeof item !== 'string') {
                        errors.push({
                          field: rule.field,
                          message: `${rule.field}[${i}] must be a string`,
                        });
                      }
                      break;
                    case 'uuid':
                      const itemUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                      if (!itemUuidRegex.test(item)) {
                        errors.push({
                          field: rule.field,
                          message: `${rule.field}[${i}] must be a valid UUID`,
                        });
                      }
                      break;
                  }
                }
              }
            }
            break;
        }
      }

      // String validations
      if (typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at least ${rule.minLength} characters`,
          });
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be at most ${rule.maxLength} characters`,
          });
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push({ field: rule.field, message: `${rule.field} format is invalid` });
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({ field: rule.field, message: `${rule.field} must be at least ${rule.min}` });
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push({ field: rule.field, message: `${rule.field} must be at most ${rule.max}` });
        }
      }

      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be one of: ${rule.enum.join(', ')}`,
        });
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors.push({ field: rule.field, message: customError });
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];

    for (const rule of rules) {
      const value = req.query[rule.field];

      // Check required
      if (rule.required && !value) {
        errors.push({ field: rule.field, message: `${rule.field} is required` });
        continue;
      }

      // Skip if not provided and not required
      if (!value) continue;

      // Convert query params to appropriate types
      let convertedValue: any = value;
      if (rule.type === 'number') {
        convertedValue = Number(value);
        if (isNaN(convertedValue)) {
          errors.push({ field: rule.field, message: `${rule.field} must be a number` });
          continue;
        }
      } else if (rule.type === 'boolean') {
        convertedValue = value === 'true';
      }

      // Apply same validation logic as body
      if (rule.enum && !rule.enum.includes(convertedValue)) {
        errors.push({
          field: rule.field,
          message: `${rule.field} must be one of: ${rule.enum.join(', ')}`,
        });
      }

      if (rule.custom) {
        const customError = rule.custom(convertedValue);
        if (customError) {
          errors.push({ field: rule.field, message: customError });
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
};

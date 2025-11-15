import express from 'express';
import { uploadExcel } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import {
  previewImport,
  executeImport,
  downloadTemplate,
} from '../controllers/importController';

const router = express.Router();

/**
 * @route GET /api/v1/import/template
 * @desc Download Excel template for candidate import
 * @access Private (requires authentication)
 */
router.get('/template', authenticate, downloadTemplate);

/**
 * @route POST /api/v1/import/preview
 * @desc Preview Excel file contents without importing
 * @access Private (requires authentication and permission)
 */
router.post(
  '/preview',
  authenticate,
  checkPermission('candidates', 'create'),
  uploadExcel.single('file'),
  previewImport
);

/**
 * @route POST /api/v1/import/execute
 * @desc Import candidates from Excel file
 * @access Private (requires authentication and permission)
 */
router.post(
  '/execute',
  authenticate,
  checkPermission('candidates', 'create'),
  uploadExcel.single('file'),
  executeImport
);

export default router;

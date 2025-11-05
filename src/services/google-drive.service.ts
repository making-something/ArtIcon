import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

interface DriveUploadResult {
  fileId: string;
  webViewLink: string;
  webContentLink: string;
  previewUrl: string;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: string;
}

export class GoogleDriveService {
  private drive: any;
  private auth: GoogleAuth;

  constructor() {
    // Initialize Google Auth with service account
    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Get folder ID from environment or create folder structure
   */
  private async getOrCreateFolder(folderName: string, parentFolderId?: string): Promise<string> {
    try {
      // First, try to find existing folder
      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`;
      if (parentFolderId) {
        query += ` and '${parentFolderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new folder if not found
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      // Make folder accessible to anyone with link
      await this.drive.permissions.create({
        fileId: folder.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return folder.data.id;
    } catch (error) {
      console.error('Error getting/creating folder:', error);
      throw error;
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File): FileValidationResult {
    const allowedTypes = {
      video: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
        'video/webm',
      ],
      image: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ],
      graphics: [
        'application/pdf',
        'application/illustrator',
        'application/x-photoshop',
        'image/svg+xml',
        'image/jpeg',
        'image/png',
      ],
    };

    const maxSize = 100 * 1024 * 1024; // 100MB

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 100MB limit',
      };
    }

    // Determine file category
    let fileType = 'other';
    if (allowedTypes.video.includes(file.mimetype)) {
      fileType = 'video';
    } else if (allowedTypes.image.includes(file.mimetype)) {
      fileType = 'image';
    } else if (allowedTypes.graphics.includes(file.mimetype)) {
      fileType = 'graphics';
    }

    // Check if file type is allowed
    const allAllowedTypes = [...allowedTypes.video, ...allowedTypes.image, ...allowedTypes.graphics];
    if (!allAllowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'File type not supported. Allowed: Images (JPEG, PNG, GIF, WebP, SVG), Videos (MP4, MOV, AVI, MKV, WebM), Graphics (PDF, AI, PSD, SVG)',
      };
    }

    return {
      isValid: true,
      fileType,
    };
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    file: Express.Multer.File,
    participantName: string,
    category: string,
    taskTitle: string
  ): Promise<DriveUploadResult> {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create folder structure: Hackathon/Category/ParticipantName/TaskTitle
      const hackathonFolderId = await this.getOrCreateFolder('Articon Hackathon 2024');
      const categoryFolderId = await this.getOrCreateFolder(category, hackathonFolderId);
      const participantFolderId = await this.getOrCreateFolder(
        participantName.replace(/[^a-zA-Z0-9]/g, '_'),
        categoryFolderId
      );
      const taskFolderId = await this.getOrCreateFolder(
        taskTitle.replace(/[^a-zA-Z0-9]/g, '_'),
        participantFolderId
      );

      // Prepare file metadata
      const fileMetadata = {
        name: file.originalname,
        parents: [taskFolderId],
      };

      // Create media object
      const media = {
        mimeType: file.mimetype,
        body: require('fs').createReadStream(file.path),
      };

      // Upload file
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
      });

      const uploadedFile = response.data;

      // Make file accessible to anyone with link
      await this.drive.permissions.create({
        fileId: uploadedFile.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Generate preview URL
      const previewUrl = this.generatePreviewUrl(uploadedFile.id, file.mimetype);

      // Clean up temporary file
      require('fs').unlinkSync(file.path);

      return {
        fileId: uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
        webContentLink: uploadedFile.webContentLink,
        previewUrl,
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);

      // Clean up temporary file if it exists
      try {
        require('fs').unlinkSync(file.path);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      throw error;
    }
  }

  /**
   * Generate preview URL based on file type
   */
  private generatePreviewUrl(fileId: string, mimeType: string): string {
    const baseUrl = `https://drive.google.com/file/d/${fileId}`;

    if (mimeType.startsWith('video/')) {
      return `${baseUrl}/preview`;
    } else if (mimeType.startsWith('image/')) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    } else if (mimeType === 'application/pdf') {
      return `${baseUrl}/preview`;
    } else {
      // For other file types, use the Google Docs viewer
      return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(baseUrl)}`;
    }
  }

  /**
   * Get file info from Google Drive URL
   */
  extractFileIdFromUrl(driveUrl: string): string | null {
    // Handle different Google Drive URL formats
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = driveUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Validate Google Drive URL and generate preview
   */
  async validateAndGeneratePreview(driveUrl: string): Promise<{
    isValid: boolean;
    previewUrl?: string;
    error?: string;
  }> {
    try {
      const fileId = this.extractFileIdFromUrl(driveUrl);

      if (!fileId) {
        return {
          isValid: false,
          error: 'Invalid Google Drive URL format',
        };
      }

      // Get file metadata to verify it exists and is accessible
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, webViewLink, webContentLink',
      });

      const file = response.data;

      // Generate preview URL based on file type
      const previewUrl = this.generatePreviewUrl(fileId, file.mimeType);

      return {
        isValid: true,
        previewUrl,
      };
    } catch (error) {
      console.error('Error validating Google Drive URL:', error);
      return {
        isValid: false,
        error: 'File not found or not accessible. Please ensure the Google Drive link is public.',
      };
    }
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_PROJECT_ID
    );
  }
}

export default new GoogleDriveService();
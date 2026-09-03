// utils/fileUpload.js
import api from "../api/axiosConfig";

// Constants
const UPLOAD_ENDPOINT = "/media/upload";
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

/**
 * Validates if a file is an allowed image type
 * @param {File} file - The file to validate
 * @throws {Error} - If file type is not allowed
 */
const validateImageType = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported file type: ${file.type}. Only image files are allowed.`
    );
  }
};

/**
 * Uploads a file to the smartbin media upload endpoint
 * @param {File} file - The file object to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<{ url: string, message: string, success: boolean }>} - The response containing the file URL
 */
const uploadFile = async (file, onProgress) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  validateImageType(file);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    // Add progress callback if provided
    if (onProgress) {
      config.onUploadProgress = onProgress;
    }

    const response = await api.post(UPLOAD_ENDPOINT, formData, config);

    // Handle the specific response structure from your API
    if (response.data && response.data.success) {
      return {
        url: response.data.data.fileUrl,
        message: response.data.message,
        success: response.data.success,
      };
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("File upload error:", error);
    if (error.response) {
      throw new Error(error.response.data?.message || "File upload failed");
    } else {
      throw new Error(error.message || "File upload failed");
    }
  }
};

/**
 * Uploads multiple files to the smartbin media upload endpoint
 * @param {File[]} files - Array of file objects to upload
 * @returns {Promise<Object[]>} - Array of responses containing file URLs
 */
const uploadMultipleFiles = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("No files provided");
  }

  try {
    const uploadPromises = files.map((file) => uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Multiple file upload error:", error);
    throw new Error("Multiple file upload failed: " + error.message);
  }
};

/**
 * Helper function to convert data URL to File object
 * @param {string} dataUrl - Data URL string
 * @param {string} filename - Desired filename
 * @returns {File} - File object
 */
const dataURLtoFile = (dataUrl, filename) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

/**
 * Helper function to upload a data URL directly
 * @param {string} dataUrl - Data URL string
 * @param {string} filename - Desired filename
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} - The response containing the file URL
 */
const uploadDataURL = async (dataUrl, filename, onProgress) => {
  const file = dataURLtoFile(dataUrl, filename);
  return await uploadFile(file, onProgress);
};

// Single export statement
export { uploadFile, uploadMultipleFiles, dataURLtoFile, uploadDataURL };

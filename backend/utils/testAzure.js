const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const sasUrl = process.env.AZURE_STORAGE_Images_SAS_URL;

if (!sasUrl) {
  throw new Error("Missing AZURE_STORAGE_Images_SAS_URL");
}

const blobServiceClient = new BlobServiceClient(sasUrl);
const containerName = new URL(sasUrl).pathname.split("/")[1];

async function uploadToAzure(file) {
  try {
    if (!file?.buffer) throw new Error("Invalid file object");
    
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.originalname.split('.').pop();
    const blobName = `${timestamp}-${randomString}.${fileExtension}`;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype || "image/jpeg" },
    });

    return blockBlobClient.url;
  } catch (err) {
    console.error("❌ Azure upload failed:", err.message);
    throw err;
  }
}

module.exports = { uploadToAzure };
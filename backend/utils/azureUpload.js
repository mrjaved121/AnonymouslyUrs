// utils/azureUpload.js
const { BlobServiceClient } = require("@azure/storage-blob");

// ✅ Get SAS URL from .env
const sasUrl = process.env.AZURE_STORAGE_Images_SAS_URL;

if (!sasUrl) {
  console.error("❌ Missing AZURE_STORAGE_Images_SAS_URL in environment variables");
  throw new Error("Missing Azure SAS URL");
}

// ✅ Create the BlobServiceClient
const blobServiceClient = new BlobServiceClient(sasUrl);

// ✅ Extract the container name from the SAS URL
const urlParts = new URL(sasUrl);
const pathParts = urlParts.pathname.split("/").filter(Boolean);
const containerName = pathParts[0]; // e.g. "blogphotos"

// ✅ Base URL without SAS query
const baseUrl = `${urlParts.origin}/${containerName}`;

// === Upload Function ===
async function uploadToAzure(fileBuffer, blobName, contentType = "image/jpeg") {
  try {
    // Get the container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get blob client for the specific file
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the file buffer
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const fileUrl = `${baseUrl}/${blobName}${urlParts.search}`;
    console.log("✅ Uploaded to Azure Blob:", fileUrl);
    return fileUrl;
  } catch (err) {
    console.error("❌ Azure upload failed:", err.message);
    throw err;
  }
}

module.exports = { uploadToAzure };

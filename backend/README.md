# Backend setup and Azure connection

This guide explains how to run the backend locally and connect it to Azure services (Cosmos DB for Mongo API and Blob Storage).

## 1) Prerequisites
- Node.js 18+ (LTS recommended)
- An Azure subscription
- Cosmos DB account with Mongo API (vCore or RU)
- Azure Storage account with a container (e.g., `blogphotos`)

## 2) Local environment

1. Copy the sample env and fill in secrets:
```
cp .env.example .env
```
Set:
- `MONGO_URI` to your Cosmos DB Mongo connection string
- `DB_NAME` to your database name (e.g., `anonymouslyurs`)
- `AZURE_STORAGE_Images_SAS_URL` to a SAS URL scoped at the container you upload to
- `JWT_SECRET` to a long random string
- Optional: `EMAIL_*`, `OPENAI_API_KEY`

2. Install and run:
```
npm install
npm start
```
The server runs on `http://localhost:5000`.

## 3) Cosmos DB (Mongo) connection
- Use the connection string from Azure Portal > Cosmos DB > Keys > Connection strings (MongoDB). Prefer SCRAM-SHA-256.
- Example:
```
mongodb+srv://<username>:<password>@<account>.<region>.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false
```
- Ensure your IP is allowed (Networking > Firewall or Private Endpoint). For local dev, enable "Allow access from Azure portal" and add your client IP.

## 4) Azure Blob Storage (SAS)
- Create a container (e.g., `blogphotos`).
- Generate a SAS at the container scope with permissions you need:
  - For uploads: at least `Create`, `Write`, `Add`, `Read`, `List`.
- Copy the full container SAS URL, like:
```
https://<account>.blob.core.windows.net/blogphotos?<sas-query>
```
- Put it in `.env` as `AZURE_STORAGE_Images_SAS_URL`.

The server uses `utils/azureUpload.js` to upload buffers to this container.

## 5) Production configuration
- Do NOT commit `.env`. Use App Service/App Container settings:
  - PORT, MONGO_URI, DB_NAME, JWT_SECRET
  - AZURE_STORAGE_Images_SAS_URL
  - OPENAI_API_KEY (if used)
- Lock down the SAS to HTTPS, minimal permissions, and short expiry. Prefer Managed Identity + RBAC when feasible.

## 6) Health checks
- `GET /api/health` returns overall status and Mongo connection state.
- `GET /api/test` basic ping.

## 7) CORS and client
- CORS allows `http://localhost:3000` by default. The client dev server runs on 3000/3001.
- In dev, client uses a proxy to `/api` so you don’t need to hardcode the backend URL.

## 8) Troubleshooting
- If you see Mongo auth or TLS errors:
  - Verify username/password and that SCRAM-SHA-256 is selected
  - Ensure `retrywrites=false` in Cosmos connection (RU model)
- If uploads fail:
  - Confirm the SAS hasn’t expired and includes the needed permissions
  - Check the container name matches the URL

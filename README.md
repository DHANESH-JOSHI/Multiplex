# BunnyCDN & CRUD Service - Dynamic File & Database Management

This repository provides two essential services:
1. **BunnyCDN Service**: For dynamic file management, including uploading, listing, fetching, updating, and deleting files.
2. **CRUD Service**: A reusable service for performing common database operations with MongoDB using Mongoose.

---

## 🚀 Features
### BunnyCDN Service
- **File Upload & Management**: Upload, list, fetch, update, and delete files.
- **Dynamic Path Handling**: Store files in structured folders like `Movies`, `WebSeries`, `Seasons`, etc.
- **Error Handling**: Proper validation and error messages.
- **Reusable & Modular**: Can be integrated anywhere in the project.

### CRUD Service
- **Simplified Database Operations**: Standardized CRUD operations.
- **Mongoose-Based**: Works seamlessly with MongoDB.
- **Error Handling**: Provides meaningful error messages.
- **Dynamic ID Field Selection**: Search by custom ID fields.

---

## 🛠 Installation
Ensure you have **Node.js** installed.

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd project-root
   ```
2. Install dependencies:
   ```sh
   npm install mongoose axios
   ```
3. Configure BunnyCDN API in `config/bunnyCDN.js`.
4. Set up MongoDB connection in your project.

---

## 📂 File Structure
```
project-root/
│── config/
│   ├── bunnyCDN.js  # Axios setup for BunnyCDN
│── services/
│   ├── BunnyCDNService.js  # BunnyCDN service
│   ├── CRUDService.js  # CRUD service
│── controllers/
│── routes/
│── app.js
```

---

## 📌 BunnyCDN Service - Usage Examples

### 🔹 Upload File
```javascript
const response = await bunnyCDNService.uploadFile(["WebSeries", "Season1"], "episode1.mp4", fileBuffer);
console.log(response.url); // Save this URL in the database
```

### 🔹 List Files
```javascript
const files = await bunnyCDNService.listFiles(["WebSeries", "Season1"]);
console.log(files);
```

### 🔹 Get File Details
```javascript
const fileDetails = await bunnyCDNService.getFileDetails(["WebSeries", "Season1"], "episode1.mp4");
console.log(fileDetails);
```

### 🔹 Update (Overwrite) File
```javascript
const updatedFile = await bunnyCDNService.updateFile(["WebSeries", "Season1"], "episode1.mp4", newFileBuffer);
console.log(updatedFile.url);
```

### 🔹 Delete File
```javascript
const deleteResponse = await bunnyCDNService.deleteFile(["WebSeries", "Season1"], "episode1.mp4");
console.log(deleteResponse.message);
```

---

## 📌 CRUD Service - Usage Examples

### 🔹 Create Document
```javascript
const newMovie = await CRUDService.create(Movie, { title: "Inception", videos_id: "12345" });
```

### 🔹 Get All Documents
```javascript
const movies = await CRUDService.getAll(Movie, { genre: "Sci-Fi" });
```

### 🔹 Get Document by ID
```javascript
const movie = await CRUDService.getById(Movie, "videos_id", "12345");
```

### 🔹 Update Document
```javascript
const updatedMovie = await CRUDService.update(Movie, "videos_id", "12345", { title: "Interstellar" });
```

### 🔹 Delete Document
```javascript
await CRUDService.delete(Movie, "videos_id", "12345");
```

---

## ⚠ Error Handling
Each method includes validation and error handling. Use `try...catch` to handle exceptions:
```javascript
try {
    const movie = await CRUDService.getById(Movie, "videos_id", "12345");
    console.log(movie);
} catch (error) {
    console.error("Error:", error.message);
}
```

---

## 💡 Notes
- Ensure BunnyCDN **API key** and **Storage Zone Name** are set up correctly.
- Use structured folder names to maintain clean file storage.
- Set up MongoDB properly to use the CRUD service.

---

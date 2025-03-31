# BunnyCDN Service - Dynamic File Management

This service provides a dynamic interface to interact with **BunnyCDN** for managing files, including **uploading, listing, fetching details, updating, and deleting files**. The folder structure is maintained dynamically based on input parameters.

---

## 🚀 Features
- **CRUD Operations** for managing files on BunnyCDN.
- **Dynamic Path Handling**: Store files in structured folders like `Movies`, `WebSeries`, `Seasons`, etc.
- **Proper Validations**: Ensures all required inputs are provided.
- **Error Handling**: Catches and throws meaningful errors.
- **Reusable Service**: Can be called from anywhere in the project.

---

## 🛠 Installation
Ensure you have Node.js installed, and BunnyCDN API configured in `bunnyCDN.js` inside `config` folder.

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install axios
   ```
3. Configure BunnyCDN API in `config/bunnyCDN.js`

---

## 📂 File Structure
```
project-root/
│── config/
│   ├── bunnyCDN.js  # Axios setup for BunnyCDN
│── services/
│   ├── BunnyCDNService.js  # BunnyCDN service (this file)
│── controllers/
│── routes/
│── app.js
```

---

## 📌 Usage Examples

### 🔹 1. Upload File
Uploads a file to BunnyCDN under a dynamic path and returns the **URL** for storage.
```javascript
const response = await bunnyCDNService.uploadFile(["WebSeries", "Season1"], "episode1.mp4", fileBuffer);
console.log(response.url); // Save this URL in the database
```

### 🔹 2. List Files
Fetches the list of files inside a specific directory.
```javascript
const files = await bunnyCDNService.listFiles(["WebSeries", "Season1"]);
console.log(files);
```

### 🔹 3. Get File Details
Retrieves details of a specific file.
```javascript
const fileDetails = await bunnyCDNService.getFileDetails(["WebSeries", "Season1"], "episode1.mp4");
console.log(fileDetails);
```

### 🔹 4. Update (Overwrite) File
Re-uploads a file to update its content.
```javascript
const updatedFile = await bunnyCDNService.updateFile(["WebSeries", "Season1"], "episode1.mp4", newFileBuffer);
console.log(updatedFile.url);
```

### 🔹 5. Delete File
Deletes a file from BunnyCDN.
```javascript
const deleteResponse = await bunnyCDNService.deleteFile(["WebSeries", "Season1"], "episode1.mp4");
console.log(deleteResponse.message);
```

---

## ⚠ Error Handling
This service includes validation checks and throws meaningful errors for missing or incorrect inputs.

Example:
```javascript
try {
    await bunnyCDNService.uploadFile([], "", null);
} catch (error) {
    console.error(error.message); // Invalid input: pathSegments, fileName, and fileData are required
}
```

---

## 💡 Notes
- Ensure you have a valid BunnyCDN **API key** and **Storage Zone Name** configured in `bunnyCDN.js`.
- Use structured folder names to maintain clean storage management.

---
# CRUDService

## Overview
`CRUDService` is a reusable service class for performing common CRUD (Create, Read, Update, Delete) operations on MongoDB models using Mongoose. It simplifies database interactions and provides consistent error handling.

## Installation
Ensure you have `mongoose` installed in your project:
```sh
npm install mongoose
```

## Methods

### 1. `create(model, data)`
Creates a new document in the specified model.
#### Parameters:
- `model` (*Mongoose Model*): The model in which the document is to be created.
- `data` (*Object*): The data to insert into the model.
#### Returns:
- Success: `{ message: "Record created successfully", data: <Created Document> }`
- Error: Throws an error if creation fails.

#### Example Usage:
```javascript
const newMovie = await CRUDService.create(Movie, { title: "Inception", videos_id: "12345" });
```

---

### 2. `getAll(model, filter = {})`
Retrieves all documents from the specified model, optionally filtered.
#### Parameters:
- `model` (*Mongoose Model*): The model to fetch records from.
- `filter` (*Object*, optional): Query filter.
#### Returns:
- Success: `{ message: "Records fetched successfully", data: <Array of Documents> }`
- Error: Throws an error if retrieval fails.

#### Example Usage:
```javascript
const movies = await CRUDService.getAll(Movie, { genre: "Sci-Fi" });
```

---

### 3. `getById(model, idField, id)`
Fetches a single document by ID.
#### Parameters:
- `model` (*Mongoose Model*): The model to fetch from.
- `idField` (*String*): The field used as the unique identifier.
- `id` (*String | Number*): The ID to search for.
#### Returns:
- Success: `{ message: "Record fetched successfully", data: <Document> }`
- Error: Throws an error if the record is not found.

#### Example Usage:
```javascript
const movie = await CRUDService.getById(Movie, "videos_id", "12345");
```

---

### 4. `update(model, idField, id, updateData)`
Updates a document by its ID.
#### Parameters:
- `model` (*Mongoose Model*): The model to update.
- `idField` (*String*): The field used as the unique identifier.
- `id` (*String | Number*): The ID of the record to update.
- `updateData` (*Object*): The new data to update.
#### Returns:
- Success: `{ message: "Record updated successfully", data: <Updated Document> }`
- Error: Throws an error if update fails.

#### Example Usage:
```javascript
const updatedMovie = await CRUDService.update(Movie, "videos_id", "12345", { title: "Interstellar" });
```

---

### 5. `delete(model, idField, id)`
Deletes a document by ID.
#### Parameters:
- `model` (*Mongoose Model*): The model from which to delete.
- `idField` (*String*): The field used as the unique identifier.
- `id` (*String | Number*): The ID of the record to delete.
#### Returns:
- Success: `{ message: "Record deleted successfully" }`
- Error: Throws an error if deletion fails.

#### Example Usage:
```javascript
await CRUDService.delete(Movie, "videos_id", "12345");
```

---

## Error Handling
Each method throws an error if the operation fails. Always use `try...catch` to handle exceptions gracefully:
```javascript
try {
    const movie = await CRUDService.getById(Movie, "videos_id", "12345");
    console.log(movie);
} catch (error) {
    console.error("Error:", error.message);
}
```
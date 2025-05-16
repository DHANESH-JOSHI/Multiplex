
const Language = require("../../models/languages_iso.model");
const CRUDService = require("../../services/crud.service");

class LanguageService {
    /**
     * Add a new language
     * @param {Object} param0 - Language details
     * @param {string} param0.name - Name of the language
     * @param {string} param0.code - Language code
     * @returns {Promise<Object>} - Created language data
     */
    async addLanguage({ name, code }) {
        return await CRUDService.create(Language, {
            name,
            code
        });
    }

    /**
     * Get all languages
     * @returns {Promise<Array>} - List of languages
     */
    async getAllLanguages(queryParams) {
        return await CRUDService.getAllPages(Language, {}, queryParams);
    }

    /**
     * Get a single language by its ID
     * @param {string|number} languageId - ID of the language
     * @returns {Promise<Object>} - Language details
     */
    async getLanguageById(languageId) {
        return await CRUDService.getById(Language, "_id", languageId);
    }

    /**
     * Update language details
     * @param {string|number} languageId - ID of the language to update
     * @param {Object} languageData - Updated language details
     * @returns {Promise<Object>} - Updated language data
     */
    async updateLanguage(languageId, languageData) {
        return await CRUDService.update(Language, "_id", languageId, languageData);
    }

    /**
     * Delete a language by its ID
     * @param {string|number} languageId - ID of the language to delete
     * @returns {Promise<Object>} - Deletion confirmation
     */
    async deleteLanguage(languageId) {
        return await CRUDService.delete(Language, languageId);
    }
}

module.exports = new LanguageService();

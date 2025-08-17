const Currency = require('../models/currency.model');

const CountryFilteringService = {
  
  /**
   * Check if content is available for user's country
   * @param {Object} content - Video/Movie/WebSeries object
   * @param {string} userCountry - User's country code (e.g., "IN")
   * @returns {Promise<Object>} - Availability result with pricing info
   */
  async checkContentAvailability(content, userCountry) {
    try {
      if (!content || !userCountry) {
        return { isAvailable: false, reason: 'Missing content or country' };
      }

      // Get user's currency
      const userCurrency = await Currency.findOne({ country: userCountry });
      if (!userCurrency) {
        return { isAvailable: false, reason: 'Currency not found for country' };
      }

      let isAvailable = false;
      let price = null;
      let currency = null;
      let reason = '';

      // Priority 1: Global content (always available)
      if (content.use_global_price === true) {
        isAvailable = true;
        price = content.price || 0;
        currency = userCurrency.iso_code;
        reason = 'Global content';
      }
      // Priority 2: Country-specific pricing
      else if (content.pricing && Array.isArray(content.pricing) && content.pricing.length > 0) {
        const countryPricing = content.pricing.find(p => p.country === userCountry);
        if (countryPricing) {
          isAvailable = true;
          price = countryPricing.price;
          currency = userCurrency.iso_code;
          reason = 'Country-specific pricing found';
        } else {
          reason = `Not available for ${userCountry}. Available in: ${content.pricing.map(p => p.country).join(', ')}`;
        }
      }
      // Priority 3: Country ObjectId array (use normal price)
      else if (content.country && Array.isArray(content.country) && content.country.length > 0) {
        const videoCountryCurrencies = await Currency.find({ 
          _id: { $in: content.country } 
        }).select('country iso_code');
        
        const resolvedCountries = videoCountryCurrencies.map(c => c.country);
        const matchingCurrency = videoCountryCurrencies.find(c => c.country === userCountry);
        
        if (matchingCurrency) {
          isAvailable = true;
          price = content.price || 0;
          currency = matchingCurrency.iso_code;
          reason = 'Country ObjectId match';
        } else {
          reason = `Not available for ${userCountry}. Available in: ${resolvedCountries.join(', ')}`;
        }
      }
      // Priority 4: No restrictions (available everywhere)
      else {
        isAvailable = true;
        price = content.price || 0;
        currency = userCurrency.iso_code;
        reason = 'No geo restrictions';
      }

      return {
        isAvailable,
        price,
        currency,
        reason,
        userCountry,
        userCurrencyCode: userCurrency.iso_code,
        currencySymbol: userCurrency.symbol
      };

    } catch (error) {
      console.error('❌ Country filtering error:', error);
      return { 
        isAvailable: false, 
        reason: 'Filtering error',
        error: error.message 
      };
    }
  },

  /**
   * Filter array of content based on user's country
   * @param {Array} contentArray - Array of videos/movies/webseries
   * @param {string} userCountry - User's country code
   * @returns {Promise<Array>} - Filtered content array
   */
  async filterContentArray(contentArray, userCountry) {
    try {
      if (!contentArray || !Array.isArray(contentArray) || !userCountry) {
        return contentArray || [];
      }

      const filteredContent = [];
      
      for (const content of contentArray) {
        const availability = await this.checkContentAvailability(content, userCountry);
        
        if (availability.isAvailable) {
          // Add country-specific pricing info to content
          content.country_price = availability.price;
          content.user_currency = availability.currency;
          content.currency_symbol = availability.currencySymbol;
          content.availability_reason = availability.reason;
          
          filteredContent.push(content);
        } else {
          console.log(`🚫 Blocked content: ${content.title} - ${availability.reason}`);
        }
      }

      return filteredContent;

    } catch (error) {
      console.error('❌ Content array filtering error:', error);
      return contentArray || [];
    }
  },

  /**
   * Middleware function for country filtering
   * @param {string} userCountry - User's country from request
   * @param {Object|Array} content - Content to filter
   * @returns {Promise<Object>} - Filtered result
   */
  async applyCountryFilter(userCountry, content) {
    try {
      if (!content) {
        return { 
          isBlocked: false, 
          content: null,
          message: 'No content to filter'
        };
      }

      // Handle single content object
      if (!Array.isArray(content)) {
        const availability = await this.checkContentAvailability(content, userCountry);
        
        if (!availability.isAvailable) {
          return {
            isBlocked: true,
            content: null,
            message: "Content not available in your region",
            reason: availability.reason,
            country: userCountry
          };
        }

        // Add pricing info
        content.country_price = availability.price;
        content.user_currency = availability.currency;
        content.currency_symbol = availability.currencySymbol;
        
        return {
          isBlocked: false,
          content: content,
          message: "Content available"
        };
      }

      // Handle array of content
      const filteredContent = await this.filterContentArray(content, userCountry);
      
      return {
        isBlocked: false,
        content: filteredContent,
        message: `${filteredContent.length} of ${content.length} items available`,
        originalCount: content.length,
        filteredCount: filteredContent.length
      };

    } catch (error) {
      console.error('❌ Apply country filter error:', error);
      return {
        isBlocked: false,
        content: content,
        message: 'Filtering error - allowing content',
        error: error.message
      };
    }
  }
};

module.exports = CountryFilteringService;

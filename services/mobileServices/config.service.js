const Config = require('../../models/config.model');
const Genre = require('../../models/genre.model');
const Country = require('../../models/country.model');
const LiveTvCategory = require('../../models/live_tv_category.model');
const Currency = require('../../models/currency.model');

// Helper to convert string "true"/"false" to boolean, if applicable.
const toBoolean = (val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
};

exports.getFullConfig = async () => {
  // 1. Fetch App Config values
  const menus = await Config.findOne({ title: 'app_menu' }).lean();
  const ap_program_guide_enable = await Config.findOne({ title: 'app_program_guide_enable' }).lean();
  const app_mandatory = await Config.findOne({ title: 'app_mandatory_login' }).lean();
  const genres_vis = await Config.findOne({ title: 'genre_visible' }).lean();
  const countries_visible = await Config.findOne({ title: 'country_visible' }).lean();

  const app_config = {
    menu: menus ? menus.value : null,
    program_guide_enable: ap_program_guide_enable ? toBoolean(ap_program_guide_enable.value) : null,
    mandatory_login: app_mandatory ? toBoolean(app_mandatory.value) : null,
    genre_visible: genres_vis ? toBoolean(genres_vis.value) : null,
    country_visible: countries_visible ? toBoolean(countries_visible.value) : null
  };

  // 2. Fetch Ads Config values
  const ads_enables = await Config.findOne({ title: 'mobile_ads_enable' }).lean();
  const mobile_ads_networks = await Config.findOne({ title: 'mobile_ads_network' }).lean();
  const admob_app_ids = await Config.findOne({ title: 'admob_app_id' }).lean();
  const admob_banner_ads_ids = await Config.findOne({ title: 'admob_banner_ads_id' }).lean();
  const admob_interstitial_ads_ids = await Config.findOne({ title: 'admob_interstitial_ads_id' }).lean();
  const admob_native_ads_ids = await Config.findOne({ title: 'admob_native_ads_id' }).lean();
  const fan_native_ads_placement_ids = await Config.findOne({ title: 'fan_native_ads_placement_id' }).lean();
  const fan_banner_ads_placement_ids = await Config.findOne({ title: 'fan_banner_ads_placement_id' }).lean();
  const fan_interstitial_ads_placement_ids = await Config.findOne({ title: 'fan_interstitial_ads_placement_id' }).lean();
  const startapp_app_ids = await Config.findOne({ title: 'startapp_app_id' }).lean();

  const ads_config = {
    ads_enable: ads_enables ? ads_enables.value : null,
    mobile_ads_network: mobile_ads_networks ? mobile_ads_networks.value : null,
    admob_app_id: admob_app_ids ? admob_app_ids.value : null,
    admob_banner_ads_id: admob_banner_ads_ids ? admob_banner_ads_ids.value : null,
    admob_interstitial_ads_id: admob_interstitial_ads_ids ? admob_interstitial_ads_ids.value : null,
    admob_native_ads_id: admob_native_ads_ids ? admob_native_ads_ids.value : null,
    fan_native_ads_placement_id: fan_native_ads_placement_ids ? fan_native_ads_placement_ids.value : null,
    fan_banner_ads_placement_id: fan_banner_ads_placement_ids ? fan_banner_ads_placement_ids.value : null,
    fan_interstitial_ads_placement_id: fan_interstitial_ads_placement_ids ? fan_interstitial_ads_placement_ids.value : null,
    startapp_app_id: startapp_app_ids ? startapp_app_ids.value : null
  };

  // 3. Fetch Payment Config values
  const currency_symbols = await Config.findOne({ title: 'currency_symbol' }).lean();
  const currencys = await Config.findOne({ title: 'currency' }).lean();
  const currencyData = await Currency.findOne({ iso_code: currencys ? currencys.value : null }).lean();
  const exchnage_rates = currencyData ? currencyData.exchange_rate : 1;
  const paypal_enables = await Config.findOne({ title: 'paypal_enable' }).lean();
  const paypal_emails = await Config.findOne({ title: 'paypal_email' }).lean();
  const paypal_client_ids = await Config.findOne({ title: 'paypal_client_id' }).lean();
  const stripe_enables = await Config.findOne({ title: 'stripe_enable' }).lean();
  const stripe_publishable_keys = await Config.findOne({ title: 'stripe_publishable_key' }).lean();
  const stripe_secret_keys = await Config.findOne({ title: 'stripe_secret_key' }).lean();
  const razorpay_enables = await Config.findOne({ title: 'razorpay_enable' }).lean();
  const razorpay_key_ids = await Config.findOne({ title: 'razorpay_key_id' }).lean();
  const razorpay_key_secrets = await Config.findOne({ title: 'razorpay_key_secret' }).lean();
  const razorpay_inr_exchange_rates = await Config.findOne({ title: 'razorpay_inr_exchange_rate' }).lean();
  const offline_payment_enables = await Config.findOne({ title: 'offline_payment_enable' }).lean();
  const offline_payment_titles = await Config.findOne({ title: 'offline_payment_title' }).lean();
  const offline_payment_instructions = await Config.findOne({ title: 'offline_payment_instruction' }).lean();

  const payment_config = {
    currency_symbol: currency_symbols ? currency_symbols.value : null,
    currency: currencys ? currencys.value : null,
    exchnage_rate: exchnage_rates,
    paypal_enable: paypal_enables ? toBoolean(paypal_enables.value) : null,
    paypal_email: paypal_emails ? paypal_emails.value : null,
    paypal_client_id: paypal_client_ids ? paypal_client_ids.value : null,
    stripe_enable: stripe_enables ? toBoolean(stripe_enables.value) : null,
    stripe_publishable_key: stripe_publishable_keys ? stripe_publishable_keys.value : null,
    stripe_secret_key: stripe_secret_keys ? stripe_secret_keys.value : null,
    razorpay_enable: razorpay_enables ? toBoolean(razorpay_enables.value) : null,
    razorpay_key_id: razorpay_key_ids ? razorpay_key_ids.value : null,
    razorpay_key_secret: razorpay_key_secrets ? razorpay_key_secrets.value : null,
    razorpay_inr_exchange_rate: razorpay_inr_exchange_rates ? razorpay_inr_exchange_rates.value : null,
    offline_payment_enable: offline_payment_enables ? toBoolean(offline_payment_enables.value) : null,
    offline_payment_title: offline_payment_titles ? offline_payment_titles.value : null,
    offline_payment_instruction: offline_payment_instructions ? offline_payment_instructions.value : null
  };
  // 4. Fetch APK version info (each row contains a single value)
  const version_code_doc = await Config.findOne({ title: 'apk_version_code' }).lean();
  const version_name_doc = await Config.findOne({ title: 'apk_version_name' }).lean();
  const whats_new_doc = await Config.findOne({ title: 'apk_whats_new' }).lean();
  const apk_url_doc = await Config.findOne({ title: 'latest_apk_url' }).lean();
  const apk_skipable_doc = await Config.findOne({ title: 'apk_update_is_skipable' }).lean();

  const apk_version_info = {
    version_code: version_code_doc ? version_code_doc.value : null,
    version_name: version_name_doc ? version_name_doc.value : null,
    whats_new: whats_new_doc ? whats_new_doc.value : null,
    apk_url: apk_url_doc ? apk_url_doc.value : null,
    is_skipable: false
  };
  if (apk_skipable_doc && apk_skipable_doc.value === "1") {
    apk_version_info.is_skipable = true;
  }

  // 5. Fetch data from other collections
  const genre = [
    {
      "genre_id": "1",
      "name": "Action",
      "description": "Action Movie",
      "slug": "action",
      "url": "https://multiplexplay.com/office/genre/action.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "7",
      "name": "Comedy",
      "description": "Comedy Movies",
      "slug": "comedy",
      "url": "https://multiplexplay.com/office/genre/comedy.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "8",
      "name": "Crime",
      "description": "Crime Movies",
      "slug": "crime",
      "url": "https://multiplexplay.com/office/genre/crime.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "11",
      "name": "Family",
      "description": "Family",
      "slug": "family",
      "url": "https://multiplexplay.com/office/genre/family.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "12",
      "name": "Fantasy",
      "description": "Fantasy Movies",
      "slug": "fantasy",
      "url": "https://multiplexplay.com/office/genre/fantasy.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "13",
      "name": "History",
      "description": "",
      "slug": "history",
      "url": "https://multiplexplay.com/office/genre/history.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "14",
      "name": "Horror",
      "description": "Horror Movies",
      "slug": "horror",
      "url": "https://multiplexplay.com/office/genre/horror.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "16",
      "name": "Musical",
      "description": "",
      "slug": "musical",
      "url": "https://multiplexplay.com/office/genre/musical.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "17",
      "name": "Mystery",
      "description": "",
      "slug": "mystery",
      "url": "https://multiplexplay.com/office/genre/mystery.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "18",
      "name": "Thriller",
      "description": "",
      "slug": "thriller",
      "url": "https://multiplexplay.com/office/genre/thriller.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "19",
      "name": "War",
      "description": "",
      "slug": "war",
      "url": "https://multiplexplay.com/office/genre/war.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "20",
      "name": "Western",
      "description": "",
      "slug": "western",
      "url": "https://multiplexplay.com/office/genre/western.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "22",
      "name": "Romance",
      "description": " Romance",
      "slug": "romance",
      "url": "https://multiplexplay.com/office/genre/romance.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "23",
      "name": "Adventure",
      "description": " Adventure",
      "slug": "adventure",
      "url": "https://multiplexplay.com/office/genre/adventure.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "25",
      "name": "Drama",
      "description": " Drama",
      "slug": "drama",
      "url": "https://multiplexplay.com/office/genre/drama.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "27",
      "name": "Sci-Fi",
      "description": " Sci-Fi",
      "slug": "sci-fi",
      "url": "https://multiplexplay.com/office/genre/sci-fi.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "35",
      "name": "UPCOMING SHOWS",
      "description": " Western",
      "slug": "upcoming-shows",
      "url": "https://multiplexplay.com/office/genre/upcoming-shows.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "36",
      "name": "MULTIPLEX ORIGINAL",
      "description": " Sport",
      "slug": "multiplex-original",
      "url": "https://multiplexplay.com/office/genre/multiplex-original.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "40",
      "name": "DESI WEBSERIES",
      "description": "Action & Adventure",
      "slug": "desi-webseries",
      "url": "https://multiplexplay.com/office/genre/desi-webseries.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "41",
      "name": "MULTIPLEX TRANDING",
      "description": "",
      "slug": "multiplex-tranding",
      "url": "https://multiplexplay.com/office/genre/multiplex-tranding.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "42",
      "name": "WEBSERIES",
      "description": "",
      "slug": "webseries",
      "url": "https://multiplexplay.com/office/genre/webseries.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "55",
      "name": "COFFEE WITH GOD DU",
      "description": "",
      "slug": "coffee-with-god-du",
      "url": "https://multiplexplay.com/office/genre/coffee-with-god-du.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "56",
      "name": "ONE NIGHT TALK",
      "description": "",
      "slug": "one-night-talk",
      "url": "https://multiplexplay.com/office/genre/one-night-talk.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "57",
      "name": "WRONG ADRESS",
      "description": "",
      "slug": "wrong-adress",
      "url": "https://multiplexplay.com/office/genre/wrong-adress.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "58",
      "name": "DOMINATE GAME SHOW",
      "description": "",
      "slug": "dominate-game-show",
      "url": "https://multiplexplay.com/office/genre/dominate-game-show.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "59",
      "name": "NEWS THE TIME TRAVEL",
      "description": "",
      "slug": "news-the-time-travel",
      "url": "https://multiplexplay.com/office/genre/news-the-time-travel.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "61",
      "name": "CRIME WAVE",
      "description": "",
      "slug": "crime-wave",
      "url": "https://multiplexplay.com/office/genre/crime-wave.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "62",
      "name": "THE SURVIVAL BOSS",
      "description": "",
      "slug": "the-survival-boss",
      "url": "https://multiplexplay.com/office/genre/the-survival-boss.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "63",
      "name": "Superhero",
      "description": "",
      "slug": "superhero",
      "url": "https://multiplexplay.com/office/genre/superhero.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "64",
      "name": "Spy",
      "description": "",
      "slug": "spy",
      "url": "https://multiplexplay.com/office/genre/spy.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "65",
      "name": "Sci-Fi & Fantasy",
      "description": "Sci-Fi & Fantasy",
      "slug": "sci-fi-fantasy",
      "url": "https://multiplexplay.com/office/genre/sci-fi-fantasy.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "66",
      "name": "Suspense",
      "description": "Suspense",
      "slug": "suspense",
      "url": "https://multiplexplay.com/office/genre/suspense.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "67",
      "name": "Violence",
      "description": "Violence",
      "slug": "violence",
      "url": "https://multiplexplay.com/office/genre/violence.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  },
  {
      "genre_id": "68",
      "name": "Action & Adventure",
      "description": "",
      "slug": "action-adventure",
      "url": "https://multiplexplay.com/office/genre/action-adventure.html",
      "image_url": "https://multiplexplay.com/office/uploads/default_image/genre.png"
  }
  ];
  
  //await Genre.find({}, '-_id -__v').lean();
  // const country = await Country.find({}, '-_id -__v').lean();

  const country = [ {
    "country_id": "10",
    "name": "India",
    "description": "",
    "slug": "india",
    "url": "https://multiplexplay.com/office/country/india.html",
    "image_url": "https://multiplexplay.com/office/uploads/default_image/country.png"
},];
  const tv_category = await LiveTvCategory.find({}).lean();

  return {
    app_config,
    ads_config,
    payment_config,
    apk_version_info,
    genre,
    country,
    tv_category
  };
};
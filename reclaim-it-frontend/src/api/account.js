// src/api/account.js
import api from './auth';

/**
 * Fetch everything for the current user in one call:
 *   GET /data
 * Returns a promise that resolves to the JSON:
 *  {
 *    profile: { user_id, email, first_name, last_name },
 *    listings: [ … ],
 *    requests: [ … ]
 *  }
 */
export function getAccountData() {
  return api
    .get('/account/data')
    .then(res => {
      // res.data is the raw object your FastAPI returned
      return res.data;
    })
    .catch(err => {
      // rethrow so your components can .catch it
      throw err;
    });
}

const axios = require('axios');

class Seerbit {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.SEERBITBASEURL,
      headers: {
        "Public-Key": process.env.SEERBITPUBLICKEY,
        Authorization: '', // Initialize with an empty token
      },
    });
    this.token = null; // Initialize token as null
  }

  async getToken(email, password) {
    try {
      const response = await this.axiosInstance.post('/pockets/pocket/authenticate', {
        email,
        password,
      });
      console.log(response.data);
      this.token = response.data.bearerToken;

      // Update the Authorization header with the token
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      
      return this.token;
    } catch (error) {
      throw error;
    }
  }

  async getBanks() {
    if (!this.token) {
      throw new Error('Token is not available. Call getToken method first.');
    }

    try {
      const response = await this.axiosInstance.get('/pockets/pocket/banks');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async payToBank(pockedId, reference, amount, currency, description, accountNumber, bankCode){
    if (!this.token) {
        throw new Error('Token is not available. Call getToken method first.');
    }

    try {
        const response = await this.axiosInstance.post('pockets/pocket/payout/pocket-id/'+pockedId,{
            reference, 
            amount, 
            currency, 
            description, 
            accountNumber, 
            bankCode
        });
        return response.data;
      } catch (error) {
        throw error;
      }
  }
}

module.exports = Seerbit;


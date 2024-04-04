exports.roles = {
  admin: "ADMIN",
  staff: "STAFF",
  client: "CLIENT",
};

exports.countryCodes = {
  Nigeria: "NG",
  Ghana: "GH",
  UK: "GB",
}

exports.transactionTypes = {
  wallet: "wallet",
  giftcard: "giftcard",
  crypto: "crypto",
};

exports.operations = {
  changedWalletPin: "Changed Wallet Pin",
  changedPassword: "Changed Password",
  requestResetPassword: "Request Reset Password",
  debit: "Debit",
  credit: "Credit",
  transfer: "Transfer",
  sellGiftcard: "Sell Giftcard",
  basicKycSuccess: "Basic KYC Successful",
  basicKycFailed: "Basic KYC Failed",
  biometricKycSuccess: "Biometric KYC Successful",
  biometricKycFailed: "Biometric KYC failed",
  buyCrypto: "Buy Crypto",
  sellCrypto: "Sell Crypto",
  transferCrypto: "Transfer Crypto",
  recieveCrypto: "Recieve Crypto",
  sendCrypto: "Send Crypto",
};

exports.product_name = "Cambio";
exports.frontend_link = "https://cambio.ng";
exports.backend_link = "https://aphacrunch-api.onrender.com";
exports.logo_url =
  "https://res.cloudinary.com/dkgblnkxm/image/upload/v1694926535/w2wnxtjjbydmtjru2gjg.png";

exports.Status = {
  approved: "approved",
  pending: "pending",
  failed: "failed",
  successful: "successful",
};

exports.CustomEvents = {
  newMessage: "new_message",
  deleteMessage: "delete_message",
  debitTransaction: "debit_transaction",
  creditTransaction: "credit_transaction",
  newNotification: "new_notification",
};

exports.CardTypes = {
  physical: "Physical Card",
  eCode: "E-Code",
};

exports.urls = {
  getFormSubmits: "https://formsubmit.co/api/get-submissions/", // api key to be concatenated to this url
};

exports.bitPowrAccountApi = {
  getAccount: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts",
  },
  getAccountById: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}",
  },
  getAccountAssests: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{id}/assets",
  },
  getAccountAsset: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/assets/{assetId}",
  },
  getAccountBalance: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/balance",
  },
  getAccountTransaction: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/transactions",
  },
  getTransaction: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/transactions/{txId}",
  },
  createSubAccounts: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/sub-accounts",
  },
  getSubAccounts: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/sub-accounts",
  },
  getAccountBalanceByAccountIdAndSubAccountId: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{accountId}/sub-accounts/{subAccountId}/balance",
  },
  getSubAccountAddressess: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/sub-accounts/{subId}/addresses",
  },
  createSubAccountAddressess: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/accounts/{uid}/sub-accounts/{subId}/addresses",
  },
};

exports.bitPowrAddressApi = {
  createWhitelistAddress: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/addresses/whitelist",
  },
  createAddresses: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/addresses",
  },
  getAddresses: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/addresses",
  },
  getAddressesByAddressId: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/addresses/{addressId}",
  },
  getAddressesTransactions: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/addresses/{addressId}/transactions",
  },
  getAddressesBalance: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/addresses/{addressId}/balance",
  },
  addTrustlineAssests: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/addresses/add_trustline",
  },
};

exports.bitPowrAssestsApi = {
  addAssests: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/assets",
  },
  getAssestsAccount: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/assets",
  },
  getAssestsByAccountId: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/assets/{accountId}",
  },
  getAssests: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/assets/{assetId}",
  },
  getAssestsBalance: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/assets/{assetId}/balance",
  },
  getAssestsTransaction: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/assets/{assetId}/transactions",
  },
};

exports.bitPowrCustomerApi = {
  createCustomer: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/customers",
  },
  getCustomers: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/customers",
  },
  updateCustomerInfo: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/customers/{customerId}",
  },
  getCustomerById: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/customers/{customerId}",
  },
  getCustomerTransaction: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/customers/{customerId}/transactions",
  },
};

exports.bitPowrTransactionApi = {
  listTransactions: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/transactions",
  },
  createTransactions: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/transactions",
  },
  getTransaction: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/transactions/{transaction_id}",
  },
  createEstimate: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/transactions/estimate",
  },
  fetchUnspentTransactionsForUtxoChains: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/transactions/utxos",
  },
};

exports.bitPowrMarketApi = {
  getMarketProce: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/market/price",
  },
  getMarketTicker: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/market/ticker",
  },
};

exports.bitPowrStakingApi = {
  createNewStake: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/staking",
  },
  getAllStakes: {
    method: "GET",
    url: "https://developers.bitpowr.com/api/v1/staking",
  },
};

exports.bitPowrSwapApi = {
  initiateSwapRequest: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/integration/swap/exchange",
  },
  getSwapRates: {
    method: "POST",
    url: "https://developers.bitpowr.com/api/v1/integration/swap/rates",
  },
};

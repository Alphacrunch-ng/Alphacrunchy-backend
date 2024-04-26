
const bcrypt = require('bcrypt');
const Wallet = require('../models/walletModel.js');
const WalletTransaction = require('../models/walletTransactionModel')
const { serverError } = require('../utils/services.js');
const { createNotification } = require('./notificationController');
const { operations, transactionTypes, Status } = require('../utils/constants');
const { createTransaction } = require('./transactionController');
const { currencies } = require('../utils/currencies.json');
const { getCacheData, setCacheData } = require('../utils/cache');
const { getPaymentBanks, resolveBank, transferToBank } = require('../utils/paymentService');


exports.creditWalletHelper = async (wallet_number, amount, transaction_number, reciever_acn) => {
    try {
        const description = `${amount} credited to wallet`;
        const creditWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: amount } }, { new: true }).select("-wallet_pin");

        const creditTransaction = await createTransaction(creditWallet.user_id, description, amount, operations.credit, transactionTypes.wallet, Status.successful, transaction_number);
        const walletTransaction = await createWalletTransaction(wallet_number, wallet_number, amount, description, creditTransaction.transaction_number, reciever_acn)
        await createNotification(creditWallet.user_id, `credited with ${amount}`);

        return { creditWallet, creditTransaction, walletTransaction };
    } catch (error) {
        throw error;
    }
}

exports.checkWalletHelper = async (wallet_number) => {
    try {
        const wallet = await Wallet.findOne({wallet_number});
        return wallet;
    } catch (error) {
        throw error;
    }
}

exports.debitWalletHelper = async ( wallet_number, amount, transaction_number, reciever_acn ) => {
    try {
        const description = `${amount} debited from wallet`;
        const debitWallet = await Wallet.findOneAndUpdate({ wallet_number },  { $inc: { balance: -amount } }, { new: true }).select("-wallet_pin");

        const debitTransaction = await createTransaction(debitWallet.user_id, description, amount, operations.debit, transactionTypes.wallet, Status.successful, transaction_number);
        const walletTransaction = await createWalletTransaction(wallet_number, wallet_number, amount, description, debitTransaction.transaction_number, reciever_acn)
        await createNotification(debitWallet.user_id, `debited with ${amount}`);
        return { debitWallet, debitTransaction, walletTransaction };
    } catch (error) {
        throw error;
    }
}

const createWalletTransaction = async (sender_wallet_number, reciever_wallet_number, amount, description, transaction_number, reciever_acn) =>{
    try {
        const walletTransaction = await WalletTransaction.create({sender_wallet_number, reciever_wallet_number, amount, description, transaction_number, reciever_acn})
        return walletTransaction;
    } catch (error) {
        throw error;
    }

}

// controller for creating a User wallet
exports.createWallet = async (req, res) => {
    const {wallet_pin, id, currency_code} = req.body;
    //checking if the sent currency code exist in the collection of supported currency
    const checkCurrency = currencies.filter((currency) => currency.code === String(currency_code).trim().toLocaleUpperCase());
    let selectedCurrency = {};
    if (checkCurrency.length < 1) {
        return res.status(400).json({
            success: false,
            message: 'invalid currency code'
        })
    }
    selectedCurrency = checkCurrency[0];
    try {
        const checkWallets = await Wallet.find({ user_id: id}).select("-wallet_pin");

        //checking if user already has an wallet with provided currency
        const checkWalletCurrency = checkWallets.filter((wallet)=> wallet.currency.code === selectedCurrency.code)
        if (checkWalletCurrency.length > 0 ) {
            return res.status(400).json({
                success: false,
                message: `wallet with ${selectedCurrency.code} already exist.`
            })
        }
       
        
            const hashedPin = await bcrypt.hash(wallet_pin, 10);
            const wallet = await Wallet.create({ wallet_pin: hashedPin, user_id: id, currency: selectedCurrency, default:(checkWallets.length < 1)});
            wallet.wallet_pin = "";
            return res.status(201).json({
                data: wallet,
                status: 'success',
                message: 'user wallet successfully created.'
            });
    } catch (error) {
        return serverError(res, error);
    }
}

// credit a users wallet
exports.creditWallet = async (req, res) => {
    const {wallet_number, amount} = req.body;
    try {
        if (!amount || amount < 1 || !parseFloat(amount)) {
            return res.status(400).json({
                success: false,
                message: 'invalid amount'
            })
        }
        const checkWallet = await Wallet.findOne({ wallet_number});
        if (!checkWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            })
        }
        const { creditWallet, creditTransaction, walletTransaction} = await this.creditWalletHelper(wallet_number, amount)
        const wallets = await Wallet.find({user_id: creditWallet.user_id})
                                .select("-wallet_pin").exec();
        return res.status(200).json({
            data: wallets,
            transaction:{creditTransaction, walletTransaction},
            success: true,
            message: 'successfully credited wallet'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// debit a users wallet
exports.debitWallet = async (req, res) => {
    const {wallet_number, amount} = req.body;
    const { id, fullName} = req.user
    
    try {
        const checkWallet = await Wallet.findOne({ wallet_number});
        const description = `${amount} debited from wallet`;
        if (!checkWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            })
        }
        if (!amount || amount < 1 || !parseFloat(amount)) {
            return res.status(400).json({
                success: false,
                message: 'invalid amount'
            })
        }
        if (amount > checkWallet.balance) {
            const description = `${amount} debited from wallet`;
            const failedTransaction = await createTransaction(checkWallet.user_id, description, amount, operations.debit, transactionTypes.wallet, Status.failed);

            const walletTransaction = await createWalletTransaction(wallet_number, wallet_number, amount, description, failedTransaction.transaction_number, account_number)
            return res.status(400).json({
                success: false,
                transaction:{failedTransaction, walletTransaction},
                message: 'insufficient funds in wallet'
            });
        }
        const debitWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: -amount } }, { new: true }).select("-wallet_pin");
        const debitTransaction = await createTransaction(checkWallet.user_id, description, amount, operations.debit, transactionTypes.wallet, Status.successful);

        const walletTransaction = await createWalletTransaction(wallet_number, wallet_number, amount, description, debitTransaction.transaction_number);
        await createNotification(checkWallet.user_id, `debited of ${amount}`);

        const wallets = await Wallet.find({user_id: debitWallet.user_id}).select("-wallet_pin").exec();

        return res.status(200).json({
            data: wallets,
            transaction:{debitTransaction, walletTransaction},
            success: true,
            message: 'successfully debited wallet'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// debit a users wallet
exports.wallet2WalletTransfer = async (req, res) => {
    const {wallet_number, amount, reciever_wallet_number } = req.body;
    console.log(wallet_number, amount, reciever_wallet_number);
    
    try {
        const checkWallet = await Wallet.findOne({ wallet_number}).populate({
            path: "user_id",
            select: "fullName _id"
        });
        const checkRecieverWallet = await Wallet.findOne({wallet_number: reciever_wallet_number }).populate({
            path: "user_id",
            select: "fullName _id"
        });

        const debitDescription = `${amount} debited from wallet to ${checkRecieverWallet.user_id.fullName}: ${checkRecieverWallet.wallet_number}.`;

        
        const creditDescription = `${amount} credited to wallet from ${checkWallet.user_id.fullName}: ${checkWallet.wallet_number}.`;

        console.log(checkWallet.wallet_number, checkRecieverWallet.wallet_number, debitDescription, creditDescription);

        if (!checkWallet || !checkRecieverWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            })
        }
        if( amount > checkWallet.balance){
            return res.status(400).json({
                success: false,
                message: 'insulficient balance'
            })
        }
        if (!amount || amount < 1 || !parseFloat(amount)) {
            return res.status(400).json({
                success: false,
                message: 'invalid amount'
            })
        }

        //debit the sender
        const debitWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: -amount } }, { new: true }).select("-wallet_pin");
        const debitTransaction = await createTransaction(checkWallet.user_id, debitDescription, amount, operations.debit, transactionTypes.wallet);
        let walletTransaction = await createWalletTransaction(wallet_number, reciever_wallet_number, amount, debitDescription, debitTransaction.transaction_number);
        await createNotification(checkWallet.user_id._id, `debited of ${amount}`);

        //credit the reciever
        const recievingWallet = await Wallet.findOneAndUpdate({ wallet_number:reciever_wallet_number},  { $inc: { balance: amount } }, { new: true }).select("-wallet_pin").populate({
            path: "user_id",
            select: "fullName _id"
        });;
        const creditTransaction = await createTransaction(checkRecieverWallet.user_id, creditDescription, amount, operations.credit, transactionTypes.wallet);
        walletTransaction = await createWalletTransaction(wallet_number, reciever_wallet_number, amount, creditDescription, creditTransaction.transaction_number);
        await createNotification(checkRecieverWallet.user_id._id, `credited with ${amount}`);

        const wallets = await Wallet.find({user_id: checkWallet.user_id}).select("-wallet_pin").exec();
        return res.status(200).json({
            data: wallets,
            recievingWallet,
            walletTransaction,
            success: true,
            message: 'successfully transfered funds'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a User wallet by wallet id
exports.getWalletById = async (req, res) => {
    const cacheKey = 'wallet'+req.params.id;
    try {
        // Check if the result is already cached
        const cachedData = getCacheData(cacheKey);
        if (cachedData) {
        return res.status(200).json({
            data: cachedData,
            success: true,
            message: 'Cached result',
        });
        }
        const checkWallet = await Wallet.findOne({ _id: req.params.id}).select("-wallet_pin").populate({
            path: "user_id",
            select: "fullName "
        });
        if (!checkWallet) {
            return res.status(204).json({
                status: 'failed',
                message: 'wallet not found'
            });
        }
        const wallet = {...checkWallet.toObject()}

        setCacheData(cacheKey, wallet, (60 * 1 * 1000));
        return res.status(200).json({
            status: 'success',
            data: wallet
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.getSupportedBanks = async (req, res) => {
    const cacheKey = 'supportedbanks';
    try {
        // Check if the result is already cached
        const cachedData = getCacheData(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                data: cachedData,
            success: true,
            message: 'Cached result',
        });
        }
        let banks = await getPaymentBanks();
        if(banks.error){
            serverError(res, banks)
        }

        setCacheData(cacheKey, banks.response.data?.banks, (60 * 1 * 1000));
        return res.status(200).json({
            status: 'success',
            data: banks.response.data?.banks
        });
    } catch (error) {
        return serverError(res, error);
    }
}

exports.checkBankAccount = async(req, res) => {
    const {bank_code, account_number} = req.body;
    try {
        const bankDetails = await resolveBank(bank_code, account_number);
        if ( bankDetails.response.status === true ) {
            return res.status(200).json({
                success: true,
                data: bankDetails.response.data
            });
        }
        return res.status(400).json({
            success: false,
            data: bankDetails.response.message
         });
        
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a User wallet by wallet id
exports.checkWalletPin = async (req, res) => {
    const { pin, wallet_number, user_id} = req.body;
    try {
        
        const checkWallet = await Wallet.findOne({ wallet_number, user_id});
        if (!checkWallet) {
            return res.status(404).json({
                status: 'failed',
                message: 'wallet not found'
            });
        }
        const wallet = {...checkWallet.toObject()}

        const checkPin = await bcrypt.compare(pin, wallet.wallet_pin);
        if (!checkPin) {
            return res.status(400).json({
                status: 'failed',
                message: 'wrong wallet pin'
            });
        }
        return res.status(200).json({
            success: true
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// deleting a user wallet temporarily by id
exports.setUserWalletInactive = async (request, response) => {
    const {id} = request.params;
    try {
        const user = await Wallet.findByIdAndUpdate({ user_id: id }, { active: false }, { new: true }).select("-wallet_pin");
        if (user) {
                return response.status(200).json({
                    data: user,
                    success: true,
                    message: `Successfully Deleted`
                });
        } else {
                return response.status(404).json({
                    success: false,
                    message: "User not found"
                  });
        }
          
    } catch (error) {
        return serverError(response, error);
    }
}

// get all user wallets, both active and inactive or either one by passing the active parameter.
exports.getWallets = async (request, response) => {
    const {pageSize, page, active} = request.query;
    const {id} = request.params;
    const cacheKey = 'userwallets'+id;
    try {
        // Check if the result is already cached
        const cachedData = getCacheData(cacheKey);
        if (cachedData) {
            return response.status(200).json({
                data: cachedData,
                success: true,
                message: 'Cached result',
            });
        }
        const wallets = await Wallet.find(active? {user_id: id, active}: {user_id: id})
                                .select("-wallet_pin")
                                .limit(pageSize? +pageSize : 30 )
                                .skip(page? (+page - 1) * +pageSize : 0)
                                .exec();
        if (wallets) {
                setCacheData(cacheKey, wallets, (60 * 5 * 1000));
                return response.status(200).json({
                    data: wallets,
                    success: true,
                    message: `Successfull`
                });
        } else {
                return response.status(404).json({
                    success: false,
                    message: "No Wallets found"
                  });
        }
          
    } catch (error) {
        return serverError(response, error);
    }
}

// credit account webhook
exports.completePayment = async (req, res) => {
    const {
      account_number,
      transaction_amount, 
      expected_amount,
      settled_amount,
      merchant_ref, // wallet number is passed from frontend as merchant ref
      msft_ref,
      source_account_number,
      source_account_name,
      source_bank_name,
      channel,
      status,
      transaction_type,
      ipaddress,
      created_at } = req.body;
  
      const reciever_acn = account_number;
      const transaction_ref = msft_ref;
      const wallet_number = merchant_ref;
      const hash = req.header('Verification-Hash');
      const marahash = process.env.MARASECRETHASH;
  
    try {
      if (!hash || (hash !== marahash)) {
        return res.status(401).json({
          success: false,
        });
      }
      if (status !== "success") {
        return res.status(400).json({
          success: false,
        });
      }
      const result = await this.creditWalletHelper(wallet_number, settled_amount, transaction_ref, reciever_acn);
      return res.status(200).json({
        status: 'success',
        data: result
    })
    } catch (error) {
      return serverError(res, error);
    }
  }

// debit wallet to pay to bank
exports.paymentToBank = async (req, res) => {
    const { bank_code, account_number, amount, wallet_number } = req.body;
   
    try {
        const checkWallet = await Wallet.findOne({ wallet_number});
        if (!checkWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            });
        }
        if (amount > checkWallet.balance) {
            return res.status(400).json({
                success: false,
                message: 'insufficient funds in wallet'
            });
        }
        const { response, error} = await transferToBank(bank_code, account_number, checkWallet.wallet_number, amount);
        
        if (response?.status === "success") {
            const { debitWallet, debitTransaction, walletTransaction } = await this.debitWalletHelper(wallet_number, amount, response.data?.transactionRef, account_number);
            const wallets = await Wallet.find({user_id: debitWallet.user_id})
                                .select("-wallet_pin").exec();
            return res.status(200).json({
                data: wallets,
                transaction:{debitTransaction, walletTransaction},
                success: true,
                message: 'successfully debited wallet'
            });
        }
        if (error) {
            const description = `${amount} debited from wallet`;
            const failedTransaction = await createTransaction(checkWallet.user_id, description, amount, operations.debit, transactionTypes.wallet, Status.failed);

            const walletTransaction = await createWalletTransaction(wallet_number, wallet_number, amount, description, failedTransaction.transaction_number, account_number)
            return res.status(500).json({
                success: false,
                walletTransaction,
                message: error?.message
            });
        }
    } catch (error) {
        return serverError(res, error);
    }
    
}
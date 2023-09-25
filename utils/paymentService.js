
const PagaCollectClient = require('paga-collect');


const pagaCollectClient = new PagaCollectClient()
    .setClientId(process.env.PUBLICKEY)
    .setPassword(process.env.SECRET)
    .setApiKey(process.env.APIHASHKEY)
    .setTest(true)
    .build();

exports.getPaymentBanks = async () => {
    const result = await pagaCollectClient.getBanks({referenceNumber:'529383853031111'})
    return {    
        error: result.error, 
        response: result.response
    }

}

exports.createdVirtualAccount = () => {
    
}
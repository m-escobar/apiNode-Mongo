var express = require('express');
var accountsModel = require('../models/accounts');
var fs = require('fs').promises;

var router = express.Router();

router.get('/', async (_, res) => {
  try {
    const accounts = await accountsModel.find({});
    res.send(accounts);
    } catch (err) {
        res.status(400).send({ error: err.message});
        console.log(`GET /account - ${err.message}`);
    }
});

router.get('/balance', async (req, res) => {
  try {
    let request = req.body;
    const agency = parseInt(request.agency, 10);
    const account = parseInt(request.account, 10);
    
    const account_info = await accountsModel.findOne(
      {$and: [{agency: {$eq: agency}}, {account: {$eq: account}}]}
      );

      if(account_info !== null) {
        // const balance = account_info['balance'];
        result = `Balance: ${account_info['balance']}`;
      } else {
        result = `Check your account info`
      }

    res.send(`${result}`);
  } catch (err) {
    res.status(400).send({ error: err.message});
    console.log(`GET /account/balance - ${err.message}`);
  };
});

router.get('/agencybalance', async (req, res) => {
  try {
    let request = req.body;
    const agency = parseInt(request.agency, 10);
    let result = null;

    const account_info = await accountsModel.aggregate(
      [{'$match': { 'agency': agency }}, {'$group': { '_id': null, 'balance': {'$avg': '$balance'}}}]
      );
      
    if(account_info[0] !== undefined) {
      result = `Balance: ${account_info[0]['balance']}`;
    } else {
      result = `Check agency number`;
    }

    res.send(`${result}`);
  } catch (err) {
    res.status(400).send({ error: err.message});
    console.log(`GET /account/agencybalance - ${err.message}`);
  };
});

router.get('/listsmallbalances', async (req, res) => {
  try {
    let request = req.body;
    const listAccounts = parseInt(request.list, 10);
    let result = [];

    function create_array(account){
      let acc = { "agency": account['agency'], "account": account['account'], "balance": account['balance'] };
      
      result.push(acc);
    }

    const account_info = await accountsModel.aggregate(
      [{'$sort': {'balance': 1 }}, {'$limit': listAccounts }]
      );
      
    account_info.forEach(create_array);

    res.send(`${JSON.stringify(result)}`);
  } catch (err) {
    res.status(400).send({ error: err.message});
    console.log(`GET /account/listsmallbalances - ${err.message}`);
  };
});

router.get('/listlargebalances', async (req, res) => {
  try {
    let request = req.body;
    const listAccounts = parseInt(request.list, 10);
    let result = [];

    function create_array(account){
      let acc = { "agency": account['agency'], "account": account['account'], "name": account['name'], "balance": account['balance'] };
      
      result.push(acc);
    }

    const account_info = await accountsModel.aggregate(
      [{'$sort': {'balance': -1 }}, {'$limit': listAccounts }]
      );
      
    account_info.forEach(create_array);

    res.send(`${JSON.stringify(result)}`);
  } catch (err) {
    res.status(400).send({ error: err.message});
    console.log(`GET /account/listlargebalances - ${err.message}`);
  };
});

router.post('/transfer', async (req, res) => {
  try {
    let request = req.body;
    const acc_origin = parseInt(request.account_origin, 10);
    const acc_destination = parseInt(request.account_destination, 10);
    const value = parseInt(request.value, 10);
    let transfer_tax = 0;

    const origin = await accountsModel.findOne(
      {account: {$eq: acc_origin}}
      );

    const destination = await accountsModel.findOne(
      {account: {$eq: acc_destination}}
      );

    if((origin === null) || (destination === null)){
      result = `Check account info`;
      res.send(`${result}`);
    } else {
      if(origin['agency'] !== destination['agency']){
        transfer_tax = 8;
      }

      if(origin['balance'] < value + transfer_tax){
        result = `Transfer not possible, check your balance`;
      } else {
        const tranfer_debit = await accountsModel.findOneAndUpdate(
          {$and: [{agency: {$eq: origin['agency']}}, {account: {$eq: origin['account']}}]},
          {$inc: {balance: -1 * (value + transfer_tax)}},
          {new: true}
          );
        result = `Transfer done. Your balance is ${tranfer_debit['balance']}`;
        const transfer_credit = await accountsModel.findOneAndUpdate(
          {$and: [{agency: {$eq: destination['agency']}}, {account: {$eq: destination['account']}}]},
          {$inc: {balance: value}},
          {new: true}
          );
      
      }
    }

    res.send(`${result}`);
  } catch (err) {
    res.status(400).send({ error: err.message});
    console.log(`GET /account/transfer - ${err.message}`);
  };
});

router.put('/', async (req, res) => {
  try {
    let request = req.body;
    const agency = parseInt(request.agency, 10);
    const account = parseInt(request.account, 10);
    const value = parseInt(request.value, 10);
    
    const result = await accountsModel.findOneAndUpdate(
      {$and: [{agency: {$eq: agency}}, {account: {$eq: account}}]},
      {$inc: {balance: value}},
      {new: true}
      );

    res.send(`${result}`);
    } catch (err) {
      res.status(400).send({ error: err.message});
      console.log(`PUT /account - ${err.message}`);
    };
});

router.put('/withdraw', async (req, res) => {
  try {
    let request = req.body;
    const agency = parseInt(request.agency, 10);
    const account = parseInt(request.account, 10);
    const value = parseInt(request.value, 10);
    let result = null;

    const account_info = await accountsModel.findOne(
      {$and: [{agency: {$eq: agency}}, {account: {$eq: account}}]}
      );

    if(account_info !== null) {
          const balance = account_info['balance'];

          if(balance >= value + 1){
            debit = value + 1;
            const doWithdraw = await accountsModel.findOneAndUpdate(
              {$and: [{agency: {$eq: agency}}, {account: {$eq: account}}]},
              {$inc: {balance: -1 * (value + 1)}},
              {new: true}
              );
            result = `Withdraw done, your current balance is ${doWithdraw['balance']}`;
          } else {
            result = `Withdraw not possible, your current balance is ${balance}`;
          }
      } else {
        result = `Check your account info`;
      }

    res.send(`${result}`);
    } catch (err) {
      res.status(400).send({ error: err.message});
      console.log(`PUT /account/withdraw - ${err.message}`);
    };
});

router.get('/makeprivate', async (_, res) => {
  try {
    let result = [];
    let top_accounts = [];

    function get_max(accounts){
      let account = 0;
      let balance = 0;
      const results = accounts['result'];

      for(i = 0; i < results.length; i++) {
        
        if(results[i]['balance'] > balance) {
          balance = results[i]['balance'];
          account = results[i]['account'];
        }
      }
      top_account = { "agency": accounts['_id'], "account": account };
      top_accounts.push(top_account);
    }

    async function tranfersToPrivate(account) {
      const transfered_accounts = await accountsModel.findOneAndUpdate(
        {$and: [{agency: {$eq: account['agency']}}, {account: {$eq: account['account']}}]},
        {$set: {agency: 99 }},
        {new: true}
      );
    }

    const accounts_list = await accountsModel.aggregate(
      [{'$group': {'_id': '$agency', 'result': {'$push': {'account': '$account', 'balance': '$balance'}}}}]
      );
      
    accounts_list.forEach(get_max);

    top_accounts.forEach(tranfersToPrivate);

    const private_accounts = await accountsModel.find(
      {agency: {$eq: 99}}
      );

    res.send(`${JSON.stringify(private_accounts)}`);
  } catch (err) {
    res.status(400).send({ error: err.message});
    console.log(`GET /account/makeprivate - ${err.message}`);
  };
});

router.delete('/', async (req, res) => {
  try {
    let request = req.body;
    const agency = parseInt(request.agency, 10);
    const account = parseInt(request.account, 10);
    
    const account_info = await accountsModel.deleteOne(
      {$and: [{agency: {$eq: agency}}, {account: {$eq: account}}]}
      );

      if(account_info !== null) {
        const all_accounts = await accountsModel.find(
          {agency: {$eq: agency}}
          );
        
        result = `Account deleted. This agency has ${all_accounts.length} active accounts`;
      } else {
        result = `Check your account info`
      }

    res.send(`${result}`);
  } catch (err) {
    res.status(400).send({ error: err.message});
    console.log(`DELETE /account - ${err.message}`);
  };
});

module.exports = router;

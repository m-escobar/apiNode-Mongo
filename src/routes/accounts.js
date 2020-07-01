var express = require('express');
var accountsModel = require('../models/accounts');
var fs = require('fs').promises;

var router = express.Router();

router.get('/', async (_, res) => {
  try {
    const accounts = await accountsModel.find({});
    // delete accounts._id;
    res.send(accounts);
    } catch (err) {
        res.status(400).send({ error: err.message});
        console.log(`GET /account - ${err.message}`);
    }
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
    // const values = JSON.parse(result);

    // json.accounts[accountIndex].id = accountId;
    // json.accounts[accountIndex].name = account.name;
    // json.accounts[accountIndex].balance = account.balance;

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
            result = `Withdraw done, your current balance is ${doWithdraw['balance']}`
          } else {
            result = `Withdraw not possible, your current balance is ${balance}`
          }
      } else {
        result = `Check your account info`
      }

    res.send(`${result}`);
    } catch (err) {
      res.status(400).send({ error: err.message});
      console.log(`PUT /account - ${err.message}`);
    };
});

// router.post('/', async (req, res) => {
//   let account = req.body;
//   try {
//     let data = await fs.readFile(global.fileName, 'utf-8');
//     let json = JSON.parse(data);

//     account = { id: json.nextId, ...account};
//     json.nextId++;
//     json.accounts.push(account);

//     await fs.writeFile(global.fileName, JSON.stringify(json));
    
//     res.send({"new_account": account});
//   } catch (err) {
//       res.status(400).send({ error: err.message });
//       console.log(`POST /account - ${err.message}`);
//   }
// });

// router.get('/:id', async (req, res) => {
//   try {
//     let data = await fs.readFile(global.fileName, 'utf-8');
//     let json = JSON.parse(data);
//     const account = json.accounts.find(account => account.id === parseInt(req.params.id, 10));

//     if (account) {
//       res.send(account);
//     } else {
//       res.status(400).send({error: 'Account not found'});
//       console.log('GET /account - Account not found');
//     }
//   } catch {
//     res.status(400).send({ error: err.message});
//     console.log(`GET /account/:id - ${err.message}`);
//   };
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     let data = await fs.readFile(global.fileName, 'utf-8');
//     let json = JSON.parse(data);
//     let accounts = json.accounts.filter(account => account.id !== parseInt(req.params.id, 10));
//     json.accounts = accounts;

//     await fs.writeFile(global.fileName, JSON.stringify(json));
//     res.send('account deleted');
//   } catch {
//       res.status(400).send({ error: err.message});
//       console.log(`DELETE /account/:id - ${err.message}`);
//     };
// });


module.exports = router;

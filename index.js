const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

app.use(express.static('public'));
app.use(express.json());

app.get('/pair', async (req, res) => {
  let num = req.query.number?.replace(/[^0-9]/g,'');
  if(!num) return res.json({error: 'Number do'});
  let dir = './tmp/'+num;
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  try{
    const { state, saveCreds } = await useMultiFileAuthState(dir);
    const sock = makeWASocket({ auth: state, logger: pino({level:"silent"}), browser:["SHAZI XMD","Chrome","1.0"] });
    sock.ev.on('creds.update', saveCreds);
    await delay(3000);
    let code = await sock.requestPairingCode(num);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    res.json({ code: code, bot: "SHAZI XMD", owner: "923205610677" });
  }catch(e){
    res.json({error: e.message});
  }
});

app.get('/', (req,res) => res.sendFile(path.join(__dirname,'public','index.html')));

app.listen(3000, ()=> console.log('SHAZI XMD Running'));

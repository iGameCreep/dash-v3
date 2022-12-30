const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const dateformat = require('dateformat');
const config = require('../config/config.json')
const ver = require('../config/version.json')

const number = require('easy-number-formatter')
const jsonfile = require('jsonfile')

const themes = "./config/theme.json"

router.get('/guild/:gid/roles', ensureAuthenticated,(req, res) => {
    let gid = req.params.gid 
    var theme = jsonfile.readFileSync(themes);
    let fetchguilds = discord.client.guilds.fetch({ cache: true, withCounts: true })

    fetchguilds.then(gs => {
        let guild = discord.client.guilds.cache.get(gid)
        let roles = guild.roles.cache

        res.render('home/roles', {
            profile:req.user,
            client:discord.client,
            theme:theme,
            all:req,
            config: config,
            guild: guild,
            roles: roles
        }) 
    })   
})
  
module.exports = router;

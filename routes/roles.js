const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const dateformat = require('dateformat');
const config = require('../config/config.json')
const ver = require('../config/version.json')
const { Permissions } = require('discord.js')

const number = require('easy-number-formatter')
const jsonfile = require('jsonfile')

const themes = "./config/theme.json"

// URL TO EDIT ROLES

router.get('/guild/:gid/roles', ensureAuthenticated,(req, res) => {
    let gid = req.params.gid 
    var theme = jsonfile.readFileSync(themes);
    let fetchguilds = discord.client.guilds.fetch({ cache: true, withCounts: true })

    // put all guilds in cache
    
    fetchguilds.then(gs => {
        let guild = discord.client.guilds.cache.get(gid)

        // check if bot is in the guild

        if (!guild) {
            req.flash('error', "The bot isn't in this guild !")
            res.redirect(`/addbot/${gid}`)
        }

        let roles = guild.roles.cache
        let fetchmembers = guild.members.fetch({ cache: true })

        fetchmembers.then(() => {
            let user = guild.members.cache.get(req.user.id)

            // check if user is in guild

            if (!user) {
                req.flash('error', 'You are not in this guild !')
                return res.redirect('/dash')
            }

            // check if user has manage roles or admin permissions

            let highest = user.roles.highest 
            let rolesPerm = Permissions.FLAGS.MANAGE_ROLES
            let adminPerm = Permissions.FLAGS.ADMINISTRATOR
        
            if (!user.permissions.has(rolesPerm) && !user.permissions.has(adminPerm) && !highest.permissions.has(rolesPerm) && !highest.permissions.has(adminPerm) && user.id !== guild.ownerId) {
                req.flash('error', 'You are not allowed to manage this guild !')
                return res.redirect('/dash')
            }

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
})
  
module.exports = router;

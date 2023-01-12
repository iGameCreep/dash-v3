const express = require('express');
const router = express.Router();
const discord = require('../bot')
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const config = require('../config/config.json')
const { Permissions } = require('discord.js')

const jsonfile = require('jsonfile')

const themes = "./config/theme.json"

// URL GUILD CHANNELS

router.get('/guild/:gid/channels', ensureAuthenticated,(req, res) => {
    let gid = req.params.gid 
    var theme = jsonfile.readFileSync(themes);
    let fetchguilds = discord.client.guilds.fetch({ cache: true, withCounts: true })

    fetchguilds.then(() => {
        let guild = discord.client.guilds.cache.get(gid)

        // check if bot is in the guild

        if (!guild) {
            req.flash('error', "The bot isn't in this guild !")
            res.redirect(`/addbot/${gid}`)
        }

        let channels = guild.channels.cache

        let fetchmembers = guild.members.fetch({ cache: true })

        // put all members in cache

        fetchmembers.then(() => {
            let user = guild.members.cache.get(req.user.id)

            // check if user is in the guild

            if (!user) {
                req.flash('error', 'You are not in this guild !')
                return res.redirect('/dash')
            }

            // check if user has manage channels or admin permissions

            let highest = user.roles.highest
            let channelPerm = Permissions.FLAGS.MANAGE_CHANNELS
            let adminPerm = Permissions.FLAGS.ADMINISTRATOR
    
            if (!user.permissions.has(channelPerm) && !user.permissions.has(adminPerm) && !highest.permissions.has(channelPerm) && !highest.permissions.has(adminPerm) && guild.ownerId !== req.user.id) {
                req.flash('error', 'You are not allowed to manage this guild !')
                return res.redirect('/dash')
            }
    
            res.render('home/channels', {
                profile:req.user,
                client:discord.client,
                theme:theme,
                all:req,
                config: config,
                guild: guild,
                channels: channels
            }) 
        })
    })   
})

// redirect

router.get('/guild/:gid/channel/:cid', ensureAuthenticated, (req, res) => {
    res.redirect(`/guild/${req.params.gid}/channel/${req.params.cid}/edit`)
})

module.exports = router;

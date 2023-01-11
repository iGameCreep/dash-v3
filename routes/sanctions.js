const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const discord = require('../bot')
const dateformat = require('dateformat')
const number = require('easy-number-formatter')
const themes = "./config/theme.json"
const jsonfile = require('jsonfile')
const config = require("../config/config.json")
const Discord = require("discord.js")
const { PermissionsBitField } = require("discord.js")
const { count } = require('console');

router.get('/guild/:gid/sanctions',ensureAuthenticated,(req,res) =>{
    var theme = jsonfile.readFileSync(themes);
    let fetchguilds = discord.client.guilds.fetch()

    // put all guilds in cache

    fetchguilds.then(() => {
        let guild = discord.client.guilds.cache.get(req.params.gid)

        // check if bot is in the guild

        if (!guild) {
          req.flash("error", "The bot isn't in this guild !")
          return res.redirect(`/addbot/${req.params.gid}`)
        }

        const fetchmembers = guild.members.fetch({ cache: true })

        // put all members in cache

        fetchmembers.then(() => {
            let member = guild.members.cache.get(req.user.id)

            // check if member is in the guild

            if (!member) {
                req.flash('error', 'You are not in this guild !')
                return res.redirect('/dash')
            }
    
            const permsonguild = new Discord.Permissions(member.permissions)
            let adminPerm = Discord.Permissions.FLAGS.ADMINISTRATOR
            let modPerm = Discord.Permissions.FLAGS.MODERATE_MEMBERS

            // check if member has admin or mod permissions
    
            if (!permsonguild.has(adminPerm) && !permsonguild.has(modPerm) && !member.roles.highest.permissions.has(adminPerm) && !member.roles.highest.permissions.has(modPerm) && guild.ownerId !== req.user.id) {
                req.flash("error", "You are not allowed to manage this guild !")
                res.redirect(`/dash`)
            }
    
            const fetchbans = guild.bans.fetch({ cache: true })

            // put all bans in cache
    
            fetchbans.then(() => {
                // define number of bans
                const bans = guild.bans.cache.size
    
                res.render('home/sanctions',{
                    Permissions: Discord.Permissions,
                    PermissionsBitField : PermissionsBitField,
                    manage: Discord.Permissions.FLAGS.MANAGE_GUILD,
                    profile:req.user,
                    client:discord.client,
                    dateformat:dateformat,
                    number:number,
                    theme:theme,
                    config:config,
                    guild: guild,
                    bans: bans,
                })
            })
        })
    })
})

router.get('/guild/:gid/bans',ensureAuthenticated,(req,res) =>{
    var theme = jsonfile.readFileSync(themes);
    let fetchguilds = discord.client.guilds.fetch()

    // put all guilds in cache

    fetchguilds.then(() => {
        let guild = discord.client.guilds.cache.get(req.params.gid)

        if (!guild) {
          req.flash("error", "The bot isn't in this guild !")
          return res.redirect(`/addbot/${req.params.gid}`)
        }

        // check if bot is in the guild 

        const fetchmembers = guild.members.fetch({ cache: true })

        // put all members in cache

        fetchmembers.then(() => {
            let member = guild.members.cache.get(req.user.id)

            // check if member is in the guild

            if (!member) {
                req.flash('error', 'You are not in this guild !')
                return res.redirect('/dash')
            }
    
            const permsonguild = new Discord.Permissions(member.permissions)
            let adminPerm = Discord.Permissions.FLAGS.ADMINISTRATOR
            let modPerm = Discord.Permissions.FLAGS.MODERATE_MEMBERS

            // check if user has admin or mod permissions
    
            if (!permsonguild.has(adminPerm) && !permsonguild.has(modPerm) && !member.roles.highest.permissions.has(adminPerm) && !member.roles.highest.permissions.has(modPerm) && guild.ownerId !== req.user.id) {
                req.flash("error", "You are not allowed to manage this guild !")
                res.redirect(`/dash`)
            }
    
            const fetchbans = guild.bans.fetch({ cache: true })

            // put all the bans in cache
    
            fetchbans.then(() => {
                // define bans cache
                const bans = guild.bans.cache
    
                res.render('home/bans',{
                    Permissions: Discord.Permissions,
                    PermissionsBitField : PermissionsBitField,
                    manage: Discord.Permissions.FLAGS.MANAGE_GUILD,
                    profile:req.user,
                    client:discord.client,
                    dateformat:dateformat,
                    number:number,
                    theme:theme,
                    config:config,
                    guild: guild,
                    bans: bans,
                })
            })
        })
    })
})

module.exports = router;

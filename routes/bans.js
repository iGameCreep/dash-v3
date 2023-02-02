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
const fs = require("fs")

router.get('/guild/:gid/user/:id/ban',ensureAuthenticated,(req,res) =>{
    var theme = jsonfile.readFileSync(themes);
    const version = require('../config/version.json')
    const fetchguilds = discord.client.guilds.fetch({cache: true, withCounts: true})
    
    fetchguilds.then(() => {
        const guild = discord.client.guilds.cache.get(req.params.gid)

        if (!guild) {
            req.flash('error', "The bot isn't in this guild !")
            res.redirect(`/addbot/${gid}`)
        }

        const fetchmembers = guild.members.fetch({ cache: true })
        fetchmembers.then(() => {
            let member = guild.members.cache.get(req.params.id)
            let user = guild.members.cache.get(req.user.id)

            if (!user) {
                req.flash('error', 'You are not in this guild !')
                return res.redirect('/dash')
            }

            if (!member) {
                req.flash('error', 'The user to ban is not in this guild !')
                return res.redirect(`/guild/${req.params.gid}/users`)
            }

            if (!member.bannable) {
                req.flash('error', "The user to ban can't be banned !")
            }

            // check if user has manage roles or admin permissions

            let highest = user.roles.highest 
            let rolesPerm = Discord.Permissions.FLAGS.MANAGE_ROLES
            let adminPerm = Discord.Permissions.FLAGS.ADMINISTRATOR
        
            if (!user.permissions.has(rolesPerm) && !user.permissions.has(adminPerm) && !highest.permissions.has(rolesPerm) && !highest.permissions.has(adminPerm) && user.id !== guild.ownerId) {
                req.flash('error', 'You are not allowed to manage this guild !')
                return res.redirect('/dash')
            }

            res.render('home/newban',{
                Permissions: Discord.Permissions,
                PermissionsBitField : PermissionsBitField,
                manage: Discord.Permissions.FLAGS.MANAGE_GUILD,
                profile:req.user,
                client:discord.client,
                dateformat:dateformat,
                number:number,
                theme:theme,
                config:config,
                id: req.params.id,
                userID: req.params.id,
                guildID: req.params.gid,
                version:version,
                member: member,
                guild: guild,
            })
        })
    })
    
})

router.post('/ban/new/:gid/:uid',ensureAuthenticated,(req,res) => {
    let gid = req.params.gid
    let uid = req.params.uid
    let fetchguilds = discord.client.guilds.fetch({ cache: true, withCounts: true })

    // put all guilds in cache
    
    fetchguilds.then(() => {
        let guild = discord.client.guilds.cache.get(gid)

        // check if bot is in the guild

        if (!guild) {
            req.flash('error', "The bot isn't in this guild !")
            res.redirect(`/addbot/${gid}`)
        }

        let fetchmembers = guild.members.fetch({ cache: true })

        fetchmembers.then(() => {
            let member = guild.members.cache.get(uid)
            let user = guild.members.cache.get(req.user.id)

            // check if user is in guild

            if (!user) {
                req.flash('error', 'You are not in this guild !')
                return res.redirect('/dash')
            }

            if (!member) {
                req.flash('error', 'The user to ban is not in this guild !')
                return res.redirect(`/guild/${req.params.gid}/users`)
            }

            // check if user can be banned

            if (!member.bannable) {
                req.flash('error', "The user to ban can't be banned !")
            }

            // check if user has manage roles or admin permissions

            let highest = user.roles.highest 
            let banPerm = Discord.Permissions.FLAGS.BAN_MEMBERS
            let adminPerm = Discord.Permissions.FLAGS.ADMINISTRATOR
        
            if (!user.permissions.has(banPerm) && !user.permissions.has(adminPerm) && !highest.permissions.has(banPerm) && !highest.permissions.has(adminPerm) && user.id !== guild.ownerId) {
                req.flash('error', 'You are not allowed to manage this guild !')
                return res.redirect('/dash')
            }

            try {
                member.ban({ reason: req.body.reason })
            } catch(err) { 
                console.log(err) 
                req.flash('err', 'An error has occured. Please try again later.')
                res.redirect('/dash')
            }

            req.flash('success', `The user ${member.user.tag} has been banned from guild ${guild.name} successfully !`)
            res.redirect(`/guild/${guild.id}/manage`)

        })
    })
})

router.post('/guild/:gid/unban/:uid',ensureAuthenticated,(req,res) => {
    let gid = req.params.gid
    let uid = req.params.uid
    let fetchguilds = discord.client.guilds.fetch({ cache: true, withCounts: true })

    // put all guilds in cache
    
    fetchguilds.then(() => {
        let guild = discord.client.guilds.cache.get(gid)

        // check if bot is in the guild

        if (!guild) {
            req.flash('error', "The bot isn't in this guild !")
            res.redirect(`/addbot/${gid}`)
        }

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
            let banPerm = Discord.Permissions.FLAGS.BAN_MEMBERS
            let adminPerm = Discord.Permissions.FLAGS.ADMINISTRATOR
        
            if (!user.permissions.has(banPerm) && !user.permissions.has(adminPerm) && !highest.permissions.has(banPerm) && !highest.permissions.has(adminPerm) && user.id !== guild.ownerId) {
                req.flash('error', 'You are not allowed to manage this guild !')
                return res.redirect('/dash')
            }

            const fetchbans = guild.bans.fetch({ cache: true })

            fetchbans.then(() => {

                let bannedmember = guild.bans.cache.find(ban => ban.user.id === uid)

                try {
                    guild.members.unban(uid)
                 } catch(err) { 
                     console.log(err) 
                     req.flash('err', 'An error has occured. Please try again later.')
                     res.redirect(`/guild/${gid}/bans`)
                 }
     
                 req.flash('success', `The user ${bannedmember.user.tag} has been unbanned from guild ${guild.name} successfully !`)
                 res.redirect(`/guild/${guild.id}/manage`)
            })
        })
    })
})

module.exports = router;

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

// URL CHANNEL EDIT

router.get('/guild/:gid/channel/:cid/edit', ensureAuthenticated,(req, res) => {
    let cid = req.params.cid
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

        let channel = guild.channels.fetch(cid)

        // get the channel

        channel.then((channel) => {
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

                // check if channel exists
    
                if (!channel) {
                    req.flash('error', "This channel doesn't exists !")
                    return res.redirect(`/guild/${gid}/channels`)
                }
        
                res.render('home/channel', {
                    profile:req.user,
                    client:discord.client,
                    theme:theme,
                    all:req,
                    config: config,
                    guild: guild,
                    channel: channel
                }) 
            })
        })
    })   
})

router.post('/guild/:gid/channel/:cid/type', ensureAuthenticated, (req, res) => {
    let type = req.body.type
    let cid = req.params.cid
    let gid = req.params.gid 

    let fetchguilds = discord.client.guilds.fetch({ cache: true, withCounts: true })

    fetchguilds.then(() => {
        let guild = discord.client.guilds.cache.get(gid)

        // check if bot is in the guild

        if (!guild) {
            req.flash('error', "The bot isn't in this guild !")
            res.redirect(`/addbot/${gid}`)
        }

        let channel = guild.channels.fetch(cid)

        // get the channel

        channel.then((channel) => {
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

                // check if channel exists
    
                if (!channel) {
                    req.flash('error', "This channel doesn't exists !")
                    return res.redirect(`/guild/${gid}/channels`)
                }
        
                if (type === "rules") {
                    if (channel.id === guild.systemChannelId) {
                        guild.setSystemChannel(null)
                    }

                    guild.setRulesChannel(channel).catch(() => {
                        req.flash('error', `An error has occured. Please try again later or contact support if the error persists.`)
                        return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                    })
                    req.flash('success', `Sucessfully set guild rules channel to "${channel.name}" !`)
                    res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                }

                if (type === "system") {
                    if (channel.id === guild.rulesChannelId) {
                        guild.setRulesChannel(null)
                    }

                    guild.setSystemChannel(channel).catch(() => {
                        req.flash('error', `An error has occured. Please try again later or contact support if the error persists.`)
                        return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                    })
                    req.flash('success', `Sucessfully set guild system channel to "${channel.name}" !`)
                    res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                }

                if (type === "text") {
                    if (channel.type === "GUILD_NEWS") {
                        channel.setType("GUILD_TEXT").catch(() => {
                            req.flash('error', `An error has occured. Please try again later or contact support if the error persists.`)
                            return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                        })
                        req.flash('success', `Sucessfully set channel "${channel.name}" as guild text !`)
                        return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                    } else {
                        if (channel.id === guild.rulesChannelId) {
                            guild.setRulesChannel(null)
                        }
                        if (channel.id === guild.systemChannelId) {
                            guild.setSystemChannel(null)
                        }
                        req.flash('success', `Sucessfully set channel "${channel.name}" as guild text !`)
                        return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                    }
                }

                if (type === "GUILD_NEWS") {
                    if (channel.type === "GUILD_TEXT") {
                        channel.setType("GUILD_NEWS").catch(() => {
                            req.flash('error', `An error has occured. Please try again later or contact support if the error persists.`)
                            return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                        })
                        req.flash('success', `Sucessfully set channel "${channel.name}" as guild news !`)
                        return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                    } else {
                        if (channel.id === guild.rulesChannelId) {
                            guild.setRulesChannel(null)
                        }
                        if (channel.id === guild.systemChannelId) {
                            guild.setSystemChannel(null)
                        }
                        req.flash('success', `Sucessfully set channel "${channel.name}" as guild text !`)
                        return res.redirect(`/guild/${gid}/channel/${cid}/edit`)
                    }
                }
            })
        })
    })
})

// redirect

router.get('/guild/:gid/channel/:cid', ensureAuthenticated, (req, res) => {
    res.redirect(`/guild/${req.params.gid}/channel/${req.params.cid}/edit`)
})

module.exports = router;

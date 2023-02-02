const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');
const discord = require('../bot')
const dateformat = require('dateformat')
const number = require('easy-number-formatter')
const jsonfile = require('jsonfile')
const config = require("../config/config.json")
const Discord = require("discord.js")
const { PermissionsBitField, Permissions } = require("discord.js")
const ver = require('../config/version.json');
const auth = require('../auth/auth');

const themes = "./config/theme.json"

router.get('/guild/:gid/user/:id',ensureAuthenticated,(req,res) => {
    var theme = jsonfile.readFileSync(themes);

    const guild = discord.client.guilds.cache.get(req.params.gid)
    const fetchmembers = guild.members.fetch({ cache: true, withPresences: true })

    fetchmembers.then((members) => {
        const user = guild.members.cache.get(req.params.id)
        let author = guild.members.cache.get(req.user.id)

        if (!author) {
            req.flash('error', 'You are not in this guild !')
            return res.redirect('/dash')
        }

        let highest = author.roles.highest
        let adminPerm = Permissions.FLAGS.ADMINISTRATOR
        let modPerm = Permissions.FLAGS.MODERATE_MEMBERS

        if (!author.permissions.has(adminPerm) && !author.permissions.has(modPerm) && highest.permissions.has(adminPerm) && highest.permissions.has(modPerm) && author.id !== guild.ownerId) {
            req.flash('error', 'You are allowed to manage this guild !')
            return res.redirect('/dash')
        }

        res.render('home/user',{
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
            gid: req.params.gid,
            guild: guild,
            user: user,
            author: author,
        })  
    }) 
    
})

router.get('/guild/:gid/users',ensureAuthenticated,(req,res) => {
    var theme = jsonfile.readFileSync(themes);

    const guild = discord.client.guilds.cache.get(req.params.gid)
    const fetchmembers = guild.members.fetch({ cache: true, withPresences: true })

    fetchmembers.then((members) => {
        const author = guild.members.cache.get(req.user.id)

        res.render('home/users',{
            Permissions: Discord.Permissions,
            PermissionsBitField : PermissionsBitField,
            manage: Discord.Permissions.FLAGS.MANAGE_GUILD,
            profile:req.user,
            client:discord.client,
            dateformat:dateformat,
            number:number,
            theme:theme,
            config:config,
            gid: req.params.gid,
            guild: guild,
            author: author,
            members: members,
        })  
    }) 
    
})

module.exports = router;

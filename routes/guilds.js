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

router.get('/guilds',ensureAuthenticated,(req,res) =>{
    var theme = jsonfile.readFileSync(themes);
    let guilds = discord.client.guilds.cache

    if (!config.Admin.includes(req.user.id)) {
        req.flash('error', `You are not allowed to access this page.`)
        return res.redirect('/dash')
    }
    
    res.render('home/guilds',{
        Permissions: Discord.Permissions,
        PermissionsBitField : PermissionsBitField,
        manage: Discord.Permissions.FLAGS.MANAGE_GUILD,
        guilds:guilds,
        profile:req.user,
        client:discord.client,
        dateformat:dateformat,
        number:number,
        theme:theme,
        config:config,
    })
})

router.get('/guild/:id',ensureAuthenticated,(req,res) =>{ 
    res.redirect(`/guild/${req.params.id}/manage`)
})

router.get("/addbot/:id", ensureAuthenticated,(req,res) =>{ 
    var theme = jsonfile.readFileSync(themes);
    let id = req.params.id
    let u_guilds = req.user.guilds
    let bot_id = config.clientID

    u_guilds.forEach((guild) => {
        if (guild.id !== id) return
        res.render('home/addbot',{
            Permissions: Discord.Permissions,
            profile:req.user,
            client:discord.client,
            dateformat:dateformat,
            number:number,
            theme:theme,
            config:config,
            id:req.params.id,
            guild:guild,
            id: id,
            u_guilds: u_guilds,
            bot_id: bot_id,
        })
    })
})

router.post('/guilds/leave/:id', ensureAuthenticated,(req,res) =>{

    if (!config.Admin.includes(req.user.id)) {
        req.flash('error', `You are not allowed to access this page.`)
        return res.redirect('/dash')
    }

    discord.client.guilds.cache.get(req.params.id).leave().then(value => {
        req.flash('success', `Succesfully left guild "${value.name}"`)
        res.redirect('/guilds')
    })
})

module.exports = router;

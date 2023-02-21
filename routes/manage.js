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
const { PermissionsBitField, Permissions } = require("discord.js")
const fs = require("fs")

// define function to wait

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} 

// URL TO EDIT GUILD

router.get('/guild/:gid/manage',ensureAuthenticated,(req,res) =>{
  var theme = jsonfile.readFileSync(themes);
  let fetchguilds = discord.client.guilds.fetch({ cache: true })

  // put all guilds in cache
  
  fetchguilds.then(() => {
      let guild = discord.client.guilds.cache.get(req.params.gid)

      // check if bot is in the guild

      if (!guild) {
        req.flash("error", "The bot isn't in this guild !")
        res.redirect(`/addbot/${req.params.gid}`)
      } 
        
      let user = guild.members.fetch(req.user.id).catch(console.log)

      // check if user is in the guild

      user.then((user) => {
        if (!user) {
          req.flash('error', 'You are not in this guild !')
          return res.redirect('/dash')
        } 

        // check if user has admin or manage guild permissions
        
        let managePerm = Permissions.FLAGS.MANAGE_GUILD
        let adminPerm = Permissions.FLAGS.ADMINISTRATOR

        if (!user.permissions.has(managePerm) && !user.permissions.has(adminPerm) && !user.roles.highest.permissions.has(managePerm) && !user.roles.highest.permissions.has(adminPerm) && guild.ownerId !== req.user.id) {
            req.flash('error', 'You are allowed to manage this guild !')
            return res.redirect('/dash')
        }
        
          res.render('home/manage',{
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
          })
      })
  })
})

// EDIT GUILD NAME

router.post('/guild/:gid/name/edit', ensureAuthenticated,function(req, res) {
  let fetchguilds = discord.client.guilds.fetch({ cache: true })

  // put all guilds in cache
    
  fetchguilds.then(() => {
    let guild = discord.client.guilds.cache.get(req.params.gid)

    // check if bot is in the guild

    if (!guild) {
      req.flash("error", "The bot isn't in this guild !")
      res.redirect(`/addbot/${req.params.gid}`)
    } 

    let oldname = guild.name
    let name = req.body.guildname
      
    let user = guild.members.fetch(req.user.id).catch(console.log)

    // check if user is in the guild

    user.then((user) => {
      if (!user) {
        req.flash('error', 'You are not in this guild !')
        return res.redirect('/dash')
      } 
      
      // check if user has manage guild or admin permissions

      let managePerm = Permissions.FLAGS.MANAGE_GUILD
      let adminPerm = Permissions.FLAGS.ADMINISTRATOR

      if (!user.permissions.has(managePerm) && !user.permissions.has(adminPerm) && !user.roles.highest.permissions.has(managePerm) && !user.roles.highest.permissions.has(adminPerm) && guild.ownerId !== req.user.id) {
          req.flash('error', 'You are not allowed to manage this guild !')
          return res.redirect('/dash')
      }

      // try to change the name and handle error

      try {
        guild.setName(name)
      } catch (err) {
        if (err) {
          req.flash("error", `An error occured while changing the name of ${guild.name}. Error: \n ${err}`)
          return res.redirect(`/guild/${req.params.gid}/manage`)
        }
      }

      req.flash("success", `Successfully renamed guild "${oldname}" to "${name}" !`)
      return res.redirect(`/guild/${req.params.gid}/manage`)
    })
  })
})

// SET SYSTEM AND RULES CHANNELS

router.post('/guild/:gid/channels/set', ensureAuthenticated, (req, res) => {
  console.log(req.url)
  let gid = req.params.gid
  
  let rulesid = req.query.rules
  let systemid = req.query.system

  let fetchguilds = discord.client.guilds.fetch({ cache: true, withCounts: true })

  fetchguilds.then(() => {
    let guild = discord.client.guilds.cache.get(gid)
    // check if bot is in the guild

    if (!guild) {
      req.flash('error', "The bot isn't in this guild !")
      res.redirect(`/addbot/${gid}`)
    }

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
        let managePerm = Permissions.FLAGS.MANAGE_GUILD
        let adminPerm = Permissions.FLAGS.ADMINISTRATOR

        if (!user.permissions.has(managePerm) && !user.permissions.has(adminPerm) && !highest.permissions.has(managePerm) && !highest.permissions.has(adminPerm) && guild.ownerId !== req.user.id) {
            req.flash('error', 'You are not allowed to manage this guild !')
            return res.redirect('/dash')
        }

        let ruleschannel = guild.channels.fetch(rulesid)

        ruleschannel.then((ruleschannel) => {
          let systemchannel = guild.channels.fetch(systemid)

          systemchannel.then((systemchannel) => {
            guild.setRulesChannel(ruleschannel).catch(console.log)
            guild.setSystemChannel(systemchannel).catch(console.log)

            req.flash('success', `Sucessfully set guild ${guild.name} rules channel to ${ruleschannel.name} and system channel to ${systemchannel.name} !`)
            return res.redirect(`/guild/${gid}/manage`)
          })
      })
    })
  })
})

// UPLOAD ICON FOR GUILD

router.post('/guild/:gid/upload/icon', ensureAuthenticated,function(req, res) {
  let fetchguilds = discord.client.guilds.fetch({ cache: true })

  // put all guilds in cache

  fetchguilds.then(() => {
    const guild = discord.client.guilds.cache.get(req.params.gid)

    // check if bot is in the guild

    if (!guild) {
      req.flash('error', "The bot isn't in that guild !")
      return res.redirect(`/addbot/${req.params.gid}`)
    }  

    const fetchmembers = guild.members.fetch({ cache: true })

    // put all members in cache

    fetchmembers.then(() => {
      let user = guild.members.cache.get(req.user.id)

      // check if user is in the guild

      if (!user) {
        req.flash('error', 'You are not in that guild !')
        return res.redirect('/dash')
      }

      // check if user has manage guild or admin permissions

      let managePerm = Permissions.FLAGS.MANAGE_GUILD
      let adminPerm = Permissions.FLAGS.ADMINISTRATOR

      if (!user.permissions.has(managePerm) && !user.permissions.has(adminPerm) && !user.roles.highest.permissions.has(managePerm) && !user.roles.highest.permissions.has(adminPerm) && guild.ownerId !== req.user.id) {
          req.flash('error', 'You are not allowed to manage this guild !')
          return res.redirect('/dash')
      }

      // check if there are any files

      if (!req.files || Object.keys(req.files).length === 0) {
        return req.flash('error', `No file was uploaded, please try again!`), 
        res.redirect(`/guild/${req.params.gid}/manage`)
      } 

      let sampleFile = req.files.sampleFile;
      let path = `./icons/${sampleFile.name}`

      // if a file with that name isn't deleted, it deletes it

      if (fs.existsSync(path)) fs.rmSync(path)

      // temporarely move file to icons folder
      
      sampleFile.mv(path)

      // function to set the icon and then delete the file

      function seti(path) {
        guild.setIcon(path)
        delay(3000).then(() => { 
          fs.rmSync(path)
        })
      }

      // wait for the file to be uploaded and then use the function

      delay(3000).then(() => {
        seti(path)

        req.flash("success", `Icon ${sampleFile.name} uploaded sucessfully !`)
        return res.redirect(`/guild/${req.params.gid}/manage`)
      })
    })
  })
});

// UPLOAD BANNER FOR GUILD

router.post('/guild/:gid/upload/banner', ensureAuthenticated,function(req, res) {
  let fetchguilds = discord.client.guilds.fetch({ cache: true })

  // put all guilds in cache

  fetchguilds.then(() => {
    const guild = discord.client.guilds.cache.get(req.params.gid)
    
    // check if bot is in the guild

    if (!guild) {
      req.flash('error', "The bot isn't in that guild !")
      return res.redirect(`/addbot/${req.params.gid}`)
    }  

    // check if guild has 7 boosts boosts --> level 2 ( can have a banner or not )

    if (guild.premiumSubscriptionCount << 7) {
      req.flash('error', `${guild.name} doesn't have unlocked the banner ! Boost it to level 2 ( 7 boosts ) to unlock it.`)
      return res.redirect(`/guild/${req.params.gid}/manage`)
    }

    const fetchmembers = guild.members.fetch({ cache: true })

    // put all members in cache

    fetchmembers.then(() => {
      let member = guild.members.cache.get(req.user.id)

      // check if member is in the guild

      if (!member) {
        req.flash('error', 'You are not in that guild !')
        return res.redirect('/dash')
      }

      // check if member has manage guild or admin permissions

      let managePerm = Permissions.FLAGS.MANAGE_GUILD
      let adminPerm = Permissions.FLAGS.ADMINISTRATOR

      if (!member.permissions.has(managePerm) && !member.permissions.has(adminPerm) && !member.roles.highest.permissions.has(managePerm) && !member.roles.highest.permissions.has(adminPerm) && guild.ownerId !== req.user.id) {
          req.flash('error', 'You are not allowed to manage this guild !')
          return res.redirect('/dash')
      }

      // check if there are any files

      if (!req.files || Object.keys(req.files).length === 0) {
        return req.flash('error', `No file was uploaded, please try again!`), 
        res.redirect(`/guild/${req.params.gid}/manage`)
      } 
      
      let sampleFile = req.files.bannerFile;
      let path = `./banners/${sampleFile.name}`

      // if file with that name isn't deleted, it deletes it

      if (fs.existsSync(path)) fs.rmSync(path)

      // move the file to the temporary folder
      
      sampleFile.mv(path)

      // function to set banner

      function setb(path) {
        guild.setBanner(path)
        delay(3000).then(() => { 
          fs.rmSync(path)
        })
      }

      // wait for the file to upload and use the function

      delay(3000).then(() => {
        setb(path)

        req.flash("success", `Banner ${sampleFile.name} uploaded sucessfully !`)
        return res.redirect(`/guild/${req.params.gid}/manage`)
      })
    })
  })
});


module.exports = router;

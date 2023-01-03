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
const ppath = require("path");
const { count } = require('console');

router.get('/guild/:gid/manage',ensureAuthenticated,(req,res) =>{
    var theme = jsonfile.readFileSync(themes);
    let fetchguilds = discord.client.guilds.fetch()
    
    fetchguilds.then((gs) => {
        let guild = discord.client.guilds.cache.get(req.params.gid)

        let rauth = guild.members.fetch(req.user.id).catch(console.log)

        rauth.then((rauth) => {
          if (!rauth) {
            req.flash('error', 'You are not in this guild !')
            return res.redirect('/dash')
          }

          if (!rauth.permissions.has(Permissions.FLAGS.MANAGE_GUILD) && !rauth.permissions.has(Permissions.FLAGS.ADMINISTRATOR && rauth.id !== guild.ownerId)) {
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

router.post('/guild/:gid/name/edit', ensureAuthenticated,function(req, res) {
  let fetchguilds = discord.client.guilds.fetch()

    fetchguilds.then((gs) => {
      let guild = discord.client.guilds.cache.get(req.params.gid)

      let oldname = guild.name
      let name = req.body.guildname

      try {
        guild.setName(name)
      } catch (err) {
        if (err) {
          req.flash("error", `An error occured while changing the name of ${guild.name}. Error: \n ${err}`)
          return res.redirect(`/guild/${req.params.gid}/manage`)
        }
      }

      req.flash("success", `Successfully renamed "${oldname}" to "${name}" !`)
      return res.redirect(`/guild/${req.params.gid}/manage`)
    })
})




router.post('/guild/:gid/upload/icon', ensureAuthenticated,function(req, res) {
    function delay(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    } 

    if (!req.files || Object.keys(req.files).length === 0) {
      return req.flash('error', `No file was uploaded, please try again!`), 
      res.redirect(`/guild/${req.params.gid}/manage`)
    } 

    let ID = require('../Fonctions/createID')("ICON")
    
    ID.then((ID) => {

      const path = `./icons/${req.files.sampleFile.name}`
      let ext = ppath.extname(path)

      let fetchguilds = discord.client.guilds.fetch()
      let sampleFile = req.files.sampleFile;

      function check(path) {
        if(!fs.existsSync(path)) {
          let path2 = `./icons/${ID + ext}`
          let a = `./icons/${ID + ext}`
          sampleFile.rename(a, function(err) { if (err) throw err })
          sampleFile.mv(path2, function(err) { if (err) throw err })
          return path2
        } else {
          sampleFile.mv(path, function(err) {
            if (err) 
              return res.status(500).send(err);
          });
          return false
        }
      }

      delay(3000).then(() => {
    
        fetchguilds.then(() => {
    
          let guild = discord.client.guilds.cache.get(req.params.gid)
    
          if(check(path)) {
            guild.setIcon(path2)
            delay(3000).then(fs.unlinkSync(path2))
          } else {
            guild.setIcon(path)
            delay(3000).then(fs.unlinkSync(path))
          }
                  
          req.flash('success', `Icon ${sampleFile.name} successfully uploaded for guild ${guild.name}!`)
          res.redirect(`/guild/${req.params.gid}/manage`)
        })
      })
    })
});

router.post('/guild/:gid/upload/banner', ensureAuthenticated,function(req, res) {
  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  } 

  if (!req.files || Object.keys(req.files).length === 0) {
    return req.flash('error', `No file was uploaded, please try again!`), 
    res.redirect(`/guild/${req.params.gid}/manage`)
  } 

  let ID = require('../Fonctions/createID')("BANNER")
  
  ID.then((ID) => {

    const path = `./icons/${req.files.bannerFile.name}`
    let ext = ppath.extname(path)

    let fetchguilds = discord.client.guilds.fetch()
    let bannerFile = req.files.bannerFile;

    function check(path) {
      if(!fs.existsSync(path)) {
        let path2 = `./icons/${ID + ext}`
        let a = `./icons/${ID + ext}`
        bannerFile.rename(a, function(err) { if (err) throw err })
        bannerFile.mv(path2, function(err) { if (err) throw err })
        return path2
      } else {
        bannerFile.mv(path, function(err) {
          if (err) 
            return res.status(500).send(err);
        });
        return false
      }
    }

    delay(3000).then(() => {
  
      fetchguilds.then(() => {
  
        let guild = discord.client.guilds.cache.get(req.params.gid)
  
        if(check(path)) {
          guild.setBanner(path2)
          delay(3000).then(fs.unlinkSync(path2))
        } else {
          guild.setBanner(path)
          delay(3000).then(fs.unlinkSync(path))
        }
                
        req.flash('success', `Icon ${bannerFile.name} successfully uploaded for guild ${guild.name}!`)
        res.redirect(`/guild/${req.params.gid}/manage`)
      })
    })
  })
});


module.exports = router;

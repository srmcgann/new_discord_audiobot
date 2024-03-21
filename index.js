// Require the necessary discord.js classes
const { Client, Intents, Permissions } = require('discord.js');
const { token } = require('./config.json');
const { exec } = require('child_process');
var shellescape = require('shell-escape');
//const { fetch } = require('node-fetch@2');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const myIntents = new Intents(
  ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']
)

const client = new Client({ intents: myIntents });

function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, escape);
}

client.once('ready', c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

function escapeShellArg (arg) {
    return "'" + arg.split('').map(v=>v=="'"?'\'':v).join('') + "'";
}
String.prototype.replaceAll = function (target, payload) {
    let regex = new RegExp(target, 'g')
    return this.valueOf().replace(regex, payload)
};

function makeDemoLink(code, message, extraText){
  var command
  exec(command = "php dweet.php " + escapeShellArg(code.replaceAll("'", "`")), (error, stdout, stderr)=>{
    if (error) {
      console.log('error')
      console.log(command)
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log('std error')
      console.log('command: ' + command)
      console.log(`stderr: ${stderr}`)
      return
    }
    if(stdout){
      console.log(command)
      let shortLink = 'https://whr.rf.gd/shorty/' + stdout.split("\n")[0] + extraText
      let send = shortLink
      message.channel.send(send)
    }
  })
}

makeShortLink=(url, message, extraText)=>{
  exec(command = 'curl -s \'https://whr.rf.gd/shorty/shorty.php?' + (url.split(':http').join('http'))+"'", (error, stdout, stderr)=>{
    if (error) {
      console.log('error')
      console.log(command)
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log('stderror')
      console.log(command)
      console.log(`stderr: ${stderr}`)
      return
    }
    if(stdout){
      console.log(command)
      let shortLink = 'https://whr.rf.gd/shorty/' + stdout.split("\n")[0] + extraText
      let send = shortLink
      message.channel.send(send)
    }
  })
}


var mashword=[]

function getNewMash(str, message){
  let meta = ''
  let chan = message.channel.guild.name
  let scrambleLength = typeof mashword[chan] !== 'undefined' ? mashword[chan].scrambleLength : ''
  console.log(str)
  if((+str)>1 && (+str)<=10){
    scrambleLength = ' '+str
    meta = '    (the scramble length has been set to' + scrambleLength + ")"
  }
  exec('php masher.php newmash' + scrambleLength, (error, stdout, stderr) => {
    let v=stdout.split("\n")
    mashword[chan] = {answer: v[0].trim(), scramble: v[1], scrambleLength}
    //serverRaw('PRIVMSG ' + chan + ' :a new scramble is served!  ->  ' + v[1] + meta + "\r\n")
    message.channel.send('a new scramble is served!  ->  ' + v[1] + meta)
  })
}

function wordcombos (letters) {
  let result
  if (letters.length <= 1) {
    result = letters
  } else {
    result = []
    for (let i = 0; i < letters.length; ++i) {
      let firstword = letters[i]
      let remainingletters = []
      for (let j = 0; j < letters.length; ++j) {
        if ( i != j ) remainingletters.push(letters[j])
      }
      let combos = wordcombos(remainingletters)
      for (let j = 0; j < combos.length; ++j) {
        result.push(firstword + combos[j])
      }
    }
  }
  return result
}

function checkMash(str, message, chatter){
  let chan = message.channel.guild.name
  let answer = mashword[chan].answer.toUpperCase().split('')
  let guess = str.trim().toUpperCase()
  let wc = wordcombos(answer)
  if(guess.length !== answer.join('').length || (wc.indexOf(guess)===-1)){
    serverRaw('PRIVMSG ' + chan + ' :Oops! you\'re not using the correct letters!  current scramble  ->  ' + mashword[chan].scramble + "\r\n");
    message.channel.send('Oops! you\'re not using the correct letters!  current scramble  ->  ' + mashword[chan].scramble)
  } else {
    if(guess == answer.join('')){
      exec('php incrscore.php ' + chatter, (error, stdout, stderr) => {
        let score = stdout
        message.channel.send('**CORRECT!**    "' + guess + '"     ' + chatter + ' score: ' + score)
        getNewMash('', message)
      })
    }
  }
}

function wordmash(msg, message, chatter){
  let chan = message.channel.guild.name
  let str = msg.trim().substring(10)
  if(Object.keys(mashword).length && typeof mashword[chan] !== 'undefined' && mashword[chan].scramble.length){
    switch(str.split(' ')[0].toUpperCase()){
      case 'STOP':
        message.channel.send('scramble stopped... ')
        mashword[chan] = {answer: '', scramble: '', scrambleLength: mashword[chan].scrambleLength}
      break
      case 'RESET':
        let l
        getNewMash((l=str.split(' '))[l.length-1], message)
      break
      case 'HINT':
        message.channel.send("the current answer is: " + mashword[chan].answer.split('').map((v,i,a)=>i<=a.length/2?'\\*':v).join(''))
      break
      default:
        if(str.length<1 || !str){
          message.channel.send("the current scramble is: " + mashword[chan].scramble)
        }else{
          checkMash(str, message, chatter)
        }
      break
    }
  }else{
    getNewMash(str, message)
  }
}

addTrackByYTID=(videoID, message)=>{
  let chan=message.channel.guild.name
  let command
  exec(command = "php addTrack.php " + videoID + " '" + chan.split('').filter(v=>v!='#').join('')+"'", (error, stdout, stderr) => {
    if (error) {
      console.log(command)
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(command)
      console.log(`stderr: ${stderr}`)
      return
    }
    if(stdout){
      let res = JSON.parse(stdout)
      let trackTitle = res[2]
      let trackDescription = res[3].split('').filter((v,i)=>i<200).join('') + (res[3].length>200 ? '...' : '')
      let hours = res[4].length == 1 ? '0' + res[4] : res[4]
      let minutes = res[5].length == 1 ? '0' + res[5] : res[5]
      let seconds = res[6].length == 1 ? '0' + res[6] : res[6]
      let thumbnail = res[7]
      exec('curl -s https://whr.rf.gd/shorty/shorty.php?https://audiobot.dweet.net/'+fixedEncodeURIComponent(chan.split('').filter(v=>v!='#').join(''))+'/t/' + fixedEncodeURIComponent(res[1]), (error, stdout, stderr)=>{
        if (error) {
          console.log(`error: ${error.message}`)
          return
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`)
          return
        }
        if(stdout){
          let shortLink = 'https://whr.rf.gd/shorty/' + stdout.split("\n")[0]
          let send = thumbnail
          send += '\naudio only for "' + trackTitle + "\"\n" + shortLink
          send += '\nduration: ' + hours + ':' + minutes + ':' + seconds
          send += '\nchannel playlist: https://audiobot.dweet.net/' + fixedEncodeURIComponent(chan.split('').filter(v=>v!='#').join(''))
          //"https://youtu.be/" + videoID
          // for https://youtu.be/' + l
          //serverRaw('PRIVMSG ' + chan + ' :' + send + "\r\n")
          message.channel.send(send)
        }
      })
    } else {
      console.log('word not found :(')
    }
  })
}

queueTrack=(searchString, message)=>{
  let chan=message.channel.guild.name
  exec(command = 'curl -s \'https://audiobot.dweet.net/autoSearch.php?sparam=' + fixedEncodeURIComponent(searchString.replaceAll("'", '')) + "'", (error, stdout, stderr)=>{
    if (error) {
      console.log('error')
      console.log(command)
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log('stderror')
      console.log(command)
      console.log(`stderr: ${stderr}`)
      return
    }
    if(stdout){
      console.log(command)
      let res = JSON.parse(stdout)
      if(res[0]){
        message.channel.send('request queued. uno momento...  :clock230:')
        addTrackByYTID(res[1], message)
      }else{
        message.channel.send('hrm... something went wonky :(')
      }
    }
  })
}

async function imgToAscii(img, chan){
  let ret = []
  await exec(shellescape(('php getImageSize.php ' + img).split(' ')), async (error, stdout, stderr) => {
    await stdout.split("\n").map(async function (v){
      if(v.length>3){
        let dimensions=JSON.parse(v)
        let width = Math.max(1920, dimensions['0'])
        let height = width / (dimensions['0'] / dimensions['1'])
        let sendData = {
          img,
          delay: 2000,
          width,
          height
        }
        const response = await fetch('https://audiobot.dweet.net/imgToAscii.php', {
          method: 'post',
          body: JSON.stringify(sendData),
          headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        //console.log(data)
        if(data[0]){
          //console.log(data[1])
          makeShortLink(data[1], chan, " <- ascii")
        }else{
          //console.log('fail'+"\n")
        }
      }
    })
  })
}


function whr(msg, chan){
  let str = msg.substring(5).replaceAll('`', '').replaceAll('@everyone', '').replaceAll('@here', '')
  exec('php whr.php ' + "'"+str.replaceAll("'", '\\\'') + "'", (error, stdout, stderr) => {
    maxd=-6e6
    let out = stdout.split("\n")
    out=out.map(v=>{
      tc=0
      while(v.length<maxd && tc<1000){
        tc++
        v=v+' '
      }
      return v
    })
    out=out.join("\n")
    chan.send("...\n"+out)
  })
}



function cowsay(msg, chan){
  let str = msg.substring(8).replaceAll('`', '').replaceAll('@everyone', '').replaceAll('@here', '')
  let pref = ''
  let a = ''
  if(str.indexOf('-f ') != -1){
    str.split(' ').map((v,i)=>{
      if(i<2){
       pref += v + ' '
      } else{
        a += v + ' '
      }
    })
    str = a
  }
  exec('/usr/games/cowsay ' + pref + "'"+str.replaceAll("'", '\\\'') + "'", (error, stdout, stderr) => {
    maxd=-6e6
    let out = stdout.split("\n").map(v=>{
      v = v.replaceAll("`","'")
      v = '  ' + v + '  '
      if(v && v.length>maxd) maxd=v.length
      return v
    })
    out=out.map(v=>{
      tc=0
      while(v.length<maxd && tc<1000){
        tc++
        v=v+' '
      }
      return v
    })
    out=out.join("\n")
    chan.send("...\n`"+out+"`")
  })
}

client.on("messageCreate", async (message) => {
  if(message.author.username=='audiobot') return
  if(message.content=='moo')message.channel.send('who let the cows out?')


  msg=message.content
  chan=message.channel.guild.name == '𝐍𝐎𝐓𝐂𝐎𝐑𝐏' ? 'NOTCORP' : message.channel.guild.name

  let dotCommand = ''
  if(msg.indexOf('.') == 0) dotCommand = msg.split('.')[1].toLowerCase().split(' ')[0]
  let chatter = message.author.username
  if(
    dotCommand == 'wavevid' ||
    dotCommand == 'wavepic' ||
    dotCommand == 'wavey' ||
    dotCommand == 'ascii' ||
    dotCommand == 'matrix' ||
    dotCommand == 'scanlines' ||
    dotCommand == 'whr' ||
    dotCommand == 'demo' ||
    dotCommand == 'play' ||
    dotCommand == 'shim' ||
    dotCommand == 'cows' ||
    dotCommand == 'scramble' ||
    dotCommand == 'd' ||
    dotCommand == 'hint' ||
    dotCommand == 'emphasis' ||
    dotCommand == 'emphasize' ||
    dotCommand == 'superimpose' ||
    dotCommand == 'cowsay' ||
    dotCommand == 'twirl' ||
    dotCommand == 'efx' ||
    dotCommand == 'vignette'){
    turl = msg.split(' ').length && msg.split(' '). length > 1 ? msg.split(' ')[1] : ''
    switch(dotCommand){
      case 'wavey':
        makeShortLink('https://srmcgann.github.io/efx/' + turl + (msg.indexOf('?')==-1 ? '?' : '&') + 'wavey', message, " <- wavy version :D")
      break
      case 'wavevid':
        makeShortLink('https://srmcgann.github.io/efx/' + turl + (msg.indexOf('?')==-1 ? '?' : '&') + 'wavey', message, " <- wavy version :D")
      break
      case 'wavepic':
        makeShortLink('https://srmcgann.github.io/efx/' + turl + (msg.indexOf('?')==-1 ? '?' : '&') + 'wavey', message, " <- wavy version :D")
      break
      case 'scramble':
        wordmash( msg, message, chatter)
      break
      case 'whr':
        whr(msg, message.channel)
      break
      case 'shim':
        message.channel.send('https://srmcgann.github.io/assets/1sZpDV.jpg')
      break
      case 'cows':
        message.channel.send('https://srmcgann.github.io/assets/2wWzJ.jpg')
      break
      case 'hint':
        wordmash('.scramble hint', message, chatter)
      break
      case 'superimpose':
        makeShortLink('https://superimpose.dweet.net/' + turl, message, " <- superimposed :D")
      break
      case 'cowsay':
        cowsay(msg, message.channel)
      break
      case 'vignette':
        makeShortLink('https://efx.dweet.net/' + turl + (msg.indexOf('?')==-1 ? '?' : '&') + 'vignette', message, " <- vignette")
      break
      case 'demo':
        makeDemoLink(msg.substring(6), message, " <- demo")
        return
      break
      case 'play':
        queueTrack(msg.substring(6), message)
        return
      break
      case 'd':
        makeDemoLink(msg.substring(3), message, " <- demo")
        return
      break
      case 'emphasize':
        makeShortLink('https://emphasis.bizuit.com/?c=' + fixedEncodeURIComponent(msg.substring(11).substr(0, 250).replaceAll("'", '')), message, " <- emphasis :D")
      break
      case 'emphasis':
        makeShortLink('https://emphasis.bizuit.com/?c=' +  fixedEncodeURIComponent(msg.substring(10).substr(0, 250).replaceAll("'", '')), message, " <- emphasis :D")
      break
      case 'ascii':
        imgToAscii(turl, message)
      break
      case 'twirl':
        makeShortLink('https://srmcgann.github.io/efx/' + turl + (msg.indexOf('?')==-1 ? '?' : '&') + 'twirl', message, " <- twirl")
      break
      case 'scanlines':
        makeShortLink('https://srmcgann.github.io/efx/' + turl + (msg.indexOf('?')==-1 ? '?' : '&') + 'scanlines', message, " <- scanlines")
      break
      case 'matrix':
        makeShortLink('https://srmcgann.github.io/efx/' + turl + (msg.indexOf('?')==-1 ? '?' : '&') + 'matrix', message, " <- matrix")
      break
      case 'efx':
        makeShortLink('https://srmcgann.github.io/efx/' + turl, message, " <- efx")
      break
    }
  } else { // auto stuff
    msg.split(' ').map((v,i)=>{
      if(v.indexOf('https://wavepic')==-1 && v.indexOf('https://efx')==-1 && v.toLowerCase().indexOf('https://')!== -1 && (v.toLowerCase().indexOf('.jpg')!==-1 || v.toLowerCase().indexOf('.png')!==-1 || v.toLowerCase().indexOf('.gif')!==-1)){
        makeShortLink('https://wavepic.dweet.net/' + v, message, " <- wavy version :D")
      }
      if(v.indexOf('https://wavevid')==-1 && v.indexOf('https://efx')==-1 && v.toLowerCase().indexOf('https://')!== -1 && (v.toLowerCase().indexOf('.webm')!==-1 || v.toLowerCase().indexOf('.mp4')!==-1)){
        makeShortLink('https://wavevid.dweet.net/' + v, message, " <- wavy version :D")
      }
    })
  }

  if(dotCommand == 'coinflip' || dotCommand == 'coin' || dotCommand == 'flip' || dotCommand == 'toss'){
    exec('php coinflip.php' , (error, stdout, stderr) => {
      if (0 && error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (0 && stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      if(stdout){
        let img = stdout
        message.channel.send(img);
      }
    })
  }

  if(dotCommand == 'quiz'){
    const quiz = require('./quiz.json');
    const item = quiz[Math.floor(Math.random() * quiz.length)];
    const filter = response => {
      return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
    };

    message.reply(item.question, { fetchReply: true })
      .then(() => {
        message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            score = 0
            exec(`php quiz.php '${collected.first().author}'` , (error, stdout, stderr) => {
              if (error) {
                console.log(`error: ${error.message}`)
                return
              }
              if (stderr) {
                console.log(`stderr: ${stderr}`)
                return
              }
              if(stdout){
                score = stdout
                message.channel.send(`${collected.first().author} got the correct answer!\n${collected.first().author} score: ${score}`);
              }
            })
          })
          .catch(collected => {
            message.channel.send('Looks like nobody got the answer this time.');
          });
      });
  }




  let l=false
  if((msg.toLowerCase()).indexOf(l='.wordle ')!==-1){
    params = msg.toLwerCase().split(' ').filter(v=>v)
    knownLetters = params[1]
    placement = params[2]
  }
  if((msg.toLowerCase()).indexOf(l='https://www.youtube.com')!==-1
    || (msg.toLowerCase().indexOf(l='https://youtu.be')!==-1
  )){
    let sendData = {playlist: chan}
    console.log(sendData)
    const response = await fetch('https://audiobot.dweet.net/create.php', {
      method: 'post',
      body: JSON.stringify(sendData),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    if(data[0]){
      let link = ((msg.substring(msg.indexOf(l)).trim())).split(' ')[0]
      l=''
      if((l=link.split('?')).length){
        l=l.filter(v=>v.indexOf('v=')!==-1)
        if(l.length) l=l[l.length-1].split('v=')[1].split('&')[0]
      }
      if(!l || !l[0]){
        l=link.split('/')
        l=l[l.length-1]
      }
      let videoID = l
      if(videoID.length >= 8 && videoID.length <=15){
        addTrackByYTID(videoID, message)
      }
    }
  }
});

client.on('interactionCreate', async interaction => {


  if(!interaction.isCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (commandName === 'server') {
    await interaction.reply('Server info.');
  } else if (commandName === 'user') {
    await interaction.reply('User info.');
  } else if (commandName === 'quiz') {
    const quiz = require('./quiz.json');
    const item = quiz[Math.floor(Math.random() * quiz.length)];
    const filter = response => {
      return item.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
    };

    interaction.reply(item.question, { fetchReply: true })
      .then(() => {
        interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            score = 0
            exec(`php quiz.php '${collected.first().author}'` , (error, stdout, stderr) => {
              if (error) {
                console.log(`error: ${error.message}`)
                return
              }
              if (stderr) {
                console.log(`stderr: ${stderr}`)
                return
              }
              if(stdout){
                score = stdout
                interaction.followUp(`${collected.first().author} got the correct answer!\n${collected.first().author} score: ${score}`);
              }
            })
            //interaction.followUp(`${collected.first().author} got the correct answer!\n${collected.first().author} score: ${score}`);
          })
          .catch(collected => {
            interaction.followUp('Looks like nobody got the answer this time.');
          });
      });
  }
});

client.login(token);

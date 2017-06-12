const Discord = require('discord.js');
const client = new Discord.Client();
var fs = require('fs');
//mysql
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '',
  user     : '',
  password : '',
  database : ''
});
connection.connect();

var prefix = "#"
var pitanja = 4630; //broj pitanja
var v_pit = 15000; // delay do novog pitanja
var v_odg = 13000 // vreme za koje odgovara bot
var v_pom = 5000 // vreme do prve pomoci
var v_pom_o = 3000 // vreme do ostalih pomoci
var odgovor; //odgovor
var modgovor;
var channelID = "319538617636749313";

client.on('ready', () => {
  opleti()
});
function pomoc(){
      if(modgovor){
      var pomoc = Math.round(odgovor.length/3)
      client.channels.get(channelID).sendMessage("```http"+ "\n" + "Pomoć: " + odgovor.substring(0, pomoc) + "...```");
    }
      
}
    function odgovori(){
      if(modgovor){
      client.channels.get(channelID).sendMessage("```css" + "\n" + "Odgovor: " + odgovor + "```");
      }
      modgovor = false;
    }
function opleti(){
  clearTimeout(opleti);
  clearTimeout(pomoc);
  clearTimeout(odgovori);

  get_line('./kreni.txt', Math.floor(Math.random() * pitanja), function(err, line){
    var split = line.split("#")
    //posalji pitanje
    client.channels.get(channelID).sendMessage("```markdown" + "\n" + "<Pitanje: " + split[0] + ">```");
    odgovor = split[1];


  modgovor = true;

  setTimeout(opleti, v_pit);
  setTimeout(pomoc, v_pom);
  setTimeout(odgovori, v_odg);

  });
}
  


client.on('message', message => {
  //ako korisnik ukuca odgovor
  if(modgovor){
    //message.content.toUpperCase() === odgovor.toUpperCase() && 
    if (message.content.toUpperCase() === odgovor.toUpperCase() && message.author.id != client.user.id) {
      odgovor = ""
      //mysql
        var queryTP = connection.query('select * from poeni ORDER BY poeni DESC', function(err, rows){
            
            //infexOf za Array sa objektima
            var index = rows.map(function(e) { return e.user_id; }).indexOf(message.author.id);
            //ako ga ima u bazi
            if(index !== -1){
              var getpoeni = parseFloat(rows[index].poeni + 1);
              var getrank = parseFloat(index + 1);
              var query = connection.query('UPDATE poeni SET poeni = poeni + 1 WHERE user_id = ? ', [message.author.id]);
              client.channels.get(channelID).sendMessage('Bravo ' + message.author + "; Poeni: " + getpoeni + ", Rank: #" + getrank);
              //ako ga nema
            }else{
              var post  = {korisnik: message.author.username, user_id: message.author.id,avatar: message.author.avatarURL, poeni: 1};
              var query = connection.query('INSERT INTO poeni SET ?', post);
              client.channels.get(channelID).sendMessage('Bravo ' + message.author + "; Poeni: " + 1 + ", Rank: #" + rows.length);
            }
          


    });
      client.user.setGame("Uručuje knjigu " + message.author.username);
      modgovor = false;
    }
  }
    if (message.content === prefix + 'top10') {
    	var query = connection.query('select * from poeni order by poeni DESC limit 10',function(err, rows){
    		client.channels.get(channelID).sendMessage("```xl" + "\n" + "1." + rows[0].korisnik + "         " + rows[0].poeni + "\n" + 
    												     "2." + rows[1].korisnik + "         " + rows[1].poeni + "\n" +
    												     "3." + rows[2].korisnik + "         " + rows[2].poeni + "\n" +
    												     "4." + rows[3].korisnik + "         " + rows[3].poeni + "\n" +
    												     "5." + rows[4].korisnik + "         " + rows[4].poeni + "\n" +
    												     "6." + rows[5].korisnik + "         " + rows[5].poeni + "\n" +
    												     "7." + rows[6].korisnik + "         " + rows[6].poeni + "\n" +
    												     "8." + rows[7].korisnik + "         " + rows[7].poeni + "\n" +
    												     "9." + rows[8].korisnik + "         " + rows[8].poeni + "\n" +
    												     "10." + rows[9].korisnik + "         " + rows[9].poeni + "\n" + "```");
    	});
    }
    //pravila
    if(message.content === prefix + 'pravila'){
      message.author.send('__**Pravila:**__'+ "\n" +'1. Zabranjeno je vredanje clanova po verskoj, nacionalnoj ili bilo kojoj drugoj osnovi.' + "\n" + 
          '2. Zabranjeno je reklamiranje, komercijalne poruke.' + "\n" +
          '3. Nije zabranjeno pokretati politicke teme u #general, kanali ispod #general služe ukoliko želite da link ili informacija ostane vidljiva ostalim clanovima i posle nekog vremena.' + "\n" +
          '4. Komande bota i slicne spamerske poruke, koje se nikog ne tiču, slati u #spam.' + "\n" +
          '5. Kanal #pitanja-odgovori služi za pitanja clanova ostalim clanovima, jedna vrsta poll-a. Pitanja za admina slati privatnom porukom @Deda#9532 .' + "\n" + 
          '6. Zabranjeno je obelodavanje ličnih podataka drugih korisnika bez njihove saglasnosti.');
    }
});

//funkcija za vadjenje odgovora get_line('./file.txt', 1, function(err, line){
function get_line(filename, line_no, callback) {
    var data = fs.readFileSync(filename, 'utf8');
    var lines = data.split("\n").map(line => line.trim());

    if(+line_no > lines.length){
      throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);
}



client.login('token');


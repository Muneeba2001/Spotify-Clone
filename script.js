console.log("Let's start javascript");
let currentSong = new Audio();
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
   if (isNaN(seconds) || seconds < 0) {
      return "00:00";
   }
   const minutes = Math.floor(seconds / 60);
   const remainingSeconds = Math.floor(seconds % 60);

   const formattedMinutes = String(minutes).padStart(2, '0');
   const formattedSeconds = String(remainingSeconds).padStart(2, '0');
   return `${formattedMinutes}: ${formattedSeconds}`;
}

async function getSong(folder) {
   currFolder = folder;
   let a = await fetch(`http://127.0.0.1:5501/${folder}/`)
   let response = await a.text();
   let div = document.createElement("div")
   div.innerHTML = response;
   let as = div.getElementsByTagName("a")
   songs = []
   for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mpeg"))  {
         songs.push(element.href.split(`/${folder}/`)[1])

      }

   }

   let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
   songUL.innerHTML = ""
   for (const song of songs) {
      songUL.innerHTML = songUL.innerHTML + `<li>
      
    
      <img src="music.svg" alt="music" class="invert">
      <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          
      </div>
      <div class="playnow">
      <span>Play Now</span>
      <img src="play.svg" alt="play" class="invert">
      </div>
       </li>` ;
   }
   Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
      e.addEventListener("click", element => {
         
         playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        
      })
   })
  

}

const playmusic = (track, pause = false) => {

   currentSong.src = `/${currFolder}/` + track
   if (!pause) {
      play.src = "pause.svg"
      currentSong.play()
   }

   document.querySelector(".songinfo").innerHTML = decodeURI(track)
   document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
   let a = await fetch(`http://127.0.0.1:5501/songs/`)
   let response = await a.text();
   let div = document.createElement("div")
   div.innerHTML = response;
   let anchors = div.getElementsByTagName("a")
   let cardContainer = document.querySelector(".cardContainer")
   let array=  Array.from(anchors)
  
   for (let index = 0; index < anchors.length; index++) {
      let e = anchors[index];
      if (e.href.includes("/songs")&& !e.href.includes(".htaccess")) {
          let folder = e.href.split("/").slice(-1)[0];
          try {
              let albumResponse = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
              let albumData = await albumResponse.json();
              cardContainer.innerHTML += `
                  <div data-folder="${folder}" class="card">
                      <div class="play">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                              fill="#000">
                              <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5"
                                  stroke-linejoin="round" />
                          </svg>
                      </div>
                      <img src="/songs/${folder}/cover.jpg" alt="controls">
                      <h2>${albumData.title}</h2>
                      <p>${albumData.description}</p>
                  </div>`;
          } catch (error) {
              console.error("Error fetching album data:", error);
          }
      }
  }

   
   // Load the playlist whenever card is clicked
   Array.from(document.getElementsByClassName("card")).forEach(e => { 
      e.addEventListener("click", async item => {
          console.log("Fetching Songs")
          songs = await getSong(`songs/${item.currentTarget.dataset.folder}`)  
          playmusic(songs[0])
     })
      })
}
     
async function main() {

   await getSong("songs/ncs")
   
   playmusic(songs[0], true)

   // Display All the albums on the page
   await displayAlbums()

   play.addEventListener("click", () => {
      if (currentSong.paused) {
         currentSong.play()
         play.src = "pause.svg"
      }
      else {
         currentSong.pause()
         play.src = "play.svg"
      }
   })

   currentSong.addEventListener("timeupdate", () => {
      console.log(currentSong.currentTime, currentSong.duration);
      document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/ ${secondsToMinutesSeconds(currentSong.duration)}`;
      document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
   })

   document.querySelector(".seekbar").addEventListener("click", e => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      currentSong.currentTime = ((currentSong.duration) * percent) / 100
   })

   document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0"
   })

   document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-110%"
   })

   previous.addEventListener("click", () => {
      currentSong.pause()
      console.log("previous clicked")
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
      if ((index - 1) >= 0) {
         playmusic(songs[index - 1])
      }
   })

   next.addEventListener("click", () => {
      currentSong.pause()
      console.log("next clicked")
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
      if ((index + 1) < songs.length) {
         playmusic(songs[index + 1])
      }
   })

   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      console.log("Settimg Volume to", e.target.value)
      currentSong.volume = parseInt(e.target.value) / 100
      if(currentSong.volume>0){
         document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
      }
   })

   //Add event Listener to mute the track
   document.querySelector(".volume>img").addEventListener("click", e => {
      console.log("changing", e.target.src)
      if (e.target.src.includes("volume.svg")) {
         e.target.src = e.target.src.replace("volume.svg", "mute.svg")
         currentSong.volume = 0;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }
      else {
         e.target.src = e.target.src.replace("mute.svg", "volume.svg")
         currentSong.volume = .10;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }
   })

}
main()


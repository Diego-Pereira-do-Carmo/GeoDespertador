const confirmacao = document.getElementById('confirmacao');

// Define as coordenadas do endereço desejado
let targetCoords = '';
const alarme = new Audio('./sound/alarme.mp3');
// Configura as opções para a notificação
const notificationOptions = {
  body: 'Você está aproximadamente à 500 metros do endereço desejado!',
  icon: './compass.png'
};


window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "2002682b-5624-4182-ae42-c250745a64df",
  });
});


const btnBusca = document.getElementById('btnBusca');

btnBusca.addEventListener('click', convertAdressInCoords)


async function convertAdressInCoords() {
  const targetAdress = document.getElementById('EnderecoInputLogin').value;
  const url = `https://nominatim.openstreetmap.org/search?q=${targetAdress}&format=json`;

  try {
    let response = await fetch(url);
    let data = await response.json();

    let latitudeConvert = data[0].lat;
    let longitudeConvert = data[0].lon;

    targetCoords = {
      latitude: latitudeConvert,
      longitude: longitudeConvert
    }
    handleCoords();
  } catch (error) {
    console.log('Coordenadas Não Encontradas Verifique o Endereço')
  }
}


async function handleCoords() {
  navigator.geolocation.getCurrentPosition((position) => {
    let currentLatitude = position.coords.latitude;
    let currentLongitude = position.coords.longitude;
    renderMap(currentLatitude, currentLongitude, targetCoords.latitude, targetCoords.longitude);
  })
}

function monitorarLocalizacao() {
  // Monitora a localização do dispositivo em tempo real
  const watchID = navigator.geolocation.watchPosition(function (position) {
    // Obtém as coordenadas atuais do dispositivo
    const currentCoords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    // function updateMarker(currentLatitude, currentLongitude) {
    //   let latlng = L.latLng(currentLatitude, currentLongitude);
    //   let marker = L.marker([latitude, longitude]).addTo(map);
    //   marker.setLatLng(latlng);
    // }
    // updateMarker(currentCoords.latitude, currentCoords.longitude)

    // Calcula a distância entre as coordenadas atuais e as do endereço desejado
    const distance = geolib.getDistance(currentCoords, targetCoords);

    // Verifica se o dispositivo está a menos de 100 metros do endereço desejado
    if (distance < 500) {
      // Envia uma notificação para o usuário
      navigator.vibrate([500, 200, 500]);
      
      alarme.play();
      Notification.requestPermission().then(permission => {
        if (permission == 'granted') {
          new Notification('Você chegou ao seu destino!', notificationOptions);
        }
      });
      navigator.geolocation.clearWatch(watchID);
    }
  })
}



function renderMap(fromLatitude, fromLongitude, toLatitude, toLongitude) {
  var map = L.map("mapid").setView([fromLatitude, fromLongitude], 13); 
  // 13
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data &copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);

  L.Routing.control({
    waypoints: [
      L.latLng(fromLatitude, fromLongitude),
      L.latLng(toLatitude, toLongitude),
    ],
    router: new L.Routing.OSRMv1({
      serviceUrl: "https://router.project-osrm.org/route/v1/",
      profile: "foot",
    }),
  }).addTo(map);
  monitorarLocalizacao();
}
const fs = require('fs');
const path = require('path');

// 1. Read existing registrations to preserve any checkin or evidence already performed
let existing = [];
const storageFile = path.join(__dirname, '../data_storage/registrations.json');
if (fs.existsSync(storageFile)) {
  try {
    existing = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
  } catch (e) {}
}

const existingByDni = new Map();
existing.forEach(r => {
  if (r.documentNumber) {
    existingByDni.set(String(r.documentNumber).trim(), r);
  }
});

// Full 81 registrations extracted from Google Form responses
const rawRegistrations = [
  // 1 to 30 (previously registered)
  {
    num: 1,
    name: 'Rafael Vásquez Chumbe',
    dni: '993778180',
    phone: '993778180',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-03T16:51:47.000Z'
  },
  {
    num: 2,
    name: 'Greys Ríos Lozano',
    dni: '957342934',
    phone: '957342934',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-04T16:20:39.000Z'
  },
  {
    num: 3,
    name: 'María Teresa Más Noriega',
    dni: '47605471',
    phone: '914759341',
    city: 'Rioja',
    team: 'Rioja Runners',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-06T10:12:46.000Z'
  },
  {
    num: 4,
    name: 'Azucena Fasabi Sangama',
    dni: '76505603',
    phone: '931929386',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-07T11:34:47.000Z'
  },
  {
    num: 5,
    name: 'Adrian Alexander Vásquez López',
    dni: '73710608',
    phone: '935741978',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-07T13:24:24.000Z'
  },
  {
    num: 6,
    name: 'Damaris Rubid Rojas Peso',
    dni: '47280343',
    phone: '917797976',
    city: 'Rioja',
    team: 'Rioja Runners',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-08T10:24:48.000Z'
  },
  {
    num: 7,
    name: 'Katia Verónica Zapata Barreto',
    dni: '73017454',
    phone: '944470185',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-08T23:34:43.000Z'
  },
  {
    num: 8,
    name: 'Anghie Villoslada Rosales',
    dni: '73113174',
    phone: '918417221',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Sí',
    modality: 'Presencial',
    date: '2026-10-09T15:03:16.000Z'
  },
  {
    num: 9,
    name: 'Branh Jesús Campos Jibaja',
    dni: '75113487',
    phone: '913505886',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Sí',
    modality: 'Presencial',
    date: '2026-10-09T15:09:56.000Z'
  },
  {
    num: 10,
    name: 'José Vancho Villanueva',
    dni: '47154971',
    phone: '915198106',
    city: 'Nueva Cajamarca',
    team: 'Independiente',
    costume: 'Sí',
    modality: 'Presencial',
    date: '2026-10-10T13:00:05.000Z'
  },
  {
    num: 11,
    name: 'Katherine Meléndez Valdiviezo',
    dni: '47274453',
    phone: '938133069',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-11T09:02:42.000Z'
  },
  {
    num: 12,
    name: 'Olenka Nicoll Mori Reátegui',
    dni: '72651665',
    phone: '934072180',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-11T15:22:13.000Z'
  },
  {
    num: 13,
    name: 'Maruja Mori Reátegui',
    dni: '72766732',
    phone: '924779388',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-11T23:12:51.000Z'
  },
  {
    num: 14,
    name: 'Vilma Rojas Fernández',
    dni: '48752311',
    phone: '978321910',
    city: 'Rioja',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-12T14:08:18.000Z'
  },
  {
    num: 15,
    name: 'Fiona Mori Reátegui',
    dni: '72651664',
    phone: '983593490',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Ninguna',
    modality: 'Presencial',
    date: '2026-10-12T19:30:21.000Z'
  },
  {
    num: 16,
    name: 'Vivian Yndira Coral Vargas',
    dni: '71905684',
    phone: '902385556',
    city: 'Lamas',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-13T13:32:15.000Z'
  },
  {
    num: 17,
    name: 'Maryury Azañero Montero',
    dni: '73448762',
    phone: '963628882',
    city: 'Nueva Cajamarca',
    team: 'Independiente',
    costume: 'Sí',
    modality: 'Presencial',
    date: '2026-10-13T22:29:37.000Z'
  },
  {
    num: 18,
    name: 'Mario Amilcar Herrera Ramaycuna',
    dni: '70808417',
    phone: '942352936',
    city: 'Chachapoyas',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-14T10:07:15.000Z'
  },
  {
    num: 19,
    name: 'Margarita del Carmen Salazar Vásquez',
    dni: '45272432',
    phone: '958851199',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-14T14:27:23.000Z'
  },
  {
    num: 20,
    name: 'Arnold Saboya Fatama',
    dni: '76868738',
    phone: '973112877',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-14T19:03:46.000Z'
  },
  {
    num: 21,
    name: 'Edwar Chapa Chinchay',
    dni: '70660275',
    phone: '925389912',
    city: 'Tarapoto',
    team: 'Team Esparta',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-14T20:23:24.000Z'
  },
  {
    num: 22,
    name: 'Anahí Alexandra Pancca Suasaca',
    dni: '75452617',
    phone: '946943150',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Ninguna',
    modality: 'Presencial',
    date: '2026-10-15T11:25:23.000Z'
  },
  {
    num: 23,
    name: 'Jack Gómez Arévalo',
    dni: '61034559',
    phone: '932691523',
    city: 'Rioja',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-15T11:44:42.000Z'
  },
  {
    num: 24,
    name: 'Yuriko Mendoza Pinedo',
    dni: '61290371',
    phone: '943362853',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-15T12:26:22.000Z'
  },
  {
    num: 25,
    name: 'Jenniffer Delgado Vela',
    dni: '71781997',
    phone: '980180274',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-15T15:37:54.000Z'
  },
  {
    num: 26,
    name: 'Mark Antoni Rojas Guerrero',
    dni: '60715590',
    phone: '960565806',
    city: 'San José de Sisa',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-15T20:03:51.000Z',
    guardian: 'Karol Yannina Rojas Guerrero (DNI: 71887176)'
  },
  {
    num: 27,
    name: 'Yaremi Nikole Pinedo García',
    dni: '78111604',
    phone: '991214158',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-15T20:56:00.000Z'
  },
  {
    num: 28,
    name: 'Ricardo Iván Ramírez Cabrera',
    dni: '71530567',
    phone: '939076058',
    city: 'Moyobamba',
    team: 'Independiente',
    costume: 'Sí',
    modality: 'Presencial',
    date: '2026-10-16T08:58:30.000Z'
  },
  {
    num: 29,
    name: 'Sandy Margoth Gatica Murrieta',
    dni: '71082177',
    phone: '915995109',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-16T20:19:28.000Z'
  },
  {
    num: 30,
    name: 'Juan Víctor De la Cruz Barrios',
    dni: '42514866',
    phone: '966659123',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-17T14:35:49.000Z'
  },

  // 31 to 81 (NEW REGISTRATIONS FROM FORM)
  {
    num: 31,
    name: 'Brenda Bermudez Chong',
    dni: '46398828',
    phone: '942739723',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-19T09:55:20.000Z'
  },
  {
    num: 32,
    name: 'Juan Carlos Aguilar Ruiz',
    dni: '46196135',
    phone: '954937126',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-19T10:00:40.000Z'
  },
  {
    num: 33,
    name: 'Diego Antonio Amacifuen Rojas',
    dni: '70163439',
    phone: '928140766',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-19T11:13:50.000Z'
  },
  {
    num: 34,
    name: 'Geraldine Betsabeth Mucha Aguilar',
    dni: '72363492',
    phone: '953743296',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-19T15:54:32.000Z'
  },
  {
    num: 35,
    name: 'Milagros Guevara Rabanal',
    dni: '75441142',
    phone: '916582500',
    city: 'Cacatachi',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-19T16:59:03.000Z'
  },
  {
    num: 36,
    name: 'Neyser Ydrogo Saavedra',
    dni: '71833617',
    phone: '913138381',
    city: 'Tarapoto',
    team: 'Híbridos por el Trail',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-19T22:10:49.000Z'
  },
  {
    num: 37,
    name: 'Sheyla Romero Castro',
    dni: '71592708',
    phone: '903588720',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-20T14:47:38.000Z'
  },
  {
    num: 38,
    name: 'Jimy Pool Guerra Sinti',
    dni: '75724756',
    phone: '991566798',
    city: 'Tarapoto',
    team: 'Team HIBRIDOS',
    costume: 'No',
    modality: 'Virtual',
    date: '2026-10-20T15:12:45.000Z'
  },
  {
    num: 39,
    name: 'Maycol Santacruz Pardo',
    dni: '77462545',
    phone: '922319073',
    city: 'Moyobamba',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-20T15:26:55.000Z'
  },
  {
    num: 40,
    name: 'Sandra Arévalo Rengifo',
    dni: '44168203',
    phone: '994685375',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-20T15:31:24.000Z'
  },
  {
    num: 41,
    name: 'Jarol Vásquez Lloclla',
    dni: '71983231',
    phone: '993487661',
    city: 'Saposoa',
    team: 'Team Running Saposoa',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-20T18:43:45.000Z'
  },
  {
    num: 42,
    name: 'Sol María Sánchez Gómez',
    dni: '73689201',
    phone: '948554280',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-20T19:18:25.000Z'
  },
  {
    num: 43,
    name: 'Clara Aparcana',
    dni: '70838533',
    phone: '944498735',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-20T22:54:13.000Z'
  },
  {
    num: 44,
    name: 'Fran Junior Sangama Fatama',
    dni: '72477933',
    phone: '934781831',
    city: 'Tarapoto',
    team: 'B15',
    costume: 'Ninguna',
    modality: 'Presencial',
    date: '2026-10-21T09:25:35.000Z'
  },
  {
    num: 45,
    name: 'Geraldine Cabrera Hoyos',
    dni: '60629819',
    phone: '906498640',
    city: 'Rioja',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-21T10:10:44.000Z'
  },
  {
    num: 46,
    name: 'Steissy Pasquel Balcázar',
    dni: '72494615',
    phone: '961782347',
    city: 'Pucallpa',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-21T13:47:07.000Z'
  },
  {
    num: 47,
    name: 'Frank Cristopher Dávila Guerra',
    dni: '75660546',
    phone: '966893095',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-21T13:54:46.000Z'
  },
  {
    num: 48,
    name: 'Kevin David Pinedo Castro',
    dni: '72888917',
    phone: '925893008',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-21T14:11:12.000Z'
  },
  {
    num: 49,
    name: 'Diego Fernando Camacho Lovera',
    dni: '75395391',
    phone: '953734379',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-21T14:18:09.000Z'
  },
  {
    num: 50,
    name: 'Luis Gabriel Atalaya Inga',
    dni: '74759467',
    phone: '945476018',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-21T18:30:30.000Z'
  },
  {
    num: 51,
    name: 'Elena Del Águila Ushiñahua',
    dni: '73653674',
    phone: '906562312',
    city: 'Tarapoto',
    team: 'THE FORTRESS TRAIL RUNNERS',
    costume: 'Sí',
    modality: 'Presencial',
    date: '2026-10-22T00:49:19.000Z'
  },
  {
    num: 52,
    name: 'Percy Ronaldo Isuiza Torres',
    dni: '71055403',
    phone: '928824225',
    city: 'Tarapoto',
    team: 'PNP',
    costume: 'Ninguna',
    modality: 'Presencial',
    date: '2026-10-22T13:13:09.000Z'
  },
  {
    num: 53,
    name: 'José Trigoso Soria',
    dni: '43631213',
    phone: '947783820',
    city: 'Tarapoto',
    team: 'Glow Project Running',
    costume: 'Ninguna',
    modality: 'Presencial',
    date: '2026-10-22T15:46:45.000Z'
  },
  {
    num: 54,
    name: 'Deyvin Franco Tello Putpaña',
    dni: '75942022',
    phone: '914695004',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-22T15:56:49.000Z'
  },
  {
    num: 55,
    name: 'Ángel Alvarado Bastidas',
    dni: '74827814',
    phone: '974323125',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-22T16:25:15.000Z'
  },
  {
    num: 56,
    name: 'José Delgado Acuña',
    dni: '70449423',
    phone: '947691270',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-22T17:56:36.000Z'
  },
  {
    num: 57,
    name: 'Patricia Guzmán Yamunaque',
    dni: '60616142',
    phone: '932316697',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-22T19:37:40.000Z'
  },
  {
    num: 58,
    name: 'Evelith Yamunaque Trigozo',
    dni: '43120291',
    phone: '961733207',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-22T19:41:28.000Z'
  },
  {
    num: 59,
    name: 'Víctor Renato Flores Coral',
    dni: '71433065',
    phone: '925070259',
    city: 'Lamas',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-22T21:08:42.000Z'
  },
  {
    num: 60,
    name: 'Carlo Mario Gutiérrez',
    dni: '43054257',
    phone: '936116990',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-22T22:53:29.000Z'
  },
  {
    num: 61,
    name: 'Tony Requejo Núñez',
    dni: '72717960',
    phone: '977281668',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-23T06:53:52.000Z'
  },
  {
    num: 62,
    name: 'Claudia Gonzales Fasanando',
    dni: '48929385',
    phone: '967269404',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-23T08:03:25.000Z'
  },
  {
    num: 63,
    name: 'Claudia Ramírez Gonzales',
    dni: '71417329',
    phone: '970388538',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Sí',
    modality: 'Presencial',
    date: '2026-10-23T09:00:24.000Z'
  },
  {
    num: 64,
    name: 'Raquel Goicoechea Vargas',
    dni: '46075147',
    phone: '980039477',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-23T11:11:59.000Z'
  },
  {
    num: 65,
    name: 'Kendy Gianpier',
    dni: '74455999',
    phone: '980974716',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-23T11:36:31.000Z'
  },
  {
    num: 66,
    name: 'Renzo Alexander Chapilliquen Rodríguez',
    dni: '72784772',
    phone: '941515669',
    city: 'Rioja',
    team: 'Independiente',
    costume: 'No',
    modality: 'Virtual',
    date: '2026-10-23T12:22:04.000Z'
  },
  {
    num: 67,
    name: 'Lourdes del Carmen Omonte Velásquez',
    dni: '43072970',
    phone: '955263186',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-23T16:07:13.000Z'
  },
  {
    num: 68,
    name: 'Juliana Teresa Bartra Arévalo',
    dni: '71589643',
    phone: '956721621',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Ninguna',
    modality: 'Presencial',
    date: '2026-10-23T17:42:16.000Z'
  },
  {
    num: 69,
    name: 'Leydi Herrera Ramírez',
    dni: '71514844',
    phone: '942118738',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-23T17:59:09.000Z'
  },
  {
    num: 70,
    name: 'Yanela Cárdenas Ramírez',
    dni: '71848795',
    phone: '984173580',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T11:49:44.000Z'
  },
  {
    num: 71,
    name: 'Eduardo Ibérico Acosta',
    dni: '46007728',
    phone: '976607610',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-24T11:52:22.000Z'
  },
  {
    num: 72,
    name: 'Florcita Picatoste Jiménez',
    dni: '72454248',
    phone: '974834072',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T11:52:36.000Z'
  },
  {
    num: 73,
    name: 'Leslie Luna',
    dni: '73809803',
    phone: '961001205',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T14:49:24.000Z'
  },
  {
    num: 74,
    name: 'Larri Terri Pezo Salvador',
    dni: '71114087',
    phone: '995706458',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-24T19:10:38.000Z'
  },
  {
    num: 75,
    name: 'José Alonso Benzaquen Gonzales',
    dni: '62355761',
    phone: '954789994',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T19:19:34.000Z',
    guardian: 'Ximena Alexandra Flores Gonzales'
  },
  {
    num: 76,
    name: 'Doyci Zezetti Ríos Meza',
    dni: '71492114',
    phone: '917700532',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T19:38:38.000Z'
  },
  {
    num: 77,
    name: 'Phill Andy Vásquez León',
    dni: '70165784',
    phone: '983099915',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T20:23:06.000Z'
  },
  {
    num: 78,
    name: 'David Alejandro Amasifuen García',
    dni: '70930373',
    phone: '904741736',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'No',
    modality: 'Presencial',
    date: '2026-10-24T20:25:45.000Z'
  },
  {
    num: 79,
    name: 'Ken Sinti Armas',
    dni: '73662245',
    phone: '977199845',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T20:27:18.000Z'
  },
  {
    num: 80,
    name: 'Steffany Amasifuen Ruiz',
    dni: '71881403',
    phone: '962256735',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T20:30:16.000Z'
  },
  {
    num: 81,
    name: 'Yecenia del Pilar Bartra Paima',
    dni: '70930296',
    phone: '951916236',
    city: 'Tarapoto',
    team: 'Independiente',
    costume: 'Aún no lo decido',
    modality: 'Presencial',
    date: '2026-10-24T21:22:10.000Z'
  }
];

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  if (parts.length === 2) return { first: parts[0], last: parts[1] };
  if (parts.length === 3) return { first: parts[0], last: parts.slice(1).join(' ') };
  // 4 or more: take first 2 as first name, rest as last name
  return { first: parts.slice(0, 2).join(' '), last: parts.slice(2).join(' ') };
}

const allRunners = rawRegistrations.map((raw) => {
  const cleanDni = String(raw.dni).trim();
  const existingRecord = existingByDni.get(cleanDni);

  const { first, last } = splitName(raw.name);
  const regNumber = raw.num;
  const id = `OHA-2026-${String(regNumber).padStart(4, '0')}`;

  return {
    id: existingRecord?.id || id,
    registrationNumber: regNumber,
    bibNumber: regNumber,
    firstName: existingRecord?.firstName || first,
    lastName: existingRecord?.lastName || last,
    documentType: 'DNI',
    documentNumber: cleanDni,
    email: existingRecord?.email || `${cleanDni}@corredor.pe`,
    whatsapp: existingRecord?.whatsapp || raw.phone,
    age: existingRecord?.age || 25,
    gender: existingRecord?.gender || 'Otro',
    department: 'San Martín',
    city: raw.city || 'Tarapoto',
    district: raw.city || 'Tarapoto',
    runningClub: raw.team || 'Independiente',
    tShirtSize: existingRecord?.tShirtSize || 'M',
    emergencyContactName: raw.guardian || existingRecord?.emergencyContactName || 'Contacto de Emergencia',
    emergencyContactPhone: existingRecord?.emergencyContactPhone || raw.phone,
    willWearCostume: raw.costume === 'Sí',
    costumeName: raw.costume === 'Sí' ? 'Disfraz Sorpresa' : '',
    paymentMethod: 'Yape',
    paymentReference: existingRecord?.paymentReference || `YAPE-FORMS-${String(regNumber).padStart(4, '0')}`,
    paymentStatus: 'Verificado',
    confirmedAtStart: existingRecord?.confirmedAtStart || false,
    startCheckinTime: existingRecord?.startCheckinTime || undefined,
    modality: raw.modality || 'Presencial',
    createdAt: raw.date || new Date().toISOString(),
    disclaimerAccepted: true,
  };
});

// Write to data_storage/registrations.json
fs.writeFileSync(storageFile, JSON.stringify(allRunners, null, 2), 'utf8');
console.log(`Saved ${allRunners.length} registrations to data_storage/registrations.json`);

// Write to src/data/initialRegistrations.ts
const tsContent = `import { RunnerRegistration } from '../types/race';

export const INITIAL_REGISTRATIONS: RunnerRegistration[] = ${JSON.stringify(allRunners, null, 2)};
`;

const tsFile = path.join(__dirname, '../src/data/initialRegistrations.ts');
fs.writeFileSync(tsFile, tsContent, 'utf8');
console.log(`Saved ${allRunners.length} registrations to src/data/initialRegistrations.ts`);

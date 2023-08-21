'use strict';
const DATA = [
  {
    "id": "6k8oac03vALHfrb9tPuOc7",
    "artist": "Silvia Tarozzi Deborah Walker",
    "name": "Pietà l‘è morta",
    "album": "Canti di guerra, di lavoro e d‘amore",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2737070f8aff8640ba7a479c33d",
    "preview_url": "https://p.scdn.co/mp3-preview/1fa7eb244cf0eae58eb567525e962e2214136973?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 302.116,
    "videoIds": [
      "A1QuTvc-ovM",
      "gLAS3Q0CIVQ",
      "3tXaRk_sbxI",
      "OWmWHZakXRg",
      "DqSfl25lBIs",
      "XaCMrutiAmA"
    ]
  },
  {
    "id": "5gJw9DpcnYywIIVGYSb4Y5",
    "artist": "Weyes Blood",
    "name": "God Turn Me Into a Flower",
    "album": "And In The Darkness, Hearts Aglow",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273db8ab490bcedb6e518c37e6e",
    "preview_url": "https://p.scdn.co/mp3-preview/d7ed920f790259afa0d09af5969a32b520f737e8?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 385.653,
    "videoIds": [
      "TYWaUgSuSYY",
      "VkaTHUAvxI0",
      "5_S8uYJ17Bk",
      "hcdz30a-sdM",
      "q_tDyL5f4uI",
      "dPZvTA5Bae8"
    ]
  },
  {
    "id": "3s3vybdkzM8sHztxIEQcYr",
    "artist": "Mount Eerie",
    "name": "Moon, I Already Know",
    "album": "Dawn",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273b06101fce8315a1ac46105d3",
    "preview_url": "https://p.scdn.co/mp3-preview/47b53488681ae3078adb32cbed7a76a3b78e118a?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 85.88,
    "videoIds": [
      "PTZQrwTuJu0",
      "FWQixgB9jjg",
      "KjcYKI8ojEE",
      "yt6ZfpUhTvs",
      "2tLstF8DhWs",
      "tzzlJLh7BDM"
    ]
  },
  {
    "id": "1yErlfGE8brAL5ZTo7maBU",
    "artist": "Mooreiy",
    "name": "Beloved",
    "album": "Beloved",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273a28f6b20f8d8573a84516e40",
    "preview_url": null,
    "duration": 213.508,
    "videoIds": [
      "2Z2UHLoZy1E",
      "ysxEFyYsv_U",
      "SdWAAAVMYMA",
      "Yp42do_9ErE",
      "BaBsx3COdQM"
    ]
  },
  {
    "id": "3bgH7ay0vCi8pqaFq4H9UY",
    "artist": "Early Fern Joseph Shabason",
    "name": "Softly Brushed By Wind",
    "album": "Softly Brushed By Wind",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2732d29144fc799dcba543ec426",
    "preview_url": "https://p.scdn.co/mp3-preview/82bf5722e9ec41836aced9070d4cff1448f4a385?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 194.047,
    "videoIds": [
      "UDd4xKm7FpE",
      "xJtp2W_z-ec",
      "JCtAqooItuw",
      "p_zjqOre_fA"
    ]
  },
  {
    "id": "7uECCWx2tz4T102b2QBS0p",
    "artist": "Yves Tumor",
    "name": "Echolalia",
    "album": "Echolalia",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2736349cce0e2c6d68aa8edc173",
    "preview_url": "https://p.scdn.co/mp3-preview/f05c0c76f1e0c5fa652c30ce77ec6d34911e3e9a?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 180.146,
    "videoIds": [
      "pGjflK33wnI",
      "tdaVgzOCkaU",
      "2o4__Chi6nY",
      "77DYXvsJeUQ",
      "qGU4PnvDvXk",
      "ana3uMVlWqU"
    ]
  },
  {
    "id": "5MEfxTan4X3PmkETXxOG6e",
    "artist": "Maraschino",
    "name": "Angelface",
    "album": "Angelface",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273c209b405069b1b85d55fd0d4",
    "preview_url": "https://p.scdn.co/mp3-preview/6e98d44efb8f83afc1bfb2fac1e2f99e2e9baeb5?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 348.673,
    "videoIds": [
      "cx960vUdnXQ",
      "Vvl1aDr70RQ",
      "nWcul9EBz-Q",
      "kiGlr824V0s",
      "QXmsJ7CZgMk",
      "-HrMveTrN-M"
    ]
  },
  {
    "id": "1lUT9ZnrWDVbLdnPyzjYIq",
    "artist": "Fox the Fox",
    "name": "Flirting And Showing",
    "album": "Collections",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2730743766c6a9438455e4c9266",
    "preview_url": "https://p.scdn.co/mp3-preview/393a4173365ca7d19f05c4b2c42640e80e07ef43?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 278.84,
    "videoIds": [
      "4GUDX51TxaI",
      "jOdV9qrBdSk",
      "090OtZY2zOU",
      "THLNapJj4ts",
      "LCYKH0u07Eo",
      "gi_Bz8aKCz4"
    ]
  },
  {
    "id": "79G1B6sFPHiA1xh4OGWtOz",
    "artist": "Robert Sandrini",
    "name": "Occhi Su Di Me",
    "album": "Occhi Su Di Me / Eyes Without A Face",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273cc9e256d4893263b62b4fb0d",
    "preview_url": "https://p.scdn.co/mp3-preview/c427053a4d074763cad7fba696cca8f66835edd9?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 251.593,
    "videoIds": [
      "Bq8SOIwhuow",
      "CI3_pkVRYAw",
      "dZ41hUHexmU",
      "RaaRPHL5t_g",
      "T4ysWuq-TaY",
      "0RFE7U3xGEU"
    ]
  },
  {
    "id": "1Ixa4ZLNWbaMsb6vLnzBKV",
    "artist": "Scribble",
    "name": "Mother of Pearl",
    "album": "Selected Works 1983-86",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273f9a5189562a74388628f43f2",
    "preview_url": "https://p.scdn.co/mp3-preview/1e0a27bf728691882af3454a6744e98a6be0e9cd?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 482,
    "videoIds": [
      "-komkjack6c",
      "GhCOqj4Pyb8",
      "MuNMsfFkI_M",
      "SD2uoFC7aEQ",
      "VHexTTOdpXE",
      "KTl_GAPu1ZY"
    ]
  },
  {
    "id": "7J46lkQn2onLYyg4PtJEJk",
    "artist": "Marlene Ribeiro",
    "name": "You Do It",
    "album": "Toquei no Sol",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273063e18e7850ba7f2114d4553",
    "preview_url": "https://p.scdn.co/mp3-preview/1148074c1b557a8c4015e3db4ed908fab7d88389?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 441.84,
    "videoIds": [
      "FFGrrfauEMQ",
      "7u6oS6XE2LQ",
      "bonsq7u9EK8",
      "1WCSyUmgzBo",
      "V1bJ-Zu5Dmo",
      "C8jLI2h1jkU"
    ]
  },
  {
    "id": "3mbdc8LQR0tCPdV0d3sruO",
    "artist": "Pablo's Eye",
    "name": "La Pedrera",
    "album": "Spring Break",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273a245812ab35a71bd711e463a",
    "preview_url": "https://p.scdn.co/mp3-preview/2a4d332e975746b51f162ca791759e0bd465cb14?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 157.786,
    "videoIds": [
      "uYj2TCTTFhc",
      "JIMQ5p5nGGA",
      "EQZHGCo3Q2s",
      "nVAuRY4GY68",
      "gEGkSbSlWg8",
      "SkD2v4w3_1g"
    ]
  },
  {
    "id": "4dL0IByCuNLmydwMRFokIM",
    "artist": "Discovery Zone",
    "name": "Fall Apart",
    "album": "Remote Control",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2737507a5adb06f2936b86b0e20",
    "preview_url": "https://p.scdn.co/mp3-preview/bde5ef98a66d37cfdd4d8f7b2017a10088ba48dc?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 191.433,
    "videoIds": [
      "IVl8WJdugkU",
      "2txY11KObSo",
      "HyQhhOh4pYI",
      "3W7e4LxAvBo",
      "UMr82fKun6I",
      "BtNn4l2oj_s"
    ]
  },
  {
    "id": "7hFfYDQIaMlwfMqi6mOCtv",
    "artist": "Clive Stevens & Brainchild",
    "name": "Mystery Man",
    "album": "Pan Global Electro Lounge Vol, 1",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273fa38043e8d3af58ffaf1291e",
    "preview_url": "https://p.scdn.co/mp3-preview/1121e217531c8124411cf0e09c9f980177ebed90?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 315.666,
    "videoIds": [
      "_BW4DhQBeds",
      "C55RM3JgvZE",
      "hIEIl4aLJXk",
      "TdFgXVDv6uM",
      "nlh9Cm0GOnQ",
      "qv6AhgNkUVU"
    ]
  },
  {
    "id": "1ihoAOte7bTCUbvWxBR3fk",
    "artist": "The Durutti Column",
    "name": "Spasmic Fairy",
    "album": "2001-2009",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2739ab28ee44a2b656bfb5ce184",
    "preview_url": null,
    "duration": 194.946,
    "videoIds": []
  },
  {
    "id": "6Ao5d7TMQ92h87jQqSHGyw",
    "artist": "Fred again..",
    "name": "Kyle (i found you)",
    "album": "Actual Life (April 14 - December 17 2020)",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2730f0e63e38a0ea92314ab9d7f",
    "preview_url": "https://p.scdn.co/mp3-preview/015abd43982ff20f457901482218ea5704278638?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 196.071,
    "videoIds": [
      "-mmlQ2HPfXE",
      "xiNPsWxd2Xw",
      "H2I6V0NlaHg"
    ]
  },
  {
    "id": "0bH9PojXgllkmM1cHGBBMY",
    "artist": "Against All Logic",
    "name": "This Old House Is All I Have",
    "album": "2012 - 2017",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2734cda2f39b7bc994f90fcfa85",
    "preview_url": "https://p.scdn.co/mp3-preview/18892c5e451ebe35c57ab1f75923de6bb58901a5?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 218.959,
    "videoIds": [
      "dGQwDOEC-ro",
      "55N_I_lULUA",
      "lgp_zYVO68U",
      "ggNtYqECkQ4",
      "UCJIgdDtJ4A",
      "UQwJ1XdvPm4"
    ]
  },
  {
    "id": "5IATbFZds3cbOx8YxuMuko",
    "artist": "The Rolling Stones",
    "name": "Emotional Rescue - Remastered 2009",
    "album": "Emotional Rescue (2009 Re-Mastered)",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273fd7f25e52b730ad9b838f3d8",
    "preview_url": "https://p.scdn.co/mp3-preview/a98cd3b93a3495986b266e8921e50eedad1f59a4?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 339.4,
    "videoIds": [
      "U4dSIZ5QS7I",
      "Mts9_aAQEeY",
      "ENf6Uo2Sdq4",
      "3-EbbKCfpog",
      "PTxQ601mlAY",
      "Ts6uiubDvw4"
    ]
  },
  {
    "id": "3dCxEPrhFwmMYaEKEjf2wN",
    "artist": "Beak>",
    "name": "Sex Music",
    "album": "Sex Music",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2731ddb2d800c13c5dd2b0ad615",
    "preview_url": "https://p.scdn.co/mp3-preview/190dc38b41721f00bbbcda00ecd608bbdbb3b68d?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 230.634,
    "videoIds": [
      "f-CeLwhWhYI",
      "GC5OCR8OdPk",
      "kWj3qI5t8pU",
      "AXpeQ41TPeo",
      "gfWQ1r6IQrY",
      "3gOHvDP_vCs"
    ]
  },
  {
    "id": "6ebsIWGcmcAN2o2dkKL2dd",
    "artist": "Stirling March",
    "name": "Under Cover Lover",
    "album": "Under Cover Lover",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2737c9739a64abe2eed950e4714",
    "preview_url": "https://p.scdn.co/mp3-preview/0455cf24d4e574876b704c49433f9446c838e340?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 297,
    "videoIds": [
      "BO78mprHnR4",
      "Tt9B89t6K04",
      "qVWLdtSEHhE",
      "XuDgZdpJG0c",
      "GVXnce5e538",
      "twH3df3CqHc"
    ]
  },
  {
    "id": "6m2O1S9wEc8zX86f7lB1qA",
    "artist": "International Music System",
    "name": "Mojave",
    "album": "IMS, Vol. 1 (LP)",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273a405012632514304cacedece",
    "preview_url": "https://p.scdn.co/mp3-preview/93e6ce07bd70c6f705579ae2efcad3ba4feffad1?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 333.333,
    "videoIds": [
      "uQnpxw2oBqQ",
      "2lXHlpM1lc8",
      "M-NqVNSVmHA",
      "zRciIKm5l_8",
      "4BHLP1eelN4",
      "A-ExL01nCjY"
    ]
  },
  {
    "id": "7ddphG1oKhMggKPV8FcfzV",
    "artist": "Marco Persichetti",
    "name": "Vento di terra",
    "album": "Il tempo, la memoria e lei",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273a90d3d600e03328f9743abe0",
    "preview_url": "https://p.scdn.co/mp3-preview/07b1f0a60fd7956e17c224a79c587fde100a9d19?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 288.416,
    "videoIds": [
      "PJnxxFTmIhI",
      "UIIQJhb6qts",
      "YWMbhP7nJYQ",
      "0-gZVmfbxn8",
      "RUMpP3Jpd1U",
      "NwxO1oBP62w"
    ]
  },
  {
    "id": "3V4rZhVqZ4EcaagkxUaqn0",
    "artist": "Spiritualized",
    "name": "The Slide Song",
    "album": "Pure Phase",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273efac54e37eb84f1f1419b83b",
    "preview_url": "https://p.scdn.co/mp3-preview/f245402840d35e26a6ccfec6442e44d66b28ae76?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 232.266,
    "videoIds": [
      "f_g94hKpzWM",
      "9Sn3f9fCIHU",
      "hze3Su59kFE",
      "qrGOT9GXAk8",
      "Xbjzkbi4OcA",
      "8p7LwCBgpCE"
    ]
  },
  {
    "id": "2ZssXuZfktUr4MMDzEWD2Z",
    "artist": "Arcade Fire",
    "name": "Good God Damn",
    "album": "Everything Now",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273a36d123f9906888d0af2aed8",
    "preview_url": "https://p.scdn.co/mp3-preview/4995b48da0a93c7b861ff79b60c846711d0f8ee4?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 214.426,
    "videoIds": [
      "5jmj0S859_0",
      "Y5zQfBhNO-8",
      "vACgwSzkjy8",
      "HwgUDmyxt0U",
      "RyZOf8XSxTA",
      "PXqxOLawi3M"
    ]
  },
  {
    "id": "2qekRBX1LJ3qwVJONJoS5e",
    "artist": "The Flirts",
    "name": "Danger",
    "album": "Born to Flirt",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b27396aefe4eb2d7e08ec3cb0e26",
    "preview_url": "https://p.scdn.co/mp3-preview/56b590b82bc4c3e6fe50d5dd6c3ba673440e9d5b?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 371.266,
    "videoIds": [
      "VE8q1vpA74U",
      "eZjj3i4lqtA",
      "ehAvFpSFcfA"
    ]
  },
  {
    "id": "7iPXM9PmAwWa2UObKEIiHa",
    "artist": "Dunn",
    "name": "Vision",
    "album": "America Dream Reserve",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b27369096ecd714921c4e1229823",
    "preview_url": "https://p.scdn.co/mp3-preview/8389a31987b0116b4bc898b2ba83cbb6b93a3a1c?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 318.32,
    "videoIds": [
      "FzqtrD3U1b0",
      "8IjOQmwlGmk",
      "-ImiHzmG78w",
      "2T88vOr98kc",
      "SEXZai09LxI",
      "20x8QZdninA"
    ]
  },
  {
    "id": "03bUQtfXbVUX5MmHHMKXA8",
    "artist": "Pisces",
    "name": "A Flower For All Seasons",
    "album": "A Lovely Sight",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273ace8fa1b66ebb7a81f30ba71",
    "preview_url": null,
    "duration": 169.92,
    "videoIds": [
      "Tisk0ewAyMs",
      "BE1qa89R-mA",
      "VuHeMKo2dQ8",
      "wkucDXvTxek",
      "EFJ7kDva7JE",
      "g1hEszuZ4lo"
    ]
  },
  {
    "id": "3AIg56DmaxyiLQBzPDv9hI",
    "artist": "Pixies",
    "name": "Havalina",
    "album": "Bossanova",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273344db70acb6e01f66fc9b3df",
    "preview_url": "https://p.scdn.co/mp3-preview/377df9f5aea46d12bc5b6605e0101e5e0d0b5033?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 153.466,
    "videoIds": [
      "5j34jOZczdk",
      "9LGInKorbME",
      "qwZpGzZIUWg",
      "wPK4RU0wKKM",
      "hGEqjHkAMp0",
      "400ZEgJOVp8"
    ]
  },
  {
    "id": "2U83QBaKqzvXpyBiqrdhNa",
    "artist": "Babyfather",
    "name": "Sleep It Off",
    "album": "Sleep It Off",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273b8a0d039dd71bca94cc640eb",
    "preview_url": "https://p.scdn.co/mp3-preview/55f3f81f6fb9fdae532016d7367a43caa3c93e34?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 118.894,
    "videoIds": [
      "k7BgUsMv55I",
      "PbP2sCY1Ln4",
      "-1zw4teFASs",
      "cXBEJoN2Hag",
      "8XChl7D6-es",
      "TKHjJnEaVrQ"
    ]
  },
  {
    "id": "585OnvhXi61RKZu34sdeMa",
    "artist": "UNKLE Callum Finn Elliott Power Miink",
    "name": "Arm’s Length (Rōnin / Club Remix)",
    "album": "Arm’s Length (Rōnin / Club Remix)",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b27314b717e74c46dc671bc60e28",
    "preview_url": "https://p.scdn.co/mp3-preview/9053a81de7438f13620c3bb7d6decb898698f3cb?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 334.765,
    "videoIds": [
      "xbWI-jFj4I0",
      "4B7BbY7D4sQ",
      "3heUGXUDtZI",
      "9xGGbZb0t2g",
      "v1pIyQyZReE",
      "BhtlD7EFr-k"
    ]
  },
  {
    "id": "07is4mDimzU5oHHO6hG8kj",
    "artist": "Underworld",
    "name": "and the colour red",
    "album": "and the colour red",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273cad3fe38f1b102b76af553af",
    "preview_url": "https://p.scdn.co/mp3-preview/c772a1c08c47fb0bcd70d5c7179f287e5b64ccdb?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 342,
    "videoIds": [
      "3hi6gOCi1bY",
      "P0K1nSsfSDo",
      "EQd0eVh5gc0",
      "dtishFOOsmA",
      "hRo4U_VHsYo",
      "IuEwJXysHzk"
    ]
  },
  {
    "id": "05hIAs51x8nxomcbDhB5bp",
    "artist": "Steve Gunn David Moore Bing & Ruth",
    "name": "Paper Limb",
    "album": "Let the Moon Be a Planet",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2735dde2ac7199c187aef6ed792",
    "preview_url": "https://p.scdn.co/mp3-preview/ce10cfc9efeb3df75485855ea7dc1e4be4e5e1bd?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 314.999,
    "videoIds": [
      "VxDND4nj6_8",
      "PfDAMopSKqs",
      "D1735laUB9M",
      "uvNNSaVDCLI",
      "XSm4L455PKI",
      "xZSXMxPaEEA"
    ]
  },
  {
    "id": "1PymZpZi4RnpQOZMMbnaLI",
    "artist": "Emile Mosseri",
    "name": "Oklahoma Baby",
    "album": "Oklahoma Baby",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b27304b1159323a8e12bf8119c89",
    "preview_url": "https://p.scdn.co/mp3-preview/5e7d98aba61c7080d54922e69f535fc762b0b817?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 218.04,
    "videoIds": [
      "LGxIVeMd9EY",
      "xbjvxHAn3l8",
      "B3Ive2lwP8M",
      "sPVRSMic24I",
      "8KoGETUYyi0",
      "GOuo3uPFDhQ"
    ]
  },
  {
    "id": "1miJ79Xlen9j3MjSl0dzZh",
    "artist": "Young Fathers",
    "name": "Geronimo",
    "album": "Heavy Heavy",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2731c9827f0c27cfa23c24fb451",
    "preview_url": "https://p.scdn.co/mp3-preview/75357c16d441c29a6cf6b6d0ddbf59862f8045fc?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 213.671,
    "videoIds": [
      "H6RiZU3q3sw",
      "WH0HXhzd1vM",
      "TFl_11ZU6Hk",
      "xSnIzUWsr8w",
      "uPyC0JUfZrU",
      "lbfHG_Vku4s"
    ]
  },
  {
    "id": "6dC66ztLWiYp34KBd68E2b",
    "artist": "Sylvester",
    "name": "I Need Somebody To Love Tonight",
    "album": "Stars",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b2732bdf21de1dc828ae12db60d8",
    "preview_url": "https://p.scdn.co/mp3-preview/2c44d97fe5a2f4747fd28e2e395d9ac4c926f64a?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 411.346,
    "videoIds": [
      "3twSNZhB330",
      "lpFQpfryo5I",
      "17baCDETvbs",
      "mkWw9e-2Y2c",
      "7-kyAE9EA-4",
      "Dgt9Zrv3IsM"
    ]
  },
  {
    "id": "3iWPPa7VeHhc49984gLxg2",
    "artist": "John Cale",
    "name": "The Endless Plain Of Fortune",
    "album": "Paris 1919",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b273795ab2f58fc8d94ffd01d5bf",
    "preview_url": "https://p.scdn.co/mp3-preview/b1fd3bce2b7ae2719c6c2730180d4b0f4404bde6?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 252.666,
    "videoIds": [
      "-0gvn5SM7uM",
      "KFf19OGAAFE",
      "idla5GrcBOg",
      "roPKnLxOYJI",
      "xuPZQayv_tY",
      "xBTpmL8l0cQ"
    ]
  },
  {
    "id": "2cSRuejq6DU9U6OkSmUw17",
    "artist": "Desire",
    "name": "Under Your Spell",
    "album": "Desire",
    "album_img_url": "https://i.scdn.co/image/ab67616d0000b27348dcf765cdc5b1ce04192cf8",
    "preview_url": "https://p.scdn.co/mp3-preview/f172f8ec10a3e87a4ddda8f85eb76a996e071276?cid=52aee9d2683e4fcda56e8520ae4507c3",
    "duration": 296.015,
    "videoIds": [
      "0pzA32RY-0E",
      "Hc2Zilqqm24",
      "9K7rmxjk5RQ"
    ]
  }
]


function fetchPlaylist(id) {
  return fetch(`/api/playlist/${id}`)
    .then((response) => {
      console.log({ response })
      const error_code = Math.floor(response.status / 100) * 100;
      const data = response.json();
      if ([400, 500].includes(error_code)) {
        throw data;
      }
      return data;
    })
  // .catch(err => console.log(err))
}

function getCurrentUser() {
  return fetch("/api/me")
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}


function getDownloadUrl({ playlistName, videoIds, extensions }) {
  const params = new URLSearchParams();
  videoIds.forEach(vid => params.append("v", vid));
  extensions?.forEach(ext => params.append("ext", ext));
  params.append("fname", playlistName);
  return `${window.location.origin}/api/download?${params.toString()}`;
}

function getDownloadAudioUrl({ fileName, videoId, extensions }) {
  const params = new URLSearchParams();
  extensions?.forEach(ext => params.append("ext", ext));
  if (fileName) {
    params.append("fname", fileName);
  }
  return `${window.location.origin}/download-audio/${videoId}?${params.toString()}`;
}

function getExtractInfos({ videoIds, extensions }) {
  const params = new URLSearchParams();
  videoIds.forEach(vid => params.append("v", vid));
  extensions?.forEach(ext => params.append("ext", ext));
  const url = `/api/extractinfo?${params.toString()}`;
  return fetch(url).then((response) => response.json());
}

function downloadPlaylist({ playlistName, videoIds, extensions }) {
  const downloadUrl = getDownloadUrl({ playlistName, videoIds, extensions });

  fetch(downloadUrl)
    .then((response) => response.blob())
    .then((blob) => {
      // Create blob link to download
      return window.URL.createObjectURL(
        new Blob([blob]),
      );
    });
}


async function fetchObjectUrl(url) {
  const options = { mode: "no-cors", headers: { "Access-Control-Allow-Origin": origin } };
  const blob = await fetch(url, options)
    .then((response) => response.blob());
  const objectUrl = window.URL.createObjectURL(blob);
  // console.log({ url, objectUrl, blob })
  return objectUrl;
}


function fetchAudioObjectUrl(downloadUrl, videoData, ref) {
  fetch(downloadUrl, { headers: { "Access-Control-Allow-Origin": origin } })
    .then(response => response.blob())
    .then(blob => {
      // console.log({ blob })
      const url = window.URL.createObjectURL(blob);
      ref.current.href = url;
      // console.log({ urlblob: ref.current.href })
      const videoData = videos[selectedVideoId];
      const duration = toMinutesAndSeconds(videoData?.duration || 0)
      const title = videoData ? `${videoData.title} (${duration})` : selectedVideoId;
      const fileName = `${title}.m4a`;

      ref.current.download = fileName;
      ref.current.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error({ err });
    });
}

function searchYoutubeVideos(id, name, artist, duration, album) {
  // TODO: Stop searching when user escapes loading browser
  // const { videoIds } = DATA.filter((tr) => tr.id === id)?.[0];
  // return Promise.resolve({ payload: videoIds })
  const params = new URLSearchParams()
  if (duration) {
    params.set('duration', duration)
  }
  if (album) {
    params.set('album', album)
  }
  const url = `/api/search/?${params.toString()}}`
  const body = JSON.stringify({ name, artist })
  const options = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body
  }
  return fetch(url, options).then((response) => response.json());
}
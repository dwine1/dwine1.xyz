// Major world cities by country and time zone. One line per zone: Country|IANA zone|City, City, ...
// The page also adds every city name from the browser's own IANA time zone list.
const CITY_DATA = `
Turkey|Europe/Istanbul|Istanbul, Ankara, İzmir, Bursa, Antalya, Adana, Konya, Gaziantep, Şanlıurfa, Kocaeli, Mersin, Diyarbakır, Kayseri, Eskişehir, Samsun, Denizli, Trabzon, Malatya, Erzurum, Van, Sakarya, Manisa, Balıkesir, Kahramanmaraş, Hatay, Aydın, Tekirdağ, Muğla, Bodrum, Edirne, Çanakkale, Rize, Sivas, Elazığ, Batman, Mardin, Ordu, Zonguldak, Afyonkarahisar, Isparta, Kütahya, Tokat, Çorum, Aksaray, Nevşehir, Kastamonu, Bolu, Yalova, Alanya, Fethiye, Kuşadası, Marmaris
Northern Cyprus|Asia/Famagusta|Famagusta
Cyprus|Asia/Nicosia|Nicosia, Limassol, Larnaca, Paphos
United Kingdom|Europe/London|London, Manchester, Birmingham, Liverpool, Leeds, Glasgow, Edinburgh, Bristol, Cardiff, Belfast, Newcastle, Sheffield, Nottingham, Leicester, Brighton, Oxford, Cambridge, Southampton, Aberdeen
Ireland|Europe/Dublin|Dublin, Cork, Galway, Limerick
Portugal|Europe/Lisbon|Lisbon, Porto, Faro, Coimbra
Portugal|Atlantic/Madeira|Funchal
Portugal|Atlantic/Azores|Ponta Delgada
Spain|Europe/Madrid|Madrid, Barcelona, Valencia, Seville, Zaragoza, Málaga, Bilbao, Palma, Alicante, Granada, Ibiza
Spain|Atlantic/Canary|Las Palmas, Santa Cruz de Tenerife
France|Europe/Paris|Paris, Marseille, Lyon, Toulouse, Nice, Nantes, Strasbourg, Montpellier, Bordeaux, Lille, Rennes, Cannes
Belgium|Europe/Brussels|Brussels, Antwerp, Ghent, Bruges, Liège
Netherlands|Europe/Amsterdam|Amsterdam, Rotterdam, The Hague, Utrecht, Eindhoven
Luxembourg|Europe/Luxembourg|Luxembourg
Germany|Europe/Berlin|Berlin, Hamburg, Munich, Cologne, Frankfurt, Stuttgart, Düsseldorf, Dortmund, Essen, Leipzig, Bremen, Dresden, Hanover, Nuremberg, Bonn
Switzerland|Europe/Zurich|Zurich, Geneva, Basel, Bern, Lausanne
Austria|Europe/Vienna|Vienna, Graz, Linz, Salzburg, Innsbruck
Italy|Europe/Rome|Rome, Milan, Naples, Turin, Palermo, Genoa, Bologna, Florence, Venice, Verona, Bari, Catania
Vatican City|Europe/Vatican|Vatican City
Malta|Europe/Malta|Valletta
Monaco|Europe/Monaco|Monaco
Denmark|Europe/Copenhagen|Copenhagen, Aarhus, Odense
Norway|Europe/Oslo|Oslo, Bergen, Trondheim, Stavanger, Tromsø
Sweden|Europe/Stockholm|Stockholm, Gothenburg, Malmö, Uppsala
Finland|Europe/Helsinki|Helsinki, Espoo, Tampere, Turku, Oulu
Iceland|Atlantic/Reykjavik|Reykjavík
Poland|Europe/Warsaw|Warsaw, Kraków, Łódź, Wrocław, Poznań, Gdańsk, Szczecin
Czechia|Europe/Prague|Prague, Brno, Ostrava
Slovakia|Europe/Bratislava|Bratislava, Košice
Hungary|Europe/Budapest|Budapest, Debrecen, Szeged
Slovenia|Europe/Ljubljana|Ljubljana
Croatia|Europe/Zagreb|Zagreb, Split, Dubrovnik, Rijeka
Bosnia and Herzegovina|Europe/Sarajevo|Sarajevo, Mostar, Banja Luka
Serbia|Europe/Belgrade|Belgrade, Novi Sad, Niš
Montenegro|Europe/Podgorica|Podgorica, Kotor
Kosovo|Europe/Belgrade|Pristina
North Macedonia|Europe/Skopje|Skopje, Ohrid
Albania|Europe/Tirane|Tirana, Durrës
Greece|Europe/Athens|Athens, Thessaloniki, Patras, Heraklion, Rhodes, Mykonos, Santorini
Bulgaria|Europe/Sofia|Sofia, Plovdiv, Varna, Burgas
Romania|Europe/Bucharest|Bucharest, Cluj-Napoca, Timișoara, Iași, Constanța, Brașov
Moldova|Europe/Chisinau|Chișinău
Ukraine|Europe/Kyiv|Kyiv, Kharkiv, Odesa, Dnipro, Lviv, Zaporizhzhia
Belarus|Europe/Minsk|Minsk, Brest, Gomel
Lithuania|Europe/Vilnius|Vilnius, Kaunas
Latvia|Europe/Riga|Riga
Estonia|Europe/Tallinn|Tallinn, Tartu
Russia|Europe/Kaliningrad|Kaliningrad
Russia|Europe/Moscow|Moscow, Saint Petersburg, Kazan, Nizhny Novgorod, Rostov-on-Don, Sochi, Voronezh, Krasnodar
Russia|Europe/Samara|Samara
Russia|Europe/Volgograd|Volgograd
Russia|Asia/Yekaterinburg|Yekaterinburg, Chelyabinsk, Ufa, Perm
Russia|Asia/Omsk|Omsk
Russia|Asia/Novosibirsk|Novosibirsk
Russia|Asia/Krasnoyarsk|Krasnoyarsk
Russia|Asia/Irkutsk|Irkutsk
Russia|Asia/Yakutsk|Yakutsk
Russia|Asia/Vladivostok|Vladivostok, Khabarovsk
Russia|Asia/Magadan|Magadan
Russia|Asia/Kamchatka|Petropavlovsk-Kamchatsky
Georgia|Asia/Tbilisi|Tbilisi, Batumi, Kutaisi
Armenia|Asia/Yerevan|Yerevan, Gyumri
Azerbaijan|Asia/Baku|Baku, Ganja, Nakhchivan
Kazakhstan|Asia/Almaty|Almaty, Astana, Shymkent
Kazakhstan|Asia/Aqtobe|Aktobe
Uzbekistan|Asia/Tashkent|Tashkent, Samarkand, Bukhara
Turkmenistan|Asia/Ashgabat|Ashgabat
Kyrgyzstan|Asia/Bishkek|Bishkek, Osh
Tajikistan|Asia/Dushanbe|Dushanbe
Afghanistan|Asia/Kabul|Kabul, Kandahar, Herat
Iran|Asia/Tehran|Tehran, Mashhad, Isfahan, Tabriz, Shiraz
Iraq|Asia/Baghdad|Baghdad, Basra, Mosul, Erbil
Syria|Asia/Damascus|Damascus, Aleppo
Lebanon|Asia/Beirut|Beirut
Jordan|Asia/Amman|Amman, Aqaba
Israel|Asia/Jerusalem|Jerusalem, Tel Aviv, Haifa
Palestine|Asia/Gaza|Gaza
Palestine|Asia/Hebron|Ramallah, Hebron
Saudi Arabia|Asia/Riyadh|Riyadh, Jeddah, Mecca, Medina, Dammam
Kuwait|Asia/Kuwait|Kuwait City
Bahrain|Asia/Bahrain|Manama
Qatar|Asia/Qatar|Doha
United Arab Emirates|Asia/Dubai|Dubai, Abu Dhabi, Sharjah
Oman|Asia/Muscat|Muscat, Salalah
Yemen|Asia/Aden|Sanaa, Aden
Pakistan|Asia/Karachi|Karachi, Lahore, Islamabad, Faisalabad, Rawalpindi, Peshawar
India|Asia/Kolkata|New Delhi, Mumbai, Kolkata, Bangalore, Chennai, Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow, Surat, Kanpur, Goa, Kochi
Nepal|Asia/Kathmandu|Kathmandu, Pokhara
Bhutan|Asia/Thimphu|Thimphu
Bangladesh|Asia/Dhaka|Dhaka, Chittagong
Sri Lanka|Asia/Colombo|Colombo, Kandy
Maldives|Indian/Maldives|Malé
Myanmar|Asia/Yangon|Yangon, Mandalay, Naypyidaw
Thailand|Asia/Bangkok|Bangkok, Chiang Mai, Phuket, Pattaya
Laos|Asia/Vientiane|Vientiane
Cambodia|Asia/Phnom_Penh|Phnom Penh, Siem Reap
Vietnam|Asia/Ho_Chi_Minh|Ho Chi Minh City, Hanoi, Da Nang
Malaysia|Asia/Kuala_Lumpur|Kuala Lumpur, Penang, Johor Bahru
Malaysia|Asia/Kuching|Kuching, Kota Kinabalu
Singapore|Asia/Singapore|Singapore
Indonesia|Asia/Jakarta|Jakarta, Surabaya, Bandung, Medan, Semarang
Indonesia|Asia/Makassar|Denpasar, Bali, Makassar
Indonesia|Asia/Jayapura|Jayapura
Brunei|Asia/Brunei|Bandar Seri Begawan
Philippines|Asia/Manila|Manila, Quezon City, Cebu, Davao
East Timor|Asia/Dili|Dili
China|Asia/Shanghai|Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, Chongqing, Wuhan, Xi'an, Hangzhou, Nanjing, Tianjin, Suzhou, Harbin, Kunming, Xiamen, Qingdao, Lhasa
China|Asia/Urumqi|Ürümqi
Hong Kong|Asia/Hong_Kong|Hong Kong
Macau|Asia/Macau|Macau
Taiwan|Asia/Taipei|Taipei, Kaohsiung, Taichung
Mongolia|Asia/Ulaanbaatar|Ulaanbaatar
North Korea|Asia/Pyongyang|Pyongyang
South Korea|Asia/Seoul|Seoul, Busan, Incheon, Daegu, Daejeon, Gwangju, Jeju
Japan|Asia/Tokyo|Tokyo, Osaka, Kyoto, Yokohama, Nagoya, Sapporo, Fukuoka, Kobe, Hiroshima, Sendai, Okinawa, Nara
Australia|Australia/Sydney|Sydney, Canberra, Newcastle, Wollongong
Australia|Australia/Melbourne|Melbourne, Geelong
Australia|Australia/Brisbane|Brisbane, Gold Coast, Cairns, Townsville
Australia|Australia/Adelaide|Adelaide
Australia|Australia/Darwin|Darwin, Alice Springs
Australia|Australia/Perth|Perth
Australia|Australia/Hobart|Hobart
New Zealand|Pacific/Auckland|Auckland, Wellington, Christchurch, Queenstown, Dunedin
Fiji|Pacific/Fiji|Suva, Nadi
Papua New Guinea|Pacific/Port_Moresby|Port Moresby
Samoa|Pacific/Apia|Apia
Tonga|Pacific/Tongatapu|Nukuʻalofa
French Polynesia|Pacific/Tahiti|Papeete, Tahiti
Guam|Pacific/Guam|Hagåtña
Kiribati|Pacific/Kiritimati|Kiritimati
Egypt|Africa/Cairo|Cairo, Alexandria, Giza, Luxor, Sharm El Sheikh, Hurghada
Libya|Africa/Tripoli|Tripoli, Benghazi
Tunisia|Africa/Tunis|Tunis, Sfax
Algeria|Africa/Algiers|Algiers, Oran, Constantine
Morocco|Africa/Casablanca|Casablanca, Rabat, Marrakesh, Fez, Tangier, Agadir
Sudan|Africa/Khartoum|Khartoum
Ethiopia|Africa/Addis_Ababa|Addis Ababa
Somalia|Africa/Mogadishu|Mogadishu
Kenya|Africa/Nairobi|Nairobi, Mombasa
Uganda|Africa/Kampala|Kampala
Tanzania|Africa/Dar_es_Salaam|Dar es Salaam, Dodoma, Zanzibar
Rwanda|Africa/Kigali|Kigali
Nigeria|Africa/Lagos|Lagos, Abuja, Kano, Ibadan, Port Harcourt
Ghana|Africa/Accra|Accra, Kumasi
Senegal|Africa/Dakar|Dakar
Ivory Coast|Africa/Abidjan|Abidjan, Yamoussoukro
Mali|Africa/Bamako|Bamako
Cameroon|Africa/Douala|Douala, Yaoundé
DR Congo|Africa/Kinshasa|Kinshasa
DR Congo|Africa/Lubumbashi|Lubumbashi
Angola|Africa/Luanda|Luanda
Zambia|Africa/Lusaka|Lusaka
Zimbabwe|Africa/Harare|Harare, Bulawayo
Mozambique|Africa/Maputo|Maputo
Namibia|Africa/Windhoek|Windhoek
Botswana|Africa/Gaborone|Gaborone
South Africa|Africa/Johannesburg|Johannesburg, Cape Town, Durban, Pretoria, Port Elizabeth
Madagascar|Indian/Antananarivo|Antananarivo
Mauritius|Indian/Mauritius|Port Louis
Seychelles|Indian/Mahe|Victoria
Canada|America/St_Johns|St. John's
Canada|America/Halifax|Halifax
Canada|America/Toronto|Toronto, Montreal, Ottawa, Quebec City
Canada|America/Winnipeg|Winnipeg
Canada|America/Regina|Regina, Saskatoon
Canada|America/Edmonton|Calgary, Edmonton
Canada|America/Vancouver|Vancouver, Victoria
Canada|America/Whitehorse|Whitehorse
United States|America/New_York|New York, Washington DC, Boston, Philadelphia, Miami, Atlanta, Orlando, Charlotte, Pittsburgh, Baltimore, Tampa, Raleigh, Richmond, Buffalo, Jacksonville, Columbus, Cleveland, Cincinnati, Virginia Beach, Norfolk, Newark, Jersey City, Providence, Hartford, New Haven, Albany, Rochester, Syracuse, Charleston, Columbia, Savannah, Greensboro, Durham, Fort Lauderdale, West Palm Beach, Tallahassee, Annapolis, Dover, Wilmington, Trenton, Augusta, Concord, Montpelier, Burlington, Lexington, Frankfort, Knoxville, Chattanooga, Harrisburg, Key West
United States|America/Detroit|Detroit, Grand Rapids, Lansing, Ann Arbor
United States|America/Indiana/Indianapolis|Indianapolis, Fort Wayne
United States|America/Kentucky/Louisville|Louisville
United States|America/Chicago|Chicago, Houston, Dallas, San Antonio, Austin, Nashville, New Orleans, Minneapolis, Saint Paul, Kansas City, St. Louis, Memphis, Milwaukee, Madison, Green Bay, Oklahoma City, Tulsa, Fort Worth, Corpus Christi, Lubbock, Omaha, Lincoln, Des Moines, Little Rock, Jackson, Birmingham, Montgomery, Mobile, Huntsville, Baton Rouge, Shreveport, Wichita, Topeka, Springfield, Sioux Falls, Pierre, Fargo, Bismarck
United States|America/Denver|Denver, Colorado Springs, Salt Lake City, Albuquerque, Santa Fe, Las Cruces, El Paso, Cheyenne, Helena, Billings
United States|America/Boise|Boise
United States|America/Phoenix|Phoenix, Tucson, Mesa, Scottsdale, Tempe, Flagstaff
United States|America/Los_Angeles|Los Angeles, San Francisco, San Diego, San Jose, Sacramento, Oakland, Fresno, Long Beach, Bakersfield, Anaheim, Santa Barbara, Palm Springs, Seattle, Tacoma, Spokane, Olympia, Portland, Salem, Eugene, Las Vegas, Reno, Carson City
United States|America/Anchorage|Anchorage, Juneau, Fairbanks
United States|Pacific/Honolulu|Honolulu, Hilo
Mexico|America/Mexico_City|Mexico City, Guadalajara, Monterrey, Puebla
Mexico|America/Cancun|Cancún
Mexico|America/Tijuana|Tijuana
Mexico|America/Mazatlan|Mazatlán, La Paz
Guatemala|America/Guatemala|Guatemala City
Belize|America/Belize|Belize City
El Salvador|America/El_Salvador|San Salvador
Honduras|America/Tegucigalpa|Tegucigalpa
Nicaragua|America/Managua|Managua
Costa Rica|America/Costa_Rica|San José
Panama|America/Panama|Panama City
Cuba|America/Havana|Havana
Jamaica|America/Jamaica|Kingston
Haiti|America/Port-au-Prince|Port-au-Prince
Dominican Republic|America/Santo_Domingo|Santo Domingo, Punta Cana
Puerto Rico|America/Puerto_Rico|San Juan
Bahamas|America/Nassau|Nassau
Barbados|America/Barbados|Bridgetown
Trinidad and Tobago|America/Port_of_Spain|Port of Spain
Colombia|America/Bogota|Bogotá, Medellín, Cali, Cartagena
Venezuela|America/Caracas|Caracas, Maracaibo
Ecuador|America/Guayaquil|Quito, Guayaquil
Ecuador|Pacific/Galapagos|Galápagos
Peru|America/Lima|Lima, Cusco, Arequipa
Bolivia|America/La_Paz|La Paz, Santa Cruz de la Sierra
Brazil|America/Sao_Paulo|São Paulo, Rio de Janeiro, Brasília, Belo Horizonte, Curitiba, Porto Alegre, Salvador, Florianópolis
Brazil|America/Fortaleza|Fortaleza
Brazil|America/Recife|Recife
Brazil|America/Bahia|Bahia
Brazil|America/Belem|Belém
Brazil|America/Manaus|Manaus
Paraguay|America/Asuncion|Asunción
Uruguay|America/Montevideo|Montevideo
Argentina|America/Argentina/Buenos_Aires|Buenos Aires, Córdoba, Rosario, Mendoza, Ushuaia
Chile|America/Santiago|Santiago, Valparaíso
Chile|Pacific/Easter|Easter Island
Guyana|America/Guyana|Georgetown
Suriname|America/Paramaribo|Paramaribo
Greenland|America/Nuuk|Nuuk
Antarctica|Antarctica/McMurdo|McMurdo Station
`;

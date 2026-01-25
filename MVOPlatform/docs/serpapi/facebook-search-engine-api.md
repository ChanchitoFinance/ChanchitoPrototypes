Facebook Profile API
API uptime
99.977%
Our Facebook Profile API allows you to scrape results from the Facebook Profile page. The API is accessed through the following endpoint: /search?engine=facebook_profile.

A user may query the following: https://serpapi.com/search?engine=facebook_profile&profile_id=Meta utilizing a GET request. Head to the playground for a live and interactive demo.

API Parameters
Search Query
profile_id

Required

Parameter defines the Facebook profile ID. You can find it in the URL of the profile page. For example, in https://www.facebook.com/Meta, the profile ID is Meta; in https://facebook.com/profile.php?id=100080376596424, the profile ID is 100080376596424.

Serpapi Parameters
engine

Required

Set parameter to facebook_profile to use the Facebook Profile API engine.

no_cache

Optional

Parameter will force SerpApi to fetch the Facebook Profile results even if a cached version is already present. A cache is served only if the query and all parameters are exactly the same. Cache expires after 1h. Cached searches are free, and are not counted towards your searches per month. It can be set to false (default) to allow results from the cache, or true to disallow results from the cache. no_cache and async parameters should not be used together.

async

Optional

Parameter defines the way you want to submit your search to SerpApi. It can be set to false (default) to open an HTTP connection and keep it open until you got your search results, or true to just submit your search to SerpApi and retrieve them later. In this case, you'll need to use our Searches Archive API to retrieve your results. async and no_cache parameters should not be used together. async should not be used on accounts with Ludicrous Speed enabled.

zero_trace

Optional

Enterprise only. Parameter enables ZeroTrace mode. It can be set to false (default) or true. Enable this mode to skip storing search parameters, search files, and search metadata on our servers. This may make debugging more difficult.

api_key

Required

Parameter defines the SerpApi private key to use.

output

Optional

Parameter defines the final output you want. It can be set to json (default) to get a structured JSON of the results, or html to get the raw html retrieved.

json_restrictor

Optional

Parameter defines the fields you want to restrict in the outputs for smaller, faster responses. See JSON Restrictor for more details.

Facebook Profile results for
profile_id
:
Modernatx
(Page profile)
GET

https://serpapi.com/search.json?engine=facebook_profile&profile_id=Modernatx

Code to integrate

JavaScript

const { getJson } = require("serpapi");

getJson({
engine: "facebook_profile",
profile_id: "Modernatx",
api_key: "9a747a214ddde0973c6ebf528928865b59774e53f3fb5792f1642ab864382e73"
}, (json) => {
console.log(json["profile_results"]);
});

JSON Example

{
"search*metadata": {
"id": "68c05e68fc8a2b4f97ef90e1",
"status": "Success",
"json_endpoint": "https://serpapi.com/searches/a338c57d78830db8/68c05e68fc8a2b4f97ef90e1.json",
"created_at": "2025-09-09 17:05:44 UTC",
"processed_at": "2025-09-09 17:05:44 UTC",
"facebook_profile_url": "https://www.facebook.com/modernatx",
"raw_html_file": "https://serpapi.com/searches/a338c57d78830db8/68c05e68fc8a2b4f97ef90e1.html",
"total_time_taken": 1.43
},
"search_parameters": {
"engine": "facebook_profile",
"profile_id": "Modernatx"
},
"profile_results": {
"name": "Moderna, Inc.",
"id": "100069948937913",
"url": "https://www.facebook.com/modernatx",
"gender": "neuter",
"verified": true,
"profile_picture": "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-1/356888152_561191559555804_2441099756881464175_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=106&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=ANFCBLTPnQ4Q7kNvwFMlhj2&_nc_oc=Adng_nq69jd-Z83JKffm0LmUi_ACwsuR2CIouu9og_d2p0gnxdwAk9LCW6-CCkGgatM&_nc_zt=24&_nc_ht=scontent-lax3-2.xx&_nc_gid=p-vqpcnT*-NeSQRd*Czzyg&oh=00_AfYi9qaVmlCM_8CyM0YFM_GuaPEv2stYuoMCcbsSxiScaA&oe=68C61AE3",
"cover_photo": "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/484087947_932917982383158_2050811309558476917_n.png?_nc_cat=109&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=cPzp1YJCf9UQ7kNvwGnm43v&_nc_oc=AdlAl0A9H4AJcdfXdIELaCPpxAB_ffR-jTlJpYt2_6nsdAPW-quQHkX6YRz1LnWl_Tw&_nc_zt=23&_nc_ht=scontent-lax3-1.xx&_nc_gid=p-vqpcnT*-NeSQRd*Czzyg&oh=00_AfYtQ2JZvXAu8qmY0xaNheR09idkifNGjRqHo7wBhEPyZQ&oe=68C61A5E",
"likes": "26K",
"followers": "29K",
"profile_type": "PAGE",
"profile_intro_text": "Our mission is to deliver the greatest possible impact to people through mRNA medicines.",
"category": "Biotechnology Company",
"address": "325 Binney Street, Cambridge, MA, United States, Massachusetts",
"phone": "(617) 714-6500",
"email": "info@modernatx.com",
"business_hours": "Always open",
"price_range": "$",
"links": [
{
"title": "moderna_tx",
"link": "https://www.instagram.com/moderna_tx",
"icon": "https://static.xx.fbcdn.net/rsrc.php/v4/yj/r/LPnnw6HJjJT.png"
},
{
"title": "moderna_tx",
"link": "https://x.com/moderna_tx",
"icon": "https://static.xx.fbcdn.net/rsrc.php/v4/yt/r/jj8WNiSOwMd.png"
},
{
"title": "modernatx",
"link": "https://youtube.com/@modernatx",
"icon": "https://static.xx.fbcdn.net/rsrc.php/v4/yH/r/bMA2vuRsEKI.png"
},
...
],
"photos": [
{
"link": "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/483595585_559514957148251_6289021363079729348_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=oFK1x504xMAQ7kNvwEmusoN&_nc_oc=Adlh1gLeKPGteg3hZPfXHYZgAbgSU8756dk1dPrT5OCG66oQ9xJXxA7dfl2gUjE1UbQ&_nc_zt=23&_nc_ht=scontent-lax3-2.xx&_nc_gid=p-vqpcnT*-NeSQRd*Czzyg&oh=00_AfYFG8H0DUEaWJ_y9YXoQxAv7fdZfTd0zyaHrjd9kZqWRw&oe=68C64188",
"owner": {
"type": "User",
"id": "100092692531129"
}
},
{
"link": "https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-6/480847050_10234797838067567_1694469278595134949_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=oHgbemcXXFIQ7kNvwE_0Pki&_nc_oc=AdnwZd6wCZ_n-cjpGW0AUM42Q1J6BPATk*-aABec89k6h03amZYaZxiEh6JGc*0Da6Y&\_nc_zt=23&\_nc_ht=scontent-lax3-2.xx&\_nc_gid=p-vqpcnT*-NeSQRd*Czzyg&oh=00_Afa2845YnPAPobm9ejAt2E6sQBO0bWv5RrgGyt6Cvz4-ow&oe=68C64651",
"owner": {
"type": "User",
"id": "pfbid0wYu7Y29jF5RPsgmziJeMEt9PUoGDW7ZsSPKBbm9duudHphmLQNd8M5iDuHFMBmZal"
}
},
{
"link": "https://scontent-lax3-1.xx.fbcdn.net/v/t39.30808-6/484250814_999071692316872_6952778251593851696_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=WCCFfj3cszcQ7kNvwE1o8-m&_nc_oc=AdlN7rUeWV-1CqNUmdZ_35OQx6NGOAuhS5B07zmOZlW8fUFGpu3TtjGaZ5_PGrIJ28I&_nc_zt=23&_nc_ht=scontent-lax3-1.xx&_nc_gid=p-vqpcnT*-NeSQRd_Czzyg&oh=00_AfbpPW4wegOx2Orn03o-QCh25mzwfRFwMDiwiYG3YoRRRQ&oe=68C63252",
"owner": {
"type": "User",
"id": "100066421522435"
}
},
...
}
]
}
}
Facebook Profile results for
profile_id
:
4
(Creator profile)
GET

https://serpapi.com/search.json?engine=facebook_profile&profile_id=4

Code to integrate

JavaScript

const { getJson } = require("serpapi");

getJson({
engine: "facebook_profile",
profile_id: "4",
api_key: "9a747a214ddde0973c6ebf528928865b59774e53f3fb5792f1642ab864382e73"
}, (json) => {
console.log(json["profile_results"]);
});

JSON Example

{
"search_metadata": {
"id": "68c0600efc8a2b4f99a16b2f",
"status": "Success",
"json_endpoint": "https://serpapi.com/searches/1b357cbcd14c0aaf/68c0600efc8a2b4f99a16b2f.json",
"created_at": "2025-09-09 17:12:46 UTC",
"processed_at": "2025-09-09 17:12:46 UTC",
"facebook_profile_url": "https://www.facebook.com/zuck",
"raw_html_file": "https://serpapi.com/searches/1b357cbcd14c0aaf/68c0600efc8a2b4f99a16b2f.html",
"total_time_taken": 1.2
},
"search_parameters": {
"engine": "facebook_profile",
"profile_id": "4"
},
"profile_results": {
"name": "Mark Zuckerberg",
"id": "4",
"url": "https://www.facebook.com/zuck",
"gender": "male",
"verified": true,
"profile_picture": "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-1/461204377_10115852257979731_20136418769041878_n.jpg?stp=c180.30.1429.1428a_dst-jpg_s200x200_tt6&_nc_cat=1&ccb=1-7&_nc_sid=1d2534&_nc_ohc=bz7gFaMu3vkQ7kNvwHtEznz&_nc_oc=AdkvX9aefFYycPyu9qFY3IBewVD0c7B7lSRzkwOO9rl2ON4ixxpLrHcgaRYGpQleQus&_nc_zt=24&_nc_ht=scontent-lga3-2.xx&_nc_gid=6WRnHWxe00C2VsUAAOOBPA&oh=00_Afb0fiOLLLXtZVXOyTRFYgMgHjbPbaSDo2_ULrkCE7w_Hg&oe=68C632B0",
"cover_photo": "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-6/510262894_10116675748582961_3647797500193179162_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=101&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=DeAXBPbSIPMQ7kNvwHyz3p8&_nc_oc=AdkicqB6oDUypfCVcFNls5CbEV_ufkg4C0gYzJdcF48cHwDtPfLfA9hFpPTuryfy22Y&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=6WRnHWxe00C2VsUAAOOBPA&oh=00_AfaFhyxXP_gBRL4O93NP-lyeFOUpswBrpTW7d4r3oSFCJg&oe=68C64C84",
"followers": "120M",
"profile_type": "PROFILE",
"profile_intro_text": "Bringing the world closer together.",
"category": "Public figure",
"current_city": "Palo Alto, California",
"hometown": "Dobbs Ferry, New York",
"relationship": "Married to Priscilla Chan",
"educations": [
{
"title": "Studied Computer Science and Psychology at Harvard University",
"name": "Harvard University",
"facebook_link": "https://www.facebook.com/Harvard"
}
],
"works": [
{
"title": "Founder and CEO at Meta",
"name": "Meta",
"link": "https://www.facebook.com/Meta",
"facebook_link": "https://www.facebook.com/Meta"
},
{
"title": "Works at Chan Zuckerberg Initiative",
"name": "Chan Zuckerberg Initiative",
"link": "https://www.facebook.com/chanzuckerberginitiative",
"facebook_link": "https://www.facebook.com/chanzuckerberginitiative"
}
],
"photos": [
{
"link": "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-6/499218975_10116567135329791_3853642376872939282_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=r1_ignm5h9kQ7kNvwEMfJ4H&_nc_oc=AdmMj6rjCqIBS2Fd_nVwZklInERCvVT8fLVppOgdP0PwG3CfnamVbjgFj8cPC2t7ptE&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=6WRnHWxe00C2VsUAAOOBPA&oh=00_Afb23AwWD4BvYj9sW9SyP5jl7QfZf-A2TtJvJFtdsnRN_g&oe=68C6402D",
"owner": {
"type": "User",
"id": "4"
}
},
{
"link": "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-6/493992576_10116508199073521_2648622543862374933_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=YXavKC-Sl-gQ7kNvwG4KzBA&_nc_oc=Adn_tDlC32qZaoRDfCIBOdhsZJqjk_QS24HIJl5OMaYItek9AXhzwpD9LoZyj7vZbL0&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=6WRnHWxe00C2VsUAAOOBPA&oh=00_AfavgaVA-wzbwAyXcW3Fxmomyf5FUW2ycx02vY49hciDug&oe=68C621F9",
"owner": {
"type": "User",
"id": "4"
}
},
{
"link": "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-6/493309309_10116507563986241_3709845967109456091_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_ohc=I68IEglrsKUQ7kNvwGoQD2m&_nc_oc=AdnEaUloseijllVC91ySWSDjyTZ_VY_aGpwXO7AYAbqi5i6WI0mX_1UvTCrlQZYOAu4&_nc_zt=23&_nc_ht=scontent-lga3-2.xx&_nc_gid=6WRnHWxe00C2VsUAAOOBPA&oh=00_AfY2LwFJ7B8kokk0ARDviHPXsCOMknpoo5Ys2HUUCSAP4w&oe=68C62D26",
"owner": {
"type": "User",
"id": "4"
}
},
...
]
}
}
Facebook Profile results for
profile_id
:
imuhammadovi
(General profile)
GET

https://serpapi.com/search.json?engine=facebook_profile&profile_id=imuhammadovi

Code to integrate

JavaScript

const { getJson } = require("serpapi");

getJson({
engine: "facebook_profile",
profile_id: "imuhammadovi",
api_key: "9a747a214ddde0973c6ebf528928865b59774e53f3fb5792f1642ab864382e73"
}, (json) => {
console.log(json["profile_results"]);
});

JSON Example

{
"search*metadata": {
"id": "68ca787ffc8a2b10b1634ca2",
"status": "Success",
"json_endpoint": "https://serpapi.com/searches/5a5df0cc73b0e894/68ca787ffc8a2b10b1634ca2.json",
"created_at": "2025-09-17 08:59:43 UTC",
"processed_at": "2025-09-17 08:59:43 UTC",
"facebook_profile_url": "https://www.facebook.com/imuhammadovi",
"raw_html_file": "https://serpapi.com/searches/5a5df0cc73b0e894/68ca787ffc8a2b10b1634ca2.html",
"total_time_taken": 1.15
},
"search_parameters": {
"engine": "facebook_profile",
"profile_id": "imuhammadovi"
},
"profile_results": {
"name": "Muhammad Ovi",
"alternate_name": "Owais",
"id": "pfbid02RVh3XQD5Qwf4mJ7zA8sB6oqS8d5mYZNKX8SMKeAPdFdyNwi9U5PXgYiq2ZGrUHagl",
"url": "https://www.facebook.com/imuhammadovi",
"gender": "male",
"profile_picture": "https://scontent-ord5-3.xx.fbcdn.net/v/t39.30808-1/415790053_2295873597280034_490046745487097994_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=109&ccb=1-7&_nc_sid=e99d92&_nc_ohc=WcSyofaz1hAQ7kNvwGba8gO&_nc_oc=AdndQmTtgjXLdFnK2Q49miKL7KGiK-d494Vg3alHt6OVkIBkQEpI_prKBLkXdN6y8KFay7PkTWPwvJ1jaZa2pqDS&_nc_zt=24&_nc_ht=scontent-ord5-3.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_AfbAX0MeCD5VVVGRaBukJk-vm2C_GdfS_hCfjpCia41vOw&oe=68D0338E",
"cover_photo": "https://scontent-ord5-3.xx.fbcdn.net/v/t39.30808-6/482212911_2628322297368494_562771956197593089_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=7lXySn5Jxh8Q7kNvwG6h-bL&_nc_oc=AdkcfBW0hxoGlqsGpsNtH5D5E8virvmqiwTluvqOAImay_ShXTxayZ9TPx7wvuthLJRxAqKN6e1Ft0nxatlZ_o9O&_nc_zt=23&_nc_ht=scontent-ord5-3.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_AfbcPOYQf8OdPwLbattdRCCF6KFKl0twC2r4vHtDDhAOJQ&oe=68D0499F",
"about_details": [
{
"section_type": "work",
"title": "Work",
"items": [
{
"title": "Senior Engineer at SerpApi, LLC",
"name": "SerpApi, LLC",
"facebook_link": "https://www.facebook.com/serpapicom",
"duration": "July 2024 - Present",
"location": "Austin, Texas",
"icon": "https://scontent-ord5-2.xx.fbcdn.net/v/t39.30808-1/300384407_438426054971037_7991889076361135528_n.png?stp=cp0_dst-png_s24x24&_nc_cat=103&ccb=1-7&_nc_sid=f907e8&_nc_ohc=Y48C44db5iYQ7kNvwFxk2Ws&_nc_oc=Adl4MdUkf1_6kkta6KX-uAczc5atjZCZPZKg6-4YPJNq8FgR-hw6zsYj84F97pkd1DHAzJmgWeQaQFJbj2opUmCu&_nc_zt=24&_nc_ht=scontent-ord5-2.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_AfY0dIGGljLx8S5y8AybZFMGRIHMQaHSCShnLYj-kkY8ag&oe=68D03B9D"
},
{
"title": "Former Tech Ambassador at CIRCLE",
"name": "CIRCLE",
"facebook_link": "https://www.facebook.com/circlewomen",
"duration": "2019 - 2020",
"location": "Karachi, Pakistan",
"icon": "https://scontent-ord5-3.xx.fbcdn.net/v/t39.30808-1/344069845_1654375871642859_2460729694773697400_n.jpg?stp=c155.155.770.770a_cp0_dst-jpg_s24x24_tt6&_nc_cat=107&ccb=1-7&_nc_sid=f907e8&_nc_ohc=6_Uu4lQ_hK0Q7kNvwHITbAY&_nc_oc=AdneN-b7we26budsKfoutfw2EXTuzLqXFe14KcpY_xl_FeHwQvdlFT3Lj0uq3ldhGcNstYFlFts0Ap0n5fZ5uWCa&_nc_zt=24&_nc_ht=scontent-ord5-3.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_Afaeo0WwJikVXA-UsI9OHsATNJNwDGPH9pKGp3IqEdLmNQ&oe=68D04CE4"
},
{
"title": "Former Senior Software Engineer at Zoovu",
"name": "Zoovu",
"facebook_link": "https://www.facebook.com/zoovu.company",
"icon": "https://scontent-ord5-2.xx.fbcdn.net/v/t39.30808-1/275384870_445715547342188_289569795249350186_n.jpg?stp=cp0_dst-jpg_s24x24_tt6&_nc_cat=105&ccb=1-7&_nc_sid=f907e8&_nc_ohc=tu4c7ImHCQwQ7kNvwHjKHV4&_nc_oc=AdmOcXIWBjk14c0J_Dr0ttt30N113whVKOTIQnCI3bsr8vDtprdVBoZmvUnLgPGt65eWY7pLo7gZusCo3qR9aJGQ&_nc_zt=24&_nc_ht=scontent-ord5-2.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_Afbn9iis28TfhLuxNxdOgynw-qg-W49E3iBos-atLOp7Bg&oe=68D0660F"
}
]
},
{
"section_type": "college",
"title": "College",
"items": [
{
"title": "Studied BSCS at Virtual University of Pakistan",
"facebook_link": "https://www.facebook.com/pages/Virtual-University-of-Pakistan/109689349056888",
"icon": "https://scontent-ord5-3.xx.fbcdn.net/v/t1.30497-1/83245568_1845797888897938_3274147281632231424_n.png?stp=c81.0.275.275a_cp0_dst-png_s24x24&_nc_cat=1&ccb=1-7&_nc_sid=613f8e&_nc_ohc=BXo0vVowllwQ7kNvwGF2MFl&_nc_oc=Adky-DznFubBowYsucVg7*-7btQR1AK5n8bAr1Uu-iavGj2xbEUBIfGjSSecplnaH7zlvUFVsb8j9xKfdmB-Lh7Y&\_nc_zt=24&\_nc_ht=scontent-ord5-3.xx&oh=00_Afb3DjbbmKsHxiY0BrkK8NXSY-9Qq1gdhsJ-C61ErpYyzA&oe=68F1EC54"
}
]
},
{
"section_type": "secondary_school",
"title": "High school",
"items": [
{
"title": "Went to Shaheen Grammar Academy",
"name": "Shaheen Grammar Academy",
"facebook_link": "https://www.facebook.com/ShaheenGrammarAcademy",
"duration": "Class of 2014",
"icon": "https://scontent-ord5-3.xx.fbcdn.net/v/t39.30808-1/309364476_602075831620006_2660869275445041401_n.jpg?stp=c64.0.411.411a_cp0_dst-jpg_s24x24_tt6&_nc_cat=100&ccb=1-7&_nc_sid=f907e8&_nc_ohc=8Nd_ab7Sf-cQ7kNvwElh_WM&_nc_oc=AdmlqFk3zfvsS11KAE4bj0adWO8Pg5l4IU6oivmEr28nG_d6Q_B0V5i-t1YdswzB72rOtaEh_SJBMRSOhX6lOEZn&_nc_zt=24&_nc_ht=scontent-ord5-3.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_AfYIVa_yYirUvxRAE-n68pdvKPOf5DmNlWIGABYiMqtecA&oe=68D055C4"
}
]
}
],
"photos": [
{
"link": "https://scontent-ord5-3.xx.fbcdn.net/v/t39.30808-6/484806646_3953756958202365_2284054582391686033_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=7mfLdeu6WakQ7kNvwER6KHY&_nc_oc=AdkdlsVyQYQDyeGv2vYkXz9vDpvMr1bUjbmHVe095gIsKBrCKfZm2MG3frvAJ0HcCnRX2ob-qpjG7gAJBduiMN6V&_nc_zt=23&_nc_ht=scontent-ord5-3.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_AfZ_qi8deDP9Mn_6d_6Wc3DbxxtXyFb9aKeqRjAe5E-C8w&oe=68D06600",
"owner": {
"type": "User",
"id": "100007042983890"
}
},
{
"link": "https://scontent-ord5-3.xx.fbcdn.net/v/t39.30808-6/468455899_2549269298607128_1136818646957529403_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=86c6b0&_nc_ohc=6JCgyspxtIgQ7kNvwFJl2Y3&_nc_oc=AdkHUM1Xu4p5PV1kV3m7gF9MvAhIxF4MfE7qABsu5s5YVGMO9MNPGn0NtNTxRzBUdmlVR93ZCRnB5X21ByNrAlrY&_nc_zt=23&_nc_ht=scontent-ord5-3.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_AfZ9gttaFMOfZiIuiUzuVbdAhv0jQanUKUVrTwCym0dbuQ&oe=68D03BDC",
"owner": {
"type": "User",
"id": "pfbid02RVh3XQD5Qwf4mJ7zA8sB6oqS8d5mYZNKX8SMKeAPdFdyNwi9U5PXgYiq2ZGrUHagl"
}
},
{
"link": "https://scontent-ord5-2.xx.fbcdn.net/v/t1.6435-9/92243592_1294551554078915_8049059451925168128_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_ohc=fyKzKrZuGBoQ7kNvwFSCnx3&_nc_oc=AdlTPQLf1uW-297CrAZo4eaANBsrmWZLjnI5HlvFQ6KAFpj0n8vd7ku1sIdwdHjehMG0Fk3O4yGUaCpfFHES0Map&_nc_zt=23&_nc_ht=scontent-ord5-2.xx&_nc_gid=o0i3CHdihh1Gu9irlCbOtQ&oh=00_AfbnWAWpioy1Zd9WmEQ2auSsi-G4UexsQut780aK3SkxMA&oe=68F1E34A",
"owner": {
"type": "User",
"id": "pfbid02RVh3XQD5Qwf4mJ7zA8sB6oqS8d5mYZNKX8SMKeAPdFdyNwi9U5PXgYiq2ZGrUHagl"
}
},
...
]
}
}
JSON structure overview
{
...
"profile_results": {
"name": "String - Name of the profile",
"alternate_name": "String - Alternate name of the profile",
"id": "String - ID of the profile",
"url": "String - Facebook URL of the profile",
"gender": "String - Gender of the profile",
"verified": "Boolean - true if profile is verified",
"profile_picture": "String - URL of the profile picture",
"cover_photo": "String - URL of the cover photo",
"has_stories": "Boolean - true if profile has stories",
"following": "String - Number of people the profile is following",
"followers": "String - Number of people the profile is followed by",
"likes": "String - Number of people the profile is liked by",
"profile_type": "String - Type of the profile, PAGE or PROFILE",
"profile_intro_text": "String - Intro/Bio/About text of the profile",
"category": "String - Category of the profile",
"managed_by": "String - Managed by the profile, if the profile is managed by a page",
"rating": "String - Rating of the profile",
"reviews": "Integer - Number of reviews of the profile",
"address": "String - Address of the profile",
"phone": "String - Phone number of the profile",
"email": "String - Email of the profile",
"business_hours": "String - Business hours of the profile",
"price_range": "String - Price range of the profile, denoted by currency symbol",
"links": [
{
"title": "String - Title of the link",
"link": "String - URL of the item",
"icon": "String - Icon of the link source"
},
...
],
"photos": [
{
"link": "String - Link to the photo",
"owner": {
"type": "String - Type of the owner, user or page",
"id": "String - ID of the owner"
}
},
...
],
// Below fields are available if profile is a Creator profile
"current_city": "String - Current city of the profile",
"hometown": "String - Hometown of the profile",
"relationship": "String - Relationship status of the profile",
"educations": [
{
"title": "String - Title of the educational institution",
"name": "String - Name of the educational institution",
"facebook_link": "String - Facebook link of the institution"
},
...
],
"works": [
{
"title": "String - Title of the workplace",
"name": "String - Name of the workplace",
"facebook_link": "String - Facebook link of the workplace",
"link": "String - URL of the workplace"
},
...
],
// Below fields are available if profile is a General profile
"about_details": [
{
"section_type": "String - Type of the section, work, college, secondary_school",
"title": "String - Title of the section",
"items": [
{
"title": "String - Title of the item",
"name": "String - Name of the item",
"facebook_link": "String - Facebook link of the item",
"duration": "String - Duration of the item",
"location": "String - Location of the item",
"icon": "String - Icon of the item"
},
...
]
},
...
],
// Below fields are available if profile is a Private profile
"private": "Boolean - true if profile is private"
}
}

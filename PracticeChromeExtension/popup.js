var width = '650px'

document.getElementById('p-personal').style.setProperty("padding-right",width,"important");
document.getElementById('mw-head').style.setProperty("padding-right",width,"important");
document.getElementById('content').style.setProperty("padding-right",width,"important");
document.getElementById('content').style.setProperty("margin-right",'1em',"important");
document.getElementById('footer').style.setProperty("padding-right",width,"important");
document.getElementById('footer').style.setProperty("margin-right",'1em',"important");

var div = document.createElement("div");
document.body.appendChild(div);
div.className = "extension";
var para = document.createElement('p');
var bgPage = chrome.extension.getBackgroundPage(); // not working right now http://stackoverflow.com/questions/13777887/call-background-function-of-chrome-extension-from-a-site
para.innerHTML = bgPage.getPageTitle();
div.appendChild(para);

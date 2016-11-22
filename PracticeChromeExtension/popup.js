var width = '650px'

document.getElementById('p-personal').style.setProperty("padding-right",width,"important");
document.getElementById('mw-head').style.setProperty("padding-right",width,"important");
document.getElementById('content').style.setProperty("padding-right",width,"important");
document.getElementById('content').style.setProperty("margin-right",'1em',"important");
document.getElementById('footer').style.setProperty("padding-right",width,"important");
document.getElementById('footer').style.setProperty("margin-right",'1em',"important");

var pageInformation = {title:"", url:""};
var ext = document.createElement("div");
document.body.appendChild(ext);
ext.id = "extension";
ext.className = "extension";
var kGraph = document.createElement("div");
ext.appendChild(kGraph);
kGraph.id = "knowledgeGraph";
kGraph.className = "knowledgeGraph";
kGraph.innerHTML = '<canvas id="springydemo" class="canvas" width="650" height="480" />';

pageInformation.title = document.getElementById('firstHeading').innerHTML;
pageInformation.url = window.location.href;

chrome.runtime.sendMessage(JSON.stringify(pageInformation), function(response) {
    var graph = new Springy.Graph();
    
    for (i = 0; i < response.nodes.length; i++) {
        graph.newNode(response.nodes[i].data);
        (function () {
            var currentIndex = i;
            var node = graph.nodes[currentIndex];
            node.data.ondoubleclick = 
                    function() { document.location.href = node.data.url; };            
        })();
    }
    
    for (i = 0; i < response.edges.length; i++) {
        graph.newEdge(graph.nodes[response.edges[i].source.id],
                graph.nodes[response.edges[i].target.id]);
    }

    jQuery(function(){
      var springy = window.springy = jQuery('#springydemo').springy({
        graph: graph,
        nodeSelected: function(node){
          console.log(node.data.url);
        }
      });
    });    
});

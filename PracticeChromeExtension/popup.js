var width = '650px'
annoText = "";

var paddingElems = ['p-personal', 'mw-head', 'content', 'footer'];
var marginElems = ['content', 'footer'];

for (elem in paddingElems)
    document.getElementById(paddingElems[elem]).style.setProperty("padding-right",width,"important");
    
for (elem in marginElems)
    document.getElementById(marginElems[elem]).style.setProperty("margin-right",'1em',"important");

var pageInformation = {title:"", url:""};

var ext = document.createElement("div");
document.body.appendChild(ext);
ext.id = "extension";
ext.className = "extension";

var kGraph = document.createElement("div");
ext.appendChild(kGraph);
kGraph.id = "knowledge-graph";
kGraph.className = "knowledge-graph";
kGraph.innerHTML = '<canvas id="springydemo" class="canvas" width="610" height="420" />';

var anno = document.createElement("div");
ext.appendChild(anno);
anno.id = "annotations";
anno.className = "annotations";

var addAnnotationSpan = document.createElement("span");
addAnnotationSpan.id = "add-annotation";
addAnnotationSpan.className = "add-annotation";
addAnnotationSpan.innerHTML = "Add Annotation";
addAnnotationSpan.onclick = function() { addAnnotation() };

document.body.appendChild(addAnnotationSpan);

pageInformation.title = document.getElementById('firstHeading').innerHTML;
pageInformation.url = window.location.href;

window.onload = function() {
    chrome.runtime.sendMessage({message:"load", pageInformation: JSON.stringify(pageInformation)}, function(response) {
        var graph = new Springy.Graph();
        
        for (i = 0; i < response.kGraph.nodes.length; i++) {
            graph.newNode(response.kGraph.nodes[i].data);
            (function () {
                var currentIndex = i;
                var node = graph.nodes[currentIndex];
                node.data.ondoubleclick = 
                        function() { document.location.href = node.data.url; };            
            })();
        }
        
        for (i = 0; i < response.kGraph.edges.length; i++) {
            graph.newEdge(graph.nodes[response.kGraph.edges[i].source.id],
                    graph.nodes[response.kGraph.edges[i].target.id]);
        }
        
        for (i = 0; i < response.anns.length; i++) {
            var newAnnotation = document.createElement("div");
            var par = document.createElement("p");
            par.innerHTML = response.anns[i].text;
            newAnnotation.appendChild(par);
            anno.appendChild(par);              
        }
        
        console.log(response.anns);

        jQuery(function(){
          var springy = window.springy = jQuery('#springydemo').springy({
            graph: graph,
            nodeSelected: function(node){
              // console.log(node.data.url);
            }
          });
        });    
    });
}

document.onmouseup = function(event) {
    if (addAnnotationSpan.style.visibility == "visible") {
        addAnnotationSpan.style.visibility = "hidden";
    } else {
        window.annoText = getSelectionText();
        if (window.annoText != "") {
            addAnnotationSpan.style.visibility = "visible";
            addAnnotationSpan.style.top = event.pageY + "px";
            addAnnotationSpan.style.left = event.pageX + "px";
        }        
    }
};

function addAnnotation() {
   if (window.annoText != "") {
        var newAnnotation = document.createElement("div");
        var par = document.createElement("p");
        par.innerHTML = window.annoText;
        newAnnotation.appendChild(par);
        anno.appendChild(par);
        
        chrome.runtime.sendMessage({message:"addAnnotation", annotate:window.annoText, key:pageInformation.title}, function(response) {
            console.log(response);
        });
    }
}

function getSelectionText() {
    var selText = "";
    if (window.getSelection) {
        selText = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        selText = document.selection.createRange().text;
    }
    return selText;
}



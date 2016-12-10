var width = '650px'
annoText = "";

var paddingElems = ['p-personal', 'mw-head', 'content', 'footer'];
var marginElems = ['content', 'footer'];

var pageInformation = {title:"", url:""};

var ext = document.createElement("div");
var kTitle = document.createElement("div");
var kContent = document.createTextNode("Knowledge Graph");
var kGraph = document.createElement("div");
var aTitle = document.createElement("div");
var aContent = document.createTextNode("Annotations");
var collapseAnn = document.createElement("span");
var anno = document.createElement("div");
var addNoteDiv = document.createElement("div");
var noteTextarea = document.createElement("textarea");
var saveNoteBtn = document.createElement("span");
var clearNoteBtn = document.createElement("span");
var addAnnotationSpan = document.createElement("span");

window.onload = function() {
    buildExtension();
    
    chrome.runtime.sendMessage({message:"load", pageInformation: JSON.stringify(pageInformation)}, function(response) {
        var graph = new Springy.Graph();
        
        for (i = 0; i < response.kGraph.nodes.length; i++) {
            graph.newNode(response.kGraph.nodes[i].data);
            (function () {
                var currentIndex = i;
                var node = graph.nodes[currentIndex];
                node.data.onclick = 
                        function() { document.location.href = node.data.url; };            
            })();
        }
        
        for (i = 0; i < response.kGraph.edges.length; i++) {
            graph.newEdge(graph.nodes[response.kGraph.edges[i].source.id],
                    graph.nodes[response.kGraph.edges[i].target.id]);
        }
        
        for (i = 0; i < response.anns.length; i++) {
            addAnnotationDiv(response.anns[i].quote, response.anns[i].note);
        }
        
        jQuery(function(){
          var springy = window.springy = jQuery('#springydemo').springy({
            graph: graph,
            nodeSelected: function(node){
                
            }
          });
        });    
    });
}

document.onmouseup = function(event) {
    if (window.innerWidth - event.pageX > 650) {
        if (addAnnotationSpan.style.visibility == "visible") {
            if (getSelectionText() == "") {
                addAnnotationSpan.style.visibility = "hidden";
            } else {
                window.annoText = getSelectionText();
                addAnnotationSpan.style.top = (event.pageY-40) + "px";
                addAnnotationSpan.style.left = (event.pageX-60) + "px";            
            }
        } else {
            window.annoText = getSelectionText();
            if (window.annoText != "") {
                addAnnotationSpan.style.visibility = "visible";
                addAnnotationSpan.style.top = (event.pageY-40) + "px";
                addAnnotationSpan.style.left = (event.pageX-60) + "px";
            }        
        }
    }
};

function buildExtension() {
    for (elem in paddingElems)
        document.getElementById(paddingElems[elem]).style.setProperty("padding-right",width,"important");
    
    for (elem in marginElems)
        document.getElementById(marginElems[elem]).style.setProperty("margin-right",'1em',"important");
    
    document.body.appendChild(ext);
    ext.id = "extension";
    ext.className = "extension";
	
	kTitle.appendChild(kContent);
	ext.appendChild(kTitle);
	kTitle.id = "Knowlege-Title"
	kTitle.className = "section-title"
	
    ext.appendChild(kGraph);
    kGraph.id = "knowledge-graph";
    kGraph.className = "knowledge-graph";
    kGraph.innerHTML = '<canvas id="springydemo" class="canvas" width="610" height="420" />';
	
	aTitle.appendChild(aContent);
	ext.appendChild(aTitle);
	aTitle.id = "Anno-Title"
	aTitle.className = "section-title"
    
    collapseAnn.className = "btn-link";
    ext.appendChild(document.createTextNode("["));
    collapseAnn.innerHTML = "Hide";
    collapseAnn.onclick = function() { collapseAnnotations(); };
    ext.appendChild(collapseAnn);
    ext.appendChild(document.createTextNode("]"));
	
    ext.appendChild(anno);
    anno.id = "annotations";
    anno.className = "annotations";

    addNoteDiv.className = "add-note-container";
    anno.appendChild(addNoteDiv);
        
    noteTextarea.className = "note-ta";
    addNoteDiv.appendChild(noteTextarea);

    saveNoteBtn.className = "btn";
    saveNoteBtn.innerHTML = "Save";
    saveNoteBtn.onclick = function() { addNote(); };
    addNoteDiv.appendChild(saveNoteBtn);

    clearNoteBtn.className = "btn";
    clearNoteBtn.innerHTML = "Clear";
    clearNoteBtn.onclick = function() { clearNote(); };
    addNoteDiv.appendChild(clearNoteBtn);

    addAnnotationSpan.id = "add-annotation";
    addAnnotationSpan.className = "add-annotation";
    addAnnotationSpan.innerHTML = "Add Annotation";
    addAnnotationSpan.onclick = function() { addAnnotation() };

    document.body.appendChild(addAnnotationSpan);

    pageInformation.title = document.getElementById('firstHeading').innerHTML;
    pageInformation.url = window.location.href;
}

function addNote() {
    saveAnnotation("", noteTextarea.value);
    clearNote();
}

function addAnnotation() {
    if (window.annoText.trim() != "") {
        var newAnnotation = document.createElement("div");
        var quoteP = document.createElement("p");
        var noteTa = document.createElement("textarea");
        var saveBtn = document.createElement("span");
        var cancelBtn = document.createElement("span");

        newAnnotation.className = "annotation";
        // newAnnotation.style.textAlign = "right";
        
        if (window.annoText.trim() != "")
            quoteP.innerHTML = '\"' + window.annoText.trim() + '\"';
        newAnnotation.appendChild(quoteP);
        
        noteTa.className = "note-ta";
        noteTa.style.width = "597px";
        newAnnotation.appendChild(noteTa);

        
        saveBtn.className = "btn";
        saveBtn.style.marginLeft = "485px";
        saveBtn.innerHTML = "Save";
        saveBtn.onclick = function() { 
            saveAnnotation(window.annoText.trim(), noteTa.value.trim()); 
            newAnnotation.parentNode.removeChild(newAnnotation);
        };
        newAnnotation.appendChild(saveBtn);

        cancelBtn.className = "btn";
        cancelBtn.innerHTML = "Cancel";
        cancelBtn.onclick = function() { 
            newAnnotation.parentNode.removeChild(newAnnotation); 
        };
        newAnnotation.appendChild(cancelBtn);
        
        anno.appendChild(newAnnotation);
    }
}

function saveAnnotation(quoteText, noteText) {
    addAnnotationSpan.style.visibility = "hidden";

    if ((quoteText.trim() != "")||(noteText.trim() != "")) {
        
        chrome.runtime.sendMessage({message:"addAnnotation", quote:quoteText, note:noteText, key:pageInformation.title}, function(response) {
            if (response.message != "success") {
                alert("Error saving annotation");
            } else {
                 addAnnotationDiv(quoteText.trim(), noteText.trim());
            }
        });
    }

    window.annoText = "";
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

function addAnnotationDiv(quote, note) {
    var newAnnotation = document.createElement("div");
    newAnnotation.className = "annotation";
    
    var quoteP = document.createElement("p");
    if (quote.trim() != "")
        quoteP.innerHTML = '\"' + quote + '\"';
    newAnnotation.appendChild(quoteP);
    
    var noteP = document.createElement("p");
    if (note.trim() != "")
        noteP.innerHTML = "— " + note;
    newAnnotation.appendChild(noteP);
    
    anno.appendChild(newAnnotation);    
}

function clearNote() {
    noteTextarea.value = "";
}

function collapseAnnotations() {
    // console.log("collapse");
    if (collapseAnn.innerHTML == "Hide") {
        anno.style.display = "none";
        anno.style.height = "0%";
        // console.log(anno.childNodes)
        // for (node in anno.childNodes)
        // {
            // node.style.height = "0%";
        // }
        kGraph.style.height = "750px";
        document.getElementById("springydemo").setAttribute("height", "740");
        collapseAnn.innerHTML = "Show";
        // kGraph.innerHTML = '<canvas id="springydemo" class="canvas" width="610" height="690" />'
    } else {
        anno.style.display = "block";
        anno.style.height = null;
        // for (node in anno.childNodes)
        // {
            // node.style.height = null;
        // }
        kGraph.style.height = "430px";
        document.getElementById("springydemo").setAttribute("height", "420");
        collapseAnn.innerHTML = "Hide";
    }
}
// function getPageTitle() {
	// var pageTitle = document.getElementById('firstHeading').innerHTML;
	// return pageTitle;
// }

var pages = [];
// var knowledgeGraph = {nodes: [], edges: []};
var previousPage = null;
var graph = new Springy.Graph();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var pageInfo = JSON.parse(request);
        
        var currentPage;
        var dupeNode = false;
        for (i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].data.label == pageInfo.title) {
                currentPage = graph.nodes[i];
                dupeNode = true;
            }
        }
        
        if (!dupeNode)
            currentPage = graph.newNode({label: pageInfo.title, url: pageInfo.url});
        
        var invalidEdge = false;

        if (previousPage == null)
            invalidEdge = true;
        else if (previousPage.data.label == currentPage.data.label)
            invalidEdge = true;
        
        for (i = 0; i < graph.edges.length; i++)
            if ((graph.edges[i].source.data.label == previousPage.data.label) 
                    && (graph.edges[i].target.data.label == currentPage.data.label))
                invalidEdge = true;
        
        if (!invalidEdge)
            graph.newEdge(previousPage, currentPage);            

        previousPage = currentPage;      
          
        sendResponse(graph);
});


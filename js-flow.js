var cnt = 0;
var nodes;
var lines;
var nodeStack = [];
var nodeData;

var selectedLineId;
var selectedNodeId;

var selectedId;
var zoomScale = 1;
var storageId = "";
var customClasses =  ['node-circle','node-short','connector','diamond'];
var sampleNodes = [
    {"top":"140px","left":"200px","id":"div1","data":{"content":"content 1"}},
    {"top":"300px","left":"500px","id":"div2","data":{"content":"content 2"}}
];

var sampleLines = [
                {   "fromDiv":"#div1",
                    "toDiv":"#div2",
                    "id":"line1",
                    "mode":"",
                    "lineShape":"curved",
                    "stroke":"#aaa",
                    "stroke-dasharray":"",
                    "marker-start":"line",
                    "marker-end":"arrow",
                    "labelText":"",
                    "stroke-width":"3"
                }
];


var inspectorElements = {
    "path":{
        "stroke":"x",
        "stroke-width":"x",
        "stroke-dasharray":"x",
        "animation-direction":"x",
        "marker-start":"x",
        "marker-end":"x",
        "id":"x",
        "labelText":"x",
        "labelPos":"x"
    }
}
var showPathLabels = true;

var __dx;
var __dy;
var __scale=1.0;
var __recoupLeft, __recoupTop;

/* minified code to set attributes on SVG element in one shot */
var setAttrs = (e,a)=>Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));

$.fn.extend({
    cssAsInt: function(_cssProp){
        return parseInt(this.css(_cssProp))
    }
})    

$(document).ready(function(){
    
    $(document).on('click',".widget", function(){
        var index;
        switch ( $(this).attr('id') ) {
            case "widgetAddNode":
                var nodeId = nodes.length + 1;
                nodes.push({"top":"100px","left":"100px","id":"div" + nodeId, "data":""});
                drawNodes(nodes);
            break;
            case "widgetDupeNode":
                var nodeId = nodes.length + 1;
                var newNode = {}
                var index = nodes.findIndex(obj => obj.id === selectedNodeId);
                for (const prop in nodes[index]) {
                    newNode[prop] = nodes[index][prop]
                }
                // over-ride some attributes on new node
                newNode['id'] = "div" + nodeId
                console.log(parseInt(newNode['top']));
                newNode['top'] = (parseInt(newNode['top']) + 20) + "px"
                newNode['left'] = (parseInt(newNode['left']) + 20) + "px"

                nodes.push(newNode);
                saveInfo();
                drawNodes(nodes);
            break;
            case "widgetClearSVG":
                $("svg").empty();
                selectedLineId = "";
                selectedNodeId = "";
            break;
            case "widgetClearNodes":
                $(".node").remove();
            break;
            case "widgetNodeShape":

                var found = -1;
                var node = $(`#${selectedNodeId}`);

                customClasses.forEach(function(item, i){
                    if (node.hasClass(customClasses[i])) {
                        node.removeClass(customClasses[i]);
                        found = i;
                    }
                })

                if (found === -1) {
                    node.addClass(customClasses[0])
                }

                if ( found < customClasses.length-1 ) {
                    node.addClass(customClasses[found+1])
                }

                drawLines();
                updateNodeInfo();
                saveInfo();
            
            break;
            case "widgetDrawNodes":
                drawNodes();
            break;
            case "widgetClearLine":
                clearSelectedLine();
            break;
            case "widgetSaveInfo":
                saveInfo();
            break;
            case "widgetLoadInfo":
                loadInfo();
            break;
            case "widgetToggleLine":
                toggleLine();
            break;
            case "widgetDeleteNode":
                widgetDeleteNode();
            break;
            case "widgetToggleLineShape":
                toggleLineShape();
            break;
            case "widgetToggleHighlight":
                $('.node').toggleClass('highlight-nodes')
            break;

            case "widgetPathSave":

                if (selectedLineId > "") {
                    var propRows = $(".prop-row");
                    index = lines.findIndex(obj => obj.id === selectedLineId);
                    propRows.each(function(_index, item){
                        var propname = $(item).find('.prop-name').html();
                        var propvalue = $(item).find('.prop-value').html().replace("<br>","");
                        lines[index][propname] = propvalue;
                    })
                }

                if (selectedNodeId > "") {
                    var propRows = $(".prop-row");
                    index = nodes.findIndex(obj => obj.id === selectedNodeId);
                    propRows.each(function(_index, item){
                        var propname = $(item).find('.prop-name').html();
                        var propvalue = $(item).find('.prop-value').html();
                        nodes[index].data[propname] = propvalue;
                    })
                }

                $('#inspector').empty();
                saveInfo();
                drawNodes();
                drawLines();

            break;
            case "widgetTogglePathLabel":
                $('.pathLabel').toggle();
                showPathLabels = !showPathLabels;
            break;
            case "widgetAddLine":
                var lineId = lines.length + 1;
                lines.push({"fromDiv":"#"+nodeStack[0],"toDiv":"#"+nodeStack[1],"id":"line"+lineId,"mode":"", "lineShape":"straight","stroke-width":"3"})            
                saveInfo();
                drawLines();
            break;
            case "widgetAddLineVert":
                var lineId = lines.length + 1;
                lines.push({"fromDiv":"#"+nodeStack[0],"toDiv":"#"+nodeStack[1],"id":"line"+lineId,"mode":"vert", "lineShape":"straight","stroke-width":"3"})            
                saveInfo();
                drawLines();
            break;
            case "widgetToggleLineDash":
                index = lines.findIndex(obj => obj.id === selectedLineId);
                var dashArray = lines[index]["stroke-dasharray"]
                if (dashArray === "") {
                    lines[index]["stroke-dasharray"] = "4,4";
                }  else {
                    lines[index]["stroke-dasharray"] = "";
                }
                saveInfo();
                drawLines();
            break;
            case "widgetToggleLineBegin":
                setLineBegin();
            break;
            case "widgetToggleLineEnd":
                setLineEnd();
            break;
            case "widgetZoomIn":
                zoomScale += .1;
                if (zoomScale > 1.0)  zoomScale=1;
                document.getElementById("main").style.transform = "scale("+zoomScale+")";
                __scale = zoomScale;
            break;
            case "widgetZoomOut":
                zoomScale -= .1;
                if (zoomScale < 0.5)  zoomScale=0.5;
                document.getElementById("main").style.transform = "scale("+zoomScale+")";
                __scale = zoomScale;
            break;
        }
    })

    function widgetDeleteNode() {
        var nodeId  = nodeStack[0];
        const index = nodes.findIndex(obj => obj.id === nodeId);
        if (index > -1) {
            nodes.splice(index, 1);
        }
        saveInfo();
        drawNodes();
        drawLines();
    }

    function clearSelectedLine() {
        const index = lines.findIndex(obj => obj.id === selectedLineId);
        if (index > -1) {
            lines.splice(index, 1);
        }
        saveInfo();
        drawLines();
    }

    function toggleLine() {
        const index = lines.findIndex(obj => obj.id === selectedLineId);
        if (index > -1) {
            lines[index].mode = (lines[index].mode == "") ? "vert" : ""; 
        }
        saveInfo();
        drawLines();
    }

    function toggleLineShape() {
        const index = lines.findIndex(obj => obj.id === selectedLineId);
        if (index > -1) {
             switch( lines[index].lineShape ) {
                case "straight":
                    lines[index].lineShape = "curved"
                    break;
                case "curved":
                    lines[index].lineShape = "angled"
                    break;
                case "angled":
                    lines[index].lineShape = "straight"
                    break;
             }
             saveInfo();
             drawLines();
        }
    }

    $(document).on('input','.content', function(){
        updateNodeInfo();
        saveInfo();
    })
    $(document).on('focus','.content', function(){
        console.log('input focus...')
    })


    $(document).on('click',".node", function(){
        // fires when a widget gets clicked
        
        if (! $(this).hasClass('handles')) {
            nodeStack.push( $(this).attr('id') );
            selectedNodeId = $(this).attr('id');

            
            var index = nodes.findIndex(obj => obj.id === selectedNodeId);
            nodeData = nodes[index].data;
            $('#inspector').empty();
            for (const key in nodeData) {
                addInspectorRow(key, nodeData[key]);
             }            
            addInspectorSaveButton();


            nodeStack = nodeStack.slice(-2);
            $(".node").removeClass('selectedBorder')
            $(this).addClass('selectedBorder');
        }
    })

    $(document).on('click',"svg,path,circle", function(){
        $(".node").removeClass('selectedBorder')
    })

})

function setStorageId(_storageId) {
    storageId = _storageId
}
function saveInfo() {
    localStorage.getItem(storageId + '-jsFlow');
    var dataToSave = {"nodes":nodes,"lines":lines}
    localStorage.setItem(storageId + '-jsFlow',JSON.stringify(dataToSave))
}
function loadInfo() {
    var dataToLoad = JSON.parse(localStorage.getItem(storageId + '-jsFlow'));
    if (dataToLoad) {
        lines = dataToLoad.lines;
        nodes = dataToLoad.nodes;
    } else {
        setNodes(sampleNodes);
        setLines(sampleLines);
    }
    saveInfo();
}

function isJSON(_input) {

    if (_input && typeof _input === "object") {
        return true;
    }
    else {
        /* might be a string, try to parse it and see if it's JSON */
        try {
            var o = JSON.parse(_input);
            if (o && typeof o === "object") {
                return true;
            }
        }
        catch (e) { }
        return false;    
    }
}

function createNodeContent(_item) {

    _item = callbacks.getCustomNodeContent(_item);
    
    if (isJSON(_item)) {
        /* return default html integrated with json data */
        return `
            <div contenteditable="true" class="content title-text">${_item.data.title}</div>
            <div contenteditable="true" class="content content-text">${_item.data.content}</span>
        `;
    } else {
        /* return whatever html is returned from custom getCustomNodeContent() function call */
        return _item;
    }

}

function createNode(_item) {
    var node =  $(`
        <div class="node">
            <div class="nodeHandles">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div class="content-parent">
                ${createNodeContent(_item)}
            </div>
        </div>
        `);
    node.addClass(_item.classesToAdd);
    return node;
}
function createHandlesNode() {
    return $(`
        <div class="node handles" id="handlesContainer">
            <div class="handle topHandle"></div>
            <div class="handle bottomHandle"></div>
            <div class="handle leftHandle"></div>
            <div class="handle rightHandle"></div>
        </div>`);
}
function updateNodeInfo() {
    // need to change this to update existing node info instead of blowing them
    // all away and re-adding.  This is done to preserve the data entered
    var classesToCheck = customClasses;
    var classesToAdd;
    var nodeList = $('.node');
    // nodes = [];
    // for (var i=0; i<nodeList.length; i++) {
    //     if ($(nodeList[i]).attr('id') != "handlesContainer") {
            
    //         var nodeClasses = $(nodeList[i]).attr('class')
    //         classesToAdd = "";
    //         classesToCheck.forEach(function(item){
    //             if ( nodeClasses.indexOf(item) > -1 ) {
    //                 classesToAdd += item + " "
    //             }
    //         })

    //         var nodeToAdd = {
    //             "top":$(nodeList[i]).css('top'),
    //             "left":$(nodeList[i]).css('left'),
    //             "id":$(nodeList[i]).attr('id'),
    //             "classesToAdd":classesToAdd
    //         }

    //         nodeToAdd.data = {
    //             "title":$(nodeList[i]).find('div.content.title-text').html().replace("<br>",""),
    //             "content":$(nodeList[i]).find('div.content.content-text').html().replace("<br>","")
    //         }

    //         nodes.push(nodeToAdd)
    //     }
    // }

    for (var i=0; i<nodeList.length; i++) {
        var nodeId = $(nodeList[i]).attr('id')
        const index = nodes.findIndex(obj => obj.id === nodeId);
        console.log(index);
        nodes[index].top = $(nodeList[i]).css('top')
        nodes[index].left = $(nodeList[i]).css('left')
    }

}
function drawNodes() {

    $(".node").remove();
    nodes.forEach(function(item){
        $('#main').append(createNode(item)
        .css({'top':item.top,'left':item.left})
        .attr('id',item.id))
        if (item.classesToAdd > "") {
            $("#" + item.id).addClass(item.classesToAdd)
        }
    })

    //$('#main').append(createHandlesNode());

    $('.node').draggable({ 
        grid: [ 20, 20 ], 
        drag: function (event, ui) {
            //resize bug fix ui drag `enter code here`
            __dx = ui.position.left - ui.originalPosition.left;
            __dy = ui.position.top - ui.originalPosition.top;
            //ui.position.left = ui.originalPosition.left + ( __dx/__scale);
            //ui.position.top = ui.originalPosition.top + ( __dy/__scale );
            ui.position.left = ui.originalPosition.left + (__dx);
            ui.position.top = ui.originalPosition.top + (__dy);
            //
            ui.position.left += __recoupLeft;
            ui.position.top += __recoupTop;
        },
        start: function (event, ui) {
            $(this).css('cursor', 'pointer');
            //resize bug fix ui drag
            var left = parseInt($(this).css('left'), 10);
            left = isNaN(left) ? 0 : left;
            var top = parseInt($(this).css('top'), 10);
            top = isNaN(top) ? 0 : top;
            __recoupLeft = left - ui.position.left;
            __recoupTop = top - ui.position.top;
        },
        create: function (event, ui) {
            $(this).attr('oriLeft', $(this).css('left'));
            $(this).attr('oriTop', $(this).css('top'));
        },
        stop: function(event, ui) {
            updateNodeInfo();
            saveInfo();
            drawLines();
            $(this).css('cursor', 'default');
        }
    })

}
/*
*   SVG definition for end of line markers
*/
function getSVGMarkers() {
    return `
        <defs>
            <!-- various markers used on line begin/end -->
            <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
                stroke="content-stroke">
                <path d="M 0 0 L 10 5 L 0 10 z"  />
            </marker>
            <marker
                id="line"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
                stroke="content-stroke">
                <path d="M 0 4 L 10 4 L 10 6 L 0 6 z"  />
            </marker>
            <marker
                id="circle"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
                stroke="content-stroke">
                <circle r="5" cx="5" cy="5" />
            </marker>
        </defs>
    `;
}
function drawLines() {

    $("svg").empty();
    selectedLineId = "";
    selectedNodeId = "";
    $(".pathLabel").remove();
    $('.jma').remove();

    $("svg").append(getSVGMarkers())
    lines.forEach(function(item){
        drawLine(item.fromDiv,item.toDiv,item.mode,item.id)
    })
    if (!showPathLabels) {
        $(".pathLabel").toggle();
    }
    $("svg").html($("svg").html());
    addSVGListeners();

}
function addRedrawButton() {
    $('#controlLayer').append( $(`<div class="redraw"><button class="btnRedraw">Re-Draw</button></div>`) );
    $(".btnRedraw").on('click', drawLines)
}
function addControls() {
    $('#controlLayer').append($(`
        <div class="controls">
            <button class="button" id="btnSave">Save</button>
            <button class="button" id="btnLoad">Load</button>
        </div>`));
}
function addWidgets() {
    $('#controlLayer').append($(`
        <div class="widgets scroller">
            <div class="widget" id="widgetAddNode">Add Node</div>
            <div class="widget" id="widgetDupeNode">Duplicate Node</div>
            <div class="widget" id="widgetDeleteNode">Delete Node</div>
            <div class="widget" id="widgetNodeShape">Node Shape</div>
            <div class="widget" id="widgetAddLine">Add Line Horiz</div>
            <div class="widget" id="widgetAddLineVert">Add Line Vert</div>
            <div class="widget" id="widgetClearLine">Clear Line</div>
            <div class="widget" id="widgetToggleLine">Line Orientation</div>
            <div class="widget" id="widgetToggleLineShape">Line Shape</div>
            <div class="widget" id="widgetToggleLineDash">Line Dash</div>
            <div class="widget" id="widgetToggleLineBegin">Line Begin</div>
            <div class="widget" id="widgetToggleLineEnd">Line End</div>
            <div class="widget" id="widgetTogglePathLabel">Path Label</div>
            <div class="widget" id="widgetToggleHighlight">Node Highlight</div>
            <div class="widget" id="widgetZoomIn">Zoom In</div>
            <div class="widget" id="widgetZoomOut">Zoom Out</div>
        </div>`))
}
function addInspector() {
    $('#controlLayer').append($(`
        <div id="inspector" class="inspector scroller">
        </div>
    `))
}
function addInspectorRow(_prop, _value) {
    $('#inspector').append($(`
        <div class="prop-row">
            <span class="prop-name">${_prop}</span>
            <span class="prop-value" contenteditable="true">${_value}</span>
        </div>
    `))
}
function addInspectorSaveButton() {
    $('#inspector').append($(`
        <button class="widget" id="widgetPathSave">Save</button>    
    `))
}
function addSVGListeners() {
    $('svg').on('click', function(){
        $('#inspector').empty();
        nodeStack = [];
        selectedLineId = "";
        selectedNodeId = "";
        $(".node").removeClass('selectedBorder')
        $('path').css("stroke","#aaa")
        event.stopPropagation();
    })

    $('svg > path').on('click', function(event){
        selectedLineId = $(this).attr('id');
        selectedId = selectedLineId;
        iterateAttributes(event);
        $(".node").removeClass('selectedBorder')
        $('path').css("stroke","#aaa")
        $(this).css("stroke","black")
        event.stopPropagation();
    })
    
    $('svg > circle').on('click', function(){
        $('#inspector').empty();
        $(".node").removeClass('selectedBorder')
        event.stopPropagation();
    })
}
function createSVGCircle(x, y, radius, fillColor) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg',"circle");  
    circle.setAttribute("cx", x)
    circle.setAttribute("cy", y)
    circle.setAttribute("r", radius)
    circle.setAttribute("fill", fillColor)
    return circle;
}


function setLineBegin() {
    const index = lines.findIndex(obj => obj.id === selectedLineId);
    if (index > -1) {
         switch( lines[index]["marker-start"] ) {
            case "line":
                lines[index]["marker-start"] = "arrow"
                break;
            case "arrow":
                lines[index]["marker-start"] = "circle"
                break;
            case "circle":
                lines[index]["marker-start"] = ""
                break;
            case "":
                lines[index]["marker-start"] = "line"
                break;
            default:
                lines[index]["marker-start"] = ""
         }
         saveInfo();
         drawLines();
    }
}

function setLineEnd() {
    const index = lines.findIndex(obj => obj.id === selectedLineId);
    if (index > -1) {
         switch( lines[index]["marker-end"] ) {
            case "line":
                lines[index]["marker-end"] = "arrow"
                break;
            case "arrow":
                lines[index]["marker-end"] = "circle"
                break;
            case "circle":
                lines[index]["marker-end"] = ""
                break;
            case "":
                lines[index]["marker-end"] = "line"
                break;
            default:
                lines[index]["marker-end"] = ""
         }
         saveInfo();
         drawLines();
    }

}

function iterateAttributes(_event) {
    var nodeName = _event.target.nodeName;
    $('#inspector').empty();
    var attributes = _event.target.attributes;
    var _id = "";

    for (const attr of attributes) {
        if (attr.name === "id") {_id = attr.value}
    }

    selectedLineId = _id;
    const index = lines.findIndex(obj => obj.id === selectedLineId);
    const lineInfo = lines[index];

    for (const key in inspectorElements[nodeName]) {
       addInspectorRow(key, lineInfo[key]);
    }
    
    addInspectorSaveButton();
}

function createSVGPath(pathData, strokeColor, fillColor, lineId) {

    const index = lines.findIndex(obj => obj.id === lineId);
    var dashArray = lines[index]["stroke-dasharray"]
    var stroke = lines[index]["stroke"] || "#aaa";

    var newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");  
    newpath.setAttribute("d", pathData);  
    newpath.setAttribute("stroke", stroke);
    newpath.setAttribute("fill", "transparent");
    newpath.setAttribute("id", lineId);  
    newpath.setAttribute("stroke-width", lines[index]['stroke-width']);
    newpath.setAttribute("stroke-dasharray", lines[index]["stroke-dasharray"]);  
    newpath.setAttribute("marker-start", `url(#${lines[index]["marker-start"]})`);
    newpath.setAttribute("marker-end", `url(#${lines[index]["marker-end"]})`);

    if (dashArray > "") {
        var animationDirection = lines[index]["animation-direction"] || "100;0";
        const animate = document.createElementNS('http://www.w3.org/2000/svg', "animate");
        animate.setAttribute("attributeName", "stroke-dashoffset");
        animate.setAttribute("values", animationDirection);
        animate.setAttribute("calcMode", "linear");
        animate.setAttribute("dur", "4s");
        animate.setAttribute("repeatCount", "indefinite");
        newpath.appendChild(animate);
    }
    return newpath;

}

/*
* Setter to allow adding node information to module
*/
function setNodes(_nodes) {
    nodes = _nodes;
}
/*
* Setter to allow adding line information to module
*/
function setLines(_lines) {
    lines = _lines;
}
/*
* Get dimensions for bounding box between 2 existing divs to draw line/curve within
*/
function getCurveBoundingBoxPoints(beginDiv, endDiv, mode = "") {


    if (mode === "") {
        var top = $(beginDiv).cssAsInt("top") + $(beginDiv).cssAsInt("height") / 2
        var left = $(beginDiv).cssAsInt("left") + $(beginDiv).cssAsInt("width")
        var width = $(endDiv).cssAsInt("left") - left;
        var height = $(endDiv).cssAsInt('top') - top + ($(endDiv).cssAsInt('height') / 2);

        if ($(beginDiv).hasClass('connector')) {
            left -= 20;
            width += 20;
        }
        if ($(endDiv).hasClass('connector')) {
            width += 20;
        }


    }
    if (mode === "vert") {
        var top = $(beginDiv).cssAsInt("top") + $(beginDiv).cssAsInt("height");
        var left = $(beginDiv).cssAsInt("left") + ( $(beginDiv).cssAsInt("width") / 2 );
        //var width = $(endDiv).cssAsInt('left') - $(beginDiv).cssAsInt('left');
        var width = $(endDiv).cssAsInt('left') - $(beginDiv).cssAsInt('left')
        // then adjust the bounding box width based on the begin/end width of the nodes
        width += ( $(endDiv).cssAsInt('width')/2 - $(beginDiv).cssAsInt('width')/2 )
        var height = $(endDiv).cssAsInt('top') - top;
        
        if ($(beginDiv).hasClass("connector")) {
            top -= 20;
            height += 20
        }
        if ($(endDiv).hasClass("connector")) {
            height += 20;
        }
    
    }




    return {"top":top,"left":left,"width":width,"height":height}
    
}


function setSampleNodes(_nodes) {
    sampleNodes = _nodes;
}
function setSampleLines(_lines) {
    sampleLines = _lines;
}

function loadDataFromUrl(url) {
    return fetch(url)
    .then(function(response) {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(function(myJson) {
        setSampleNodes(myJson.nodes);
        setSampleLines(myJson.lines);
        return true;
    })
}

/*
* Draw line/curve between 2 divs of a certain type
*/
function drawLine(beginDiv, endDiv, mode, lineId) {
    var points = getCurveBoundingBoxPoints(beginDiv, endDiv, mode);

    const index = lines.findIndex(obj => obj.id === lineId);
    const lineShape = lines[index].lineShape;

    // pull properties out of object for brevity later in code
    var { left, top, width, height } = points;

    // tweak some of the values for connecting to the node points
    if (mode === "vert") {
        top += 8;
        height -= 14;
    }
    if (mode === "") {
        left += 8;
        width -= 14;
    }

    if (lineShape === "curved") {
        if (mode === "") {
            var pathData = `M ${left} ${top} C ${left+(width/2)} ${top}, ${left+(width/2)} ${top+height}, ${left+width} ${top+height}`
        }
        if (mode === "vert") {
            var pathData = `M ${left} ${top} C ${left} ${top+(height/2)}, ${left+width} ${top+(height/2)}, ${left+width} ${top+height}`
        }
    }

    if (lineShape === "straight") {
        var pathData = `M ${left} ${top} L ${left+width} ${top+height}`
    }

    if (lineShape === "angled") {
        if (mode === "") {
            var pathData = `M ${left} ${top} L ${left+(width/2)} ${top} L ${left+(width/2)} ${top+height} L ${left+width} ${top+height}`
        }
        if (mode === "vert") {
            var pathData = `M ${left} ${top} L ${left} ${top+(height/2)} L ${left+width} ${top+(height/2)} L ${left+width} ${top+height}`
        }
    }


    // debugging code to show bounding box to help with paths
    // var boundingBox = $("<div class='jma'></div>");
    // boundingBox.css({"top":top,"left":left,"width":width + "px","height":height + "px"})
    // boundingBox.css({"position":"absolute","float":"left","border":"1px solid red"})
    // $('#main').append(boundingBox);
    // end debugging code for bounding box


    var newPath = createSVGPath(pathData, "#aaa","transparent", lineId)
    document.getElementById('svgcontainer').appendChild(newPath);
    var svgLength = newPath.getTotalLength();

    if (lines[index].labelText) {
        // ADD A LABEL ALONG PATH IF NEEDED
        //   get point coords from svg path for a point based on total length of path
        var svgPoint = newPath.getPointAtLength(svgLength * ( parseFloat(lines[index].labelPos) || 0.5 )   );
        //   add a label along the path
        var newDiv = $(`<div class="pathLabel"><span>${lines[index].labelText}</span></div>`)
        newDiv.attr('id','path-label-' + lineId)
        $('#main').append(newDiv)
        newDiv.css({"top":svgPoint.y - (newDiv.height()/2),"left":svgPoint.x - (newDiv.width()/2)})
        // END OF PATH LABEL CHANGES
    }

}


const callbacks = {
    getCustomNodeContent: function(_item){ return _item}
}

const parameters = {
    customClasses: customClasses
}


export { 
    addRedrawButton, 
    addControls, 
    addWidgets,
    addInspector,
    addInspectorRow,
    addInspectorSaveButton,
    drawNodes, 
    drawLines,
    loadInfo,
    saveInfo,
    setNodes,
    setLines,
    setStorageId,
    loadDataFromUrl,
    sampleLines,
    sampleNodes,
    setSampleNodes,
    setSampleLines,
    callbacks,
    parameters
}
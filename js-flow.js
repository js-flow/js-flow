var cnt = 0;
var nodes;
var lines;
var nodeStack = [];
var nodeData;

var selectedLineId;
var selectedNodeId;

var selectedId;
var zoomScale = 1;
var storageId = "js-flow-storageId";
var customClasses =  ['node-circle','node-short','connector','diamond',"label-headline"];

var sampleNodes = [
    {"top":"140px","left":"200px","id":"div1","data":{"content":"content 1"},"classesToAdd":"","width":"","height":""},
    {"top":"300px","left":"500px","id":"div2","data":{"content":"content 2"},"classesToAdd":"","width":"","height":""}
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
        "stroke":"#aaaaaa",
        "stroke-width":"",
        "stroke-dasharray":"",
        "animation-direction":"",
        "marker-start":"",
        "marker-end":"",
        "id":"",
        "labelText":"",
        "labelPos":"0.5",
        "x1-offset":"0",
        "y1-offset":"0",
        "x2-offset":"0",
        "y2-offset":"0",
        "startLinePos":"0.5",
        "endLinePos":"0.5"
    }
}
var showPathLabels = true;

var __dx;
var __dy;
var __scale=1.0;
var __recoupLeft, __recoupTop;

/* minified code to set attributes on SVG element in one shot */
var setAttrs = (e,a)=>Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));


/* need to use .offset() or .position() if a number isn't available */
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
                nodes.push({"top":"100px","left":"100px","id":"div" + nodeId, "data":{"title":"","content":""},"classesToAdd":"","width":"","height":""});
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
                $(parameters.svgId).empty();
                selectedLineId = "";
                selectedNodeId = "";
            break;
            case "widgetClearNodes":
                $(".node").remove();
            break;
            case "widgetNodeShape":

                var found = -1;
                var node = $(`#${selectedNodeId}`);
                var index = nodes.findIndex(obj => obj.id === selectedNodeId);

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
                    nodes[index].classesToAdd = customClasses[found+1];
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
                        if (propname === "stroke") {
                            propvalue = $(item).find('.prop-value').val();
                        }
                        lines[index][propname] = propvalue;
                    })
                }

                if (selectedNodeId > "") {
                    var propRows = $(".prop-row");
                    index = nodes.findIndex(obj => obj.id === selectedNodeId);
                    propRows.each(function(_index, item){
                        var propname = $(item).find('.prop-name').html();
                        var propvalue = $(item).find('.prop-value').html().replace("<br>","");

                        if (propname.substr(0,4) === "data") {
                            propname = propname.replace("data.","");
                            nodes[index].data[propname] = propvalue;
                        } else {
                            console.log(`setting ${propname} to ${propvalue}`)
                            nodes[index][propname] = propvalue;
                        }

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
                //document.getElementById(parameters.svgWrapperDivId).style.transform = "scale("+zoomScale+")";
                document.getElementById(parameters.gridCanvasId).style.transform = "scale("+zoomScale+")";
                document.getElementById(parameters.svgId).style.transform = "scale("+zoomScale+")";
                document.getElementById(parameters.htmlCanvasId).style.transform = "scale("+zoomScale+")";
                __scale = zoomScale;
            break;
            case "widgetZoomOut":
                zoomScale -= .1;
                if (zoomScale < 0.5)  zoomScale=0.5;
                //.gridCanvas, .svgCanvas, .htmlCanvas {
                //document.getElementById(parameters.svgWrapperDivId).style.transform = "scale("+zoomScale+")";
                document.getElementById(parameters.gridCanvasId).style.transform = "scale("+zoomScale+")";
                document.getElementById(parameters.svgId).style.transform = "scale("+zoomScale+")";
                document.getElementById(parameters.htmlCanvasId).style.transform = "scale("+zoomScale+")";
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
            if (!nodeData) {
                nodeData = {
                    title:"",
                    content:""
                }
            }
            
            /* add data nodes first */
            for (const key in nodeData) {
                addInspectorRow("data." + key, nodeData[key]);
            }

            /* add other attributes to inspector */
            for (const key in nodes[index]) {
                if (key != "data") {
                    addInspectorRow(key, nodes[index][key]);
                }
            }

            addInspectorSaveButton();

            nodeStack = nodeStack.slice(-2);
            $(".node").removeClass('selectedBorder')
            $(this).addClass('selectedBorder');
        }
    })

    $(document).on('click',"#" + parameters.svgId + ",path,circle", function(){
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

    if (typeof getContentCallbacks[_item.classesToAdd] === "function") {
        _item = getContentCallbacks[_item.classesToAdd](_item);
    } 

    if (isJSON(_item)) {
        /* return default html integrated with json data with some default classes*/
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

    for (var i=0; i<nodeList.length; i++) {
        var nodeId = $(nodeList[i]).attr('id')
        const index = nodes.findIndex(obj => obj.id === nodeId);
        console.log(index);
        nodes[index].top = $(nodeList[i]).css('top')
        nodes[index].left = $(nodeList[i]).css('left');
    }

}
function drawNodes() {

    $(".node").remove();
    nodes.forEach(function(item){
        $('#' + parameters.htmlCanvasId).append(createNode(item)
        .css({'top':item.top,'left':item.left,'width':item.width,'height':item.height})
        .attr('id',item.id))
        if (item.classesToAdd > "") {
            $("#" + item.id).addClass(item.classesToAdd)
        }
    })

    $('#' + parameters.svgWrapperDivId).draggable();

    // $('.node').resizable();

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
            // clear out inspector so there aren't old bad values
            $('#inspector').empty();
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
            callbacks.nodeMoveStop($(this));
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

    $("#" + parameters.svgId).empty();
    $(".pathLabel").remove();
    $('.jma').remove();

    $("#" + parameters.svgId).append(getSVGMarkers())
    lines.forEach(function(item){
        drawLine(item.fromDiv,item.toDiv,item.mode,item.id)
    })
    if (!showPathLabels) {
        $(".pathLabel").toggle();
    }
    //TODO: Still need this line for setting html ?
    $("#" + parameters.svgId).html($("#" + parameters.svgId).html());
    addSVGListeners();

}
function addRedrawButton() {
    $('#' + parameters.controlLayerId).append( $(`<div class="redraw"><button class="btnRedraw">Re-Draw</button></div>`) );
    $(".btnRedraw").on('click', drawLines)
}
function addControls() {
    $('#' + parameters.controlLayerId).append($(`
        <div class="controls">
            <button class="button" id="btnSave">Save</button>
            <button class="button" id="btnLoad">Load</button>
        </div>`));
}
function addWidgets() {
    $('#' + parameters.controlLayerId).append($(`
        <div class="widgets">
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
    $('#' + parameters.controlLayerId).append($(`
        <div id="inspector" class="inspector">
        </div>
    `))
}

function addInspectorRow(_prop, _value) {
    if (_prop === "stroke") {
        $('#inspector').append($(`
            <div class="prop-row">
                <span class="prop-name">${_prop}</span>
                <input class="prop-value" type="color" value="${_value}" />
            </div>
        `))
    } else {
        $('#inspector').append($(`
            <div class="prop-row">
                <span class="prop-name">${_prop}</span>
                <span class="prop-value" contenteditable="true">${_value}</span>
            </div>
        `))
    }
}

function addInspectorSaveButton() {
    $('#inspector').append($(`
        <button class="widget" id="widgetPathSave">Save</button>    
    `))
}
function addSVGListeners() {
    $("#" + parameters.svgId).on('click', function(){
        $('#inspector').empty();
        nodeStack = [];
        selectedLineId = "";
        selectedNodeId = "";
        $(".node").removeClass('selectedBorder');
        $('svg > path').removeClass("selected");

        //$('path').css("stroke","#aaa")
        event.stopPropagation();
    })

    $('#' + parameters.svgId + ' > path').on('click', function(event){
        console.log('here in svg path click...');
        selectedLineId = $(this).attr('id');
        selectedId = selectedLineId;
        iterateAttributes(event);
        $(".node").removeClass('selectedBorder')
        $('path').removeClass("selected");
        $(this).addClass("selected");
        event.stopPropagation();
    })
    
    $('#' + parameters.svgId + ' > circle').on('click', function(){
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
        var val = lineInfo[key];
        console.log(key + " " + val);
        if (val === undefined) {
            val = inspectorElements[nodeName][key]    
        }
        addInspectorRow(key, val );
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
function getCurveBoundingBoxPoints(beginDiv, endDiv, mode = "", lineId) {

    const index = lines.findIndex(obj => obj.id === lineId);
    const linePos = lines[index].linePos;

    // where line is connected to node.  0.5 is centered 0.1 is top/left, 0.9 is bottom/right
    const startLinePos = parseFloat(lines[index].startLinePos) || 0.5;
    const endLinePos = parseFloat(lines[index].endLinePos) || 0.5;

    // const startLinePos = 0.5;
    // const endLinePos = 0.5;

    if (mode === "") {
        var top = $(beginDiv).cssAsInt("top") + $(beginDiv).cssAsInt("height") * startLinePos;
        var left = $(beginDiv).cssAsInt("left") + $(beginDiv).cssAsInt("width")
        var width = $(endDiv).cssAsInt("left") - left;
        var height = $(endDiv).cssAsInt('top') - top + ($(endDiv).cssAsInt('height') * endLinePos);

        console.log( $(beginDiv).cssAsInt("top") );

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
        var left = $(beginDiv).cssAsInt("left") + ( $(beginDiv).cssAsInt("width") * startLinePos );
        var width = $(endDiv).cssAsInt('left') - $(beginDiv).cssAsInt('left')
        width += ( $(endDiv).cssAsInt('width')/2 - $(beginDiv).cssAsInt('width') * endLinePos )
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
        nodes = myJson.nodes;
        lines = myJson.lines;
        return true;
    })
}

/*
* Draw line/curve between 2 divs of a certain type
*/
function drawLine(beginDiv, endDiv, mode, lineId) {
    var points = getCurveBoundingBoxPoints(beginDiv, endDiv, mode, lineId);

    const index = lines.findIndex(obj => obj.id === lineId);
    const lineShape = lines[index].lineShape;

    // pull properties out of object for brevity later in code
    var { left, top, width, height } = points;

    var x1,y1,x2,y2
    x1 = parseFloat(lines[index]['x1-offset']);
    y1 = parseFloat(lines[index]['y1-offset']);
    x2 = parseFloat(lines[index]['x2-offset']);
    y2 = parseFloat(lines[index]['y2-offset']);

    // tweak some of the values for connecting to the node points
    if (mode === "vert") {
        if (x1) {
            if (width > 0) {
                left += x1
                width -= (x1 - x2)
            } else if (width < 0) {
                left += x1
                width -= x1 
            }
        }

        if ( x2 ) {
            if (width >= 0) {
                width += x2
            } else if (width < 0) {
                width += x2;
            }
        }

        top += 8;
        height -= 14;
    }

    // horizontal line
    if (mode === "") {
        if ( y1 ) {
            if (height > 0) {
                top += y1
                height -= (y1 - y2)
            } else if (height < 0) {
                top += y1
                height -= y1 
            }
        }

        if ( y2 ) {
            if (height >= 0) {
                height += (y1 - y2);
            } else if (height < 0) {
                height += y2;

            }
        }

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
    // if (height < 0) {
    //     top += height;
    //     height = Math.abs(height);
    // }
    // var boundingBox = $("<div class='jma'></div>");
    // boundingBox.css({"top":top + "px","left":left + "px","width":(width) + "px","height":(height) + "px"})
    // boundingBox.css({"position":"absolute","float":"left","border":"1px solid red"})
    // $('#htmlCanvas').append(boundingBox);
    // end debugging code for bounding box

    var newPath = createSVGPath(pathData, "#aaa","transparent", lineId)
    document.getElementById(parameters.svgId).appendChild(newPath);
    var svgLength = newPath.getTotalLength();

    if (lines[index].labelText) {
        // ADD A LABEL ALONG PATH IF NEEDED
        //   get point coords from svg path for a point based on total length of path
        var svgPoint = newPath.getPointAtLength(svgLength * ( parseFloat(lines[index].labelPos) || 0.5 )   );
        //   add a label along the path
        var newDiv = $(`<div class="pathLabel"><span>${lines[index].labelText}</span></div>`)
        newDiv.attr('id','path-label-' + lineId)
        $('#' + parameters.htmlCanvasId).append(newDiv)
        newDiv.css({"top":svgPoint.y - (newDiv.height()/2),"left":svgPoint.x - (newDiv.width()/2)})
        // END OF PATH LABEL CHANGES
    }

}

function initHTML(_selector) {
    return $(_selector).append(`
        <div id="svgParent" class="svgParent">
            <div id="gridCanvas" class="gridCanvas"></div>
            <svg id="svgCanvas"  class="svgCanvas"></svg>
            <div id="htmlCanvas" class="htmlCanvas"></div>
        </div>
        <div  id="controlLayer" class="overlay">
        </div>
    `)
}

function refreshCanvas() {
    loadInfo();
    drawNodes();
    drawLines();
}

const callbacks = {
    getCustomNodeContent: function(_item){ return _item},
    nodeTypeGetContent: {},
    nodeMoveStop: function(){}
}

const parameters = {
    customClasses: customClasses,
    svgId: "svgCanvas",
    svgWrapperDivId: "svgParent",
    controlLayerId: "controlLayer",
    gridCanvasId: "gridCanvas",
    htmlCanvasId: "htmlCanvas"
}

const getContentCallbacks = {

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
    initHTML,
    setStorageId,
    loadDataFromUrl,
    sampleLines,
    sampleNodes,
    setSampleNodes,
    setSampleLines,
    callbacks,
    parameters,
    getContentCallbacks,
    nodes,
    lines,
    refreshCanvas
}
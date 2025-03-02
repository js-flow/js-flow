var cnt = 0;
var nodes;
var lines;
var nodeStack = [];
var selectedLineId;


$.fn.extend({
    cssAsInt: function(_cssProp){
        return parseInt(this.css(_cssProp))
    }
})    

$(document).ready(function(){
    console.log('doc ready in default.js')
    
    $(document).on('click',".widget", function(){
        // fires when a widget gets clicked
         if ( $(this).attr('id') === "widgetAddNode") {
            // add Node
            var nodeId = nodes.length + 1;
            nodes.push({"top":"100px","left":"100px","id":"div" + nodeId});
            drawNodes(nodes);
         }
         if ( $(this).attr('id') === "widgetClearSVG") {
            $("svg").empty();
         }
         if ( $(this).attr('id') === "widgetClearNodes") {
            $(".node").remove();
         }
         if ( $(this).attr('id') === "widgetDrawNodes") {
            drawNodes();
         }        
         if ( $(this).attr('id') === "widgetClearLine") {
            clearSelectedLine();
         }        
         if ( $(this).attr('id') === "widgetSaveInfo") {
            saveInfo();
         }        
         if ( $(this).attr('id') === "widgetLoadInfo") {
            loadInfo();
         }        
         if ( $(this).attr('id') === "widgetToggleLine") {
            toggleLine();
         }        
         if ( $(this).attr('id') === "widgetDeleteNode") {
            deleteNode();
         }        


         if ( $(this).attr('id') === "widgetAddLine") {
            console.log('add line');
            var lineId = lines.length + 1;
            lines.push({"fromDiv":"#"+nodeStack[0],"toDiv":"#"+nodeStack[1],"id":"line"+lineId,"mode":""})            
            saveInfo();
            drawLines();
        }        
        
    })

    function deleteNode() {
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
        console.log(selectedLineId);
        const index = lines.findIndex(obj => obj.id === selectedLineId);
        if (index > -1) {
            lines.splice(index, 1);
        }
        saveInfo();
        drawLines();
    }

    function toggleLine() {
        console.log(selectedLineId);
        const index = lines.findIndex(obj => obj.id === selectedLineId);
        if (index > -1) {
            lines[index].mode = (lines[index].mode == "") ? "vert" : ""; 
        }
        saveInfo();
        drawLines();
    }


    $(document).on('click',".node", function(){
        // fires when a widget gets clicked
        // console.log('node click...');
        // console.log($(this).attr('id'));
        nodeStack.push( $(this).attr('id') );
        nodeStack = nodeStack.slice(-2);
        console.log(nodeStack);
        $(".node").removeClass('selectedBorder')
        $(this).addClass('selectedBorder');
    })

    $(document).on('click',"svg,path,circle", function(){
        $(".node").removeClass('selectedBorder')
    })

})

function saveInfo() {
    localStorage.setItem('lines',JSON.stringify(lines))
    localStorage.setItem('nodes',JSON.stringify(nodes));
    console.log(nodes);
}
function loadInfo() {
    lines = JSON.parse(localStorage.getItem('lines'));
    nodes = JSON.parse(localStorage.getItem('nodes'));
}

function createNode() {
    return $(`<div class="node"><div>Drag Me!</div><div>Content</div></div>`);
}

function drawNodes() {

    $(".node").remove();

    nodes.forEach(function(item){
        $('#main').append(createNode()
        .css({'top':item.top,'left':item.left})
        .attr('id',item.id))
    })

    $('.node').draggable({ 
        grid: [ 20, 20 ], 
        stop: function(event, ui) {
            var nodeList = $('.node');
            console.log(nodeList.length);
            nodes = [];
            for (var i=0; i<nodeList.length; i++) {
                nodes.push({
                    "top":$(nodeList[i]).css('top'),
                    "left":$(nodeList[i]).css('left'),
                    "id":$(nodeList[i]).attr('id')
                })
            }
            saveInfo();
            drawLines();
        }
    })

}

function drawLines() {
    console.log('here in drawLines');
    $("svg").empty();
    lines.forEach(function(item){
        drawLine(item.fromDiv,item.toDiv,item.mode,item.id)
    })
    addSVGListeners();
}


function addRedrawButton() {
    $('#main').append( $(`<div class="redraw"><button class="btnRedraw">Re-Draw</button></div>`) );
    $(".btnRedraw").on('click', drawLines)
}
function addControls() {
    $('#main').append($(`
        <div class="controls">
            <button class="button" id="btnSave">Save</button>
            <button class="button" id="btnLoad">Load</button>
        </div>`));
}
function addWidgets() {
    $('#controlLayer').append($(`
        <div class="widgets">
            <div title="Hover text" class="widget" id="widgetAddNode">Add Node</div>
            <div class="widget" id="widgetDeleteNode">Delete Node</div>
            <div class="widget" id="widgetAddLine">Add Line</div>
            <div class="widget" id="widgetClearLine">Clear Line</div>
            <div class="widget" id="widgetToggleLine">Toggle Line</div>
            <div class="widget" id="widgetClearSVG">Clear SVG</div>
            <div class="widget" id="widgetClearNodes">Clear Nodes</div>
            <div class="widget" id="widgetDrawNodes">Draw Nodes</div>
            <div class="widget" id="widgetSaveInfo">Save Info</div>
            <div class="widget" id="widgetLoadInfo">Load Info</div>
        </div>`))
}

function addSVGListeners() {
    $('svg').on('click', function(){
        console.log('svg click');
        nodeStack = [];
        selectedLineId = "";
        $(".node").removeClass('selectedBorder')
        $('path').css("stroke-width", 1).css("stroke","#aaa")
        event.stopPropagation();
    })

    $('svg > path').on('click', function(){
        console.log('path click');
        selectedLineId = $(this).attr('id');
        $(".node").removeClass('selectedBorder')
        $('path').css("stroke-width", 1).css("stroke","#aaa")
        $(this).css("stroke-width", 1).css("stroke","black")
        event.stopPropagation();
    })
    
    $('svg > circle').on('click', function(){
        console.log('circle click');
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

function createSVGPath(pathData, strokeColor, fillColor) {
    var newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");  
    newpath.setAttribute("d", pathData);  
    newpath.setAttribute("stroke", `#aaa`);
    newpath.setAttribute("stroke-width", 1);  
    newpath.setAttribute("fill", `transparent`);  
    return newpath;
}

function setNodes(_nodes) {
    nodes = _nodes;
}

function setLines(_lines) {
    lines = _lines;
}

function getCurveBoundingBoxPoints(beginDiv, endDiv, mode = "") {
    
    if (mode === "") {
        var top = $(beginDiv).cssAsInt("top") + $(beginDiv).cssAsInt("height") / 2
        var left = $(beginDiv).cssAsInt("left") + $(beginDiv).cssAsInt("width")
        var width = $(endDiv).cssAsInt("left") - left;
        var height = $(endDiv).cssAsInt('top') - top + ($(endDiv).cssAsInt('height') / 2);
    }
    
    if (mode === "vert") {
        var top = $(beginDiv).cssAsInt("top") + $(beginDiv).cssAsInt("height");
        var left = $(beginDiv).cssAsInt("left") + ( $(beginDiv).cssAsInt("width") / 2 );
        console.log(left);
        var width = $(endDiv).cssAsInt('left') - $(beginDiv).cssAsInt('left');
        var height = $(endDiv).cssAsInt('top') - top;
    }
    
    return {"top":top,"left":left,"width":width,"height":height}
}

function drawLine(beginDiv, endDiv, mode, lineId) {
    var points = getCurveBoundingBoxPoints(beginDiv, endDiv, mode);

    // pull properties out of object for brevity later in code
    var { left, top, width, height } = points;

    if (mode === "vert") {
        top += 12;
        height -= 14;
    }
    if (mode === "") {
        left += 12;
        width -= 14;
    }

    if (mode === "") {
        var pathData = `M ${left} ${top} C ${left+(width/2)} ${top}, ${left+(width/2)} ${top+height}, ${left+width} ${top+height}`
    }
    if (mode === "vert") {
        var pathData = `M ${left} ${top} C ${left} ${top+(height/2)}, ${left+width} ${top+(height/2)}, ${left+width} ${top+height}`
    }

    var newPath = createSVGPath(pathData, "#aaa","transparent")
    newPath.setAttribute("id", lineId);
    document.getElementById('svgcontainer').appendChild(newPath);

    // draw a connector on each "node" and draw a smooth bezier between those 'control points'
    var newcircle = createSVGCircle(left, top, 4, "#aaa")
    document.getElementById('svgcontainer').appendChild(newcircle);

    var newcircle = createSVGCircle(left+width, top+height, 4, "#aaa")
    document.getElementById('svgcontainer').appendChild(newcircle);
}

export { 
    addRedrawButton, 
    addControls, 
    addWidgets, 
    drawNodes, 
    drawLines,
    loadInfo,
    saveInfo,
    setNodes,
    setLines
}
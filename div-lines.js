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
        switch ( $(this).attr('id') ) {
            case "widgetAddNode":
                var nodeId = nodes.length + 1;
                nodes.push({"top":"100px","left":"100px","id":"div" + nodeId});
                drawNodes(nodes);
            break;
            case "widgetClearSVG":
                $("svg").empty();
            break;
            case "widgetClearNodes":
                $(".node").remove();
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
            case "widgetAddLine":
                var lineId = lines.length + 1;
                lines.push({"fromDiv":"#"+nodeStack[0],"toDiv":"#"+nodeStack[1],"id":"line"+lineId,"mode":"", "lineShape":"straight"})            
                saveInfo();
                drawLines();
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

    function toggleLineShape() {
        console.log("toggle line shape");
        console.log(selectedLineId);
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
        console.log(lines);
    }

    $(document).on('input','.content', function(){
        // console.log($(this).html());    
        // console.log($(this).closest(".node").attr('id'));
        updateNodeInfo();
        saveInfo();
    })
    $(document).on('focus','.content', function(){
        console.log('input focus...')
    })


    $(document).on('click',".node", function(){
        // fires when a widget gets clicked
        // console.log('node click...');
        // console.log($(this).attr('id'));
        if (! $(this).hasClass('handles')) {
            nodeStack.push( $(this).attr('id') );
            nodeStack = nodeStack.slice(-2);
            console.log(nodeStack);
            $(".node").removeClass('selectedBorder')
            $(this).addClass('selectedBorder');
        }
    })

    $(document).on('click',"svg,path,circle", function(){
        $(".node").removeClass('selectedBorder')
    })

})

function saveInfo() {
    localStorage.setItem('lines',JSON.stringify(lines))
    localStorage.setItem('nodes',JSON.stringify(nodes));
}
function loadInfo() {
    lines = JSON.parse(localStorage.getItem('lines'));
    nodes = JSON.parse(localStorage.getItem('nodes'));
}

function createNode(_item) {
    console.log(_item);
    return $(`
        <div class="node">
            <div class="nodeHandles">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div contenteditable="true" class="content title-text">${_item.title}</div>
            <div contenteditable="true" class="content content-text">${_item.content}</div>
        </div>
        `);
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
    var nodeList = $('.node');
    console.log(nodeList.length);
    nodes = [];
    for (var i=0; i<nodeList.length; i++) {
        if ($(nodeList[i]).attr('id') != "handlesContainer") {
            nodes.push({
                "top":$(nodeList[i]).css('top'),
                "left":$(nodeList[i]).css('left'),
                "id":$(nodeList[i]).attr('id'),
                "title":$(nodeList[i]).find('div.content.title-text').html(),
                "content":$(nodeList[i]).find('div.content.content-text').html()
            })
        }
    }
}

function drawNodes() {

    $(".node").remove();

    nodes.forEach(function(item){
        $('#main').append(createNode(item)
        .css({'top':item.top,'left':item.left})
        .attr('id',item.id))
    })

    $('#main').append(createHandlesNode());

    $('.node').draggable({ 
        grid: [ 20, 20 ], 
        stop: function(event, ui) {
            updateNodeInfo();
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
            <div title="Hover text" class="widget" id="widgetAddNode">Add Node</div>
            <div class="widget" id="widgetDeleteNode">Delete Node</div>
            <div class="widget" id="widgetAddLine">Add Line</div>
            <div class="widget" id="widgetClearLine">Clear Line</div>
            <div class="widget" id="widgetToggleLine">Line Orientation</div>
            <div class="widget" id="widgetToggleLineShape">Line Shape</div>
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
        $('path').css("stroke-width", 2).css("stroke","#aaa")
        event.stopPropagation();
    })

    $('svg > path').on('click', function(){
        console.log('path click');
        selectedLineId = $(this).attr('id');
        $(".node").removeClass('selectedBorder')
        $('path').css("stroke-width", 2).css("stroke","#aaa")
        $(this).css("stroke-width", 2).css("stroke","black")
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
    newpath.setAttribute("stroke-width", 2);  
    //newpath.setAttribute("stroke-dasharray", "10,5");  
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

    console.log(lineId);
    const index = lines.findIndex(obj => obj.id === lineId);
    const lineShape = lines[index].lineShape;

    // pull properties out of object for brevity later in code
    var { left, top, width, height } = points;

    if (mode === "vert") {
        top += 12;
        height -= 10;
        left += 3;
    }
    if (mode === "") {
        top += 3;
        left += 10;
        width -= 6;
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




    var newPath = createSVGPath(pathData, "#aaa","transparent")
    newPath.setAttribute("id", lineId);
    document.getElementById('svgcontainer').appendChild(newPath);

    // draw a connector on each "node" and draw a smooth bezier between those 'control points'
    var newcircle = createSVGCircle(left, top, 6, "#aaa")
    document.getElementById('svgcontainer').appendChild(newcircle);

    var newcircle = createSVGCircle(left+width, top+height, 6, "#aaa")
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
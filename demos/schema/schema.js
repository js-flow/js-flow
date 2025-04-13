function renderSchemaContent(_item) {
    return `
        <div contenteditable="true" class="content title-text"><span>${_item.data.title}</span></div>
        <div contenteditable="true" class="content content-text">
            ${renderSchemaLines(_item.data.content)}
        </span>
    `
}

function renderSchemaLines(_content) {
    var ret = '';
    var names = _content.split(",");
    for (var i=0; i<names.length; i++) {
        ret += `<div class="schema-line"><span>${names[i]}</span></div>`
    }
    return ret;
}

function renderSchemaContent(_item) {
    console.log('here in custom')
    console.log(_item);
    return `
        <div contenteditable="true" class="content title-text"><span>${_item.data.title}</span></div>
        <div contenteditable="true" class="content content-text">
            ${renderSchemaLines(_item.data.content)}
        </span>
    `
}

function renderSchemaLines(_content) {
    var ret = '';
    for (var i=0; i<_content.length; i++) {
        ret += `<div class="schema-line"><span>${_content[i]}</span></div>`
    }
    return ret;
}

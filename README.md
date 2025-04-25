<style>
    img {
        width:65%;
        display: block; 
        margin: 0 auto
    }
    summary {
        font-size:18px;
    }
    details {
        margin-bottom:10px;
    }
    ul {
        margin-top:10px;
    }
  </style>

# js-flow

![js-flow](/images/readme_img_1.png)



## About
The library js-flow was created to see if it's possible to create a robust node based library that's as close to pure JavaScript as possible.  There are no server side requirements, just a very basic web server will work fine.  

In fact, all our development is done with php's command line server to make sure it will work with any lightweight web server.


## Using js-flow
The core js-flow code is contained in two files:
* js-flow.css
* js-flow.css

Right now, to get this up and running quickly, we used jQuery and jQueryUI as helper functions.  Since these jQuery helpers are still 100% JavaScript, we can still call js-flow 100% JavaScript as a whole.  Depending on circumstances, js-flow.js may be changed to do all the work itself, without relying on any outside dependencies.

Another nice feature of js-flow is the ability to update a single node without affecting the rest of the page.  This allows updating just a single part of the overall webpage without forcing a full re-render.  This allows the advantages of partial updates of the DOM without resolting to a more complicated or memory intensive frameowrk.


<details>
  <summary>Getting Started</summary>
Getting started with js-flow is very easy.  All you need is a simple web server running on your development system and drop in files 



</details>

<details>
    <summary>Examples</summary>

Implementing js-flow is very easy.  You just need to include the 2 js-flow files (.js and .css) and the 2 jQuery files and you're ready to go.  There are some examples in this repo with some examples to get you started in the "demos" directory.  

The demos `hello-world` and `hello-world-2` are a great place to start.  Hello-world shows a simple implementation of js-flow taking up the whole browser area.  Hello-world-2 shows an example of placing a js-flow canvas in a div so that it flows with the rest of the page content.
</details>


<details>
    <summary>More complex pages</summary>
It's possible to create more complicated pages that would included things like:

* Custom node content
* Custom callbacks on node render to provide custom node content
* Custom .css code to style custom node contents
* Custom .json files to load an entire flow diagram in one line of code

A standard file layout for scenarios like this is<br>
<code>index.html</code><br>
<code>jira.css</code><br>
<code>jira.js</code><br>
<code>jira.json</code><br>
In this scenario the web root would contain an index.html that would include jira.css and jira.js.  There would be some JavaScript code that would make a call to js-flow that would load the nodes and lines contained in jira.json and then render the page based on that data. You can look at the "jira" example for a working version of this scenario.
</details>
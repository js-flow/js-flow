

# js-flow

![js-flow](/images/readme_img_1.png)

## About
The library js-flow was created to see if it's possible to create a node based library in as close to pure JavaScript as possible.  There are no server side requirements, just a very basic web server will work fine.  

In fact, all our development is done with php's command line server to make sure it will work with any lightweight web server.


## Using js-flow
The core js-flow code is contained in two files:
* js-flow.css
* js-flow.css

Right now, to get this up and running quickly, we used jQuery and jQueryUI as helper functions.  Since these jQuery helpers are still 100% JavaScript, we can still call js-flow 100% JavaScript as a whole.  Depending on circumstances, js-flow.js may be changed to do all the work itself, without relying on any outside dependencies.

## Examples

Implementing js-flow is very easy.  Just need to include the 2 js-flow files (.js and .css) and the 2 jQuery files and you're ready to go.  There are some examples in this repo with some examples to get you started in the "demos" directory.  

The demos `hello-world` and `hello-world-2` are a great place to start.  Hello-world shows a simple implementation of js-flow taking up the whole browser area.  Hello-world-2 shows an example of placing a js-flow canvas in a div so that it flows with the rest of the page content.
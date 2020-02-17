/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

require("@rails/ujs").start()
require("@rails/activestorage").start()
require("channels")
require("codemirror")
require("jquery")
require("jquery-ui")
require("../filepicker-widget.js")
import {activateCode, displayCode} from "../exam.js";
import './bootstrap.js';
import './bootstrap.scss';

global.activateCode = activateCode; // TODO remove
global.displayCode = displayCode; // TODO remove

import 'bootstrap/dist/js/bootstrap.bundle'
// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)

//   = require rails-ujs
//   = require activestorage
//   = require jquery3
//   = require jquery-ui/widget
//   = require popper
//   = require bootstrap-sprockets
//   = require bootstrap.treeview
//   = require bootstrap-toggle
//   = require codemirror
//   = require codemirror/addons/runmode/runmode
//   = require codemirror/modes/clike
//   = require codemirror/modes/mllike
//   = require codemirror/modes/ebnf
//   = require codemirror/modes/javascript
//   = require codemirror/modes/markdown
//   = require codemirror/modes/scheme
//   = require codemirror/modes/python
//   = require codemirror/modes/css
//   = require codemirror/modes/xml
//   = require codemirror/modes/yaml
//   = require codemirror/modes/htmlmixed

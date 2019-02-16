const mongoose = require('mongoose');
const validator = require('validator');

let DocsDetails = new mongoose.Schema({
	docs_name: {
		type: Array,
		minlength: 1,
	},
})

let DocsSchema = mongoose.model('docs_schema', DocsDetails);
module.exports = { DocsSchema };
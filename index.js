'use strict';
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerValidation = require('openapi-validator-middleware');
const mongoose = require('mongoose');

const Ajv = require('ajv');

const localize = require('ajv-i18n');

const jsyaml = require('js-yaml');
const fs = require('fs');
const { post_declaraciones } = require('./controllers/Declaraciones');

//require('dotenv').config({ path: './utils/.env' });

/************ Mongo DB ******************/
/************ Mongo DB ******************/
const url = `mongodb://${process.env.USERMONGO}:${process.env.PASSWORDMONGO}@${process.env.HOSTMONGO}/${process.env
	.DATABASE}`;

const db = mongoose
	.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Conexión a base de datos MongoDB...\t\t(Exitosa!!!)'))
	.catch((err) => console.log(`Conexión a base de datos MongoDB...\t\t(${err})`));
/************ Mongo DB ******************/
/************ Mongo DB ******************/

const standar = 'api/openapi.yaml';
const spec = fs.readFileSync(standar, 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

const serverPort = 8080;

let spic_auth = swaggerDoc.components.securitySchemes.spic_auth;

swaggerDoc.components.securitySchemes = {
	spic_auth,
	BearerAuth: {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT'
	}
};

console.log();

swaggerValidation.init(swaggerDoc);
const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
	const ajv = Ajv({ allErrors: true });
	const validate = ajv.compile(swaggerDoc.components.schemas.reqSpic);

	var valid = validate(req.body);

	if (!valid) {
		localize.es(validate.errors);

		let errores = validate.errors.map(({ message, dataPath }) => `${dataPath.slice(1)}: ${message}`);

		res.statusCode = 400;
		next({ status: 400, errores: errores.join(' | ') });
		return;
	}
	next();
});

app.post('/v2/declaraciones', swaggerValidation.validate, post_declaraciones);

app.get('/getVersion', async (req,res, next) => {
	res.json({
		'version':'desarrollo - 20/04/2022'
	});
})
;
app.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		code: err.status || 500,
		message: err.errores
	});
});

http.createServer(app).listen(serverPort, () => {
	console.log(`Servidor iniciado...\t\t\t\t(http://localhost:${serverPort})`);
	console.log(`Documentacion Swagger disponible...\t\t(http://localhost:${serverPort}/docs)`);
});
'use strict';
// MongoDB
var _ = require('underscore');
var { Declaraciones, declaracionesSchema } = require('../utils/declaraciones_models');
var ObjectId = require('mongoose').Types.ObjectId;
var {
  convertirFechaLarga,
  datosGenerales,
  datosCurricularesDeclarante,
  datosEmpleoCargoComision,
  domicilioDeclarante,
  experienciaLaboral,
  ingresos,
  actividadAnualAnterior,
  datosPareja,
  datosDependientesEconomicos,
  bienesInmuebles,
  vehiculos,
  bienesMuebles,
  adeudosPasivos,
  inversionesCuentasValores,
  prestamoComodato,
  participacion,
  tomaDecisiones,
  apoyos,
  representaciones,
  clientesPrincipales,
  beneficiosPrivados,
  fideicomisos
} = require('../service/funciones');

function diacriticSensitiveRegex(string = '') {
  string = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return string.replace(/a/g, '[a,á,à,ä]')
    .replace(/e/g, '[e,é,ë]')
    .replace(/i/g, '[i,í,ï]')
    .replace(/o/g, '[o,ó,ö,ò]')
    .replace(/u/g, '[u,ü,ú,ù]')
    .replace(/A/g, '[a,á,à,ä]')
    .replace(/E/g, '[e,é,ë]')
    .replace(/I/g, '[i,í,ï]')
    .replace(/O/g, '[o,ó,ö,ò]')
    .replace(/U/g, '[u,ü,ú,ù]')
}

async function post_declaraciones(body) {
  let sortObj = body.sort === undefined ? {} : body.sort;
  let page = body.page;  //numero de papostgina a mostrar
  let pageSize = body.pageSize;
  let query = body.query === undefined ? {} : body.query;

  if (pageSize <= 0) { pageSize = 10; }
  if (pageSize > 200) { pageSize = 200; }

  const select = {
    _id: 1,
    tipoDeclaracion: 1,
    updatedAt: 1,
    anioEjercicio: 1,
    declaracionCompleta: 1,
    datosGenerales: 1,
    datosCurricularesDeclarante: 1,
    datosEmpleoCargoComision: 1,
    domicilioDeclarante: 1,
    datosDependientesEconomicos: 1,
    experienciaLaboral: 1,
    ingresos: 1,
    actividadAnualAnterior: 1,
    datosPareja: 1,
    bienesInmuebles: 1,
    vehiculos: 1,
    bienesMuebles: 1,
    inversionesCuentasValores: 1,
    adeudosPasivos: 1,
    prestamoComodato: 1,
    participacion: 1,
    participacionTomaDecisiones: 1,
    apoyos: 1,
    representaciones: 1,
    clientesPrincipales: 1,
    beneficiosPrivados: 1,
    fideicomisos: 1
  };

  if (page <= 0) {
    throw new RangeError("Error campo page fuera de rango");
  } else {
    let newQuery = { firmada: true };
    let newSort = {};

    const sortMap = {
      nombres: "datosGenerales.nombre",
      primerApellido: "datosGenerales.primerApellido",
      segundoApellido: "datosGenerales.segundoApellido",
      escolaridadNivel: "datosCurricularesDeclarante.escolaridad.nivel.clave",
      totalIngresosNetos: "ingresos.ingresoMensualNetoDeclarante.valor"
    };

    Object.entries(sortObj || {}).forEach(([key, value]) => {
      if (sortMap[key]) {
        newSort[sortMap[key]] = value;
      }

      if (key === "datosEmpleoCargoComision") {
        const map = {
          nombreEntePublico: "datosEmpleoCargoComision.nombreEntePublico",
          entidadFederativa: "datosEmpleoCargoComision.domicilioMexico.entidadFederativa.clave",
          municipioAlcaldia: "datosEmpleoCargoComision.domicilioMexico.municipioAlcaldia.clave",
          empleoCargoComision: "datosEmpleoCargoComision.empleoCargoComision",
          nivelEmpleoCargoComision: "datosEmpleoCargoComision.nivelEmpleoCargoComision",
          nivelOrdenGobierno: "datosEmpleoCargoComision.nivelOrdenGobierno"
        };

        Object.entries(value || {}).forEach(([k, v]) => {
          if (map[k]) newSort[map[k]] = v;
        });
      }
    });

    for (var [key, value] of Object.entries(query)) {
      if (key === "id") {
        if ((value.trim().length || 0) > 0) {
          if (ObjectId.isValid(value)) {
            newQuery["_id"] = value;
          } else {
            newQuery["_id"] = null;
          }
        }
      } else if (key === "segundoApellido") {
        if (value.length === 0) {
          newQuery = {
            firmada: true,
            $or: [
              { "datosGenerales.segundoApellido": { $regex: diacriticSensitiveRegex(value), $options: 'i' } },
              { "datosGenerales.segundoApellido": null }
            ]
          };
        }
        else {
          if (value.includes('ñ') || value.includes('Ñ')) {
            value = value.toLowerCase();
            const arreglo = value.split('ñ');
            var value1 = diacriticSensitiveRegex(arreglo[0]);
            var value2 = diacriticSensitiveRegex(arreglo[1]);
            var value3 = '';
            if (arreglo.length === 2) {
              newQuery["datosGenerales.segundoApellido"] = { $regex: value1 + 'ñ' + value2, $options: 'i' };
            }
            if (arreglo.length === 3) {
              value3 = diacriticSensitiveRegex(arreglo[2]);
              newQuery["datosGenerales.segundoApellido"] = { $regex: value1 + 'ñ' + value2 + 'ñ' + value3, $options: 'i' };
            }
          }
          else {
            const regex = buildRegex(value);
            if (regex) {
              newQuery["datosGenerales.segundoApellido"] = { $regex: regex, $options: 'i' };
            }
          }
        }
      } else if (key === "primerApellido") {
        if (value.includes('ñ') || value.includes('Ñ')) {
          value = value.toLowerCase();
          const arreglo = value.split('ñ');
          var value1 = diacriticSensitiveRegex(arreglo[0]);
          var value2 = diacriticSensitiveRegex(arreglo[1]);
          var value3 = '';
          if (arreglo.length === 2) {
            newQuery["datosGenerales.primerApellido"] = { $regex: value1 + 'ñ' + value2, $options: 'i' };
          }
          if (arreglo.length === 3) {
            value3 = diacriticSensitiveRegex(arreglo[2]);
            newQuery["datosGenerales.primerApellido"] = { $regex: value1 + 'ñ' + value2 + 'ñ' + value3, $options: 'i' };
          }
        }
        else {
          const regex = buildRegex(value);
          if (regex) {
            newQuery["datosGenerales.primerApellido"] = { $regex: regex, $options: 'i' };
          }
        }
      }
      else if (key === "nombres") {
        let key = "nombre";
        newQuery["datosGenerales." + key] = { $regex: diacriticSensitiveRegex(value), $options: 'i' }

      } else if (key === "escolaridadNivel") {
        newQuery["datosCurricularesDeclarante.escolaridad.nivel.clave"] = { $regex: diacriticSensitiveRegex(value), $options: 'i' }

      } else if (key === "datosEmpleoCargoComision") {
        if (value.nombreEntePublico) {
          newQuery["datosEmpleoCargoComision.nombreEntePublico"] = { $regex: diacriticSensitiveRegex(value.nombreEntePublico), $options: 'i' }
        }
        if (value.empleoCargoComision) {
          newQuery["datosEmpleoCargoComision.empleoCargoComision"] = { $regex: diacriticSensitiveRegex(value.empleoCargoComision), $options: 'i' }
        }
        if (value.nivelOrdenGobierno) {
          newQuery["datosEmpleoCargoComision.nivelOrdenGobierno"] = { $regex: diacriticSensitiveRegex(value.nivelOrdenGobierno), $options: 'i' }
        }
        if (value.nivelEmpleoCargoComision) {
          newQuery["datosEmpleoCargoComision.nivelEmpleoCargoComision"] = { $regex: diacriticSensitiveRegex(value.nivelEmpleoCargoComision), $options: 'i' }
        }
        if (value.entidadFederativa) {
          newQuery["datosEmpleoCargoComision.domicilioMexico.entidadFederativa.clave"] = { $regex: diacriticSensitiveRegex(value.entidadFederativa), $options: 'i' }
        }
        if (value.municipioAlcaldia) {
          newQuery["datosEmpleoCargoComision.domicilioMexico.municipioAlcaldia.clave"] = { $regex: diacriticSensitiveRegex(value.municipioAlcaldia), $options: 'i' }
        }

      } if (key === "bienesInmuebles") {

        let elemMatch = {
          "titular.0.clave": "DEC"
        };
        let condiciones = [];

        if (value.superficieConstruccion) {
          let cond = {};

          if (value.superficieConstruccion.min != null) {
            cond.$gte = value.superficieConstruccion.min;
          }
          if (value.superficieConstruccion.max != null) {
            cond.$lte = value.superficieConstruccion.max;
          }

          elemMatch["superficieConstruccion.valor"] = cond;
        }

        if (value.superficieTerreno) {
          let cond = {};

          if (value.superficieTerreno.min != null) {
            cond.$gte = value.superficieTerreno.min;
          }
          if (value.superficieTerreno.max != null) {
            cond.$lte = value.superficieTerreno.max;
          }

          elemMatch["superficieTerreno.valor"] = cond;
        }

        if (value.valorAdquisicion) {
          let cond = {};

          if (value.valorAdquisicion.min != null) {
            cond.$gte = value.valorAdquisicion.min;
          }
          if (value.valorAdquisicion.max != null) {
            cond.$lte = value.valorAdquisicion.max;
          }

          elemMatch["valorAdquisicion.valor"] = cond;
        }

        if (value.formaAdquisicion) {
          elemMatch["formaAdquisicion.clave"] =
            value.formaAdquisicion;
        }

        if (Object.keys(elemMatch).length > 0) {
          condiciones.push({
            "bienesInmuebles.bienInmueble": {
              $elemMatch: elemMatch
            }
          });
        }

        // ❗ ESTE LO PUEDES DEJAR O QUITAR SEGÚN REGLA DE NEGOCIO
        condiciones.push({
          "bienesInmuebles.bienInmueble.0": { $exists: true }
        });

        if (!newQuery.$and) newQuery.$and = [];
        newQuery.$and.push(...condiciones);
      } else if (key === "rfcSolicitante") {
        newQuery[key + ".clave"] = { $in: value };
      } else {
        // Ignorar cualquier campo no permitido
        //newQuery[key] = value;
      }
    }

    if (pageSize <= 200 && pageSize >= 1) {


      /*paginationResult.forEach(resultado=>{
        resultado.bienesInmuebles=paginationResult.bienesInmuebles.filter(bienInmueble => bienInmueble.superficieConstruccion.valor === 60)
      });*/

      let paginationResult = await Declaraciones.paginate(newQuery, {
        page,
        limit: pageSize,
        sort: newSort,
        select,
        lean: true   // 🔥 IMPORTANTE
      });
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs }
      let objresults = paginationResult.docs;

      const transformDeclaracion = require('../utils/transformDeclaracion');

      const strippedRows = objresults.map(row =>
        transformDeclaracion(row, { publico: false })
      );

      console.log(newSort);
      console.log(newQuery);

      let objResponse = {};
      objResponse["pagination"] = objpagination;
      objResponse["results"] = strippedRows;
      // DEBUG (opcional)
      console.log(JSON.stringify(strippedRows[0], null, 2));
      return objResponse;


    } else {
      throw new RangeError("Error campo pageSize fuera de rango, el rango del campo es 1..200 ");
    }
  }
}

function buildRegex(value = '') {
  if (!value) return null;

  value = value.toLowerCase();

  if (value.includes('ñ')) {
    const parts = value.split('ñ').map(diacriticSensitiveRegex);
    return parts.join('ñ');
  }

  return diacriticSensitiveRegex(value);
}

module.exports.post_declaraciones = post_declaraciones;

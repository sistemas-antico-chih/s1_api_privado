'use strict';
// MongoDB
var _ = require('underscore');
var { Declaraciones } = require('../utils/declaraciones_models');
var ObjectId = require('mongoose').Types.ObjectId;
var { 
  convertirFechaLarga,
  datosGenerales,
  datosCurricularesDeclarante,
  datosEmpleoCargoComision,
  //domicilioDeclarante,
  experienciaLaboral,
  ingresos,
  actividadAnualAnterior,
  datosPareja,
  //datosDependientesEconomicos,
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
 } = require ('../service/funciones');

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

  let select = {
    'firmada': 0,
    'owner': 0,
    '__v': 0,
    'createdAt': 0,
    'datosGenerales._id': 0,
    'datosGenerales.rfc':0,
    'datosGenerales.curp':0,
    'datosGenerales.correoElectronico._id': 0,
    'datosGenerales.correoElectronico.personal': 0,
    'datosGenerales.telefono': 0,
    'datosGenerales.situacionPersonalEstadoCivil': 0,
    'datosGenerales.regimenMatrimonial': 0,
    'datosGenerales.paisNacimiento': 0,
    'datosGenerales.nacionalidad':0,
    'domicilioDeclarante':0,
    'datosCurricularesDeclarante._id': 0,
    'datosCurricularesDeclarante.escolaridad._id': 0,
    'datosCurricularesDeclarante.escolaridad.nivel._id': 0,
    'datosCurricularesDeclarante.escolaridad.institucionEducativa._id': 0,
    'datosEmpleoCargoComision._id': 0,
    'datosEmpleoCargoComision.telefonoOficina._id': 0,
    'datosEmpleoCargoComision.domicilioMexico._id': 0,
    'datosEmpleoCargoComision.domicilioMexico.municipioAlcaldia._id': 0,
    'datosEmpleoCargoComision.domicilioMexico.entidadFederativa._id': 0,
    'datosEmpleoCargoComision.domicilioExtranjero._id': 0,
    'experienciaLaboral._id': 0,
    'experienciaLaboral.experiencia._id': 0,
    'experienciaLaboral.experiencia.sector._id': 0,
    'experienciaLaboral.experiencia.ambitoSector._id': 0,
    'datosPareja': 0,
    'datosDependientesEconomicos': 0,
    'ingresos._id': 0,
    'ingresos.remuneracionMensualCargoPublico._id': 0,
    'ingresos.otrosIngresosMensualesTotal._id': 0,
    'ingresos.actividadIndustrialComercialEmpresarial._id': 0,
    'ingresos.actividadIndustrialComercialEmpresarial.actividades._id': 0,
    'ingresos.actividadIndustrialComercialEmpresarial.remuneracionTotal._id': 0,
    'ingresos.actividadIndustrialComercialEmpresarial.actividades.remuneracion._id': 0,
    'ingresos.actividadFinanciera._id': 0,
    'ingresos.actividadFinanciera.actividades._id': 0,
    'ingresos.actividadFinanciera.remuneracionTotal._id': 0,
    'ingresos.actividadFinanciera.actividades.remuneracion._id': 0,
    'ingresos.actividadFinanciera.actividades.tipoInstrumento._id': 0,
    'ingresos.serviciosProfesionales._id': 0,
    'ingresos.serviciosProfesionales.servicios._id': 0,
    'ingresos.serviciosProfesionales.remuneracionTotal._id': 0,
    'ingresos.serviciosProfesionales.servicios.remuneracion._id': 0,
    'ingresos.servicios._id': 0,
    'ingresos.otrosIngresos._id': 0,
    'ingresos.otrosIngresos.ingresos._id': 0,
    'ingresos.otrosIngresos.remuneracionTotal._id': 0,
    'ingresos.otrosIngresos.ingresos.remuneracion._id': 0,
    'ingresos.ingresoMensualNetoDeclarante._id': 0,
    'ingresos.ingresoMensualNetoParejaDependiente': 0,
    'ingresos.totalIngresosMensualesNetos._id': 0,
    'actividadAnualAnterior._id': 0,
    'actividadAnualAnterior.remuneracionNetaCargoPublico._id': 0,
    'actividadAnualAnterior.otrosIngresosTotal._id': 0,
    'actividadAnualAnterior.actividadIndustrialComercialEmpresarial._id': 0,
    'actividadAnualAnterior.actividadIndustrialComercialEmpresarial.remuneracionTotal._id': 0,
    'actividadAnualAnterior.actividadIndustrialComercialEmpresarial.actividades._id': 0,
    'actividadAnualAnterior.actividadIndustrialComercialEmpresarial.actividades.remuneracion._id': 0,
    'actividadAnualAnterior.actividadFinanciera._id': 0,
    'actividadAnualAnterior.actividadFinanciera.actividades._id': 0,
    'actividadAnualAnterior.actividadFinanciera.remuneracionTotal._id': 0,
    'actividadAnualAnterior.actividadFinanciera.actividades.remuneracion._id': 0,
    'actividadAnualAnterior.actividadFinanciera.actividades.tipoInstrumento._id': 0,
    'actividadAnualAnterior.serviciosProfesionales._id': 0,
    'actividadAnualAnterior.serviciosProfesionales.servicios._id': 0,
    'actividadAnualAnterior.serviciosProfesionales.remuneracionTotal._id': 0,
    'actividadAnualAnterior.serviciosProfesionales.servicios.remuneracion._id': 0,
    'actividadAnualAnterior.enajenacionBienes._id': 0,
    'actividadAnualAnterior.enajenacionBienes.remuneracionTotal._id': 0,
    'actividadAnualAnterior.enajenacionBienes.bienes._id': 0,
    'actividadAnualAnterior.enajenacionBienes.bienes.remuneracion._id': 0,
    'actividadAnualAnterior.otrosIngresos._id': 0,
    'actividadAnualAnterior.otrosIngresos.remuneracionTotal._id': 0,
    'actividadAnualAnterior.otrosIngresos.ingresos._id': 0,
    'actividadAnualAnterior.otrosIngresos.ingresos.remuneracion._id': 0,
    'actividadAnualAnterior.ingresoNetoAnualDeclarante._id': 0,
    'actividadAnualAnterior.ingresoNetoAnualParejaDependiente': 0,
    'actividadAnualAnterior.totalIngresosNetosAnuales._id': 0,
    'bienesInmuebles._id': 0,
    'bienesInmuebles.bienInmueble._id': 0,
    'bienesInmuebles.bienInmueble.tipoInmueble._id': 0,
    'bienesInmuebles.bienInmueble.titular._id': 0,
    'bienesInmuebles.bienInmueble.superficieTerreno._id': 0,
    'bienesInmuebles.bienInmueble.superficieConstruccion._id': 0,
    'bienesInmuebles.bienInmueble.tercero._id': 0,
    'bienesInmuebles.bienInmueble.transmisor._id': 0,
    'bienesInmuebles.bienInmueble.transmisor.relacion._id': 0,
    'bienesInmuebles.bienInmueble.formaAdquisicion._id': 0,
    'bienesInmuebles.bienInmueble.valorAdquisicion._id': 0,
    'bienesInmuebles.bienInmueble.domicilioMexico': 0,
    'bienesInmuebles.bienInmueble.domicilioExtranjero': 0,
    'bienesInmuebles.bienInmueble.motivoBaja._id': 0,
    'vehiculos._id': 0,
    'vehiculos.vehiculo._id': 0,
    'vehiculos.vehiculo.tipoVehiculo._id': 0,
    'vehiculos.vehiculo.titular._id': 0,
    'vehiculos.vehiculo.transmisor._id': 0,
    'vehiculos.vehiculo.transmisor.relacion._id': 0,
    'vehiculos.vehiculo.tercero._id': 0,
    'vehiculos.vehiculo.lugarRegistro._id': 0,
    'vehiculos.vehiculo.lugarRegistro.entidadFederativa._id': 0,
    'vehiculos.vehiculo.formaAdquisicion._id': 0,
    'vehiculos.vehiculo.valorAdquisicion._id': 0,
    'vehiculos.vehiculo.motivoBaja._id': 0,
    'bienesMuebles._id': 0,
    'bienesMuebles.bienMueble._id': 0,
    'bienesMuebles.bienMueble.titular._id': 0,
    'bienesMuebles.bienMueble.tipoBien._id': 0,
    'bienesMuebles.bienMueble.transmisor._id': 0,
    'bienesMuebles.bienMueble.transmisor.tipoPersona._id': 0,
    'bienesMuebles.bienMueble.transmisor.relacion._id': 0,
    'bienesMuebles.bienMueble.tercero._id': 0,
    'bienesMuebles.bienMueble.formaAdquisicion._id': 0,
    'bienesMuebles.bienMueble.valorAdquisicion._id': 0,
    'bienesMuebles.bienMueble.motivoBaja._id': 0,
    'inversionesCuentasValores._id': 0,
    'inversionesCuentasValores.inversion._id': 0,
    'inversionesCuentasValores.inversion.tipoInversion._id': 0,
    'inversionesCuentasValores.inversion.subTipoInversion._id': 0,
    'inversionesCuentasValores.inversion.titular._id': 0,
    'inversionesCuentasValores.inversion.tercero._id': 0,
    'inversionesCuentasValores.inversion.localizacionInversion._id': 0,
    'inversionesCuentasValores.inversion.saldoSituacionActual._id': 0,
    'adeudosPasivos._id': 0,
    'adeudosPasivos.adeudo._id': 0,
    'adeudosPasivos.adeudo.titular._id': 0,
    'adeudosPasivos.adeudo.tipoAdeudo._id': 0,
    'adeudosPasivos.adeudo.montoOriginal._id': 0,
    'adeudosPasivos.adeudo.saldoInsolutoSituacionActual._id': 0,
    'adeudosPasivos.adeudo.tercero._id': 0,
    'adeudosPasivos.adeudo.otorganteCredito._id': 0,
    'adeudosPasivos.adeudo.localizacionAdeudo._id': 0,
    'prestamoComodato._id': 0,
    'prestamoComodato.prestamo._id': 0,
    'prestamoComodato.prestamo.tipoBien._id': 0,
    'prestamoComodato.prestamo.tipoBien.inmueble._id': 0,
    'prestamoComodato.prestamo.tipoBien.inmueble.tipoInmueble._id': 0,
    'prestamoComodato.prestamo.tipoBien.inmueble.domicilioMexico._id': 0,
    'prestamoComodato.prestamo.tipoBien.inmueble.domicilioMexico.municipioAlcaldia._id': 0,
    'prestamoComodato.prestamo.tipoBien.inmueble.domicilioMexico.entidadFederativa._id': 0,
    'prestamoComodato.prestamo.tipoBien.inmueble.domicilioExtranjero._id': 0,
    'prestamoComodato.prestamo.tipoBien.vehiculo._id': 0,
    'prestamoComodato.prestamo.tipoBien.vehiculo.tipo._id': 0,
    'prestamoComodato.prestamo.tipoBien.vehiculo.lugarRegistro._id': 0,
    'prestamoComodato.prestamo.tipoBien.vehiculo.lugarRegistro.entidadFederativa._id': 0,
    'prestamoComodato.prestamo.duenoTitular._id': 0,
    'participacion._id': 0,
    'participacion.participacion._id': 0,
    'participacion.participacion.tipoParticipacion._id': 0,
    'participacion.participacion.montoMensual._id': 0,
    'participacion.participacion.ubicacion._id': 0,
    'participacion.participacion.ubicacion.entidadFederativa._id': 0,
    'participacion.participacion.sector._id': 0,
    'participacionTomaDecisiones._id': 0,
    'participacionTomaDecisiones.participacion._id': 0,
    'participacionTomaDecisiones.participacion.tipoInstitucion._id': 0,
    'participacionTomaDecisiones.participacion.montoMensual._id': 0,
    'participacionTomaDecisiones.participacion.ubicacion._id': 0,
    'participacionTomaDecisiones.participacion.ubicacion.entidadFederativa._id': 0,
    'apoyos._id': 0,
    'apoyos.apoyo._id': 0,
    'apoyos.apoyo.tipoApoyo._id': 0,
    'apoyos.apoyo.montoApoyoMensual._id': 0,
    'apoyos.apoyo.beneficiarioPrograma._id': 0,
    'representaciones._id': 0,
    'representaciones.representacion._id': 0,
    'representaciones.representacion.montoMensual._id': 0,
    'representaciones.representacion.ubicacion._id': 0,
    'representaciones.representacion.ubicacion.entidadFederativa._id': 0,
    'representaciones.representacion.sector._id': 0,
    'clientesPrincipales._id': 0,
    'clientesPrincipales.cliente._id': 0,
    'clientesPrincipales.cliente.empresa._id': 0,
    'clientesPrincipales.cliente.clientePrincipal._id': 0,
    'clientesPrincipales.cliente.sector._id': 0,
    'clientesPrincipales.cliente.montoAproximadoGanancia._id': 0,
    'clientesPrincipales.cliente.ubicacion._id': 0,
    'clientesPrincipales.cliente.ubicacion.entidadFederativa._id': 0,
    'beneficiosPrivados._id': 0,
    'beneficiosPrivados.beneficio._id': 0,
    'beneficiosPrivados.beneficio.tipoBeneficio._id': 0,
    'beneficiosPrivados.beneficio.beneficiario._id': 0,
    'beneficiosPrivados.beneficio.otorgante._id': 0,
    'beneficiosPrivados.beneficio.montoMensualAproximado._id': 0,
    'beneficiosPrivados.beneficio.sector._id': 0,
    'fideicomisos._id': 0,
    'fideicomisos.fideicomiso._id': 0,
    'fideicomisos.fideicomiso.fideicomitente._id': 0,
    'fideicomisos.fideicomiso.fiduciario._id': 0,
    'fideicomisos.fideicomiso.fideicomisario._id': 0,
    'fideicomisos.fideicomiso.sector._id': 0
  }

  if (page <= 0) {
    throw new RangeError("Error campo page fuera de rango");
  } else {
    let newQuery = { firmada: true };
    let newSort = {};

    for (let [key, value] of Object.entries(sortObj)) {
      if (key === "nombres") {
        newSort["datosGenerales.nombre"] = value
      }
      if (key === "primerApellido") {
        newSort["datosGenerales.primerApellido"] = value
      }
      if (key === "segundoApellido") {
        newSort={"datosGenerales.segundoApellido":value}      
    }
      if (key === "escolaridadNivel") {
        newSort["datosCurricularesDeclarante.escolaridad.nivel.clave"] = value
      }
      if (key === "datosEmpleoCargoComision") {
        if (value.nombreEntePublico) {
          newSort["datosEmpleoCargoComision.nombreEntePublico"] = value.nombreEntePublico
        }
        if (value.entidadFederativa) {
          newSort["datosEmpleoCargoComision.domicilioMexico.entidadFederativa.clave"] = value.entidadFederativa
        }
        if (value.municipioAlcaldia) {
          newSort["datosEmpleoCargoComision.domicilioMexico.municipioAlcaldia.clave"] = value.municipioAlcaldia
        }
        if (value.empleoCargoComision) {
          newSort["datosEmpleoCargoComision.empleoCargoComision"] = value.empleoCargoComision
        }
        if (value.nivelEmpleoCargoComision) {
          newSort["datosEmpleoCargoComision.nivelEmpleoCargoComision"] = value.nivelEmpleoCargoComision
        }
        if (value.nivelOrdenGobierno) {
          newSort["datosEmpleoCargoComision.nivelOrdenGobierno"] = value.nivelOrdenGobierno
        }
      }
      if (key === "totalIngresosNetos") {
        newSort["ingresos.ingresoMensualNetoDeclarante.valor"] = value
      }
      if (key === "bienesInmuebles") {
        if (value.superficieConstruccion) {
          newSort[key + ".bienInmueble.superficieConstruccion.valor"] = value.superficieConstruccion
        }
        if (value.superficieTerreno) {
          newSort[key + ".bienInmueble.superficieTerreno.valor"] = value.superficieTerreno
        }
        if (value.formaAdquisicion) {
          newSort[key + ".bienInmueble.formaAdquisicion.clave"] = value.formaAdquisicion
        }
        if (value.valorAdquisicion) {
          newSort[key + ".bienInmueble.valorAdquisicion.valor"] = value.valorAdquisicion
        }
      }
    }

    for (let [key, value] of Object.entries(query)) {
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
            value = diacriticSensitiveRegex(value);
            newQuery["datosGenerales.segundoApellido"] = { $regex: value, $options: 'i' };
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
          value = diacriticSensitiveRegex(value);
          newQuery["datosGenerales.primerApellido"] = { $regex: value, $options: 'i' };
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
        else if (value.empleoCargoComision) {
          newQuery["datosEmpleoCargoComision.empleoCargoComision"] = { $regex: diacriticSensitiveRegex(value.empleoCargoComision), $options: 'i' }
        }
        else if (value.nivelOrdenGobierno) {
          newQuery["datosEmpleoCargoComision.nivelOrdenGobierno"] = { $regex: diacriticSensitiveRegex(value.nivelOrdenGobierno), $options: 'i' }
        }
        else if (value.nivelEmpleoCargoComision) {
          newQuery["datosEmpleoCargoComision.nivelEmpleoCargoComision"] = { $regex: diacriticSensitiveRegex(value.nivelEmpleoCargoComision), $options: 'i' }
        }
        else if (value.entidadFederativa) {
          newQuery["datosEmpleoCargoComision.domicilioMexico.entidadFederativa.clave"] = { $regex: diacriticSensitiveRegex(value.entidadFederativa), $options: 'i' }
        }
        else if (value.municipioAlcaldia) {
          newQuery["datosEmpleoCargoComision.domicilioMexico.municipioAlcaldia.clave"] = { $regex: diacriticSensitiveRegex(value.municipioAlcaldia), $options: 'i' }
        }

      } else if (key === "bienesInmuebles") {
        if (value.superficieConstruccion) {
          if (value.superficieConstruccion.min===0 && value.superficieConstruccion.max===0) {
            newQuery["bienesInmuebles.bienInmueble.superficieConstruccion.valor"] = { $eq:0 }
          }
          else if (value.superficieConstruccion.min && value.superficieConstruccion.max) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.superficieConstruccion.valor": { $gte: (value.superficieConstruccion.min) } },
                { "bienesInmuebles.bienInmueble.superficieConstruccion.valor": { $lte: (value.superficieConstruccion.max) } }              ]
            };
          }
          else if (value.superficieConstruccion.min===0 && !value.superficieConstruccion.max) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.0": { $exists: true } },
                { "bienesInmuebles.bienInmueble.superficieConstruccion.valor": { $gte: (value.superficieConstruccion.min) } }
              ]
            };
          }
          else if (value.superficieConstruccion.min) {
            newQuery["bienesInmuebles.bienInmueble.superficieConstruccion.valor"] = { $gte: (value.superficieConstruccion.min) }
          }
          else if (value.superficieConstruccion.max===0 && !value.superficieConstruccion.min) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.0": { $exists: true } },
                { "bienesInmuebles.bienInmueble.superficieConstruccion.valor": { $lte: (value.superficieConstruccion.max) } }
              ]
            };
          }
          else if (value.superficieConstruccion.max) {
            newQuery["bienesInmuebles.bienInmueble.superficieConstruccion.valor"] = { $lte: (value.superficieConstruccion.max) }
          }
        }
        else if (value.superficieTerreno) {
          if (value.superficieTerreno.min===0 && value.superficieTerreno.max===0) {
            newQuery["bienesInmuebles.bienInmueble.superficieTerreno.valor"] = { $eq:0 }
          }
          else if (value.superficieTerreno.min && value.superficieTerreno.max) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.superficieTerreno.valor": { $gte: (value.superficieTerreno.min) } },
                { "bienesInmuebles.bienInmueble.superficieTerreno.valor": { $lte: (value.superficieTerreno.max) } } 
              ]
            };
          }
          else if (value.superficieTerreno.min===0 && !value.superficieTerreno.max) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.0": { $exists: true } },
                { "bienesInmuebles.bienInmueble.superficieTerreno.valor": { $gte: (value.superficieTerreno.min) } }
              ]
            };
          }
          else if (value.superficieTerreno.min) {
            newQuery["bienesInmuebles.bienInmueble.superficieTerreno.valor"] = { $gte: (value.superficieTerreno.min) }
          }
          else if (value.superficieTerreno.max===0 && !value.superficieTerreno.min) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.0": { $exists: true } },
                { "bienesInmuebles.bienInmueble.superficieTerreno.valor": { $lte: (value.superficieTerreno.max) } }
              ]
            };
          }
          else if (value.superficieTerreno.max) {
            newQuery["bienesInmuebles.bienInmueble.superficieTerreno.valor"] = { $lte: (value.superficieTerreno.max) }
          }
        }
        else if (value.valorAdquisicion) {
          if (value.valorAdquisicion.min===0 && value.valorAdquisicion.max===0) {
            newQuery["bienesInmuebles.bienInmueble.valorAdquisicion.valor"] = { $eq:0 }
          }
          else if (value.valorAdquisicion.min && value.valorAdquisicion.max) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.valorAdquisicion.valor": { $gte: (value.valorAdquisicion.min) } },
                { "bienesInmuebles.bienInmueble.valorAdquisicion.valor": { $lte: (value.valorAdquisicion.max) } } 
              ]
            };
          }
          else if (value.valorAdquisicion.min===0 && !value.valorAdquisicion.max) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.0": { $exists: true } },
                { "bienesInmuebles.bienInmueble.valorAdquisicion.valor": { $gte: (value.valorAdquisicion.min) } }
              ]
            };
          }
          else if (value.valorAdquisicion.min) {
            newQuery["bienesInmuebles.bienInmueble.valorAdquisicion.valor"] = { $gte: (value.valorAdquisicion.min) }
          }
          else if (value.valorAdquisicion.max===0 && !value.valorAdquisicion.min) {
            newQuery = {
              firmada: true,
              $and: [
                { "bienesInmuebles.bienInmueble.0": { $exists: true } },
                { "bienesInmuebles.bienInmueble.valorAdquisicion.valor": { $lte: (value.valorAdquisicion.max) } }
              ]
            };
          }
          else if (value.valorAdquisicion.max) {
            newQuery["bienesInmuebles.bienInmueble.valorAdquisicion.valor"] = { $lte: (value.valorAdquisicion.max) }
          }
        }
        else if (value.formaAdquisicion) {
          newQuery["bienesInmuebles.bienInmueble.formaAdquisicion.clave"] = { $regex: diacriticSensitiveRegex(value.formaAdquisicion), $options: 'i' }
        }
      }
      else if (key === "totalIngresosNetos") {
        if(value.min===0 && value.max===0){
          newQuery["ingresos.ingresoMensualNetoDeclarante.valor"] = { $eq:0 }
        }
        if (value.min && value.max) {
          newQuery = {
            firmada: true,
            $and: [
              { "ingresos.ingresoMensualNetoDeclarante.valor": { $gte: (value.min) } },
              { "ingresos.ingresoMensualNetoDeclarante.valor": { $lte: (value.max) } }
            ]
          };
        }
        else if (value.min) {
          newQuery["ingresos.ingresoMensualNetoDeclarante.valor"] = { $gte: (value.min) }
        }
        else if (value.max) {
          newQuery["ingresos.ingresoMensualNetoDeclarante.valor"] = { $lte: (value.max) }
        }
        else if (value.max===0) {
          newQuery["ingresos.ingresoMensualNetoDeclarante.valor"] = { $lte: (value.max) }
        }
      } else if (key === "rfcSolicitante") {
        newQuery[key + ".clave"] = { $in: value };
      } else {
        newQuery[key] = value;
      }
    }

    if (pageSize <= 200 && pageSize >= 1) {
      let paginationResult = await Declaraciones.paginate(newQuery, { page: page, limit: pageSize, sort: newSort, select: select }).then();
      let objpagination = { hasNextPage: paginationResult.hasNextPage, page: paginationResult.page, pageSize: paginationResult.limit, totalRows: paginationResult.totalDocs }
      let objresults = paginationResult.docs;

      var i = 1;

      try {

        var strippedRows = _.map(objresults, function (row) {
          let fechaLarga = convertirFechaLarga(row.toObject().updatedAt);
          let rowExtend = _.extend({
            id: row.toObject()._id
          }, row.toObject());
          let tipo = row.toObject().tipoDeclaracion;
          if (tipo === 'MODIFICACION') {
            tipo = 'MODIFICACIÓN';
          }
          if (tipo === 'CONCLUSION')
            tipo = 'CONCLUSIÓN';
          let institucion = row.toObject().datosEmpleoCargoComision.nombreEntePublico;
          rowExtend["institucion"] = institucion;
          rowExtend["metadata"] = ({
            declaracionCompleta: rowExtend.declaracionCompleta,
            tipo: tipo,
            actualizacion: fechaLarga,
            institucion: institucion,
            actualizacionConflictoInteres: false
          });

          //LLAMADO A FUNCIONES
          //datosGenerales
          datosGenerales(rowExtend.datosGenerales);
          
          //datosCurricularesDeclarante
          datosCurricularesDeclarante(rowExtend.datosCurricularesDeclarante);
          
          //datosEmpleoCargocomision
          datosEmpleoCargoComision(rowExtend.datosEmpleoCargoComision);
          
          //experienciaLaboral
          var experiencia=experienciaLaboral(rowExtend.experienciaLaboral);
          var ningunoExperienciaLaboral = false
          if (!rowExtend.experienciaLaboral || rowExtend.experienciaLaboral.ninguno === true) {
            ningunoExperienciaLaboral = true;
            experiencia = []
          } else {
            ningunoExperienciaLaboral = false;
          }

          //ingresos
          ingresos(rowExtend.ingresos, rowExtend.tipoDeclaracion);
          
          //actividadAnualAnterior
          if(rowExtend.actividadAnualAnterior){
            if (rowExtend.actividadAnualAnterior.servidorPublicoAnioAnterior === true){
              actividadAnualAnterior(rowExtend.actividadAnualAnterior);
            }
          }

          //datosPareja
          if (rowExtend.datosPareja) {
            if (!rowExtend.datosPareja.ninguno) {
                datosPareja(rowExtend.datosPareja);
            }
          }

          //bienesInmuebles
          var bienInmueble;
          var ningunoInmueble = false;
          if(rowExtend.bienesInmuebles === undefined){
            ningunoInmueble = true;
            bienInmueble = [];
          }
          if(rowExtend.bienesInmuebles){
            if(rowExtend.bienesInmuebles.bienInmueble.length >= 1){
              ningunoInmueble = false;
              bienInmueble = bienesInmuebles(rowExtend.bienesInmuebles.bienInmueble);
            } else {
              ningunoInmueble = true;
              bienInmueble = [];
            }
          }

          //vehiculos
          var vehiculo;
          var ningunoVehiculo = false;
          if(rowExtend.vehiculos === undefined){
            ningunoVehiculo = true;
            vehiculo = [];
          }
          if(rowExtend.vehiculos){
            if(rowExtend.vehiculos.vehiculo.length >= 1){
              //ningunoVehiculo = false;
              vehiculo = vehiculos(rowExtend.vehiculos.vehiculo);
              if (vehiculo.length >= 1){
                ningunoVehiculo = false;
                vehiculo = vehiculo;
              }
            } else {
              ningunoVehiculo = true;
              vehiculo = [];
            }
          }

          //bienesMuebles
          var bienMueble;
          var ningunoMueble = false;
          if(rowExtend.bienesMuebles === undefined){
            ningunoMueble = true;
            bienMueble = [];
          }
          if(rowExtend.bienesMuebles){
            if(rowExtend.bienesMuebles.bienMueble.length >= 1){
              ningunoMueble = false;
              bienMueble = bienesMuebles(rowExtend.bienesMuebles.bienMueble);
            } else {
              ningunoMueble = true;
              bienMueble = [];
            }
          }

          //adeudosPasivos
          var adeudo;
          var ningunoAdeudo = false;
          if(rowExtend.adeudosPasivos === undefined){
            ningunoAdeudo = true;
            adeudo = [];
          }
          if(rowExtend.adeudosPasivos){
            if(rowExtend.adeudosPasivos.adeudo.length >= 1){
              ningunoAdeudo = false;
              adeudo = adeudosPasivos(rowExtend.adeudosPasivos.adeudo);
            } else {
              ningunoAdeudo = true;
              adeudo = [];
            }
          }
          
          //inversionesCuentasValores
          var inversion;
          var ningunoInversion = false;
          if(rowExtend.inversionesCuentasValores === undefined){
            ningunoInversion = true;
            inversion = [];
          }
          if(rowExtend.inversionesCuentasValores){
            if(rowExtend.inversionesCuentasValores.inversion.length >= 1){
              ningunoInversion = false;
              inversion = inversionesCuentasValores(rowExtend.inversionesCuentasValores.inversion);
            } else {
              ningunoInversion = true;
              inversion = [];
            }
          }

          //prestamoComodato
          var prestamo;
          var ningunoPrestamo = false;
          if(rowExtend.prestamoComodato === undefined){
            ningunoPrestamo = true;
            prestamo = [];
          }
          if(rowExtend.prestamoComodato){
            if(rowExtend.prestamoComodato.prestamo.length >= 1){
              ningunoPrestamo = false;
              prestamo = prestamoComodato(rowExtend.prestamoComodato.prestamo);
            } else {
              ningunoPrestamo = true;
              prestamo = [];
            }
          }

          //participacion
          var participacion1;
          var ningunoParticipacion = false;
          if(rowExtend.participacion === undefined){
            ningunoParticipacion = true;
            prestamo = [];
          }
          if(rowExtend.participacion){
            if(rowExtend.participacion.participacion.length >= 1){
              ningunoParticipacion = false;
              participacion1 = participacion(rowExtend.participacion.participacion);
            } else {
              ningunoParticipacion = true;
              participacion1 = [];
            }
          }

           //participacionTomaDecisiones
          var participacionTomaDecisiones;
          var ningunoParticipacionTomaDecisiones = false;
          if(rowExtend.participacionTomaDecisiones === undefined){
            ningunoParticipacionTomaDecisiones = true;
            participacionTomaDecisiones = [];
          }
          if(rowExtend.participacionTomaDecisiones){
            if(rowExtend.participacionTomaDecisiones.participacion.length >= 1){
              ningunoParticipacionTomaDecisiones = false;
              participacionTomaDecisiones = tomaDecisiones(rowExtend.participacionTomaDecisiones.participacion);
            } else {
              ningunoParticipacionTomaDecisiones = true;
              participacionTomaDecisiones = [];
            }
          }
                     
          //apoyos
          var apoyo;
          var ningunoApoyo = false;
          if(rowExtend.apoyos === undefined){
            ningunoApoyo = true;
            apoyo = [];
          }
          if(rowExtend.apoyos){
            if(rowExtend.apoyos.apoyo.length >= 1){
              ningunoApoyo = false;
              apoyo = apoyos(rowExtend.apoyos.apoyo);
            } else {
              ningunoApoyo = true;
              apoyo = [];
            }
          }
          
          //representaciones
          var representacion;
          var ningunoRepresentacion = false;
          if(rowExtend.representaciones === undefined){
            ningunoRepresentacion = true;
            representacion = [];
          }
          if(rowExtend.representaciones){
            if(rowExtend.representaciones.representacion.length >= 1){
              ningunoRepresentacion = false;
              representacion = representaciones(rowExtend.representaciones.representacion);
            } else {
              ningunoRepresentacion = true;
              representacion = [];
            }
          }
          
          //clientesPrincipales
          var cliente;
          var ningunoClientes = false;
          if(rowExtend.clientesPrincipales === undefined){
            ningunoClientes = true;
            cliente = [];
          }
          if(rowExtend.clientesPrincipales){
            if(rowExtend.clientesPrincipales.cliente.length >= 1){
              ningunoClientes = false;
              cliente = clientesPrincipales(rowExtend.clientesPrincipales.cliente);
            } else {
              ningunoClientes = true;
              cliente = [];
            }
          }

          //beneficiosPrivados
          var beneficio;
          var ningunoBeneficios = false;
          if(rowExtend.beneficiosPrivados === undefined){
            ningunoBeneficios = true;
            beneficio = [];
          }
          if(rowExtend.beneficiosPrivados){
            if(rowExtend.beneficiosPrivados.beneficio.length >= 1){
              ningunoBeneficios = false;
              beneficio = beneficiosPrivados(rowExtend.beneficiosPrivados.beneficio);
            } else {
              ningunoBeneficios = true;
              beneficio = [];
            }
          }

          //fideicomisos
          var fideicomiso;
          var ningunoFideicomisos = false;
          if(rowExtend.fideicomisos === undefined){
            ningunoFideicomisos = true;
            fideicomiso = [];
          }
          if(rowExtend.fideicomisos){
            if(rowExtend.fideicomisos.fideicomiso.length >= 1){
              ningunoFideicomisos = false;
              fideicomiso = fideicomisos(rowExtend.fideicomisos.fideicomiso);
            } else {
              ningunoFideicomisos = true;
              fideicomiso = [];
            }
          }
              
          rowExtend["declaracion"] = ({
            "situacionPatrimonial": {
              datosGenerales: rowExtend.datosGenerales,
              domicilioDeclarante: rowExtend.domicilioDeclarante,
              datosCurricularesDeclarante:rowExtend.datosCurricularesDeclarante,
              datosEmpleoCargoComision: rowExtend.datosEmpleoCargoComision,
              experienciaLaboral: {
                ninguno: ningunoExperienciaLaboral,
                experiencia
              },
              datosPareja: rowExtend.datosPareja,
              /*datosDependientesEconomicos: {
                ninguno: ningunoDependiente,
                dependienteEconomico
              },*/
              ingresos: rowExtend.ingresos,
              actividadAnualAnterior: rowExtend.actividadAnualAnterior,
              bienesInmuebles: {
                ninguno: ningunoInmueble,
                bienInmueble
              },
              vehiculos: {
                ninguno: ningunoVehiculo,
                vehiculo
              },
              bienesMuebles: {
                ninguno: ningunoMueble,
                bienMueble
              },
              inversiones: {
                ninguno: ningunoInversion,
                inversion
              },
              adeudos: {
                ninguno: ningunoAdeudo,
                adeudo
              },
              prestamoOComodato: {
                ninguno: ningunoPrestamo,
                prestamo
              }
            },
            "interes": {
              actualizacionConflictoInteres: false,
              participacion: {
                ninguno: ningunoParticipacion,
                participacion: participacion1
              },
              participacionTomaDecisiones: {
                ninguno: ningunoParticipacionTomaDecisiones,
                participacion: participacionTomaDecisiones
              },
              apoyos: {
                ninguno: ningunoApoyo,
                apoyo
              },
              representacion: {
                ninguno: ningunoRepresentacion,
                representacion
              },
              clientesPrincipales: {
                ninguno: ningunoClientes,
                cliente
              },
              beneficiosPrivados: {
                ninguno: ningunoBeneficios,
                beneficio
              },
              fideicomisos: {
                ninguno: ningunoFideicomisos,
                fideicomiso
              }
            }
          });


          return _.omit(rowExtend,
            '_id',
            'declaracionCompleta',
            'firmada',
            'owner',
            '__v',
            'createdAt',
            'institucion',
            'tipoDeclaracion',
            'updatedAt',
            'datosGenerales',
            'domicilioDeclarante',
            'datosCurricularesDeclarante',
            'datosEmpleoCargoComision',
            'experienciaLaboral',
            'datosPareja',
            'datosDependientesEconomicos',
            'ingresos',
            'actividadAnualAnterior',
            'bienesInmuebles',
            'vehiculos',
            'bienesMuebles',
            'inversionesCuentasValores',
            'adeudosPasivos',
            'prestamoComodato',
            'participacion',
            'participacionTomaDecisiones',
            'apoyos',
            'representaciones',
            'clientesPrincipales',
            'beneficiosPrivados',
            'fideicomisos');
        });
      } catch (e) {
        console.log(e);
      }

      console.log(newSort);
      console.log(newQuery);

      let objResponse = {};
      objResponse["pagination"] = objpagination;
      objResponse["results"] = strippedRows;
      return objResponse;


    } else {
      throw new RangeError("Error campo pageSize fuera de rango, el rango del campo es 1..200 ");
    }
  }
}
module.exports.post_declaraciones = post_declaraciones;


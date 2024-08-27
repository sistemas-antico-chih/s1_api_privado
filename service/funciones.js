const { values } = require('underscore');
var _ = require('underscore');

function convertirFechaLarga(fecha) {
  let year = fecha.getFullYear();
  let month = fecha.getMonth() + 1 < 10 ? '0' + (fecha.getMonth() + 1) : fecha.getMonth() + 1;
  let day = fecha.getDate() < 10 ? '0' + (fecha.getDate()) : fecha.getDate();
  let hour = fecha.getHours() < 10 ? '0' + (fecha.getHours()) : fecha.getHours();
  let minute = fecha.getMinutes() < 10 ? '0' + (fecha.getMinutes()) : fecha.getMinutes();
  let seconds = fecha.getSeconds() < 10 ? '0' + (fecha.getSeconds()) : fecha.getSeconds();
  return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + seconds + 'Z';
}

function convertirFechaCorta(fecha) {
  let y = fecha.getFullYear();
  let m = fecha.getMonth() + 1 < 10 ? '0' + (fecha.getMonth() + 1) : fecha.getMonth() + 1;
  let d = fecha.getDate() < 10 ? '0' + (fecha.getDate()) : fecha.getDate();
  return y + '-' + m + '-' + d;
}

function datosGenerales(datosGenerales) {
  if (datosGenerales.segundoApellido === null) {
    datosGenerales.segundoApellido = "";
  }
  if (datosGenerales.nacionalidad === "MEX") {
    datosGenerales.nacionalidad = "MX"
  }
  if (datosGenerales.nacionalidad !== "MEX") {
    datosGenerales.nacionalidad = datosGenerales.paisNacimiento;
  }
  if (datosGenerales.correoElectronico) {
    if (datosGenerales.correoElectronico.institucional === null)
      datosGenerales.correoElectronico.institucional = datosGenerales.correoElectronico.personal;
  }
  return datosGenerales;
}

function datosCurricularesDeclarante(datosCurricularesDeclarante) {
  if (datosCurricularesDeclarante.escolaridad.length >= 1) {
    datosCurricularesDeclarante.escolaridad.forEach((n) => {
      if (n.carreraAreaConocimiento === null) {
        n.carreraAreaConocimiento = "";
      }
      n.fechaObtencion = convertirFechaCorta(n.fechaObtencion);
      return n;
    })
  }
  return datosCurricularesDeclarante;
}

function datosEmpleoCargoComision(datosEmpleoCargoComision) {
  datosEmpleoCargoComision.fechaTomaPosesion = convertirFechaCorta(datosEmpleoCargoComision.fechaTomaPosesion);
  if (datosEmpleoCargoComision.telefonoOficina.extension === null) {
    datosEmpleoCargoComision.telefonoOficina.extension = "";
  }
  if (datosEmpleoCargoComision.telefonoOficina.telefono === null) {
    datosEmpleoCargoComision.telefonoOficina.telefono = "";
  }
  if (datosEmpleoCargoComision.domicilioMexico) {
    if (datosEmpleoCargoComision.domicilioMexico.numeroInterior === null) {
      datosEmpleoCargoComision.domicilioMexico.numeroInterior = "";
    }
  }
  if (datosEmpleoCargoComision.domicilioExtranjero) {
    if (datosEmpleoCargoComision.domicilioExtranjero.numeroInterior === null) {
      datosEmpleoCargoComision.domicilioExtranjero.numeroInterior = "";
    }
  }
  return datosEmpleoCargoComision;
}


function experienciaLaboral(experienciaLaboral) {
  if (experienciaLaboral.experiencia.length >= 1) {
    var experiencia = experienciaLaboral.experiencia;
    experiencia.forEach((n) => {
      n.fechaIngreso = convertirFechaCorta(n.fechaIngreso);
      n.fechaEgreso = convertirFechaCorta(n.fechaEgreso);
      if (n.rfc === null) {
        n.rfc = "";
      }
      if (n.ambitoSector.clave === "PRV") {
        if (n.nivelOrdenGobierno === null) {
          n.nivelOrdenGobierno = "";
        }
        if (n.ambitoPublico === null) {
          n.ambitoPublico = "";
        }
        if (n.nombreEntePublico === null) {
          n.nombreEntePublico = "";
        }
        if (n.areaAdscripcion === null) {
          n.areaAdscripcion = "";
        }
        if (n.empleoCargoComision === null) {
          n.empleoCargoComision = "";
        }
        if (n.funcionPrincipal === null) {
          n.funcionPrincipal = "";
        }
      }
      if (n.ambitoSector.clave === "PUB") {
        if (n.nombreEmpresaSociedadAsociacion === null) {
          n.nombreEmpresaSociedadAsociacion = "";
        }
        if (n.area === null) {
          n.area = "";
        }
        if (n.puesto === null) {
          n.puesto = "";
        }
        if (n.sector === null) {
          n.sector = "";
        }
      }
      if (n.ambitoSector.clave === "OTR") {
        if (n.nivelOrdenGobierno === null) {
          n.nivelOrdenGobierno = "";
        }
        if (n.ambitoPublico === null) {
          n.ambitoPublico = "";
        }
        if (n.nombreEntePublico === null) {
          n.nombreEntePublico = "";
        }
        if (n.areaAdscripcion === null) {
          n.areaAdscripcion = "";
        }
        if (n.empleoCargoComision === null) {
          n.empleoCargoComision = "";
        }
        if (n.funcionPrincipal === null) {
          n.funcionPrincipal = "";
        }
      }
      return n;
    })
  }
  return experiencia;
}

function ingresos(ingresos, tipoDeclaracion) {
  if (tipoDeclaracion === "MODIFICACION") {
    ingresos['remuneracionAnualCargoPublico'] = ingresos['remuneracionMensualCargoPublico'];
    ingresos['otrosIngresosAnualesTotal'] = ingresos['otrosIngresosMensualesTotal'];
    ingresos['ingresoAnualNetoParejaDependiente'] = ingresos['ingresoMensualNetoParejaDependiente'];
    ingresos['ingresoAnualNetoDeclarante'] = ingresos['ingresoMensualNetoDeclarante'];
    ingresos['totalIngresosAnualesNetos'] = ingresos['totalIngresosMensualesNetos'];
    delete ingresos['remuneracionMensualCargoPublico'];
    delete ingresos['otrosIngresosMensualesTotal'];
    delete ingresos['ingresoMensualNetoParejaDependiente'];
    delete ingresos['ingresoMensualNetoDeclarante'];
    delete ingresos['totalIngresosMensualesNetos'];
  }
  if (tipoDeclaracion === "CONCLUSION") {
    ingresos['remuneracionConclusionCargoPublico'] = ingresos['remuneracionMensualCargoPublico'];
    ingresos['otrosIngresosConclusionTotal'] = ingresos['otrosIngresosMensualesTotal'];
    ingresos['ingresoConclusionNetoParejaDependiente'] = ingresos['ingresoMensualNetoParejaDependiente'];
    ingresos['ingresoConclusionNetoDeclarante'] = ingresos['ingresoMensualNetoDeclarante'];
    ingresos['totalIngresosConclusionNetos'] = ingresos['totalIngresosMensualesNetos'];
    delete ingresos['remuneracionMensualCargoPublico'];
    delete ingresos['otrosIngresosMensualesTotal'];
    delete ingresos['ingresoMensualNetoParejaDependiente'];
    delete ingresos['ingresoMensualNetoDeclarante'];
    delete ingresos['totalIngresosMensualesNetos'];
  }
  if (ingresos.enajenacion === undefined) {
    let bienesMuebles;
    bienesMuebles = {
      remuneracionTotal: { valor: 0, moneda: 'MXN' },
      bienes: []
    }
    ingresos['enajenacionBienes'] = bienesMuebles;
  }
  return ingresos;
}

function actividadAnualAnterior(actividadAnualAnterior) {
  if(actividadAnualAnterior.servidorPublicoAnioAnterior === true){
    actividadAnualAnterior.fechaIngreso = convertirFechaCorta(actividadAnualAnterior.fechaIngreso);
    actividadAnualAnterior.fechaConclusion = convertirFechaCorta(actividadAnualAnterior.fechaConclusion);
  }
  if(actividadAnualAnterior.servidorPublicoAnioAnterior === false){
    delete actividadAnualAnterior.fechaIngreso;
    delete actividadAnualAnterior.fechaConclusion;
    delete actividadAnualAnterior.remuneracionNetaCargoPublico;
    delete actividadAnualAnterior.otrosIngresosTotal;
    delete actividadAnualAnterior.actividadIndustrialComercialEmpresarial;
    delete actividadAnualAnterior.actividadFinanciera;
    delete actividadAnualAnterior.serviciosProfesionales;
    delete actividadAnualAnterior.enajenacionBienes;
    delete actividadAnualAnterior.otrosIngresos;
    delete actividadAnualAnterior.ingresoNetoAnualDeclarante;
    delete actividadAnualAnterior.ingresoNetoAnualParejaDependiente;
    delete actividadAnualAnterior.totalIngresosNetosAnuales;
  }
  return actividadAnualAnterior;
}

function datosPareja(datosPareja) {
  datosPareja.fechaNacimiento = convertirFechaCorta(datosPareja.fechaNacimiento);
  datosPareja.ninguno = false;
  if (datosPareja.actividadLaboralSectorPublico) {
    datosPareja.actividadLaboralSectorPublico.fechaIngreso = convertirFechaCorta(datosPareja.actividadLaboralSectorPublico.fechaIngreso)
  }
  if (datosPareja.actividadLaboralSectorPrivadoOtro) {
    datosPareja.actividadLaboralSectorPrivadoOtro.fechaIngreso = convertirFechaCorta(datosPareja.actividadLaboralSectorPrivadoOtro.fechaIngreso)
  }
  if (datosPareja.domicilioMexico) {
    if (datosPareja.domicilioMexico.numeroInterior === null) {
      datosPareja.domicilioMexico.numeroInterior = "";
    }
  }
  if (datosPareja.domicilioExtranjero) {
    if (datosPareja.domicilioExtranjero.numeroInterior === null) {
      datosPareja.domicilioExtranjero.numeroInterior = "";
    }
  }
  if (datosPareja.actividadLaboralSectorPrivadoOtro) {
    if (datosPareja.actividadLaboralSectorPrivadoOtro.rfc === null) {
      datosPareja.actividadLaboralSectorPrivadoOtro.rfc = "";
    }
  }
  if (datosPareja.rfc === null) {
    datosPareja.rfc = "";
  }
  if (datosPareja.curp === null) {
    datosPareja.curp = "";
  }
  if (datosPareja.segundoApellido === null) {
    datosPareja.segundoApellido = "";
  }
  if (datosPareja.actividadLaboral.clave === 'OTR') {
    datosPareja.actividadLaboral.clave = 'OTRO'
  }
  return datosPareja;
}

function bienesInmuebles(bienInmueble) {
  let bienesInmuebles = [];
  bienInmueble.forEach((n) => {
    n.fechaAdquisicion = convertirFechaCorta(n.fechaAdquisicion);
    if (n.titular) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.titular[0].clave === "DEC") {
        if (n.superficieConstruccion.unidad === null) {
          n.superficieConstruccion.unidad = 'm2';
        }
        if (n.superficieTerreno.unidad === null) {
          n.superficieTerreno.unidad = 'm2';
        }
        if (n.domicilioExtranjero === null) {
          delete n.domicilioExtranjero;
        }
        if (n.domicilioMexico === null) {
          delete n.domicilioMexico;
        }
        if (n.tercero) {
          if (n.tercero[0].tipoPersona === null || n.tercero[0].tipoPersona === "FISICA") {
            delete n.tercero;
          }
          else {
            if (n.tercero[0].nombreRazonSocial === null) {
              n.tercero[0].nombreRazonSocial = "";
            }
            if (n.tercero[0].rfc === null) {
              n.tercero[0].rfc = "";
            }
          }
        }
        if (n.transmisor) {
          if (n.transmisor[0].tipoPersona != "MORAL") {
            delete n.transmisor;
          }
          else {
            if (n.transmisor[0].nombreRazonSocial === null) {
              n.transmisor[0].nombreRazonSocial = "";
            }
            if (n.transmisor[0].rfc === null) {
              n.transmisor[0].rfc = "";
            }
          }
        }
        if (n.formaPago === 'CREDITO') {
          n.formaPago = 'CRÉDITO';
        }
        if (n.formaPago === 'NO_APLICA') {
          n.formaPago = 'NO APLICA';
        }
        if (n.valorConformeA === 'ESCRITURA_PUBLICA') {
          n.valorConformeA = 'ESCRITURA PÚBLICA';
        }
        if (n.motivoBaja === null) {
          delete n.motivoBaja;
        }
        delete n.datoIdentificacion;
        delete n.titular[0].titularDec;
        n.superficieTerreno.valor = Math.floor(n.superficieTerreno.valor);
        n.superficieConstruccion.valor = Math.floor(n.superficieConstruccion.valor);
        bienesInmuebles.push(n);
      }
    }
  })
  return bienesInmuebles;
}

function vehiculos(vehiculo) {
  let vehiculos = [];
  vehiculo.forEach((n) => {
    n.fechaAdquisicion = convertirFechaCorta(n.fechaAdquisicion);
    if (n.titular) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.titular[0].clave === "DEC") {
        if (n.tercero) {
          if (n.tercero[0].tipoPersona === null || n.tercero[0].tipoPersona === "FISICA") {
            delete n.tercero;
          }
          else {
            if (n.tercero[0].nombreRazonSocial === null) {
              n.tercero[0].nombreRazonSocial = "";
            }
            if (n.tercero[0].rfc === null) {
              n.tercero[0].rfc = "";
            }
          }
        }
        if (n.transmisor) {
          if (n.transmisor.length === 0) {
            delete n.transmisor;
          }
          else if (n.transmisor[0].tipoPersona != "MORAL") {
            delete n.transmisor;
          }
          else {
            if (n.transmisor[0].nombreRazonSocial === null) {
              n.transmisor[0].nombreRazonSocial = "";
            }
            if (n.transmisor[0].rfc === null) {
              n.transmisor[0].rfc = "";
            }
          }
        }
        if (n.lugarRegistro.pais === null || !n.lugarRegistro.pais) {
          n.lugarRegistro.pais = "MX";
        }
        if (n.lugarRegistro.entidadFederativa === null) {
          n.lugarRegistro.entidadFederativa = "";
        }
        if (n.lugarRegistro.pais != 'MX') {
          delete n.lugarRegistro.entidadFederativa;
        }
        if (n.motivoBaja === null) {
          delete n.motivoBaja;
        }
        if (n.formaPago === 'CREDITO') {
          n.formaPago = 'CRÉDITO';
        }
        if (n.formaPago === 'NO_APLICA') {
          n.formaPago = 'NO APLICA';
        }
        delete n.numeroSerieRegistro
        vehiculos.push(n);
      }
    }
  })
  return vehiculos;
}

function bienesMuebles(bienMueble) {
  let bienesMuebles = [];
  bienMueble.forEach((n) => {
    n.fechaAdquisicion = convertirFechaCorta(n.fechaAdquisicion);
    if (n.titular) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.titular[0].clave === "DEC") {
        if (n.tercero) {
          if (n.tercero[0].tipoPersona === null || n.tercero[0].tipoPersona === "FISICA") {
            delete n.tercero;
          }
          else {
            if (n.tercero[0].nombreRazonSocial === null) {
              n.tercero[0].nombreRazonSocial = "";
            }
            if (n.tercero[0].rfc === null) {
              n.tercero[0].rfc = "";
            }
          }
        }
        if (n.transmisor) {
          if (n.transmisor[0].tipoPersona != "MORAL") {
            delete n.transmisor;
          }
          else {
            if (n.transmisor[0].nombreRazonSocial === null) {
              n.transmisor[0].nombreRazonSocial = "";
            }
            if (n.transmisor[0].rfc === null) {
              n.transmisor[0].rfc = "";
            }
          }
        }
        if (n.motivoBaja === null) {
          delete n.motivoBaja;
        }
        if (n.formaPago === 'CREDITO') {
          n.formaPago = 'CRÉDITO';
        }
        if (n.formaPago === 'NO_APLICA') {
          n.formaPago = 'NO APLICA';
        }
        bienesMuebles.push(n);
      }
    }
  });
  return bienesMuebles;

}

function adeudosPasivos(adeudo) {
  let adeudos = []
  adeudo.forEach((n) => {
    n.fechaAdquisicion = convertirFechaCorta(n.fechaAdquisicion);
    if (n.titular) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.titular[0].clave === "DEC") {
        if (n.tercero) {
          if (n.tercero[0].tipoPersona === null || n.tercero[0].tipoPersona === "FISICA") {
            delete n.tercero;
          }
          else {
            if (n.tercero[0].nombreRazonSocial === null) {
              n.tercero[0].nombreRazonSocial = "";
            }
            if (n.tercero[0].rfc === null) {
              n.tercero[0].rfc = "";
            }
          }
        }
        if (n.montoOriginal) {
          if (n.montoOriginal.moneda === null) {
            n.montoOriginal.moneda = "MXN";
          }
        }
        if (n.otorganteCredito.tipoPersona) {
          if (n.otorganteCredito.tipoPersona === "FISICA") {
            delete n.otorganteCredito;
          }
          else {
            if (n.otorganteCredito.tipoPersona === null) {
              n.otorganteCredito.tipoPersona = "";
            }
            if (n.otorganteCredito.nombreInstitucion === null) {
              n.otorganteCredito.nombreInstitucion = "";
            }
            if (n.otorganteCredito.rfc === null) {
              n.otorganteCredito.rfc = "";
            }
          }
        }
        if (n.montoOriginal) {
          if (n.montoOriginal.moneda === null) {
            n.montoOriginal.moneda = "MXN";
          }
        }
        if (n.saldoInsolutoSituacionActual) {
          if (n.saldoInsolutoSituacionActual.moneda === null) {
            n.saldoInsolutoSituacionActual.moneda = "MXN";
          }
        }
        if (n.localizacionAdeudo) {
          if (n.localizacionAdeudo.pais === null) {
            n.localizacionAdeudo.pais = "MX";
          }
        }
        if (n.motivoBaja === null) {
          delete n.motivoBaja;
        }
        delete n.numeroCuentaContrato;
        adeudos.push(n);
      }
    }
  })
  return adeudos;
}

function inversionesCuentasValores(inversion) {
  let inversiones = [];
  inversion.forEach((n) => {
    if (n.titular) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.titular[0].clave === "DEC") {
        if (n.tercero) {
          if (n.tercero[0].tipoPersona === null || n.tercero[0].tipoPersona === "FISICA") {
            delete n.tercero;
          }
          else {
            if (n.tercero[0].nombreRazonSocial === null) {
              n.tercero[0].nombreRazonSocial = "";
            }
            if (n.tercero[0].rfc === null) {
              n.tercero[0].rfc = "";
            }
          }
        }
        if (n.localizacionInversion) {
          if (!n.localizacionInversion.pais) {
            n.localizacionInversion.pais = "MX";
          }
          if (n.localizacionInversion.pais === null) {
            n.localizacionInversion.pais = "MX";
          }
          if (n.localizacionInversion.institucionRazonSocial === null) {
            n.localizacionAdeudo.institucionRazonSocial = "";
          }
          if (n.localizacionInversion.rfc === null) {
            n.localizacionInversion.rfc = "";
          }
        }
        if (n.motivoBaja === null) {
          delete n.motivoBaja;
        }
        if (n.saldoSituacionActual) {
          if (n.saldoSituacionActual.moneda === null) {
            n.saldoSituacionActual = "MXN";
          }
        }
        delete n.numeroCuentaContrato;
        inversiones.push(n);
      }
    }
  })
  return inversiones;
}

function prestamoComodato(prestamo) {
  prestamo.forEach((n) => {
    if (n.duenoTitular) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.duenoTitular.tipoDuenoTitular != "FISICA") {
        if (n.tipoBien) {
          if (n.tipoBien.inmueble){
            if(n.tipoBien.inmueble.tipoInmueble){
              if(n.tipoBien.inmueble.tipoInmueble.clave === ""){
                delete n.tipoBien.inmueble;    
              }
            }
          }
          if (n.tipoBien.inmueble === null) {
            delete n.tipoBien.inmueble;
          }
          if (n.tipoBien.inmueble) {
            if (n.tipoBien.inmueble.domicilioMexico) {
              if (n.tipoBien.inmueble.domicilioMexico.numeroInterior === null) {
                n.tipoBien.inmueble.domicilioMexico.numeroInterior = "";
              }
            }
            if (n.tipoBien.inmueble.domicilioExtranjero) {
              if (n.tipoBien.inmueble.domicilioExtranjero.numeroInterior === null) {
                n.tipoBien.inmueble.domicilioExtranjero.numeroInterior = "";
              }
            }
          }
          if (n.tipoBien.vehiculo) {}
            if (n.tipoBien.vehiculo === null) {
              delete n.tipoBien.vehiculo;
            }
            if (n.tipoBien.vehiculo.lugarRegistro.pais === null) {
              n.tipoBien.vehiculo.lugarRegistro.pais = 'MX';
            }
            if (n.tipoBien.vehiculo.lugarRegistro.pais != 'MX') {
              delete n.tipoBien.vehiculo.lugarRegistro.entidadFederativa;
            }
            delete n.tipoBien.vehiculo.numeroSerieRegistro;
            if(n.tipoBien.vehiculo.tipo){
              if(n.tipoBien.vehiculo.tipo.clave === ""){
                console.log("llega");
                delete n.tipoBien.vehiculo;
              }
            
          }
        }
      }
      else {
        if (n.duenoTitular.tipoDuenoTitular === "FISICA") {
          delete n.tipoBien;
          delete n.duenoTitular;
        }
      }
    }
  })
  return prestamo;
}

function participacion(participacion) {
  let participaciones = [];
  participacion.forEach((n) => {
    if (n.tipoRelacion) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.tipoRelacion === "DECLARANTE") {
        if (n.recibeRemuneracion === false) {
          delete n.montoMensual;
        }
        if (n.montoMensual) {
          if (n.montoMensual.moneda === null) {
            n.montoMensual.moneda = "MXN";
          }
        }
        if (n.ubicacion) {
          if (n.ubicacion.pais === null) {
            n.ubicacion.pais = "MX";
          }
        }
        if (n.porcentajeParticipacion === 0) {
          n.porcentajeParticipacion = 1;
        }
        participaciones.push(n);
      }
    }
  })
  return participaciones;
}

function tomaDecisiones(tomaDecision) {
  let tomaDecisiones = [];
  tomaDecision.forEach((n) => {
    if (n.tipoRelacion) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      n.fechaInicioParticipacion = convertirFechaCorta(n.fechaInicioParticipacion);
      if (n.tipoRelacion === "DECLARANTE") {
        if (n.recibeRemuneracion === false) {
          delete n.montoMensual;
        }
        if (n.montoMensual) {
          if (n.montoMensual.moneda === null) {
            n.montoMensual.moneda = "MXN";
          }
        }
        if (n.ubicacion) {
          if (n.ubicacion.pais === null) {
            n.ubicacion.pais = "MX";
          }
        }
        tomaDecisiones.push(n);
      }
    }
  });
  return tomaDecisiones;
}

function apoyos(apoyo) {
  let apoyos = [];
  apoyo.forEach((n) => {
    if (n.beneficiarioPrograma) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.beneficiarioPrograma.clave === "DC") {
        if (n.montoApoyoMensual) {
          if (n.montoApoyoMensual.moneda === null) {
            n.montoApoyoMensual.moneda = 'MXN';
          }
        }
        apoyos.push(n);
      }
    }
  });
  return apoyos;
}

function representaciones(representacion) {
  let representaciones = [];
  representacion.forEach((n) => {
    n.fechaInicioRepresentacion = convertirFechaCorta(n.fechaInicioRepresentacion);
    if (n.tipoRelacion) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.tipoRelacion === "DECLARANTE") {
        if (n.tipoOperacion === null) {
          n.tipoOperacion = "AGREGAR";
        }
        if (n.recibeRemuneracion === false) {
          if (n.montoMensual === null) {
            delete n.montoMensual;
          }
        }
        if (n.montoMensual) {
          if (n.montoMensual.moneda === null) {
            n.montoMensual.moneda = "MXN"
          }
        }
        if (n.ubicacion) {
          if (n.ubicacion.pais === null) {
            n.ubicacion.pais = "MX";
          }
        }
        if (n.rfc === null) {
          n.rfc = "";
        }
        if (n.tipoPersona === "FISICA") {
          delete n.rfc;
          delete n.nombreRazonSocial;
        }
        representaciones.push(n);
      }
    }
  });
  return representaciones;
}

function clientesPrincipales(cliente) {
  let clientes = [];
  cliente.forEach((n) => {
    if (n.tipoRelacion) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.tipoRelacion === "DECLARANTE") {
        if (n.clientePrincipal.tipoPersona === "FISICA") {
          delete n.clientePrincipal;
        }
        if (n.empresa.rfc === null) {
          n.empresa.rfc = "";
        }
        if (n.ubicacion) {
          if (n.ubicacion.pais === null) {
            n.ubicacion.pais = "MX";
          }
          if (n.ubicacion.entidadFederativa === null) {
            n.ubicacion.entidadFederativa = "";
          }
          if (n.ubicacion.pais !== 'MX') {
            delete n.ubicacion.entidadFederativa;
          }
        }
        if (n.clientePrincipal === null) {
          n.clientePrincipal = "";
        }
        if (n.montoAproximadoGanancia.moneda === null) {
          n.montoAproximadoGanancia.moneda = "MXN";
        }
        clientes.push(n);
      }
    }
  });
  return clientes;
}

function beneficiosPrivados(beneficio) {
  let beneficios = [];
  beneficio.forEach((n) => {
    if (n.beneficiario) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.beneficiario[0].clave === "DC") {

        if (n.otorgante.tipoPersona === null) {
          delete n.otorgante;
        }
        if (n.otorgante) {
          if (n.otorgante.nombreRazonSocial === null) {
            n.otorgante.nombreRazonSocial = "";
          }
          if (n.otorgante.rfc === null) {
            n.otorgante.rfc = "";
          }
          if (n.otorgante.tipoPersona === "FISICA") {
            delete n.otorgante;
          }
        }
        if (n.montoMensualAproximado) {
          if (n.montoMensualAproximado.moneda === null) {
            n.montoMensualAproximado.moneda = "MXN";
          }
        }
        beneficios.push(n);
      }
    }
  });
  return beneficios;
}

function fideicomisos(fideicomiso) {
  let fideicomisos = [];
  fideicomiso.forEach((n) => {
    if (n.tipoRelacion) {
      if (n.tipoOperacion === null) {
        n.tipoOperacion = "AGREGAR";
      }
      if (n.tipoRelacion === "DECLARANTE") {
        if (n.rfcFideicomiso === null) {
          delete n.rfcFideicomiso;
        }

        if (n.fideicomitente) {
          if (n.fideicomitente.rfc === null) {
            n.fideicomitente.rfc = "";
          }
          if (n.fiduciario) {
            delete n.fiduciario;
          }
          if (n.fideicomisario) {
            delete n.fideicomisario;
          }
        }

        if (n.fiduciario) {
          if (n.fiduciario.rfc === null) {
            n.fiduciario.rfc = "";
          }
          if (n.fideicomitente === null) {
            delete n.fideicomitente;
          }
          if (n.fideicomisario === null) {
            delete n.fideicomisario;
          }
        }

        if (n.fideicomisario) {
          if (n.fideicomisario.rfc === null) {
            n.fideicomisario.rfc = "";
          }
          if (n.fideicomitente === null) {
            delete n.fideicomitente;
          }
          if (n.fiduciario === null) {
            delete n.fiduciario;
          }
        }
        if (n.extranjero === null) {
          n.extranjero = "MX";
        }
        fideicomisos.push(n);
      }
    }
  });
  return fideicomisos;
}

module.exports = {
  convertirFechaLarga,
  datosGenerales,
  datosCurricularesDeclarante,
  datosEmpleoCargoComision,
  //domicilioDeclarante,
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
};
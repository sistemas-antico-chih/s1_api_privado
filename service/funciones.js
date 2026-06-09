// Helpers reutilizables

function isEmptyValue(value) {
  return value === null || value === undefined || value === '';
}

function hasRealData(obj) {
  if (!obj) return false;

  return Object.values(obj).some(value => {
    if (typeof value === 'object' && value !== null) {
      return hasRealData(value); // recursivo
    }
    return !isEmptyValue(value);
  });
}

function sanitizeValue(value) {
  return isEmptyValue(value) ? '' : value;
}

function sanitizeObject(obj) {
  if (!obj) return obj;

  const result = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      result[key] = '';
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      const nested = sanitizeObject(value);

      if (hasRealData(nested)) {
        result[key] = nested;
      }
    } else {
      result[key] = value;
    }
  });

  return result;
}

const isNil = (v) => v === null || v === undefined;

const defaultValue = (value, def = "") => isNil(value) ? def : value;

const assignIfExists = (base, key, value) => {
  if (value && (!Array.isArray(value) || value.length > 0)) {
    base[key] = value;
  } else {
    // 🔴 SI ES TERCERO → FORZAR FISICA
    if (key === 'tercero') {
      base[key] = [{
        tipoPersona: "FISICA",
        nombreRazonSocial: "",
        rfc: ""
      }];
    } else {
      delete base[key];
    }
  }
};

const pad = (n) => String(n).padStart(2, '0');

const formatFecha = (fecha, withTime = false) => {
  if (!fecha) return null;

  const f = new Date(fecha);

  if (isNaN(f.getTime())) return null; // <-- agregar esto

  const base = `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}`;

  if (!withTime) return base;

  return `${base}T${pad(f.getHours())}:${pad(f.getMinutes())}:${pad(f.getSeconds())}Z`;
};

const normalizeTercero = (persona) => {
  if (!persona) return null;

  const nombre = persona.nombreRazonSocial?.trim() || "";
  const rfc = persona.rfc?.trim() || "";

  // 🔵 SI ES MORAL Y TIENE DATOS → se respeta
  if (persona.tipoPersona === "MORAL" && (nombre || rfc)) {
    return {
      tipoPersona: "MORAL",
      nombreRazonSocial: nombre,
      rfc: rfc
    };
  }

  // 🔴 TODO LO DEMÁS → FISICA POR DEFAULT
  return {
    tipoPersona: "FISICA",
    nombreRazonSocial: nombre,
    rfc: rfc
  };
};

const normalizePersonaMoral = (persona) => {
  if (!persona) return null;

  const nombre = persona.nombreRazonSocial?.trim() || "";
  const rfc = persona.rfc?.trim() || "";

  // ✅ SOLO SI ES MORAL Y TIENE DATOS → se respeta
  if (persona.tipoPersona === "MORAL" && (nombre || rfc)) {
    return {
      tipoPersona: "MORAL",
      nombreRazonSocial: nombre,
      rfc: rfc
    };
  }

  // ❌ SI NO ES MORAL → NO SE REGRESA NADA
  return null;
};

const normalizePersonaFideicomiso = (persona) => {

  if (!persona) {
    return {
      tipoPersona: "",
      nombreRazonSocial: "",
      rfc: ""
    };
  }

  // Mostrar únicamente personas morales
  if (persona.tipoPersona === "MORAL") {
    return {
      tipoPersona: "MORAL",
      nombreRazonSocial: defaultValue(persona.nombreRazonSocial),
      rfc: defaultValue(persona.rfc)
    };
  }

  // Personas físicas se ocultan
  return {
    tipoPersona: "",
    nombreRazonSocial: "",
    rfc: ""
  };
};

function convertirFechaCorta(fecha) {
  return formatFecha(fecha, false);
}

function convertirFechaLarga(fecha) {
  return formatFecha(fecha, true);
}

function datosGenerales(data) {
  if (!data) return data;

  return {
    correoElectronico: data.correoElectronico
      ? {
        institucional: data.correoElectronico.institucional
      }
      : undefined,

    nombre: data.nombre,
    primerApellido: data.primerApellido,
    segundoApellido: data.segundoApellido
  };
}

function datosCurricularesDeclarante(data) {
  if (!data?.escolaridad?.length) return data;

  const escolaridad = data.escolaridad.map((n) =>
    sanitizeObject({
      ...n,

      carreraAreaConocimiento: sanitizeValue(n.carreraAreaConocimiento),
      fechaObtencion: convertirFechaCorta(n.fechaObtencion)
    })
  );

  return sanitizeObject({
    ...data,
    escolaridad
  });
}

function datosEmpleoCargoComision(data) {
  if (!data) return {};

  const limpio = sanitizeObject({
    ...data,

    fechaTomaPosesion: convertirFechaCorta(data.fechaTomaPosesion),

    telefonoOficina: data.telefonoOficina
      ? {
        ...data.telefonoOficina,
        extension: sanitizeValue(data.telefonoOficina.extension),
        telefono: sanitizeValue(data.telefonoOficina.telefono)
      }
      : null,

    domicilioMexico: data.domicilioMexico
      ? {
        ...data.domicilioMexico,
        numeroInterior: sanitizeValue(data.domicilioMexico.numeroInterior)
      }
      : null,

    domicilioExtranjero: data.domicilioExtranjero
      ? {
        ...data.domicilioExtranjero,
        numeroInterior: sanitizeValue(data.domicilioExtranjero.numeroInterior)
      }
      : null
  });

  // Eliminar domicilio contrario vacío
  if (limpio.domicilioMexico) {
    delete limpio.domicilioExtranjero;
  }

  if (limpio.domicilioExtranjero) {
    delete limpio.domicilioMexico;
  }

  return limpio;
}

function experienciaLaboral(data) {
  if (!data?.experiencia?.length) {
    return data;
  }

  const experiencia = data.experiencia.map((n) => {
    const base = {
      ambitoSector: n.ambitoSector,
      fechaIngreso: convertirFechaCorta(n.fechaIngreso),
      fechaEgreso: convertirFechaCorta(n.fechaEgreso),
      ubicacion: n.ubicacion
    };

    if (n.rfc) {
      base.rfc = n.rfc;
    }

    // 🟢 SECTOR PRIVADO U OTRO
    if (["PRV", "OTR"].includes(n.ambitoSector?.clave)) {
      return sanitizeObject({
        ...base,
        nombreEmpresaSociedadAsociacion: sanitizeValue(n.nombreEmpresaSociedadAsociacion),
        area: sanitizeValue(n.area),
        puesto: sanitizeValue(n.puesto),
        sector: n.sector ?? ""
      });
    }

    // 🔵 SECTOR PÚBLICO
    if (n.ambitoSector?.clave === "PUB") {
      return sanitizeObject({
        ...base,
        nivelOrdenGobierno: sanitizeValue(n.nivelOrdenGobierno),
        ambitoPublico: sanitizeValue(n.ambitoPublico),
        nombreEntePublico: sanitizeValue(n.nombreEntePublico),
        areaAdscripcion: sanitizeValue(n.areaAdscripcion),
        empleoCargoComision: sanitizeValue(n.empleoCargoComision),
        funcionPrincipal: sanitizeValue(n.funcionPrincipal)
      });
    }

    return sanitizeObject(base);
  });

  return sanitizeObject({
    ...data,
    experiencia
  });
}

const INGRESOS_MAP = {
  MODIFICACION: {
    remuneracionMensualCargoPublico: "remuneracionAnualCargoPublico",
    otrosIngresosMensualesTotal: "otrosIngresosAnualesTotal",
    //ingresoMensualNetoParejaDependiente: "ingresoAnualNetoParejaDependiente",
    ingresoMensualNetoDeclarante: "ingresoAnualNetoDeclarante",
    totalIngresosMensualesNetos: "totalIngresosAnualesNetos"
  },
  CONCLUSION: {
    remuneracionMensualCargoPublico: "remuneracionConclusionCargoPublico",
    otrosIngresosMensualesTotal: "otrosIngresosConclusionTotal",
    //ingresoMensualNetoParejaDependiente: "ingresoConclusionNetoParejaDependiente",
    ingresoMensualNetoDeclarante: "ingresoConclusionNetoDeclarante",
    totalIngresosMensualesNetos: "totalIngresosConclusionNetos"
  }
};

function ingresos(data, tipoDeclaracion) {
  if (!data) return data;

  const newData = { ...data };

  const map = INGRESOS_MAP?.[tipoDeclaracion] || null;

  // 🔁 Renombrado dinámico de campos
  if (map) {
    Object.entries(map).forEach(([oldKey, newKey]) => {
      if (newData[oldKey] !== undefined && newData[oldKey] !== null) {
        newData[newKey] = newData[oldKey];
        delete newData[oldKey];
      }
    });
  }

  const camposEliminar = [
    'ingresoMensualNetoParejaDependiente'
  ];

  if (tipoDeclaracion === 'MODIFICACION' || tipoDeclaracion === 'CONCLUSION') {
    camposEliminar.forEach(campo => {
      delete newData[campo];
    });
  }

  // 🚫 campo no requerido en MODIFICACION / CONCLUSION
  if (
    tipoDeclaracion === 'MODIFICACION' ||
    tipoDeclaracion === 'CONCLUSION'
  ) {
    delete newData.ingresoMensualNetoParejaDependiente;
  }

  // 🧼 Asegurar estructura de enajenacionBienes
  if (
    !newData.enajenacionBienes ||
    typeof newData.enajenacionBienes !== 'object'
  ) {
    newData.enajenacionBienes = {
      remuneracionTotal: {
        valor: 0,
        moneda: 'MXN'
      },
      bienes: []
    };
  }

  return newData;
}

function limpiarIngresos(data, tipo) {
  if (!data) return data;

  const { ingresoMensualNetoParejaDependiente, ...resto } = data;

  if (tipo === 'INICIAL') {
    return data;
  }

  return resto;
}

function actividadAnualAnterior(data, tipoDeclaracion) {
  // 🚫 No aplica para MODIFICACION
  if (tipoDeclaracion === "MODIFICACION") {
    return undefined;
  }

  if (!data) return undefined;

  const newData = { ...data };

  if (newData.ingresoNetoAnualParejaDependiente) {
    delete newData.ingresoNetoAnualParejaDependiente;
  }

  if (newData.servidorPublicoAnioAnterior === true) {
    newData.fechaIngreso = newData.fechaIngreso
      ? convertirFechaCorta(newData.fechaIngreso)
      : undefined;

    newData.fechaConclusion = newData.fechaConclusion
      ? convertirFechaCorta(newData.fechaConclusion)
      : undefined;
  }

  if (newData.servidorPublicoAnioAnterior === false) {
    delete newData.fechaIngreso;
    delete newData.fechaConclusion;
    delete newData.remuneracionNetaCargoPublico;
    delete newData.otrosIngresosTotal;
    delete newData.actividadIndustrialComercialEmpresarial;
    delete newData.actividadFinanciera;
    delete newData.serviciosProfesionales;
    delete newData.enajenacionBienes;
    delete newData.otrosIngresos;
    delete newData.ingresoNetoAnualDeclarante;
    delete newData.ingresoNetoAnualParejaDependiente;
    delete newData.totalIngresosNetosAnuales;
  }

  return newData;
}

function datosPareja(data) {
  if (!data) return {};

  const pareja = {
    ...data,

    fechaNacimiento: convertirFechaCorta(data.fechaNacimiento),
    ninguno: false,

    rfc: sanitizeValue(data.rfc),
    curp: sanitizeValue(data.curp),
    segundoApellido: sanitizeValue(data.segundoApellido)
  };

  // 🟣 Actividad sector público
  if (data.actividadLaboralSectorPublico) {
    pareja.actividadLaboralSectorPublico = sanitizeObject({
      ...data.actividadLaboralSectorPublico,
      fechaIngreso: convertirFechaCorta(data.actividadLaboralSectorPublico.fechaIngreso)
    });
  }

  // 🟢 Actividad sector privado
  if (data.actividadLaboralSectorPrivadoOtro) {
    pareja.actividadLaboralSectorPrivadoOtro = sanitizeObject({
      ...data.actividadLaboralSectorPrivadoOtro,
      fechaIngreso: convertirFechaCorta(data.actividadLaboralSectorPrivadoOtro.fechaIngreso),
      rfc: sanitizeValue(data.actividadLaboralSectorPrivadoOtro.rfc)
    });
  }

  // 🏠 Domicilio México
  if (data.domicilioMexico) {
    const domMex = sanitizeObject({
      ...data.domicilioMexico,
      numeroInterior: sanitizeValue(data.domicilioMexico.numeroInterior)
    });

    if (hasRealData(domMex)) {
      pareja.domicilioMexico = domMex;
    }
  }

  // 🌎 Domicilio extranjero
  if (data.domicilioExtranjero) {
    const domExt = sanitizeObject({
      ...data.domicilioExtranjero,
      numeroInterior: sanitizeValue(data.domicilioExtranjero.numeroInterior)
    });

    if (hasRealData(domExt)) {
      pareja.domicilioExtranjero = domExt;
    }
  }

  // 🔄 Normalización de clave
  if (data.actividadLaboral?.clave === 'OTR') {
    pareja.actividadLaboral = {
      ...data.actividadLaboral,
      clave: 'OTRO'
    };
  }

  return sanitizeObject(pareja);
}


function bienesInmuebles(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.titular?.[0]?.clave === "DEC")
    .map(n => {

      const base = {
        ...n,
        fechaAdquisicion: convertirFechaCorta(n.fechaAdquisicion),

        tipoOperacion: n.tipoOperacion ?? "AGREGAR",

        superficieConstruccion: {
          ...n.superficieConstruccion,
          unidad: n.superficieConstruccion?.unidad ?? 'm2',
          valor: Math.floor(n.superficieConstruccion?.valor || 0)
        },

        superficieTerreno: {
          ...n.superficieTerreno,
          unidad: n.superficieTerreno?.unidad ?? 'm2',
          valor: Math.floor(n.superficieTerreno?.valor || 0)
        },

        formaPago:
          n.formaPago === 'CREDITO' ? 'CRÉDITO' :
            n.formaPago === 'NO_APLICA' ? 'NO APLICA' :
              n.formaPago,

        valorConformeA:
          n.valorConformeA === 'ESCRITURA_PUBLICA'
            ? 'ESCRITURA PÚBLICA'
            : n.valorConformeA
      };

      // 🧼 Normalizar domicilio
      if (base.domicilioMexico) {
        base.domicilioMexico = {
          ...base.domicilioMexico,
          numeroInterior: defaultValue(base.domicilioMexico.numeroInterior)
        };

      }

      // 🟢 TERCERO (SE CONSERVA AUN VACÍO)
      base.tercero = normalizePersonasFiltradas(n.tercero);

      // 🔵 TRANSMISOR (SIN relacion)
      base.transmisor = normalizePersonasFiltradas(n.transmisor);

      delete base.datoIdentificacion;
      delete base.domicilioMexico;
      delete base.domicilioExtranjero;

      return base;

    });
}


function vehiculos(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.titular?.[0]?.clave === "DEC")
    .map(n => {

      const base = {
        ...n,

        fechaAdquisicion: convertirFechaCorta(n.fechaAdquisicion),
        motivoBaja: n.motivoBaja,

        tipoOperacion: n.tipoOperacion ?? "AGREGAR",

        formaPago:
          n.formaPago === 'CREDITO' ? 'CRÉDITO' :
            n.formaPago === 'NO_APLICA' ? 'NO APLICA' :
              n.formaPago,
      };

      // 🔵 TERCERO (SIEMPRE PRESENTE)
      base.tercero = normalizePersonasFiltradas(n.tercero);
      base.transmisor = normalizePersonasFiltradas(n.transmisor);

      delete base.numeroSerieRegistro;
      delete base.lugarRegistro;

      // Limpieza
      if (!n.motivoBaja) delete base.motivoBaja;

      return base;
    });
}

function bienesMuebles(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.titular?.[0]?.clave === "DEC")
    .map(n => {

      const base = {
        ...n,

        tipoOperacion: n.tipoOperacion ?? "AGREGAR",
        fechaAdquisicion: convertirFechaCorta(n.fechaAdquisicion),

        formaPago:
          n.formaPago === 'CREDITO' ? 'CRÉDITO' :
            n.formaPago === 'NO_APLICA' ? 'NO APLICA' :
              n.formaPago
      };

      // 🔵 TERCERO (SIEMPRE PRESENTE)
      base.tercero = normalizePersonasFiltradas(n.tercero);
      base.transmisor = normalizePersonasFiltradas(n.transmisor);

      // 🧹 eliminar motivoBaja si viene null o vacío
      if (!n.motivoBaja) {
        delete base.motivoBaja;

      }

      return base;
    });
}


function adeudosPasivos(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.titular?.[0]?.clave === "DEC")
    .map(n => {

      const base = {
        ...n,
        fechaAdquisicion: convertirFechaCorta(n.fechaAdquisicion),
        tipoOperacion: n.tipoOperacion ?? "AGREGAR"
      };

      // 🟢 TERCERO (SIEMPRE PRESENTE)
      base.tercero = normalizePersonasFiltradas(n.tercero);


      // 🔵 OTORGANTE CRÉDITO (SIN PERDER CAMPOS)
      if (n.otorganteCredito) {
        base.otorganteCredito = {
          tipoPersona: n.otorganteCredito.tipoPersona,
          rfc: defaultValue(n.otorganteCredito.rfc),
          nombreInstitucion: defaultValue(n.otorganteCredito.nombreInstitucion)
        };

      }

      // 💰 MONTO ORIGINAL
      if (n.montoOriginal) {
        base.montoOriginal = {
          ...n.montoOriginal,
          moneda: defaultValue(n.montoOriginal.moneda, "MXN")
        };
      }

      // 💰 SALDO ACTUAL
      if (n.saldoInsolutoSituacionActual) {
        base.saldoInsolutoSituacionActual = {
          ...n.saldoInsolutoSituacionActual,
          moneda: defaultValue(n.saldoInsolutoSituacionActual.moneda, "MXN")
        };
      }

      // 🌍 LOCALIZACIÓN
      if (n.localizacionAdeudo) {
        base.localizacionAdeudo = {
          ...n.localizacionAdeudo,
          pais: defaultValue(n.localizacionAdeudo.pais, "MX")
        };
      }

      delete base.numeroCuentaContrato;

      return base;
    });
}


function inversionesCuentasValores(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.titular?.[0]?.clave === "DEC")
    .map(n => {

      const base = {
        ...n,

        tipoOperacion: n.tipoOperacion ?? "AGREGAR",

        // 🟢 LOCALIZACIÓN (SIEMPRE PRESENTE)
        localizacionInversion: {
          institucionRazonSocial: defaultValue(n.localizacionInversion?.institucionRazonSocial),
          rfc: defaultValue(n.localizacionInversion?.rfc),
          pais: defaultValue(n.localizacionInversion?.pais, "MX")
        },

        // 💰 SALDO
        saldoSituacionActual: n.saldoSituacionActual
          ? {
            ...n.saldoSituacionActual,
            moneda: defaultValue(n.saldoSituacionActual.moneda, "MXN")

          }
          : undefined
      };

      // 🔵 TERCERO (SIEMPRE PRESENTE)
      base.tercero = normalizePersonasFiltradas(n.tercero);

      // 🧹 limpieza
      if (!n.motivoBaja) {
        delete base.motivoBaja;
      }

      delete base.numeroCuentaContrato;

      return base;
    });
}

function prestamoComodato(data) {
  if (!data?.length) return [];

  return data.map(n => {

    const base = {
      ...n,
      tipoOperacion: n.tipoOperacion ?? "AGREGAR"
    };

    // 🔵 DUENO TITULAR (NORMALIZAR, NO ELIMINAR)
    if (n.duenoTitular) {
      base.duenoTitular = {
        tipoDuenoTitular: n.duenoTitular.tipoDuenoTitular,
        nombreTitular: defaultValue(n.duenoTitular.nombreTitular),
        rfc: defaultValue(n.duenoTitular.rfc),
        relacionConTitular: defaultValue(n.duenoTitular.relacionConTitular)
      };
    }

    // ----- INMUEBLE -----
    if (n.tipoBien?.inmueble) {

      const inmueble = { ...n.tipoBien.inmueble };

      if (inmueble.domicilioMexico) {
        inmueble.domicilioMexico = {
          ...inmueble.domicilioMexico,
          numeroInterior: defaultValue(inmueble.domicilioMexico.numeroInterior)
        };
      }

      if (inmueble.domicilioExtranjero) {
        inmueble.domicilioExtranjero = {
          ...inmueble.domicilioExtranjero,
          numeroInterior: defaultValue(inmueble.domicilioExtranjero.numeroInterior)
        };
      }

      base.tipoBien = {
        ...base.tipoBien,
        inmueble
      };
    }

    // ----- VEHICULO -----
    if (n.tipoBien?.vehiculo) {

      const vehiculo = { ...n.tipoBien.vehiculo };

      vehiculo.lugarRegistro = {
        ...vehiculo.lugarRegistro,
        pais: defaultValue(vehiculo.lugarRegistro?.pais, "MX")
      };

      base.tipoBien = {
        ...base.tipoBien,
        vehiculo
      };
    }

    return base;
  });
}

function participacion(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.tipoRelacion === "DECLARANTE")
    .map(n => {

      const base = {
        ...n,
        tipoOperacion: n.tipoOperacion ?? "AGREGAR",

        nombreEmpresaSociedadAsociacion: defaultValue(n.nombreEmpresaSociedadAsociacion),
        rfc: defaultValue(n.rfc)
      };

      // 💰 Si no recibe remuneración → eliminar monto
      if (n.recibeRemuneracion === false) {
        delete base.montoMensual;
      }

      // 💰 Monto mensual
      if (n.montoMensual) {
        base.montoMensual = {
          ...n.montoMensual,
          moneda: defaultValue(n.montoMensual.moneda, "MXN")
        };
      }

      // 🌍 Ubicación
      if (n.ubicacion) {
        base.ubicacion = {
          ...n.ubicacion,
          pais: defaultValue(n.ubicacion.pais, "MX")
        };
      }

      // 📊 Porcentaje (no permitir 0)
      if (n.porcentajeParticipacion === 0) {
        base.porcentajeParticipacion = 1;
      }

      return base;
    });
}

function tomaDecisiones(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.tipoRelacion === "DECLARANTE")
    .map(n => {

      const base = {
        ...n,
        tipoOperacion: n.tipoOperacion ?? "AGREGAR",
        fechaInicioParticipacion: convertirFechaCorta(n.fechaInicioParticipacion),

        nombreInstitucion: defaultValue(n.nombreInstitucion),
        rfc: defaultValue(n.rfc),
        puestoRol: defaultValue(n.puestoRol)
      };

      // 💰 Si no recibe remuneración → eliminar monto
      if (n.recibeRemuneracion === false) {
        delete base.montoMensual;
      }

      // 💰 Monto mensual
      if (n.montoMensual) {
        base.montoMensual = {
          ...n.montoMensual,
          moneda: defaultValue(n.montoMensual.moneda, "MXN")
        };
      }

      // 🌍 Ubicación
      if (n.ubicacion) {
        base.ubicacion = {
          ...n.ubicacion,
          pais: defaultValue(n.ubicacion.pais, "MX")
        };
      }

      return base;
    });
}

function apoyos(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.beneficiarioPrograma?.clave === "DC")
    .map(n => {

      const base = {
        ...n,
        tipoOperacion: n.tipoOperacion ?? "AGREGAR",

        nombrePrograma: defaultValue(n.nombrePrograma),
        institucionOtorgante: defaultValue(n.institucionOtorgante),
        especifiqueApoyo: defaultValue(n.especifiqueApoyo),
        nivelOrdenGobierno: defaultValue(n.nivelOrdenGobierno)
      };

      // 💰 Monto mensual
      if (n.montoApoyoMensual) {
        base.montoApoyoMensual = {
          ...n.montoApoyoMensual,
          moneda: defaultValue(n.montoApoyoMensual.moneda, "MXN")
        };
      }

      return base;
    });
}


function representaciones(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.tipoRelacion === "DECLARANTE")
    .map(n => {

      const base = {
        tipoRelacion: n.tipoRelacion,
        tipoRepresentacion: n.tipoRepresentacion,
        tipoPersona: n.tipoPersona,

        tipoOperacion: n.tipoOperacion ?? "AGREGAR",

        fechaInicioRepresentacion: convertirFechaCorta(
          n.fechaInicioRepresentacion || n.fechaInicio || null
        ),

        recibeRemuneracion: n.recibeRemuneracion
      };

      // ❌ eliminar completamente estos campos (no van en optimizado)
      // base.nombreRazonSocial
      // base.rfc

      // 💰 Monto mensual
      if (n.recibeRemuneracion && n.montoMensual) {
        base.montoMensual = {
          ...n.montoMensual,
          moneda: defaultValue(n.montoMensual.moneda, "MXN")
        };

      }

      // 🌍 Ubicación
      if (n.ubicacion) {
        base.ubicacion = {
          ...n.ubicacion,
          pais: defaultValue(n.ubicacion.pais, "MX")
        };
      }

      // 🏭 Sector
      if (n.sector) {
        base.sector = n.sector;
      }

      return base;
    });
}

function clientesPrincipales(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.tipoRelacion === "DECLARANTE")
    .map(n => {

      const base = {
        tipoOperacion: n.tipoOperacion ?? "AGREGAR",
        realizaActividadLucrativa: n.realizaActividadLucrativa,
        tipoRelacion: n.tipoRelacion
      };

      // 🏢 Empresa
      if (n.empresa) {
        base.empresa = {
          nombreEmpresaServicio: n.empresa.nombreEmpresaServicio,
          rfc: defaultValue(n.empresa.rfc)
        };
      }

      // 👤 Cliente principal (SIEMPRE se conserva)
      if (
        n.clientePrincipal &&
        n.clientePrincipal.tipoPersona === "MORAL"
      ) {
        base.clientePrincipal = {
          tipoPersona: n.clientePrincipal.tipoPersona,
          nombreRazonSocial: defaultValue(n.clientePrincipal.nombreRazonSocial),
          rfc: defaultValue(n.clientePrincipal.rfc)
        };
      }

      // 🏭 Sector
      if (n.sector) {
        base.sector = n.sector;
      }

      // 💰 Monto
      if (n.montoAproximadoGanancia) {
        base.montoAproximadoGanancia = {
          ...n.montoAproximadoGanancia,
          moneda: defaultValue(n.montoAproximadoGanancia.moneda, "MXN")
        };
      }

      // 🌍 Ubicación (puede venir vacía)
      if (n.ubicacion) {
        base.ubicacion = Object.keys(n.ubicacion).length
          ? {
            ...n.ubicacion,
            pais: defaultValue(n.ubicacion.pais, "MX"),
            entidadFederativa: n.ubicacion.entidadFederativa

          }
          : {};
      }

      return base;
    });
}

function beneficiosPrivados(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.beneficiario?.some(b => b.clave === "DC"))
    .map(n => {

      const base = {
        tipoOperacion: n.tipoOperacion ?? "AGREGAR",
        tipoBeneficio: n.tipoBeneficio,
        beneficiario: n.beneficiario,
        formaRecepcion: n.formaRecepcion
      };

      // 💰 Monto
      if (n.montoMensualAproximado) {
        base.montoMensualAproximado = {
          ...n.montoMensualAproximado,
          moneda: defaultValue(n.montoMensualAproximado.moneda, "MXN")
        };
      }


      // 🏭 Sector
      if (n.sector) {
        base.sector = n.sector;

      }

      return base;
    });
}

function fideicomisos(data) {
  if (!data?.length) return [];

  return data
    //.filter(n => n.tipoRelacion === "DECLARANTE")
    .map(n => {

      const base = {
        tipoOperacion: n.tipoOperacion ?? "AGREGAR",
        tipoRelacion: n.tipoRelacion,
        tipoFideicomiso: n.tipoFideicomiso,
        tipoParticipacion: n.tipoParticipacion,
        rfcFideicomiso: n.rfcFideicomiso,
        sector: n.sector,
        extranjero: defaultValue(n.extranjero, "MX")
      };

      if (n.fideicomitente) {
        base.fideicomitente = {
          tipoPersona: defaultValue(n.fideicomitente.tipoPersona),
          nombreRazonSocial: defaultValue(n.fideicomitente.nombreRazonSocial),
          rfc: defaultValue(n.fideicomitente.rfc)
        };
      }

      if (n.fiduciario) {
        base.fiduciario = {
          nombreRazonSocial: defaultValue(n.fiduciario.nombreRazonSocial),
          rfc: defaultValue(n.fiduciario.rfc)
        };
      }

      if (n.fideicomisario) {
        base.fideicomisario = {
          tipoPersona: defaultValue(n.fideicomisario.tipoPersona),
          nombreRazonSocial: defaultValue(n.fideicomisario.nombreRazonSocial),
          rfc: defaultValue(n.fideicomisario.rfc)
        };
      }

      return base;
    });
}

function domicilioDeclarante(data) {
  if (!data) return data;

  const tieneInfo = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some(
      (v) => v !== null && v !== undefined && v !== ''
    );
  };

  let domicilio = {};

  // Procesar domicilio México
  if (data.domicilioMexico && tieneInfo(data.domicilioMexico)) {
    const d = data.domicilioMexico;

    domicilio.domicilioMexico = {
      calle: defaultValue(d.calle),
      numeroExterior: defaultValue(d.numeroExterior),
      numeroInterior: d.numeroInterior === null ? '' : defaultValue(d.numeroInterior),
      coloniaLocalidad: defaultValue(d.coloniaLocalidad),
      municipioAlcaldia: d.municipioAlcaldia
        ? {
          clave: defaultValue(d.municipioAlcaldia.clave),
          valor: defaultValue(d.municipioAlcaldia.valor)
        }
        : undefined,
      entidadFederativa: d.entidadFederativa
        ? {
          clave: defaultValue(d.entidadFederativa.clave),
          valor: defaultValue(d.entidadFederativa.valor)
        }
        : undefined,
      codigoPostal: defaultValue(d.codigoPostal)
    };
  }

  // Procesar domicilio extranjero
  if (data.domicilioExtranjero && tieneInfo(data.domicilioExtranjero)) {
    const d = data.domicilioExtranjero;

    domicilio.domicilioExtranjero = {
      calle: defaultValue(d.calle),
      numeroExterior: defaultValue(d.numeroExterior),
      numeroInterior: d.numeroInterior === null ? '' : defaultValue(d.numeroInterior),
      ciudadLocalidad: defaultValue(d.ciudadLocalidad),
      estadoProvincia: defaultValue(d.estadoProvincia),
      codigoPostal: defaultValue(d.codigoPostal),
      pais: defaultValue(d.pais)
    };
  }

  return domicilio;
}

function datosDependientesEconomicos(data) {
  if (!data || data.ninguno === true) {
    return {
      ninguno: true,
      dependienteEconomico: []
    };
  }

  return {
    ninguno: false,
    dependienteEconomico: data.dependienteEconomico.map(dep => {
      const item = {
        nombre: defaultValue(dep.nombre),
        primerApellido: defaultValue(dep.primerApellido),
        segundoApellido: defaultValue(dep.segundoApellido),
        fechaNacimiento: convertirFechaCorta(dep.fechaNacimiento),
        rfc: defaultValue(dep.rfc),
        extranjero: dep.extranjero || false,
        curp: defaultValue(dep.curp),
        habitaDomicilioDeclarante: dep.habitaDomicilioDeclarante || false
      };

      // Solo agregar si existe
      if (dep.parentescoRelacion) {
        item.parentescoRelacion = dep.parentescoRelacion;
      }

      if (dep.actividadLaboral) {
        item.actividadLaboral = dep.actividadLaboral;
      }

      return item;
    })
  };
}

const normalizePersonasFiltradas = (lista, allowFisica = false) => {
  if (!Array.isArray(lista)) return undefined;

  const filtrado = lista
    .map(p => {
      if (p?.tipoPersona === "MORAL") {
        return {
          tipoPersona: "MORAL",
          nombreRazonSocial: defaultValue(p.nombreRazonSocial),
          rfc: defaultValue(p.rfc),

          ...(p.relacion && {
            relacion: {
              clave: defaultValue(p.relacion.clave),
              valor: defaultValue(p.relacion.valor)
            }
          })
        };
      }

      if (allowFisica && p?.tipoPersona === "FISICA") {
        return {
          tipoPersona: "FISICA",
          nombreRazonSocial: defaultValue(p.nombreRazonSocial),
          rfc: defaultValue(p.rfc),

          ...(p.relacion && {
            relacion: {
              clave: defaultValue(p.relacion.clave),
              valor: defaultValue(p.relacion.valor)
            }
          })
        };
      }

      return null;
    })
    .filter(Boolean);

  return filtrado.length ? filtrado : undefined;
};

module.exports = {
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
}

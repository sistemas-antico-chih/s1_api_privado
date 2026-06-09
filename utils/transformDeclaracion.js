const { completarCamposFaltantes } = require('../utils/normalizadores');
'use strict';

var _ = require('underscore');

const tipoMap = {
    INICIAL: 'INICIAL',
    MODIFICACION: 'MODIFICACION',
    CONCLUSION: 'CONCLUSION',
};

const {
    convertirFechaLarga,
    datosGenerales,
    domicilioDeclarante,
    datosCurricularesDeclarante,
    datosEmpleoCargoComision,
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

function transformDeclaracion(row, options = {}) {
    const { publico = false } = options;
    try {
        let obj = row;

        // ✅ 🔴 FIX CRÍTICO: convertir a objeto plano (evita timeout)
        if (obj && typeof obj.toObject === 'function') {
            obj = obj.toObject({ getters: false, virtuals: false });
        }

        let fechaLarga = convertirFechaLarga(obj.updatedAt);

        let rowExtend = {
            id: obj._id ? String(obj._id) : obj.id,

            datosGenerales: obj.datosGenerales,
            domicilioDeclarante: obj.domicilioDeclarante,
            datosCurricularesDeclarante: obj.datosCurricularesDeclarante,
            datosEmpleoCargoComision: obj.datosEmpleoCargoComision,
            experienciaLaboral: obj.experienciaLaboral,
            ingresos: obj.ingresos,
            actividadAnualAnterior: obj.actividadAnualAnterior,
            datosPareja: obj.datosPareja,
            datosDependientesEconomicos: obj.datosDependientesEconomicos,
            bienesInmuebles: obj.bienesInmuebles,
            vehiculos: obj.vehiculos,
            bienesMuebles: obj.bienesMuebles,
            adeudosPasivos: obj.adeudosPasivos,
            inversionesCuentasValores: obj.inversionesCuentasValores,
            prestamoComodato: obj.prestamoComodato,
            participacion: obj.participacion,
            participacionTomaDecisiones: obj.participacionTomaDecisiones,
            apoyos: obj.apoyos,
            representaciones: obj.representaciones,
            clientesPrincipales: obj.clientesPrincipales,
            beneficiosPrivados: obj.beneficiosPrivados,
            fideicomisos: obj.fideicomisos,
            tipoDeclaracion: obj.tipoDeclaracion,
            declaracionCompleta: obj.declaracionCompleta
        };

        const tiposValidos = ['INICIAL', 'MODIFICACION', 'CONCLUSION'];

        let tipo = tiposValidos.includes(obj.tipoDeclaracion)
            ? obj.tipoDeclaracion
            : 'INICIAL';

        let institucion = obj?.datosEmpleoCargoComision?.nombreEntePublico;

        rowExtend.metadata = {
            declaracionCompleta: rowExtend.declaracionCompleta,
            tipo,
            actualizacion: fechaLarga,
            institucion,
            actualizacionConflictoInteres: false
        };

        // 🔴 BLINDAJE: asegurar que tipo siempre sea string
        if (typeof rowExtend.metadata.tipo === 'object') {
            rowExtend.metadata.tipo = 'INICIAL';
        }

        rowExtend.datosGenerales =
            datosGenerales(rowExtend.datosGenerales);

        rowExtend.domicilioDeclarante =
            domicilioDeclarante(obj.domicilioDeclarante);

        rowExtend.datosCurricularesDeclarante =
            datosCurricularesDeclarante(rowExtend.datosCurricularesDeclarante);

        rowExtend.datosEmpleoCargoComision =
            datosEmpleoCargoComision(rowExtend.datosEmpleoCargoComision);

        rowExtend.experienciaLaboral =
            experienciaLaboral(rowExtend.experienciaLaboral);

        rowExtend.ingresos =
            ingresos(rowExtend.ingresos, obj.tipoDeclaracion);

        rowExtend.actividadAnualAnterior =
            actividadAnualAnterior(rowExtend.actividadAnualAnterior);

        rowExtend.datosPareja =
            datosPareja(rowExtend.datosPareja);

        rowExtend.datosDependientesEconomicos =
            datosDependientesEconomicos(obj.datosDependientesEconomicos);

        // ===== BIENES =====

        const inmueblesRaw = rowExtend.bienesInmuebles?.bienInmueble || [];
        const bienInmueble = inmueblesRaw.length
            ? bienesInmuebles(inmueblesRaw).map(sanitizeBienInmueble)
            : [];
        const ningunoInmueble = bienInmueble.length === 0;

        const vehiculosRaw = Array.isArray(rowExtend.vehiculos?.vehiculo)
            ? rowExtend.vehiculos.vehiculo
            : [];
        const vehiculo = vehiculosRaw.length ? ensureTipoOperacion(vehiculos(vehiculosRaw)) : [];
        const ningunoVehiculo = vehiculo.length === 0;

        const bienesMueblesRaw = rowExtend.bienesMuebles?.bienMueble || [];
        const bienMueble = bienesMueblesRaw.length ? ensureTipoOperacion(bienesMuebles(bienesMueblesRaw)) : [];
        const ningunoBienMueble = bienMueble.length === 0;

        const inversionesRaw = rowExtend.inversionesCuentasValores?.inversion || [];
        const inversion = inversionesRaw.length ? ensureTipoOperacion(inversionesCuentasValores(inversionesRaw)) : [];
        const ningunoInversion = inversion.length === 0;

        const adeudosRaw = rowExtend.adeudosPasivos?.adeudo || [];
        const adeudo = adeudosRaw.length ? ensureTipoOperacion(adeudosPasivos(adeudosRaw)) : [];
        const ningunoAdeudo = adeudo.length === 0;

        const prestamoRaw = rowExtend.prestamoComodato?.prestamo || [];
        const prestamo = prestamoRaw.length ? ensureTipoOperacion(prestamoComodato(prestamoRaw)) : [];
        const ningunoPrestamo = prestamo.length === 0;

        const participacionRaw = rowExtend.participacion?.participacion || [];
        const participacionData = participacionRaw.length ? ensureTipoOperacion(participacion(participacionRaw)) : [];
        const ningunoParticipacion = participacionData.length === 0;

        const tomaDecisionesRaw = rowExtend.participacionTomaDecisiones?.participacion || [];

        const participacionTomaDecisiones = tomaDecisionesRaw.length
            ? ensureTipoOperacion(tomaDecisiones(tomaDecisionesRaw))
            : [];

        const ningunoTomaDecisiones = participacionTomaDecisiones.length === 0;

        let anioEjercicio = obj.anioEjercicio || obj?.metadata?.anioEjercicio || null;

        const incluirActividadAnual = obj.tipoDeclaracion !== 'MODIFICACION';

        rowExtend.apoyos = apoyos(rowExtend.apoyos?.apoyo);
        rowExtend.representaciones = representaciones(rowExtend.representaciones?.representacion);
        rowExtend.clientesPrincipales = clientesPrincipales(rowExtend.clientesPrincipales?.cliente);
        rowExtend.beneficiosPrivados = beneficiosPrivados(rowExtend.beneficiosPrivados?.beneficio);
        rowExtend.fideicomisos = fideicomisos(rowExtend.fideicomisos?.fideicomiso);

        const response = {
            id: rowExtend.id,
            anioEjercicio, // 👈 AGREGAR AQUÍ

            metadata: rowExtend.metadata,

            declaracion: {
                situacionPatrimonial: {
                    datosGenerales: rowExtend.datosGenerales,
                    datosCurricularesDeclarante: rowExtend.datosCurricularesDeclarante,
                    datosEmpleoCargoComision: rowExtend.datosEmpleoCargoComision,
                    /*
                    datosDependientesEconomicos:
                        rowExtend.datosDependientesEconomicos || { ninguno: true, dependienteEconomico: [] },
                    */
                    experienciaLaboral: rowExtend.experienciaLaboral || { ninguno: true, experiencia: [] },
                    //datosPareja: rowExtend.datosPareja,
                    //domicilioDeclarante: rowExtend.domicilioDeclarante,

                    ingresos: rowExtend.ingresos,
                    ...(incluirActividadAnual && {
                        actividadAnualAnterior: rowExtend.actividadAnualAnterior || { ninguno: true }
                    }),
                    bienesInmuebles: {
                        ninguno: ningunoInmueble,
                        bienInmueble
                    },
                    vehiculos: {
                        ninguno: ningunoVehiculo,
                        vehiculo
                    },
                    bienesMuebles: {
                        ninguno: ningunoBienMueble,
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

                interes: {
                    actualizacionConflictoInteres: false,

                    participacion: {
                        ninguno: ningunoParticipacion,
                        participacion: participacionData
                    },

                    participacionTomaDecisiones: {
                        ninguno: ningunoTomaDecisiones,
                        participacion: participacionTomaDecisiones
                    },

                    apoyos: setNingunoWithTipo(rowExtend.apoyos, 'apoyo'),
                    representacion: setNingunoWithTipo(rowExtend.representaciones, 'representacion'),
                    clientesPrincipales: setNingunoWithTipo(rowExtend.clientesPrincipales, 'cliente'),
                    beneficiosPrivados: setNingunoWithTipo(rowExtend.beneficiosPrivados, 'beneficio'),
                    fideicomisos: setNingunoWithTipo(rowExtend.fideicomisos, 'fideicomiso')
                }
            }
        };

        //console.log('✅ response listo');
        //console.log('anioEjercicio:', obj.anioEjercicio);
        //console.log('experiencia original:', obj.experienciaLaboral);
        //console.log('experiencia transformada:', rowExtend.experienciaLaboral);
        let finalResponse = response;

        console.log('publico =', publico);

        if (publico) {
            console.log('ENTRO A buildPublicVersion');
            finalResponse = buildPublicVersion(response);
        }

        // 👇 APLICAR NORMALIZADOR AQUÍ
        finalResponse = completarCamposFaltantes(finalResponse);

        // 👇 NORMALIZAR tipoPersona sobre el MISMO objeto
        finalResponse = normalizarTipoPersona(finalResponse);

        // 🔥 LIMPIAR OBJECTIDs
        finalResponse = removeIds(finalResponse);

        function limpiarIngresosPareja(obj) {
            if (obj?.declaracion?.situacionPatrimonial?.ingresos) {
                delete obj.declaracion.situacionPatrimonial.ingresos.ingresoMensualNetoParejaDependiente;
            }
            return obj;
        }
        
        finalResponse = limpiarIngresosPareja(finalResponse);

        return finalResponse;

    } catch (e) {
        console.log(e);
        return {};
    }
}

function normalizarTipoPersona(obj, seen = new WeakSet()) {
    if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return obj;
        seen.add(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => normalizarTipoPersona(item, seen));
    }

    if (obj !== null && typeof obj === 'object') {
        const nuevo = {};

        for (const key in obj) {
            let value = normalizarTipoPersona(obj[key], seen);

            if (key === 'tipoPersona') {
                if (value === null) {
                    value = 'FISICA';
                }
            }

            nuevo[key] = value;
        }

        return nuevo;
    }

    return obj;
}

function removeIds(obj, seen = new WeakSet(), depth = 0) {
    if (depth > 40) return obj;

    if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return obj;
        seen.add(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => removeIds(item, seen, depth + 1));
    }

    if (obj !== null && typeof obj === 'object') {
        const newObj = {};

        Object.keys(obj).forEach(key => {
            if (key !== '_id') {
                let value = obj[key];

                if (key === 'numeroInterior' && value == null) {
                    value = '';
                }

                newObj[key] = removeIds(value, seen, depth + 1);
            }
        });

        return newObj;
    }

    return obj;
}

function normalizeDefaults(obj, seen = new WeakSet(), depth = 0) {
    if (depth > 40) return obj;

    if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return obj;
        seen.add(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => normalizeDefaults(item, seen, depth + 1));
    }

    if (obj !== null && typeof obj === 'object') {
        const newObj = {};

        Object.keys(obj).forEach(key => {
            let value = obj[key];

            if (value === null) {
                value = '';
            }

            if (key === 'moneda' && value == null) {
                value = 'MXN';
            }

            if (key === 'pais' && value == null) {
                value = 'MX';
            }

            newObj[key] = normalizeDefaults(value, seen, depth + 1);
        });


        return newObj;
    }

    return obj;
}

function pick(obj, keys) {
    if (!obj) return obj;

    const result = {};
    keys.forEach(k => {
        if (obj[k] !== undefined) {
            result[k] = obj[k];
        }
    });

    return result;
}

function sanitizeBienInmueble(item) {
    const base = pick(item, [
        'tipoOperacion',
        'tipoInmueble',
        'titular',
        'porcentajePropiedad',
        'superficieTerreno',
        'superficieConstruccion',
        'transmisor',
        'formaAdquisicion',
        'formaPago',
        'valorAdquisicion',
        'fechaAdquisicion',
        'valorConformeA',
        //'tercero',
        'datoIdentificacion'
    ]);

    if (item.tercero) {
        base.tercero = item.tercero;
    }

    // ✅ domicilio México (con filtro de campos)
    if (item.domicilioMexico) {
        base.domicilioMexico = sanitizeDomicilioMexico(item.domicilioMexico);
    }

    // ✅ domicilio extranjero (si aplica)
    if (item.domicilioExtranjero) {
        base.domicilioExtranjero = sanitizeDomicilioExtranjero(item.domicilioExtranjero);
    }

    // ✅ tipoOperacion (si decides incluirlo a nivel raíz)
    base.tipoOperacion = item.tipoOperacion || 'AGREGAR';

    if (Array.isArray(base.tercero)) {
        base.tercero = base.tercero.filter(t =>
            t &&
            t.tipoPersona === "MORAL" &&
            (t.nombreRazonSocial || t.rfc)
        );

        if (base.tercero.length === 0) {
            delete base.tercero;
        }
    }
    console.log('TERCERO FINAL:', JSON.stringify(base.tercero, null, 2));
    return base;
}

function sanitizeDomicilioMexico(dom) {
    if (!dom) return dom;

    return {
        calle: dom.calle || '',
        numeroExterior: dom.numeroExterior || '',
        numeroInterior: dom.numeroInterior || '',
        coloniaLocalidad: dom.coloniaLocalidad || '',
        municipioAlcaldia: dom.municipioAlcaldia,
        entidadFederativa: dom.entidadFederativa,
        codigoPostal: dom.codigoPostal || ''
    };
}

function sanitizeDomicilioExtranjero(dom) {
    if (!dom) return dom;

    return {
        calle: dom.calle || '',
        numeroExterior: dom.numeroExterior || '',
        numeroInterior: dom.numeroInterior || '',
        ciudadLocalidad: dom.ciudadLocalidad || '',
        estadoProvincia: dom.estadoProvincia || '',
        pais: dom.pais || 'MX',
        codigoPostal: dom.codigoPostal || ''
    };
}

function ensureTipoOperacion(arr = []) {
    return arr.map(item => {
        if (!item || typeof item !== 'object') return item;

        return {
            ...item,
            tipoOperacion: item.tipoOperacion || 'AGREGAR'
        };
    });
}

function setNingunoWithTipo(data, key) {
    if (!data) {
        return { ninguno: true, [key]: [] };
    }

    // 🔴 Si ya es array (tu caso actual)
    if (Array.isArray(data)) {
        const arr = ensureTipoOperacion(data);
        return {
            ninguno: arr.length === 0,
            [key]: arr
        };
    }

    // 🔵 Si viene como objeto (compatibilidad)
    const arr = ensureTipoOperacion(data[key] || []);

    return {
        ninguno: arr.length === 0,
        [key]: arr
    };
}

function buildPublicVersion(data) {

    if (!data) return data;

    // 🔴 CLON para no mutar original
    const obj = JSON.parse(JSON.stringify(data));

    // =========================
    // 🧍 DATOS GENERALES (recorte)
    // =========================
    if (obj.declaracion?.situacionPatrimonial?.datosGenerales) {
        obj.declaracion.situacionPatrimonial.datosGenerales = {
            nombre: obj.declaracion.situacionPatrimonial.datosGenerales.nombre,
            primerApellido: obj.declaracion.situacionPatrimonial.datosGenerales.primerApellido,
            segundoApellido: obj.declaracion.situacionPatrimonial.datosGenerales.segundoApellido
        };
    }

    // =========================
    // 💰 INGRESOS (ejemplo: ocultar detalle)
    // =========================
    if (obj.declaracion?.situacionPatrimonial?.ingresos) {

        const ingresos =
            obj.declaracion.situacionPatrimonial.ingresos;

        delete ingresos.remuneracionMensualCargoPublico;
        delete ingresos.remuneracionAnualCargoPublico;
        delete ingresos.remuneracionConclusionCargoPublico;

        delete ingresos.ingresoMensualNetoParejaDependiente;
        delete ingresos.ingresoAnualNetoParejaDependiente;
        delete ingresos.ingresoConclusionNetoParejaDependiente;
    }

    // =========================
    // 🏠 BIENES (ejemplo: quitar valores)
    // =========================
    if (obj.declaracion?.situacionPatrimonial?.bienesInmuebles?.bienInmueble) {
        obj.declaracion.situacionPatrimonial.bienesInmuebles.bienInmueble =
            obj.declaracion.situacionPatrimonial.bienesInmuebles.bienInmueble.map(b => {
                //delete b.valorAdquisicion;
                return b;
            });
    }

    console.log(
        'INGRESOS DESPUES:',
        JSON.stringify(
            obj.declaracion?.situacionPatrimonial?.ingresos,
            null,
            2
        )
    );

    return obj;
}

function cleanLite(obj, depth = 0) {
    if (depth > 10) return obj; // 🔴 límite para evitar loops costosos

    if (Array.isArray(obj)) {
        return obj.map(item => cleanLite(item, depth + 1));
    }

    if (obj && typeof obj === 'object') {
        const newObj = {};

        for (const key in obj) {
            if (key === '_id') continue;

            let value = obj[key];

            if (value === null) value = '';
            if (key === 'moneda' && !value) value = 'MXN';
            if (key === 'pais' && !value) value = 'MX';

            newObj[key] = cleanLite(value, depth + 1);
        }

        return newObj;
    }

    return obj;
}

module.exports = transformDeclaracion;

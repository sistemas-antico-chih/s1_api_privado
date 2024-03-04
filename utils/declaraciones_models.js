const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const declaracionesSchema = new Schema({
    declaracionCompleta: Boolean,
    firmada: Boolean,
    tipoDeclaracion: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
    updatedAt: Date,
    anioEjercicio: Number,
    datosGenerales: {
        nombres: String,
        primerApellido: String,
        segundoApellido: String,
        curp: String,
        rfc: {
            rfc: String,
            homoclave: String
        },
        correoElectronico: {
            institucional: String,
            personal: String
        },
        telefono: {
            casa: String,
            celularPersonal: String
        },
        situacionPersonalEstadoCivil: {
            clave: String,
            valor: String
        },
        paisNacimiento: String,
        nacionalidad: String,
        aclaracionesObservaciones: String
    },
    domicilioDeclarante: {
        domicilioMexico: {
            calle: String,
            numeroExterior: String,
            numeroInterior: String,
            coloniaLocalidad: String,
            municipioAlcaldia: { clave: String, valor: String },
            entidadFederativa: { clave: String, valor: String },
            codigoPostal: String
        },
        domicilioExtranjero: {
            calle: String,
            numeroExterior: String,
            numeroInterior: String,
            ciudadLocalidad: String,
            estadoProvincia: String,
            pais: String,
            codigoPostal: String
        },
        aclaracionesObservaciones: String
    },
    datosCurricularesDeclarante: {
        escolaridad: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    datosEmpleoCargoComision: {
        tipoOperacion: String,
        nivelOrdenGobierno: String,
        ambitoPublico: String,
        nombreEntePublico: String,
        areaAdscripcion: String,
        empleoCargoComision: String,
        contratadoPorHonorarios: Boolean,
        nivelEmpleoCargoComision: String,
        funcionPrincipal: String,
        fechaTomaPosesion: Date,
        telefonoOficina: {
            telefono: String,
            extension: String
        },
        domicilioMexico: {
            calle: String,
            numeroExterior: String,
            numeroInterior: String,
            coloniaLocalidad: String,
            municipioAlcaldia: { clave: String, valor: String },
            entidadFederativa: { clave: String, valor: String },
            codigoPostal: String
        },
        domicilioExtranjero: {
            calle: String,
            numeroExterior: String,
            numeroInterior: String,
            ciudadLocalidad: String,
            estadoProvincia: String,
            pais: String,
            codigoPostal: String
        },
        aclaracionesObservaciones: String
    },
    experienciaLaboral: {
        ninguno: Boolean,
        experiencia: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    datosPareja: {
        ninguno: Boolean,
        tipoOperacion: String,
        nombre: String,
        primerApellido: String,
        segundoApellido: String,
        fechaNacimiento: Date,
        rfc: String,
        relacionConDeclarante: String,
        ciudadanoExtranjero: Boolean,
        curp: String,
        esDependienteEconomico: Boolean,
        habitaDomiclioDeclarante: Boolean,
        lugarDondeReside: String,
        domicilioMexico: {
            calle: String,
            numeroExterior: String,
            numeroInterior: String,
            coloniaLocalidad: String,
            municipioAlcaldia: { clave: String, valor: String },
            entidadFederativa: { clave: String, valor: String },
            codigoPostal: String
        },
        domicilioExtranjero: {
            calle: String,
            numeroExterior: String,
            numeroInterior: String,
            ciudadLocalidad: String,
            estadoProvincia: String,
            pais: String,
            codigoPostal: String
        },
        actividadLaboral: {clave: String, valor: String},
        actividadLaboralSectorPublico: {
            nivelOrdenGobierno: String,
            ambitoPublico: String,
            nombreEntePublico: String,
            areaAdscripcion: String,
            empleoCargoComision: String,
            funcionPrincipal: String,
            salarioMensualNeto:{valor: Number, moneda: String},
            fechaIngreso: Date
        },
        actividadLaboralSectorPrivadoOtro: {
            nombreEmpresaSociedadAsociacion: String,
            empleoCargoComision: String,
            rfc: String,
            fechaIngreso: Date,
            sector:{clave: String, valor: String},
            salarioMensualNeto:{valor: Number, moneda: String},
            proveedorContratistaGobierno: Boolean
        },
        aclaracionesObservaciones: String
    },
    datosDependientesEconomicos: {
        ninguno: Boolean,
        dependienteEconomico: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    ingresos: {
        remuneracionMensualCargoPublico: {valor: Number, moneda: String},
        otrosIngresosMensualesTotal: {valor: Number, moneda: String},
        actividadIndustrialComercialEmpresarial: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            actividades: { type: [], default: void 0 },
        },
        actividadFinanciera: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            actividades: { type: [], default: void 0 },
        },
        serviciosProfesionales: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            servicios: { type: [], default: void 0 },
        },
        otrosIngresos: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            ingresos: { type: [], default: void 0 },
        },
        ingresoMensualNetoDeclarante: {valor: Number, moneda: String},
        ingresoMensualNetoParejaDependiente: {valor: Number, moneda: String},
        totalIngresosMensualNetos: {valor: Number, moneda: String},
        aclaracionesObservaciones: String
    },
    actividadAnualAnterior: {
        servidorPublicoAnioAnterior: Boolean,
        fechaIngreso: Date,
        fechaConclusion: Date,
        remuneracionNetaCargoPublico: {valor: Number, moneda: String},
        otrosIngresosTotal: {valor: Number, moneda: String},
        actividadIndustrialComercialEmpresarial: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            actividades: { type: [], default: void 0 },
        },
        actividadFinanciera: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            actividades: { type: [], default: void 0 },
        },
        serviciosProfesionales: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            servicios: { type: [], default: void 0 },
        },
        enajenacionBienes: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            bienes: { type: [], default: void 0 },
        },
        otrosIngresos: {
            remuneracionTotal:{
                monto: {valor: Number, moneda: String},
            },
            ingresos: { type: [], default: void 0 },
        },
        ingresoNetoAnualDeclarante: {valor: Number, moneda: String},
        ingresoNetoAnualParejaDependiente: {valor: Number, moneda: String},
        totalIngresosNetosAnuales: {valor: Number, moneda: String},
        aclaracionesObservaciones: String
    },
    bienesInmuebles: {
        ninguno: Boolean,
        bienInmueble: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    vehiculos: {
        ninguno: Boolean,
        vehiculo: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    bienesMuebles: {
        ninguno: Boolean,
        bienMueble: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    inversionesCuentasValores: {
        ninguno: Boolean,
        inversion: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    adeudosPasivos: {
        ninguno: Boolean,
        adeudo: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    prestamoComodato: {
        ninguno: Boolean,
        prestamo: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    participacion: {
        ninguno: Boolean,
        participacion: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    participacionTomaDecisiones: {
        ninguno: Boolean,
        participacion: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    apoyos: {
        ninguno: Boolean,
        apoyo: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    representaciones: {
        ninguno: Boolean,
        representacion: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    clientesPrincipales: {
        ninguno: Boolean,
        cliente: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    beneficiosPrivados: {
        ninguno: Boolean,
        beneficio: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    },
    fideicomisos: {
        ninguno: Boolean,
        fideicomiso: { type: [], default: void 0 },
        aclaracionesObservaciones: String
    }
}, { collation: { locale: 'es', strength: 4 } });

const userSchema = new Schema({
    roles: { type: [], default: void 0 },
    declaraciones: { type: [], default: void 0 },
    username: String,
    password: String,
    nombre: String,
    primerApellido: String,
    segundoApellido: String,
    curp: String,
    rfc: String,
    createdAt: Date,
    updatedAt: Date
})

declaracionesSchema.plugin(mongoosePaginate);

//Para este manual se está apuntando a la coleccion 'declaraciones' de la base de datos 'declaraciones'
//el usuario puede cambiar el nombre de la coleccion o de la base de datos.
//model('base de datos', esquema, 'coleccion')
let Declaraciones = model('declaraciones', declaracionesSchema, 'declaraciones');
let User = model('user', userSchema,'user');

module.exports = {
    declaracionesSchema,
    Declaraciones,
    userSchema,
    User
};

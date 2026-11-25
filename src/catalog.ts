export const modules = [
  {
    "route": "Appointments",
    "title": "Citas",
    "group": "Agenda",
    "id": "appointmentId",
    "columns": "startDateTime patientId doctorId status",
    "create": "patientId doctorId startDateTime endDateTime reason?",
    "update": "patientId doctorId startDateTime endDateTime status reason?",
    "remove": true
  },
  {
    "route": "Schedules",
    "title": "Horarios",
    "group": "Agenda",
    "id": "scheduleId",
    "columns": "doctorId dayOfWeek startTime endTime slotDurationMinutes",
    "create": "doctorId dayOfWeek startTime endTime slotDurationMinutes",
    "update": "doctorId dayOfWeek startTime endTime slotDurationMinutes isActive",
    "remove": true
  },
  {
    "route": "Patients",
    "title": "Pacientes",
    "group": "Atención clínica",
    "id": "patientId",
    "columns": "firstName lastName documentNumber phone",
    "create": "documentType documentNumber firstName lastName birthDate gender phone email? address?",
    "update": "documentType documentNumber firstName lastName birthDate gender phone email? address?",
    "remove": true
  },
  {
    "route": "MedicalRecords",
    "title": "Historias clínicas",
    "group": "Atención clínica",
    "id": "medicalRecordId",
    "columns": "medicalRecordId patientId bloodType createdAt",
    "create": "patientId bloodType? allergies? medicalHistory? observations?",
    "update": "bloodType? allergies? medicalHistory? observations?",
    "remove": true
  },
  {
    "route": "Diagnoses",
    "title": "Diagnósticos",
    "group": "Atención clínica",
    "id": "diagnosisId",
    "columns": "description medicalRecordId doctorId diagnosisDate",
    "create": "medicalRecordId appointmentId doctorId description icdCode? observations?",
    "update": "description icdCode? observations?",
    "remove": true
  },
  {
    "route": "Prescriptions",
    "title": "Recetas",
    "group": "Atención clínica",
    "id": "prescriptionId",
    "columns": "prescriptionId diagnosisId issuedAt isActive",
    "create": "diagnosisId generalInstructions?",
    "update": "generalInstructions? isActive",
    "remove": true
  },
  {
    "route": "PrescriptionDetails",
    "title": "Detalles de receta",
    "group": "Atención clínica",
    "id": "prescriptionDetailId",
    "columns": "prescriptionId medicationId dosage frequency",
    "create": "prescriptionId medicationId dosage frequency durationDays quantity instructions?",
    "update": "medicationId dosage frequency durationDays quantity instructions?",
    "remove": true
  },
  {
    "route": "Medications",
    "title": "Medicamentos",
    "group": "Atención clínica",
    "id": "medicationId",
    "columns": "name presentation concentration isActive",
    "create": "name description? presentation? concentration?",
    "update": "name description? presentation? concentration? isActive",
    "remove": true
  },
  {
    "route": "Doctors",
    "title": "Médicos",
    "group": "Equipo y espacios",
    "id": "doctorId",
    "columns": "firstName lastName specialtyId licenseNumber",
    "create": "specialtyId firstName lastName licenseNumber phone email",
    "update": "specialtyId firstName lastName licenseNumber phone email",
    "remove": true
  },
  {
    "route": "Specialties",
    "title": "Especialidades",
    "group": "Equipo y espacios",
    "id": "specialtyId",
    "columns": "name description isActive",
    "create": "name description?",
    "update": "name description?",
    "remove": true
  },
  {
    "route": "Rooms",
    "title": "Consultorios",
    "group": "Equipo y espacios",
    "id": "roomId",
    "columns": "roomNumber floor description isActive",
    "create": "roomNumber description? floor?",
    "update": "roomNumber description? floor?",
    "remove": true
  },
  {
    "route": "DoctorRooms",
    "title": "Asignaciones",
    "group": "Equipo y espacios",
    "id": "doctorRoomId",
    "columns": "doctorId roomId assignedAt isActive",
    "create": "doctorId roomId",
    "update": "doctorId roomId isActive",
    "remove": true
  },
  {
    "route": "Payments",
    "title": "Pagos",
    "group": "Administración",
    "id": "paymentId",
    "columns": "paymentId appointmentId amount status",
    "create": "appointmentId amount paymentMethod transactionReference?",
    "update": "",
    "remove": false
  },
  {
    "route": "Invoices",
    "title": "Facturas",
    "group": "Administración",
    "id": "invoiceId",
    "columns": "invoiceNumber customerName issuedAt totalAmount",
    "create": "paymentId invoiceNumber invoiceType customerName? customerDocument?",
    "update": "",
    "remove": false
  },
  {
    "route": "Notifications",
    "title": "Notificaciones",
    "group": "Administración",
    "id": "notificationId",
    "columns": "title patientId type isRead",
    "create": "patientId appointmentId? title message type",
    "update": "title message type",
    "remove": true
  },
  {
    "route": "Users",
    "title": "Usuarios",
    "group": "Administración",
    "id": "userId",
    "columns": "username email roles isActive",
    "create": "username email password",
    "update": "username email",
    "remove": false
  },
  {
    "route": "Roles",
    "title": "Roles",
    "group": "Administración",
    "id": "roleId",
    "columns": "name description",
    "create": "name description?",
    "update": "name description?",
    "remove": false
  }
]
export type Module = typeof modules[number]
export type Row = Record<string, string | number | boolean | null | number[] | string[]>
export const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
export const labels: Record<string,string> = {
 patientId:'Paciente', doctorId:'Médico', appointmentId:'Cita', scheduleId:'Horario', specialtyId:'Especialidad', roomId:'Consultorio', roomIds:'Consultorios', doctorRoomId:'Asignación', medicalRecordId:'Historia clínica', diagnosisId:'Diagnóstico', medicationId:'Medicamento', prescriptionId:'Receta', prescriptionDetailId:'Detalle', userId:'Usuario', roleId:'Rol', invoiceId:'Factura', paymentId:'Pago', notificationId:'Notificación',
 firstName:'Nombres', lastName:'Apellidos', name:'Nombre', documentType:'Tipo de documento', documentNumber:'N.º de documento', birthDate:'Fecha de nacimiento', gender:'Género', phone:'Teléfono', email:'Correo electrónico', address:'Dirección', licenseNumber:'Colegiatura', isActive:'Activo', createdAt:'Fecha de registro', updatedAt:'Actualización', description:'Descripción', roomNumber:'N.º de consultorio', floor:'Piso', assignedAt:'Fecha de asignación', dayOfWeek:'Día', startTime:'Hora inicial (UTC)', endTime:'Hora final (UTC)', slotDurationMinutes:'Duración (min)', startDateTime:'Inicio (UTC)', endDateTime:'Fin (UTC)', status:'Estado', reason:'Motivo', bloodType:'Grupo sanguíneo', allergies:'Alergias', medicalHistory:'Antecedentes', observations:'Observaciones', icdCode:'Código CIE', diagnosisDate:'Fecha de diagnóstico', issuedAt:'Emisión', generalInstructions:'Indicaciones generales', presentation:'Presentación', concentration:'Concentración', dosage:'Dosis', frequency:'Frecuencia', durationDays:'Duración (días)', quantity:'Cantidad', instructions:'Indicaciones', invoiceNumber:'N.º de factura', invoiceType:'Tipo de comprobante', customerName:'Cliente', customerDocument:'Documento del cliente', totalAmount:'Importe total', amount:'Importe', paymentMethod:'Medio de pago', transactionReference:'Referencia', paymentDate:'Fecha de pago', title:'Título', message:'Mensaje', type:'Tipo', isRead:'Leída', readAt:'Fecha de lectura', username:'Usuario', password:'Contraseña', roles:'Roles', date:'Fecha (UTC)', usernameOrEmail:'Usuario o correo', currentPassword:'Contraseña actual', newPassword:'Nueva contraseña'
}
export const states:Record<string,string> = {Scheduled:'Programada',Confirmed:'Confirmada',Completed:'Completado',Cancelled:'Cancelada',Pending:'Pendiente',Failed:'Fallido'}
export function display(k:string,v:Row[string]):string {
 if(v==null || v==='') return '—'
 if(k==='dayOfWeek') return days[Number(v)] ?? String(v)
 if(typeof v==='boolean') return v?'Sí':'No'
 if(k==='status') return states[String(v)] ?? String(v)
 if(typeof v==='string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0,16).replace('T',' ')+' UTC'
 return Array.isArray(v)?v.join(', '):String(v)
}
export function caption(row:Row,id:string) {
 const title=[row.firstName,row.lastName].filter(Boolean).join(' ') || row.name || row.roomNumber || row.username || row.invoiceNumber || row.title || row.description || row.startDateTime
 return '#'+row[id]+(title?' · '+title:'')
}
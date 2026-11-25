import { useState, type FormEvent } from 'react'
import { useQuery } from './api'
import { modules, labels, days, states, caption, type Row } from './catalog'

// Convertir UTC a hora peruana para mostrar en el formulario
function toPeruDateTime(value: string): string {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    return new Date(date.getTime() - 5 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
}

// Convertir hora peruana a UTC para enviar al backend
function toUtcDateTime(value: string): string {
    return new Date(value + '-05:00').toISOString()
}

export function Field({
    name,
    required,
    value,
    onChange,
    locked = false,
    payment = false
}: {
    name: string
    required: boolean
    value: string
    onChange: (v: string) => void
    locked?: boolean
    payment?: boolean
}) {
    const ref = modules.find(m => m.id === name)
    const list = useQuery<Row[]>(ref?.route ?? null)

    const common = {
        value,
        required,
        disabled: locked,
        onChange: (e: { target: { value: string } }) =>
            onChange(e.target.value)
    }

    const options =
        name === 'dayOfWeek'
            ? days.map((d, i) => [String(i), d])
            : name === 'status'
                ? (
                    payment
                        ? ['Pending', 'Completed', 'Failed']
                        : ['Scheduled', 'Confirmed', 'Completed', 'Cancelled']
                ).map(s => [s, states[s]])
                : name === 'isActive'
                    ? [['true', 'Sí'], ['false', 'No']]
                    : undefined

    const type =
        name === 'password' || name.endsWith('Password')
            ? 'password'
            : name === 'email'
                ? 'email'
                : name === 'phone'
                    ? 'tel'
                    : name === 'birthDate' || name === 'date'
                        ? 'date'
                        : name.endsWith('DateTime')
                            ? 'datetime-local'
                            : name.endsWith('Time')
                                ? 'time'
                                : [
                                    'quantity',
                                    'durationDays',
                                    'slotDurationMinutes',
                                    'amount'
                                ].includes(name)
                                    ? 'number'
                                    : 'text'

    const multiline = [
        'allergies',
        'medicalHistory',
        'description',
        'observations',
        'message',
        'instructions',
        'generalInstructions',
        'reason'
    ].includes(name)

    const fieldLabel = name.endsWith('DateTime')
        ? (labels[name] ?? name).replace(/\s*\(UTC\)/gi, '') + ' (hora Perú)'
        : labels[name] ?? name

    return (
        <label className={multiline ? 'wide' : ''}>
            {fieldLabel}
            {required ? ' *' : ''}

            {ref ? (
                <>
                    <select {...common}>
                        <option value="">
                            {list.data ? 'Seleccionar…' : 'Cargando…'}
                        </option>

                        {value &&
                            !list.data?.some(r => String(r[name]) === value) && (
                                <option value={value}>#{value}</option>
                            )}

                        {list.data?.map(r => (
                            <option
                                key={String(r[name])}
                                value={String(r[name])}
                            >
                                {caption(r, name)}
                            </option>
                        ))}
                    </select>

                    {list.error && (
                        <small role="alert">{list.error}</small>
                    )}
                </>
            ) : options ? (
                <select {...common}>
                    <option value="">Seleccionar…</option>

                    {options.map(([v, l]) => (
                        <option key={v} value={v}>
                            {l}
                        </option>
                    ))}
                </select>
            ) : multiline ? (
                <textarea rows={3} {...common} />
            ) : (
                <input
                    type={type}
                    {...common}
                    min={
                        type === 'number'
                            ? name === 'amount' ? 0.01 : 1
                            : name === 'date'
                                ? toPeruDateTime(
                                    new Date().toISOString()
                                ).slice(0, 10)
                                : undefined
                    }
                    step={
                        name === 'amount'
                            ? '0.01'
                            : type === 'datetime-local'
                                ? 60
                                : type === 'time'
                                    ? 1
                                    : undefined
                    }
                    autoComplete={
                        type === 'password'
                            ? name === 'currentPassword'
                                ? 'current-password'
                                : 'new-password'
                            : undefined
                    }
                />
            )}
        </label>
    )
}

export function Form({
    fields,
    initial = {},
    save,
    onDone,
    submit = 'Guardar',
    locked = [],
    payment = false
}: {
    fields: string
    initial?: Row
    save: (body: Row) => Promise<unknown>
    onDone: () => void
    submit?: string
    locked?: string[]
    payment?: boolean
}) {
    const names = fields.split(' ').filter(Boolean)

    const [values, set] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            names.map(field => {
                const k = field.replace('?', '')

                let v = String(
                    initial[k] ?? (k === 'type' ? 'Reminder' : '')
                )

                // Mostrar fechas en hora peruana
                if (k.endsWith('DateTime') && v) {
                    v = toPeruDateTime(v)
                }

                return [k, v]
            })
        )
    )

    const [error, fail] = useState('')
    const [busy, wait] = useState(false)

    async function send(e: FormEvent) {
        e.preventDefault()

        if (busy) return

        wait(true)
        fail('')

        try {
            const body: Row = {}

            for (const field of names) {
                const k = field.replace('?', '')

                const v = k.toLowerCase().includes('password')
                    ? values[k]
                    : values[k].trim()

                if (!v && !field.endsWith('?')) {
                    throw Error(
                        'Completa el campo ' + (labels[k] ?? k) + '.'
                    )
                }

                body[k] = !v
                    ? null
                    : k === 'isActive'
                        ? v === 'true'
                        : k.endsWith('Id') ||
                            [
                                'dayOfWeek',
                                'slotDurationMinutes',
                                'durationDays',
                                'quantity',
                                'amount'
                            ].includes(k)
                            ? Number(v)
                            : k.endsWith('DateTime')
                                ? toUtcDateTime(v)
                                : k.endsWith('Time') && v.length === 5
                                    ? v + ':00'
                                    : v
            }

            // Validar horarios
            if (
                (
                    body.startTime &&
                    String(body.endTime) <= String(body.startTime)
                ) ||
                (
                    body.startDateTime &&
                    String(body.endDateTime) <= String(body.startDateTime)
                )
            ) {
                throw Error('El fin debe ser posterior al inicio.')
            }

            await save(body)
            onDone()

        } catch (e) {
            fail((e as Error).message)
        } finally {
            wait(false)
        }
    }

    return (
        <form onSubmit={send} className="form">
            <div className="fields">
                {names.map(s => {
                    const k = s.replace('?', '')

                    return (
                        <Field
                            key={k}
                            name={k}
                            required={!s.endsWith('?')}
                            value={values[k]}
                            onChange={v =>
                                set(prev => ({ ...prev, [k]: v }))
                            }
                            locked={locked.includes(k)}
                            payment={payment}
                        />
                    )
                })}
            </div>

            {error && (
                <p className="error" role="alert">
                    {error}
                </p>
            )}

            <button className="primary" disabled={busy}>
                {busy ? 'Procesando…' : submit}
            </button>
        </form>
    )
}
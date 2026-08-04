<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">

    <title>
        Comprobante de historial
        {{ $historial->folio ?: $historial->id }}
    </title>

    <style>
        @page {
            margin: 28px 32px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #1f2937;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.45;
        }

        .header {
            width: 100%;
            margin-bottom: 24px;
            border-bottom: 3px solid #0c25a3;
            padding-bottom: 14px;
        }

        .header-table,
        .info-table,
        .detail-table,
        .total-table {
            width: 100%;
            border-collapse: collapse;
        }

        .brand {
            color: #0c25a3;
            font-size: 19px;
            font-weight: bold;
        }

        .document-title {
            margin-top: 4px;
            color: #f58634;
            font-size: 14px;
            font-weight: bold;
        }

        .header-reference {
            text-align: right;
            vertical-align: top;
        }

        .reference-label,
        .label {
            color: #6b7280;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .reference-value {
            margin-top: 3px;
            color: #111827;
            font-size: 14px;
            font-weight: bold;
        }

        .section {
            margin-bottom: 18px;
        }

        .section-title {
            margin-bottom: 8px;
            border-left: 4px solid #f58634;
            padding: 5px 8px;
            background: #f8fafc;
            color: #0c25a3;
            font-size: 12px;
            font-weight: bold;
        }

        .info-table td {
            width: 50%;
            padding: 5px 8px;
            vertical-align: top;
        }

        .value {
            margin-top: 2px;
            color: #111827;
            font-size: 11px;
        }

        .detail-table th {
            border: 1px solid #d1d5db;
            padding: 8px;
            background: #0c25a3;
            color: #ffffff;
            font-size: 9px;
            text-align: left;
            text-transform: uppercase;
        }

        .detail-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            vertical-align: top;
        }

        .text-right {
            text-align: right;
        }

        .status {
            display: inline-block;
            border-radius: 10px;
            padding: 4px 9px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-pagado {
            background: #dcfce7;
            color: #166534;
        }

        .status-pendiente {
            background: #fef3c7;
            color: #92400e;
        }

        .status-cancelado {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-vencido {
            background: #ffedd5;
            color: #9a3412;
        }

        .status-reembolsado {
            background: #dbeafe;
            color: #1e40af;
        }

        .total-box {
            width: 42%;
            margin-left: auto;
            margin-top: 12px;
            border: 2px solid #0c25a3;
            padding: 12px;
        }

        .total-table td {
            padding: 4px 0;
        }

        .total-label {
            color: #6b7280;
            font-size: 10px;
        }

        .total-value {
            color: #0c25a3;
            font-size: 16px;
            font-weight: bold;
            text-align: right;
        }

        .observations {
            min-height: 56px;
            border: 1px solid #d1d5db;
            padding: 10px;
            background: #f9fafb;
            white-space: pre-line;
        }

        .footer {
            margin-top: 30px;
            border-top: 1px solid #d1d5db;
            padding-top: 10px;
            color: #6b7280;
            font-size: 8px;
            text-align: center;
        }
    </style>
</head>

<body>
    @php
        $cliente = $historial->cliente;
        $metodoPago = $historial->metodoPago;

        $nombreCliente = trim(
            (($cliente->name ?? '') . ' ' . ($cliente->apellidos ?? ''))
        );

        $statusClasses = [
            'pagado' => 'status-pagado',
            'pendiente' => 'status-pendiente',
            'cancelado' => 'status-cancelado',
            'vencido' => 'status-vencido',
            'reembolsado' => 'status-reembolsado',
        ];

        $statusClass = $statusClasses[$historial->status]
            ?? 'status-pendiente';

        $fechaOperacion = $historial->fecha_operacion
            ? $historial->fecha_operacion->format('d/m/Y H:i')
            : 'Sin fecha';

        $cantidad = number_format(
            (float) $historial->cantidad,
            2,
            '.',
            ','
        );

        $precioUnitario = number_format(
            (float) $historial->precio_unitario,
            2,
            '.',
            ','
        );

        $importe = number_format(
            (float) $historial->importe,
            2,
            '.',
            ','
        );
    @endphp

    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="brand">
                        Tecnologías Administrativas ELAD
                    </div>

                    <div class="document-title">
                        Comprobante de historial del cliente
                    </div>
                </td>

                <td class="header-reference">
                    <div class="reference-label">
                        Folio
                    </div>

                    <div class="reference-value">
                        {{ $historial->folio ?: 'H-' . $historial->id }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">
            Información del cliente
        </div>

        <table class="info-table">
            <tr>
                <td>
                    <div class="label">Cliente</div>
                    <div class="value">
                        {{ $nombreCliente !== '' ? $nombreCliente : 'Sin nombre' }}
                    </div>
                </td>

                <td>
                    <div class="label">Correo electrónico</div>
                    <div class="value">
                        {{ $cliente->email ?? 'No registrado' }}
                    </div>
                </td>
            </tr>

            <tr>
                <td>
                    <div class="label">Teléfono</div>
                    <div class="value">
                        {{ $cliente->phone ?? 'No registrado' }}
                    </div>
                </td>

                <td>
                    <div class="label">Fecha de operación</div>
                    <div class="value">
                        {{ $fechaOperacion }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">
            Detalle del movimiento
        </div>

        <table class="detail-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Concepto</th>
                    <th class="text-right">Cantidad</th>
                    <th class="text-right">Precio unitario</th>
                    <th class="text-right">Importe</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td>
                        {{ $historial->producto_nombre ?: 'Producto no disponible' }}
                    </td>

                    <td>
                        {{ $historial->concepto ?: 'Sin concepto adicional' }}
                    </td>

                    <td class="text-right">
                        {{ $cantidad }}
                    </td>

                    <td class="text-right">
                        ${{ $precioUnitario }} MXN
                    </td>

                    <td class="text-right">
                        ${{ $importe }} MXN
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="total-box">
            <table class="total-table">
                <tr>
                    <td class="total-label">
                        Importe total
                    </td>

                    <td class="total-value">
                        ${{ $importe }} MXN
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            Información del pago
        </div>

        <table class="info-table">
            <tr>
                <td>
                    <div class="label">Método de pago</div>
                    <div class="value">
                        {{ $metodoPago->nombre ?? 'No especificado' }}
                    </div>
                </td>

                <td>
                    <div class="label">Estatus</div>
                    <div class="value">
                        <span class="status {{ $statusClass }}">
                            {{ ucfirst($historial->status) }}
                        </span>
                    </div>
                </td>
            </tr>

            <tr>
                <td>
                    <div class="label">UUID fiscal</div>
                    <div class="value">
                        {{ $historial->uuid_fiscal ?: 'No registrado' }}
                    </div>
                </td>

                <td>
                    <div class="label">Identificador interno</div>
                    <div class="value">
                        {{ $historial->id }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">
            Observaciones
        </div>

        <div class="observations">
            {{ $historial->observaciones ?: 'Sin observaciones.' }}
        </div>
    </div>

    <div class="footer">
        Este documento es un comprobante administrativo generado con los datos
        del historial. No sustituye una factura fiscal CFDI.
    </div>
</body>
</html>
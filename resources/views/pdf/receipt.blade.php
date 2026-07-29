<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            color: #17131f;
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            line-height: 1.45;
            margin: 0;
        }

        .page {
            padding: 28px;
        }

        .header {
            border-bottom: 3px solid #3b2147;
            display: table;
            padding-bottom: 18px;
            width: 100%;
        }

        .logo-block,
        .receipt-meta {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }

        .logo {
            display: inline-block;
            height: 70px;
            vertical-align: middle;
            width: 130px;
        }

        .biz-info {
            display: inline-block;
            margin-left: 12px;
            vertical-align: middle;
            width: 230px;
        }

        .biz-name {
            color: #3b2147;
            font-size: 21px;
            font-weight: 800;
        }

        .biz-sub {
            color: #7f5f53;
            margin-top: 4px;
        }

        .receipt-meta {
            text-align: right;
        }

        .receipt-title {
            color: #e85d4f;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 1px;
        }

        .row {
            margin-top: 4px;
        }

        .label {
            color: #7f5f53;
            font-weight: 700;
        }

        .status-badge {
            background: #fff1ea;
            border-radius: 4px;
            color: #e85d4f;
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            margin-top: 8px;
            padding: 5px 10px;
        }

        .info-strip {
            display: table;
            margin-top: 20px;
            width: 100%;
        }

        .info-col {
            background: #fff7f2;
            border: 1px solid #ead9d1;
            display: table-cell;
            padding: 14px;
            vertical-align: top;
            width: 50%;
        }

        .info-col + .info-col {
            border-left: 0;
        }

        .info-heading {
            color: #3b2147;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
        }

        .info-line {
            margin-top: 6px;
        }

        .cust-name,
        .item-name {
            font-weight: 800;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        .items {
            margin-top: 22px;
        }

        .items th {
            background: #3b2147;
            color: #ffffff;
            font-size: 11px;
            padding: 9px;
            text-align: left;
        }

        .items td {
            border-bottom: 1px solid #ead9d1;
            padding: 10px 9px;
            vertical-align: top;
        }

        .item-sku {
            color: #7f5f53;
            font-size: 10px;
            margin-top: 3px;
        }

        .num {
            text-align: right;
        }

        .c-item {
            width: 44%;
        }

        .c-qty {
            width: 10%;
        }

        .c-price,
        .c-disc,
        .c-amt {
            width: 15%;
        }

        .totals {
            margin-left: auto;
            margin-top: 16px;
            width: 100%;
        }

        .totals td {
            padding: 7px 9px;
        }

        .totals .label {
            text-align: right;
        }

        .totals .val {
            text-align: right;
        }

        .discount .val {
            color: #e85d4f;
        }

        .grand td {
            background: #3b2147;
            color: #ffffff;
            font-size: 14px;
            font-weight: 800;
        }

        .payment-strip {
            background: #fff7f2;
            border: 1px solid #ead9d1;
            margin-top: 18px;
            padding: 12px 14px;
        }

        .pay-method {
            color: #3b2147;
            font-weight: 800;
            margin-left: 14px;
        }

        .pay-ref {
            color: #7f5f53;
            margin-left: 18px;
        }

        .footer {
            border-top: 1px solid #ead9d1;
            color: #7f5f53;
            margin-top: 26px;
            padding-top: 16px;
            text-align: center;
        }

        .thanks {
            color: #3b2147;
            font-size: 14px;
            font-weight: 800;
        }

        .fine-print {
            font-size: 10px;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="logo-block">
                <img class="logo" src="{{ public_path('logo.png') }}" alt="{{ $shop['name'] }}">
                <div class="biz-info">
                    <div class="biz-name">{{ $shop['name'] }}</div>
                    <div class="biz-sub">
                        {{ $shop['location'] }}<br>
                        {{ $shop['phone'] }}
                    </div>
                </div>
            </div>
            <div class="receipt-meta">
                <div class="receipt-title">RECEIPT</div>
                <div class="row"><span class="label">Receipt No:</span> {{ $receipt['number'] }}</div>
                <div class="row"><span class="label">Date:</span> {{ $receipt['date'] }}</div>
                <div class="status-badge">{{ strtoupper($receipt['status']) }}</div>
            </div>
        </div>

        <div class="info-strip">
            <div class="info-col">
                <div class="info-heading">Customer</div>
                <div class="info-line">
                    <span class="cust-name">{{ $customer['name'] }}</span><br>
                    {{ $customer['phone'] }}<br>
                    {{ $customer['email'] }}
                </div>
            </div>
            <div class="info-col">
                <div class="info-heading">Delivery Location</div>
                <div class="info-line">{!! nl2br(e($customer['delivery_address'])) !!}</div>
            </div>
        </div>

        <table class="items">
            <colgroup>
                <col class="c-item"><col class="c-qty"><col class="c-price"><col class="c-disc"><col class="c-amt">
            </colgroup>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="num">Qty</th>
                    <th class="num">Unit Price</th>
                    <th class="num">Discount</th>
                    <th class="num">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($items as $item)
                    <tr>
                        <td>
                            <div class="item-name">{{ $item['name'] }}</div>
                            <div class="item-sku">
                                SKU: {{ $item['sku'] }}
                                @if (! empty($item['size']))
                                    &nbsp;|&nbsp; Size: {{ $item['size'] }}
                                @endif
                                @if (! empty($item['color']))
                                    &nbsp;|&nbsp; Color: {{ $item['color'] }}
                                @endif
                            </div>
                        </td>
                        <td class="num">{{ $item['qty'] }}</td>
                        <td class="num">KES {{ number_format($item['unit_price'], 2) }}</td>
                        <td class="num">{{ $item['discount'] > 0 ? 'KES '.number_format($item['discount'], 2) : '-' }}</td>
                        <td class="num">KES {{ number_format($item['amount'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals">
            <colgroup>
                <col class="c-item"><col class="c-qty"><col class="c-price"><col class="c-disc"><col class="c-amt">
            </colgroup>
            <tr><td colspan="4" class="label">Subtotal</td><td class="val">KES {{ number_format($totals['subtotal'], 2) }}</td></tr>
            <tr class="discount"><td colspan="4" class="label">Discount</td><td class="val">- KES {{ number_format($totals['discount'], 2) }}</td></tr>
            <tr><td colspan="4" class="label">Delivery Fee</td><td class="val">KES {{ number_format($totals['delivery_fee'], 2) }}</td></tr>
            <tr class="grand"><td colspan="4" class="label">Total</td><td class="val">KES {{ number_format($totals['total'], 2) }}</td></tr>
        </table>

        <div class="payment-strip">
            <span class="info-heading">Payment Method</span>
            <span class="pay-method">{{ $payment['method'] }}</span>
            <span class="pay-ref">Ref: {{ $payment['reference'] }}</span>
        </div>

        <div class="footer">
            <div class="thanks">Thank you for shopping with {{ $shop['name'] }}!</div>
            <div class="fine-print">This is a system generated receipt and does not require a signature.</div>
        </div>
    </div>
</body>
</html>

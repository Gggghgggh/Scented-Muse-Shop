<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class LipanaService
{
    /**
     * @return array<string, mixed>
     *
     * @throws RequestException
     */
    public function initiateStkPush(float $amount, string $phone, string $orderNumber): array
    {
        $response = Http::withHeaders([
            'x-api-key' => $this->requiredConfig('secret_key'),
        ])
            ->acceptJson()
            ->asJson()
            ->post($this->baseUrl().'/transactions/push-stk', [
                'phone' => $this->normalizePhone($phone),
                'amount' => max(10, (int) ceil($amount)),
            ])
            ->throw()
            ->json();

        Log::info('Lipana STK push initiated', [
            'order_number' => $orderNumber,
            'transaction_id' => data_get($response, 'data.transactionId'),
            'checkout_request_id' => data_get($response, 'data.checkoutRequestID'),
            'status' => data_get($response, 'data.status'),
        ]);

        return $response;
    }

    public function verifyWebhook(Request $request): bool
    {
        $secret = config('services.lipana.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            return true;
        }

        $signature = $request->header('X-Lipana-Signature');

        if (! is_string($signature) || $signature === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $request->getContent(), $secret);

        return hash_equals($expected, $signature);
    }

    /**
     * @return array{transaction_id: string|null, checkout_request_id: string|null, receipt: string|null, amount: float|null, phone: string|null, status: string|null}
     */
    public function extractWebhookData(array $payload): array
    {
        $data = data_get($payload, 'data', []);

        return [
            'transaction_id' => $this->stringValue(data_get($data, 'transactionId', data_get($data, 'transaction_id'))),
            'checkout_request_id' => $this->stringValue(data_get($data, 'checkoutRequestID', data_get($data, 'checkout_request_id'))),
            'receipt' => $this->stringValue(data_get($data, 'mpesaReceiptNumber', data_get($data, 'receipt', data_get($data, 'receiptNumber')))),
            'amount' => is_numeric(data_get($data, 'amount')) ? (float) data_get($data, 'amount') : null,
            'phone' => $this->stringValue(data_get($data, 'phone')),
            'status' => $this->stringValue(data_get($data, 'status')),
        ];
    }

    private function baseUrl(): string
    {
        $baseUrl = config('services.lipana.base_url', 'https://api.lipana.dev/v1');

        if (! is_string($baseUrl) || $baseUrl === '') {
            return 'https://api.lipana.dev/v1';
        }

        return rtrim($baseUrl, '/');
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if (str_starts_with($digits, '0')) {
            return '+254'.substr($digits, 1);
        }

        if (str_starts_with($digits, '7') || str_starts_with($digits, '1')) {
            return '+254'.$digits;
        }

        if (str_starts_with($digits, '254')) {
            return '+'.$digits;
        }

        return $phone;
    }

    private function requiredConfig(string $key): string
    {
        $value = config("services.lipana.{$key}");

        if (! is_string($value) || $value === '') {
            throw new RuntimeException("Missing Lipana configuration: {$key}.");
        }

        return $value;
    }

    private function stringValue(mixed $value): ?string
    {
        if (is_string($value) && $value !== '') {
            return $value;
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        return null;
    }
}

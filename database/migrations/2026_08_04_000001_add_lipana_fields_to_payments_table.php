<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('lipana_transaction_id')->nullable()->after('transaction_reference')->index();
            $table->string('lipana_checkout_request_id')->nullable()->after('lipana_transaction_id')->index();
            $table->string('lipana_event')->nullable()->after('lipana_checkout_request_id');
            $table->json('lipana_webhook_payload')->nullable()->after('lipana_event');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['lipana_transaction_id']);
            $table->dropIndex(['lipana_checkout_request_id']);
            $table->dropColumn([
                'lipana_transaction_id',
                'lipana_checkout_request_id',
                'lipana_event',
                'lipana_webhook_payload',
            ]);
        });
    }
};
